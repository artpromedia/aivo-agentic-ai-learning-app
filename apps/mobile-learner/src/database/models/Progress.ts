/**
 * Progress Model
 * 
 * Stores user progress and answers for activities
 */

import {Model} from '@nozbe/watermelondb';
import {field, date, readonly, relation} from '@nozbe/watermelondb/decorators';
import type {Activity} from './Activity';
import type {Lesson} from './Lesson';

export class Progress extends Model {
  static table = 'progress';
  static associations = {
    activities: {type: 'belongs_to', key: 'activity_id'},
    lessons: {type: 'belongs_to', key: 'lesson_id'},
  } as const;

  @field('activity_id') activityId!: string;
  @field('lesson_id') lessonId!: string;
  @field('user_id') userId!: string;
  @field('answers') answers!: string; // JSON string
  @field('score') score!: number;
  @field('max_score') maxScore!: number;
  @field('percentage') percentage!: number;
  @field('time_spent_seconds') timeSpentSeconds!: number;
  @field('attempts') attempts!: number;
  @field('is_completed') isCompleted!: boolean;
  @field('is_synced') isSynced!: boolean;
  @field('completed_at') completedAt?: number;
  @field('synced_at') syncedAt?: number;

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('activities', 'activity_id') activity!: Activity;
  @relation('lessons', 'lesson_id') lesson!: Lesson;

  /**
   * Get parsed answers object
   */
  get answersData(): any {
    try {
      return JSON.parse(this.answers);
    } catch {
      return {};
    }
  }

  /**
   * Set answers from object
   */
  async setAnswersData(data: any): Promise<void> {
    await this.update((record) => {
      record.answers = JSON.stringify(data);
    });
  }

  /**
   * Update progress
   */
  async updateProgress(
    answers: any,
    score: number,
    maxScore: number,
    timeSpent: number
  ): Promise<void> {
    await this.update((record) => {
      record.answers = JSON.stringify(answers);
      record.score = score;
      record.maxScore = maxScore;
      record.percentage = Math.round((score / maxScore) * 100);
      record.timeSpentSeconds = timeSpent;
      record.isSynced = false;
    });
  }

  /**
   * Mark as completed
   */
  async markCompleted(): Promise<void> {
    await this.update((record) => {
      record.isCompleted = true;
      record.completedAt = Date.now();
      record.isSynced = false;
    });
  }

  /**
   * Increment attempt count
   */
  async incrementAttempts(): Promise<void> {
    await this.update((record) => {
      record.attempts += 1;
    });
  }

  /**
   * Mark as synced
   */
  async markSynced(): Promise<void> {
    await this.update((record) => {
      record.isSynced = true;
      record.syncedAt = Date.now();
    });
  }
}
