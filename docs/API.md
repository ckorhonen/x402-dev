# x402.dev Payment Rails SDK - API Reference

## X402Client

### Constructor

```typescript
new X402Client(config: PaymentConfig, options?: ClientOptions)
```

**Parameters:**
- `config.apiKey` (string, required): Your API key
- `config.baseUrl` (string, optional): API base URL (default: 'https://api.x402.dev')
- `config.webhookSecret` (string, optional): Secret for webhook signature verification
- `config.environment` (string, optional): 'development' | 'production'
- `options.timeout` (number, optional): Request timeout in ms (default: 30000)
- `options.retries` (number, optional): Number of retries (default: 3)

### Methods

#### initiatePayment

Create a new payment.

```typescript
initiatePayment(request: PaymentRequest): Promise<PaymentResponse>
```

**Parameters:**
- `request.amount` (number, required): Amount in cents
- `request.currency` (string, required): Currency code (e.g., 'USD')
- `request.description` (string, optional): Payment description
- `request.metadata` (object, optional): Additional metadata
- `request.redirectUrl` (string, optional): URL to redirect after payment
- `request.webhookUrl` (string, optional): URL for webhook notifications

**Returns:** `PaymentResponse`

**Example:**
```typescript
const payment = await client.initiatePayment({
  amount: 1000,
  currency: 'USD',
  description: 'Premium subscription',
  metadata: { userId: 'user_123' }
});
```

#### checkPaymentStatus

Get the status of a payment.

```typescript
checkPaymentStatus(paymentId: string): Promise<PaymentResponse>
```

**Example:**
```typescript
const payment = await client.checkPaymentStatus('pay_1234567890');
console.log(payment.status); // 'completed', 'pending', etc.
```

#### cancelPayment

Cancel a pending payment.

```typescript
cancelPayment(paymentId: string): Promise<PaymentResponse>
```

**Example:**
```typescript
const payment = await client.cancelPayment('pay_1234567890');
```

#### handlePaymentRequired

Handle HTTP 402 Payment Required responses.

```typescript
handlePaymentRequired(url: string): Promise<X402Response>
```

**Example:**
```typescript
const response = await client.handlePaymentRequired('https://api.example.com/protected');
if (response.paymentRequired) {
  window.location.href = response.payment.paymentUrl;
}
```

#### verifySignature

Verify webhook signature.

```typescript
verifySignature(payload: string, signature: string): boolean
```

**Example:**
```typescript
const isValid = client.verifySignature(
  JSON.stringify(webhookPayload),
  request.headers['x-webhook-signature']
);
```

#### verifyPayment

Verify a payment by ID.

```typescript
verifyPayment(paymentId: string): Promise<PaymentVerification>
```

**Example:**
```typescript
const verification = await client.verifyPayment('pay_1234567890');
if (verification.valid) {
  // Payment is completed
}
```

#### listPayments

List all payments with pagination.

```typescript
listPayments(params?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<PaymentResponse[]>
```

**Example:**
```typescript
const payments = await client.listPayments({
  limit: 10,
  offset: 0,
  status: 'completed'
});
```

## React Components

### PaymentButton

A button component for initiating payments.

```typescript
<PaymentButton
  amount={number}
  currency={string}
  apiKey={string}
  description?={string}
  baseUrl?={string}
  metadata?={Record<string, any>}
  onSuccess?={(paymentId: string) => void}
  onError?={(error: Error) => void}
  onPaymentRequired?={(paymentUrl: string) => void}
  className?={string}
  style?={React.CSSProperties}
/>
```

### PaymentDashboard

A dashboard component for viewing and managing payments.

```typescript
<PaymentDashboard
  apiKey={string}
  baseUrl?={string}
  refreshInterval?={number}
  onPaymentClick?={(payment: PaymentResponse) => void}
/>
```

## Types

### PaymentStatus

```typescript
type PaymentStatus = 
  | 'pending'
  | 'awaiting_payment'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired';
```

### PaymentResponse

```typescript
interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  description?: string;
  paymentUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}
```

### X402Response

```typescript
interface X402Response {
  status: 402;
  message: string;
  paymentRequired: true;
  payment: {
    id: string;
    amount: number;
    currency: string;
    paymentUrl: string;
    acceptedMethods: string[];
  };
}
```

## HTTP 402 Payment Required

The x402 protocol uses the HTTP 402 status code to indicate that payment is required to access a resource.

### Server-Side Implementation

```typescript
// Protected endpoint example
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

### Client-Side Handling

```typescript
const client = new X402Client({ apiKey: 'your-key' });

try {
  const response = await fetch('https://api.example.com/protected');
  
  if (response.status === 402) {
    const x402 = await client.handlePaymentRequired(response.url);
    // Redirect to payment
    window.location.href = x402.payment.paymentUrl;
  }
} catch (error) {
  console.error('Error:', error);
}
```

## Webhooks

### Webhook Events

- `payment.created` - Payment was created
- `payment.processing` - Payment is being processed
- `payment.completed` - Payment was completed successfully
- `payment.failed` - Payment failed
- `payment.cancelled` - Payment was cancelled
- `payment.expired` - Payment expired

### Webhook Payload

```typescript
interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  paymentId: string;
  data: PaymentResponse;
  signature: string;
}
```

### Webhook Handler Example

```typescript
app.post('/webhooks/payment', async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!client.verifySignature(payload, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const webhook = req.body as WebhookPayload;
  
  switch (webhook.event) {
    case 'payment.completed':
      // Handle successful payment
      await updateUserSubscription(webhook.paymentId);
      break;
      
    case 'payment.failed':
      // Handle failed payment
      await notifyUserOfFailure(webhook.paymentId);
      break;
  }
  
  res.json({ received: true });
});
```

## Error Handling

All SDK methods throw errors that should be caught and handled:

```typescript
try {
  const payment = await client.initiatePayment(request);
} catch (error) {
  if (error instanceof Error) {
    console.error('Payment error:', error.message);
  }
}
```

### Error Types

- `API Error (400)` - Invalid request
- `API Error (401)` - Unauthorized
- `API Error (404)` - Payment not found
- `API Error (500)` - Server error

## Rate Limiting

The API implements rate limiting:
- 100 requests per minute per API key
- 1000 requests per hour per API key

Rate limit headers are included in responses:
- `X-RateLimit-Limit` - Rate limit ceiling
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Time when limit resets
