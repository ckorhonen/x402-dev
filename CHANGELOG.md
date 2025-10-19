# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-19

### Added
- Initial MVP release
- Core TypeScript SDK with full x402 protocol support
- X402Client with payment lifecycle management
- Comprehensive TypeScript type definitions
- Cloudflare Workers backend with API endpoints
- React PaymentButton component
- React PaymentDashboard component
- HTTP 402 Payment Required handling
- Webhook signature verification
- Payment status polling
- Retry logic with exponential backoff
- Error handling and type safety
- Complete API documentation
- Integration guide with examples
- Example implementations for React, Vue, Express, Next.js
- GitHub Actions workflow for CI/CD
- Environment configuration templates

### API Endpoints
- POST /api/payments - Create payment
- GET /api/payments/:id - Get payment status
- GET /api/payments - List payments with filters
- POST /api/payments/:id/cancel - Cancel payment
- GET /api/health - Health check
- GET /protected - Protected resource example (returns 402)
- POST /api/webhooks/payment - Webhook endpoint

### Components
- PaymentButton - Fully styled, customizable payment button
- PaymentDashboard - Complete admin dashboard with stats and filtering

### Features
- Payment creation and management
- Payment status tracking
- Payment cancellation
- Webhook notifications
- Signature verification
- CORS support
- Error handling
- Request retries
- Timeout handling
- Development mode support

### Documentation
- Comprehensive README
- Complete API reference
- Integration guide
- Usage examples
- Security best practices
- Troubleshooting guide

## [Unreleased]

### Planned
- Real payment provider integration (Stripe, crypto)
- Persistent storage with Cloudflare KV/D1
- User authentication and authorization
- Rate limiting
- Payment method management
- Hosted payment pages
- Analytics and reporting
- Subscription management
- Multi-currency support
- CLI tools
- More language SDKs (Python, Go, Ruby)
- WebSocket support for real-time updates
- Refund functionality
- Dispute management
- Customer portal
