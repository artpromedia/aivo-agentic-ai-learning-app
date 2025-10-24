/**
 * Entry point for React Native app
 * @format
 */

import {AppRegistry} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import App from './App';
import {name as appName} from './app.json';
import {backgroundSyncService} from './src/services/background/backgroundSyncService';

// Register main app component
AppRegistry.registerComponent(appName, () => App);

/**
 * Register Background Fetch Headless Task
 * 
 * This task runs even when the app is completely closed/killed.
 * It performs critical background sync operations like:
 * - Syncing learning progress
 * - Uploading homework/media files
 * - Downloading new content
 * 
 * The task respects WiFi-only settings and battery levels.
 */
BackgroundFetch.registerHeadlessTask(async (event) => {
  const taskId = event.taskId;
  const isTimeout = event.timeout; // True if OS forced timeout

  console.log('[BackgroundFetch] Headless task started:', taskId);

  try {
    if (isTimeout) {
      // Task is about to timeout, finish up ASAP
      console.warn('[BackgroundFetch] Headless task timing out:', taskId);
      BackgroundFetch.finish(taskId);
      return;
    }

    // Perform background sync
    await backgroundSyncService.performBackgroundSync();

    console.log('[BackgroundFetch] Headless task completed:', taskId);
    
    // Tell OS task completed successfully
    BackgroundFetch.finish(taskId);
  } catch (error) {
    console.error('[BackgroundFetch] Headless task error:', error);
    
    // Tell OS task failed
    BackgroundFetch.finish(taskId);
  }
});

