# District Portal Static Buttons - Issue Tracker

**Date:** October 26, 2025  
**Status:** 🔧 In Progress - CORS Fixed, Static Buttons Identified

---

## ✅ Fixed Issues

### 1. CORS Error (CRITICAL)
**Problem:** API calls blocked by CORS policy  
**Error:** `No 'Access-Control-Allow-Origin' header is present on the requested resource`  
**Root Cause:** Backend CORS config missing `http://localhost:5006`  
**Fix Applied:** Added port 5006 to CORS_ORIGINS in `app/core/config.py`  
**Status:** ✅ **FIXED** - Server reloaded, CORS should now work

---

## 🐛 Remaining Issues - Static Buttons

### Dashboard Page

#### Issue #1: Add School Button
**Location:** Dashboard page  
**Button:** "Add School"  
**Current Behavior:** Static/non-functional  
**Expected Behavior:** Opens modal to add new school  
**API Needed:** 
- `POST /api/v1/admin/schools` (create school)
- `GET /api/v1/admin/schools` (list schools)
**Priority:** 🔴 HIGH - Core district management feature

---

### User Management Page

#### Issue #2: User Page Errors
**Location:** User Management page  
**Error Type:** API fetch errors (now should be CORS-related, fixed above)  
**Current Status:** Should be resolved after CORS fix  
**Next Steps:** Re-test after CORS fix applied  
**Priority:** 🟢 SHOULD BE FIXED

---

### IEP Management Page

#### Issue #3: Schedule New Report Button
**Location:** IEP Management page  
**Button:** "Schedule New Report"  
**Current Behavior:** Static/non-functional  
**Expected Behavior:** Opens modal to schedule IEP report generation  
**API Needed:**
- `POST /api/v1/district/iep/reports/schedule` (schedule report)
- `GET /api/v1/district/iep/reports` (list scheduled reports)
**Priority:** 🟡 MEDIUM - Important for compliance

#### Issue #4: Edit Button (IEP)
**Location:** IEP Management page  
**Button:** "Edit" (on IEP records)  
**Current Behavior:** Static/non-functional  
**Expected Behavior:** Opens IEP editor or navigates to edit page  
**API Needed:**
- `GET /api/v1/district/iep/{iep_id}` (fetch IEP details)
- `PATCH /api/v1/district/iep/{iep_id}` (update IEP)
**Priority:** 🟡 MEDIUM - Important for IEP management

#### Issue #5: View Overdue IEPs Button
**Location:** IEP Management page  
**Button:** "View Overdue IEPs"  
**Current Behavior:** Static/non-functional  
**Expected Behavior:** Filters/shows only overdue IEPs  
**Implementation:** Likely client-side filtering (no API needed)  
**Fix:** Add onClick handler to filter existing data  
**Priority:** 🟢 LOW - UI enhancement

---

### Professional Development Page

#### Issue #6: Start Learning Buttons
**Location:** Professional Development page  
**Button:** "Start Learning" (on training modules)  
**Current Behavior:** Static/non-functional  
**Expected Behavior:** Navigates to training module or marks as started  
**API Needed:**
- `GET /api/v1/district/training/modules` (list modules)
- `POST /api/v1/district/training/enroll` (enroll in module)
- `GET /api/v1/district/training/modules/{id}` (get module content)
**Priority:** 🟡 MEDIUM - Professional development tracking

---

## 📊 Summary Statistics

- **Total Issues Identified:** 7
- **Fixed:** 1 (CORS)
- **High Priority:** 1 (Add School)
- **Medium Priority:** 3 (IEP features, Training)
- **Low Priority:** 1 (View Overdue IEPs)
- **Should Be Auto-Fixed:** 1 (User page errors after CORS fix)

---

## 🎯 Recommended Fix Order

### Phase 1: Verify CORS Fix (NOW)
1. ✅ Refresh District Portal page
2. ✅ Check if User Management loads data
3. ✅ Verify no more CORS errors in console

### Phase 2: High Priority (Next 30 mins)
1. 🔴 **Add School Button** - Create School Management API
   - `POST /api/v1/admin/schools`
   - `GET /api/v1/admin/schools`
   - `PATCH /api/v1/admin/schools/{id}`
   - `DELETE /api/v1/admin/schools/{id}`

### Phase 3: Medium Priority (Next 1-2 hours)
2. 🟡 **IEP Management** - Schedule Reports & Edit
   - Create IEP API endpoints
   - Implement report scheduling
   - Add IEP editing functionality

3. 🟡 **Professional Development** - Training Modules
   - Create Training API endpoints
   - Implement module enrollment
   - Add progress tracking

### Phase 4: Low Priority (Future)
4. 🟢 **View Overdue IEPs** - Client-side filtering
   - Add filter function
   - No API needed

---

## 🔧 Implementation Plan

### Quick Win: Add School API (30 minutes)

**Backend Work:**
1. Create `app/api/v1/admin/schools.py`
2. Create `School` model (if not exists)
3. Implement 4 endpoints (CRUD)
4. Register router in `app/api/v1/__init__.py`

**Frontend Work:**
1. Create `apps/district-portal/src/services/api.ts` - add school methods
2. Update Dashboard.tsx with school API integration
3. Add modal state and handlers
4. Test school creation

**Estimated Time:** 30 minutes  
**Impact:** HIGH - Unblocks school management

---

### Medium Effort: IEP Management API (1 hour)

**Backend Work:**
1. Create `app/api/v1/district/iep.py`
2. Create models: `IEP`, `IEPReport`, `IEPGoal`
3. Implement endpoints:
   - Schedule report
   - Edit IEP
   - View IEP details
   - List overdue IEPs

**Frontend Work:**
1. Add IEP service methods
2. Update IEPManagement.tsx
3. Create schedule report modal
4. Add edit functionality

**Estimated Time:** 1 hour  
**Impact:** MEDIUM - Important compliance feature

---

### Medium Effort: Training API (1 hour)

**Backend Work:**
1. Create `app/api/v1/district/training.py`
2. Create models: `TrainingModule`, `Enrollment`
3. Implement endpoints:
   - List modules
   - Enroll in module
   - Track progress
   - Get module content

**Frontend Work:**
1. Add training service methods
2. Update ProfessionalDevelopment.tsx
3. Implement enrollment flow
4. Add progress tracking

**Estimated Time:** 1 hour  
**Impact:** MEDIUM - PD tracking

---

## 🚀 Next Steps

**Immediate (You):**
1. Refresh the District Portal page in browser
2. Check DevTools console for CORS errors
3. Verify User Management page loads data
4. Report back on results

**Immediate (Me):**
1. Wait for your test results
2. If CORS fixed → Implement Add School API
3. If still errors → Debug further

---

## 📝 Notes

- CORS fix should resolve all `Failed to fetch` errors
- User Management page should now load real data
- Once verified working, we can proceed with implementing missing APIs
- Focus on high-impact features first (School Management)

