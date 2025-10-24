# GitHub Secrets Configuration Guide

## Quick Access
🔗 **GitHub Secrets Page:** https://github.com/artpromedia/aivo-agentic-ai-learning-app/settings/secrets/actions

---

## Required Secrets (9 Total)

### 1. Database & Infrastructure

#### `DATABASE_URL` ⭐ **CRITICAL**
- **Purpose:** Main PostgreSQL connection for migrations and health checks
- **Format:** `postgresql://username:password@host:port/database`
- **Example:** `postgresql://aivo_user:aivo_dev_password@aivo-postgres:5432/aivo_db`
- **For Production:** Update host to your production database URL
- **Used by:** `.github/workflows/migrations.yml`, health checks

#### `CURRICULUM_DB_URL` ⭐ **CRITICAL**
- **Purpose:** Curriculum database for training and imports
- **Format:** `postgresql://username:password@host:port/database`
- **Example:** `postgresql://aivo_user:aivo_dev_password@aivo-postgres:5432/aivo_curriculum`
- **Note:** Can be same as DATABASE_URL for development
- **Used by:** `.github/workflows/curriculum-import.yml`, `.github/workflows/train-brain.yml`

---

### 2. AI Service API Keys

#### `OPENAI_API_KEY` ⭐ **CRITICAL**
- **Purpose:** OpenAI GPT models for AI Brain training
- **Format:** `sk-proj-...` (starts with `sk-proj-` or `sk-`)
- **Get it from:** https://platform.openai.com/api-keys
- **Required:** Yes - Brain training won't work without this
- **Used by:** `.github/workflows/train-brain.yml`

#### `ANTHROPIC_API_KEY`
- **Purpose:** Claude models (optional alternative to OpenAI)
- **Format:** `sk-ant-...` (starts with `sk-ant-`)
- **Get it from:** https://console.anthropic.com/settings/keys
- **Required:** No (optional fallback)
- **Used by:** `.github/workflows/train-brain.yml`

#### `GOOGLE_AI_API_KEY`
- **Purpose:** Gemini models (optional alternative)
- **Format:** Standard Google API key
- **Get it from:** https://makersuite.google.com/app/apikey
- **Required:** No (optional fallback)
- **Used by:** `.github/workflows/train-brain.yml`

---

### 3. AWS S3 Storage

#### `AWS_ACCESS_KEY_ID`
- **Purpose:** AWS credentials for storing brain model artifacts
- **Format:** `AKIA...` (20 characters)
- **Get it from:** AWS IAM Console → Users → Security Credentials
- **Required:** Yes for brain training (stores trained models)
- **Permissions needed:** s3:PutObject, s3:GetObject on your bucket
- **Used by:** `.github/workflows/train-brain.yml`

#### `AWS_SECRET_ACCESS_KEY`
- **Purpose:** AWS secret key (paired with Access Key ID)
- **Format:** 40-character alphanumeric string
- **Get it from:** AWS IAM (same place as Access Key ID)
- **Required:** Yes (paired with AWS_ACCESS_KEY_ID)
- **Keep secure:** Never commit this to code!
- **Used by:** `.github/workflows/train-brain.yml`

---

### 4. Frontend Configuration

#### `VITE_API_URL`
- **Purpose:** API endpoint URL for frontend builds
- **Format:** `https://api.yourdomain.com` or `http://localhost:8000`
- **Example (Dev):** `http://localhost:8000`
- **Example (Prod):** `https://api.aivolearning.com`
- **Note:** Change based on environment
- **Used by:** `.github/workflows/deploy.yml`

---

### 5. Notifications

#### `SLACK_WEBHOOK_URL` (Optional)
- **Purpose:** Send deployment/health notifications to Slack
- **Format:** `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`
- **Get it from:** Slack → Apps → Incoming Webhooks → Add to Slack
- **Required:** No (but recommended for production monitoring)
- **Used by:** `.github/workflows/health-check.yml`, `.github/workflows/notify-deployment.yml`, `.github/workflows/rollback.yml`
- **Setup:** https://api.slack.com/messaging/webhooks

---

## Setup Instructions

### Step 1: Open GitHub Secrets Page
```
https://github.com/artpromedia/aivo-agentic-ai-learning-app/settings/secrets/actions
```

### Step 2: Add Each Secret
1. Click **"New repository secret"**
2. Enter **Name** (exact match required, case-sensitive)
3. Enter **Value** (paste the actual secret value)
4. Click **"Add secret"**

### Step 3: Verification Checklist

Once added, you should see these secrets listed:

- [ ] `DATABASE_URL` - ⭐ **CRITICAL**
- [ ] `CURRICULUM_DB_URL` - ⭐ **CRITICAL**
- [ ] `OPENAI_API_KEY` - ⭐ **CRITICAL**
- [ ] `ANTHROPIC_API_KEY` - Optional
- [ ] `GOOGLE_AI_API_KEY` - Optional
- [ ] `AWS_ACCESS_KEY_ID` - ⭐ **CRITICAL**
- [ ] `AWS_SECRET_ACCESS_KEY` - ⭐ **CRITICAL**
- [ ] `VITE_API_URL` - ⭐ **CRITICAL**
- [ ] `SLACK_WEBHOOK_URL` - Optional

**Minimum Required (5):** DATABASE_URL, CURRICULUM_DB_URL, OPENAI_API_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, VITE_API_URL

---

## Quick Setup for Development/Testing

If you just want to test CI/CD workflows without real services:

```bash
# Minimum viable secrets for testing
DATABASE_URL=postgresql://aivo_user:aivo_dev_password@localhost:5432/aivo_db
CURRICULUM_DB_URL=postgresql://aivo_user:aivo_dev_password@localhost:5432/aivo_curriculum
OPENAI_API_KEY=sk-test-fake-key-for-testing-only
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
VITE_API_URL=http://localhost:8000
```

⚠️ **WARNING:** These are example values. Workflows will fail if you try to actually run training/deployments with fake keys.

---

## Environment-Specific Values

### Development
```bash
DATABASE_URL=postgresql://aivo_user:aivo_dev_password@localhost:5432/aivo_db
VITE_API_URL=http://localhost:8000
```

### Staging
```bash
DATABASE_URL=postgresql://aivo_user:staging_password@staging-db.example.com:5432/aivo_db
VITE_API_URL=https://staging-api.aivolearning.com
```

### Production
```bash
DATABASE_URL=postgresql://aivo_user:prod_password@prod-db.example.com:5432/aivo_db
VITE_API_URL=https://api.aivolearning.com
```

💡 **Tip:** Use GitHub Environments for different values per environment (see next step in todo list)

---

## Security Best Practices

### ✅ DO:
- Use strong, unique passwords for databases
- Rotate API keys regularly
- Use least-privilege AWS IAM policies
- Keep production secrets separate from dev/staging
- Use GitHub Environments for environment-specific secrets

### ❌ DON'T:
- Never commit secrets to git (even in `.env.example`)
- Don't share secrets in Slack/email
- Don't use the same password across environments
- Don't give AWS keys full admin access

---

## Troubleshooting

### Issue: Workflow fails with "Secret not found"
**Solution:** Check secret name is **exact match** (case-sensitive). Go to Actions → Failed workflow → Check logs for exact secret name used.

### Issue: Database connection fails in workflow
**Solution:** 
1. Verify DATABASE_URL format is correct
2. Check database is accessible from GitHub Actions runners
3. For production, ensure firewall allows GitHub Actions IPs

### Issue: OpenAI API calls fail
**Solution:**
1. Verify API key starts with `sk-proj-` or `sk-`
2. Check you have credits in OpenAI account
3. Verify key has access to GPT-4 if using advanced models

### Issue: AWS S3 upload fails
**Solution:**
1. Verify AWS credentials are correct
2. Check IAM user has `s3:PutObject` permission
3. Ensure S3 bucket exists and is in the right region
4. Verify bucket name in workflow files

---

## Which Workflows Use Which Secrets?

| Workflow | Secrets Required |
|----------|------------------|
| `ci.yml` | None (uses test values) |
| `migrations.yml` | DATABASE_URL |
| `curriculum-import.yml` | CURRICULUM_DB_URL |
| `train-brain.yml` | CURRICULUM_DB_URL, OPENAI_API_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY |
| `deploy.yml` | VITE_API_URL |
| `health-check.yml` | SLACK_WEBHOOK_URL (optional) |
| `notify-deployment.yml` | SLACK_WEBHOOK_URL (optional) |
| `rollback.yml` | SLACK_WEBHOOK_URL (optional) |

---

## Testing After Setup

### Test 1: Check Secrets Are Set
```bash
# This won't show values (good!), but will confirm they exist
gh secret list
```

### Test 2: Trigger a Simple Workflow
1. Go to Actions tab
2. Select "Health Check" workflow
3. Click "Run workflow"
4. Check if it completes successfully

### Test 3: Create Test PR
```bash
git checkout -b test/secrets-configured
git commit --allow-empty -m "test: verify CI/CD secrets"
git push origin test/secrets-configured
```
- Open PR on GitHub
- CI should run and pass
- If it fails, check logs for missing secrets

---

## Next Steps

After configuring secrets:

1. ✅ Complete this task (Configure GitHub Secrets)
2. ⬜ Set up GitHub Environments (next todo item)
3. ⬜ Test CI/CD workflows on feature branch
4. ⬜ Test end-to-end assessment flow
5. ⬜ Test deployment scripts in staging

---

## Quick Reference Table

| Secret Name | Required? | Where to Get | Cost |
|-------------|-----------|--------------|------|
| DATABASE_URL | ✅ Yes | Your PostgreSQL server | Free (self-hosted) |
| CURRICULUM_DB_URL | ✅ Yes | Your PostgreSQL server | Free (self-hosted) |
| OPENAI_API_KEY | ✅ Yes | https://platform.openai.com/api-keys | $$ Pay per use |
| ANTHROPIC_API_KEY | ⬜ No | https://console.anthropic.com | $$ Pay per use |
| GOOGLE_AI_API_KEY | ⬜ No | https://makersuite.google.com | $$ Pay per use |
| AWS_ACCESS_KEY_ID | ✅ Yes | AWS IAM Console | Free (S3 storage costs apply) |
| AWS_SECRET_ACCESS_KEY | ✅ Yes | AWS IAM Console | Free (S3 storage costs apply) |
| VITE_API_URL | ✅ Yes | Your API domain | Free |
| SLACK_WEBHOOK_URL | ⬜ No | Slack App Settings | Free |

---

## Estimated Setup Time

- **Minimum (testing only):** 5 minutes
- **Development (with real services):** 15 minutes
- **Production (with all security):** 30-45 minutes

---

## Need Help?

**GitHub Secrets Documentation:** https://docs.github.com/en/actions/security-guides/encrypted-secrets

**OpenAI API Keys:** https://platform.openai.com/docs/quickstart
**AWS IAM Setup:** https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html
**Slack Webhooks:** https://api.slack.com/messaging/webhooks

---

*Last Updated: 2025-10-23*
*Part of: PROMPT 61 Assessment System - CI/CD Configuration*
