# PROMPT 29 - Browser Testing Checklist

## 🧪 Pre-Testing Setup

### 1. Start Development Server
```bash
pnpm --filter @aivo/web dev
```

### 2. Open Browser
- Navigate to: `http://localhost:5173`
- Open DevTools Console (F12)

---

## ✅ Command Palette Testing

### Basic Functionality
- [ ] **Open with Keyboard Shortcut**
  - Mac: Press `Cmd+K`
  - Windows: Press `Ctrl+K`
  - ✅ Expected: Modal opens with search input focused

- [ ] **Modal Displays Correctly**
  - ✅ Expected: Centered modal with white background
  - ✅ Expected: Search input at top
  - ✅ Expected: Command list below search
  - ✅ Expected: Footer with keyboard hints

- [ ] **All Commands Visible**
  - ✅ Expected: 8 commands displayed
  - ✅ Expected: Grouped by category (Admin, Pages)
  - ✅ Expected: Each command has icon, title, subtitle

### Search Functionality
- [ ] **Search: "admin"**
  - Type: `admin`
  - ✅ Expected: Shows "Admin Portal" and "Admin Users"

- [ ] **Search: "api"**
  - Type: `api`
  - ✅ Expected: Shows "API Keys"

- [ ] **Search: "audit"**
  - Type: `audit`
  - ✅ Expected: Shows "Audit Log"

- [ ] **Search: "xyz"** (no matches)
  - Type: `xyz`
  - ✅ Expected: Shows "No commands found"

- [ ] **Clear Search**
  - Clear input
  - ✅ Expected: All 8 commands reappear

### Keyboard Navigation
- [ ] **Arrow Down (↓)**
  - Open palette, press `↓` key
  - ✅ Expected: First command highlighted (blue background)
  - Press `↓` again
  - ✅ Expected: Second command highlighted

- [ ] **Arrow Up (↑)**
  - Highlight second command, press `↑`
  - ✅ Expected: First command highlighted
  - Press `↑` again
  - ✅ Expected: Last command highlighted (wraps around)

- [ ] **Enter Key (↵)**
  - Highlight "Admin Portal", press `Enter`
  - ✅ Expected: Navigate to `/admin`
  - ✅ Expected: Modal closes

- [ ] **Escape Key (Esc)**
  - Open palette, press `Esc`
  - ✅ Expected: Modal closes

### Mouse Interaction
- [ ] **Hover Over Command**
  - Hover mouse over any command
  - ✅ Expected: Command highlighted

- [ ] **Click Command**
  - Click "Admin Users"
  - ✅ Expected: Navigate to `/admin/admin-users`
  - ✅ Expected: Modal closes

- [ ] **Click Outside Modal**
  - Open palette, click on backdrop (dark area)
  - ✅ Expected: Modal closes

- [ ] **Click Close Button** (if present)
  - Open palette, click X button
  - ✅ Expected: Modal closes

### Edge Cases
- [ ] **Rapid Open/Close**
  - Press `Cmd+K` to open
  - Press `Esc` to close
  - Repeat 5 times quickly
  - ✅ Expected: No errors, smooth operation

- [ ] **Search During Navigation**
  - Type search term while highlighted command changes
  - ✅ Expected: Selection resets to first result

- [ ] **Execute While Searching**
  - Type "admin", press `Enter` immediately
  - ✅ Expected: First matching command executes

---

## ✅ Keyboard Shortcuts Testing

### Setup Test Component
Create a test page with shortcuts:

```tsx
// apps/web/src/pages/ShortcutsTest.tsx
import { useKeyboardShortcuts } from '@aivo/ui';

export function ShortcutsTest() {
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      description: 'Save',
      handler: () => console.log('✅ Save shortcut triggered!'),
    },
    {
      key: 'o',
      ctrl: true,
      description: 'Open',
      handler: () => console.log('✅ Open shortcut triggered!'),
    },
    {
      key: 'p',
      ctrl: true,
      shift: true,
      description: 'Print',
      handler: () => console.log('✅ Print shortcut triggered!'),
    },
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Keyboard Shortcuts Test</h1>
      <ul className="space-y-2">
        <li>Press <kbd>Ctrl+S</kbd> to save</li>
        <li>Press <kbd>Ctrl+O</kbd> to open</li>
        <li>Press <kbd>Ctrl+Shift+P</kbd> to print</li>
      </ul>
      <p className="mt-4 text-sm text-gray-600">Check console for output</p>
    </div>
  );
}
```

### Basic Shortcuts
- [ ] **Single Key with Ctrl**
  - Press `Ctrl+S`
  - ✅ Expected: Console log "Save shortcut triggered!"

- [ ] **Different Key**
  - Press `Ctrl+O`
  - ✅ Expected: Console log "Open shortcut triggered!"

- [ ] **Multiple Modifiers**
  - Press `Ctrl+Shift+P`
  - ✅ Expected: Console log "Print shortcut triggered!"

### Platform Detection
- [ ] **Mac Detection**
  - On Mac, press `Cmd+S`
  - ✅ Expected: Shortcut works (Cmd treated as Ctrl)

- [ ] **Windows Detection**
  - On Windows, press `Ctrl+S`
  - ✅ Expected: Shortcut works

### Conflict Detection
- [ ] **Browser Default Shortcut**
  - Press `Ctrl+S` (browser's Save Page)
  - ✅ Expected: Custom handler triggers (browser default prevented)
  - ✅ Expected: No "Save Page" dialog

### Component Lifecycle
- [ ] **Navigate Away**
  - Go to shortcuts test page
  - Press `Ctrl+S` (works)
  - Navigate to home page
  - Press `Ctrl+S`
  - ✅ Expected: Shortcut does NOT trigger (cleanup worked)

---

## ✅ Notification System Testing

### Setup NotificationProvider
First, wrap app with provider:

```tsx
// apps/web/src/main.tsx or App.tsx
import { NotificationProvider } from '@aivo/ui';

<NotificationProvider>
  <App />
</NotificationProvider>
```

### Create Test Page
```tsx
// apps/web/src/pages/NotificationsTest.tsx
import { useNotifications } from '@aivo/ui';

export function NotificationsTest() {
  const { addNotification, clearAll } = useNotifications();

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Notifications Test</h1>
      
      <button
        onClick={() => addNotification({
          type: 'info',
          title: 'Info',
          message: 'This is an info message',
        })}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Show Info
      </button>

      <button
        onClick={() => addNotification({
          type: 'success',
          title: 'Success',
          message: 'Operation completed successfully',
        })}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Show Success
      </button>

      <button
        onClick={() => addNotification({
          type: 'warning',
          title: 'Warning',
          message: 'Please be careful',
        })}
        className="px-4 py-2 bg-yellow-500 text-white rounded"
      >
        Show Warning
      </button>

      <button
        onClick={() => addNotification({
          type: 'error',
          title: 'Error',
          message: 'Something went wrong',
        })}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Show Error
      </button>

      <button
        onClick={() => addNotification({
          type: 'success',
          title: 'With Action',
          message: 'Click the action button',
          action: {
            label: 'View',
            onClick: () => console.log('Action clicked!'),
          },
        })}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Show With Action
      </button>

      <button
        onClick={clearAll}
        className="px-4 py-2 bg-gray-500 text-white rounded"
      >
        Clear All
      </button>
    </div>
  );
}
```

### Notification Types
- [ ] **Info Notification**
  - Click "Show Info"
  - ✅ Expected: Blue notification appears top-right
  - ✅ Expected: Shows info icon, title, message

- [ ] **Success Notification**
  - Click "Show Success"
  - ✅ Expected: Green notification appears
  - ✅ Expected: Shows checkmark icon

- [ ] **Warning Notification**
  - Click "Show Warning"
  - ✅ Expected: Yellow notification appears
  - ✅ Expected: Shows warning icon

- [ ] **Error Notification**
  - Click "Show Error"
  - ✅ Expected: Red notification appears
  - ✅ Expected: Shows error icon

### Auto-Dismiss
- [ ] **Default Duration (5 seconds)**
  - Show any notification
  - Wait 5 seconds
  - ✅ Expected: Notification auto-dismisses

- [ ] **Custom Duration**
  - Add notification with `duration: 10000` (10 seconds)
  - ✅ Expected: Stays for 10 seconds before dismissing

### Manual Dismiss
- [ ] **Close Button**
  - Show notification
  - Click X button
  - ✅ Expected: Notification dismisses immediately

### Stacking
- [ ] **Multiple Notifications**
  - Click "Show Info" 3 times quickly
  - ✅ Expected: 3 notifications stack vertically
  - ✅ Expected: Newest at bottom

- [ ] **Max Limit (5 notifications)**
  - Click "Show Info" 10 times quickly
  - ✅ Expected: Only 5 notifications visible
  - ✅ Expected: Oldest dismissed as new ones arrive

### Action Buttons
- [ ] **Notification with Action**
  - Click "Show With Action"
  - Click "View" button on notification
  - ✅ Expected: Console log "Action clicked!"
  - ✅ Expected: Notification dismisses

### Clear All
- [ ] **Clear All Notifications**
  - Show 3-4 notifications
  - Click "Clear All" button
  - ✅ Expected: All notifications dismissed immediately

---

## 🌐 Cross-Browser Testing

### Chrome (120+)
- [ ] Command Palette works
- [ ] Keyboard shortcuts work
- [ ] Notifications work
- [ ] Animations smooth

### Firefox (120+)
- [ ] Command Palette works
- [ ] Keyboard shortcuts work
- [ ] Notifications work
- [ ] Animations smooth

### Safari (17+)
- [ ] Command Palette works
- [ ] Cmd+K shortcut works (not Ctrl+K)
- [ ] Notifications work
- [ ] Animations smooth

### Edge (120+)
- [ ] Command Palette works
- [ ] Keyboard shortcuts work
- [ ] Notifications work
- [ ] Animations smooth

---

## 📱 Responsive Testing

### Desktop (1920x1080)
- [ ] Command palette centered
- [ ] Notifications positioned top-right
- [ ] All text readable

### Laptop (1366x768)
- [ ] Command palette fits on screen
- [ ] Notifications don't overlap content
- [ ] Scrolling works if needed

### Tablet (768x1024)
- [ ] Command palette responsive
- [ ] Notifications stack correctly
- [ ] Touch interactions work

### Mobile (375x667)
- [ ] Command palette full-width
- [ ] Notifications fit screen width
- [ ] Touch keyboard doesn't cover content

---

## ♿ Accessibility Testing

### Keyboard Navigation Testing
- [ ] Tab key navigates UI
- [ ] Focus visible on all elements
- [ ] No keyboard traps
- [ ] Esc key closes modals

### Screen Reader
- [ ] Command palette announces opening
- [ ] Commands have proper labels
- [ ] Notifications use role="alert"
- [ ] Action buttons are labeled

### Color Contrast
- [ ] Text readable on all backgrounds
- [ ] Meets WCAG 2.1 AA (4.5:1 ratio)
- [ ] Color not the only indicator

---

## 🐛 Known Issues to Check

### Command Palette Issues
- [ ] Search input loses focus after typing
- [ ] Commands execute twice
- [ ] Modal doesn't close on Esc
- [ ] Navigation fails on command execution

### Keyboard Shortcuts Issues
- [ ] Shortcuts don't unregister on unmount
- [ ] Conflicts with browser shortcuts
- [ ] Meta/Cmd key not detected on Mac
- [ ] Multiple handlers trigger for same shortcut

### Notification Issues
- [ ] Notifications don't auto-dismiss
- [ ] Multiple notifications overlap
- [ ] Action button doesn't dismiss notification
- [ ] Memory leak with timers

---

## 📊 Performance Testing

### Command Palette
- [ ] Opens in < 100ms
- [ ] Search filters in real-time (no lag)
- [ ] Navigation smooth (60 FPS)
- [ ] No memory leaks after 10+ opens

### Notifications
- [ ] Shows in < 50ms
- [ ] Animations smooth (60 FPS)
- [ ] No memory leaks with 100+ notifications
- [ ] Timers properly cleared

---

## ✅ Final Checklist

- [ ] All command palette tests pass
- [ ] All keyboard shortcuts tests pass
- [ ] All notification tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] No memory leaks
- [ ] Cross-browser compatible
- [ ] Responsive on all devices
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Performance acceptable

---

## 📝 Bug Report Template

If you find issues, use this template:

```markdown
### Bug Report

**Feature**: Command Palette / Keyboard Shortcuts / Notifications

**Description**: [What went wrong]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

**Browser**: Chrome 120 / Firefox 120 / Safari 17 / Edge 120

**OS**: Windows 11 / macOS 14 / Linux

**Console Errors**: [Any errors in console]

**Screenshots**: [If applicable]
```

---

**Testing Status**: ⏳ **PENDING BROWSER TESTING**

**Next Step**: Start web app and begin testing with this checklist!
