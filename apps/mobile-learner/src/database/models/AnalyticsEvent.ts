/**
 * Analytics Event Model
 * 
 * Stores analytics events for offline queuing
 */

import {Model} from '@nozbe/watermelondb';
import {field, readonly, date} from '@nozbe/watermelondb/decorators';

export class AnalyticsEvent extends Model {
  static table = 'analytics_events';

  @field('event_name') eventName!: string;
  @field('event_params') eventParamsJson!: string;
  @field('user_id') userId?: string;
  @field('screen_name') screenName?: string;
  @field('synced') synced!: boolean;
  @date('synced_at') syncedAt?: Date;
  @field('retry_count') retryCount!: number;

  @readonly @date('created_at') createdAt!: Date;

  // Helper to get parsed event params
  get eventParams(): Record<string, any> {
    try {
      return JSON.parse(this.eventParamsJson);
    } catch {
      return {};
    }
  }

  // Helper to set event params
  setEventParams(params: Record<string, any>): void {
    // @ts-ignore - WatermelonDB allows direct field assignment
    this.eventParamsJson = JSON.stringify(params);
  }
}

