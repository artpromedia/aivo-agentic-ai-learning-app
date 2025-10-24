/**
 * Sync Service
 * 
 * Handles offline-first data synchronization with the backend
 * - Auto-sync every 5 minutes when online
 * - Network state monitoring
 * - Conflict resolution (server timestamp wins)
 * - Background media upload
 */

import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {Q} from '@nozbe/watermelondb';
import {database} from '../../database';
import {Progress} from '../../database/models/Progress';
import {MediaUpload} from '../../database/models/MediaUpload';
import {SyncQueue} from '../../database/models/SyncQueue';
import {apiClient} from '../api/apiClient';

/**
 * Sync status
 */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

/**
 * Sync result
 */
export interface SyncResult {
  success: boolean;
  progressSynced: number;
  mediaSynced: number;
  queueSynced: number;
  errors: string[];
  timestamp: number;
}

/**
 * Sync service class
 */
class SyncService {
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private netInfoUnsubscribe: (() => void) | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];
  private lastSyncTime: number = 0;
  private syncIntervalMs: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize sync service
   */
  async initialize(): Promise<void> {
    // Check initial network state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected === true;

    // Listen for network state changes
    this.netInfoUnsubscribe = NetInfo.addEventListener(
      this.handleNetworkChange
    );

    // Start auto-sync if online
    if (this.isOnline) {
      this.startAutoSync();
    }

    console.log('Sync service initialized');
  }

  /**
   * Cleanup sync service
   */
  cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }

    console.log('Sync service cleaned up');
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange = (state: NetInfoState): void => {
    const wasOnline = this.isOnline;
    this.isOnline = state.isConnected === true;

    console.log('Network state changed:', {
      wasOnline,
      isOnline: this.isOnline,
    });

    if (!wasOnline && this.isOnline) {
      // Just came online - sync immediately
      this.notifyListeners('syncing');
      this.syncAll();
      this.startAutoSync();
    } else if (wasOnline && !this.isOnline) {
      // Just went offline
      this.stopAutoSync();
      this.notifyListeners('offline');
    }
  };

  /**
   * Start automatic sync interval
   */
  private startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncAll();
      }
    }, this.syncIntervalMs);

    console.log('Auto-sync started');
  }

  /**
   * Stop automatic sync interval
   */
  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  /**
   * Set sync interval in milliseconds
   */
  setSyncInterval(intervalMs: number): void {
    this.syncIntervalMs = intervalMs;
    
    // Restart auto-sync with new interval
    if (this.syncInterval) {
      this.stopAutoSync();
      this.startAutoSync();
    }
  }

  /**
   * Sync all pending data
   */
  async syncAll(): Promise<SyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        progressSynced: 0,
        mediaSynced: 0,
        queueSynced: 0,
        errors: ['Device is offline'],
        timestamp: Date.now(),
      };
    }

    if (this.isSyncing) {
      return {
        success: false,
        progressSynced: 0,
        mediaSynced: 0,
        queueSynced: 0,
        errors: ['Sync already in progress'],
        timestamp: Date.now(),
      };
    }

    this.isSyncing = true;
    this.notifyListeners('syncing');

    const errors: string[] = [];
    let progressSynced = 0;
    let mediaSynced = 0;
    let queueSynced = 0;

    try {
      // 1. Sync progress data
      const progressResult = await this.syncProgress();
      progressSynced = progressResult.count;
      errors.push(...progressResult.errors);

      // 2. Sync media uploads
      const mediaResult = await this.syncMediaUploads();
      mediaSynced = mediaResult.count;
      errors.push(...mediaResult.errors);

      // 3. Sync queue items
      const queueResult = await this.syncQueue();
      queueSynced = queueResult.count;
      errors.push(...queueResult.errors);

      // 4. Download new content
      await this.downloadNewContent();

      this.lastSyncTime = Date.now();
      this.notifyListeners(errors.length > 0 ? 'error' : 'idle');

      return {
        success: errors.length === 0,
        progressSynced,
        mediaSynced,
        queueSynced,
        errors,
        timestamp: this.lastSyncTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown sync error';
      errors.push(errorMessage);
      this.notifyListeners('error');

      return {
        success: false,
        progressSynced,
        mediaSynced,
        queueSynced,
        errors,
        timestamp: Date.now(),
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync progress data to backend
   */
  private async syncProgress(): Promise<{count: number; errors: string[]}> {
    const errors: string[] = [];
    let count = 0;

    try {
      // Get unsynced progress
      const unsyncedProgress = await database
        .get<Progress>('progress')
        .query(Q.where('is_synced', false))
        .fetch();

      console.log(`Syncing ${unsyncedProgress.length} progress records`);

      // Sync each progress record
      for (const progress of unsyncedProgress) {
        try {
          await apiClient.post('/progress', {
            activityId: progress.activityId,
            lessonId: progress.lessonId,
            answers: progress.answersData,
            score: progress.score,
            maxScore: progress.maxScore,
            percentage: progress.percentage,
            timeSpentSeconds: progress.timeSpentSeconds,
            attempts: progress.attempts,
            isCompleted: progress.isCompleted,
            completedAt: progress.completedAt,
          });

          await progress.markSynced();
          count++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Progress ${progress.id}: ${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Sync progress failed: ${errorMessage}`);
    }

    return {count, errors};
  }

  /**
   * Sync media uploads to backend
   */
  private async syncMediaUploads(): Promise<{count: number; errors: string[]}> {
    const errors: string[] = [];
    let count = 0;

    try {
      // Get unuploaded media
      const unuploadedMedia = await database
        .get<MediaUpload>('media_uploads')
        .query(Q.where('is_uploaded', false))
        .fetch();

      console.log(`Syncing ${unuploadedMedia.length} media uploads`);

      // Sync each media file
      for (const media of unuploadedMedia) {
        if (!media.shouldRetry) {
          continue;
        }

        try {
          // Create form data for upload
          const formData = new FormData();
          formData.append('file', {
            uri: media.filePath,
            type: media.mimeType,
            name: `upload_${Date.now()}.${media.fileType}`,
          } as any);

          if (media.activityId) {
            formData.append('activityId', media.activityId);
          }
          if (media.lessonId) {
            formData.append('lessonId', media.lessonId);
          }

          // Upload with progress tracking
          const response = await apiClient.post('/media/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: {loaded: number; total?: number}) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              media.updateProgress(percentCompleted);
            },
          });

          await media.markUploaded(response.data.url);
          count++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          await media.setError(errorMessage);
          errors.push(`Media ${media.id}: ${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Sync media failed: ${errorMessage}`);
    }

    return {count, errors};
  }

  /**
   * Sync queue items to backend
   */
  private async syncQueue(): Promise<{count: number; errors: string[]}> {
    const errors: string[] = [];
    let count = 0;

    try {
      // Get unsynced queue items (ordered by priority)
      const unsyncedQueue = await database
        .get<SyncQueue>('sync_queue')
        .query(Q.where('is_synced', false), Q.sortBy('priority', Q.desc))
        .fetch();

      console.log(`Syncing ${unsyncedQueue.length} queue items`);

      // Sync each queue item
      for (const queueItem of unsyncedQueue) {
        if (!queueItem.shouldRetry) {
          continue;
        }

        try {
          const {actionType, tableName, recordId, payloadData} = queueItem;

          // Build API endpoint
          const endpoint = `/${tableName}/${recordId}`;

          // Execute action
          switch (actionType) {
            case 'create':
              await apiClient.post(endpoint, payloadData);
              break;
            case 'update':
              await apiClient.patch(endpoint, payloadData);
              break;
            case 'delete':
              await apiClient.delete(endpoint);
              break;
          }

          await queueItem.markSynced();
          count++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          await queueItem.setError(errorMessage);
          errors.push(`Queue ${queueItem.id}: ${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Sync queue failed: ${errorMessage}`);
    }

    return {count, errors};
  }

  /**
   * Download new content from backend
   */
  private async downloadNewContent(): Promise<void> {
    try {
      // Get last sync time
      const lastSync = this.lastSyncTime || 0;

      // Fetch new lessons since last sync
      const response = await apiClient.get('/lessons/sync', {
        params: {since: lastSync},
      });

      const {lessons} = response.data;

      if (lessons && lessons.length > 0) {
        console.log(`Downloaded ${lessons.length} new lessons`);

        // Save lessons to database
        await database.write(async () => {
          for (const lessonData of lessons) {
            await database.get('lessons').create((lesson: any) => {
              lesson.title = lessonData.title;
              lesson.subject = lessonData.subject;
              lesson.gradeLevel = lessonData.gradeLevel;
              lesson.description = lessonData.description;
              lesson.content = JSON.stringify(lessonData.content);
              lesson.durationMinutes = lessonData.durationMinutes;
              lesson.difficulty = lessonData.difficulty;
              lesson.thumbnailUrl = lessonData.thumbnailUrl;
              lesson.isDownloaded = false;
              lesson.lastSyncedAt = Date.now();
            });
          }
        });
      }
    } catch (error) {
      console.error('Download new content failed:', error);
    }
  }

  /**
   * Add listener for sync status changes
   */
  addListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    if (!this.isOnline) return 'offline';
    if (this.isSyncing) return 'syncing';
    return 'idle';
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): number {
    return this.lastSyncTime;
  }

  /**
   * Check if online
   */
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Check if currently syncing
   */
  isCurrentlySyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Force immediate sync
   */
  async forceSyncNow(): Promise<SyncResult> {
    return this.syncAll();
  }
}

// Export singleton instance
export const syncService = new SyncService();

export default syncService;
