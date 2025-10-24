/**
 * Notification Service
 * 
 * Handles push notifications, local reminders, and notification management
 * Uses Notifee for local notifications (Firebase is optional for production)
 */

// @ts-ignore - Notifee package will be installed
import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
  RepeatFrequency,
  EventType,
} from '@notifee/react-native';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  NotificationData,
  LocalNotificationConfig,
  NotificationSettings,
  NotificationChannel,
} from '../../types/notifications';
import {apiClient} from '../api/apiClient';

const STORAGE_KEYS = {
  SETTINGS: '@notification_settings',
  FCM_TOKEN: '@fcm_token',
  SCHEDULED_IDS: '@scheduled_notification_ids',
};

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  dailyRemindersEnabled: true,
  dailyReminderTime: {hour: 9, minute: 0}, // 9:00 AM
  achievementsEnabled: true,
  parentMessagesEnabled: true,
  motivationalEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: {hour: 22, minute: 0}, // 10:00 PM
  quietHoursEnd: {hour: 7, minute: 0}, // 7:00 AM
  soundEnabled: true,
  vibrationEnabled: true,
};

class NotificationService {
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private initialized = false;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load settings
      await this.loadSettings();

      // Request permissions
      await this.requestPermission();

      // Create notification channels (Android)
      if (Platform.OS === 'android') {
        await this.createChannels();
      }

      // Handle notification events
      this.setupEventHandlers();

      // Schedule daily reminders if enabled
      if (this.settings.dailyRemindersEnabled) {
        await this.scheduleDailyReminder(
          this.settings.dailyReminderTime.hour,
          this.settings.dailyReminderTime.minute
        );
      }

      this.initialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();
      
      const granted =
        settings.authorizationStatus >=
        (Platform.OS === 'ios' ? 1 : 0); // 1 = AUTHORIZED on iOS

      if (granted) {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }

      return granted;
    } catch (error) {
      console.error('Failed to request permission:', error);
      return false;
    }
  }

  /**
   * Create notification channels (Android)
   */
  async createChannels(): Promise<void> {
    const channels: NotificationChannel[] = [
      {
        id: 'default',
        name: 'General Notifications',
        description: 'General app notifications',
        importance: 'default',
        sound: 'default',
        vibration: true,
        badge: true,
      },
      {
        id: 'reminders',
        name: 'Activity Reminders',
        description: 'Reminders for lessons and activities',
        importance: 'high',
        sound: 'default',
        vibration: true,
        badge: true,
      },
      {
        id: 'achievements',
        name: 'Achievements',
        description: 'Achievement unlocks and milestones',
        importance: 'high',
        sound: 'achievement',
        vibration: true,
        badge: true,
      },
      {
        id: 'parent_messages',
        name: 'Parent Messages',
        description: 'Messages from parents and teachers',
        importance: 'high',
        sound: 'default',
        vibration: true,
        badge: true,
      },
      {
        id: 'motivational',
        name: 'Motivational',
        description: 'Encouragement and motivational messages',
        importance: 'default',
        sound: 'gentle',
        vibration: false,
        badge: false,
      },
    ];

    for (const channel of channels) {
      await notifee.createChannel({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        importance:
          channel.importance === 'high'
            ? AndroidImportance.HIGH
            : channel.importance === 'low'
            ? AndroidImportance.LOW
            : AndroidImportance.DEFAULT,
        sound: channel.sound,
        vibration: channel.vibration,
        badge: channel.badge,
      });
    }
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers(): void {
    // Handle notification press
    notifee.onForegroundEvent(async ({type, detail}: any) => {
      if (type === EventType.PRESS) {
        await this.handleNotificationPress(detail.notification);
      }
    });

    // Handle background events
    notifee.onBackgroundEvent(async ({type, detail}: any) => {
      if (type === EventType.PRESS) {
        await this.handleNotificationPress(detail.notification);
      }
    });
  }

  /**
   * Handle notification press
   */
  async handleNotificationPress(notification: any): Promise<void> {
    const data = notification?.data;
    if (!data) return;

    const {type, ...payload} = data;

    // TODO: Implement navigation based on notification type
    console.log('Notification pressed:', {type, payload});

    // Example navigation logic:
    // switch (type) {
    //   case 'new_lesson':
    //     navigation.navigate('Lesson', { id: payload.lesson_id });
    //     break;
    //   case 'achievement':
    //     navigation.navigate('Achievements');
    //     break;
    //   case 'parent_message':
    //     navigation.navigate('Messages', { id: payload.message_id });
    //     break;
    // }
  }

  /**
   * Display local notification
   */
  async displayNotification(
    notificationData: NotificationData
  ): Promise<string> {
    if (!this.settings.enabled) {
      console.log('Notifications disabled');
      return '';
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      console.log('Quiet hours active, notification suppressed');
      return '';
    }

    const channelId = this.getChannelForType(notificationData.type);

    const notificationId = await notifee.displayNotification({
      title: notificationData.title,
      body: notificationData.body,
      android: {
        channelId,
        smallIcon: 'ic_notification',
        pressAction: {
          id: 'default',
        },
        sound: this.settings.soundEnabled ? 'default' : undefined,
      },
      ios: {
        sound: this.settings.soundEnabled ? 'default' : undefined,
        badgeCount: 1,
      },
      data: {
        type: notificationData.type,
        ...notificationData.data,
      },
    });

    return notificationId;
  }

  /**
   * Schedule local notification
   */
  async scheduleNotification(
    config: LocalNotificationConfig
  ): Promise<string> {
    if (!this.settings.enabled) {
      return '';
    }

    const channelId = this.getChannelForType(
      (config.data?.type as any) || 'default'
    );

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: config.trigger.getTime(),
      repeatFrequency: config.repeating
        ? config.interval === 'daily'
          ? RepeatFrequency.DAILY
          : RepeatFrequency.WEEKLY
        : undefined,
    };

    const notificationId = await notifee.createTriggerNotification(
      {
        id: config.id,
        title: config.title,
        body: config.body,
        android: {
          channelId,
          smallIcon: 'ic_notification',
          pressAction: {
            id: 'default',
          },
          sound: this.settings.soundEnabled ? 'default' : undefined,
        },
        ios: {
          sound: this.settings.soundEnabled ? 'default' : undefined,
        },
        data: config.data,
      },
      trigger
    );

    // Save scheduled ID
    await this.saveScheduledId(notificationId);

    return notificationId;
  }

  /**
   * Schedule daily reminder
   */
  async scheduleDailyReminder(hour: number, minute: number): Promise<void> {
    const trigger = new Date();
    trigger.setHours(hour, minute, 0, 0);

    if (trigger.getTime() < Date.now()) {
      trigger.setDate(trigger.getDate() + 1);
    }

    await this.scheduleNotification({
      id: 'daily_reminder',
      title: 'Time to Learn! 📚',
      body: "Your daily lessons are ready. Let's learn something new!",
      trigger,
      repeating: true,
      interval: 'daily',
      data: {type: 'daily_reminder'},
    });
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(achievement: {
    title: string;
    description: string;
    icon: string;
  }): Promise<void> {
    if (!this.settings.achievementsEnabled) return;

    await this.displayNotification({
      type: 'achievement',
      title: '🎉 Achievement Unlocked!',
      body: achievement.title,
      data: {
        achievement: JSON.stringify(achievement),
      },
      priority: 'high',
    });
  }

  /**
   * Send activity reminder
   */
  async sendActivityReminder(
    activityTitle: string,
    scheduledTime: Date
  ): Promise<void> {
    await this.scheduleNotification({
      id: `activity_${Date.now()}`,
      title: "Don't forget! 📝",
      body: activityTitle,
      trigger: scheduledTime,
      data: {type: 'activity_reminder'},
    });
  }

  /**
   * Send motivational message
   */
  async sendMotivationalMessage(message: string): Promise<void> {
    if (!this.settings.motivationalEnabled) return;

    const motivationalTitles = [
      'You can do it! 💪',
      'Keep going! 🌟',
      'Awesome work! 🎯',
      'You\'re amazing! ✨',
      'Great job! 👏',
    ];

    const randomTitle =
      motivationalTitles[Math.floor(Math.random() * motivationalTitles.length)];

    await this.displayNotification({
      type: 'motivational',
      title: randomTitle,
      body: message,
      priority: 'low',
    });
  }

  /**
   * Send parent message notification
   */
  async sendParentMessageNotification(
    messagePreview: string,
    messageId: string
  ): Promise<void> {
    if (!this.settings.parentMessagesEnabled) return;

    await this.displayNotification({
      type: 'parent_message',
      title: '💬 New Message',
      body: messagePreview,
      data: {message_id: messageId},
      priority: 'high',
    });
  }

  /**
   * Cancel notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await notifee.cancelNotification(notificationId);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await notifee.cancelAllNotifications();
  }

  /**
   * Get pending notifications
   */
  async getPendingNotifications(): Promise<any[]> {
    return await notifee.getTriggerNotifications();
  }

  /**
   * Update badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      await notifee.setBadgeCount(count);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Check if currently in quiet hours
   */
  isQuietHours(): boolean {
    if (!this.settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const {quietHoursStart, quietHoursEnd} = this.settings;

    const currentTime = currentHour * 60 + currentMinute;
    const startTime = quietHoursStart.hour * 60 + quietHoursStart.minute;
    const endTime = quietHoursEnd.hour * 60 + quietHoursEnd.minute;

    if (startTime > endTime) {
      // Crosses midnight
      return currentTime >= startTime || currentTime < endTime;
    }

    return currentTime >= startTime && currentTime < endTime;
  }

  /**
   * Get channel ID for notification type
   */
  getChannelForType(type: string): string {
    switch (type) {
      case 'activity_reminder':
      case 'daily_reminder':
        return 'reminders';
      case 'achievement':
      case 'streak_milestone':
        return 'achievements';
      case 'parent_message':
        return 'parent_messages';
      case 'motivational':
        return 'motivational';
      default:
        return 'default';
    }
  }

  /**
   * Load settings from storage
   */
  async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        this.settings = {...DEFAULT_SETTINGS, ...JSON.parse(stored)};
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  /**
   * Save settings to storage
   */
  async saveSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      this.settings = {...this.settings, ...settings};
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return {...this.settings};
  }

  /**
   * Save scheduled notification ID
   */
  async saveScheduledId(id: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED_IDS);
      const ids: string[] = stored ? JSON.parse(stored) : [];
      ids.push(id);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SCHEDULED_IDS,
        JSON.stringify(ids)
      );
    } catch (error) {
      console.error('Failed to save scheduled ID:', error);
    }
  }

  /**
   * Register device token with backend
   */
  async registerDeviceToken(token: string): Promise<void> {
    try {
      await apiClient.post('/devices/register', {
        token,
        platform: Platform.OS,
      });
      await AsyncStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
