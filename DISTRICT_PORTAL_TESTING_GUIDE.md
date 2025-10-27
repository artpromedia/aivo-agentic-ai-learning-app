# District Portal UserManagement - Testing Guide

**Status:** ✅ Backend Running | ✅ Frontend Running  
**Backend API:** http://127.0.0.1:9000  
**Frontend URL:** http://localhost:5006  
**Swagger Docs:** http://127.0.0.1:9000/docs

---

## 🎯 Testing Objectives

Validate that the District Portal UserManagement page:
1. ✅ Loads real data from the backend API
2. ✅ Displays loading states during API calls
3. ✅ Shows error messages and retry functionality
4. ✅ Creates users via the API
5. ✅ Activates/deactivates users via the API
6. ✅ Refreshes data after mutations
7. ✅ Displays accurate statistics

---

## 📋 Pre-Testing Checklist

- [x] Backend server running on http://127.0.0.1:9000
- [x] District Portal running on http://localhost:5006
- [x] Swagger docs accessible at http://127.0.0.1:9000/docs
- [ ] Logged into District Portal as admin user
- [ ] UserManagement page accessible

---

## 🧪 Test Scenarios

### Test 1: Initial Page Load & Real Data Fetch

**Objective:** Verify the page loads users from the backend API

**Steps:**
1. Open http://localhost:5006 in your browser
2. Log in with demo admin credentials (if auth is enabled)
3. Navigate to **User Management** page
4. Observe the page during load

**Expected Results:**
- ✅ Loading spinner appears briefly
- ✅ User table populates with real data from backend
- ✅ Stats cards show actual counts (Total Users, Active Users, Role breakdown)
- ✅ No "mock data" or placeholder content visible

**Check Console:**
- Open browser DevTools (F12)
- Check Network tab for API calls:
  - `GET http://127.0.0.1:9000/api/v1/admin/users`
  - `GET http://127.0.0.1:9000/api/v1/admin/users/stats/summary`
- Verify 200 OK responses

**Current Data to Expect:**
```
Check Swagger docs at http://127.0.0.1:9000/docs#/admin/get_users_api_v1_admin_users_get
to see what users exist in the database
```

---

### Test 2: User Statistics Display

**Objective:** Verify stats cards show real aggregated data

**Steps:**
1. Observe the 4 stats cards at the top of the page:
   - Total Users
   - Active Users
   - District Admins
   - Teachers
2. Compare with Swagger API response

**Validation via Swagger:**
1. Go to http://127.0.0.1:9000/docs#/admin/get_user_stats_api_v1_admin_users_stats_summary_get
2. Click "Try it out" → "Execute"
3. Compare response with UI stats cards

**Expected Results:**
- ✅ Stats match API response exactly
- ✅ Numbers update after creating/deleting users
- ✅ Role counts are accurate

---

### Test 3: Create New User (API Integration)

**Objective:** Create a user via the UI and verify it calls the backend API

**Steps:**
1. Click **"Add User"** button
2. Fill in the form:
   - **Full Name:** "Test User"
   - **Email:** "testuser@example.com"
   - **Role:** "Teacher"
   - **School:** Select any school
   - **Password:** "Test123!" (temporary password)
3. Click **"Add User"**
4. Observe network activity

**Expected Results:**
- ✅ API call visible in Network tab:
  ```
  POST http://127.0.0.1:9000/api/v1/admin/users
  Request Body:
  {
    "email": "testuser@example.com",
    "full_name": "Test User",
    "role": "teacher",
    "school_id": <selected_school_id>,
    "password": "Test123!"
  }
  ```
- ✅ Success response (201 Created)
- ✅ Modal closes automatically
- ✅ User table refreshes and shows new user
- ✅ Stats cards update (+1 to Total Users, +1 to Teachers)

**Error Case:**
- Try creating user with existing email
- Expected: Error message displayed (email already exists)

---

### Test 4: Activate/Deactivate User

**Objective:** Change user status via API

**Steps:**
1. Find an active user in the table
2. Click the **"Deactivate"** button for that user
3. Observe the API call
4. Verify the status changes to "Inactive"
5. Click **"Activate"** to reactivate
6. Verify status changes back to "Active"

**Expected Network Calls:**
```
POST http://127.0.0.1:9000/api/v1/admin/users/{user_id}/deactivate
POST http://127.0.0.1:9000/api/v1/admin/users/{user_id}/activate
```

**Expected Results:**
- ✅ Status badge changes color (green → gray or vice versa)
- ✅ Button text toggles (Deactivate ↔ Activate)
- ✅ Stats cards update (Active Users count changes)
- ✅ No page refresh required (real-time update)

---

### Test 5: Filter Users (Client-Side)

**Objective:** Verify filtering works with real API data

**Steps:**
1. Use the **Role** filter dropdown
   - Select "Teachers"
   - Expected: Only teachers visible
2. Use the **Status** filter dropdown
   - Select "Active"
   - Expected: Only active users visible
3. Use the **Search** box
   - Type a user's name
   - Expected: Table filters to matching users
4. Clear all filters
   - Expected: All users visible again

**Expected Results:**
- ✅ Filters work correctly with real data
- ✅ No API calls during filtering (client-side filtering)
- ✅ Stats cards remain unchanged (show total, not filtered)

---

### Test 6: Loading State

**Objective:** Verify loading indicators appear during API calls

**Steps:**
1. Refresh the page (F5)
2. Observe the loading state
3. Throttle network in DevTools (Fast 3G)
4. Refresh again to see longer loading

**Expected Results:**
- ✅ Loading spinner visible during data fetch
- ✅ Table shows loading skeleton or message
- ✅ "Loading..." text visible
- ✅ No error or blank state

---

### Test 7: Error Handling

**Objective:** Test error scenarios and retry functionality

**Steps:**
1. Stop the backend server:
   ```powershell
   # In a terminal
   Get-Process | Where-Object {$_.Name -eq "python"} | Stop-Process
   ```
2. Refresh the District Portal page
3. Observe error state
4. Restart backend:
   ```powershell
   cd c:\Users\ofema\aivo-learning\services\api-gateway
   & ".\venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 9000
   ```
5. Click **"Retry"** button in the UI

**Expected Results:**
- ✅ Error message appears: "Failed to load users"
- ✅ Retry button visible
- ✅ Click retry → loading → data appears
- ✅ Console shows network error

---

### Test 8: User Details View

**Objective:** Verify individual user fetch works

**Steps:**
1. Click on a user row (if implemented)
2. Observe API call:
   ```
   GET http://127.0.0.1:9000/api/v1/admin/users/{user_id}
   ```

**Expected Results:**
- ✅ User details modal/page appears
- ✅ Shows full user information
- ✅ Data matches API response

**Note:** If not implemented, this is a future enhancement.

---

## 🔍 API Endpoint Validation (via Swagger)

### Endpoints to Test Manually:

1. **GET /api/v1/admin/users** - List users
   - Try with filters: `?role=teacher`, `?is_active=true`, `?search=john`
   - Expected: Filtered results

2. **POST /api/v1/admin/users** - Create user
   - Try with valid data
   - Try with duplicate email (should fail)
   - Try with invalid email format (should fail)

3. **GET /api/v1/admin/users/{user_id}** - Get single user
   - Try with valid user ID
   - Try with invalid ID (404 expected)

4. **PATCH /api/v1/admin/users/{user_id}** - Update user
   - Update name, email, role, school
   - Expected: Updated user returned

5. **POST /api/v1/admin/users/{user_id}/activate** - Activate
   - Try on inactive user
   - Expected: `is_active = true`

6. **POST /api/v1/admin/users/{user_id}/deactivate** - Deactivate
   - Try on active user
   - Expected: `is_active = false`

7. **GET /api/v1/admin/users/stats/summary** - Get stats
   - Expected: Total counts by role and status

---

## 📊 Success Criteria

### Must Pass (Critical)
- [ ] Page loads without errors
- [ ] Users fetch from real API (not mock data)
- [ ] Create user works end-to-end
- [ ] Activate/deactivate updates database
- [ ] Stats cards show real counts
- [ ] Loading states appear during API calls
- [ ] Error handling works (retry functionality)

### Should Pass (Important)
- [ ] Filters work correctly
- [ ] Search works
- [ ] No console errors
- [ ] Network requests use correct authentication
- [ ] Data refreshes after mutations

### Nice to Have
- [ ] User details view works
- [ ] Edit user functionality
- [ ] Delete user functionality
- [ ] Bulk operations

---

## 🐛 Known Issues to Watch For

### Issue 1: CORS Errors
**Symptom:** Network tab shows CORS policy errors  
**Fix:** Backend should have CORS middleware configured  
**Check:** `app/main.py` should have:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: Authentication Token Missing
**Symptom:** 401 Unauthorized on API calls  
**Fix:** Login first, then access UserManagement  
**Check:** localStorage should have `access_token`

### Issue 3: Stats Not Updating
**Symptom:** Stats cards don't change after mutations  
**Fix:** Ensure `fetchStats()` is called after create/delete  
**Check:** UserManagement.tsx has stats refresh in mutation handlers

---

## 📸 Screenshots to Capture

1. ✅ User table with real data loaded
2. ✅ Stats cards showing actual counts
3. ✅ Create User modal filled out
4. ✅ Network tab showing successful API calls
5. ✅ User activated/deactivated (before/after)
6. ✅ Loading state during API fetch
7. ✅ Error state with retry button

---

## 🎯 Performance Metrics

### Expected Load Times
- Initial page load: < 1 second
- User list fetch: < 500ms
- Stats fetch: < 300ms
- Create user: < 800ms
- Activate/deactivate: < 400ms

### Network Activity
- User list request size: < 50KB
- Stats request size: < 5KB
- Total requests: 2 (users + stats)

---

## ✅ Final Validation Checklist

After testing all scenarios:

- [ ] All API calls return 200/201 responses
- [ ] No console errors in browser DevTools
- [ ] No network errors (except intentional error test)
- [ ] Data persists after page refresh
- [ ] Created users visible in database
- [ ] Stats match actual database counts
- [ ] Loading states appear and disappear correctly
- [ ] Error handling works as expected

---

## 🚀 Next Steps After Validation

If all tests pass:
1. ✅ Mark District Portal integration as **Production Ready**
2. 📸 Take screenshots for documentation
3. 🎉 Celebrate the quick win!
4. ➡️ Move to Parent Portal frontend integration

If tests fail:
1. 🐛 Document issues found
2. 🔧 Fix bugs
3. 🔄 Re-test
4. 📝 Update implementation notes

---

**Happy Testing! 🎉**

*Remember: This is the first real API integration - any issues found now will help us refine the pattern for other portals.*

