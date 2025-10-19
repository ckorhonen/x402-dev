# GitHub Actions Workflows - Quick Reference

## 🚀 Quick Commands

### Run CI Checks Locally

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format check
npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,md}"

# Format fix
npm run format

# Tests
npm test

# Tests with coverage
npm test -- --coverage

# Build
npm run build

# All checks (run before pushing)
npm run lint && npx tsc --noEmit && npm test -- --run && npm run build
```

### Deploy Commands

```bash
# Deploy to staging (via git push)
git checkout main
git push origin main

# Deploy to production (via git tag)
git tag v1.0.0
git push origin v1.0.0

# Manual staging deploy (via GitHub CLI)
gh workflow run deploy.yml -f environment=staging

# Manual production deploy (via GitHub CLI)
gh workflow run deploy.yml -f environment=production
```

### Create a PR

```bash
# Feature branch
git checkout -b feat/my-feature

# Commit with conventional format
git commit -m "feat(scope): description"

# Push and create PR
git push origin feat/my-feature
gh pr create --title "feat(scope): description" --body "Description of changes"
```

## 📋 Workflow Status Badges

Add these to your README.md:

```markdown
![CI](https://github.com/ckorhonen/x402-dev/workflows/CI/badge.svg)
![Deploy](https://github.com/ckorhonen/x402-dev/workflows/Deploy%20to%20Cloudflare%20Workers/badge.svg)
![CodeQL](https://github.com/ckorhonen/x402-dev/workflows/CodeQL%20Security%20Analysis/badge.svg)
```

## 🔍 What Each Workflow Does

| Workflow | When It Runs | What It Does |
|----------|--------------|--------------|
| **CI** | Push/PR to main/develop | Type check, lint, format check, tests, build, security audit |
| **Deploy** | Push to main (staging), version tags (production) | Pre-deploy checks, deploy to Cloudflare Workers |
| **PR Checks** | PRs to main/develop | Auto-label, CI checks with PR comment, size check, title format |
| **CodeQL** | Push/PR, weekly schedule | Security code scanning |
| **Dependency Review** | PRs to main/develop | Check for vulnerable dependencies |

## ✅ PR Checklist

Before creating a PR:

- [ ] Code follows project style (runs `npm run lint`)
- [ ] Code is formatted (runs `npm run format`)
- [ ] TypeScript compiles (runs `npx tsc --noEmit`)
- [ ] All tests pass (runs `npm test`)
- [ ] New tests added for new features
- [ ] PR title follows format: `type(scope): description`
- [ ] Changes are documented (if applicable)

## 🏷️ Conventional Commit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(api): add payment endpoint` |
| `fix` | Bug fix | `fix(auth): resolve token expiration` |
| `docs` | Documentation | `docs(readme): update install instructions` |
| `style` | Formatting, no code change | `style: fix indentation` |
| `refactor` | Code refactoring | `refactor(utils): simplify validation logic` |
| `perf` | Performance improvement | `perf(api): optimize database queries` |
| `test` | Add/update tests | `test(auth): add unit tests` |
| `chore` | Maintenance tasks | `chore: update dependencies` |
| `ci` | CI/CD changes | `ci: add deployment workflow` |

## 🔐 Required Secrets

Set these in GitHub repository settings (Settings → Secrets → Actions):

```
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

## 🎯 Branch Protection Rules

Recommended for `main` branch:

- ✅ Require PR before merging
- ✅ Require status checks: CI Success, TypeScript Type Check, ESLint, Tests
- ✅ Require up-to-date branches
- ✅ Require conversation resolution

## 📊 Where to Find Things

| What | Where |
|------|-------|
| Workflow runs | Actions tab |
| Coverage reports | Actions → Workflow run → Artifacts |
| Deployment status | Code → Environments |
| Security alerts | Security tab |
| CodeQL findings | Security → Code scanning |

## 🆘 Common Issues

### "Format check failed"
```bash
npm run format
git add .
git commit -m "chore: fix formatting"
git push
```

### "Lint failed"
```bash
npm run lint -- --fix
git add .
git commit -m "chore: fix linting issues"
git push
```

### "Type check failed"
```bash
npx tsc --noEmit  # See errors
# Fix the errors, then:
git add .
git commit -m "fix: resolve type errors"
git push
```

### "Tests failed"
```bash
npm test  # Run locally to debug
# Fix the issues, then push
```

### "Deployment failed"
1. Check secrets are set correctly
2. Verify `wrangler.toml` configuration
3. Check deployment logs in Actions tab
4. Ensure Cloudflare account has Workers enabled

## 📚 Full Documentation

For detailed information, see [WORKFLOWS.md](../docs/WORKFLOWS.md)

## 🔗 Useful Links

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
