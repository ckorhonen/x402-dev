# x402.dev Payment Rails SDK

A complete TypeScript/React SDK for integrating HTTP 402 Payment Required protocol, built on Cloudflare Workers.

## 🚀 Features

- ✅ **Full x402 Protocol Support** - Handle HTTP 402 Payment Required responses
- 💎 **TypeScript-First** - Complete type safety and IntelliSense
- ⚛️ **React Components** - Pre-built PaymentButton and Dashboard
- 🌍 **Edge-Deployed** - Built on Cloudflare Workers for global low latency
- 🔒 **Secure** - Built-in webhook signature verification
- 🎯 **Simple API** - Intuitive client interface
- 🔄 **Retry Logic** - Automatic retry with exponential backoff
- 📊 **Payment Dashboard** - Complete admin interface included

## 📦 Installation

```bash
npm install x402-dev
# or
yarn add x402-dev
```

## 🎯 Quick Start

### SDK Usage

```typescript
import { X402Client } from 'x402-dev';

const client = new X402Client({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:8787', // For development
});

// Create a payment
const payment = await client.initiatePayment({
  amount: 1000, // Amount in cents
  currency: 'USD',
  description: 'Premium subscription',
});

console.log('Payment URL:', payment.paymentUrl);
```

### React Component

```tsx
import { PaymentButton } from 'x402-dev/components';

function App() {
  return (
    <PaymentButton
      amount={1000}
      currency="USD"
      apiKey="your-api-key"
      onSuccess={(paymentId) => {
        console.log('Payment successful:', paymentId);
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
      }}
    />
  );
}
```

### Payment Dashboard

```tsx
import { PaymentDashboard } from 'x402-dev/components';

function AdminPanel() {
  return (
    <PaymentDashboard
      apiKey="your-api-key"
      baseUrl="http://localhost:8787"
      onPaymentClick={(payment) => {
        console.log('Payment details:', payment);
      }}
    />
  );
}
```

## 🏗️ Project Structure

```
x402-dev/
├── src/
│   ├── lib/                  # SDK Core
│   │   ├── client.ts         # X402Client implementation
│   │   ├── types.ts          # TypeScript definitions
│   │   └── index.ts          # Main exports
│   ├── worker/               # Cloudflare Workers Backend
│   │   └── index.ts          # API endpoints
│   └── components/           # React Components
│       ├── PaymentButton.tsx # Payment button component
│       ├── PaymentDashboard.tsx # Dashboard component
│       └── index.ts          # Component exports
├── examples/                 # Usage examples
│   ├── basic-usage.ts
│   └── react-integration.tsx
├── docs/                     # Documentation
│   ├── API.md
│   └── INTEGRATION_GUIDE.md
└── README.md
```

## 🛠️ Development

### Prerequisites

- Node.js 18+ or later
- npm or yarn
- Cloudflare account (for deployment)

### Setup

```bash
# Clone the repository
git clone https://github.com/ckorhonen/x402-dev.git
cd x402-dev

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start at `http://localhost:8787`

### Building

```bash
npm run build
```

### Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## 📚 API Documentation

### X402Client

#### Methods

- `initiatePayment(request)` - Create a new payment
- `checkPaymentStatus(paymentId)` - Get payment status
- `cancelPayment(paymentId)` - Cancel a pending payment
- `handlePaymentRequired(url)` - Handle HTTP 402 responses
- `verifySignature(payload, signature)` - Verify webhook signatures
- `verifyPayment(paymentId)` - Verify payment completion
- `listPayments(params)` - List all payments with filters

See [API.md](docs/API.md) for complete API reference.

## 🔌 HTTP 402 Payment Required

### Server-Side (Protecting Resources)

```typescript
// Return 402 for protected resources
if (!hasValidPayment(request)) {
  return new Response(JSON.stringify({
    status: 402,
    message: 'Payment Required',
    paymentRequired: true,
    payment: {
      id: 'pay_123',
      amount: 1000,
      currency: 'USD',
      paymentUrl: 'https://payment.x402.dev/pay/pay_123',
      acceptedMethods: ['card', 'crypto', 'lightning']
    }
  }), {
    status: 402,
    headers: {
      'WWW-Authenticate': 'X402-Payment realm="Protected Resource"'
    }
  });
}
```

### Client-Side (Handling 402)

```typescript
const response = await fetch('/api/protected');

if (response.status === 402) {
  const x402 = await client.handlePaymentRequired(response.url);
  // Redirect to payment
  window.location.href = x402.payment.paymentUrl;
}
```

## 🔒 Security

### Webhook Verification

```typescript
app.post('/webhooks/payment', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!client.verifySignature(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook safely
  handlePaymentEvent(req.body);
});
```

### Best Practices

- Never expose API keys in frontend code
- Always verify webhook signatures
- Use HTTPS in production
- Validate payment amounts server-side
- Store sensitive data securely

## 🧪 Testing

### Development Mode

```typescript
const client = new X402Client({
  apiKey: 'test_key',
  baseUrl: 'http://localhost:8787',
  environment: 'development'
});
```

### Test Endpoints

- `GET /` - Health check
- `GET /api/health` - API health status
- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment status
- `POST /api/payments/:id/cancel` - Cancel payment
- `GET /api/payments` - List payments
- `GET /protected` - Test 402 response

## 📖 Examples

### Simple Payment Flow

```typescript
// 1. Create payment
const payment = await client.initiatePayment({
  amount: 1000,
  currency: 'USD',
  description: 'Premium subscription'
});

// 2. Redirect user to payment URL
window.location.href = payment.paymentUrl;

// 3. User completes payment

// 4. Webhook notification received
// 5. Verify payment
const verification = await client.verifyPayment(payment.id);
if (verification.valid) {
  // Grant access
}
```

### Complete Checkout Flow

See [examples/react-integration.tsx](examples/react-integration.tsx) for a complete checkout implementation.

## 🔄 Payment States

- `pending` - Payment created but not yet initiated
- `awaiting_payment` - Waiting for user to complete payment
- `processing` - Payment is being processed
- `completed` - Payment successful
- `failed` - Payment failed
- `cancelled` - Payment cancelled by user
- `expired` - Payment expired

## 🎨 Customization

### Custom Styled Button

```tsx
<PaymentButton
  amount={2500}
  currency="USD"
  apiKey="your-api-key"
  style={{
    backgroundColor: '#10b981',
    padding: '16px 32px',
    fontSize: '18px',
    borderRadius: '12px',
  }}
/>
```

### Dashboard Customization

The dashboard component is fully customizable with refresh intervals and click handlers:

```tsx
<PaymentDashboard
  apiKey="your-api-key"
  refreshInterval={30000} // Refresh every 30 seconds
  onPaymentClick={(payment) => {
    // Handle payment click
    showPaymentDetails(payment);
  }}
/>
```

## 🌐 API Endpoints

### Core Endpoints

- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment details
- `GET /api/payments` - List payments
- `POST /api/payments/:id/cancel` - Cancel payment
- `GET /api/health` - Health check

### Protected Resource Example

- `GET /protected` - Returns 402 if payment not provided

## 📊 Environment Variables

```bash
# Required
X402_API_KEY=your_api_key_here

# Optional
X402_BASE_URL=https://api.x402.dev
X402_WEBHOOK_SECRET=your_webhook_secret
X402_ENVIRONMENT=production
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👤 Author

**Chris Korhonen**

- GitHub: [@ckorhonen](https://github.com/ckorhonen)
- Email: ckorhonen@gmail.com

## 📚 Resources

- [API Documentation](docs/API.md)
- [Integration Guide](docs/INTEGRATION_GUIDE.md)
- [Examples](examples/)
- [HTTP 402 Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402)

## 🚧 MVP Status

This is a working MVP implementation with the following features:

✅ Core SDK with TypeScript types
✅ Cloudflare Workers backend
✅ React components (Button + Dashboard)
✅ HTTP 402 protocol support
✅ Payment lifecycle management
✅ Error handling and retry logic
✅ Webhook signature verification
✅ Comprehensive documentation

### Next Steps

- [ ] Add real payment provider integration
- [ ] Implement persistent storage (KV/D1)
- [ ] Add authentication and authorization
- [ ] Implement rate limiting
- [ ] Add payment method integrations (Stripe, crypto)
- [ ] Create hosted payment pages
- [ ] Add analytics and reporting
- [ ] Implement subscription management
- [ ] Add multi-currency support
- [ ] Create CLI tools

## 💡 Use Cases

- **SaaS Subscriptions** - Monetize your web application
- **API Monetization** - Charge for API usage
- **Content Paywalls** - Protect premium content
- **Micro-transactions** - Enable small payments
- **Pay-per-use** - Charge per resource access

## 🎯 Support

Need help? Have questions?

- 📖 Check the [documentation](docs/)
- 💬 Open an [issue](https://github.com/ckorhonen/x402-dev/issues)
- 📧 Email: ckorhonen@gmail.com

---

**Built with ❤️ using TypeScript, React, and Cloudflare Workers**
