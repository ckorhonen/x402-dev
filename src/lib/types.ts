/**
 * Type definitions for x402.dev Payment Rails SDK
 */

export interface PaymentConfig {
  apiKey: string;
  baseUrl?: string;
  webhookSecret?: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}
