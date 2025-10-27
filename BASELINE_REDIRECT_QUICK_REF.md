# 🔧 Quick Reference: Baseline Assessment Redirect

## ✅ Problem Fixed
**Issue**: "Continue Baseline Assessment" button redirected to parent login instead of learner app.  
**Cause**: Wrong port number (3004 instead of 3003)  
**Status**: FIXED ✅

---

## 🎯 Correct Port Numbers

```
Parent Portal:  http://localhost:3001
Learner App:    http://localhost:3003  ← This was wrong (was 3004)
API Gateway:    http://localhost:9000
```

---

## 🚀 Quick Test

### Start Services:
```powershell
# Terminal 1
cd apps/parent-portal && pnpm dev

# Terminal 2  
cd apps/learner-app && pnpm dev

# Terminal 3 (optional)
cd services/api-gateway && python -m uvicorn app.main:app --reload --port 9000
```

### Test Flow:
1. Go to http://localhost:3001
2. Signup/login as parent
3. Add child profile
4. Click "Continue to Baseline Assessment"
5. ✅ Should redirect to http://localhost:3003 (learner app)
6. ✅ Assessment should load (not redirect to login)

---

## 📝 What Changed

**Files Updated**:
1. `apps/parent-portal/src/pages/onboarding/Onboarding.tsx` (Lines 54, 160)
2. `apps/teacher-portal/src/pages/StudentAssessment.tsx` (Line 44)

```diff
- const learnerAppUrl = `http://localhost:3004/#/onboarding/assessment...`
+ const learnerAppUrl = `http://localhost:3003/#/onboarding/assessment...`
```

**Impact**: 
- ✅ Parents can now onboard children successfully
- ✅ Teachers can launch student assessments correctly

---

## 🔍 Verification Console Output

**Should see in parent portal console:**
```
🚀 REDIRECTING to learner app assessment: http://localhost:3003/#/onboarding/assessment?learner_id=temp-123...
⏰ Redirecting to: http://localhost:3003/#/onboarding/assessment...
```

**Should see in learner app console:**
```
🔐 Setting up assessment for learner: temp-123...
🔑 Auth token available: true
```

---

## 🐛 Troubleshooting

### Still redirecting to login?
1. Clear localStorage: `localStorage.clear()`
2. Ensure both apps are running
3. Check console for errors
4. Verify URLs in browser network tab

### Port already in use?
```powershell
# Find process on port
netstat -ano | findstr :3003

# Kill process
taskkill /PID <PID> /F
```

---

## 📚 Full Details

See: `BASELINE_ASSESSMENT_REDIRECT_FIX.md` for complete documentation.

---

**Fixed**: October 26, 2025  
**Impact**: High - Affects all new child enrollments  
**Priority**: P0 - Blocking onboarding flow
