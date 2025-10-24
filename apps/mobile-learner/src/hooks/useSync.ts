/**
 * useSync Hook
 * 
 * React hook for accessing sync service functionality
 */

import {useState, useEffect, useCallback} from 'react';
import {syncService, SyncStatus, SyncResult} from '../services/sync/syncService';

interface UseSyncReturn {
  status: SyncStatus;
  lastSyncTime: number;
  isOnline: boolean;
  isSyncing: boolean;
  syncNow: () => Promise<SyncResult>;
}

/**
 * Hook to access sync service
 */
export const useSync = (): UseSyncReturn => {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());
  const [lastSyncTime, setLastSyncTime] = useState<number>(
    syncService.getLastSyncTime()
  );

  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = syncService.addListener((newStatus) => {
      setStatus(newStatus);
      setLastSyncTime(syncService.getLastSyncTime());
    });

    // Initialize sync service
    syncService.initialize();

    return () => {
      unsubscribe();
      syncService.cleanup();
    };
  }, []);

  const syncNow = useCallback(async () => {
    const result = await syncService.forceSyncNow();
    setLastSyncTime(syncService.getLastSyncTime());
    return result;
  }, []);

  return {
    status,
    lastSyncTime,
    isOnline: syncService.isDeviceOnline(),
    isSyncing: syncService.isCurrentlySyncing(),
    syncNow,
  };
};

export default useSync;
