/**
 * x402.dev Payment Rails Client
 */

import {
  PaymentConfig,
  PaymentRequest,
  PaymentResponse,
  X402Response,
  PaymentVerification,
  APIError,
  ClientOptions,
} from './types';

export class X402Client {
  private config: PaymentConfig;
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor(config: PaymentConfig, options?: ClientOptions) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.x402.dev';
    this.timeout = options?.timeout || 30000;
    this.retries = options?.retries || 3;
  }

  /**
   * Initialize a payment request
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.makeRequest<PaymentResponse>(
        '/api/payments',
        'POST',
        request
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await this.makeRequest<PaymentResponse>(
        `/api/payments/${paymentId}`,
        'GET'
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await this.makeRequest<PaymentResponse>(
        `/api/payments/${paymentId}/cancel`,
        'POST'
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle HTTP 402 Payment Required responses
   */
  async handlePaymentRequired(url: string): Promise<X402Response> {
    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (response.status === 402) {
        const data = await response.json();
        return {
          status: 402,
          message: data.message || 'Payment Required',
          paymentRequired: true,
          payment: data.payment,
        };
      }

      throw new Error(`Expected 402 response, got ${response.status}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify payment signature from webhook
   */
  verifySignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    try {
      // In production, use proper HMAC verification
      // This is a simplified version for MVP
      const expectedSignature = this.generateSignature(payload);
      return signature === expectedSignature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Verify a payment by ID
   */
  async verifyPayment(paymentId: string): Promise<PaymentVerification> {
    try {
      const payment = await this.checkPaymentStatus(paymentId);
      return {
        valid: payment.status === 'completed',
        paymentId: payment.id,
        status: payment.status,
        verifiedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List all payments (with pagination)
   */
  async listPayments(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<PaymentResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.set('limit', params.limit.toString());
      if (params?.offset) queryParams.set('offset', params.offset.toString());
      if (params?.status) queryParams.set('status', params.status);

      const response = await this.makeRequest<PaymentResponse[]>(
        `/api/payments?${queryParams.toString()}`,
        'GET'
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    path: string,
    method: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method,
          headers: this.getHeaders(),
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json().catch(() => ({
            error: 'Unknown error',
            message: response.statusText,
            statusCode: response.status,
          }));
          throw error;
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.retries) {
          // Exponential backoff
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError;
  }

  /**
   * Get request headers
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Client-Version': '0.1.0',
    };
  }

  /**
   * Generate signature for webhook verification
   */
  private generateSignature(payload: string): string {
    // In production, use crypto.subtle.sign with HMAC-SHA256
    // This is a simplified version for MVP
    const secret = this.config.webhookSecret || '';
    return Buffer.from(secret + payload).toString('base64');
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any): Error {
    if (error.statusCode) {
      const apiError = error as APIError;
      return new Error(
        `API Error (${apiError.statusCode}): ${apiError.message}`
      );
    }
    return error instanceof Error ? error : new Error(String(error));
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
