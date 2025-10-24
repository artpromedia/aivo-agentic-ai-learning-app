/**
 * Sync Queue Model
 * 
 * Stores actions to be synced when online
 */

import {Model} from '@nozbe/watermelondb';
import {field, date, readonly} from '@nozbe/watermelondb/decorators';

export class SyncQueue extends Model {
  static table = 'sync_queue';

  @field('action_type') actionType!: 'create' | 'update' | 'delete';
  @field('table_name') tableName!: string;
  @field('record_id') recordId!: string;
  @field('payload') payload!: string; // JSON string
  @field('priority') priority!: number; // 1-10 (10 = highest)
  @field('retry_count') retryCount!: number;
  @field('max_retries') maxRetries!: number;
  @field('error_message') errorMessage?: string;
  @field('is_synced') isSynced!: boolean;
  @field('synced_at') syncedAt?: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  /**
   * Get parsed payload object
   */
  get payloadData(): any {
    try {
      return JSON.parse(this.payload);
    } catch {
      return {};
    }
  }

  /**
   * Mark as synced
   */
  async markSynced(): Promise<void> {
    await this.update((record) => {
      record.isSynced = true;
      record.syncedAt = Date.now();
      record.errorMessage = undefined;
    });
  }

  /**
   * Set error and increment retry count
   */
  async setError(errorMessage: string): Promise<void> {
    await this.update((record) => {
      record.errorMessage = errorMessage;
      record.retryCount += 1;
    });
  }

  /**
   * Check if should retry
   */
  get shouldRetry(): boolean {
    return this.retryCount < this.maxRetries && !this.isSynced;
  }

  /**
   * Check if max retries exceeded
   */
  get maxRetriesExceeded(): boolean {
    return this.retryCount >= this.maxRetries;
  }
}
