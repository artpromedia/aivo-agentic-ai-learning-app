# 🎭 RBAC System - Visual Guide

## Admin Portal - RBAC Management Page

### Page Location
**URL**: `http://localhost:5007/rbac`
**Navigation**: Admin Portal → Platform → RBAC (marked with "new" badge)

---

## 🎨 UI Components

### 1. Current User Banner
```
┌─────────────────────────────────────────────────────────────┐
│ 🟣 Currently Impersonating                                   │
│    Alice Global                                              │
│    alice@aivo.ai                          [Global Admin]     │
└─────────────────────────────────────────────────────────────┘
```
- **Gradient purple background**
- Shows currently active user
- Displays all assigned roles
- Updates instantly on impersonation

### 2. Role Definitions Grid
```
┌──────────────────┬──────────────────┬──────────────────┐
│ 👑 Global Admin  │ 💰 Finance Admin │ 🔧 Tech Support  │
│ Level 1          │ Level 2          │ Level 2          │
│ Full system...   │ Manage billing.. │ Manage API keys..│
│ [7 permissions▼] │ [7 permissions▼] │ [9 permissions▼] │
├──────────────────┼──────────────────┼──────────────────┤
│ ⚖️ Legal & Comp  │ 🏛️ District Admin│ 🏫 School Admin  │
│ Level 2          │ Level 3          │ Level 4          │
│ Access audit...  │ Manage schools...│ Manage teachers..│
│ [8 permissions▼] │ [6 permissions▼] │ [4 permissions▼] │
├──────────────────┼──────────────────┼──────────────────┤
│ 👨‍🏫 Teacher      │ 👪 Parent        │ 🎓 Learner       │
│ Level 5          │ Level 6          │ Level 10         │
│ Manage classroom │ View child...    │ Access learning..│
│ [6 permissions▼] │ [4 permissions▼] │ [4 permissions▼] │
└──────────────────┴──────────────────┴──────────────────┘
```
- **3-column responsive grid**
- Color-coded badges per role
- Expandable permission lists
- Hierarchy level indicators

### 3. User Management Cards
```
┌─────────────────────────────────────────────────────────────┐
│ Alice Global [Current]                         [🎭 Imperson] │
│ alice@aivo.ai                                   [Remove]      │
│ Created 1/1/2024 • Last login 1/20/2025                     │
│                                                               │
│ ☑ Active    ☑ MFA Enabled                                   │
│                                                               │
│ Roles: [👑 Global Admin]                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Finn Finance                                   [🎭 Imperson] │
│ finn@aivo.ai                                    [Remove]      │
│ Created 1/2/2024 • Last login 1/20/2025                     │
│                                                               │
│ ☑ Active    ☑ MFA Enabled                                   │
│                                                               │
│ Roles: [💰 Finance Admin]                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Pat Viewer                                     [🎭 Imperson] │
│ pat@aivo.ai                                     [Remove]      │
│ Created 1/6/2024                                             │
│                                                               │
│ ☑ Active    ☐ MFA Enabled                                   │
│                                                               │
│ Roles: (Click badges to add/remove)                          │
│ [👑][💰][🔧][⚖️][🏛️][🏫][👨‍🏫][👪][🎓]                         │
└─────────────────────────────────────────────────────────────┘
```
- **Individual user cards**
- One-click impersonation
- Toggle active/MFA status
- Click role badges to add/remove
- Faded badges = role not assigned
- Bright badges = role assigned

### 4. Add User Modal
```
        ┌─────────────────────────────┐
        │ Add New User                │
        ├─────────────────────────────┤
        │                             │
        │ Name                        │
        │ [________________]          │
        │                             │
        │ Email                       │
        │ [________________]          │
        │                             │
        │ Roles                       │
        │ ☐ [👑 Global Admin]         │
        │ ☐ [💰 Finance Admin]        │
        │ ☐ [🔧 Tech Support]         │
        │ ☐ [⚖️ Legal & Compliance]   │
        │ ☐ [🏛️ District Admin]       │
        │ ☐ [🏫 School Admin]         │
        │ ☐ [👨‍🏫 Teacher]             │
        │ ☐ [👪 Parent]               │
        │ ☐ [🎓 Learner]              │
        │                             │
        │ [Cancel]    [Add User]      │
        └─────────────────────────────┘
```
- **Modal dialog**
- Name and email inputs
- Multi-select role checkboxes
- Add button creates user instantly

---

## 🎯 Workflows

### Workflow 1: Test Finance Features

```
1. Click "🎭 Impersonate" on Finn Finance
   ↓
2. Banner updates: "Currently Impersonating: Finn Finance"
   ↓
3. Navigate to billing or finance pages
   ↓
4. Verify finance-specific features visible
   ↓
5. Try accessing tech support features (should fail)
   ↓
6. Return to RBAC page, impersonate different user
```

### Workflow 2: Create Test User

```
1. Click "+ Add User" button
   ↓
2. Enter name: "Test User"
   ↓
3. Enter email: "test@example.com"
   ↓
4. Check roles: Teacher, School Admin
   ↓
5. Click "Add User"
   ↓
6. User appears in list with selected roles
   ↓
7. Click "🎭 Impersonate" to test
```

### Workflow 3: Modify User Roles

```
1. Find user "Pat Viewer" (no roles)
   ↓
2. Click faded [👨‍🏫 Teacher] badge
   ↓
3. Badge becomes bright (role added)
   ↓
4. Click "🎭 Impersonate"
   ↓
5. Test teacher-specific features
   ↓
6. Return, click bright badge to remove role
```

---

## 🎨 Color Scheme

### Role Colors

| Role | Color | Example |
|------|-------|---------|
| Global Admin | Black + White | `bg-black text-white` |
| Finance Admin | Green | `bg-emerald-100 text-emerald-800` |
| Tech Support | Indigo | `bg-indigo-100 text-indigo-800` |
| Legal & Compliance | Amber | `bg-amber-100 text-amber-800` |
| District Admin | Blue | `bg-blue-100 text-blue-800` |
| School Admin | Cyan | `bg-cyan-100 text-cyan-800` |
| Teacher | Purple | `bg-purple-100 text-purple-800` |
| Parent | Pink | `bg-pink-100 text-pink-800` |
| Learner | Yellow | `bg-yellow-100 text-yellow-800` |

### UI Colors
- **Current User Banner**: Purple gradient (`from-indigo-600 to-purple-600`)
- **Active Card Border**: Blue (`border-indigo-500 bg-indigo-50`)
- **Inactive Card Border**: Gray (`border-neutral-200`)
- **Buttons**: Indigo primary, Gray secondary, Red danger

---

## 📱 Responsive Design

### Desktop (1600px+)
```
┌────────────────────────────────────────────────────┐
│ Header                                      [Buttons]│
├────────────────────────────────────────────────────┤
│ [Current User Banner - Full Width]                 │
├────────────────────────────────────────────────────┤
│ [Role 1] [Role 2] [Role 3]                         │
│ [Role 4] [Role 5] [Role 6]                         │
│ [Role 7] [Role 8] [Role 9]                         │
├────────────────────────────────────────────────────┤
│ [User Card 1]                                       │
│ [User Card 2]                                       │
│ [User Card 3]                                       │
└────────────────────────────────────────────────────┘
```

### Tablet (768px - 1599px)
```
┌─────────────────────────────────┐
│ Header                [Buttons] │
├─────────────────────────────────┤
│ [Current User Banner]           │
├─────────────────────────────────┤
│ [Role 1] [Role 2]               │
│ [Role 3] [Role 4]               │
│ [Role 5] [Role 6]               │
│ [Role 7] [Role 8]               │
│ [Role 9]                        │
├─────────────────────────────────┤
│ [User Card 1]                   │
│ [User Card 2]                   │
└─────────────────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────────┐
│ Header             │
│ [+ Add]  [🔄 Reset]│
├────────────────────┤
│ [Current User]     │
│ Banner - Stacked   │
├────────────────────┤
│ [Role 1]           │
│ [Role 2]           │
│ [Role 3]           │
│ ... (scrollable)   │
├────────────────────┤
│ [User Card 1]      │
│ (full width)       │
│ [User Card 2]      │
└────────────────────┘
```

---

## 🔔 Interactive Elements

### Hover States
- **Role Badges**: Slight opacity change
- **User Cards**: Border color change
- **Buttons**: Background color shift
- **Impersonate Button**: Purple highlight

### Click Actions
- **Role Badge (assigned)**: Remove role
- **Role Badge (unassigned)**: Add role
- **Impersonate**: Switch to user + log to console
- **Remove**: Delete user (with confirmation)
- **Active/MFA Checkboxes**: Toggle immediately
- **+ Add User**: Open modal
- **🔄 Reset**: Restore defaults + log to console

### Animations
- **Card Hover**: Smooth border transition (300ms)
- **Badge Toggle**: Opacity transition (300ms)
- **Modal**: Fade in background + scale modal
- **Banner Update**: Smooth color transition

---

## 🎓 Learning Path

### For New Developers
1. **Explore Role Definitions** (5 min)
   - Read each role's description
   - Expand permission lists
   - Note hierarchy levels

2. **Try Impersonation** (10 min)
   - Impersonate Finn Finance
   - Check what you can access
   - Try other users

3. **Modify Roles** (5 min)
   - Give Pat Viewer some roles
   - Test the changes
   - Remove roles

4. **Create Users** (5 min)
   - Add a new test user
   - Assign multiple roles
   - Impersonate and test

### For QA Testing
1. **Test Access Matrix** (30 min)
   - Create spreadsheet of roles × pages
   - Impersonate each role
   - Verify correct access

2. **Permission Boundaries** (20 min)
   - Test edge cases
   - Try invalid combinations
   - Verify forbidden pages

3. **State Persistence** (10 min)
   - Refresh page
   - Check if user persists
   - Test localStorage

---

## 🚀 Quick Start

### 1. Start the Server
```bash
cd apps/admin-portal
pnpm dev
```

### 2. Open RBAC Page
```
http://localhost:5007/rbac
```

### 3. Try Impersonation
```
Click "🎭 Impersonate" on any user
```

### 4. Test Access
```
Navigate to different pages
Observe permission differences
```

### 5. Reset When Done
```
Click "🔄 Reset to Defaults"
```

---

## 📊 Status Indicators

### User Card Status
- **[Current]** badge = Currently active user
- **[Inactive]** badge = Disabled account
- **Bright role badges** = Assigned roles
- **Faded role badges** = Available roles

### Console Logs
```javascript
🎭 Now impersonating: Finn Finance (finn@aivo.ai)
🎭 Stopped impersonation, returned to default user
🔄 Reset to default users
```

---

## 🎯 Success Criteria

✅ Page loads without errors
✅ All 9 roles display correctly
✅ Current user banner shows accurate info
✅ Impersonation works instantly
✅ Role toggles update immediately
✅ Add user creates successfully
✅ Remove user deletes correctly
✅ State persists across refreshes
✅ Console logs show operations
✅ Responsive on all screen sizes

---

**Status**: ✅ Ready for Demo
**Last Updated**: January 2025
