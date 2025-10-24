/**
 * Lesson Model
 * 
 * Represents a lesson with all its content for offline access
 */

import {Model} from '@nozbe/watermelondb';
import {field, date, readonly, children} from '@nozbe/watermelondb/decorators';
import type {Activity} from './Activity';

export class Lesson extends Model {
  static table = 'lessons';
  static associations = {
    activities: {type: 'has_many', foreignKey: 'lesson_id'},
    progress: {type: 'has_many', foreignKey: 'lesson_id'},
  } as const;

  @field('title') title!: string;
  @field('subject') subject!: string;
  @field('grade_level') gradeLevel!: string;
  @field('description') description?: string;
  @field('content') content!: string; // JSON string
  @field('duration_minutes') durationMinutes!: number;
  @field('difficulty') difficulty!: 'easy' | 'medium' | 'hard';
  @field('thumbnail_url') thumbnailUrl?: string;
  @field('is_downloaded') isDownloaded!: boolean;
  @field('download_size') downloadSize?: number;
  @field('last_synced_at') lastSyncedAt!: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('activities') activities!: Activity[];

  /**
   * Get parsed content object
   */
  get contentData(): any {
    try {
      return JSON.parse(this.content);
    } catch {
      return {};
    }
  }

  /**
   * Set content from object
   */
  async setContentData(data: any): Promise<void> {
    await this.update((record) => {
      record.content = JSON.stringify(data);
    });
  }

  /**
   * Mark lesson as downloaded
   */
  async markDownloaded(size: number): Promise<void> {
    await this.update((record) => {
      record.isDownloaded = true;
      record.downloadSize = size;
      record.lastSyncedAt = Date.now();
    });
  }

  /**
   * Remove downloaded content
   */
  async removeDownload(): Promise<void> {
    await this.update((record) => {
      record.isDownloaded = false;
      record.downloadSize = undefined;
    });
  }

  /**
   * Update last synced timestamp
   */
  async updateSyncTime(): Promise<void> {
    await this.update((record) => {
      record.lastSyncedAt = Date.now();
    });
  }
}
