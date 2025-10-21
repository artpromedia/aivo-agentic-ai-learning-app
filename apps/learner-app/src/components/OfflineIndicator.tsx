import { useState, useEffect } from 'react';
import { getOfflineQueue } from '@aivo/utils';
import type { SyncResult } from '@aivo/utils';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  useEffect(() => {
    const queue = getOfflineQueue();

    // Update queue size
    const updateQueueSize = () => {
      setQueueSize(queue.size());
    };

    // Update online status
    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      updateQueueSize();

      try {
        const result = await queue.syncAll();
        setLastSyncResult(result);
        updateQueueSize();
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateQueueSize();
    };

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial update
    updateQueueSize();

    // Poll queue size every 5 seconds when offline
    const interval = setInterval(() => {
      if (!isOnline) {
        updateQueueSize();
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  // Don't show if online and queue is empty
  if (isOnline && queueSize === 0 && !lastSyncResult) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="mb-2 rounded-lg bg-orange-500 px-4 py-3 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
            <div>
              <p className="font-semibold">You're offline</p>
              <p className="text-sm text-orange-100">
                Your progress is being saved locally
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Queue indicator */}
      {queueSize > 0 && (
        <div className="mb-2 rounded-lg bg-blue-500 px-4 py-3 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <svg
              className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <div>
              <p className="font-semibold">
                {isSyncing ? 'Syncing...' : `${queueSize} activities to sync`}
              </p>
              <p className="text-sm text-blue-100">
                {isSyncing
                  ? 'Uploading your progress'
                  : 'Will sync when you reconnect'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sync result notification */}
      {lastSyncResult && lastSyncResult.syncedCount > 0 && (
        <div
          className={`rounded-lg px-4 py-3 shadow-lg ${
            lastSyncResult.success
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {lastSyncResult.success ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              )}
            </svg>
            <div>
              <p className="font-semibold">
                {lastSyncResult.success
                  ? 'All caught up!'
                  : 'Partially synced'}
              </p>
              <p className="text-sm opacity-90">
                {lastSyncResult.syncedCount} activities synced
                {lastSyncResult.failedCount > 0 &&
                  `, ${lastSyncResult.failedCount} failed`}
              </p>
            </div>
            <button
              onClick={() => setLastSyncResult(null)}
              className="ml-auto"
              aria-label="Dismiss"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
