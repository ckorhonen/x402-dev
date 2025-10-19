/**
 * Basic Usage Example for x402.dev Payment Rails SDK
 */

import { X402Client } from '../src/lib/client';
import type { PaymentRequest } from '../src/lib/types';

// Initialize client
const client = new X402Client({
  apiKey: 'your-api-key-here',
  baseUrl: 'http://localhost:8787', // Development URL
  environment: 'development',
});

// Example 1: Create a payment
async function createPayment() {
  try {
    const request: PaymentRequest = {
      amount: 1000, // Amount in cents
      currency: 'USD',
      description: 'Premium subscription',
      metadata: {
        userId: 'user_123',
        planId: 'premium_monthly',
      },
    };

    const payment = await client.initiatePayment(request);
    console.log('Payment created:', payment);
    console.log('Payment URL:', payment.paymentUrl);

    return payment;
  } catch (error) {
    console.error('Failed to create payment:', error);
    throw error;
  }
}

// Example 2: Check payment status
async function checkPayment(paymentId: string) {
  try {
    const payment = await client.checkPaymentStatus(paymentId);
    console.log('Payment status:', payment.status);
    return payment;
  } catch (error) {
    console.error('Failed to check payment:', error);
    throw error;
  }
}

// Example 3: Handle HTTP 402 Payment Required
async function accessProtectedResource() {
  try {
    const x402Response = await client.handlePaymentRequired(
      'http://localhost:8787/protected'
    );

    if (x402Response.paymentRequired) {
      console.log('Payment required!');
      console.log('Amount:', x402Response.payment.amount);
      console.log('Payment URL:', x402Response.payment.paymentUrl);
      console.log('Accepted methods:', x402Response.payment.acceptedMethods);

      // Redirect user to payment URL
      // window.location.href = x402Response.payment.paymentUrl;
    }
  } catch (error) {
    console.error('Failed to access resource:', error);
  }
}

// Example 4: List all payments
async function listPayments() {
  try {
    const payments = await client.listPayments({
      limit: 10,
      offset: 0,
      status: 'completed',
    });

    console.log(`Found ${payments.length} completed payments`);
    payments.forEach(payment => {
      console.log(`- ${payment.id}: ${payment.amount} ${payment.currency}`);
    });

    return payments;
  } catch (error) {
    console.error('Failed to list payments:', error);
    throw error;
  }
}

// Example 5: Verify webhook signature
function verifyWebhook(payload: string, signature: string) {
  try {
    const isValid = client.verifySignature(payload, signature);
    console.log('Webhook signature valid:', isValid);
    return isValid;
  } catch (error) {
    console.error('Failed to verify webhook:', error);
    return false;
  }
}

// Run examples
async function main() {
  console.log('=== x402.dev Payment Rails SDK Examples ===\n');

  // Create a payment
  console.log('1. Creating payment...');
  const payment = await createPayment();
  console.log('');

  // Check payment status
  console.log('2. Checking payment status...');
  await checkPayment(payment.id);
  console.log('');

  // Handle 402 response
  console.log('3. Accessing protected resource...');
  await accessProtectedResource();
  console.log('');

  // List payments
  console.log('4. Listing payments...');
  await listPayments();
  console.log('');
}

// Uncomment to run examples
// main().catch(console.error);
