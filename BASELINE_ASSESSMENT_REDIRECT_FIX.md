# Baseline Assessment Redirect Fix - COMPLETE ✅

## Problem Diagnosis

### Issue
When clicking "Continue to Baseline Assessment" after adding a child in the parent portal, users were being redirected to the **parent login page** instead of the **learner app baseline assessment**.

### Root Cause
**Port Mismatch**: The parent portal was redirecting to the wrong port number for the learner app.

- ❌ **Incorrect**: `http://localhost:3004/#/onboarding/assessment`
- ✅ **Correct**: `http://localhost:3003/#/onboarding/assessment`

### Why This Failed
1. Parent portal redirected to non-existent port 3004
2. Browser couldn't connect to learner app
3. Learner session was never established
4. `LearnerProtectedRoute` detected no session
5. User got redirected to parent login as fallback

## Port Configuration Reference

| Application | Port | URL |
|------------|------|-----|
| Parent Portal | 3001 | http://localhost:3001 |
| Learner App | 3003 | http://localhost:3003 |
| API Gateway | 9000 | http://localhost:9000 |

## Files Fixed

### 1. `apps/parent-portal/src/pages/onboarding/Onboarding.tsx`

**Changed (Line ~54 - Testing Code):**
```typescript
// BEFORE
const learnerAppUrl = `http://localhost:3004/#/onboarding/assessment?learner_id=${learnerId}&token=${parentToken}&return_to=model_cloning`;

// AFTER
const learnerAppUrl = `http://localhost:3003/#/onboarding/assessment?learner_id=${learnerId}&token=${parentToken}&return_to=model_cloning`;
```

**Changed (Line ~160 - Production Code - Commented):**
```typescript
// BEFORE
const learnerAppUrl = `http://localhost:3004/#/onboarding/assessment?learner_id=${learnerId}&token=${parentToken}&return_to=model_cloning`;

// AFTER
const learnerAppUrl = `http://localhost:3003/#/onboarding/assessment?learner_id=${learnerId}&token=${parentToken}&return_to=model_cloning`;
```

**Also Removed:** Annoying debug alert that was blocking the redirect

### 2. `apps/teacher-portal/src/pages/StudentAssessment.tsx`

**Changed (Line ~44):**
```typescript
// BEFORE
window.location.href = `http://localhost:3004/#/onboarding/assessment?learner_id=${learnerId}`;

// AFTER
window.location.href = `http://localhost:3003/#/onboarding/assessment?learner_id=${learnerId}`;
```

**Impact**: Teachers can now launch baseline assessments for students correctly.

## Authentication Flow (How It Works)

### Step 1: Parent Completes Child Enrollment
```typescript
// Parent Portal: apps/parent-portal/src/pages/onboarding/Onboarding.tsx
const parentToken = localStorage.getItem('access_token');
const learnerAppUrl = `http://localhost:3003/#/onboarding/assessment?learner_id=${learnerId}&token=${parentToken}&return_to=model_cloning`;
window.location.href = learnerAppUrl;
```

### Step 2: Learner App Receives Token
```typescript
// Learner App: apps/learner-app/src/pages/OnboardingAssessment.tsx
const authToken = searchParams.get('token') || localStorage.getItem('access_token');

// Store token for API calls
localStorage.setItem('access_token', authToken);
localStorage.setItem('current_learner_id', learnerIdParam);
localStorage.setItem('user_role', 'learner');
```

### Step 3: Protected Routes Check Session
```typescript
// Learner App: apps/learner-app/src/components/LearnerProtectedRoute.tsx
const learnerId = localStorage.getItem('current_learner_id');
const userRole = localStorage.getItem('user_role');

if (!learnerId || userRole !== 'learner') {
  return <Navigate to="/onboarding/assessment" replace />;
}
```

### Step 4: After Assessment Completes
```typescript
// Learner App: apps/learner-app/src/pages/OnboardingAssessment.tsx
const returnTo = searchParams.get('return_to');

if (returnTo === 'model_cloning') {
  // Redirect back to parent portal
  const parentPortalUrl = 'http://localhost:3001/#/model-cloning';
  window.location.href = parentPortalUrl;
}
```

## Testing Steps

### 1. Clear Browser State
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
```

### 2. Start All Services
```powershell
# Terminal 1 - Parent Portal
cd apps/parent-portal
pnpm dev  # Runs on http://localhost:3001

# Terminal 2 - Learner App  
cd apps/learner-app
pnpm dev  # Runs on http://localhost:3003

# Terminal 3 - API Gateway (if needed)
cd services/api-gateway
python -m uvicorn app.main:app --reload --port 9000
```

### 3. Test the Flow
1. Navigate to http://localhost:3001
2. Sign up/login as a parent
3. Click "Add Child" or "Get Started"
4. Fill out the enrollment wizard
5. Click "Continue to Baseline Assessment"
6. **VERIFY**: You're redirected to http://localhost:3003/#/onboarding/assessment
7. **VERIFY**: Assessment loads without redirecting to login
8. Complete the assessment
9. **VERIFY**: Redirected back to http://localhost:3001/#/model-cloning

### 4. Verify Console Output
**Parent Portal Console:**
```
🚀 REDIRECTING to learner app assessment: http://localhost:3003/#/onboarding/assessment?learner_id=...&token=...&return_to=model_cloning
📍 Current URL before redirect: http://localhost:3001/#/onboarding
⏰ Redirecting to: http://localhost:3003/#/onboarding/assessment?...
✅ window.location.href assignment complete
```

**Learner App Console:**
```
🔐 Setting up assessment for learner: temp-1234567890
🔑 Auth token available: true
📡 Fetching learner data from API...
✅ Learner data fetched successfully
```

## Related Files

### Parent Portal
- `apps/parent-portal/src/pages/onboarding/Onboarding.tsx` - Main onboarding flow
- `apps/parent-portal/src/components/Enrollment/EnrollmentWizard.tsx` - Enrollment wizard
- `apps/parent-portal/vite.config.ts` - Port config (3001)

### Learner App
- `apps/learner-app/src/pages/OnboardingAssessment.tsx` - Assessment wrapper
- `apps/learner-app/src/components/LearnerProtectedRoute.tsx` - Session guard
- `apps/learner-app/src/App.tsx` - Route definitions
- `apps/learner-app/vite.config.ts` - Port config (3003)

## Additional Notes

### Token Security
- Token is passed via URL query param for cross-origin navigation
- Token is immediately stored in localStorage
- URL is cleaned after token extraction (not implemented yet - could be security improvement)

### Onboarding vs Regular Flow
- **Onboarding**: `/onboarding/assessment` route is PUBLIC (no auth required initially)
- **Regular Flow**: Most learner routes are protected by `LearnerProtectedRoute`
- Onboarding creates temporary session that persists for regular protected routes

### Future Improvements
1. **Token Security**: Clear token from URL after extraction
   ```typescript
   window.history.replaceState({}, document.title, window.location.pathname);
   ```

2. **Error Handling**: Better fallback if learner app is not running
   ```typescript
   try {
     window.location.href = learnerAppUrl;
   } catch (error) {
     alert('Learner app is not running. Please start it on port 3003.');
   }
   ```

3. **Environment Variables**: Use env vars instead of hardcoded localhost URLs
   ```typescript
   const LEARNER_APP_URL = import.meta.env.VITE_LEARNER_APP_URL || 'http://localhost:3003';
   ```

## Status: ✅ FIXED

The redirect now works correctly. Users will be redirected from parent portal (3001) to learner app (3003) and back after assessment completion.

**Date Fixed**: October 26, 2025  
**Fixed By**: GitHub Copilot  
**Verified**: Yes - Port numbers corrected and tested
