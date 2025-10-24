// @ts-ignore - Package will be installed
import Upload from 'react-native-background-upload';
import { database } from '@/database';
import { Q } from '@nozbe/watermelondb';

interface UploadConfig {
  uploadUrl: string;
  headers: () => Promise<Record<string, string>>;
  onProgress: (uploadId: string, progress: number) => void;
  onComplete: (uploadId: string, response: any) => void;
  onError: (uploadId: string, error: any) => void;
}

interface UploadOptions {
  url: string;
  path: string;
  method: 'POST' | 'PUT';
  field: string;
  type: 'raw' | 'multipart';
  headers: Record<string, string>;
  notification?: {
    enabled: boolean;
    autoClear: boolean;
    notificationChannel: string;
    onProgressTitle: string;
    onCompleteTitle: string;
    onErrorTitle: string;
    onProgressMessage: string;
  };
}

class UploadQueueService {
  private config: UploadConfig | null = null;
  private activeUploads = new Map<string, string>(); // mediaUploadId -> uploadId

  configure(config: UploadConfig): void {
    this.config = config;
    console.log('[UploadQueue] Configured');
  }

  async addToQueue(mediaUploadId: string): Promise<void> {
    if (!this.config) {
      console.error('[UploadQueue] Service not configured');
      return;
    }

    try {
      const upload = await database
        .get('media_uploads')
        .find(mediaUploadId)
        .catch(() => null);

      if (!upload) {
        console.error(`[UploadQueue] Upload not found: ${mediaUploadId}`);
        return;
      }

      const uploadData = upload as any;

      const options: UploadOptions = {
        url: this.config.uploadUrl,
        path: uploadData.filePath,
        method: 'POST',
        field: 'file',
        type: 'multipart',
        headers: await this.config.headers(),
        notification: {
          enabled: true,
          autoClear: true,
          notificationChannel: 'upload-channel',
          onProgressTitle: 'Uploading...',
          onCompleteTitle: 'Upload Complete',
          onErrorTitle: 'Upload Failed',
          onProgressMessage: 'Progress: {progress}%',
        },
      };

      console.log(`[UploadQueue] Starting upload for ${mediaUploadId}`);

      const uploadId = await Upload.startUpload(options);
      this.activeUploads.set(mediaUploadId, uploadId);

      // Listen to progress events
      Upload.addListener('progress', uploadId, (data: any) => {
        const progress = Math.round(data.progress);
        console.log(`[UploadQueue] ${mediaUploadId}: ${progress}%`);
        this.config!.onProgress(mediaUploadId, progress);
      });

      // Listen to completed events
      Upload.addListener('completed', uploadId, (data: any) => {
        console.log(`[UploadQueue] ${mediaUploadId} completed`);
        this.activeUploads.delete(mediaUploadId);

        try {
          const response = JSON.parse(data.responseBody);
          this.config!.onComplete(mediaUploadId, response);
        } catch (error) {
          console.error(
            `[UploadQueue] Error parsing response for ${mediaUploadId}:`,
            error
          );
          this.config!.onError(mediaUploadId, error);
        }
      });

      // Listen to error events
      Upload.addListener('error', uploadId, (data: any) => {
        console.error(`[UploadQueue] ${mediaUploadId} error:`, data.error);
        this.activeUploads.delete(mediaUploadId);
        this.config!.onError(mediaUploadId, data.error);
      });

      // Listen to cancelled events
      Upload.addListener('cancelled', uploadId, () => {
        console.log(`[UploadQueue] ${mediaUploadId} cancelled`);
        this.activeUploads.delete(mediaUploadId);
      });
    } catch (error) {
      console.error(`[UploadQueue] Failed to start upload for ${mediaUploadId}:`, error);
      if (this.config) {
        this.config.onError(mediaUploadId, error);
      }
    }
  }

  async processQueue(): Promise<void> {
    if (!this.config) {
      console.error('[UploadQueue] Service not configured');
      return;
    }

    try {
      const pendingUploads = await database
        .get('media_uploads')
        .query(
          Q.where('uploaded', false),
          Q.where('failed', false),
          Q.sortBy('created_at', Q.asc)
        )
        .fetch();

      console.log(`[UploadQueue] Found ${pendingUploads.length} pending uploads`);

      for (const upload of pendingUploads) {
        // Skip if already uploading
        if (this.activeUploads.has(upload.id)) {
          console.log(`[UploadQueue] Skipping ${upload.id} (already uploading)`);
          continue;
        }

        await this.addToQueue(upload.id);

        // Add delay between uploads to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.log('[UploadQueue] Queue processing complete');
    } catch (error) {
      console.error('[UploadQueue] Error processing queue:', error);
    }
  }

  async cancelUpload(mediaUploadId: string): Promise<void> {
    const uploadId = this.activeUploads.get(mediaUploadId);

    if (uploadId) {
      try {
        await Upload.cancelUpload(uploadId);
        this.activeUploads.delete(mediaUploadId);
        console.log(`[UploadQueue] Cancelled upload ${mediaUploadId}`);
      } catch (error) {
        console.error(`[UploadQueue] Error cancelling ${mediaUploadId}:`, error);
      }
    }
  }

  async cancelAll(): Promise<void> {
    const uploadIds = Array.from(this.activeUploads.values());

    for (const uploadId of uploadIds) {
      try {
        await Upload.cancelUpload(uploadId);
      } catch (error) {
        console.error(`[UploadQueue] Error cancelling ${uploadId}:`, error);
      }
    }

    this.activeUploads.clear();
    console.log('[UploadQueue] All uploads cancelled');
  }

  getActiveUploads(): string[] {
    return Array.from(this.activeUploads.keys());
  }

  isUploading(mediaUploadId: string): boolean {
    return this.activeUploads.has(mediaUploadId);
  }
}

export const uploadQueueService = new UploadQueueService();
