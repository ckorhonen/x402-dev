/**
 * Cloudflare Worker entry point for x402.dev Payment Rails SDK
 */

export interface Env {
  // Add your bindings here
  // KV: KVNamespace;
  // DB: D1Database;
  ENVIRONMENT: string;
}

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

    // API Routes
    if (url.pathname.startsWith('/api')) {
      return handleAPI(request, env, ctx, corsHeaders);
    }

    // Default response
    return new Response(
      JSON.stringify({
        message: 'x402.dev Payment Rails SDK',
        version: '0.1.0',
        environment: env.ENVIRONMENT,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  },
};

async function handleAPI(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);

  // Example API endpoint
  if (url.pathname === '/api/health') {
    return new Response(
      JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
}
