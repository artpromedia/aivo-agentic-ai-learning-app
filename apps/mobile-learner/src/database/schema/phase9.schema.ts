/**
 * Database Schema for Phase 9 Advanced Features
 * 
 * New tables for background sync, analytics, and uploads
 */

import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 9,
  tables: [
    // Existing tables...
    
    /**
     * Sync Events Table
     * 
     * Tracks background synchronization operations
     */
    tableSchema({
      name: 'sync_events',
      columns: [
        {name: 'sync_type', type: 'string'}, // 'full', 'critical', 'progress', 'uploads', etc.
        {name: 'status', type: 'string'}, // 'pending', 'in_progress', 'completed', 'failed'
        {name: 'started_at', type: 'number'}, // Timestamp
        {name: 'completed_at', type: 'number', isOptional: true}, // Timestamp
        {name: 'items_synced', type: 'number', isOptional: true}, // Count of items synced
        {name: 'items_failed', type: 'number', isOptional: true}, // Count of items failed
        {name: 'error_message', type: 'string', isOptional: true}, // Error details
        {name: 'network_type', type: 'string', isOptional: true}, // 'wifi', 'cellular', 'none'
        {name: 'battery_level', type: 'number', isOptional: true}, // Battery percentage
        {name: 'is_headless', type: 'boolean'}, // True if running in headless mode
        {name: 'created_at', type: 'number'}, // Timestamp
        {name: 'updated_at', type: 'number'}, // Timestamp
      ],
    }),

    /**
     * Analytics Events Table
     * 
     * Stores analytics events for offline queuing
     */
    tableSchema({
      name: 'analytics_events',
      columns: [
        {name: 'event_name', type: 'string'}, // e.g., 'lesson_completed', 'badge_earned'
        {name: 'event_params', type: 'string'}, // JSON string of event parameters
        {name: 'user_id', type: 'string', isOptional: true}, // User who triggered event
        {name: 'screen_name', type: 'string', isOptional: true}, // Current screen
        {name: 'synced', type: 'boolean'}, // True if sent to Firebase
        {name: 'synced_at', type: 'number', isOptional: true}, // When synced
        {name: 'retry_count', type: 'number'}, // Number of sync attempts
        {name: 'created_at', type: 'number'}, // Timestamp
      ],
    }),

    /**
     * Media Uploads Table
     * 
     * Tracks homework photos/videos and other media uploads
     */
    tableSchema({
      name: 'media_uploads',
      columns: [
        {name: 'file_path', type: 'string'}, // Local file path
        {name: 'file_name', type: 'string'}, // Original filename
        {name: 'file_type', type: 'string'}, // 'image', 'video', 'audio'
        {name: 'mime_type', type: 'string'}, // e.g., 'image/jpeg', 'video/mp4'
        {name: 'file_size', type: 'number'}, // Size in bytes
        {name: 'upload_type', type: 'string'}, // 'homework', 'profile_photo', 'lesson_content'
        {name: 'related_id', type: 'string', isOptional: true}, // ID of related homework/lesson
        {name: 'status', type: 'string'}, // 'pending', 'uploading', 'completed', 'failed', 'cancelled'
        {name: 'progress', type: 'number'}, // Upload progress (0-100)
        {name: 'upload_url', type: 'string', isOptional: true}, // Server URL after upload
        {name: 'upload_id', type: 'string', isOptional: true}, // Background upload task ID
        {name: 'retry_count', type: 'number'}, // Number of upload attempts
        {name: 'error_message', type: 'string', isOptional: true}, // Error details
        {name: 'started_at', type: 'number', isOptional: true}, // Upload start time
        {name: 'completed_at', type: 'number', isOptional: true}, // Upload completion time
        {name: 'user_id', type: 'string'}, // User who uploaded
        {name: 'created_at', type: 'number'}, // Timestamp
        {name: 'updated_at', type: 'number'}, // Timestamp
      ],
    }),
  ],
});

