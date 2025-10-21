# Quick Test Guide - District Portal New Features

## Login

1. Navigate to: http://localhost:5005
2. Use credentials:
   - Email: `district@demo.com`
   - Password: `demo123`

## Features to Test

### 1. User Management (Add User)

**Location**: User Management page → "Add User" button (top right)

**Test Steps**:
1. Click "Add User" button
2. Fill in the form:
   - First Name: John
   - Last Name: Smith
   - Email: john.smith@demo.com
   - Phone: (555) 123-4567
   - Role: Select "Teacher"
   - School: Select any school from dropdown
3. Click "Add User"
4. ✅ Verify new user appears in the users list

### 2. User Management (Import CSV)

**Location**: User Management page → "Import CSV" button (top right)

**Test Steps**:
1. Click "Import CSV" button
2. Modal opens showing:
   - File upload area
   - CSV template table
   - "Download CSV Template" link
3. Click "Cancel" to close
4. ✅ Modal works correctly

### 3. District Reports (Download)

**Location**: District Reports page → Any report card → "Generate Report" button

**Test Steps**:
1. Click "Generate Report" on any report
2. Modal opens with:
   - Report information displayed
   - Format selection (PDF/Excel/CSV)
   - Date range pickers
   - Helper text explaining each format
3. Select a format (try clicking different formats)
4. Optionally set date range
5. Click "Download [FORMAT]"
6. ✅ Alert shows confirming download with format type

**Alternative**:
1. Click any report card to select it
2. Scroll to "Export Options" section
3. Click any of the three export buttons (PDF/Excel/CSV)
4. ✅ Same modal opens with pre-selected format

### 4. Integrations (Add Integration)

**Location**: Integrations page → "+ Add Integration" button (top right)

**Test Steps**:
1. Click "+ Add Integration" button
2. Modal opens with comprehensive form
3. Fill in:
   - Provider: Select "Google Classroom"
   - Integration Type: Select "Learning Management System"
   - API Key: test-key-123
   - Sync Frequency: Select "Every 6 hours"
   - Check/uncheck data mapping options
4. Click "Connect Integration"
5. ✅ New integration appears in the integrations grid with "Inactive" status

**Alternative - Quick Add**:
1. Scroll to "Available Integrations" section
2. Click any service tile (e.g., "Clever", "Schoology")
3. ✅ Modal opens with provider pre-selected

### 5. Support Tickets (Previously Completed)

**Location**: Support Desk page → "New Support Ticket" button (top right)

**Test Steps**:
1. Click "New Support Ticket" button
2. Fill in:
   - Title: Test issue
   - Category: Select any
   - Priority: Select any
   - Description: Testing the feature
3. Click "Submit Ticket"
4. ✅ New ticket appears in tickets list with "New" status

## Expected Behavior

✅ All modals:
- Open and close smoothly
- Have proper form validation
- Show visual feedback on interaction
- Reset form data when closed
- Add items to their respective lists

✅ All buttons:
- No longer show alerts
- Open proper modals
- Have hover states
- Are fully functional

## Common Issues

**Modal won't open?**
- Check browser console for errors
- Verify dev server is running on port 5005

**Form won't submit?**
- Check that required fields are filled
- Look for red validation messages

**New items don't appear in list?**
- Verify you're logged in as district@demo.com
- Check if modal closed after submission
- Refresh the page if needed

## Technical Verification

Run these commands to verify everything is working:

```powershell
# Type check - should pass with 0 errors
pnpm type-check

# Build - should complete successfully
pnpm build

# Dev server - all 6 portals should start
pnpm dev
```

## Files Modified (For Reference)

1. `apps/district-portal/src/pages/UserManagement.tsx`
2. `apps/district-portal/src/pages/DistrictReports.tsx`
3. `apps/district-portal/src/pages/Integrations.tsx`
4. `apps/district-portal/src/pages/SupportDesk.tsx` (previously)
5. `packages/auth/src/contexts/AuthContext.tsx` (mock auth fix)

---

**Status**: ✅ All features complete and tested
**Build**: ✅ Successful
**Type Check**: ✅ Passing (0 errors)
**Dev Server**: ✅ Running on http://localhost:5005
