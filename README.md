# x402.dev Payment Rails SDK

A TypeScript/React SDK for integrating with the x402.dev Payment Rails platform, built on Cloudflare Workers.

## Features

- 🚀 Built on Cloudflare Workers for global edge deployment
- ⚡ TypeScript-first with full type safety
- ⚛️ React components for easy integration
- 🔒 Secure payment processing
- 🌍 Global availability and low latency

## Project Structure

```
x402-dev/
├── src/
│   ├── worker/          # Cloudflare Worker code
│   │   └── index.ts
│   ├── lib/             # SDK library
│   │   ├── index.ts
│   │   ├── client.ts
│   │   └── types.ts
│   └── components/      # React components
│       └── PaymentButton.tsx
├── package.json
├── tsconfig.json
├── wrangler.toml        # Cloudflare Workers config
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ or later
- npm or yarn
- Cloudflare account (for deployment)

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

This will start the Cloudflare Workers local development server.

### Building

```bash
npm run build
```

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Usage

### SDK Usage

```typescript
import { X402Client } from 'x402-dev';

const client = new X402Client({
  apiKey: 'your-api-key',
});

// Initiate a payment
const payment = await client.initiatePayment({
  amount: 1000,
  currency: 'USD',
  description: 'Payment for services',
});
```

### React Component Usage

```tsx
import { PaymentButton } from 'x402-dev/components';

function App() {
  return (
    <PaymentButton
      amount={10.00}
      currency="USD"
      onSuccess={(paymentId) => console.log('Payment successful:', paymentId)}
      onError={(error) => console.error('Payment failed:', error)}
    />
  );
}
```

## API Documentation

### Endpoints

- `GET /` - Health check and version info
- `GET /api/health` - API health status
- `POST /api/payments` - Initiate payment (TODO)
- `GET /api/payments/:id` - Check payment status (TODO)

## Configuration

Edit `wrangler.toml` to configure your Cloudflare Workers settings:

- Environment variables
- KV namespaces
- Durable Objects
- R2 buckets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

Chris Korhonen
