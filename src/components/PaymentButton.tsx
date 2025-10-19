/**
 * Payment Button Component
 */

import React, { useState } from 'react';
import { X402Client } from '../lib/client';
import type { PaymentRequest } from '../lib/types';

interface PaymentButtonProps {
  amount: number;
  currency: string;
  description?: string;
  apiKey: string;
  baseUrl?: string;
  metadata?: Record<string, any>;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
  onPaymentRequired?: (paymentUrl: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  currency,
  description,
  apiKey,
  baseUrl,
  metadata,
  onSuccess,
  onError,
  onPaymentRequired,
  className,
  style,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const client = new X402Client({ apiKey, baseUrl });

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setPaymentUrl(null);

    try {
      const request: PaymentRequest = {
        amount,
        currency,
        description,
        metadata,
      };

      const response = await client.initiatePayment(request);

      if (response.paymentUrl) {
        setPaymentUrl(response.paymentUrl);
        if (onPaymentRequired) {
          onPaymentRequired(response.paymentUrl);
        }

        // Poll for payment completion
        pollPaymentStatus(response.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (paymentId: string) => {
    const maxAttempts = 60; // Poll for up to 5 minutes
    let attempts = 0;

    const interval = setInterval(async () => {
      try {
        attempts++;
        const status = await client.checkPaymentStatus(paymentId);

        if (status.status === 'completed') {
          clearInterval(interval);
          setLoading(false);
          if (onSuccess) {
            onSuccess(paymentId);
          }
        } else if (status.status === 'failed' || status.status === 'cancelled') {
          clearInterval(interval);
          setLoading(false);
          const errorMsg = `Payment ${status.status}`;
          setError(errorMsg);
          if (onError) {
            onError(new Error(errorMsg));
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setLoading(false);
          setError('Payment timeout');
          if (onError) {
            onError(new Error('Payment timeout'));
          }
        }
      } catch (err) {
        clearInterval(interval);
        setLoading(false);
        const errorMessage = err instanceof Error ? err.message : 'Failed to check payment status';
        setError(errorMessage);
        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      }
    }, 5000); // Poll every 5 seconds
  };

  const defaultStyle: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    backgroundColor: loading ? '#9ca3af' : error ? '#ef4444' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    ...style,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={handlePayment}
        disabled={loading}
        className={className}
        style={defaultStyle}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span className="spinner">⏳</span> Processing...
          </span>
        ) : (
          `Pay ${amount} ${currency}`
        )}
      </button>

      {error && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '6px',
          fontSize: '14px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {paymentUrl && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          borderRadius: '6px',
          fontSize: '14px',
        }}>
          💳 <a href={paymentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1e40af', textDecoration: 'underline' }}>
            Complete payment in new window
          </a>
        </div>
      )}
    </div>
  );
};
