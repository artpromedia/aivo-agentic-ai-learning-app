/**
 * Activity Model
 * 
 * Represents an individual activity within a lesson
 */

import {Model} from '@nozbe/watermelondb';
import {field, date, readonly, relation} from '@nozbe/watermelondb/decorators';
import type {Lesson} from './Lesson';

export class Activity extends Model {
  static table = 'activities';
  static associations = {
    lessons: {type: 'belongs_to', key: 'lesson_id'},
    progress: {type: 'has_many', foreignKey: 'activity_id'},
  } as const;

  @field('lesson_id') lessonId!: string;
  @field('type') type!: 'quiz' | 'reading' | 'video' | 'audio' | 'interactive';
  @field('title') title!: string;
  @field('content') content!: string; // JSON string
  @field('order_index') orderIndex!: number;
  @field('points') points!: number;
  @field('is_completed') isCompleted!: boolean;
  @field('score') score?: number;
  @field('completed_at') completedAt?: number;
  @field('time_spent_seconds') timeSpentSeconds!: number;
  @field('is_synced') isSynced!: boolean;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('lessons', 'lesson_id') lesson!: Lesson;

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
   * Mark activity as completed
   */
  async markCompleted(score: number, timeSpent: number): Promise<void> {
    await this.update((record) => {
      record.isCompleted = true;
      record.score = score;
      record.completedAt = Date.now();
      record.timeSpentSeconds = timeSpent;
      record.isSynced = false; // Needs sync
    });
  }

  /**
   * Update time spent
   */
  async updateTimeSpent(additionalSeconds: number): Promise<void> {
    await this.update((record) => {
      record.timeSpentSeconds += additionalSeconds;
    });
  }

  /**
   * Mark as synced
   */
  async markSynced(): Promise<void> {
    await this.update((record) => {
      record.isSynced = true;
    });
  }
}
