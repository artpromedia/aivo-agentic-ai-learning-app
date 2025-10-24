/**
 * Sync Event Model
 * 
 * Tracks background synchronization operations
 */

import {Model} from '@nozbe/watermelondb';
import {field, readonly, date} from '@nozbe/watermelondb/decorators';

export type SyncType = 'full' | 'critical' | 'progress' | 'uploads' | 'downloads' | 'settings';
export type SyncStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type NetworkType = 'wifi' | 'cellular' | 'none';

export class SyncEvent extends Model {
  static table = 'sync_events';

  @field('sync_type') syncType!: SyncType;
  @field('status') status!: SyncStatus;
  @date('started_at') startedAt!: Date;
  @date('completed_at') completedAt?: Date;
  @field('items_synced') itemsSynced?: number;
  @field('items_failed') itemsFailed?: number;
  @field('error_message') errorMessage?: string;
  @field('network_type') networkType?: NetworkType;
  @field('battery_level') batteryLevel?: number;
  @field('is_headless') isHeadless!: boolean;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}

