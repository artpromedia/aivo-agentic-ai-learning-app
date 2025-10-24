# AIVO Setup Guide - Quick Start

**Goal**: Get PROMPT 58 (CI/CD) and PROMPT 61 (Assessment System) running in 1 hour.

---

## 📋 **Checklist**

- [ ] Configure GitHub Secrets (30 min)
- [ ] Set up GitHub Environments (10 min)
- [ ] Run Database Migration (5 min)
- [ ] Test CI/CD Workflow (15 min)
- [ ] Test Assessment System (30 min)

---

## 🔐 **Step 1: Configure GitHub Secrets** (30 minutes)

### **Navigate to Secrets Settings**
1. Go to: https://github.com/artpromedia/aivo-agentic-ai-learning-app/settings/secrets/actions
2. Click **"New repository secret"** for each secret below

### **Required Secrets (12 total)**

#### **1. DATABASE_URL** 
```
postgresql://aivo_user:your_password@localhost:5432/aivo_db
```
- Replace `your_password` with your PostgreSQL password
- Replace `localhost` if using remote database
- Click **Add secret**

#### **2. CURRICULUM_DB_URL**
```
postgresql://aivo_user:your_password@localhost:5432/aivo_curriculum
```
- Same credentials as DATABASE_URL
- Different database name

#### **3. REDIS_PASSWORD**
```
your_redis_password
```
- Your Redis authentication password
- If Redis has no password, use empty string: ``

#### **4. OPENAI_API_KEY**
```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Get from: https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy the key (starts with `sk-proj-` or `sk-`)

#### **5. ANTHROPIC_API_KEY**
```
sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Get from: https://console.anthropic.com/settings/keys
- Click "Create Key"
- Copy the key (starts with `sk-ant-`)

#### **6. GOOGLE_AI_API_KEY**
```
AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Get from: https://makersuite.google.com/app/apikey
- Click "Create API Key"
- Copy the key

#### **7. AWS_ACCESS_KEY_ID**
```
AKIAIOSFODNN7EXAMPLE
```
- Get from AWS IAM console
- Create new access key for S3 backups
- Or skip if not using S3 backups yet

#### **8. AWS_SECRET_ACCESS_KEY**
```
wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```
- Generated with AWS_ACCESS_KEY_ID
- Keep this secret safe!

#### **9. AWS_S3_BACKUP_BUCKET**
```
aivo-backups-prod
```
- Your S3 bucket name for database backups
- Or skip if not using S3 yet

#### **10. JWT_SECRET**
```
your-super-secret-jwt-key-change-this-in-production
```
- Generate a random string (32+ characters)
- **PowerShell command to generate**:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

#### **11. VITE_API_URL**
```
http://localhost:8000
```
- For local development
- For production, use: `https://api.aivoai.com`
- For staging, use: `https://staging-api.aivoai.com`

#### **12. SLACK_WEBHOOK_URL** (Optional)
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```
- Get from: https://api.slack.com/messaging/webhooks
- Click "Create your Slack app"
- Enable "Incoming Webhooks"
- Copy webhook URL
- **Or skip if not using Slack notifications yet**

---

## 🌍 **Step 2: Set Up GitHub Environments** (10 minutes)

### **Create Environments**
1. Go to: https://github.com/artpromedia/aivo-agentic-ai-learning-app/settings/environments
2. Click **"New environment"**

### **Create 3 Environments**

#### **Environment 1: development**
- Name: `development`
- Protection rules: None
- Click **Configure environment**
- No additional settings needed
- Click **Save protection rules**

#### **Environment 2: staging**
- Name: `staging`
- Protection rules: None (auto-deploy from main branch)
- Click **Configure environment**
- Click **Save protection rules**

#### **Environment 3: production**
- Name: `production`
- Protection rules:
  - ✅ **Required reviewers**: Add 2 reviewers
  - ✅ **Wait timer**: 0 minutes (or add delay if desired)
- Click **Configure environment**
- Add yourself and another team member as reviewers
- Click **Save protection rules**

---

## 🗄️ **Step 3: Run Database Migration** (5 minutes)

### **Option A: Using Docker (Recommended)**

```powershell
# Start PostgreSQL if not running
cd C:\Users\ofema\aivo-learning
docker-compose up -d postgres

# Wait 10 seconds for database to be ready
Start-Sleep -Seconds 10

# Run migration
docker-compose exec -T postgres psql -U aivo_user -d aivo_db -f /migrations/008_assessment_system_complete.sql
```

### **Option B: Using psql directly**

```powershell
# If you have psql installed locally
cd C:\Users\ofema\aivo-learning
psql -U aivo_user -d aivo_db -f services\ai-inference-service\migrations\008_assessment_system_complete.sql
```

### **Verify Migration**

```powershell
# Check tables were created
docker-compose exec postgres psql -U aivo_user -d aivo_db -c "\dt"

# Should show 9 new tables:
# - assessment_schedules
# - assessment_responses
# - assessment_results
# - subject_assessments
# - subject_questions
# - subject_results
# - brain_adaptations
# - assessment_notifications
# - assessment_configs
```

---

## 🧪 **Step 4: Test CI/CD Workflow** (15 minutes)

### **Create Test Branch**

```powershell
cd C:\Users\ofema\aivo-learning
git checkout -b test/github-actions
```

### **Make Small Change**

```powershell
# Add a comment to trigger CI
echo "# CI/CD Test" >> README.md
git add README.md
git commit -m "test: trigger CI/CD pipeline"
git push origin test/github-actions
```

### **Watch Workflows**

1. Go to: https://github.com/artpromedia/aivo-agentic-ai-learning-app/actions
2. Watch the CI workflow run
3. Verify all jobs pass:
   - ✅ Backend Tests
   - ✅ Frontend Linting
   - ✅ Frontend Tests
   - ✅ Security Scan
   - ✅ Build Images

### **Expected Results**
- All jobs should turn green ✅
- If any fail, check the logs
- Common issues:
  - Missing secrets → Add them in Step 1
  - Database connection → Check DATABASE_URL
  - Dependencies → Run `pnpm install`

---

## 🎯 **Step 5: Test Assessment System** (30 minutes)

### **Start Backend Services**

```powershell
cd C:\Users\ofema\aivo-learning

# Start all services
docker-compose up -d

# Check services are running
docker-compose ps

# Expected: postgres, redis, api-gateway, ai-inference-service all "Up"
```

### **Test Assessment API**

```powershell
# Check if assessment is required (should be true for new learner)
curl http://localhost:8000/api/v1/assessments/check-required?learner_id=test-learner-123

# Expected response:
# {
#   "success": true,
#   "data": {
#     "assessment_required": true,
#     "message": "Initial assessment required"
#   }
# }
```

### **Test Frontend (Optional)**

```powershell
# Start frontend
cd apps\learner-app
pnpm dev

# Open browser to: http://localhost:5173
# Navigate to: /assessment/results
# Should see assessment results page (with mock data for now)
```

### **Check Logs**

```powershell
# View API Gateway logs
docker-compose logs -f api-gateway

# View AI Inference logs
docker-compose logs -f ai-inference-service

# Look for:
# - No errors
# - Successful database connections
# - Assessment routes registered
```

---

## ✅ **Verification Checklist**

After completing all steps, verify:

### **GitHub Secrets**
- [ ] All 12 secrets configured (or 9 if skipping AWS/Slack)
- [ ] Secrets visible in repository settings
- [ ] No secret values exposed in logs

### **GitHub Environments**
- [ ] `development` environment created
- [ ] `staging` environment created
- [ ] `production` environment created with reviewers

### **Database Migration**
- [ ] Migration script executed successfully
- [ ] 9 new tables exist in database
- [ ] Triggers and indexes created
- [ ] No SQL errors in logs

### **CI/CD Workflows**
- [ ] Test branch pushed successfully
- [ ] CI workflow triggered automatically
- [ ] All jobs passed (green checkmarks)
- [ ] Docker images built successfully

### **Assessment System**
- [ ] Backend services running
- [ ] Database connected
- [ ] Assessment API responding
- [ ] Frontend can fetch data (if tested)

---

## 🚨 **Troubleshooting**

### **GitHub Secrets Not Working**
- Verify secret names exactly match (case-sensitive)
- No extra spaces in secret values
- Re-add secret if in doubt

### **Database Connection Failed**
- Check PostgreSQL is running: `docker-compose ps postgres`
- Verify DATABASE_URL format
- Check password in docker-compose.yml matches

### **CI Workflow Failed**
- Click on failed job to see error
- Common fixes:
  - Add missing secret
  - Fix syntax error in workflow file
  - Update dependency versions

### **Migration Failed**
- Check if tables already exist: `\dt` in psql
- Drop existing tables if needed (dev only!)
- Check migration file syntax

---

## 🎉 **Success!**

Once all checkmarks are complete, you have:
- ✅ Full CI/CD pipeline operational
- ✅ Assessment system database ready
- ✅ Automated testing working
- ✅ Ready for development and deployment

---

## 📚 **Next Steps**

After basic setup works:
1. Test assessment flow end-to-end
2. Deploy to staging environment
3. Run full test suite
4. Deploy to production

---

## 📞 **Need Help?**

- **CI/CD Issues**: See `docs/CI-CD.md`
- **Assessment System**: See `PROMPT_61_COMPLETE.md`
- **Deployment**: See `docs/CI_CD_DEPLOYMENT_GUIDE.md`
- **API Reference**: See backend service documentation

---

**Last Updated**: October 22, 2025
**Estimated Time**: 1-2 hours for complete setup
