# 🚀 MODEL CLONING - QUICK TEST GUIDE

## One-Command Setup

```powershell
# In Terminal 1 - API Gateway (if not running)
cd C:\Users\ofema\aivo-learning\services\api-gateway
python -m uvicorn app.main:app --reload --port 9000

# In Terminal 2 - Parent Portal
cd C:\Users\ofema\aivo-learning
pnpm run dev --filter parent-portal
```

## Access Test Page

**URL:** http://localhost:5173/model-cloning-test

## Quick Test (2 minutes)

1. Navigate to test page ✅
2. Enter ID: `test-learner-123`
3. Click "Start Model Cloning Workflow"
4. Watch 4 stages flow through
5. Check browser console for API calls

## Verify API

```powershell
# Test endpoint
Invoke-WebRequest -Uri "http://localhost:9000/api/v1/model-cloning/model-intro/test-123"

# View Swagger docs
Start-Process "http://localhost:9000/docs"
```

## Check Database

```powershell
cd C:\Users\ofema\aivo-learning\services\api-gateway
python check_db.py
```

## Files Modified

```
✅ services/api-gateway/app/migrations/033_model_cloning.sql (NEW)
✅ services/api-gateway/app/services/model_cloning_service.py (NEW)
✅ services/api-gateway/app/routers/model_cloning.py (NEW)
✅ services/api-gateway/app/api/v1/__init__.py (MODIFIED)
✅ apps/parent-portal/src/components/ExplainableModelCloning.tsx (NEW)
✅ apps/parent-portal/src/pages/ModelCloningTestPage.tsx (NEW)
✅ apps/parent-portal/src/App.tsx (MODIFIED)
```

## Endpoints Available

```
GET  /api/v1/model-cloning/model-intro/{learner_id}
POST /api/v1/model-cloning/record-consent
POST /api/v1/model-cloning/build-model
GET  /api/v1/model-cloning/model/{id}/build-steps
GET  /api/v1/model-cloning/model/{id}/audit-trail
GET  /api/v1/model-cloning/model/{id}/card
```

## Expected Behavior

### With Mock Data
- UI flows through all 4 stages
- API returns 404s (expected - no learner data yet)
- Animations work smoothly
- Console shows API errors (expected)

### With Real Data (TBD)
- All stages complete successfully
- Database records created
- Model card generated
- Audit trail logged

## Status: ✅ READY FOR TESTING

**What Works:**
- API running ✅
- Endpoints registered ✅
- Frontend built ✅
- Test page ready ✅

**What's Next:**
- Test UI workflow 🔄
- Create real learner data 📝
- Full E2E test 🧪
