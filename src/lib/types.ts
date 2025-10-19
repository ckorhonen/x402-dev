/**
 * Type definitions for x402.dev Payment Rails SDK
 */

// Core payment configuration
export interface PaymentConfig {
  apiKey: string;
  baseUrl?: string;
  webhookSecret?: string;
  environment?: 'development' | 'production';
}

// Payment request structure
export interface PaymentRequest {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  redirectUrl?: string;
  webhookUrl?: string;
}

// Payment response structure
export interface PaymentResponse {
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

// Payment status enum
export type PaymentStatus = 
  | 'pending' 
  | 'awaiting_payment' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'expired';

// HTTP 402 Payment Required response
export interface X402Response {
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

// Webhook payload
export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  paymentId: string;
  data: PaymentResponse;
  signature: string;
}

// Webhook events
export type WebhookEvent = 
  | 'payment.created'
  | 'payment.processing'
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.cancelled'
  | 'payment.expired';

// API error response
export interface APIError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Payment method
export interface PaymentMethod {
  type: 'card' | 'crypto' | 'lightning' | 'bank_transfer';
  provider?: string;
  details?: Record<string, any>;
}

// Payment verification result
export interface PaymentVerification {
  valid: boolean;
  paymentId: string;
  status: PaymentStatus;
  verifiedAt: string;
}

// Client options
export interface ClientOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}
