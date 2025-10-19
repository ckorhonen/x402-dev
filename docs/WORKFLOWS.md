# GitHub Actions Workflows Documentation

This document describes the comprehensive CI/CD workflows configured for the x402-dev project.

## Overview

The project includes several GitHub Actions workflows to ensure code quality, run tests, and deploy to Cloudflare Workers. All workflows are production-ready and follow best practices.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger via `workflow_dispatch`

**Jobs:**

#### Install Dependencies
- Caches node modules for faster subsequent jobs
- Uses npm ci for reproducible builds

#### TypeScript Type Check
- Runs `tsc --noEmit` to verify type safety
- Ensures no TypeScript errors before deployment

#### ESLint
- Runs ESLint with your configured rules
- Enforces code quality standards

#### Prettier Format Check
- Verifies code formatting consistency
- Checks all TypeScript, JavaScript, JSON, CSS, and Markdown files

#### Run Tests
- Executes Vitest test suite with coverage
- Uploads coverage reports as artifacts (retained for 30 days)

#### Build
- Compiles TypeScript and bundles the project
- Uploads build artifacts (retained for 7 days)
- Only runs if all previous checks pass

#### Security Audit
- Runs `npm audit` to check for vulnerabilities
- Configured to flag moderate and higher severity issues

#### CI Success
- Final job that confirms all checks passed
- Useful for branch protection rules

**Parallel Execution:** Most jobs run in parallel after dependencies are installed, significantly reducing CI time.

---

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch → deploys to staging
- Push of version tags (e.g., `v1.0.0`) → deploys to production
- Manual trigger with environment selection

**Environments:**

#### Staging
- **URL:** `https://x402-dev-staging.workers.dev`
- **Deployment:** Automatic on main branch pushes
- **Environment variables:** `NODE_ENV=staging`

#### Production
- **URL:** `https://x402.dev`
- **Deployment:** Triggered by version tags or manual workflow dispatch
- **Environment variables:** `NODE_ENV=production`
- **Protection:** Requires GitHub environment approval (recommended)

**Jobs:**

#### Pre-deployment Checks
- Runs type checking, linting, tests, and build
- Ensures code quality before deployment
- Fails deployment if any check fails

#### Deploy to Staging
- Uses Cloudflare Wrangler action
- Deploys with `--env staging` flag
- Creates deployment summary

#### Deploy to Production
- Only runs for version tags or manual production deploys
- Uses Cloudflare Wrangler action
- Deploys with `--env production` flag
- Creates a GitHub Release for tagged deployments

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

---

### 3. Pull Request Checks (`.github/workflows/pr-checks.yml`)

**Triggers:**
- Pull request opened, synchronized, reopened, or marked ready for review
- Only runs on PRs to `main` or `develop` branches
- Skips draft PRs

**Jobs:**

#### Auto Label PR
- Automatically labels PRs based on changed files
- Uses `.github/workflows/labeler.yml` configuration

#### PR CI Checks
- Runs all CI checks (type check, lint, format, tests, build)
- Comments on PR with check results table
- Updates existing comment on subsequent pushes
- Fails if any check fails

#### PR Size Check
- Analyzes lines changed (additions + deletions)
- Applies size labels:
  - `size/XS`: < 50 lines
  - `size/S`: < 200 lines
  - `size/M`: < 500 lines
  - `size/L`: < 1000 lines
  - `size/XL`: ≥ 1000 lines
- Encourages splitting large PRs

#### PR Title Check
- Enforces conventional commits format
- Expected format: `type(scope): description`
- Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
- Example: `feat(api): add payment processing endpoint`

---

### 4. CodeQL Security Analysis (`.github/workflows/codeql.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Weekly schedule (Monday at 6:00 AM UTC)

**Features:**
- Scans JavaScript/TypeScript code for security vulnerabilities
- Uses security-and-quality query suite
- Results visible in Security tab
- Integrates with GitHub Advanced Security

---

### 5. Dependency Review (`.github/workflows/dependency-review.yml`)

**Triggers:**
- Pull requests to `main` or `develop` branches

**Features:**
- Reviews dependency changes in PRs
- Flags dependencies with moderate+ severity vulnerabilities
- Posts summary comment on PRs
- Helps prevent introducing vulnerable dependencies

---

## Setup Instructions

### 1. Configure Cloudflare Secrets

Add the following secrets to your repository (Settings → Secrets and variables → Actions):

```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```

**To get your Cloudflare API Token:**
1. Go to Cloudflare Dashboard
2. Navigate to My Profile → API Tokens
3. Create Token → Use "Edit Cloudflare Workers" template
4. Copy the token and add it as a secret

**To get your Account ID:**
1. Go to Cloudflare Dashboard
2. Select your domain
3. Account ID is visible in the right sidebar

### 2. Configure GitHub Environments (Optional but Recommended)

For better control over deployments:

1. Go to Settings → Environments
2. Create two environments: `staging` and `production`
3. For production:
   - Add protection rules
   - Require reviewers
   - Add deployment branch rules (only tags)

### 3. Enable Branch Protection

Recommended branch protection rules for `main`:

- ✅ Require pull request before merging
- ✅ Require status checks to pass:
  - CI Success
  - TypeScript Type Check
  - ESLint
  - Prettier Format Check
  - Run Tests
  - Build Project
- ✅ Require branches to be up to date
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

### 4. Configure Auto-labeling

The labeler configuration in `.github/workflows/labeler.yml` automatically applies labels based on file changes:

- `dependencies`: Changes to package files
- `documentation`: Changes to docs or markdown
- `typescript`: Changes to TypeScript files
- `configuration`: Changes to config files
- `tests`: Changes to test files
- `examples`: Changes to example files

Create these labels in your repository for automatic labeling to work.

---

## Usage Examples

### Running CI Manually

You can trigger the CI workflow manually:

```bash
# Via GitHub CLI
gh workflow run ci.yml

# Or via GitHub web interface
# Actions → CI → Run workflow
```

### Deploying to Staging

Push to main branch:
```bash
git checkout main
git push origin main
```

Or trigger manually:
```bash
gh workflow run deploy.yml -f environment=staging
```

### Deploying to Production

Create and push a version tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

Or trigger manually:
```bash
gh workflow run deploy.yml -f environment=production
```

### Creating a Compliant PR

```bash
# Create a feature branch
git checkout -b feat/payment-processing

# Make your changes
# ...

# Commit with conventional commit format
git commit -m "feat(api): add payment processing endpoint"

# Push and create PR
git push origin feat/payment-processing
gh pr create --title "feat(api): add payment processing endpoint" --body "Adds new payment processing functionality"
```

---

## Monitoring and Debugging

### Viewing Workflow Runs

- Navigate to Actions tab
- Click on a workflow to see recent runs
- Click on a run to see job details and logs

### Checking Coverage Reports

After a CI run completes:
1. Navigate to the workflow run
2. Scroll to "Artifacts" section
3. Download `coverage-report` artifact
4. Extract and open `index.html` in a browser

### Viewing Deployment Status

- Check the Environments section (Code → Environments)
- View deployment history and URLs
- See who approved production deployments

### Security Alerts

- Navigate to Security tab
- Check Code scanning alerts (CodeQL findings)
- Review Dependabot alerts

---

## Troubleshooting

### CI Failing on Format Check

Run Prettier locally to fix:
```bash
npm run format
git add .
git commit -m "chore: fix formatting"
```

### CI Failing on Lint

Fix linting issues:
```bash
npm run lint -- --fix
git add .
git commit -m "chore: fix linting issues"
```

### Type Check Failing

Check TypeScript errors:
```bash
npx tsc --noEmit
```

### Deployment Failing

1. Verify secrets are set correctly
2. Check Wrangler configuration in `wrangler.toml`
3. Ensure Cloudflare account has Workers enabled
4. Review deployment logs in Actions tab

### Tests Failing

Run tests locally:
```bash
npm test
```

Run with coverage:
```bash
npm test -- --coverage
```

---

## Best Practices

### Commit Messages
- Follow conventional commits format
- Use descriptive commit messages
- Reference issues when applicable

### Pull Requests
- Keep PRs focused and small (< 500 lines when possible)
- Ensure all CI checks pass before requesting review
- Add tests for new features
- Update documentation as needed

### Deployments
- Always test in staging before production
- Use semantic versioning for releases
- Write clear release notes
- Monitor deployments after they complete

### Security
- Keep dependencies up to date
- Review and address security alerts promptly
- Use environment variables for sensitive data
- Never commit secrets to the repository

---

## Maintenance

### Updating Workflows

When modifying workflows:
1. Test changes in a feature branch
2. Review GitHub Actions logs carefully
3. Update this documentation if behavior changes
4. Consider backward compatibility

### Updating Dependencies

Regularly update GitHub Actions:
```bash
# Check for updates to actions
# Look for newer versions of:
# - actions/checkout
# - actions/setup-node
# - cloudflare/wrangler-action
# - github/codeql-action
```

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

## Support

If you encounter issues with the workflows:
1. Check the Actions tab for detailed error logs
2. Review this documentation
3. Check GitHub Actions status page
4. Contact the team lead or DevOps

---

**Last Updated:** 2025-01-19  
**Maintained By:** Chris Korhonen
