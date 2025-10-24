/**
 * Media Upload Model
 * 
 * Tracks homework photos/videos and other media uploads
 */

import {Model} from '@nozbe/watermelondb';
import {field, date, readonly} from '@nozbe/watermelondb/decorators';

export type FileType = 'image' | 'video' | 'audio';
export type UploadType = 'homework' | 'profile_photo' | 'lesson_content' | 'activity_photo';
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled';

export class MediaUpload extends Model {
  static table = 'media_uploads';

  // Legacy fields (maintained for backwards compatibility)
  @field('activity_id') activityId?: string;
  @field('lesson_id') lessonId?: string;
  
  // Core fields
  @field('user_id') userId!: string;
  @field('file_path') filePath!: string;
  @field('file_name') fileName!: string;
  @field('file_type') fileType!: FileType;
  @field('file_size') fileSize!: number;
  @field('mime_type') mimeType!: string;
  
  // Upload tracking (Phase 9)
  @field('upload_type') uploadType!: UploadType;
  @field('related_id') relatedId?: string; // Generic reference (activity, lesson, homework)
  @field('status') status!: UploadStatus;
  @field('upload_progress') uploadProgress!: number; // 0-100
  @field('upload_url') uploadUrl?: string;
  @field('upload_id') uploadId?: string; // Background upload task ID
  @field('retry_count') retryCount!: number;
  @field('error_message') errorMessage?: string;
  @date('started_at') startedAt?: Date;
  @date('completed_at') completedAt?: Date;

  // Legacy field (backwards compatibility)
  @field('is_uploaded') isUploaded!: boolean;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  // Helper properties
  get isComplete(): boolean {
    return this.status === 'completed' || this.isUploaded;
  }

  get isFailed(): boolean {
    return this.status === 'failed';
  }

  get isPending(): boolean {
    return this.status === 'pending';
  }

  get isUploading(): boolean {
    return this.status === 'uploading';
  }

  get isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  get canRetry(): boolean {
    return (this.isFailed || this.isPending) && this.retryCount < 3;
  }

  get shouldRetry(): boolean {
    return this.canRetry;
  }

  get fileSizeMB(): number {
    return this.fileSize / (1024 * 1024);
  }

  get fileSizeFormatted(): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Update upload progress
   */
  async updateProgress(progress: number): Promise<void> {
    await this.update((record) => {
      record.uploadProgress = Math.min(100, Math.max(0, progress));
      record.status = 'uploading';
    });
  }

  /**
   * Mark as uploaded
   */
  async markUploaded(uploadUrl: string): Promise<void> {
    await this.update((record) => {
      record.isUploaded = true;
      record.status = 'completed';
      record.uploadUrl = uploadUrl;
      record.uploadProgress = 100;
      record.errorMessage = undefined;
      record.completedAt = new Date();
    });
  }

  /**
   * Set upload error
   */
  async setError(errorMessage: string): Promise<void> {
    await this.update((record) => {
      record.status = 'failed';
      record.errorMessage = errorMessage;
      record.retryCount += 1;
    });
  }

  /**
   * Reset for retry
   */
  async resetForRetry(): Promise<void> {
    await this.update((record) => {
      record.status = 'pending';
      record.uploadProgress = 0;
      record.errorMessage = undefined;
    });
  }
}
