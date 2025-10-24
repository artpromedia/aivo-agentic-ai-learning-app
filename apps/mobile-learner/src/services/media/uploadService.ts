/**
 * Upload Service
 * 
 * Handles background upload of media files with retry logic and queue management
 */

import axios, {type AxiosProgressEvent} from 'axios';
import RNFS from 'react-native-fs';
import NetInfo from '@react-native-community/netinfo';
import {database} from '../../database';
import {MediaUpload} from '../../database/models/MediaUpload';
import {Q} from '@nozbe/watermelondb';

class UploadService {
  private uploadQueue: Set<string> = new Set();
  private isProcessing = false;
  private maxConcurrentUploads = 2;
  private currentUploads = 0;

  /**
   * Add media to upload queue
   */
  async queueUpload(uploadId: string): Promise<void> {
    this.uploadQueue.add(uploadId);
    await this.processQueue();
  }

  /**
   * Process upload queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.currentUploads >= this.maxConcurrentUploads) {
      return;
    }

    this.isProcessing = true;

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('No network connection, skipping upload');
        return;
      }

      // Get pending uploads
      const pendingUploads = await database
        .get<MediaUpload>('media_uploads')
        .query(
          Q.where('is_uploaded', false),
          Q.sortBy('created_at', Q.asc)
        )
        .fetch();

      // Process uploads
      for (const upload of pendingUploads) {
        if (this.currentUploads >= this.maxConcurrentUploads) {
          break;
        }

        if (upload.shouldRetry) {
          this.currentUploads++;
          this.uploadFile(upload).finally(() => {
            this.currentUploads--;
            this.uploadQueue.delete(upload.id);
          });
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Upload a single file
   */
  private async uploadFile(upload: MediaUpload): Promise<void> {
    try {
      // Check if file exists
      const fileExists = await RNFS.exists(upload.filePath);
      if (!fileExists) {
        await upload.setError('File not found');
        return;
      }

      // Reset for retry
      await upload.resetForRetry();

      // Prepare form data
      const formData = new FormData();
      formData.append('file', {
        uri: upload.filePath,
        type: upload.mimeType,
        name: upload.filePath.split('/').pop(),
      } as any);

      if (upload.activityId) {
        formData.append('activityId', upload.activityId);
      }

      if (upload.lessonId) {
        formData.append('lessonId', upload.lessonId);
      }

      formData.append('userId', upload.userId);
      formData.append('fileType', upload.fileType);

      // Upload with progress tracking
      const response = await axios.post(
        `${process.env.API_URL}/api/media/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: async (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              await upload.updateProgress(percentCompleted);
            }
          },
          timeout: 120000, // 2 minutes
        }
      );

      // Mark as uploaded
      await upload.markUploaded(response.data.url);

      // Delete local file after successful upload
      await RNFS.unlink(upload.filePath);

      console.log(`Successfully uploaded: ${upload.id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      await upload.setError(errorMessage);
      console.error(`Upload failed for ${upload.id}:`, errorMessage);

      // Retry if possible
      if (upload.shouldRetry) {
        setTimeout(() => {
          this.queueUpload(upload.id);
        }, this.getRetryDelay(upload.retryCount));
      }
    }
  }

  /**
   * Get retry delay based on retry count (exponential backoff)
   */
  private getRetryDelay(retryCount: number): number {
    return Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
  }

  /**
   * Get upload progress for a specific upload
   */
  async getUploadProgress(uploadId: string): Promise<number> {
    const upload = await database
      .get<MediaUpload>('media_uploads')
      .find(uploadId);
    return upload.uploadProgress;
  }

  /**
   * Get all pending uploads
   */
  async getPendingUploads(): Promise<MediaUpload[]> {
    return database
      .get<MediaUpload>('media_uploads')
      .query(Q.where('is_uploaded', false))
      .fetch();
  }

  /**
   * Get upload statistics
   */
  async getUploadStats() {
    const [total, uploaded, pending, failed] = await Promise.all([
      database.get<MediaUpload>('media_uploads').query().fetchCount(),
      database
        .get<MediaUpload>('media_uploads')
        .query(Q.where('is_uploaded', true))
        .fetchCount(),
      database
        .get<MediaUpload>('media_uploads')
        .query(Q.where('is_uploaded', false), Q.where('retry_count', Q.lt(3)))
        .fetchCount(),
      database
        .get<MediaUpload>('media_uploads')
        .query(Q.where('is_uploaded', false), Q.where('retry_count', Q.gte(3)))
        .fetchCount(),
    ]);

    return {total, uploaded, pending, failed};
  }

  /**
   * Retry failed uploads
   */
  async retryFailedUploads(): Promise<void> {
    const failedUploads = await database
      .get<MediaUpload>('media_uploads')
      .query(
        Q.where('is_uploaded', false),
        Q.where('retry_count', Q.lt(3))
      )
      .fetch();

    for (const upload of failedUploads) {
      await this.queueUpload(upload.id);
    }
  }

  /**
   * Cancel upload
   */
  async cancelUpload(uploadId: string): Promise<void> {
    this.uploadQueue.delete(uploadId);
    
    const upload = await database
      .get<MediaUpload>('media_uploads')
      .find(uploadId);
      
    await upload.setError('Cancelled by user');
  }

  /**
   * Delete upload record
   */
  async deleteUpload(uploadId: string): Promise<void> {
    const upload = await database
      .get<MediaUpload>('media_uploads')
      .find(uploadId);

    // Delete file if exists
    try {
      const fileExists = await RNFS.exists(upload.filePath);
      if (fileExists) {
        await RNFS.unlink(upload.filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete record
    await database.write(async () => {
      await upload.markAsDeleted();
    });
  }

  /**
   * Clear completed uploads older than specified days
   */
  async clearOldUploads(daysOld: number = 30): Promise<void> {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

    const oldUploads = await database
      .get<MediaUpload>('media_uploads')
      .query(
        Q.where('is_uploaded', true),
        Q.where('updated_at', Q.lt(cutoffTime))
      )
      .fetch();

    await database.write(async () => {
      await Promise.all(oldUploads.map((upload) => upload.markAsDeleted()));
    });
  }

  /**
   * Start background upload processing
   */
  startBackgroundProcessing(): void {
    // Process queue every 30 seconds
    setInterval(() => {
      this.processQueue();
    }, 30000);

    // Listen for network changes
    NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        this.processQueue();
      }
    });
  }
}

export const uploadService = new UploadService();
export default uploadService;
