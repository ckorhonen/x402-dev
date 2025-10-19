/**
 * Payment Button Component
 */

import React, { useState } from 'react';

interface PaymentButtonProps {
  amount: number;
  currency: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  currency,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // TODO: Implement payment flow
      console.log('Processing payment:', { amount, currency });
      
      // Placeholder for actual payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSuccess) {
        onSuccess('payment-id-placeholder');
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      style={{
        padding: '12px 24px',
        fontSize: '16px',
        backgroundColor: loading ? '#ccc' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Processing...' : `Pay ${amount} ${currency}`}
    </button>
  );
};
