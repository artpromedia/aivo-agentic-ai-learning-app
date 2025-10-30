# 🚀 AI Baseline Assessment - Quick Start Guide

## Prerequisites Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js v20+ installed
- [ ] pnpm v10 installed
- [ ] PostgreSQL or SQLite database
- [ ] Anthropic API key (Claude Sonnet 4)

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies

```powershell
# Navigate to API gateway
cd c:\aivo-agentic-ai-learning-app\services\api-gateway

# Install Python packages
pip install -r requirements.txt

# Verify schedule library is installed
pip list | Select-String "schedule"
# Should show: schedule 1.2.0
```

### Step 2: Install Frontend Dependencies

```powershell
# Navigate to admin portal
cd c:\aivo-agentic-ai-learning-app\apps\admin-portal

# Install chart visualization libraries
pnpm add lucide-react chart.js react-chartjs-2

# Verify installation
pnpm list | Select-String "chart"
```

### Step 3: Set Environment Variables

```powershell
# For current PowerShell session
$env:DATABASE_URL="sqlite:///C:/aivo-agentic-ai-learning-app/services/api-gateway/aivo.db"
$env:ANTHROPIC_API_KEY="your-api-key-here"
$env:JWT_SECRET="aivo-dev-secret-key-change-in-production"
$env:LOG_LEVEL="INFO"
$env:REDIS_URL="redis://localhost:6379/0"

# Or create .env file in services/api-gateway/
# DATABASE_URL=sqlite:///./aivo.db
# ANTHROPIC_API_KEY=your-api-key-here
# JWT_SECRET=aivo-dev-secret-key
# LOG_LEVEL=INFO
```

### Step 4: Initialize Database

```powershell
cd c:\aivo-agentic-ai-learning-app\services\api-gateway

# Run migrations (if using Alembic)
# alembic upgrade head

# Or let FastAPI create tables on startup (development only)
# Tables will be created automatically
```

### Step 5: Start Backend API

```powershell
cd c:\aivo-agentic-ai-learning-app\services\api-gateway

python -m uvicorn app.main:app --host 127.0.0.1 --port 9000 --reload
```

**Expected Output:**
```
INFO - 🚀 Starting AIVO API Gateway...
INFO - Environment: development
INFO - Database: configured
INFO - ✅ Background jobs started
INFO - 📅 Scheduled jobs configured:
INFO -   - Daily calibration: 02:00 UTC
INFO -   - Weekly quality report: Monday 06:00 UTC
INFO -   - Hourly metrics update
INFO -   - Problematic items check: Every 6 hours
INFO -   - Cleanup stale reviews: 03:00 UTC daily
INFO - Application startup complete.
INFO - Uvicorn running on http://127.0.0.1:9000
```

### Step 6: Start Frontend Dashboard

```powershell
# Open new PowerShell window
cd c:\aivo-agentic-ai-learning-app\apps\admin-portal

pnpm dev
```

**Expected Output:**
```
VITE v7.1.12  ready in 1234 ms

➜  Local:   http://localhost:5007/
➜  Network: use --host to expose
➜  press h + enter to show help
```

---

## ✅ Verify Installation

### Test 1: API Health Check

```powershell
# Open browser or use curl
curl http://localhost:9000/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "api-gateway",
#   "version": "1.0.0",
#   "environment": "development"
# }
```

### Test 2: API Documentation

Open browser to: http://localhost:9000/docs

You should see Swagger UI with all API endpoints.

### Test 3: Admin Dashboard

Open browser to:
- Question Review: http://localhost:5007/assessment/question-review
- Quality Metrics: http://localhost:5007/assessment/quality-metrics

---

## 🧪 Run Tests

### Backend Tests

```powershell
cd c:\aivo-agentic-ai-learning-app\services\api-gateway

# Run all tests
pytest

# Run specific test file
pytest tests/test_irt_engine.py -v

# Run with coverage
pytest --cov=app --cov-report=html
```

### Frontend Tests

```powershell
cd c:\aivo-agentic-ai-learning-app\apps\admin-portal

# Run tests
pnpm test

# Run with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Schedule Library Not Found

**Error:** `Cannot find implementation or library stub for module named "schedule"`

**Solution:**
```powershell
cd c:\aivo-agentic-ai-learning-app\services\api-gateway
pip install schedule==1.2.0
```

### Issue 2: Chart Libraries Missing (Frontend)

**Error:** `Cannot find module 'chart.js'` or `Cannot find module 'lucide-react'`

**Solution:**
```powershell
cd c:\aivo-agentic-ai-learning-app\apps\admin-portal
pnpm add lucide-react chart.js react-chartjs-2
```

### Issue 3: Database Connection Error

**Error:** `Could not connect to database`

**Solution:**
```powershell
# For SQLite (development)
$env:DATABASE_URL="sqlite:///C:/aivo-agentic-ai-learning-app/services/api-gateway/aivo.db"

# For PostgreSQL (production)
$env:DATABASE_URL="postgresql://user:password@localhost:5432/aivo"
```

### Issue 4: Port Already in Use

**Error:** `[Errno 10048] error while attempting to bind on address ('127.0.0.1', 9000)`

**Solution:**
```powershell
# Find process using port 9000
Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Or use different port
python -m uvicorn app.main:app --host 127.0.0.1 --port 9001
```

### Issue 5: Background Jobs Not Starting

**Error:** `⚠️ Background jobs failed to start`

**Solution:**
Check that `schedule` library is installed:
```powershell
pip list | Select-String "schedule"
```

If not found, install it:
```powershell
pip install schedule==1.2.0
```

---

## 📚 Next Steps

### 1. Create Sample Data

```powershell
# Generate test questions
cd c:\aivo-agentic-ai-learning-app\services\api-gateway
python scripts/generate_test_questions.py --domain math --count 10
```

### 2. Run Manual Calibration

```powershell
# Recalibrate all items
python scripts/run_calibration.py

# Recalibrate specific domain
python scripts/run_calibration.py --domain math --min-responses 30
```

### 3. Test Assessment Flow

```python
# Example: Start assessment and generate questions
import requests

# Start session
response = requests.post(
    "http://localhost:9000/api/v1/baseline/start-session",
    json={
        "learner_id": "test-learner-123",
        "grade_band": "grades_1_3",
        "domains": ["math", "reading"]
    },
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)

session = response.json()
print(f"Session ID: {session['session_id']}")
```

### 4. Review Questions in Dashboard

1. Open: http://localhost:5007/assessment/question-review
2. Login with admin credentials
3. Review pending questions
4. Approve or reject questions

### 5. Monitor Quality Metrics

1. Open: http://localhost:5007/assessment/quality-metrics
2. Set date range
3. View quality distribution chart
4. Check problematic items
5. Export report

---

## 🔐 Production Deployment

### Environment Variables (Production)

```bash
# Required
DATABASE_URL=postgresql://user:password@hostname:5432/aivo
ANTHROPIC_API_KEY=sk-ant-api03-...
JWT_SECRET=strong-random-secret-key-64-chars-minimum

# Optional
LOG_LEVEL=INFO
REDIS_URL=redis://hostname:6379/0
CORS_ORIGINS=["https://admin.aivo.com"]
DEBUG=False
ENVIRONMENT=production
```

### Security Checklist

- [ ] Change JWT_SECRET to strong random key
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domains
- [ ] Set up Redis for caching
- [ ] Configure email/Slack alerts
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Enable monitoring (Sentry, DataDog)

### Deployment Commands

```bash
# Backend
cd services/api-gateway
pip install -r requirements.txt
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:9000

# Frontend
cd apps/admin-portal
pnpm build
# Serve dist/ folder with nginx or CDN
```

---

## 📞 Support

If you encounter issues:

1. **Check Logs:**
   - Backend: Console output or logs/aivo-api.log
   - Frontend: Browser console (F12)

2. **Run Tests:**
   - `pytest` for backend
   - `pnpm test` for frontend

3. **Verify Dependencies:**
   - Backend: `pip list`
   - Frontend: `pnpm list`

4. **Check Documentation:**
   - API: http://localhost:9000/docs
   - README: AI_BASELINE_ASSESSMENT_COMPLETE.md

---

## ✅ Installation Complete!

You should now have:
- ✅ Backend API running on port 9000
- ✅ Admin dashboard running on port 5007
- ✅ Background jobs scheduled and running
- ✅ Database initialized
- ✅ Tests passing

**Start using the AI-Powered Baseline Assessment System!** 🎉

---

**Last Updated:** October 29, 2025  
**Version:** 1.0.0  
**Status:** Production Ready
