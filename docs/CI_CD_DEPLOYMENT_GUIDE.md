# AIVO CI/CD & Deployment Guide

## Overview

Complete CI/CD pipeline using GitHub Actions for automated testing, building, and deployment of the AIVO platform.

---

## GitHub Actions Workflows

### 1. Main CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers**: Push to `main`/`develop`, Pull Requests

**Jobs**:
- **Backend Testing**: PostgreSQL + Redis services, pytest with coverage
- **Frontend Linting**: ESLint + TypeScript checking
- **Frontend Build**: Build all 5 portal applications
- **Frontend Testing**: Vitest unit tests with coverage
- **Security Scanning**: Trivy (filesystem), Bandit (Python), npm audit
- **Docker Image Building**: Multi-service builds pushed to GHCR

**Features**:
- Parallel execution for speed
- Code coverage reports to Codecov
- Security scan results to GitHub Security
- Automated Docker image tagging

---

### 2. Database Migrations (`.github/workflows/migrations.yml`)

**Trigger**: Manual workflow dispatch

**Inputs**:
- `environment`: development | staging | production
- `action`: upgrade | downgrade | current
- `revision`: Target migration revision (optional)

**Usage**:
```bash
# Via GitHub UI
Actions → Database Migrations → Run workflow

# Via GitHub CLI
gh workflow run migrations.yml \
  -f environment=production \
  -f action=upgrade
```

---

### 3. Performance Testing (`.github/workflows/performance.yml`)

**Triggers**: Weekly (Sundays at midnight), Manual

**Features**:
- k6 load testing framework
- Staged load profile (10 → 50 users)
- Performance thresholds (p95 < 500ms, error rate < 1%)
- Automated results upload

**Test Stages**:
1. Ramp up to 10 users (2 min)
2. Sustain 10 users (5 min)
3. Ramp up to 50 users (2 min)
4. Sustain 50 users (5 min)
5. Ramp down (2 min)

---

### 4. Curriculum Import (`.github/workflows/curriculum-import.yml`)

**Trigger**: Manual workflow dispatch

**Inputs**:
- `source`: us_common_core | us_ngss | us_all_states | uk_national_curriculum | ib_all | all
- `environment`: development | staging | production

**Usage**:
```bash
gh workflow run curriculum-import.yml \
  -f source=us_common_core \
  -f environment=staging
```

**Timeout**: 120 minutes (2 hours)

---

### 5. Brain Training (`.github/workflows/train-brain.yml`)

**Trigger**: Manual workflow dispatch

**Inputs**:
- `model`: gpt-4-turbo | claude-3-opus | gemini-pro
- `version`: Model version tag (e.g., v1.0.0)
- `district`: Optional district ID for district-specific training

**Usage**:
```bash
gh workflow run train-brain.yml \
  -f model=gpt-4-turbo \
  -f version=v1.1.0 \
  -f district=district-123
```

**Features**:
- Up to 12-hour training runs
- Automatic model artifact upload
- S3 deployment (if configured)
- Training metadata tracking

**Timeout**: 720 minutes (12 hours)

---

## GitHub Secrets Configuration

### Required Secrets

Configure in: **Settings → Secrets and variables → Actions → New repository secret**

#### Database
```
DATABASE_URL              postgresql://user:password@host:5432/aivo_db
CURRICULUM_DB_URL         postgresql://user:password@host:5432/aivo_curriculum
```

#### AI Services
```
OPENAI_API_KEY           sk-...
ANTHROPIC_API_KEY        sk-ant-...
GOOGLE_AI_API_KEY        AIza...
```

#### AWS
```
AWS_ACCESS_KEY_ID        AKIA...
AWS_SECRET_ACCESS_KEY    ...
AWS_S3_BACKUP_BUCKET     aivo-backups
```

#### Application
```
JWT_SECRET               <64+ random characters>
REDIS_PASSWORD           <strong password>
```

#### Frontend
```
VITE_API_URL            https://api.aivo.app
```

#### Notifications
```
SLACK_WEBHOOK_URL       https://hooks.slack.com/services/...
```

### Environment-Specific Secrets

GitHub environments: `development`, `staging`, `production`

Each environment should have its own set of secrets with appropriate values.

---

## Deployment Scripts

### Production Deployment

**File**: `scripts/deploy-production.sh`

**Usage**:
```bash
# Deploy to production
./scripts/deploy-production.sh

# With custom env file
./scripts/deploy-production.sh .env.custom
```

**Process**:
1. Load environment variables
2. Show deployment checklist
3. Require manual confirmation
4. Create database backups
5. Pull latest code
6. Build Docker images
7. Run migrations
8. Stop services gracefully (30s timeout)
9. Deploy new services
10. Run health checks (10 retries)
11. Send Slack notification
12. Rollback on failure

**Requirements**:
- SSH access to production server
- `.env.production` file with:
  ```bash
  PRODUCTION_SERVER=user@production.aivo.app
  SLACK_WEBHOOK_URL=https://hooks.slack.com/...
  ```

---

### Database Backup

**File**: `scripts/backup-database.sh`

**Usage**:
```bash
# Run backup
./scripts/backup-database.sh

# With custom backup directory
BACKUP_DIR=/custom/path ./scripts/backup-database.sh

# With S3 upload
AWS_S3_BACKUP_BUCKET=aivo-backups ./scripts/backup-database.sh
```

**Features**:
- Backs up main database (`aivo_db`)
- Backs up curriculum database (`aivo_curriculum`)
- Compresses with gzip
- Shows backup sizes
- Cleans up backups older than 30 days
- Uploads to S3 (if configured)
- Creates backup manifest JSON
- Sends Slack notification

**Retention**: 30 days local, indefinite S3 (configure lifecycle rules)

---

## Local Testing

### Backend Tests

```bash
# Start test databases
docker-compose up -d postgres redis

# Run tests
cd services/api-gateway
pytest tests/ -v --cov=app

# With specific markers
pytest tests/ -m "unit" -v
pytest tests/ -m "assessment" -v
```

### Frontend Tests

```bash
cd apps/learner-app

# Run tests
pnpm test

# With coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

### Security Scanning

```bash
# Trivy filesystem scan
trivy fs .

# Bandit Python security
bandit -r services/api-gateway/app

# npm audit
cd apps/learner-app
pnpm audit
```

---

## Docker Image Management

### Building Images Locally

```bash
# Build specific service
docker build -t aivo-api-gateway:local services/api-gateway

# Build all services
docker-compose build
```

### Pulling from GHCR

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull image
docker pull ghcr.io/artpromedia/aivo-agentic-ai-learning-app/api-gateway:main
```

### Image Tags

- `main` - Latest stable from main branch
- `develop` - Latest from develop branch
- `main-abc123` - Commit SHA tag
- `pr-42` - Pull request preview

---

## Environment Variables

### Development

```bash
# .env.development
ENVIRONMENT=development
DATABASE_URL=postgresql://aivo_user:aivo_dev_password@localhost:5432/aivo_db
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=dev_secret_change_in_production
DEBUG=true
```

### Staging

```bash
# .env.staging
ENVIRONMENT=staging
DATABASE_URL=postgresql://aivo_user:***@staging-db:5432/aivo_db
REDIS_URL=redis://:***@staging-redis:6379/0
JWT_SECRET=<64-char-random-string>
DEBUG=false
```

### Production

```bash
# .env.production
ENVIRONMENT=production
DATABASE_URL=postgresql://aivo_user:***@prod-db:5432/aivo_db
REDIS_URL=redis://:***@prod-redis:6379/0
JWT_SECRET=<64-char-random-string>
DEBUG=false
SENTRY_DSN=https://...
```

---

## Monitoring & Alerts

### Health Checks

All services expose `/health` endpoint:

```bash
# API Gateway
curl https://api.aivo.app/health

# Response
{
  "status": "healthy",
  "service": "api-gateway",
  "version": "1.0.0",
  "environment": "production"
}
```

### Slack Notifications

Configure `SLACK_WEBHOOK_URL` for:
- ✅ Successful deployments
- ❌ Failed deployments
- 💾 Database backups
- 🧠 Model training completion

---

## Troubleshooting

### Build Failures

**Issue**: Docker build fails
```bash
# Check disk space
df -h

# Clean up Docker
docker system prune -af

# Rebuild with no cache
docker-compose build --no-cache
```

### Test Failures

**Issue**: Backend tests fail
```bash
# Check test database
docker-compose exec postgres psql -U test_user -d aivo_test_db

# Reset test database
docker-compose down -v
docker-compose up -d postgres redis
```

### Deployment Failures

**Issue**: Health check fails
```bash
# Check service logs
docker-compose logs -f api-gateway

# Check container status
docker-compose ps

# Manual rollback
git checkout HEAD~1
docker-compose down
docker-compose up -d
```

---

## Performance Benchmarks

### Expected Thresholds

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Response Time (p95) | < 200ms | < 500ms | > 1000ms |
| Response Time (p99) | < 500ms | < 1000ms | > 2000ms |
| Error Rate | < 0.1% | < 1% | > 5% |
| CPU Usage | < 50% | < 80% | > 90% |
| Memory Usage | < 60% | < 80% | > 90% |
| Database Connections | < 50 | < 80 | > 100 |

### Load Test Results

Target capacity:
- **10,000 concurrent learners**
- **1,000 requests/second**
- **99.9% uptime SLA**

---

## Rollback Procedures

### Automatic Rollback

Deployment script automatically rolls back on:
- Health check failure (10 retries)
- Service startup failure
- Migration failure

### Manual Rollback

```bash
# SSH to server
ssh production-server

# Stop services
cd /app/aivo
docker-compose down

# Rollback code
git checkout <previous-commit-sha>

# Restore database (if needed)
gunzip < /backups/aivo_db_20251022_120000.sql.gz | \
  docker-compose exec -T postgres psql -U aivo_user aivo_db

# Restart services
docker-compose up -d

# Verify
curl https://api.aivo.app/health
```

---

## CI/CD Metrics

### Build Times

- Linting & Type Check: ~3 minutes
- Backend Tests: ~5 minutes
- Frontend Tests: ~4 minutes per app (~20 minutes total)
- Security Scan: ~3 minutes
- Docker Build: ~10 minutes per service
- **Total Pipeline**: ~30-40 minutes

### Cost Optimization

- Use GitHub Actions cache for dependencies
- Parallel job execution
- Matrix strategy for multiple apps
- Conditional job execution (push only for builds)

---

## Best Practices

### Code Quality Gates

Before merging:
- ✅ All tests pass
- ✅ Code coverage > 70%
- ✅ No security vulnerabilities
- ✅ Linting passes
- ✅ Type checking passes

### Deployment Strategy

- **Feature branches** → `develop` → `staging` → `main` → `production`
- Use feature flags for gradual rollouts
- Deploy during low-traffic windows
- Always have rollback plan
- Monitor for 30 minutes post-deployment

### Database Migrations

- Always backup before migration
- Test migrations in staging first
- Use transactions when possible
- Have rollback migration ready
- Document breaking changes

---

## Support & Resources

- **CI/CD Dashboard**: https://github.com/artpromedia/aivo-agentic-ai-learning-app/actions
- **Docker Images**: https://github.com/orgs/artpromedia/packages
- **Security Alerts**: https://github.com/artpromedia/aivo-agentic-ai-learning-app/security

---

*Last Updated: October 22, 2025*
