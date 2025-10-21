# 🧪 Authentication Testing Guide

## Quick Start Testing

### 1. Start a Portal

Choose any portal to test:

```powershell
# Admin Portal (localhost:5007)
cd apps/admin-portal
pnpm run dev

# District Portal (localhost:5006)
cd apps/district-portal
pnpm run dev

# Teacher Portal (localhost:5002)
cd apps/teacher-portal
pnpm run dev

# Parent Portal (localhost:5001)
cd apps/parent-portal
pnpm run dev

# Learner App (localhost:5000)
cd apps/learner-app
pnpm run dev
```

### 2. Test Login Flow

1. Open browser to portal URL
2. Should automatically redirect to `/login`
3. See themed login page with demo credentials displayed
4. Enter demo credentials:
   - **Admin:** `admin@demo.com / demo123`
   - **District:** `district@demo.com / demo123`
   - **Teacher:** `teacher@demo.com / demo123`
   - **Parent:** `parent@demo.com / demo123`
   - **Learner:** `student@demo.com / demo123`

5. Click "Sign In"
6. Should redirect to dashboard/home

### 3. Test Protected Routes

- Navigate to different pages using navigation menu
- All routes should work without redirecting to login
- Tokens stored in browser localStorage

### 4. Test Logout

- Click logout button (if available in navigation)
- OR manually navigate to `/login` and logout
- Should clear tokens and redirect to login page
- Try accessing protected route → should redirect back to login

### 5. Test Unauthorized Access

1. Login to one portal (e.g., Teacher Portal)
2. Open new tab and try to access different portal (e.g., Admin Portal)
3. Should redirect to `/unauthorized` page
4. Verify "Access Denied" message displays
5. Click "Logout" to return to login

## Demo Credentials

| Portal | Email | Password | Role |
|--------|-------|----------|------|
| **Admin Portal** | admin@demo.com | demo123 | super-admin |
| **District Portal** | district@demo.com | demo123 | district-admin |
| **Teacher Portal** | teacher@demo.com | demo123 | teacher |
| **Parent Portal** | parent@demo.com | demo123 | parent |
| **Learner App** | student@demo.com | demo123 | learner |

## Browser DevTools Inspection

### Check localStorage

Open DevTools → Application → Local Storage → http://localhost:PORT

Should see:
- `aivo_access_token` - JWT access token
- `aivo_refresh_token` - JWT refresh token  
- `aivo_token_expiry` - Expiration timestamp

### Check Network Requests (Future)

When backend is implemented, you'll see:
- `POST /api/auth/login` - Login request
- `POST /api/auth/refresh` - Token refresh request
- Authorization header on protected API calls

## Test Scenarios

### ✅ Happy Path
1. Visit portal → redirect to login ✓
2. Enter valid credentials → login success ✓
3. Navigate protected routes → works ✓
4. Logout → clears tokens ✓

### ❌ Error Cases
1. Enter wrong password → show error message
2. Access route when logged out → redirect to login
3. Access route with wrong role → redirect to unauthorized
4. Token expires → auto-logout or auto-refresh

### 🔒 Security Tests
1. Manually delete tokens from localStorage → should redirect to login
2. Try accessing admin route as teacher → should redirect to unauthorized
3. Modify token in localStorage → should fail validation (backend needed)

## Known Limitations (Current)

⚠️ **No Backend Yet** - Auth is frontend-only for now:
- Login always succeeds (no actual validation)
- Token refresh is simulated
- No real user data from API
- Can bypass security with manual localStorage manipulation

✅ **What Works:**
- Route protection based on roles
- Login/logout UI flow
- Token storage and retrieval
- Auto-redirect to login/unauthorized
- Demo credential display

## Next: Backend Integration

To make authentication production-ready:

1. **Create API endpoints:**
   ```
   POST /api/auth/login - Validate credentials, return JWT
   POST /api/auth/refresh - Refresh access token
   POST /api/auth/logout - Invalidate refresh token
   GET /api/auth/me - Get current user info
   ```

2. **Update AuthContext** to call real API
3. **Add API interceptors** for automatic token attachment
4. **Implement token refresh** on 401 responses
5. **Add proper error handling** for network failures

## Troubleshooting

### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :5002

# Kill process by PID
taskkill /PID <PID> /F

# Or use different port
pnpm run dev -- --port 5010
```

### Module Not Found Errors
```powershell
# Reinstall dependencies
pnpm install

# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
pnpm install
```

### TypeScript Errors
```powershell
# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Login Not Working
1. Check browser console for errors
2. Verify AuthProvider is wrapping app
3. Check that @aivo/auth package is installed
4. Verify imports are correct

## Success Criteria

You'll know it's working when:
- ✅ Login page appears on first visit
- ✅ Demo credentials are displayed
- ✅ Login redirects to dashboard
- ✅ Protected routes are accessible
- ✅ Logout clears session
- ✅ Unauthorized page shows for wrong role
- ✅ No TypeScript errors in console

## Report Issues

If you encounter issues:
1. Check browser console for errors
2. Check VS Code Problems panel
3. Verify all files were created correctly
4. Check package.json has @aivo/auth dependency
5. Run `pnpm install` to ensure packages are linked

---

**Happy Testing!** 🚀

For full documentation, see **AUTH_INTEGRATION_COMPLETE.md**
