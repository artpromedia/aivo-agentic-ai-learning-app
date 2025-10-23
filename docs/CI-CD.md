# AIVO CI/CD Pipeline Documentation

## Overview

The AIVO platform uses GitHub Actions for continuous integration and deployment across multiple environments.

## Pipeline Architecture

```
┌─────────────┐
│   Push to   │
│   GitHub    │
└──────┬──────┘
       │
       ├─────────────────────┬─────────────────┬──────────────────┐
       │                     │                 │                  │
┌──────▼─────────┐  ┌───────▼────────┐  ┌────▼──────────┐  ┌───▼───────┐
│  Backend Tests │  │ Frontend Tests │  │ Security Scan │  │   Lint    │
└──────┬─────────┘  └───────┬────────┘  └────┬──────────┘  └───┬───────┘
       │                     │                 │                  │
       └─────────────────────┴─────────────────┴──────────────────┘
                                    │
                          ┌─────────▼──────────┐
                          │   Build Images     │
                          └─────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼────────┐  ┌──▼───────┐  ┌───▼──────────┐
            │  Development   │  │ Staging  │  │ Production   │
            └────────────────┘  └──────────┘  └──────────────┘
```

## Environments

### Development
- **URL**: https://dev.aivo.app
- **Trigger**: Push to `develop` branch
- **Auto-deploy**: Yes
- **Approval**: Not required

### Staging
- **URL**: https://staging.aivo.app
- **Trigger**: Push to `main` branch
- **Auto-deploy**: Yes
- **Approval**: Not required
- **Purpose**: Pre-production testing

### Production
- **URL**: https://aivo.app
- **Trigger**: Manual after staging validation
- **Auto-deploy**: No (requires approval)
- **Approval**: Required (2 reviewers)

## Workflows

### 1. Main CI/CD Pipeline (`ci.yml`)

**Triggered on:**
- Push to `main`, `develop`, `feature/**`
- Pull requests

**Jobs:**
- Backend testing with PostgreSQL & Redis
- Frontend testing (all 5 apps)
- Security scanning (Trivy, Bandit)
- Docker image building
- Deployment to environments

**Artifacts:**
- Test coverage reports
- Docker images (GHCR)
- Build logs

### 2. Database Migrations (`migrations.yml`)

**Triggered on:** Manual dispatch

**Actions:**
- Run SQL migrations
- Verify migration success
- Support rollback

**Usage:**
```bash
# Via GitHub UI: Actions → Database Migrations → Run workflow
# Select: environment, action (upgrade/downgrade/current)
```

### 3. Performance Testing (`performance.yml`)

**Triggered on:**
- Weekly schedule (Sunday midnight)
- Manual dispatch

**Tests:**
- Load testing with k6
- API response times
- Database query performance
- Concurrent user simulation

### 4. Health Checks (`health-check.yml`)

**Triggered on:** Every 5 minutes

**Checks:**
- API Gateway health
- Frontend app availability
- Database connectivity
- Redis connection

**Alerts:**
- Slack notifications on failure
- Auto-create GitHub issue
- PagerDuty integration (production)

### 5. Rollback (`rollback.yml`)

**Triggered on:** Manual (emergency only)

**Process:**
1. Create rollback issue
2. Checkout target commit
3. Build and deploy
4. Verify health
5. Notify team

### 6. Deployment Notifications (`notify-deployment.yml`)

**Triggered on:** Deployment status changes

**Actions:**
- Send Slack notifications
- Include deployment details
- Track deployment history

## Branch Strategy

```
main (production-ready)
  ↑
  ├── develop (integration)
  │     ↑
  │     ├── feature/assessment-ui
  │     ├── feature/brain-cloning
  │     └── feature/curriculum-import
  │
  └── hotfix/critical-bug (emergency fixes)
```

### Branch Rules

**main:**
- Protected
- Requires 2 approvals
- All CI checks must pass
- No direct commits

**develop:**
- Protected
- Requires 1 approval
- All CI checks must pass

**feature/**:
- No restrictions
- Must be up-to-date with develop

## Deployment Process

### Standard Deployment (Staging → Production)

1. **Merge to main**
   ```bash
   git checkout develop
   git pull
   git checkout main
   git merge develop
   git push
   ```

2. **Automatic staging deployment**
   - CI/CD automatically deploys to staging
   - Wait for deployment to complete (~10 minutes)

3. **Staging validation**
   - Run smoke tests
   - Verify critical features
   - Check error logs

4. **Production deployment**
   - Go to Actions → CI/CD Pipeline
   - Approve production deployment
   - Monitor deployment progress

5. **Production verification**
   - Check health endpoints
   - Verify user flows
   - Monitor metrics

### Hotfix Deployment (Emergency)

1. **Create hotfix branch from main**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-issue
   # Make fix
   git commit -m "Fix critical issue"
   git push
   ```

2. **Expedited review**
   - Create PR to main
   - Fast-track review (1 approver)
   - Merge immediately

3. **Deploy**
   - Staging auto-deploys
   - Quick validation
   - Approve production

4. **Backport to develop**
   ```bash
   git checkout develop
   git cherry-pick <hotfix-commit>
   git push
   ```

## Secrets Management

### Required Secrets

**Infrastructure:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BACKUP_BUCKET`

**Databases:**
- `DATABASE_URL`
- `CURRICULUM_DB_URL`
- `REDIS_PASSWORD`

**AI Services:**
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_AI_API_KEY`

**Application:**
- `JWT_SECRET`
- `VITE_API_URL`

**Notifications:**
- `SLACK_WEBHOOK_URL`
- `SENDGRID_API_KEY`

### Adding Secrets

```bash
# Using GitHub CLI
gh secret set SECRET_NAME --body "secret-value"

# Or via UI
# Settings → Secrets and variables → Actions → New repository secret
```

## Monitoring & Alerts

### Health Checks
- **Frequency**: Every 5 minutes
- **Coverage**: All services
- **Action on failure**: Slack alert + GitHub issue

### Performance Monitoring
- **Frequency**: Weekly
- **Metrics**: Response times, throughput, errors
- **Threshold**: P95 < 500ms

### Deployment Notifications
- **Success**: Slack notification
- **Failure**: Slack alert + rollback trigger

## Rollback Procedures

### Automatic Rollback
Triggered automatically if:
- 3 consecutive health check failures
- Critical error rate > 10%
- Response time > 5 seconds

### Manual Rollback

**Via GitHub Actions:**
1. Actions → Emergency Rollback
2. Select environment
3. Enter reason
4. Run workflow

**Via Script:**
```bash
./scripts/auto-rollback.sh production
```

### Rollback Checklist
- [ ] Identify issue
- [ ] Determine rollback target
- [ ] Notify team
- [ ] Execute rollback
- [ ] Verify health
- [ ] Document incident
- [ ] Plan forward fix

## Troubleshooting

### Build Failures

**Backend tests fail:**
```bash
# Run locally
cd services/api-gateway
pytest tests/ -v
```

**Frontend tests fail:**
```bash
# Run locally
cd apps/learner-app
pnpm test
```

### Deployment Failures

**Health check fails:**
1. Check application logs
2. Verify database connectivity
3. Check Redis connection
4. Review recent changes

**Database migration fails:**
1. Review migration script
2. Check database state
3. Manual intervention may be needed
4. Contact DBA if needed

### Emergency Contacts

- **On-call Engineer**: Check PagerDuty
- **DevOps Lead**: [Contact info]
- **CTO**: [Contact info]

## Best Practices

1. **Always test locally first**
2. **Keep PRs small and focused**
3. **Write meaningful commit messages**
4. **Update tests with code changes**
5. **Monitor deployments actively**
6. **Document configuration changes**
7. **Use feature flags for risky changes**
8. **Communicate with team**

## Useful Commands

```bash
# Check workflow status
gh run list

# View specific run
gh run view <run-id>

# Trigger workflow
gh workflow run ci.yml

# List secrets
gh secret list

# View deployment logs
docker-compose logs -f api-gateway

# Manual rollback
./scripts/auto-rollback.sh production

# Run health check
curl https://api.aivo.app/health
```

## Performance Benchmarks

### API Response Times
- **P50**: < 100ms
- **P95**: < 500ms
- **P99**: < 1000ms

### Database Queries
- **Simple queries**: < 10ms
- **Complex queries**: < 100ms
- **Reports**: < 1000ms

### Frontend Load Times
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Total Bundle Size**: < 500KB

## Security Scanning

### Trivy (Filesystem)
- Scans Docker images
- Checks for vulnerabilities
- Uploads to GitHub Security tab

### Bandit (Python)
- Static security analysis
- Checks for common issues
- Configurable severity

### npm audit (JavaScript)
- Dependency vulnerability scanning
- Automatic fix suggestions
- Version compatibility checks

## Maintenance Windows

### Scheduled Maintenance
- **When**: First Sunday of each month, 2-4 AM UTC
- **Duration**: 2 hours
- **Notification**: 1 week advance notice

### Emergency Maintenance
- **When**: As needed for critical issues
- **Duration**: Variable
- **Notification**: Immediate via Slack

## Disaster Recovery

### Database Backups
- **Frequency**: Daily at 2 AM UTC
- **Retention**: 30 days
- **Location**: AWS S3
- **Encryption**: AES-256

### Restore Procedure
1. Identify backup to restore
2. Download from S3
3. Stop affected services
4. Restore database
5. Verify data integrity
6. Restart services

### RTO/RPO
- **Recovery Time Objective (RTO)**: 1 hour
- **Recovery Point Objective (RPO)**: 24 hours

---

Last updated: October 22, 2025
