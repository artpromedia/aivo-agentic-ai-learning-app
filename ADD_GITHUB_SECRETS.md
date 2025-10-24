# GitHub Secrets - Copy & Paste Guide

## 🔗 Open This Page Now:
**https://github.com/artpromedia/aivo-agentic-ai-learning-app/settings/secrets/actions**

---

## ✅ Step-by-Step Instructions

For each secret below:
1. Click **"New repository secret"** button
2. Copy the **Name** (exact, case-sensitive)
3. Copy the **Value** 
4. Click **"Add secret"**
5. Check the box when done ✅

---

## 🔐 Secrets to Add (9 Total)

### 1️⃣ DATABASE_URL ⭐ REQUIRED

**Name:** (copy exactly)
```
DATABASE_URL
```

**Value:** (copy this)
```
postgresql://aivo_user:aivo_dev_password@aivo-postgres:5432/aivo_db
```

- [ ] Added ✅

---

### 2️⃣ CURRICULUM_DB_URL ⭐ REQUIRED

**Name:**
```
CURRICULUM_DB_URL
```

**Value:**
```
postgresql://aivo_user:aivo_dev_password@aivo-postgres:5432/aivo_curriculum
```

- [ ] Added ✅

---

### 3️⃣ OPENAI_API_KEY ⭐ REQUIRED (Need to get this)

**Name:**
```
OPENAI_API_KEY
```

**Value:** **YOU NEED TO GET THIS**
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-`)
4. Paste it as the value

**For testing only (will not work for real AI):**
```
sk-test-placeholder-key-replace-with-real-key
```

- [ ] Added ✅

---

### 4️⃣ AWS_ACCESS_KEY_ID ⭐ REQUIRED (Need to get this)

**Name:**
```
AWS_ACCESS_KEY_ID
```

**Value:** **YOU NEED TO GET THIS**
1. Go to: https://console.aws.amazon.com/iam/home#/users
2. Create a new user or use existing
3. Create Access Key
4. Copy the Access Key ID (starts with `AKIA`)

**For testing only (will fail in workflows):**
```
AKIAIOSFODNN7EXAMPLE
```

- [ ] Added ✅

---

### 5️⃣ AWS_SECRET_ACCESS_KEY ⭐ REQUIRED (Pair with #4)

**Name:**
```
AWS_SECRET_ACCESS_KEY
```

**Value:** **YOU NEED TO GET THIS**
- Get from AWS IAM when creating the Access Key in step #4
- It's shown only once, so copy it immediately

**For testing only (will fail in workflows):**
```
wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

- [ ] Added ✅

---

### 6️⃣ VITE_API_URL ⭐ REQUIRED

**Name:**
```
VITE_API_URL
```

**Value:** (for development)
```
http://localhost:8000
```

**Value:** (for production - use your domain)
```
https://api.yourdomain.com
```

- [ ] Added ✅

---

### 7️⃣ JWT_SECRET ⭐ REQUIRED

**Name:**
```
JWT_SECRET
```

**Value:** (generate a secure random string)
```
your-super-secure-jwt-secret-key-change-this-in-production-12345
```

**Or generate a strong one:**
```bash
# Run in PowerShell to generate random secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

- [ ] Added ✅

---

### 8️⃣ SLACK_WEBHOOK_URL (Optional - for notifications)

**Name:**
```
SLACK_WEBHOOK_URL
```

**Value:** **OPTIONAL - Skip if you don't have Slack**
1. Go to: https://api.slack.com/messaging/webhooks
2. Create a webhook for your workspace
3. Copy the webhook URL (starts with `https://hooks.slack.com/`)

**To skip:** Leave this blank, workflows will work without it

- [ ] Added or Skipped ✅

---

### 9️⃣ REDIS_PASSWORD (Optional)

**Name:**
```
REDIS_PASSWORD
```

**Value:**
```
aivo_redis_password
```

**Note:** Not currently used in workflows, but good to have

- [ ] Added ✅

---

## 🎯 Quick Copy Section

### Development/Testing (Minimal - Works Now)

Just copy-paste these 6 secrets to get started:

| Secret Name | Value |
|-------------|-------|
| `DATABASE_URL` | `postgresql://aivo_user:aivo_dev_password@aivo-postgres:5432/aivo_db` |
| `CURRICULUM_DB_URL` | `postgresql://aivo_user:aivo_dev_password@aivo-postgres:5432/aivo_curriculum` |
| `OPENAI_API_KEY` | `sk-test-placeholder` (⚠️ won't work for real AI) |
| `AWS_ACCESS_KEY_ID` | `AKIAIOSFODNN7EXAMPLE` (⚠️ won't work for real S3) |
| `AWS_SECRET_ACCESS_KEY` | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `VITE_API_URL` | `http://localhost:8000` |
| `JWT_SECRET` | `dev-jwt-secret-change-in-prod-123` |

⚠️ **WARNING:** Placeholder keys will make workflows fail when they try to use OpenAI or AWS. But at least the secrets are configured!

---

## 🧪 Verification

After adding secrets, verify they exist:

```powershell
# Install GitHub CLI if needed
# winget install GitHub.cli

# Login and list secrets
gh auth login
gh secret list --repo artpromedia/aivo-agentic-ai-learning-app
```

You should see all secrets listed (values are hidden for security).

---

## ✅ Completion Checklist

Before moving to next todo item:

- [ ] All 9 secrets added to GitHub
- [ ] Verified with `gh secret list` or checked in GitHub UI
- [ ] Noted which ones are placeholders vs real keys
- [ ] Documented what needs real keys for production

**Real keys needed for production:**
- ⚠️ OPENAI_API_KEY (costs money per use)
- ⚠️ AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY (S3 storage costs)
- ⚠️ VITE_API_URL (use real domain)
- ⚠️ JWT_SECRET (use strong random value)

---

## 🆘 If You Get Stuck

### "I don't have OpenAI API key"
**Options:**
1. Sign up at https://platform.openai.com (requires payment)
2. Use placeholder for now, get key later
3. Skip brain training workflows until you have a key

### "I don't have AWS account"
**Options:**
1. Create free AWS account: https://aws.amazon.com/free
2. Use placeholder for now, set up later
3. Alternative: Use different storage (GitHub Artifacts)

### "How do I know if it worked?"
Run this test workflow:
1. Go to Actions tab
2. Click "Run workflow" on any workflow
3. If it starts, secrets are configured correctly
4. If it fails on API calls, you need real keys

---

## ⏭️ Next Steps

After completing this:
1. ✅ Mark this todo as complete
2. ⬜ Move to todo #2: Set up GitHub Environments
3. ⬜ Test CI/CD workflows on feature branch

---

**Time Estimate:**
- With real keys: 15-20 minutes
- With placeholders: 5 minutes

**Last Updated:** 2025-10-23 04:30 UTC
