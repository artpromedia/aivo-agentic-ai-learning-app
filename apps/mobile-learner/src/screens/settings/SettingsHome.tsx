import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import type {SettingsStackScreenProps} from '../../navigation/types';

type NavigationProp = SettingsStackScreenProps<'SettingsHome'>['navigation'];

export default function SettingsHome() {
  const {colors} = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const settingsOptions = [
    {
      title: 'Profile',
      description: 'Manage your profile and preferences',
      icon: '👤',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      title: 'Accessibility',
      description: 'Text-to-speech, voice input, and more',
      icon: '♿️',
      onPress: () => navigation.navigate('Accessibility'),
    },
    {
      title: 'Theme',
      description: 'Customize your learning experience',
      icon: '🎨',
      onPress: () => navigation.navigate('Theme'),
    },
    {
      title: 'Notifications',
      description: 'Manage notification preferences',
      icon: '🔔',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      title: 'Privacy',
      description: 'Data and privacy settings',
      icon: '🔒',
      onPress: () => navigation.navigate('Privacy'),
    },
    {
      title: 'About',
      description: 'App version and information',
      icon: 'ℹ️',
      onPress: () => navigation.navigate('About'),
    },
  ];

  // Add Screenshot Generator in dev mode
  if (__DEV__) {
    settingsOptions.push({
      title: 'Screenshot Generator',
      description: 'Generate app store screenshots (Dev Only)',
      icon: '📸',
      onPress: () => navigation.navigate('ScreenshotGenerator'),
    });
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: colors.text}]}>Settings</Text>
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
          Customize your Aivo Learning experience
        </Text>
      </View>

      <View style={styles.list}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.option, {backgroundColor: colors.card}]}
            onPress={option.onPress}
            accessible
            accessibilityRole="button"
            accessibilityLabel={option.title}
            accessibilityHint={option.description}>
            <View style={styles.optionContent}>
              <Text style={styles.icon}>{option.icon}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, {color: colors.text}]}>
                  {option.title}
                </Text>
                <Text style={[styles.optionDescription, {color: colors.textSecondary}]}>
                  {option.description}
                </Text>
              </View>
              <Text style={[styles.chevron, {color: colors.textSecondary}]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  option: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
  },
  chevron: {
    fontSize: 28,
    fontWeight: '300',
  },
});
