/**
 * WatermelonDB Schema
 * 
 * Defines the local database structure for offline-first data storage
 */

import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    /**
     * Lessons table
     * Stores lesson content for offline access
     */
    tableSchema({
      name: 'lessons',
      columns: [
        {name: 'title', type: 'string'},
        {name: 'subject', type: 'string'},
        {name: 'grade_level', type: 'string'},
        {name: 'description', type: 'string', isOptional: true},
        {name: 'content', type: 'string'}, // JSON string
        {name: 'duration_minutes', type: 'number'},
        {name: 'difficulty', type: 'string'}, // 'easy' | 'medium' | 'hard'
        {name: 'thumbnail_url', type: 'string', isOptional: true},
        {name: 'is_downloaded', type: 'boolean'},
        {name: 'download_size', type: 'number', isOptional: true},
        {name: 'last_synced_at', type: 'number'}, // timestamp
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    /**
     * Activities table
     * Stores individual activities within lessons
     */
    tableSchema({
      name: 'activities',
      columns: [
        {name: 'lesson_id', type: 'string', isIndexed: true},
        {name: 'type', type: 'string'}, // 'quiz' | 'reading' | 'video' | 'audio' | 'interactive'
        {name: 'title', type: 'string'},
        {name: 'content', type: 'string'}, // JSON string
        {name: 'order_index', type: 'number'},
        {name: 'points', type: 'number'},
        {name: 'is_completed', type: 'boolean'},
        {name: 'score', type: 'number', isOptional: true},
        {name: 'completed_at', type: 'number', isOptional: true},
        {name: 'time_spent_seconds', type: 'number'},
        {name: 'is_synced', type: 'boolean'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    /**
     * Progress table
     * Stores user progress and answers for activities
     */
    tableSchema({
      name: 'progress',
      columns: [
        {name: 'activity_id', type: 'string', isIndexed: true},
        {name: 'lesson_id', type: 'string', isIndexed: true},
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'answers', type: 'string'}, // JSON string
        {name: 'score', type: 'number'},
        {name: 'max_score', type: 'number'},
        {name: 'percentage', type: 'number'},
        {name: 'time_spent_seconds', type: 'number'},
        {name: 'attempts', type: 'number'},
        {name: 'is_completed', type: 'boolean'},
        {name: 'is_synced', type: 'boolean'},
        {name: 'completed_at', type: 'number', isOptional: true},
        {name: 'synced_at', type: 'number', isOptional: true},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    /**
     * Media uploads table
     * Stores homework photos/videos for background upload
     */
    tableSchema({
      name: 'media_uploads',
      columns: [
        {name: 'activity_id', type: 'string', isOptional: true},
        {name: 'lesson_id', type: 'string', isOptional: true},
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'file_path', type: 'string'},
        {name: 'file_type', type: 'string'}, // 'image' | 'video' | 'audio'
        {name: 'file_size', type: 'number'},
        {name: 'mime_type', type: 'string'},
        {name: 'is_uploaded', type: 'boolean'},
        {name: 'upload_url', type: 'string', isOptional: true},
        {name: 'upload_progress', type: 'number'}, // 0-100
        {name: 'error_message', type: 'string', isOptional: true},
        {name: 'retry_count', type: 'number'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    /**
     * Sync queue table
     * Stores actions to be synced when online
     */
    tableSchema({
      name: 'sync_queue',
      columns: [
        {name: 'action_type', type: 'string'}, // 'create' | 'update' | 'delete'
        {name: 'table_name', type: 'string'},
        {name: 'record_id', type: 'string'},
        {name: 'payload', type: 'string'}, // JSON string
        {name: 'priority', type: 'number'}, // 1-10 (10 = highest)
        {name: 'retry_count', type: 'number'},
        {name: 'max_retries', type: 'number'},
        {name: 'error_message', type: 'string', isOptional: true},
        {name: 'is_synced', type: 'boolean'},
        {name: 'synced_at', type: 'number', isOptional: true},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
  ],
});

/**
 * Schema migrations for future versions
 */
export const migrations = {
  // migrations: [
  //   {
  //     toVersion: 2,
  //     steps: [
  //       // Migration steps here
  //     ],
  //   },
  // ],
};
