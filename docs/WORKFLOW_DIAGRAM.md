# Workflow Diagrams

Visual representation of the GitHub Actions workflows for x402-dev.

## Complete CI/CD Pipeline

```
                                 ┌─────────────────┐
                                 │  Code Changes   │
                                 └────────┬────────┘
                                          │
                     ┌────────────────────┼────────────────────┐
                     │                    │                    │
                     v                    v                    v
            ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
            │ Feature Branch │   │  Main Branch   │   │  Version Tag   │
            │   (new code)   │   │  (merged PRs)  │   │   (release)    │
            └────────┬───────┘   └────────┬───────┘   └────────┬───────┘
                     │                    │                    │
                     v                    v                    v
            ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
            │  Pull Request  │   │   Push Main    │   │  Push v1.0.0   │
            └────────┬───────┘   └────────┬───────┘   └────────┬───────┘
                     │                    │                    │
                     │                    │                    │
        ┌────────────┴────────────┐      │           ┌────────┴────────┐
        │                         │      │           │                 │
        v                         v      v           v                 v
┌───────────────┐        ┌───────────────┐      ┌──────────┐   ┌──────────┐
│   PR Checks   │        │      CI       │      │  Deploy  │   │ Release  │
└───────┬───────┘        └───────┬───────┘      │ Workflow │   │ Workflow │
        │                        │               └────┬─────┘   └────┬─────┘
        │                        │                    │              │
        v                        v                    v              v
┌───────────────┐        ┌───────────────┐      ┌──────────┐   ┌──────────┐
│ • Auto Label  │        │ • Type Check  │      │  Staging │   │ Prod     │
│ • Size Check  │        │ • ESLint      │      │  Deploy  │   │ Deploy   │
│ • Title Check │        │ • Prettier    │      └──────────┘   │          │
│ • CI Comment  │        │ • Tests       │                     │ + Release│
└───────────────┘        │ • Build       │                     │ + Changelog
                         │ • Security    │                     └──────────┘
                         └───────────────┘
```

---

## Detailed CI Workflow

```
┌──────────────────────────────────────────────────────────────────────┐
│                           CI Workflow                                 │
│                     (runs on push/PR to main)                        │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
                             v
                    ┌────────────────┐
                    │    Install     │
                    │  Dependencies  │
                    │   & Cache      │
                    └────────┬───────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          v                  v                  v
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │   Type   │      │  ESLint  │      │ Prettier │
    │  Check   │      │  (lint)  │      │ (format) │
    └────┬─────┘      └────┬─────┘      └────┬─────┘
         │                 │                  │
         └────────┬────────┴────────┬─────────┘
                  │                 │
                  v                 v
           ┌──────────┐      ┌──────────┐
           │  Tests   │      │ Security │
           │   +      │      │  Audit   │
           │ Coverage │      └──────────┘
           └────┬─────┘
                │
                v
         ┌──────────────┐
         │    Build     │
         │   Project    │
         └──────┬───────┘
                │
                v
         ┌──────────────┐
         │ CI Success ✅ │
         └──────────────┘
```

---

## Deployment Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      Deployment Flow                          │
└────────────────────────┬─────────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            v                         v
    ┌───────────────┐         ┌───────────────┐
    │  Push to Main │         │ Push Version  │
    │               │         │     Tag       │
    └───────┬───────┘         └───────┬───────┘
            │                         │
            v                         v
    ┌────────────────┐        ┌────────────────┐
    │ Pre-deployment │        │ Pre-deployment │
    │    Checks      │        │    Checks      │
    │   (CI runs)    │        │   (CI runs)    │
    └───────┬────────┘        └───────┬────────┘
            │                         │
            ✓                         ✓
            v                         v
    ┌────────────────┐        ┌────────────────┐
    │   Deploy to    │        │   Deploy to    │
    │    Staging     │        │   Production   │
    │                │        │   (requires    │
    │ x402-dev-      │        │    approval)   │
    │ staging        │        │                │
    │ .workers.dev   │        │   x402.dev     │
    └────────────────┘        └───────┬────────┘
                                      │
                                      v
                              ┌────────────────┐
                              │ Create GitHub  │
                              │    Release     │
                              │ + Changelog    │
                              └────────────────┘
```

---

## Pull Request Checks Flow

```
┌────────────────────────────────────────────────────────────┐
│                    PR Opened/Updated                        │
└──────────────────────┬─────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          v            v            v
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │   Auto   │ │   Size   │ │  Title   │
   │  Label   │ │  Check   │ │  Format  │
   │          │ │          │ │   Check  │
   └────┬─────┘ └────┬─────┘ └────┬─────┘
        │            │            │
        v            v            v
   ┌────────────────────────────────┐
   │   Apply Labels:                │
   │   • dependencies               │
   │   • typescript                 │
   │   • size/M                     │
   └────────────┬───────────────────┘
                │
                v
   ┌────────────────────────────────┐
   │      Run Full CI Checks        │
   │    (parallel execution)        │
   └────────────┬───────────────────┘
                │
                v
   ┌────────────────────────────────┐
   │   Post Comment on PR:          │
   │                                │
   │   | Check      | Status |      │
   │   |------------|--------|      │
   │   | TypeScript | ✅     |      │
   │   | ESLint     | ✅     |      │
   │   | Prettier   | ✅     |      │
   │   | Tests      | ✅     |      │
   │   | Build      | ✅     |      │
   └────────────────────────────────┘
```

---

## Security Scanning Timeline

```
┌─────────────────────────────────────────────────────────────┐
│                   Security Workflows                         │
└─────────────────────────────────────────────────────────────┘

Continuous (on every push/PR):
├── Dependency Review
│   └── Checks new dependencies for vulnerabilities
│
├── npm audit
│   └── Scans for known vulnerabilities in existing deps
│
└── Secret Scanning (GitHub native)
    └── Prevents committing secrets

Weekly (Monday 6:00 AM UTC):
└── CodeQL Analysis
    ├── Scans JavaScript/TypeScript code
    ├── Finds security vulnerabilities
    ├── Checks code quality issues
    └── Results appear in Security tab

Daily (1:00 AM UTC):
└── Stale Issue/PR Management
    ├── Marks stale issues (60+ days)
    ├── Marks stale PRs (30+ days)
    └── Auto-closes after warning period
```

---

## Release Process

```
┌───────────────────────────────────────────────────────────────┐
│               Release Process (Semantic Versioning)            │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        v
                ┌───────────────┐
                │  Developer    │
                │  creates tag  │
                │               │
                │ git tag v1.2.0│
                └───────┬───────┘
                        │
                        v
                ┌───────────────┐
                │  Release      │
                │  Workflow     │
                │  Triggers     │
                └───────┬───────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
            v           v           v
    ┌────────────┐ ┌────────┐ ┌──────────┐
    │   Build    │ │Generate│ │  Deploy  │
    │  Project   │ │Changelog│ │Production│
    └─────┬──────┘ └────┬───┘ └────┬─────┘
          │             │          │
          └──────┬──────┴──────┬───┘
                 │             │
                 v             v
         ┌─────────────────────────┐
         │   Create GitHub Release │
         │   • Version number      │
         │   • Changelog           │
         │   • Installation info   │
         │   • Deployment details  │
         └─────────────┬───────────┘
                       │
                       v
               ┌───────────────┐
               │ Update        │
               │ CHANGELOG.md  │
               │ (commit back) │
               └───────────────┘
```

---

## Developer Daily Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  Typical Developer Workflow                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            v
                  ┌─────────────────┐
                  │ 1. Create       │
                  │    Feature      │
                  │    Branch       │
                  └────────┬────────┘
                           │
                           v
                  ┌─────────────────┐
                  │ 2. Write Code   │
                  │    & Tests      │
                  └────────┬────────┘
                           │
                           v
                  ┌─────────────────┐
                  │ 3. Run Local    │
                  │    Checks       │
                  │  • npm run lint │
                  │  • npm test     │
                  └────────┬────────┘
                           │
                           v
                  ┌─────────────────┐
                  │ 4. Commit with  │
                  │    Conventional │
                  │    Format       │
                  └────────┬────────┘
                           │
                           v
                  ┌─────────────────┐
                  │ 5. Push &       │
                  │    Create PR    │
                  └────────┬────────┘
                           │
                           v
                  ┌─────────────────┐
                  │ 6. Automated    │
                  │    Checks Run   │
                  │  • Labels added │
                  │  • CI runs      │
                  │  • Comment posted│
                  └────────┬────────┘
                           │
                           v
                  ┌─────────────────┐
                  │ 7. Address      │
                  │    Review       │
                  │    Feedback     │
                  └────────┬────────┘
                           │
                           v
                  ┌─────────────────┐
                  │ 8. Merge PR     │
                  │    to Main      │
                  └────────┬────────┘
                           │
                           v
                  ┌─────────────────┐
                  │ 9. Auto-deploy  │
                  │    to Staging   │
                  └────────┬────────┘
                           │
                           v
                  ┌─────────────────┐
                  │ 10. Test on     │
                  │     Staging     │
                  └────────┬────────┘
                           │
                    Ready for prod? Yes
                           │
                           v
                  ┌─────────────────┐
                  │ 11. Create      │
                  │     Release Tag │
                  │  git tag v1.0.0 │
                  └────────┬────────┘
                           │
                           v
                  ┌─────────────────┐
                  │ 12. Auto-deploy │
                  │     to Prod +   │
                  │     Release     │
                  └─────────────────┘
```

---

## Workflow Success Criteria

### ✅ CI Workflow Passes When:
- TypeScript compiles without errors
- ESLint finds no linting issues
- Code is properly formatted (Prettier)
- All tests pass with minimum coverage
- Project builds successfully
- No high/critical security vulnerabilities

### ✅ PR Can Be Merged When:
- All CI checks pass
- Title follows conventional commit format
- Code review approved (if required)
- Branch is up to date with base
- Conversations are resolved

### ✅ Deployment Succeeds When:
- Pre-deployment CI checks pass
- Cloudflare secrets are configured
- Wrangler configuration is valid
- Build artifacts are created
- Cloudflare Workers deployment succeeds

### ✅ Release Is Created When:
- Version tag is pushed (format: v*.*.*)
- Build succeeds
- Changelog is generated
- GitHub Release is created
- Production deployment completes

---

## Parallel Job Execution

Many jobs run in parallel to save time:

```
Install Dependencies (Job 1)
        │
        ├───────┬───────┬───────┬───────┬───────┐
        │       │       │       │       │       │
        v       v       v       v       v       v
    TypeCheck  Lint  Format  Test  Build  Security
     ~1min   ~1min  ~30s   ~2min  ~2min  ~1min
        │       │       │       │       │       │
        └───────┴───────┴───────┴───────┴───────┘
                        │
                        v
                  CI Success
                   ~3-4min total
```

Without parallelization: ~8-9 minutes
With parallelization: ~3-4 minutes
**Time saved: ~50-60%**

---

## Repository Protection

```
┌─────────────────────────────────────────────────────────┐
│                  Branch: main                            │
│                  (protected)                             │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         v                         v
┌─────────────────┐       ┌─────────────────┐
│  Pull Request   │       │  Direct Push    │
│   Required      │       │   ❌ Blocked    │
└────────┬────────┘       └─────────────────┘
         │
         v
┌─────────────────┐
│ Status Checks   │
│   Required:     │
│ • CI Success    │
│ • TypeCheck     │
│ • ESLint        │
│ • Tests         │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Code Review     │
│  Required: 1    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Conversations   │
│  Must Resolve   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Merge Allowed ✅ │
└─────────────────┘
```

---

For more details, see:
- [Complete Documentation](WORKFLOWS.md)
- [Quick Reference](../.github/WORKFLOWS_QUICK_REFERENCE.md)
- [Setup Checklist](../.github/SETUP_CHECKLIST.md)
