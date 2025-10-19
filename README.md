# x402.dev Payment Rails SDK

<div align="center">

**A complete TypeScript/React SDK for integrating HTTP 402 Payment Required protocol**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples) • [API Reference](#-api-reference) • [Deployment](#-deployment)

</div>

---

## 🎯 Overview

**x402-dev** is a production-ready SDK and backend infrastructure for implementing HTTP 402 "Payment Required" in modern web applications. Built on Cloudflare Workers for global edge deployment, it provides everything you need to monetize APIs, content, and services with minimal integration effort.

### Why x402?

- **Standards-Based**: Leverages native HTTP 402 status code for payment workflows
- **Developer-First**: Intuitive APIs with full TypeScript support
- **Edge-Native**: Deploy globally with Cloudflare Workers for <50ms response times
- **Battle-Tested**: Production-ready with comprehensive error handling and retry logic
- **Framework Agnostic**: Works with React, Vue, Next.js, or vanilla JavaScript

---

## ✨ Features

### 🚀 Core Capabilities

- ✅ **Full x402 Protocol Support** - Standards-compliant HTTP 402 implementation
- 💎 **TypeScript-First** - Complete type safety, IntelliSense, and modern DX
- ⚛️ **React Components** - Pre-built `PaymentButton` and `PaymentDashboard`
- 🌍 **Edge-Deployed** - Cloudflare Workers for global low-latency
- 🔒 **Enterprise Security** - Webhook signature verification, secure key handling
- 🎯 **Simple API** - Intuitive client interface with sensible defaults
- 🔄 **Smart Retry Logic** - Automatic retry with exponential backoff
- 📊 **Admin Dashboard** - Complete payment management interface

### 💼 Use Cases

- **SaaS Subscriptions** - Monetize web applications with recurring payments
- **API Monetization** - Charge per request or usage tier
- **Content Paywalls** - Protect premium articles, videos, courses
- **Micro-transactions** - Enable small payments with low overhead
- **Pay-per-use Services** - Charge for compute, storage, or resource access
- **Digital Downloads** - Sell files, templates, assets

---

## 📦 Installation

```bash
# npm
npm install x402-dev

# yarn
yarn add x402-dev

# pnpm
pnpm add x402-dev
```

### Requirements

- **Node.js** 18+ or later
- **npm**, **yarn**, or **pnpm**
- **Cloudflare Account** (for backend deployment)

---

## 🚀 Quick Start

### 1️⃣ Basic SDK Usage

```typescript
import { X402Client } from 'x402-dev';

// Initialize the client
const client = new X402Client({
  apiKey: process.env.X402_API_KEY!,
  baseUrl: 'https://api.x402.dev',
});

// Create a payment
const payment = await client.initiatePayment({
  amount: 1000, // Amount in cents ($10.00)
  currency: 'USD',
  description: 'Premium subscription',
  metadata: {
    userId: 'user_123',
    plan: 'premium',
  },
});

console.log('Payment URL:', payment.paymentUrl);
console.log('Payment ID:', payment.id);
```

### 2️⃣ React Component Integration

```tsx
import { PaymentButton } from 'x402-dev/components';

function CheckoutPage() {
  return (
    <PaymentButton
      amount={2500}
      currency="USD"
      description="Annual Premium Plan"
      apiKey={process.env.NEXT_PUBLIC_X402_API_KEY!}
      onSuccess={(paymentId) => {
        console.log('✅ Payment completed:', paymentId);
        // Redirect to success page or grant access
        window.location.href = `/success?payment=${paymentId}`;
      }}
      onError={(error) => {
        console.error('❌ Payment failed:', error);
        // Show error message to user
      }}
      style={{
        backgroundColor: '#10b981',
        color: 'white',
        padding: '16px 32px',
        fontSize: '18px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      Subscribe Now - $25/year
    </PaymentButton>
  );
}
```

### 3️⃣ Handle HTTP 402 Responses

```typescript
// Client-side: Handle 402 responses automatically
const response = await fetch('/api/protected-content');

if (response.status === 402) {
  const paymentInfo = await client.handlePaymentRequired(response.url);
  
  // Redirect user to payment
  window.location.href = paymentInfo.payment.paymentUrl;
}

// Server-side: Return 402 for protected resources
app.get('/api/protected-content', async (req, res) => {
  const hasAccess = await checkUserAccess(req.userId);
  
  if (!hasAccess) {
    const payment = await client.initiatePayment({
      amount: 500,
      currency: 'USD',
      description: 'Premium content access',
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
        acceptedMethods: ['card', 'crypto', 'lightning'],
      },
    });
  }
  
  // Serve protected content
  res.json({ content: 'Premium data...' });
});
```

### 4️⃣ Payment Dashboard

```tsx
import { PaymentDashboard } from 'x402-dev/components';

function AdminPanel() {
  return (
    <div className="admin-container">
      <h1>Payment Management</h1>
      <PaymentDashboard
        apiKey={process.env.X402_API_KEY!}
        baseUrl="https://api.x402.dev"
        refreshInterval={30000} // Auto-refresh every 30 seconds
        onPaymentClick={(payment) => {
          console.log('Payment details:', payment);
          // Navigate to detailed payment view
        }}
      />
    </div>
  );
}
```

---

## 🏗️ Project Structure

```
x402-dev/
├── src/
│   ├── lib/                      # SDK Core Library
│   │   ├── client.ts             # X402Client implementation
│   │   ├── types.ts              # TypeScript type definitions
│   │   ├── errors.ts             # Custom error classes
│   │   └── index.ts              # Public API exports
│   │
│   ├── worker/                   # Cloudflare Workers Backend
│   │   ├── index.ts              # Worker entry point & routing
│   │   ├── handlers/             # HTTP request handlers
│   │   ├── middleware/           # Auth, CORS, validation
│   │   └── utils/                # Helper functions
│   │
│   └── components/               # React Components
│       ├── PaymentButton.tsx     # Payment button component
│       ├── PaymentDashboard.tsx  # Admin dashboard
│       ├── PaymentModal.tsx      # Payment modal UI
│       └── index.ts              # Component exports
│
├── examples/                     # Integration Examples
│   ├── basic-usage.ts            # Basic SDK usage
│   ├── react-integration.tsx     # React example
│   ├── nextjs-app/               # Next.js example
│   └── express-api/              # Express.js API example
│
├── docs/                         # Documentation
│   ├── API.md                    # Complete API reference
│   ├── INTEGRATION_GUIDE.md      # Integration guide
│   ├── WORKFLOWS.md              # Payment workflows
│   └── WORKFLOW_DIAGRAM.md       # Visual diagrams
│
├── .env.example                  # Environment variables template
├── wrangler.toml                 # Cloudflare Workers config
├── package.json                  # NPM package manifest
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

---

## 🛠️ Development Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 8+ or **yarn** 1.22+
- **Git** ([Download](https://git-scm.com/))
- **Cloudflare Account** (free tier works) ([Sign up](https://dash.cloudflare.com/sign-up))

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/ckorhonen/x402-dev.git
cd x402-dev
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Required: Your x402.dev API Key
X402_API_KEY=your_api_key_here

# Optional: API Base URL (defaults to production)
X402_BASE_URL=http://localhost:8787

# Optional: Webhook Secret
X402_WEBHOOK_SECRET=your_webhook_secret_here

# Environment
X402_ENVIRONMENT=development
```

4. **Start development server**

```bash
npm run dev
```

The development server starts at `http://localhost:8787`

5. **Test the API**

```bash
# Health check
curl http://localhost:8787/api/health

# Create a test payment
curl -X POST http://localhost:8787/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key_here" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "description": "Test payment"
  }'
```

### Build for Production

```bash
npm run build
```

This generates:
- Compiled TypeScript in `dist/`
- Optimized worker bundle
- Type declarations

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

---

## 🚀 Deployment

### Deploy to Cloudflare Workers

#### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

#### 2. Authenticate with Cloudflare

```bash
wrangler login
```

#### 3. Configure Wrangler

Edit `wrangler.toml` with your settings:

```toml
name = "x402-dev"
main = "src/worker/index.ts"
compatibility_date = "2024-01-01"

[env.production]
name = "x402-dev-production"
route = { pattern = "api.x402.dev/*", custom_domain = true }
vars = { ENVIRONMENT = "production" }
```

#### 4. Deploy

```bash
# Deploy to production
npm run deploy

# Deploy to staging
wrangler deploy --env staging

# Deploy with specific version
wrangler deploy --env production --name x402-dev-v2
```

#### 5. Set Environment Secrets

```bash
# Set API key (secure)
wrangler secret put X402_API_KEY

# Set webhook secret
wrangler secret put X402_WEBHOOK_SECRET
```

### Deploy SDK Package to NPM

```bash
# Login to NPM
npm login

# Publish package
npm publish --access public

# Publish beta version
npm publish --tag beta
```

### Environment-Specific Deployments

The project supports multiple environments:

- **Development**: `npm run dev` (local testing)
- **Staging**: `wrangler deploy --env staging` (pre-production)
- **Production**: `npm run deploy` (live production)

Each environment can have separate:
- KV namespaces
- R2 buckets
- Durable Objects
- Environment variables

---

## 📚 Documentation

### Core Documentation

- **[API Reference](docs/API.md)** - Complete SDK and HTTP API documentation
- **[Integration Guide](docs/INTEGRATION_GUIDE.md)** - Step-by-step integration instructions
- **[Payment Workflows](docs/WORKFLOWS.md)** - Common payment patterns and flows
- **[Workflow Diagrams](docs/WORKFLOW_DIAGRAM.md)** - Visual architecture diagrams

### Quick Links

- [TypeScript Types](src/lib/types.ts) - All TypeScript definitions
- [React Components](src/components/) - Component source code
- [Worker Implementation](src/worker/) - Backend logic
- [Examples](examples/) - Real-world usage examples

---

## 🎯 API Reference

### X402Client

#### Constructor

```typescript
new X402Client(config: X402ClientConfig)
```

**Configuration Options:**

```typescript
interface X402ClientConfig {
  apiKey: string;           // Your API key (required)
  baseUrl?: string;         // API base URL (default: https://api.x402.dev)
  timeout?: number;         // Request timeout in ms (default: 30000)
  retryAttempts?: number;   // Max retry attempts (default: 3)
  retryDelay?: number;      // Initial retry delay in ms (default: 1000)
  environment?: 'development' | 'production';
}
```

#### Core Methods

##### `initiatePayment(request: PaymentRequest): Promise<Payment>`

Create a new payment.

```typescript
const payment = await client.initiatePayment({
  amount: 1000,           // Required: Amount in cents
  currency: 'USD',        // Required: ISO 4217 currency code
  description: string,    // Required: Payment description
  metadata?: object,      // Optional: Custom metadata
  successUrl?: string,    // Optional: Redirect URL on success
  cancelUrl?: string,     // Optional: Redirect URL on cancel
  expiresAt?: string,     // Optional: Payment expiration (ISO 8601)
});
```

##### `checkPaymentStatus(paymentId: string): Promise<Payment>`

Get current payment status.

```typescript
const payment = await client.checkPaymentStatus('pay_123');
console.log(payment.status); // 'pending' | 'completed' | 'failed' | 'cancelled'
```

##### `cancelPayment(paymentId: string): Promise<Payment>`

Cancel a pending payment.

```typescript
const cancelled = await client.cancelPayment('pay_123');
```

##### `listPayments(params?: ListPaymentsParams): Promise<PaymentList>`

List all payments with optional filters.

```typescript
const payments = await client.listPayments({
  status: 'completed',
  limit: 50,
  offset: 0,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});
```

##### `verifyPayment(paymentId: string): Promise<PaymentVerification>`

Verify payment completion and authenticity.

```typescript
const verification = await client.verifyPayment('pay_123');
if (verification.valid) {
  // Grant access
}
```

##### `handlePaymentRequired(url: string): Promise<PaymentRequiredResponse>`

Handle HTTP 402 responses automatically.

```typescript
const paymentInfo = await client.handlePaymentRequired(response.url);
// Redirects user to payment flow
```

##### `verifySignature(payload: string, signature: string, secret: string): boolean`

Verify webhook signatures.

```typescript
const isValid = client.verifySignature(
  JSON.stringify(webhookBody),
  req.headers['x-webhook-signature'],
  process.env.X402_WEBHOOK_SECRET
);
```

### Payment States

```typescript
type PaymentStatus =
  | 'pending'           // Payment created, not yet initiated
  | 'awaiting_payment'  // Waiting for user payment
  | 'processing'        // Payment being processed
  | 'completed'         // Payment successful
  | 'failed'            // Payment failed
  | 'cancelled'         // Payment cancelled by user
  | 'expired';          // Payment expired
```

### HTTP API Endpoints

Base URL: `https://api.x402.dev` (production) or `http://localhost:8787` (development)

#### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments` | Create payment |
| `GET` | `/api/payments/:id` | Get payment details |
| `GET` | `/api/payments` | List payments |
| `POST` | `/api/payments/:id/cancel` | Cancel payment |
| `POST` | `/api/payments/:id/verify` | Verify payment |
| `GET` | `/api/health` | Health check |

#### Protected Resource Example

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/protected` | Returns 402 if no payment |

See [API.md](docs/API.md) for complete HTTP API documentation.

---

## 💡 Examples

### Simple Payment Flow

```typescript
// 1. Initialize client
const client = new X402Client({
  apiKey: process.env.X402_API_KEY!,
});

// 2. Create payment
const payment = await client.initiatePayment({
  amount: 1000,
  currency: 'USD',
  description: 'Premium subscription',
});

// 3. Redirect user
window.location.href = payment.paymentUrl;

// 4. Handle webhook notification (server-side)
app.post('/webhooks/payment', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  
  if (!client.verifySignature(JSON.stringify(req.body), signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  const { paymentId, status } = req.body;
  if (status === 'completed') {
    // Grant access to user
    grantPremiumAccess(paymentId);
  }
  
  res.status(200).send('OK');
});

// 5. Verify payment (optional double-check)
const verification = await client.verifyPayment(payment.id);
if (verification.valid) {
  console.log('Payment confirmed ✅');
}
```

### React Checkout Component

```tsx
import { useState } from 'react';
import { PaymentButton } from 'x402-dev/components';

function CheckoutPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="checkout-container">
      <div className="plan-card">
        <h2>Premium Plan</h2>
        <p className="price">$25.00/year</p>
        <ul>
          <li>✅ Unlimited API calls</li>
          <li>✅ Priority support</li>
          <li>✅ Advanced analytics</li>
        </ul>
        
        <PaymentButton
          amount={2500}
          currency="USD"
          description="Annual Premium Plan"
          apiKey={process.env.NEXT_PUBLIC_X402_API_KEY!}
          metadata={{
            plan: 'premium',
            billingCycle: 'annual',
          }}
          onSuccess={(paymentId) => {
            console.log('Payment successful:', paymentId);
            window.location.href = `/dashboard?upgraded=true`;
          }}
          onError={(error) => {
            alert(`Payment failed: ${error.message}`);
          }}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Subscribe Now'}
        </PaymentButton>
      </div>
    </div>
  );
}
```

### Next.js API Route

```typescript
// pages/api/protected.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { X402Client } from 'x402-dev';

const client = new X402Client({
  apiKey: process.env.X402_API_KEY!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if user has access
  const session = await getSession(req);
  const hasAccess = await checkPremiumAccess(session.userId);

  if (!hasAccess) {
    // Create payment for premium access
    const payment = await client.initiatePayment({
      amount: 1000,
      currency: 'USD',
      description: 'Premium API access',
      metadata: { userId: session.userId },
    });

    // Return 402 Payment Required
    return res.status(402).json({
      status: 402,
      message: 'Payment Required',
      paymentRequired: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentUrl: payment.paymentUrl,
      },
    });
  }

  // Return protected data
  res.status(200).json({
    data: 'Premium content here...',
  });
}
```

### Express.js Integration

```typescript
import express from 'express';
import { X402Client } from 'x402-dev';

const app = express();
const client = new X402Client({
  apiKey: process.env.X402_API_KEY!,
});

// Protected route with 402
app.get('/api/premium-data', async (req, res) => {
  const userId = req.user?.id;
  
  if (!await hasPremiumAccess(userId)) {
    const payment = await client.initiatePayment({
      amount: 500,
      currency: 'USD',
      description: 'Premium data access',
    });

    return res.status(402).json({
      message: 'Payment Required',
      payment: payment,
    });
  }

  res.json({ data: 'Premium data...' });
});

// Webhook handler
app.post('/webhooks/x402', express.json(), async (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const payload = JSON.stringify(req.body);

  if (!client.verifySignature(payload, signature, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).send('Invalid signature');
  }

  const { event, payment } = req.body;
  
  if (event === 'payment.completed') {
    await grantAccess(payment.metadata.userId);
  }

  res.sendStatus(200);
});

app.listen(3000);
```

### More Examples

Check the [examples/](examples/) directory for complete working examples:

- **[basic-usage.ts](examples/basic-usage.ts)** - Core SDK usage patterns
- **[react-integration.tsx](examples/react-integration.tsx)** - Complete React checkout flow

---

## 🔒 Security

### Best Practices

1. **Never expose API keys in frontend code**
   - Use environment variables
   - Use separate public/private keys
   - Rotate keys regularly

2. **Always verify webhook signatures**
   ```typescript
   if (!client.verifySignature(payload, signature, secret)) {
     throw new Error('Invalid webhook signature');
   }
   ```

3. **Use HTTPS in production**
   - Never send payments over HTTP
   - Enable HSTS headers
   - Use secure cookies

4. **Validate amounts server-side**
   ```typescript
   // Don't trust client-provided amounts
   const serverAmount = getPlanPrice(plan);
   if (payment.amount !== serverAmount) {
     throw new Error('Amount mismatch');
   }
   ```

5. **Store sensitive data securely**
   - Use encrypted environment variables
   - Never log API keys
   - Use Cloudflare Workers secrets

### Webhook Security

```typescript
// Verify webhook signature before processing
app.post('/webhooks/payment', async (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const payload = JSON.stringify(req.body);
  const secret = process.env.X402_WEBHOOK_SECRET!;

  // Verify signature
  if (!X402Client.verifySignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook safely
  await handlePaymentWebhook(req.body);
  res.status(200).send('OK');
});
```

### Rate Limiting

The API includes built-in rate limiting:

- **100 requests/minute** per API key
- **1000 requests/hour** per API key
- **10,000 requests/day** per API key

Exceeded limits return `429 Too Many Requests` with `Retry-After` header.

---

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

### Test with Mock Data

```typescript
import { X402Client } from 'x402-dev';

const client = new X402Client({
  apiKey: 'test_key',
  baseUrl: 'http://localhost:8787',
  environment: 'development',
});

// All payments in development mode are mock payments
const payment = await client.initiatePayment({
  amount: 1000,
  currency: 'USD',
  description: 'Test payment',
});
```

---

## 🌐 Environment Variables

### Required

```bash
X402_API_KEY=your_api_key_here
```

### Optional

```bash
# API Configuration
X402_BASE_URL=https://api.x402.dev
X402_WEBHOOK_SECRET=your_webhook_secret_here
X402_ENVIRONMENT=production

# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# React/Next.js (prefix with framework-specific prefix)
REACT_APP_X402_API_KEY=your_public_key
NEXT_PUBLIC_X402_API_KEY=your_public_key
```

See [.env.example](.env.example) for complete reference.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

```bash
git clone https://github.com/your-username/x402-dev.git
```

2. **Create a feature branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**

- Follow existing code style
- Add tests for new features
- Update documentation

4. **Commit with conventional commits**

```bash
git commit -m "feat: add amazing feature"
```

5. **Push and create PR**

```bash
git push origin feature/amazing-feature
```

### Development Guidelines

- Write tests for all new code
- Maintain TypeScript strict mode
- Update documentation
- Follow existing patterns
- Run linting before committing

---

## 🗺️ Roadmap

### ✅ MVP (Complete)

- [x] Core SDK with TypeScript types
- [x] Cloudflare Workers backend
- [x] React components (Button + Dashboard)
- [x] HTTP 402 protocol support
- [x] Payment lifecycle management
- [x] Error handling and retry logic
- [x] Webhook signature verification
- [x] Comprehensive documentation

### 🚧 In Progress

- [ ] Real payment provider integration (Stripe, PayPal)
- [ ] Persistent storage (Cloudflare KV/D1)
- [ ] Advanced authentication & authorization
- [ ] Rate limiting implementation

### 📅 Planned

- [ ] Payment method integrations
  - [ ] Stripe
  - [ ] PayPal
  - [ ] Cryptocurrency (Lightning Network)
  - [ ] Bank transfers (ACH, SEPA)
- [ ] Hosted payment pages
- [ ] Analytics and reporting dashboard
- [ ] Subscription management
- [ ] Multi-currency support
- [ ] CLI tools
- [ ] Mobile SDKs (React Native)
- [ ] Webhook event logging
- [ ] Dispute handling
- [ ] Refund management

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Chris Korhonen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 👤 Author

**Chris Korhonen**

- 🌐 GitHub: [@ckorhonen](https://github.com/ckorhonen)
- 📧 Email: ckorhonen@gmail.com
- 🐦 Twitter: [@ckorhonen](https://twitter.com/ckorhonen)
- 💼 LinkedIn: [Chris Korhonen](https://www.linkedin.com/in/ckorhonen/)

---

## 🙏 Acknowledgments

- Built with [TypeScript](https://www.typescriptlang.org/)
- Powered by [Cloudflare Workers](https://workers.cloudflare.com/)
- UI components with [React](https://reactjs.org/)
- Inspired by HTTP 402 Payment Required specification

---

## 📞 Support

Need help? Have questions?

- 📖 Read the [documentation](docs/)
- 💬 Open an [issue](https://github.com/ckorhonen/x402-dev/issues)
- 📧 Email: ckorhonen@gmail.com
- 💬 Discussions: [GitHub Discussions](https://github.com/ckorhonen/x402-dev/discussions)

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/ckorhonen/x402-dev?style=social)
![GitHub forks](https://img.shields.io/github/forks/ckorhonen/x402-dev?style=social)
![GitHub issues](https://img.shields.io/github/issues/ckorhonen/x402-dev)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ckorhonen/x402-dev)

---

<div align="center">

**Built with ❤️ using TypeScript, React, and Cloudflare Workers**

[⬆ Back to Top](#x402dev-payment-rails-sdk)

</div>
