# GitHub Actions Setup Checklist

Complete this checklist to ensure your GitHub Actions workflows are fully configured and operational.

## ✅ Initial Setup

### 1. Repository Secrets

Set up the following secrets in your repository:

**Location:** Settings → Secrets and variables → Actions → New repository secret

- [ ] `CLOUDFLARE_API_TOKEN`
  - Get from: Cloudflare Dashboard → My Profile → API Tokens
  - Create token with "Edit Cloudflare Workers" template
  - Ensure it has permissions for your account

- [ ] `CLOUDFLARE_ACCOUNT_ID`
  - Get from: Cloudflare Dashboard → select your domain → see Account ID in sidebar
  - Copy the Account ID value

**Verification:** Run this command to test:
```bash
gh secret list
```

---

### 2. GitHub Environments

Create deployment environments for better control:

**Location:** Settings → Environments → New environment

#### Staging Environment
- [ ] Create environment named `staging`
- [ ] Set environment URL: `https://x402-dev-staging.workers.dev`
- [ ] (Optional) Add deployment protection rules
- [ ] (Optional) Limit deployment branches to `main`

#### Production Environment
- [ ] Create environment named `production`
- [ ] Set environment URL: `https://x402.dev`
- [ ] ✅ **Enable** "Required reviewers" (recommended)
  - Add at least 1 reviewer
- [ ] ✅ **Enable** "Wait timer" (optional, e.g., 5 minutes)
- [ ] Limit deployment branches to tags matching `v*`

---

### 3. Branch Protection Rules

Protect your `main` branch:

**Location:** Settings → Branches → Add branch protection rule

- [ ] Branch name pattern: `main`

**Protection Settings:**
- [ ] ✅ Require a pull request before merging
  - [ ] Require approvals: 1 (or more)
  - [ ] Dismiss stale pull request approvals when new commits are pushed
  - [ ] Require review from Code Owners (if CODEOWNERS file exists)

- [ ] ✅ Require status checks to pass before merging
  - [ ] Require branches to be up to date before merging
  - [ ] Add required status checks:
    - [ ] `CI Success`
    - [ ] `TypeScript Type Check`
    - [ ] `ESLint`
    - [ ] `Prettier Format Check`
    - [ ] `Run Tests`
    - [ ] `Build Project`

- [ ] ✅ Require conversation resolution before merging

- [ ] ✅ Require signed commits (optional but recommended)

- [ ] ✅ Include administrators (enforce rules for admins too)

- [ ] Do not allow bypassing the above settings

---

### 4. Repository Labels

Create the following labels for automatic PR labeling:

**Location:** Issues → Labels → New label

| Label | Color | Description |
|-------|-------|-------------|
| `dependencies` | `#0366d6` | Changes to dependencies |
| `documentation` | `#0075ca` | Documentation changes |
| `typescript` | `#007acc` | TypeScript changes |
| `configuration` | `#d73a4a` | Configuration files |
| `tests` | `#28a745` | Test-related changes |
| `examples` | `#fbca04` | Example code changes |
| `size/XS` | `#00ff00` | Extra small PR |
| `size/S` | `#00ff00` | Small PR |
| `size/M` | `#ffff00` | Medium PR |
| `size/L` | `#ff9900` | Large PR |
| `size/XL` | `#ff0000` | Extra large PR |
| `stale` | `#cccccc` | No recent activity |
| `work-in-progress` | `#fbca04` | Work in progress |

**Quick command to create labels:**
```bash
# Install GitHub CLI first: https://cli.github.com/
gh label create "dependencies" --color "0366d6" --description "Changes to dependencies"
gh label create "documentation" --color "0075ca" --description "Documentation changes"
gh label create "typescript" --color "007acc" --description "TypeScript changes"
gh label create "configuration" --color "d73a4a" --description "Configuration files"
gh label create "tests" --color "28a745" --description "Test-related changes"
gh label create "examples" --color "fbca04" --description "Example code changes"
gh label create "size/XS" --color "00ff00" --description "Extra small PR"
gh label create "size/S" --color "00ff00" --description "Small PR"
gh label create "size/M" --color "ffff00" --description "Medium PR"
gh label create "size/L" --color "ff9900" --description "Large PR"
gh label create "size/XL" --color "ff0000" --description "Extra large PR"
gh label create "stale" --color "cccccc" --description "No recent activity"
gh label create "work-in-progress" --color "fbca04" --description "Work in progress"
```

---

### 5. Cloudflare Workers Configuration

Update your `wrangler.toml` for multiple environments:

- [ ] Verify `wrangler.toml` has staging and production environments
- [ ] Update environment URLs if needed
- [ ] Configure KV namespaces (if using)
- [ ] Configure R2 buckets (if using)
- [ ] Configure Durable Objects (if using)

**Test deployment:**
```bash
# Test staging
npm run deploy -- --env staging --dry-run

# Test production
npm run deploy -- --env production --dry-run
```

---

### 6. Enable GitHub Features

Enable additional GitHub features:

**Location:** Settings → General

- [ ] ✅ Issues
- [ ] ✅ Projects (if using)
- [ ] ✅ Discussions (optional)

**Location:** Settings → Code security and analysis

- [ ] ✅ Dependency graph
- [ ] ✅ Dependabot alerts
- [ ] ✅ Dependabot security updates
- [ ] ✅ Dependabot version updates (optional)
- [ ] ✅ Code scanning (CodeQL)
- [ ] ✅ Secret scanning

---

### 7. Test Workflows

Verify that all workflows are working:

#### Test CI Workflow
```bash
git checkout -b test/ci-workflow
echo "// test" >> src/index.ts
git add .
git commit -m "test(ci): verify CI workflow"
git push origin test/ci-workflow
gh pr create --title "test(ci): verify CI workflow" --body "Testing CI"
```

- [ ] CI workflow runs automatically
- [ ] All jobs complete successfully
- [ ] PR comment is added with check results
- [ ] PR is labeled correctly

#### Test Deployment to Staging
```bash
git checkout main
git pull
# Make a small change
git commit -am "chore: test staging deployment"
git push origin main
```

- [ ] Deploy workflow triggers automatically
- [ ] Pre-deployment checks pass
- [ ] Deploys to staging successfully
- [ ] Deployment summary is created

#### Test Deployment to Production
```bash
git tag v0.1.0-test
git push origin v0.1.0-test
```

- [ ] Deploy workflow triggers automatically
- [ ] Deploys to production successfully
- [ ] GitHub Release is created
- [ ] Release notes are generated

---

## 🧪 Verification Tests

Run these tests to ensure everything works:

### Local Development
```bash
# Install dependencies
npm ci

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format check
npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,md}"

# Tests
npm test

# Build
npm run build
```

All commands should complete successfully.

### GitHub Actions
- [ ] View Actions tab - should see all workflows listed
- [ ] Click on CI workflow - should show recent runs
- [ ] Check workflow badges in README (optional)

### Deployments
- [ ] Check Environments tab - should see staging and production
- [ ] Visit staging URL - should work
- [ ] Visit production URL - should work (after production deployment)

---

## 📚 Documentation Updates

- [ ] Add workflow badges to README.md
- [ ] Document required environment variables
- [ ] Update deployment instructions
- [ ] Add links to workflow documentation

**Example badges for README.md:**
```markdown
![CI](https://github.com/ckorhonen/x402-dev/workflows/CI/badge.svg)
![Deploy](https://github.com/ckorhonen/x402-dev/workflows/Deploy%20to%20Cloudflare%20Workers/badge.svg)
![CodeQL](https://github.com/ckorhonen/x402-dev/workflows/CodeQL%20Security%20Analysis/badge.svg)
```

---

## 🎓 Team Training

Ensure your team knows:

- [ ] How to create PRs with conventional commit format
- [ ] How to run CI checks locally before pushing
- [ ] How to trigger manual deployments
- [ ] Where to find workflow logs and deployment status
- [ ] How to troubleshoot failed workflows

**Share these resources:**
- `.github/WORKFLOWS_QUICK_REFERENCE.md` - Quick reference guide
- `docs/WORKFLOWS.md` - Comprehensive documentation

---

## 🔄 Ongoing Maintenance

Schedule these maintenance tasks:

### Weekly
- [ ] Review failed workflow runs
- [ ] Check Dependabot alerts
- [ ] Review CodeQL security findings

### Monthly
- [ ] Update GitHub Actions versions
- [ ] Review and update dependencies
- [ ] Check for stale PRs

### Quarterly
- [ ] Review and update workflow configurations
- [ ] Update documentation
- [ ] Review branch protection rules

---

## ✨ Optional Enhancements

Consider adding these features:

- [ ] Slack/Discord notifications for deployments
- [ ] Performance monitoring integration
- [ ] Automatic npm publishing on release
- [ ] E2E testing workflow
- [ ] Visual regression testing
- [ ] Automated dependency updates
- [ ] Deployment rollback workflow
- [ ] Canary deployments

---

## 🆘 Troubleshooting

If you encounter issues:

1. **Workflows not running:**
   - Check repository permissions
   - Verify workflow files are in `.github/workflows/`
   - Check for YAML syntax errors

2. **Deployment failing:**
   - Verify secrets are set correctly
   - Check Cloudflare API token permissions
   - Review deployment logs

3. **Status checks not appearing in PRs:**
   - Ensure workflows have run at least once on main branch
   - Check branch protection rule settings
   - Verify status check names match exactly

4. **Environment URLs not working:**
   - Check Cloudflare Workers dashboard
   - Verify custom domain configuration
   - Check DNS settings

---

## 📞 Support

Need help?

- Review [WORKFLOWS.md](../docs/WORKFLOWS.md) for detailed documentation
- Check [WORKFLOWS_QUICK_REFERENCE.md](WORKFLOWS_QUICK_REFERENCE.md) for quick commands
- Review GitHub Actions logs in the Actions tab
- Contact: ckorhonen@gmail.com

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] All secrets configured
- [ ] Environments created and configured
- [ ] Branch protection rules enabled
- [ ] Labels created
- [ ] All workflows tested and passing
- [ ] Team trained on workflows
- [ ] Documentation updated
- [ ] README badges added
- [ ] First successful deployment to staging
- [ ] First successful deployment to production

**Setup completed on:** _______________

**Completed by:** _______________

---

**Last Updated:** 2025-01-19  
**Maintained By:** Chris Korhonen
