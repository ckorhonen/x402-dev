/**
 * Cloudflare Worker entry point for x402.dev Payment Rails SDK
 */

import type { PaymentRequest, PaymentResponse, PaymentStatus } from '../lib/types';

export interface Env {
  PAYMENTS_KV?: KVNamespace;
  ENVIRONMENT: string;
  API_KEY_HASH?: string;
}

// In-memory store for MVP (use KV in production)
const paymentsStore = new Map<string, PaymentResponse>();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API Routes
      if (url.pathname.startsWith('/api')) {
        return await handleAPI(request, env, ctx, corsHeaders);
      }

      // Protected resource example (returns 402)
      if (url.pathname === '/protected') {
        return handleProtectedResource(request, corsHeaders);
      }

      // Default response
      return new Response(
        JSON.stringify({
          message: 'x402.dev Payment Rails SDK',
          version: '0.1.0',
          environment: env.ENVIRONMENT || 'development',
          endpoints: {
            health: '/api/health',
            payments: '/api/payments',
            protected: '/protected',
          },
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (error) {
      return handleError(error, corsHeaders);
    }
  },
};

async function handleAPI(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Health check
  if (path === '/api/health') {
    return jsonResponse(
      { status: 'healthy', timestamp: new Date().toISOString() },
      200,
      corsHeaders
    );
  }

  // Create payment
  if (path === '/api/payments' && request.method === 'POST') {
    return await createPayment(request, env, corsHeaders);
  }

  // Get payment by ID
  if (path.match(/\/api\/payments\/[a-zA-Z0-9-]+$/) && request.method === 'GET') {
    const paymentId = path.split('/').pop()!;
    return await getPayment(paymentId, env, corsHeaders);
  }

  // Cancel payment
  if (path.match(/\/api\/payments\/[a-zA-Z0-9-]+\/cancel$/) && request.method === 'POST') {
    const paymentId = path.split('/')[3];
    return await cancelPayment(paymentId, env, corsHeaders);
  }

  // List payments
  if (path === '/api/payments' && request.method === 'GET') {
    return await listPayments(url, env, corsHeaders);
  }

  // Webhook endpoint (for testing)
  if (path === '/api/webhooks/payment' && request.method === 'POST') {
    return await handleWebhook(request, env, corsHeaders);
  }

  return jsonResponse(
    { error: 'Not Found', message: 'Endpoint not found' },
    404,
    corsHeaders
  );
}

// Create a new payment
async function createPayment(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body = await request.json() as PaymentRequest;

    // Validate request
    if (!body.amount || body.amount <= 0) {
      return jsonResponse(
        { error: 'Invalid Request', message: 'Amount must be greater than 0' },
        400,
        corsHeaders
      );
    }

    if (!body.currency) {
      return jsonResponse(
        { error: 'Invalid Request', message: 'Currency is required' },
        400,
        corsHeaders
      );
    }

    // Create payment
    const paymentId = generateId();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    const payment: PaymentResponse = {
      id: paymentId,
      status: 'awaiting_payment',
      amount: body.amount,
      currency: body.currency,
      description: body.description,
      paymentUrl: `https://payment.x402.dev/pay/${paymentId}`,
      metadata: body.metadata,
      createdAt: now,
      updatedAt: now,
      expiresAt,
    };

    // Store payment (in-memory for MVP)
    paymentsStore.set(paymentId, payment);

    // In production, store in KV
    if (env.PAYMENTS_KV) {
      await env.PAYMENTS_KV.put(paymentId, JSON.stringify(payment), {
        expirationTtl: 3600,
      });
    }

    return jsonResponse(payment, 201, corsHeaders);
  } catch (error) {
    return handleError(error, corsHeaders);
  }
}

// Get payment by ID
async function getPayment(
  paymentId: string,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    // Try to get from store
    let payment = paymentsStore.get(paymentId);

    // Try KV if not in memory
    if (!payment && env.PAYMENTS_KV) {
      const stored = await env.PAYMENTS_KV.get(paymentId);
      if (stored) {
        payment = JSON.parse(stored);
      }
    }

    if (!payment) {
      return jsonResponse(
        { error: 'Not Found', message: 'Payment not found' },
        404,
        corsHeaders
      );
    }

    return jsonResponse(payment, 200, corsHeaders);
  } catch (error) {
    return handleError(error, corsHeaders);
  }
}

// Cancel payment
async function cancelPayment(
  paymentId: string,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const payment = paymentsStore.get(paymentId);

    if (!payment) {
      return jsonResponse(
        { error: 'Not Found', message: 'Payment not found' },
        404,
        corsHeaders
      );
    }

    if (payment.status === 'completed') {
      return jsonResponse(
        { error: 'Invalid Operation', message: 'Cannot cancel completed payment' },
        400,
        corsHeaders
      );
    }

    payment.status = 'cancelled';
    payment.updatedAt = new Date().toISOString();
    paymentsStore.set(paymentId, payment);

    if (env.PAYMENTS_KV) {
      await env.PAYMENTS_KV.put(paymentId, JSON.stringify(payment));
    }

    return jsonResponse(payment, 200, corsHeaders);
  } catch (error) {
    return handleError(error, corsHeaders);
  }
}

// List payments
async function listPayments(
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');

    let payments = Array.from(paymentsStore.values());

    // Filter by status
    if (status) {
      payments = payments.filter(p => p.status === status);
    }

    // Sort by created date (newest first)
    payments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const paginatedPayments = payments.slice(offset, offset + limit);

    return jsonResponse(paginatedPayments, 200, corsHeaders);
  } catch (error) {
    return handleError(error, corsHeaders);
  }
}

// Handle webhook (for testing)
async function handleWebhook(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body = await request.json();
    console.log('Webhook received:', body);

    return jsonResponse(
      { received: true, timestamp: new Date().toISOString() },
      200,
      corsHeaders
    );
  } catch (error) {
    return handleError(error, corsHeaders);
  }
}

// Handle protected resource with 402 response
function handleProtectedResource(
  request: Request,
  corsHeaders: Record<string, string>
): Response {
  // Check for payment token
  const authHeader = request.headers.get('X-Payment-Token');
  
  if (authHeader) {
    // Validate payment token (simplified for MVP)
    return new Response(
      JSON.stringify({ 
        message: 'Access granted', 
        content: 'This is protected content' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  // Return 402 Payment Required
  const paymentId = generateId();
  return new Response(
    JSON.stringify({
      status: 402,
      message: 'Payment Required',
      paymentRequired: true,
      payment: {
        id: paymentId,
        amount: 100,
        currency: 'USD',
        paymentUrl: `https://payment.x402.dev/pay/${paymentId}`,
        acceptedMethods: ['card', 'crypto', 'lightning'],
      },
    }),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'X402-Payment realm="Protected Resource"',
        ...corsHeaders,
      },
    }
  );
}

// Utility functions
function jsonResponse(
  data: any,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

function handleError(error: any, corsHeaders: Record<string, string>): Response {
  console.error('Error:', error);
  return jsonResponse(
    {
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    },
    500,
    corsHeaders
  );
}

function generateId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
