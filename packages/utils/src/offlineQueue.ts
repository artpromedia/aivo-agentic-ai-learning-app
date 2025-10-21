/**
 * Offline Activity Queue
 * Stores learner activities when offline and syncs when connection is restored
 */

/// <reference lib="dom" />

export interface QueuedActivity {
  id: string;
  learnerId: string;
  activityType: 'reading' | 'math' | 'speech' | 'assessment' | 'reward' | 'progress';
  data: Record<string, unknown>;
  timestamp: Date;
  synced: boolean;
  retryCount: number;
  lastError?: string;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: Array<{ id: string; error: string }>;
}

export class OfflineActivityQueue {
  private queue: QueuedActivity[] = [];
  private readonly STORAGE_KEY = 'aivo_offline_queue';
  private readonly MAX_RETRY_COUNT = 3;
  private isSyncing = false;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Add activity to offline queue
   */
  add(activity: Omit<QueuedActivity, 'id' | 'synced' | 'retryCount'>): string {
    const queuedActivity: QueuedActivity = {
      ...activity,
      id: crypto.randomUUID(),
      synced: false,
      retryCount: 0,
      timestamp: new Date(activity.timestamp),
    };

    this.queue.push(queuedActivity);
    this.saveQueue();

    console.log(`[OfflineQueue] Added activity: ${queuedActivity.id} (${queuedActivity.activityType})`);

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncAll();
    }

    return queuedActivity.id;
  }

  /**
   * Get all unsynced activities
   */
  getUnsynced(): QueuedActivity[] {
    return this.queue.filter((a) => !a.synced);
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.filter((a) => !a.synced).length;
  }

  /**
   * Sync all unsynced activities
   */
  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[OfflineQueue] Sync already in progress');
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: [],
      };
    }

    if (!navigator.onLine) {
      console.log('[OfflineQueue] Cannot sync - offline');
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: [{ id: 'network', error: 'Device is offline' }],
      };
    }

    this.isSyncing = true;
    const unsynced = this.getUnsynced();
    const errors: Array<{ id: string; error: string }> = [];
    let syncedCount = 0;
    let failedCount = 0;

    console.log(`[OfflineQueue] Starting sync of ${unsynced.length} activities`);

    for (const activity of unsynced) {
      try {
        await this.syncActivity(activity);
        activity.synced = true;
        syncedCount++;
        console.log(`[OfflineQueue] Synced: ${activity.id}`);
      } catch (error) {
        activity.retryCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        activity.lastError = errorMessage;

        console.error(`[OfflineQueue] Failed to sync ${activity.id}:`, errorMessage);

        if (activity.retryCount >= this.MAX_RETRY_COUNT) {
          failedCount++;
          errors.push({ id: activity.id, error: errorMessage });
          console.warn(`[OfflineQueue] Max retries reached for ${activity.id}, removing from queue`);
          // Mark as synced to remove from queue after max retries
          activity.synced = true;
        } else {
          failedCount++;
          errors.push({ id: activity.id, error: errorMessage });
        }
      }
    }

    // Remove synced activities
    this.queue = this.queue.filter((a) => !a.synced);
    this.saveQueue();

    this.isSyncing = false;

    const result: SyncResult = {
      success: errors.length === 0,
      syncedCount,
      failedCount,
      errors,
    };

    console.log(`[OfflineQueue] Sync complete: ${syncedCount} synced, ${failedCount} failed`);

    return result;
  }

  /**
   * Sync a single activity to the server
   */
  private async syncActivity(activity: QueuedActivity): Promise<void> {
    const apiUrl = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '/api';
    const endpoint = `${apiUrl}/activities/sync`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if available
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        learnerId: activity.learnerId,
        activityType: activity.activityType,
        data: activity.data,
        timestamp: activity.timestamp,
        offlineId: activity.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' })) as { message?: string };
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log(`[OfflineQueue] Sync response for ${activity.id}:`, result);
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string {
    const token = localStorage.getItem('aivo_access_token');
    return token || '';
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        this.queue = parsed.map((item: QueuedActivity) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        console.log(`[OfflineQueue] Loaded ${this.queue.length} activities from storage`);
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to load queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineQueue] Failed to save queue:', error);
    }
  }

  /**
   * Setup listener for online/offline events
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Device is online, starting sync');
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineQueue] Device is offline');
    });
  }

  /**
   * Clear all activities (for testing/development)
   */
  clear(): void {
    this.queue = [];
    this.saveQueue();
    console.log('[OfflineQueue] Queue cleared');
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number;
    synced: number;
    unsynced: number;
    failed: number;
  } {
    const synced = this.queue.filter((a) => a.synced).length;
    const unsynced = this.queue.filter((a) => !a.synced && a.retryCount === 0).length;
    const failed = this.queue.filter((a) => !a.synced && a.retryCount > 0).length;

    return {
      total: this.queue.length,
      synced,
      unsynced,
      failed,
    };
  }
}

// Singleton instance
let queueInstance: OfflineActivityQueue | null = null;

/**
 * Get or create the offline activity queue instance
 */
export function getOfflineQueue(): OfflineActivityQueue {
  if (!queueInstance) {
    queueInstance = new OfflineActivityQueue();
  }
  return queueInstance;
}

/**
 * Helper function to queue an activity
 */
export function queueActivity(
  learnerId: string,
  activityType: QueuedActivity['activityType'],
  data: Record<string, unknown>
): string {
  const queue = getOfflineQueue();
  return queue.add({
    learnerId,
    activityType,
    data,
    timestamp: new Date(),
  });
}
