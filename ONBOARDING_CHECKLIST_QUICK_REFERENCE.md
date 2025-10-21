# Onboarding Checklist Quick Reference

## Quick Access

**Demo URL**: `http://localhost:3000/onboarding-demo`

**Component**: `apps/web/src/components/OnboardingChecklist/OnboardingChecklist.tsx`

**Types**: `packages/types/src/onboarding.ts`

## Usage

### Basic Implementation

```typescript
import { OnboardingChecklist } from '../components/OnboardingChecklist';

function Dashboard() {
  return (
    <div>
      <OnboardingChecklist />
    </div>
  );
}
```

### Access Progress Data

```javascript
// In browser console or code
const progress = JSON.parse(localStorage.getItem('onboarding_progress'));

// Check completed tasks
progress.tasks.filter(t => t.completed).length

// Check required tasks remaining
progress.tasks.filter(t => t.priority === 'required' && !t.completed).length

// Get completion percentage
Math.round((progress.tasks.filter(t => t.completed).length / progress.tasks.length) * 100)
```

## Default Tasks (8 Total)

### Required (3)
1. ✅ **Complete Your Profile** → `/settings/profile`
2. ✅ **Enable 2FA** → `/settings/security` (requires: profile)
3. ✅ **Add First Learner** → `/learners/new` (requires: profile)

### Recommended (3)
4. 🟡 **Baseline Assessment** → `/assessment/baseline` (requires: learner)
5. 🟡 **Upload IEP** → `/iep/upload` (requires: learner)
6. 🟡 **First Activity** → `/activities` (requires: learner + baseline)

### Optional (2)
7. 🔵 **Platform Tour** → `/tour`
8. 🔵 **Mobile App** → `https://apps.aivo.ai` (external)

## Categories

- **Account** (3 tasks): Profile, Tour, Mobile App
- **Security** (1 task): Two-Factor Authentication
- **Content** (2 tasks): Add Learner, Upload IEP
- **Learning** (2 tasks): Baseline Assessment, First Activity

## Features

✅ **Interactive Checkboxes** - Check off tasks as you complete them  
✅ **Smart Dependencies** - Tasks unlock when prerequisites are met  
✅ **Priority Levels** - Required (red), Recommended (orange), Optional (blue)  
✅ **Progress Bar** - Visual percentage complete  
✅ **Category Filters** - Focus on specific types of tasks  
✅ **Collapsible** - Minimize to save screen space  
✅ **Persistent** - Saves to localStorage automatically  
✅ **Action Buttons** - Direct links to complete tasks  

## User Actions

### Check/Uncheck Task
- Click checkbox next to task
- Completed tasks turn green
- Completion date recorded

### Filter Tasks
- Click category button (All, Incomplete, Account, etc.)
- Only matching tasks shown
- Task counts update dynamically

### Collapse/Expand
- Click "Collapse" to minimize
- Click "Expand" to restore
- Header always visible

### Dismiss Checklist
- Click X button in top-right
- Confirms if required tasks incomplete
- Hides checklist permanently (until reset)

### Reset Progress
- Click "Reset Progress" button
- Confirms action
- Clears all progress and localStorage

## Testing Tips

1. **Test Dependencies**
   - Complete profile first
   - Verify MFA and Learner become enabled
   - Add learner
   - Verify baseline and IEP become enabled

2. **Test Persistence**
   - Complete some tasks
   - Refresh page (F5)
   - Verify tasks still checked

3. **Test Filtering**
   - Click each category
   - Count tasks shown
   - Verify correct tasks displayed

4. **Test Completion**
   - Check all 8 tasks
   - Look for 🎉 completion message
   - Verify 100% progress

## LocalStorage Structure

```json
{
  "userId": "current-user",
  "startedAt": "2025-10-20T12:00:00.000Z",
  "completedAt": null,
  "currentStep": 0,
  "totalSteps": 3,
  "dismissed": false,
  "tasks": [
    {
      "id": "profile",
      "title": "Complete Your Profile",
      "completed": false,
      "completedAt": null
    }
  ]
}
```

## Data Attributes for Testing

```typescript
data-testid="onboarding-checklist"       // Main component
data-testid="toggle-checklist"           // Collapse/expand button
data-testid="dismiss-checklist"          // Dismiss button
data-testid="filter-all"                 // All filter button
data-testid="filter-incomplete"          // Incomplete filter button
data-testid="task-profile"               // Specific task card
data-testid="task-checkbox-profile"      // Specific checkbox
data-testid="task-action-profile"        // Specific action button
data-testid="reset-checklist"            // Reset button
```

## Customization

### Change Tasks

Edit `DEFAULT_TASKS` array in component:

```typescript
const DEFAULT_TASKS: OnboardingTask[] = [
  {
    id: 'my-task',
    title: 'My Custom Task',
    description: 'Description here',
    category: 'account',
    priority: 'required',
    completed: false,
    action: {
      label: 'Do It',
      path: '/my-path',
    },
  },
];
```

### Add Category

1. Update type in `packages/types/src/onboarding.ts`:
   ```typescript
   category: 'account' | 'security' | 'content' | 'learning' | 'mycategory';
   ```

2. Add filter button in component:
   ```tsx
   <button onClick={() => setFilterCategory('mycategory')}>
     My Category
   </button>
   ```

### Change Styling

Update Tailwind classes in component:
- Main container: `border-blue-200 bg-blue-50`
- Progress bar: `from-blue-500 to-blue-600`
- Completed tasks: `bg-green-50 border-green-300`
- Filter buttons: `bg-blue-600 text-white`

## Integration Examples

### Parent Portal Dashboard

```typescript
import { OnboardingChecklist } from '@aivo/web/components/OnboardingChecklist';

export function ParentDashboard() {
  return (
    <div className="space-y-6">
      <OnboardingChecklist />
      <div className="grid grid-cols-2 gap-6">
        {/* Dashboard widgets */}
      </div>
    </div>
  );
}
```

### Conditional Display

```typescript
function Dashboard() {
  const progress = useLocalStorage('onboarding_progress');
  const showOnboarding = !progress?.dismissed && 
                         progress?.tasks.some(t => !t.completed);

  return (
    <div>
      {showOnboarding && <OnboardingChecklist />}
      {/* Rest of dashboard */}
    </div>
  );
}
```

## Keyboard Shortcuts

- **Tab** - Navigate between elements
- **Space** - Toggle checkbox (when focused)
- **Enter** - Click action button (when focused)
- **Escape** - Close (if modal version)

## Browser Console Commands

```javascript
// View all tasks
JSON.parse(localStorage.getItem('onboarding_progress')).tasks

// Complete all tasks
const p = JSON.parse(localStorage.getItem('onboarding_progress'));
p.tasks.forEach(t => { t.completed = true; t.completedAt = new Date(); });
localStorage.setItem('onboarding_progress', JSON.stringify(p));

// Reset progress
localStorage.removeItem('onboarding_progress');
location.reload();

// Check specific task
const p = JSON.parse(localStorage.getItem('onboarding_progress'));
const task = p.tasks.find(t => t.id === 'profile');
task.completed = true;
task.completedAt = new Date();
localStorage.setItem('onboarding_progress', JSON.stringify(p));
```

## Common Issues

### Progress Not Saving
**Cause**: localStorage disabled or full  
**Fix**: Check browser settings, clear other data

### Tasks Not Unlocking
**Cause**: Dependency not met  
**Fix**: Complete prerequisite tasks first

### Component Not Rendering
**Cause**: Missing import or types  
**Fix**: Verify imports and run `pnpm install`

### Styling Broken
**Cause**: Tailwind not loaded  
**Fix**: Check PostCSS config, verify Tailwind imports

## Performance Tips

- Component is lightweight (~450 lines)
- No API calls (all client-side)
- LocalStorage updates only on change
- Minimal re-renders with React best practices
- Filter operations are instant (client-side)

## Accessibility

✅ Keyboard navigable  
✅ Screen reader friendly  
✅ ARIA labels on interactive elements  
✅ Color contrast passes WCAG AA  
✅ Focus indicators visible  
✅ Descriptive link text  

## Mobile Responsive

- Horizontal scroll for filters
- Touch-friendly checkboxes
- Readable text sizes
- Proper spacing for touch
- Collapsible to save space

## Summary

**8 tasks** across **4 categories** with **3 priority levels**

**Features**: Dependencies, Filters, Progress Bar, Persistence, Actions

**Storage**: localStorage (`onboarding_progress` key)

**Demo**: `http://localhost:3000/onboarding-demo`

**Status**: ✅ Complete and ready to use!

---

For full documentation, see `PROMPT_35_ONBOARDING_CHECKLIST_COMPLETE.md`
