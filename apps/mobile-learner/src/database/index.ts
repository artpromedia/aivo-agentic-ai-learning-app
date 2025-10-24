/**
 * Database Initialization
 * 
 * Sets up WatermelonDB for offline-first data storage
 */

import {Database, Q} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import {schema} from './schema';
import {Lesson} from './models/Lesson';
import {Activity} from './models/Activity';
import {Progress} from './models/Progress';
import {MediaUpload} from './models/MediaUpload';
import {SyncQueue} from './models/SyncQueue';

/**
 * Create SQLite adapter with performance optimizations
 */
const adapter = new SQLiteAdapter({
  schema,
  // Uncomment for production
  // jsi: true, // Use JSI for better performance (requires new architecture)
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

/**
 * Initialize database with all models
 */
export const database = new Database({
  adapter,
  modelClasses: [Lesson, Activity, Progress, MediaUpload, SyncQueue],
});

/**
 * Database helper functions
 */

/**
 * Clear all data from database (for logout/reset)
 */
export const clearDatabase = async (): Promise<void> => {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
  const stats = {
    lessons: await database.get<Lesson>('lessons').query().fetchCount(),
    activities: await database.get<Activity>('activities').query().fetchCount(),
    progress: await database.get<Progress>('progress').query().fetchCount(),
    mediaUploads: await database
      .get<MediaUpload>('media_uploads')
      .query()
      .fetchCount(),
    syncQueue: await database.get<SyncQueue>('sync_queue').query().fetchCount(),
  };

  return stats;
};

/**
 * Get unsynced records count
 */
export const getUnsyncedCount = async () => {
  const [activities, progress, syncQueue] = await Promise.all([
    database
      .get<Activity>('activities')
      .query(Q.where('is_synced', false))
      .fetchCount(),
    database
      .get<Progress>('progress')
      .query(Q.where('is_synced', false))
      .fetchCount(),
    database
      .get<SyncQueue>('sync_queue')
      .query(Q.where('is_synced', false))
      .fetchCount(),
  ]);

  return activities + progress + syncQueue;
};

/**
 * Get total storage size (approximate)
 */
export const getStorageSize = async () => {
  const stats = await getDatabaseStats();
  // Rough estimate: 1KB per record average
  const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0);
  return totalRecords * 1024; // bytes
};

export default database;
