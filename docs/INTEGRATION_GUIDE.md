# Integration Guide

## Quick Start

### 1. Installation

```bash
npm install x402-dev
# or
yarn add x402-dev
```

### 2. Get API Key

1. Sign up at [x402.dev](https://x402.dev)
2. Create a new project
3. Copy your API key from the dashboard

### 3. Basic Integration

```typescript
import { X402Client } from 'x402-dev';

const client = new X402Client({
  apiKey: process.env.X402_API_KEY,
  environment: 'production'
});

const payment = await client.initiatePayment({
  amount: 1000,
  currency: 'USD',
  description: 'Premium subscription'
});

console.log('Payment URL:', payment.paymentUrl);
```

## Frontend Integration

### React

```tsx
import { PaymentButton } from 'x402-dev/components';

function App() {
  return (
    <PaymentButton
      amount={1000}
      currency="USD"
      apiKey={process.env.REACT_APP_X402_API_KEY}
      onSuccess={(paymentId) => {
        console.log('Payment completed:', paymentId);
      }}
    />
  );
}
```

### Vue.js

```vue
<template>
  <button @click="handlePayment" :disabled="loading">
    {{ loading ? 'Processing...' : 'Pay Now' }}
  </button>
</template>

<script>
import { X402Client } from 'x402-dev';

export default {
  data() {
    return {
      loading: false,
      client: new X402Client({ apiKey: process.env.VUE_APP_X402_API_KEY })
    };
  },
  methods: {
    async handlePayment() {
      this.loading = true;
      try {
        const payment = await this.client.initiatePayment({
          amount: 1000,
          currency: 'USD'
        });
        window.location.href = payment.paymentUrl;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## Backend Integration

### Express.js

```typescript
import express from 'express';
import { X402Client } from 'x402-dev';

const app = express();
const client = new X402Client({ apiKey: process.env.X402_API_KEY });

app.post('/api/create-payment', async (req, res) => {
  try {
    const payment = await client.initiatePayment({
      amount: req.body.amount,
      currency: req.body.currency,
      metadata: {
        userId: req.user.id
      }
    });
    
    res.json({ paymentUrl: payment.paymentUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhooks/payment', async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!client.verifySignature(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Handle webhook event
  const { event, paymentId } = req.body;
  
  if (event === 'payment.completed') {
    // Update user's subscription
    await updateUserSubscription(paymentId);
  }
  
  res.json({ received: true });
});
```

### Next.js

```typescript
// pages/api/payments/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { X402Client } from 'x402-dev';

const client = new X402Client({ apiKey: process.env.X402_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const payment = await client.initiatePayment(req.body);
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Cloudflare Workers

```typescript
import { X402Client } from 'x402-dev';

export default {
  async fetch(request: Request, env: Env) {
    const client = new X402Client({ apiKey: env.X402_API_KEY });
    
    if (request.method === 'POST') {
      const body = await request.json();
      const payment = await client.initiatePayment(body);
      
      return new Response(JSON.stringify(payment), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Method not allowed', { status: 405 });
  }
};
```

## HTTP 402 Implementation

### Server-Side (Protecting Resources)

```typescript
// middleware/requirePayment.ts
import { Request, Response, NextFunction } from 'express';
import { X402Client } from 'x402-dev';

const client = new X402Client({ apiKey: process.env.X402_API_KEY });

export async function requirePayment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const paymentToken = req.headers['x-payment-token'];
  
  if (paymentToken) {
    // Verify payment token
    const verification = await client.verifyPayment(paymentToken);
    if (verification.valid) {
      return next();
    }
  }
  
  // Return 402 Payment Required
  const payment = await client.initiatePayment({
    amount: 1000,
    currency: 'USD',
    description: 'Access to premium content'
  });
  
  return res.status(402).json({
    status: 402,
    message: 'Payment Required',
    paymentRequired: true,
    payment: {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentUrl: payment.paymentUrl,
      acceptedMethods: ['card', 'crypto', 'lightning']
    }
  });
}

// Usage
app.get('/premium-content', requirePayment, (req, res) => {
  res.json({ content: 'Premium content here' });
});
```

### Client-Side (Handling 402)

```typescript
import { X402Client } from 'x402-dev';

const client = new X402Client({ apiKey: 'your-api-key' });

async function fetchPremiumContent() {
  try {
    const response = await fetch('/api/premium-content');
    
    if (response.status === 402) {
      const x402 = await response.json();
      
      // Redirect to payment
      window.location.href = x402.payment.paymentUrl;
      return;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Testing

### Development Mode

```typescript
const client = new X402Client({
  apiKey: 'test_key',
  baseUrl: 'http://localhost:8787',
  environment: 'development'
});
```

### Mock Payments

```typescript
// For testing, use test API keys
const testClient = new X402Client({
  apiKey: 'test_sk_1234567890',
  environment: 'development'
});

// Test payments complete instantly
const payment = await testClient.initiatePayment({
  amount: 1000,
  currency: 'USD'
});

// Check status
const status = await testClient.checkPaymentStatus(payment.id);
console.log(status.status); // 'completed' in test mode
```

## Security Best Practices

### 1. Never Expose API Keys

```typescript
// ❌ Bad - API key in frontend code
const client = new X402Client({ apiKey: 'sk_live_123...' });

// ✅ Good - Use environment variables
const client = new X402Client({ apiKey: process.env.X402_API_KEY });
```

### 2. Verify Webhook Signatures

```typescript
app.post('/webhooks/payment', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!client.verifySignature(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook
});
```

### 3. Use HTTPS

Always use HTTPS in production to protect payment data.

### 4. Validate Amounts Server-Side

```typescript
// Always validate payment amounts on the server
app.post('/api/create-payment', async (req, res) => {
  // Don't trust client-sent amounts
  const actualAmount = calculatePriceFromDatabase(req.body.productId);
  
  const payment = await client.initiatePayment({
    amount: actualAmount,
    currency: 'USD'
  });
  
  res.json(payment);
});
```

## Troubleshooting

### Common Issues

**1. "API Error (401): Unauthorized"**
- Check that your API key is correct
- Ensure you're using the right environment (test vs production)

**2. "Payment timeout"**
- Increase the timeout value in client options
- Check network connectivity

**3. "Webhook signature invalid"**
- Ensure you're using the correct webhook secret
- Verify the payload is not modified before verification

**4. "CORS error in browser"**
- Configure CORS headers on your API endpoints
- Use a backend proxy for API calls

## Support

- Documentation: https://docs.x402.dev
- GitHub: https://github.com/ckorhonen/x402-dev
- Email: support@x402.dev
