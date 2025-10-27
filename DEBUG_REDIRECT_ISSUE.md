# 🔍 Debug: Baseline Assessment Redirect Issue

## Current Status
Fixed port number from 3004 → 3003, but still redirecting to parent login.

## Enhanced Debugging Added

### Parent Portal (`Onboarding.tsx`)
Added extensive console logging when "Complete Enrollment" is clicked:
```
================================================================================
🚀 REDIRECTING TO LEARNER APP
================================================================================
📍 Current URL: http://localhost:3001/#/onboarding
📍 Target URL: http://localhost:3003/#/onboarding/assessment?learner_id=...
👤 Learner ID: temp-1234567890
🔑 Token (first 20 chars): eyJhbGciOiJIUzI1NiI...
⏰ Timestamp: 2025-10-26T12:34:56.789Z
================================================================================
⏰ Executing redirect in 500ms...
✈️ REDIRECTING NOW...
```

### Learner App (`OnboardingAssessment.tsx`)
Added extensive console logging when page loads:
```
================================================================================
🎯 LEARNER APP: OnboardingAssessment Starting
================================================================================
📍 Current URL: http://localhost:3003/#/onboarding/assessment?...
🔍 URL Search Params: learner_id=temp-123&token=...
⏰ Timestamp: 2025-10-26T12:34:57.123Z
📦 Found pending session data from parent portal
👤 Learner ID from URL: temp-1234567890
👤 Final Learner ID: temp-1234567890
🔐 Setting user_role to learner...
✅ User role set: learner
✅ Learner ID stored: temp-1234567890
🔑 Auth token available: true
🔑 Auth token source: URL
================================================================================
```

### LearnerProtectedRoute Component
Added session validation logging:
```
🛡️ LearnerProtectedRoute check:
  - Learner ID: temp-1234567890
  - User Role: learner
  - Is Valid: true
✅ Learner session valid, rendering protected content
```

## Test Instructions

### 1. Clear Everything First
```javascript
// Run in browser console (BOTH tabs if you have them open)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 2. Start Both Apps
```powershell
# Terminal 1 - Parent Portal
cd apps/parent-portal
pnpm dev

# Terminal 2 - Learner App
cd apps/learner-app
pnpm dev
```

### 3. Test the Flow
1. Open http://localhost:3001 in browser
2. Open DevTools Console (F12)
3. Sign up or login as parent
4. Click "Add Child" or go to /onboarding
5. Fill out the enrollment form
6. Click "Complete Enrollment" on the final step
7. **WATCH THE CONSOLE LOGS**

### 4. What To Look For

#### ✅ If Working:
```
Parent Portal Console:
  🚀 REDIRECTING TO LEARNER APP
  ✈️ REDIRECTING NOW...

[Browser navigates to http://localhost:3003]

Learner App Console:
  🎯 LEARNER APP: OnboardingAssessment Starting
  📍 Current URL: http://localhost:3003/#/onboarding/assessment?learner_id=...
  ✅ User role set: learner
  ✅ Learner ID stored: temp-1234567890
```

#### ❌ If Still Failing:
**Check these scenarios:**

**Scenario A: Redirect doesn't happen**
- Console shows "🚀 REDIRECTING..." but stays on parent portal
- **Cause**: Browser security, popup blocker, or JavaScript error
- **Solution**: Check for JavaScript errors in console

**Scenario B: Redirects but immediately redirects to login**
- Browser goes to learner app then quickly back to login
- **Cause**: Learner session not being set fast enough
- **Solution**: Check `🛡️ LearnerProtectedRoute` logs

**Scenario C: Redirects to wrong URL**
- Browser goes to http://localhost:3004 (404)
- **Cause**: Old cached code
- **Solution**: Hard refresh (Ctrl+Shift+R) or clear cache

**Scenario D: Shows "No learner ID found" error**
- Learner app loads but shows error message
- **Cause**: Query params not being parsed correctly
- **Solution**: Check URL in address bar for `?learner_id=...`

## Common Issues & Solutions

### Issue: "Still redirecting to parent login"

**Question 1**: What URL do you see in the browser address bar when you see the login page?
- If `http://localhost:3001/*` → You never left the parent portal
- If `http://localhost:3003/*` → You're in the learner app but it's redirecting

**Question 2**: What does the browser console say?
- Look for the boxed "REDIRECTING TO LEARNER APP" message
- Look for "LearnerProtectedRoute check" message

### Issue: Popup Blocked

Some browsers block `window.location.href` redirects if not triggered directly by user click.

**Solution**: Check for browser popup blocker icon in address bar

### Issue: CORS Error

If you see CORS errors in console about localhost:3003.

**Solution**: Both apps run on localhost, so CORS shouldn't be an issue, but check if learner app is actually running.

### Issue: localStorage Not Shared

Parent portal and learner app have SEPARATE localStorage (different origins).

**Current Fix**: We pass the token in the URL query params, which the learner app extracts and stores in its own localStorage.

## Key Points

1. **Different Origins** = Different localStorage
   - Parent Portal: `http://localhost:3001` (separate localStorage)
   - Learner App: `http://localhost:3003` (separate localStorage)

2. **Token Passing**: Token goes through URL query params:
   ```
   http://localhost:3003/#/onboarding/assessment?learner_id=X&token=Y&return_to=model_cloning
   ```

3. **Session Setup**: `OnboardingAssessment` component must set:
   ```javascript
   localStorage.setItem('user_role', 'learner');
   localStorage.setItem('current_learner_id', learnerId);
   ```

4. **Protected Routes**: `LearnerProtectedRoute` checks for:
   ```javascript
   learnerId = localStorage.getItem('current_learner_id')
   userRole = localStorage.getItem('user_role')
   if (!learnerId || userRole !== 'learner') → redirect
   ```

## Next Steps

### If you run the test and still see the issue:

1. **Copy ALL console logs** from both browser tabs
2. **Note the exact URL** in the address bar when you see the login page
3. **Check if both apps are actually running**:
   ```powershell
   # Should see two processes
   Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object Id,ProcessName,StartTime
   ```
4. **Check browser Network tab** to see if redirect actually happens

### Provide This Info:
- [ ] What URL is in the address bar when you see login?
- [ ] What do the console logs show?
- [ ] Are both apps running (check terminal output)?
- [ ] Any errors in browser console?

## Files Modified

1. `apps/parent-portal/src/pages/onboarding/Onboarding.tsx`
   - Added extensive logging
   - Added token validation
   - Added 500ms delay before redirect
   - Store pending session data

2. `apps/learner-app/src/pages/OnboardingAssessment.tsx`
   - Added extensive logging
   - Check for pending session data
   - Set user_role earlier in the flow

3. `apps/learner-app/src/components/LearnerProtectedRoute.tsx`
   - Added session validation logging

---

## ✅ STATUS: COMPLETE - ALL ISSUES FIXED

### Issues Resolved:
1. ✅ **Port number corrected** (3004 → 3003)
2. ✅ **Redirect flow fixed** (parent portal → learner app assessment)
3. ✅ **PIN setup made optional** (not mandatory during onboarding)
4. ✅ **Onboarding flow stays in learner app** (assessment → cloning → subjects)

### Correct Flow Now:
```
Parent Portal (localhost:3001)
  │
  └→ Complete Enrollment
      │
      └→ Learner App (localhost:3003)
          │
          ├→ /onboarding/assessment (Baseline Assessment)
          │   │
          │   └→ Assessment Complete
          │       │
          │       └→ /cloning (Model Cloning)
          │           │
          │           └→ Cloning Complete
          │               │
          │               └→ /subjects (Skip PIN - Go Directly Here!)
          │                   │
          │                   └→ ✅ Ready to Learn!
```

### What Changed:
- **OnboardingAssessment**: Now stays in learner app instead of redirecting back to parent
- **ModelCloning**: Skips PIN setup for first-time users
- **Lock Page**: Allows access without PIN if setup was skipped
- **SetupPin**: Added "Skip for Now" button

### Documentation:
See **`PIN_SETUP_FLOW_FIX.md`** for complete details on PIN setup flow changes.

---

**Last Updated**: October 26, 2025  
**Status**: ✅ COMPLETE - All redirect and PIN issues resolved
