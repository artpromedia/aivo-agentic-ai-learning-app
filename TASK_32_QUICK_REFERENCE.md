# Offline Mode Quick Reference

## 🚀 Quick Start

### Check Connection Status
```typescript
import { useOfflineStatus } from '@aivo/utils';

const { isOnline, isOffline, isSlow, queueStatus } = useOfflineStatus();
```

### Queue an Action
```typescript
import { offlineManager } from '@aivo/utils';

offlineManager.enqueue('activity.complete', {
  learnerId: '123',
  activityId: '456',
  score: 85,
});
```

### Display Connectivity Banner
```typescript
import { ConnectivityBanner } from './components/ConnectivityBanner';

function App() {
  return (
    <>
      <ConnectivityBanner />
      {/* rest of app */}
    </>
  );
}
```

---

## 📊 Connection Status

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| `online` | 🔄 | Blue | Normal connection, syncing |
| `offline` | 📡 | Red | No internet, saving locally |
| `slow` | 🐌 | Orange | Poor connection, may be delayed |

---

## 🔧 Action Types

| Type | Description | Endpoint |
|------|-------------|----------|
| `activity.complete` | Activity completion | `/api/activities/complete` |
| `progress.update` | Progress update | `/api/progress/update` |
| `drawing.save` | Aivo Pad drawing | `/api/drawings/save` |

---

## 📋 Queue Status Object

```typescript
{
  total: number;        // Total actions in queue
  pending: number;      // Waiting to sync
  processing: number;   // Currently syncing
  failed: number;       // Failed after max retries
  actions: QueuedAction[]; // Full action list
}
```

---

## 🎯 Common Patterns

### Save with Offline Support
```typescript
const { enqueue } = useOfflineStatus();

const saveProgress = async (data) => {
  if (navigator.onLine) {
    // Try direct save
    await fetch('/api/progress', { method: 'POST', body: JSON.stringify(data) });
  } else {
    // Queue for later
    enqueue('progress.update', data);
  }
};
```

### Show Sync Status
```typescript
const { queueStatus } = useOfflineStatus();

return (
  <div>
    {queueStatus.pending > 0 && (
      <p>Syncing {queueStatus.pending} items...</p>
    )}
  </div>
);
```

### Retry Failed Actions
```typescript
const { retryFailed, queueStatus } = useOfflineStatus();

return (
  <>
    {queueStatus.failed > 0 && (
      <button onClick={retryFailed}>
        Retry {queueStatus.failed} Failed Items
      </button>
    )}
  </>
);
```

---

## 🧪 Testing Offline Mode

### Simulate Offline in Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Change "Online" to "Offline"
4. Perform actions in app
5. Switch back to "Online"
6. Watch automatic sync

### Simulate Slow Connection
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Slow 3G" or "Fast 3G"
4. Orange banner should appear

---

## 🔒 Storage Limits

- **Max Queue Size**: 1,000 actions
- **Storage Used**: ~1KB per action
- **Max Storage**: ~1MB total
- **Retention**: Until synced or cleared

---

## ⚡ Performance Tips

1. **Queue Non-Critical Actions**: Don't block UI waiting for sync
2. **Batch Similar Actions**: Combine when possible
3. **Set Reasonable Retries**: Default is 3, adjust as needed
4. **Monitor Queue Size**: Clear completed actions regularly

---

## 📱 Mobile Considerations

- Banner is responsive
- Touch-friendly buttons
- Scrollable queue details
- Works with PWA mode

---

## 🐛 Troubleshooting

### Banner Not Showing
- Check if `ConnectivityBanner` is in component tree
- Verify online with 0 pending actions (banner hidden)
- Check browser console for errors

### Actions Not Syncing
- Verify internet connection
- Check queue status: `offlineManager.getQueueStatus()`
- Look for failed actions with errors
- Try manual retry: `offlineManager.retryFailed()`

### Queue Too Large
- Clear completed: Automatic
- Clear all: `offlineManager.clearQueue()`
- Check for stuck processing actions

---

## 📞 Support

- **File**: `packages/utils/src/offlineManager.ts`
- **Component**: `apps/learner-app/src/components/ConnectivityBanner/`
- **Hook**: `useOfflineStatus()`
- **Manager**: `offlineManager` singleton

---

**Last Updated**: January 20, 2025
