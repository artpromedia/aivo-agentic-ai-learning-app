# GitHub Environments Setup Guide

## 🔗 Quick Access
**GitHub Environments Page:** https://github.com/artpromedia/aivo-agentic-ai-learning-app/settings/environments

---

## 📋 What You'll Create

3 environments with increasing protection levels:
1. **development** - Fast iteration, no approvals
2. **staging** - Pre-production testing, 1 approval
3. **production** - Live system, 2 approvals + wait timer

---

## 🚀 Step-by-Step Instructions

### Environment 1: development

**Step 1:** Click **"New environment"** button

**Step 2:** Enter environment name
```
development
```

**Step 3:** Click **"Configure environment"**

**Step 4:** Configure protection rules

**Deployment branches:**
- ✅ Select: "Selected branches and tags"
- Click "Add deployment branch or tag rule"
- Add rule: `main`
- Add rule: `develop`
- Add rule: `feature/*`

**Required reviewers:**
- ⬜ Leave unchecked (no approvals needed for dev)

**Wait timer:**
- ⬜ Leave unchecked (deploy immediately)

**Environment secrets:**
- ⬜ None needed (will use repository secrets)

**Step 5:** Click **"Save protection rules"**

✅ **development** environment created!

---

### Environment 2: staging

**Step 1:** Click **"New environment"** button

**Step 2:** Enter environment name
```
staging
```

**Step 3:** Click **"Configure environment"**

**Step 4:** Configure protection rules

**Deployment branches:**
- ✅ Select: "Selected branches and tags"
- Add rule: `main`
- Add rule: `release/*`

**Required reviewers:**
- ✅ Check "Required reviewers"
- Add yourself or a team member (1 reviewer)

**Wait timer:**
- ⬜ Leave unchecked

**Environment secrets (OPTIONAL - for later):**
You can add staging-specific secrets:
- `DATABASE_URL` → Your staging database URL
- `VITE_API_URL` → https://staging-api.yourdomain.com

*Note: Skip these for now, use repository secrets*

**Step 5:** Click **"Save protection rules"**

✅ **staging** environment created!

---

### Environment 3: production

**Step 1:** Click **"New environment"** button

**Step 2:** Enter environment name
```
production
```

**Step 3:** Click **"Configure environment"**

**Step 4:** Configure protection rules

**Deployment branches:**
- ✅ Select: "Selected branches and tags"
- Add rule: `main` (ONLY main branch can deploy to production)

**Required reviewers:**
- ✅ Check "Required reviewers"
- Add 2 reviewers (yourself + another team member if available)
- If solo: Add yourself twice or just 1 reviewer

**Wait timer:**
- ✅ Check "Wait timer"
- Set to: `5` minutes
- This gives you time to cancel accidental deployments

**Prevent self-review:**
- ✅ Check this if you have multiple team members

**Environment secrets (IMPORTANT - for later):**
For production, you SHOULD override with production values:

| Secret Name | Production Value (Example) |
|-------------|---------------------------|
| `DATABASE_URL` | `postgresql://aivo_user:PROD_PASS@prod-db.example.com:5432/aivo_db` |
| `VITE_API_URL` | `https://api.yourdomain.com` |
| `JWT_SECRET` | *Generate new strong secret* |

*Note: Use development values for now, update before actual production deployment*

**Step 5:** Click **"Save protection rules"**

✅ **production** environment created!

---

## ✅ Verification Checklist

After setup, verify you see all 3 environments:

- [ ] **development** - No protection, multiple branch patterns
- [ ] **staging** - 1 required reviewer, limited branches
- [ ] **production** - 2 required reviewers, 5 min wait, main only

---

## 🎯 How Workflows Will Use These

### Example: migrations.yml workflow

```yaml
jobs:
  run-migration:
    environment: ${{ inputs.environment }}  # Can be: development, staging, or production
    runs-on: ubuntu-latest
```

**When you run this workflow:**
1. Select environment from dropdown
2. If `development` → Runs immediately
3. If `staging` → Waits for 1 approval
4. If `production` → Waits for 2 approvals + 5 minutes

---

## 📊 Protection Level Summary

| Feature | Development | Staging | Production |
|---------|-------------|---------|------------|
| **Branches allowed** | main, develop, feature/* | main, release/* | main only |
| **Required reviewers** | 0 | 1 | 2 |
| **Wait timer** | 0 min | 0 min | 5 min |
| **Use case** | Testing, dev work | Pre-prod validation | Live deployments |
| **Speed** | ⚡ Instant | 🏃 Fast | 🐢 Careful |

---

## 🔒 Security Benefits

### Development
- ✅ Fast iteration for developers
- ✅ Test CI/CD changes quickly
- ⚠️ Not for production data

### Staging
- ✅ Catches issues before production
- ✅ One approval = peer review
- ✅ Safe testing environment

### Production
- ✅ Two approvals = double-check safety
- ✅ 5-minute wait = time to cancel mistakes
- ✅ Main branch only = stable code
- ✅ Prevents accidental deployments

---

## 🛠️ Advanced: Environment-Specific Secrets

### When to Override Secrets

**Use repository secrets when:**
- All environments use same values
- Development/testing setup
- Simple configuration

**Use environment secrets when:**
- Different databases per environment
- Different API endpoints per environment
- Different API keys per environment

### Example: Production Overrides

In **production** environment, add these secrets to override repository defaults:

```bash
# Production Database (different from dev)
DATABASE_URL=postgresql://aivo_prod_user:STRONG_PASSWORD@prod-db.example.com:5432/aivo_prod_db

# Production API (real domain)
VITE_API_URL=https://api.aivolearning.com

# Production JWT (different from dev)
JWT_SECRET=<generate-new-64-char-secret>

# Production AWS (different account)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Production OpenAI (different key for billing)
OPENAI_API_KEY=sk-proj-...
```

---

## 🧪 Testing Your Setup

### Test 1: View Environments
```bash
# List all environments
gh api repos/artpromedia/aivo-agentic-ai-learning-app/environments | jq -r '.environments[].name'
```

Should show:
```
development
staging
production
```

### Test 2: Run a Workflow with Environment

1. Go to **Actions** tab
2. Select **"Database Migration"** workflow
3. Click **"Run workflow"**
4. Select environment: `development`
5. Click **"Run workflow"**
6. Should run immediately (no approval needed)

### Test 3: Test Staging Approval

1. Same as Test 2, but select `staging`
2. Workflow will pause waiting for approval
3. You'll see "Review pending" status
4. Click "Review deployments" → Approve
5. Workflow continues

---

## 📝 Branch Patterns Explained

### What are branch patterns?

They control which git branches can deploy to each environment.

**Examples:**
- `main` - Only the main branch
- `develop` - Only the develop branch
- `feature/*` - Any branch starting with "feature/"
  - Matches: `feature/add-login`, `feature/fix-bug`
  - Doesn't match: `bugfix/something`
- `release/*` - Any branch starting with "release/"
  - Matches: `release/v1.0`, `release/2025-01`

---

## ⏱️ Time Estimate

- **Basic setup (3 environments, no secrets):** 5 minutes
- **With environment-specific secrets:** 15 minutes
- **With team member approvals setup:** 20 minutes

---

## 🚨 Common Issues

### Issue: "You must be an admin to create environments"
**Solution:** You need admin access to the repository. Contact repo owner.

### Issue: "No reviewers available"
**Solution:** For now, add yourself as reviewer. Update when team grows.

### Issue: "Branch pattern not working"
**Solution:** 
- Use `feature/*` not `feature*`
- Branch patterns are case-sensitive
- Test with actual branch names

### Issue: "Workflow doesn't ask for approval"
**Solution:**
- Check workflow file has `environment:` field
- Verify environment name matches exactly
- Refresh the environments page

---

## 🎓 Best Practices

### ✅ DO:
- Use descriptive environment names (lowercase)
- Require reviews for staging and production
- Use branch patterns to control access
- Add wait timer to production (5-10 minutes)
- Document environment-specific secrets

### ❌ DON'T:
- Don't allow all branches in production
- Don't skip reviewers (defeats the purpose)
- Don't use same secrets for all environments
- Don't forget to update secrets before prod deploy

---

## 📖 Learn More

**GitHub Docs:**
- Environments: https://docs.github.com/en/actions/deployment/targeting-different-environments
- Protection rules: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#environment-protection-rules
- Secrets: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#environment-secrets

---

## ⏭️ Next Steps

After completing this:

1. ✅ Mark todo #2 as complete
2. ⬜ Move to todo #5: Test CI/CD workflows on feature branch
3. ⬜ Create test branch and trigger workflows
4. ⬜ Verify environment approvals work

---

## 🎉 Summary

**What you created:**
- 3 environments (dev, staging, prod)
- Branch protection rules
- Approval requirements (0, 1, 2)
- Wait timer for production safety

**What you can now do:**
- Deploy to different environments safely
- Require approvals before production deployments
- Test changes in staging before production
- Prevent accidental production deployments

**Time to complete:** 5-10 minutes

---

*Last Updated: 2025-10-23*
*Part of: PROMPT 61 Assessment System - CI/CD Configuration*
