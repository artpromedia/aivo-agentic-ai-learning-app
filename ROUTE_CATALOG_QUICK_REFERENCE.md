# Route Catalog Quick Reference

## Quick Access

**URL**: `http://localhost:5008/routes`

**Navigation**: Admin Portal → Platform → Routes (dev badge)

## Common Tasks

### Browse All Routes

1. Visit `/routes`
2. See all 20+ registered admin portal routes
3. View organized by category

### Search for Routes

```
Search box → Type "user" → See user management routes
Search box → Type "api" → See API and integration routes
```

### Filter by Category

- **Admin**: Dashboard, users, schools, devices
- **Developer**: API keys, route catalog, system health
- **Settings**: Configuration and profile pages

### Filter by Access

- **All Routes**: Show everything
- **Accessible to Me**: Only routes you can access
- **Restricted from Me**: Routes you cannot access

### Test a Route

1. Find route in catalog
2. Click the blue route path link
3. Page navigates to that route
4. Verify it loads correctly

### Copy Route Path

1. Find route in catalog
2. Click 📋 icon next to path
3. Path copied to clipboard
4. Paste wherever needed

### Generate Tests

#### Playwright

1. Filter routes as needed
2. Click "Copy Playwright Test"
3. Paste into `.spec.ts` file
4. Run with `pnpm test`

#### Jest

1. Filter routes as needed
2. Click "Copy Jest Test"
3. Paste into `.test.tsx` file
4. Run with `pnpm test`

## Browser Console

### View All Routes

```javascript
window.__ROUTES
// Returns array of all routes

window.__ROUTES.length
// Shows total count
```

### Navigate Programmatically

```javascript
window.__NAVIGATE('/dashboard')
window.__NAVIGATE('/users')
window.__NAVIGATE('/api-keys')
```

### Check Current Route

```javascript
window.__CURRENT_ROUTE
// Returns current path like "/dashboard"
```

### Find Specific Routes

```javascript
// By category
window.__ROUTES.filter(r => r.category === 'admin')

// By role
window.__ROUTES.filter(r => r.roles?.includes('global_admin'))

// By title
window.__ROUTES.filter(r => r.title.includes('User'))

// Public routes only
window.__ROUTES.filter(r => !r.roles || r.roles.length === 0)
```

## Color Coding

🟢 **Green Border**: You have access to this route  
🔴 **Red Border**: Route is restricted from you

## Badges

- **Public**: No role requirements (green badge)
- **Role Names**: Required roles (blue badges)
- **Test ID**: Data-testid for automation (purple badge)
- **Category**: Route category (gray badge)

## Testing Workflow

### Manual Testing

1. Open route catalog
2. Filter to category you want to test
3. Click each route link
4. Verify page loads correctly
5. Test functionality
6. Move to next route

### Automated Testing

1. Open route catalog
2. Click "Copy Playwright Test"
3. Create new test file
4. Paste generated code
5. Customize assertions
6. Run test suite

### Role Testing

1. Open route catalog
2. Use "View As" selector (top right)
3. Switch to different role
4. Verify accessible routes change colors
5. Test restricted routes show error
6. Switch back to admin

## Keyboard Shortcuts

- **Tab**: Navigate between filters
- **Enter**: Submit search
- **Click route**: Navigate to route
- **Ctrl+C**: Copy (when using copy buttons)

## Tips

### For Developers

- Add routes to `apps/admin-portal/src/routes/definitions.ts`
- Use consistent test IDs: `page-{screen-name}`
- Include role requirements
- Add helpful descriptions

### For QA Engineers

- Use filters to focus on specific features
- Generate tests early in development
- Test with multiple roles
- Bookmark common routes

### For Testers

- Start with "Accessible to Me" filter
- Test edge cases (params, auth)
- Verify error handling
- Check mobile responsiveness

## Common Filters

```typescript
// Developer tools only
Category: developer

// Admin management pages
Category: admin

// Pages I can access
Access: accessible to me

// Search all API-related
Search: "api"
```

## Route Information

Each route card shows:

1. **Path**: The URL path (e.g., `/users/:id`)
2. **Title**: Human-readable name
3. **Description**: What the page does
4. **Category**: Feature grouping
5. **Roles**: Who can access it
6. **Test ID**: For automation
7. **Access Status**: ✓ Accessible or ✗ Restricted

## Integration

### With RBAC

- Routes respect role-based access control
- Access status updates with user role changes
- Backend enforces permissions (not just UI)

### With Navigation

- Route links use React Router
- Browser history tracked
- Back/forward buttons work

### With Audit System

- Route access logged
- User impersonation tracked
- Compliance-friendly

## Troubleshooting

### Route Not Showing

- Check if it's in `definitions.ts`
- Verify `initializeAdminRoutes()` called
- Check browser console for errors

### Can't Navigate to Route

- Verify you have required role
- Check backend route exists
- Look for RBAC middleware errors

### Copy Function Not Working

- Check clipboard permissions
- Try in different browser
- Look for console errors

### Wrong Routes Shown

- Clear search filter
- Reset category to "All Categories"
- Reset access to "All Routes"

## Help & Support

### Documentation

- Full docs: `PROMPT_34_ROUTE_CATALOG_COMPLETE.md`
- Route registry: `packages/utils/src/routeRegistry.ts`
- Page code: `apps/admin-portal/src/pages/RouteCatalog.tsx`

### Getting Started

1. Start admin portal: `pnpm --filter admin-portal dev`
2. Visit: `http://localhost:5008/routes`
3. Browse routes
4. Try filtering and searching
5. Generate a test
6. Run the test

### Questions?

- Check `PROMPT_34_ROUTE_CATALOG_COMPLETE.md` for detailed info
- Look at route definitions for examples
- Review generated tests for patterns
- Open browser console for debugging

---

**Quick Start**: Visit `http://localhost:5008/routes` → Browse → Filter → Test → Copy
