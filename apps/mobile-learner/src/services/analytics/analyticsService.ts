// @ts-ignore - Package will be installed
import analytics from '@react-native-firebase/analytics';
// @ts-ignore - Package will be installed
import * as Sentry from '@sentry/react-native';
// @ts-ignore - Package will be installed
import DeviceInfo from 'react-native-device-info';
import { database } from '@/database';
import { Q } from '@nozbe/watermelondb';

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  gradeLevel?: number;
  theme?: string;
  role?: string;
}

interface DeviceProperties {
  brand: string;
  model: string;
  systemVersion: string;
  appVersion: string;
  buildNumber: string;
  deviceId: string;
  isTablet: boolean;
}

class AnalyticsService {
  private userId: string | null = null;
  private analyticsEnabled = true;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[Analytics] Already initialized');
      return;
    }

    try {
      // Set device properties
      await this.setDeviceProperties();

      this.initialized = true;
      console.log('[Analytics] Initialized');
    } catch (error) {
      console.error('[Analytics] Initialization error:', error);
    }
  }

  async setUser(user: User | null): Promise<void> {
    if (!user) {
      this.userId = null;
      await analytics().setUserId(null);
      Sentry.setUser(null);
      return;
    }

    this.userId = user.id;

    if (!this.analyticsEnabled) {
      console.log('[Analytics] Analytics disabled, skipping user setup');
      return;
    }

    try {
      // Firebase Analytics
      await analytics().setUserId(user.id);

      if (user.gradeLevel) {
        await analytics().setUserProperty(
          'grade_level',
          user.gradeLevel.toString()
        );
      }

      if (user.theme) {
        await analytics().setUserProperty('theme', user.theme);
      }

      if (user.role) {
        await analytics().setUserProperty('role', user.role);
      }

      // Sentry
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : undefined,
      });

      Sentry.setContext('user', {
        gradeLevel: user.gradeLevel,
        theme: user.theme,
        role: user.role,
      });

      console.log('[Analytics] User set:', user.id);
    } catch (error) {
      console.error('[Analytics] Error setting user:', error);
    }
  }

  private async setDeviceProperties(): Promise<void> {
    try {
      const deviceInfo: DeviceProperties = {
        brand: await DeviceInfo.getBrand(),
        model: await DeviceInfo.getModel(),
        systemVersion: await DeviceInfo.getSystemVersion(),
        appVersion: await DeviceInfo.getVersion(),
        buildNumber: await DeviceInfo.getBuildNumber(),
        deviceId: await DeviceInfo.getUniqueId(),
        isTablet: await DeviceInfo.isTablet(),
      };

      if (this.analyticsEnabled) {
        await analytics().setUserProperty('device_model', deviceInfo.model);
        await analytics().setUserProperty('os_version', deviceInfo.systemVersion);
        await analytics().setUserProperty('app_version', deviceInfo.appVersion);
      }

      Sentry.setContext('device', deviceInfo);

      console.log('[Analytics] Device properties set');
    } catch (error) {
      console.error('[Analytics] Error setting device properties:', error);
    }
  }

  // Enable/disable analytics (COPPA compliance)
  setAnalyticsEnabled(enabled: boolean): void {
    this.analyticsEnabled = enabled;
    analytics().setAnalyticsCollectionEnabled(enabled);
    console.log(`[Analytics] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  // Screen tracking
  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    if (!this.analyticsEnabled) return;

    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });

      // Add breadcrumb for Sentry
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Navigated to ${screenName}`,
        level: 'info',
      });
    } catch (error) {
      console.error('[Analytics] Error logging screen view:', error);
    }
  }

  // Generic event tracking
  async logEvent(
    eventName: string,
    params?: Record<string, any>
  ): Promise<void> {
    if (!this.analyticsEnabled) {
      // Store in offline queue
      await this.logOfflineEvent(eventName, params);
      return;
    }

    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.error('[Analytics] Error logging event:', error);
      await this.logOfflineEvent(eventName, params);
    }
  }

  // Lesson events
  async logLessonStarted(
    lessonId: string,
    subject: string,
    gradeLevel: number
  ): Promise<void> {
    await this.logEvent('lesson_started', {
      lesson_id: lessonId,
      subject,
      grade_level: gradeLevel,
      timestamp: Date.now(),
    });
  }

  async logLessonCompleted(
    lessonId: string,
    subject: string,
    timeSpent: number,
    score?: number
  ): Promise<void> {
    await this.logEvent('lesson_completed', {
      lesson_id: lessonId,
      subject,
      time_spent: timeSpent,
      score,
      timestamp: Date.now(),
    });
  }

  // Activity events
  async logActivityStarted(
    activityId: string,
    activityType: string
  ): Promise<void> {
    await this.logEvent('activity_started', {
      activity_id: activityId,
      activity_type: activityType,
      timestamp: Date.now(),
    });
  }

  async logActivityCompleted(
    activityId: string,
    activityType: string,
    score: number,
    timeSpent: number
  ): Promise<void> {
    await this.logEvent('activity_completed', {
      activity_id: activityId,
      activity_type: activityType,
      score,
      time_spent: timeSpent,
      timestamp: Date.now(),
    });
  }

  // Homework events
  async logHomeworkUploaded(subject: string, fileType: string): Promise<void> {
    await this.logEvent('homework_uploaded', {
      subject,
      file_type: fileType,
      timestamp: Date.now(),
    });
  }

  // Engagement events
  async logStreakAchieved(days: number): Promise<void> {
    await this.logEvent('streak_achieved', {
      days,
      timestamp: Date.now(),
    });
  }

  async logBadgeEarned(badgeName: string): Promise<void> {
    await this.logEvent('badge_earned', {
      badge_name: badgeName,
      timestamp: Date.now(),
    });
  }

  async logDailyGoalCompleted(goalType: string): Promise<void> {
    await this.logEvent('daily_goal_completed', {
      goal_type: goalType,
      timestamp: Date.now(),
    });
  }

  // Voice & Accessibility events
  async logVoiceInputUsed(context: string): Promise<void> {
    await this.logEvent('voice_input_used', {
      context,
      timestamp: Date.now(),
    });
  }

  async logTextToSpeechUsed(contentType: string): Promise<void> {
    await this.logEvent('tts_used', {
      content_type: contentType,
      timestamp: Date.now(),
    });
  }

  async logAccessibilityFeatureUsed(feature: string): Promise<void> {
    await this.logEvent('accessibility_feature_used', {
      feature,
      timestamp: Date.now(),
    });
  }

  // Camera events
  async logCameraUsed(purpose: string): Promise<void> {
    await this.logEvent('camera_used', {
      purpose,
      timestamp: Date.now(),
    });
  }

  // Offline events
  async logOfflineModeEntered(): Promise<void> {
    await this.logEvent('offline_mode_entered', {
      timestamp: Date.now(),
    });
  }

  async logOfflineModeExited(durationMs: number): Promise<void> {
    await this.logEvent('offline_mode_exited', {
      duration_ms: durationMs,
      timestamp: Date.now(),
    });
  }

  // Sync events
  async logSyncStarted(syncType: 'manual' | 'automatic'): Promise<void> {
    await this.logEvent('sync_started', {
      sync_type: syncType,
      timestamp: Date.now(),
    });
  }

  async logSyncCompleted(
    syncType: 'manual' | 'automatic',
    durationMs: number,
    itemsSynced: number
  ): Promise<void> {
    await this.logEvent('sync_completed', {
      sync_type: syncType,
      duration_ms: durationMs,
      items_synced: itemsSynced,
      timestamp: Date.now(),
    });
  }

  // Error tracking
  logError(error: Error, context?: Record<string, any>): void {
    console.error('[Analytics] Error:', error, context);

    Sentry.captureException(error, {
      contexts: context ? { custom: context } : undefined,
      level: 'error',
    });
  }

  logWarning(message: string, context?: Record<string, any>): void {
    console.warn('[Analytics] Warning:', message, context);

    Sentry.captureMessage(message, {
      level: 'warning',
      contexts: context ? { custom: context } : undefined,
    });
  }

  // Performance tracking
  async logPerformance(
    metricName: string,
    value: number,
    unit: string
  ): Promise<void> {
    if (!this.analyticsEnabled) return;

    try {
      await analytics().logEvent('performance_metric', {
        metric_name: metricName,
        value,
        unit,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('[Analytics] Error logging performance:', error);
    }
  }

  // Start performance trace
  async startTrace(traceName: string): Promise<void> {
    try {
      const trace = await analytics().startTrace(traceName);
      return trace as any;
    } catch (error) {
      console.error('[Analytics] Error starting trace:', error);
    }
  }

  // User properties
  async setUserProperty(name: string, value: string): Promise<void> {
    if (!this.analyticsEnabled) return;

    try {
      await analytics().setUserProperty(name, value);
    } catch (error) {
      console.error('[Analytics] Error setting user property:', error);
    }
  }

  // Offline event queue
  private async logOfflineEvent(
    eventName: string,
    params?: Record<string, any>
  ): Promise<void> {
    try {
      await database.write(async () => {
        await database.get('analytics_events').create((event: any) => {
          event.eventName = eventName;
          event.params = params ? JSON.stringify(params) : null;
          event.synced = false;
          event.createdAt = Date.now();
        });
      });

      console.log('[Analytics] Event queued for later sync:', eventName);
    } catch (error) {
      console.error('[Analytics] Error queuing offline event:', error);
    }
  }

  // Sync offline events
  async syncOfflineEvents(): Promise<void> {
    if (!this.analyticsEnabled) return;

    try {
      const unsyncedEvents = await database
        .get('analytics_events')
        .query(Q.where('synced', false))
        .fetch();

      console.log(`[Analytics] Syncing ${unsyncedEvents.length} offline events`);

      for (const event of unsyncedEvents) {
        const eventData = event as any;

        try {
          const params = eventData.params ? JSON.parse(eventData.params) : {};
          await analytics().logEvent(eventData.eventName, params);

          // Mark as synced
          await database.write(async () => {
            await event.update((e: any) => {
              e.synced = true;
            });
          });
        } catch (error) {
          console.error(
            `[Analytics] Error syncing event ${eventData.eventName}:`,
            error
          );
        }
      }

      console.log('[Analytics] Offline events synced');
    } catch (error) {
      console.error('[Analytics] Error syncing offline events:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
