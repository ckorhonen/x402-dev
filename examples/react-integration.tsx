/**
 * React Integration Example
 */

import React, { useState } from 'react';
import { PaymentButton, PaymentDashboard } from '../src/components';

// Example 1: Simple Payment Button
export function SimplePaymentExample() {
  return (
    <div>
      <h2>Simple Payment</h2>
      <PaymentButton
        amount={1000}
        currency="USD"
        apiKey="your-api-key"
        baseUrl="http://localhost:8787"
        onSuccess={(paymentId) => {
          console.log('Payment successful!', paymentId);
          alert('Payment completed!');
        }}
        onError={(error) => {
          console.error('Payment failed:', error);
          alert('Payment failed: ' + error.message);
        }}
      />
    </div>
  );
}

// Example 2: Payment with Metadata
export function PaymentWithMetadata() {
  const [userId] = useState('user_123');

  return (
    <div>
      <h2>Premium Subscription</h2>
      <p>Upgrade to Premium for $10/month</p>
      <PaymentButton
        amount={1000}
        currency="USD"
        description="Premium Monthly Subscription"
        apiKey="your-api-key"
        metadata={{
          userId,
          planId: 'premium_monthly',
          subscriptionType: 'recurring',
        }}
        onSuccess={(paymentId) => {
          // Update user's subscription status
          console.log('User upgraded to premium:', paymentId);
        }}
      />
    </div>
  );
}

// Example 3: Payment Dashboard
export function AdminDashboard() {
  const [selectedPayment, setSelectedPayment] = useState(null);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <PaymentDashboard
        apiKey="your-api-key"
        baseUrl="http://localhost:8787"
        refreshInterval={30000}
        onPaymentClick={(payment) => {
          console.log('Payment clicked:', payment);
          setSelectedPayment(payment);
        }}
      />

      {selectedPayment && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          <h3>Payment Details</h3>
          <pre>{JSON.stringify(selectedPayment, null, 2)}</pre>
          <button onClick={() => setSelectedPayment(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

// Example 4: Custom Styled Payment Button
export function CustomStyledPayment() {
  return (
    <div>
      <h2>Custom Styled Payment</h2>
      <PaymentButton
        amount={2500}
        currency="USD"
        description="One-time purchase"
        apiKey="your-api-key"
        className="my-custom-button"
        style={{
          backgroundColor: '#10b981',
          padding: '16px 32px',
          fontSize: '18px',
          borderRadius: '12px',
          fontWeight: 700,
        }}
        onPaymentRequired={(paymentUrl) => {
          // Open payment in modal or new window
          window.open(paymentUrl, '_blank', 'width=600,height=800');
        }}
        onSuccess={(paymentId) => {
          console.log('Payment completed:', paymentId);
        }}
      />
    </div>
  );
}

// Example 5: Complete Checkout Flow
export function CheckoutFlow() {
  const [step, setStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const cartItems = [
    { id: 1, name: 'Premium Plan', price: 1000 },
    { id: 2, name: 'Add-on Feature', price: 500 },
  ];

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      {step === 'cart' && (
        <>
          <h2>Shopping Cart</h2>
          {cartItems.map(item => (
            <div key={item.id} style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
              <span>{item.name}</span>
              <span style={{ float: 'right' }}>${item.price / 100}</span>
            </div>
          ))}
          <div style={{ padding: '12px', fontWeight: 'bold', fontSize: '18px' }}>
            <span>Total:</span>
            <span style={{ float: 'right' }}>${total / 100}</span>
          </div>
          <button
            onClick={() => setStep('payment')}
            style={{
              width: '100%',
              padding: '16px',
              marginTop: '16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Proceed to Payment
          </button>
        </>
      )}

      {step === 'payment' && (
        <>
          <h2>Payment</h2>
          <div style={{ marginBottom: '24px' }}>
            <p>Total amount: ${total / 100}</p>
          </div>
          <PaymentButton
            amount={total}
            currency="USD"
            description="Purchase from cart"
            apiKey="your-api-key"
            metadata={{ cartItems: cartItems.map(i => i.id) }}
            onSuccess={(id) => {
              setPaymentId(id);
              setStep('success');
            }}
            onError={(error) => {
              alert('Payment failed: ' + error.message);
            }}
          />
          <button
            onClick={() => setStep('cart')}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '16px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Back to Cart
          </button>
        </>
      )}

      {step === 'success' && (
        <>
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2>Payment Successful!</h2>
            <p style={{ color: '#6b7280' }}>Payment ID: {paymentId}</p>
            <button
              onClick={() => {
                setStep('cart');
                setPaymentId(null);
              }}
              style={{
                padding: '12px 24px',
                marginTop: '24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Continue Shopping
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Main App Component
export default function App() {
  const [activeExample, setActiveExample] = useState<string>('simple');

  return (
    <div style={{ padding: '24px' }}>
      <h1>x402.dev Payment Rails SDK Examples</h1>
      
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <button onClick={() => setActiveExample('simple')}>Simple</button>
        <button onClick={() => setActiveExample('metadata')}>With Metadata</button>
        <button onClick={() => setActiveExample('dashboard')}>Dashboard</button>
        <button onClick={() => setActiveExample('custom')}>Custom Style</button>
        <button onClick={() => setActiveExample('checkout')}>Checkout Flow</button>
      </div>

      <div style={{ marginTop: '24px' }}>
        {activeExample === 'simple' && <SimplePaymentExample />}
        {activeExample === 'metadata' && <PaymentWithMetadata />}
        {activeExample === 'dashboard' && <AdminDashboard />}
        {activeExample === 'custom' && <CustomStyledPayment />}
        {activeExample === 'checkout' && <CheckoutFlow />}
      </div>
    </div>
  );
}
