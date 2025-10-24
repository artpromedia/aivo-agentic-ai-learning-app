import BackgroundFetch from 'react-native-background-fetch';
import NetInfo from '@react-native-community/netinfo';
import { database } from '@/database';
import { syncService } from '@/services/sync/syncService';
import { uploadQueueService } from '@/services/upload/uploadQueueService';
import { notificationService } from '@/services/notifications/notificationService';
import { getSecureToken } from '@/utils/secureStorage';
import { Q } from '@nozbe/watermelondb';

interface BackgroundSyncConfig {
  minimumFetchInterval?: number;
  requiredNetworkType?: 'any' | 'wifi' | 'cellular';
  enableHeadless?: boolean;
  stopOnTerminate?: boolean;
  startOnBoot?: boolean;
  lowBatteryThreshold?: number;
}

class BackgroundSyncService {
  private config: BackgroundSyncConfig = {
    minimumFetchInterval: 15, // Minutes
    requiredNetworkType: 'any',
    enableHeadless: true,
    stopOnTerminate: false,
    startOnBoot: true,
    lowBatteryThreshold: 20, // Pause sync below 20% battery
  };

  private isConfigured = false;

  async configure(customConfig?: BackgroundSyncConfig) {
    if (this.isConfigured) {
      console.log('[BackgroundSync] Already configured');
      return;
    }

    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    try {
      // Configure background fetch
      const status = await BackgroundFetch.configure(
        {
          minimumFetchInterval: this.config.minimumFetchInterval!,
          stopOnTerminate: this.config.stopOnTerminate!,
          startOnBoot: this.config.startOnBoot!,
          enableHeadless: this.config.enableHeadless!,
          requiredNetworkType: this.getNetworkType(),
          requiresBatteryNotLow: true,
          requiresCharging: false,
          requiresDeviceIdle: false,
          requiresStorageNotLow: false,
        },
        this.onBackgroundFetchEvent.bind(this),
        this.onBackgroundFetchTimeout.bind(this)
      );

      console.log('[BackgroundSync] Configured with status:', status);
      this.isConfigured = true;

      // Configure background upload
      this.configureBackgroundUpload();

      // Start initial sync if needed
      await this.checkAndSync();
    } catch (error) {
      console.error('[BackgroundSync] Configuration error:', error);
    }
  }

  private getNetworkType(): number {
    switch (this.config.requiredNetworkType) {
      case 'wifi':
        return BackgroundFetch.NETWORK_TYPE_UNMETERED;
      case 'cellular':
        return BackgroundFetch.NETWORK_TYPE_CELLULAR;
      default:
        return BackgroundFetch.NETWORK_TYPE_ANY;
    }
  }

  private async onBackgroundFetchEvent(taskId: string) {
    console.log('[BackgroundFetch] Task started:', taskId);

    try {
      await this.performBackgroundSync();
      BackgroundFetch.finish(taskId);
    } catch (error) {
      console.error('[BackgroundFetch] Error:', error);
      BackgroundFetch.finish(taskId);
    }
  }

  private onBackgroundFetchTimeout(taskId: string) {
    console.log('[BackgroundFetch] Task timeout:', taskId);
    BackgroundFetch.finish(taskId);
  }

  async performBackgroundSync(): Promise<void> {
    const startTime = Date.now();
    console.log('[BackgroundSync] Starting sync...');

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        console.log('[BackgroundSync] No network connection, skipping sync');
        return;
      }

      // Check battery level (if available)
      const batteryLevel = await this.getBatteryLevel();
      if (batteryLevel !== null && batteryLevel < this.config.lowBatteryThreshold!) {
        console.log(
          `[BackgroundSync] Battery too low (${batteryLevel}%), skipping sync`
        );
        return;
      }

      // Determine sync strategy based on network type
      if (netInfo.type === 'wifi') {
        console.log('[BackgroundSync] WiFi detected - full sync');
        await this.performFullSync();
      } else if (netInfo.type === 'cellular') {
        console.log('[BackgroundSync] Cellular detected - critical sync only');
        await this.performCriticalSync();
      }

      const duration = Date.now() - startTime;
      console.log(`[BackgroundSync] Sync completed in ${duration}ms`);

      // Log sync completion
      await this.logSyncEvent('success', duration);
    } catch (error) {
      console.error('[BackgroundSync] Sync failed:', error);
      await this.logSyncEvent('error', Date.now() - startTime, error);
    }
  }

  private async performFullSync(): Promise<void> {
    // Priority 1: Sync user progress and activity data
    await syncService.syncProgress();
    console.log('[BackgroundSync] Progress synced');

    // Priority 2: Upload pending media (homework, voice recordings)
    await uploadQueueService.processQueue();
    console.log('[BackgroundSync] Upload queue processed');

    // Priority 3: Download new content (lessons, activities)
    await syncService.downloadNewContent();
    console.log('[BackgroundSync] New content downloaded');

    // Priority 4: Sync settings and preferences
    await syncService.syncSettings();
    console.log('[BackgroundSync] Settings synced');
  }

  private async performCriticalSync(): Promise<void> {
    // Only sync essential data on cellular to save data
    await syncService.syncProgress();
    console.log('[BackgroundSync] Critical sync completed (cellular)');
  }

  private configureBackgroundUpload() {
    uploadQueueService.configure({
      uploadUrl: `${process.env.API_BASE_URL}/api/media/upload`,
      headers: async () => {
        const token = await getSecureToken('access_token');
        return {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        };
      },
      onProgress: (uploadId, progress) => {
        console.log(`[Upload] ${uploadId}: ${progress}%`);
      },
      onComplete: async (uploadId, response) => {
        console.log(`[Upload] ${uploadId} completed:`, response);
        await this.handleUploadComplete(uploadId, response);
      },
      onError: async (uploadId, error) => {
        console.error(`[Upload] ${uploadId} failed:`, error);
        await this.handleUploadError(uploadId, error);
      },
    });
  }

  private async handleUploadComplete(uploadId: string, response: any) {
    try {
      await database.write(async () => {
        const upload = await database
          .get('media_uploads')
          .find(uploadId)
          .catch(() => null);

        if (upload) {
          await upload.update((u: any) => {
            u.uploaded = true;
            u.uploadUrl = response.url;
            u.completedAt = Date.now();
          });
        }
      });

      console.log(`[Upload] ${uploadId} marked as complete in database`);
    } catch (error) {
      console.error(`[Upload] Failed to update database for ${uploadId}:`, error);
    }
  }

  private async handleUploadError(uploadId: string, error: any) {
    try {
      const upload = await database
        .get('media_uploads')
        .find(uploadId)
        .catch(() => null);

      if (!upload) {
        console.error(`[Upload] Upload record not found: ${uploadId}`);
        return;
      }

      const retryCount = (upload as any).retryCount || 0;

      if (retryCount < 3) {
        // Retry upload
        await database.write(async () => {
          await upload.update((u: any) => {
            u.retryCount = retryCount + 1;
            u.lastError = error?.message || 'Unknown error';
          });
        });

        console.log(`[Upload] Retrying ${uploadId} (attempt ${retryCount + 1}/3)`);

        // Add back to queue with exponential backoff
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          uploadQueueService.addToQueue(uploadId);
        }, delay);
      } else {
        // Max retries reached
        await database.write(async () => {
          await upload.update((u: any) => {
            u.failed = true;
            u.lastError = error?.message || 'Max retries exceeded';
          });
        });

        console.error(`[Upload] ${uploadId} failed after 3 retries`);

        // Notify user
        await notificationService.displayNotification({
          notification: {
            id: `upload_failed_${uploadId}`,
            title: 'Upload Failed',
            body: 'Some media could not be uploaded. Please check your connection and try again.',
            data: { uploadId, type: 'upload_failed' },
          },
        });
      }
    } catch (error) {
      console.error(`[Upload] Error handling upload error for ${uploadId}:`, error);
    }
  }

  async scheduleBackgroundTask(taskName: string, delay: number): Promise<void> {
    try {
      await BackgroundFetch.scheduleTask({
        taskId: taskName,
        delay: delay, // Milliseconds
        periodic: false,
        stopOnTerminate: false,
        enableHeadless: true,
        forceAlarmManager: true,
      });

      console.log(`[BackgroundSync] Task scheduled: ${taskName} (delay: ${delay}ms)`);
    } catch (error) {
      console.error(`[BackgroundSync] Failed to schedule task ${taskName}:`, error);
    }
  }

  async checkAndSync(): Promise<void> {
    const lastSyncTime = await this.getLastSyncTime();
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTime;
    const minInterval = this.config.minimumFetchInterval! * 60 * 1000; // Convert to ms

    if (timeSinceLastSync >= minInterval) {
      console.log('[BackgroundSync] Time for sync');
      await this.performBackgroundSync();
    } else {
      console.log(
        `[BackgroundSync] Too soon to sync (${Math.round(
          (minInterval - timeSinceLastSync) / 1000
        )}s remaining)`
      );
    }
  }

  private async getLastSyncTime(): Promise<number> {
    try {
      const syncEvents = await database
        .get('sync_events')
        .query(Q.sortBy('created_at', Q.desc), Q.take(1))
        .fetch();

      if (syncEvents.length > 0) {
        return (syncEvents[0] as any).createdAt;
      }
    } catch (error) {
      console.error('[BackgroundSync] Error getting last sync time:', error);
    }

    return 0;
  }

  private async logSyncEvent(
    status: 'success' | 'error',
    duration: number,
    error?: any
  ): Promise<void> {
    try {
      await database.write(async () => {
        await database.get('sync_events').create((event: any) => {
          event.status = status;
          event.duration = duration;
          event.error = error ? JSON.stringify(error) : null;
          event.createdAt = Date.now();
        });
      });
    } catch (error) {
      console.error('[BackgroundSync] Error logging sync event:', error);
    }
  }

  private async getBatteryLevel(): Promise<number | null> {
    try {
      // This would require react-native-device-info or similar
      // For now, return null to skip battery check
      return null;
    } catch (error) {
      console.error('[BackgroundSync] Error getting battery level:', error);
      return null;
    }
  }

  async stop(): Promise<void> {
    try {
      await BackgroundFetch.stop();
      this.isConfigured = false;
      console.log('[BackgroundSync] Stopped');
    } catch (error) {
      console.error('[BackgroundSync] Error stopping:', error);
    }
  }

  async getStatus(): Promise<number> {
    try {
      return await BackgroundFetch.status();
    } catch (error) {
      console.error('[BackgroundSync] Error getting status:', error);
      return BackgroundFetch.STATUS_DENIED;
    }
  }
}

export const backgroundSyncService = new BackgroundSyncService();
