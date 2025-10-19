# GitHub Configuration

This directory contains all GitHub-specific configuration including workflows, documentation, and templates.

## 📂 Structure

```
.github/
├── workflows/              # GitHub Actions workflows
├── README.md              # This file
├── WORKFLOWS_SUMMARY.md   # Complete overview of all workflows
├── WORKFLOWS_QUICK_REFERENCE.md  # Quick commands and tips
└── SETUP_CHECKLIST.md     # Step-by-step setup guide
```

## 🚀 Quick Links

### Getting Started
- **New to the workflows?** → Start with [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- **Need quick commands?** → See [WORKFLOWS_QUICK_REFERENCE.md](WORKFLOWS_QUICK_REFERENCE.md)
- **Want the full picture?** → Read [WORKFLOWS_SUMMARY.md](WORKFLOWS_SUMMARY.md)

### Detailed Documentation
- **Complete workflow docs** → [docs/WORKFLOWS.md](../docs/WORKFLOWS.md)
- **Workflow files** → [workflows/](workflows/)

## 📋 Workflow Overview

| Workflow | Purpose | Trigger |
|----------|---------|---------|
| [ci.yml](workflows/ci.yml) | Continuous Integration | Push/PR to main/develop |
| [deploy.yml](workflows/deploy.yml) | Deploy to Cloudflare | Push to main (staging), tags (prod) |
| [pr-checks.yml](workflows/pr-checks.yml) | PR automation | PRs to main/develop |
| [codeql.yml](workflows/codeql.yml) | Security scanning | Push/PR, weekly |
| [dependency-review.yml](workflows/dependency-review.yml) | Dependency security | PRs to main/develop |
| [stale.yml](workflows/stale.yml) | Stale issue/PR management | Daily schedule |
| [release.yml](workflows/release.yml) | Release automation | Version tags |
| [labeler.yml](workflows/labeler.yml) | Auto-labeling config | Referenced by pr-checks |

## ⚡ Quick Commands

### Run checks locally
```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Test
npm test
```

### Deploy
```bash
# Deploy to staging (push to main)
git push origin main

# Deploy to production (create tag)
git tag v1.0.0 && git push origin v1.0.0
```

### Create a PR
```bash
git checkout -b feat/my-feature
git commit -m "feat(scope): description"
git push origin feat/my-feature
gh pr create
```

## 🔐 Required Configuration

Before workflows can run properly:

1. **Secrets** (Settings → Secrets → Actions)
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

2. **Environments** (Settings → Environments)
   - `staging`
   - `production`

3. **Branch Protection** (Settings → Branches)
   - Enable for `main` branch
   - Require status checks

See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for complete setup instructions.

## 📊 Workflow Status

You can view the status of all workflows in the [Actions tab](../../actions).

### Add badges to your README

```markdown
![CI](https://github.com/ckorhonen/x402-dev/workflows/CI/badge.svg)
![Deploy](https://github.com/ckorhonen/x402-dev/workflows/Deploy%20to%20Cloudflare%20Workers/badge.svg)
![CodeQL](https://github.com/ckorhonen/x402-dev/workflows/CodeQL%20Security%20Analysis/badge.svg)
```

## 🎯 Best Practices

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
type(scope): description

feat(api): add payment endpoint
fix(auth): resolve token expiration
docs(readme): update installation steps
```

### Pull Requests
- Keep PRs small (< 500 lines)
- Write descriptive titles
- Fill out PR template
- Wait for CI to pass
- Respond to review comments

### Deployments
- Test in staging first
- Use semantic versioning
- Write release notes
- Monitor after deployment

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## 🆘 Help

Need assistance?
- Check [WORKFLOWS_QUICK_REFERENCE.md](WORKFLOWS_QUICK_REFERENCE.md)
- Review [docs/WORKFLOWS.md](../docs/WORKFLOWS.md)
- Check the Actions tab for logs
- Contact: ckorhonen@gmail.com

---

**Last Updated:** 2025-01-19  
**Maintained By:** Chris Korhonen
