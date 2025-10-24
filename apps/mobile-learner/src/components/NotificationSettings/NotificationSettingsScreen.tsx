/**
 * Notification Settings Component
 * 
 * Settings screen for notification preferences
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {useTheme} from '../../theme/enhancedTheme';
import {notificationService} from '../../services/notifications/notificationService';
import type {NotificationSettings} from '../../types/notifications';

export const NotificationSettingsScreen: React.FC = () => {
  const {colors, theme} = useTheme();
  const spacing = theme.spacing;
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const currentSettings = notificationService.getSettings();
    setSettings(currentSettings);
  };

  const updateSetting = async <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    if (!settings) return;

    const newSettings = {...settings, [key]: value};
    setSettings(newSettings);
    await notificationService.saveSettings({[key]: value});

    // Reschedule daily reminder if time changed
    if (
      key === 'dailyReminderTime' ||
      (key === 'dailyRemindersEnabled' && value === true)
    ) {
      const time = key === 'dailyReminderTime' ? value : settings.dailyReminderTime;
      if (typeof time === 'object' && 'hour' in time) {
        await notificationService.scheduleDailyReminder(
          time.hour,
          time.minute
        );
      }
    }
  };

  if (!settings) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <Text style={{color: colors.text}}>Loading...</Text>
      </View>
    );
  }

  const renderSwitch = (
    label: string,
    description: string,
    value: boolean,
    key: keyof NotificationSettings
  ) => (
    <View
      style={[
        styles.settingRow,
        {
          backgroundColor: colors.surface,
          padding: spacing.md,
          borderRadius: theme.borderRadius.md,
          marginBottom: spacing.sm,
        },
      ]}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, {color: colors.text}]}>{label}</Text>
        <Text style={[styles.settingDescription, {color: colors.textSecondary}]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => updateSetting(key, newValue)}
        trackColor={{false: colors.disabled, true: colors.primary}}
        thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
        accessibilityLabel={`${label} ${value ? 'enabled' : 'disabled'}`}
      />
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={{padding: spacing.md}}>
      {/* Main Toggle */}
      <View style={[styles.section, {marginBottom: spacing.lg}]}>
        <Text
          style={[
            styles.sectionTitle,
            {color: colors.text, marginBottom: spacing.md},
          ]}
          accessibilityRole="header">
          Notifications
        </Text>
        {renderSwitch(
          'Enable Notifications',
          'Receive all app notifications',
          settings.enabled,
          'enabled'
        )}
      </View>

      {/* Notification Types */}
      {settings.enabled && (
        <>
          <View style={[styles.section, {marginBottom: spacing.lg}]}>
            <Text
              style={[
                styles.sectionTitle,
                {color: colors.text, marginBottom: spacing.md},
              ]}
              accessibilityRole="header">
              Types
            </Text>
            {renderSwitch(
              'Daily Reminders',
              'Daily "Time to Learn" notifications',
              settings.dailyRemindersEnabled,
              'dailyRemindersEnabled'
            )}
            {renderSwitch(
              'Achievements',
              'When you unlock new achievements',
              settings.achievementsEnabled,
              'achievementsEnabled'
            )}
            {renderSwitch(
              'Parent Messages',
              'Messages from parents and teachers',
              settings.parentMessagesEnabled,
              'parentMessagesEnabled'
            )}
            {renderSwitch(
              'Motivational',
              'Encouragement and tips',
              settings.motivationalEnabled,
              'motivationalEnabled'
            )}
          </View>

          {/* Quiet Hours */}
          <View style={[styles.section, {marginBottom: spacing.lg}]}>
            <Text
              style={[
                styles.sectionTitle,
                {color: colors.text, marginBottom: spacing.md},
              ]}
              accessibilityRole="header">
              Quiet Hours
            </Text>
            {renderSwitch(
              'Enable Quiet Hours',
              'No notifications during sleep time',
              settings.quietHoursEnabled,
              'quietHoursEnabled'
            )}

            {settings.quietHoursEnabled && (
              <View
                style={[
                  styles.timeRow,
                  {
                    backgroundColor: colors.surface,
                    padding: spacing.md,
                    borderRadius: theme.borderRadius.md,
                    marginTop: spacing.sm,
                  },
                ]}>
                <View style={styles.timeItem}>
                  <Text
                    style={[styles.timeLabel, {color: colors.textSecondary}]}>
                    Start
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.timeButton,
                      {
                        backgroundColor: colors.background,
                        padding: spacing.sm,
                        borderRadius: theme.borderRadius.sm,
                      },
                    ]}
                    accessibilityLabel="Set quiet hours start time"
                    accessibilityRole="button">
                    <Text style={[styles.timeText, {color: colors.text}]}>
                      {String(settings.quietHoursStart.hour).padStart(2, '0')}:
                      {String(settings.quietHoursStart.minute).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.timeSeparator, {marginHorizontal: spacing.md}]}>
                  <Text style={{color: colors.textSecondary}}>—</Text>
                </View>

                <View style={styles.timeItem}>
                  <Text
                    style={[styles.timeLabel, {color: colors.textSecondary}]}>
                    End
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.timeButton,
                      {
                        backgroundColor: colors.background,
                        padding: spacing.sm,
                        borderRadius: theme.borderRadius.sm,
                      },
                    ]}
                    accessibilityLabel="Set quiet hours end time"
                    accessibilityRole="button">
                    <Text style={[styles.timeText, {color: colors.text}]}>
                      {String(settings.quietHoursEnd.hour).padStart(2, '0')}:
                      {String(settings.quietHoursEnd.minute).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Sound & Vibration */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {color: colors.text, marginBottom: spacing.md},
              ]}
              accessibilityRole="header">
              Sound & Vibration
            </Text>
            {renderSwitch(
              'Sound',
              'Play notification sounds',
              settings.soundEnabled,
              'soundEnabled'
            )}
            {Platform.OS === 'android' &&
              renderSwitch(
                'Vibration',
                'Vibrate on notifications',
                settings.vibrationEnabled,
                'vibrationEnabled'
              )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {},
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontWeight: '400',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeButton: {
    alignItems: 'center',
    minWidth: 80,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  timeSeparator: {
    alignItems: 'center',
  },
});

export default NotificationSettingsScreen;
