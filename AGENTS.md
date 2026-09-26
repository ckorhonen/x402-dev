# Repository instructions

This TypeScript project combines a Cloudflare Worker backend, client/payment types and utilities in `src/lib/`, and React payment components in `src/components/`. Read the affected implementation and tests before changing payment state or webhook behavior. Treat example credentials and amounts as fixtures, not real payment authorization.

Use Node 20 as in CI and `npm ci`. Actual root scripts are `npm run dev` (Wrangler), `npm run build` (tsc then Vite), `npm run lint`, and `npm test -- --run` for a finite Vitest run. CI also uses `npx tsc --noEmit`, `npx prettier --check .`, and test coverage. `npm run format` writes files. README examples such as type-check, test:integration, and test:e2e are not declared scripts; do not claim those checks exist.

Use mocked payment/provider responses and disposable storage for verification. A successful build does not establish payment settlement, webhook authenticity, or idempotency. Inspect changed UI flows with test data. Deployments and real transfers require their own task scope: the deploy workflow pushes staging from main and production from version tags, and `npm run deploy` is an external mutation.

Complete the authorized change through relevant verification and repair of introduced failures. Resolve routine implementation choices directly; ask only for information or decisions that materially affect the result. If blocked, name the affected action and missing prerequisite, continue independent work, and close with changed paths, checks actually run, and unverified behavior.
