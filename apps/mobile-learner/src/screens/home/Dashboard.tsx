/**
 * Dashboard Screen (Home Tab)
 * 
 * Main screen showing personalized dashboard for the learner.
 * Displays daily activities, recommendations, and quick actions.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';
import {useUserStore} from '../../stores/userStore';

export default function Dashboard() {
  const {colors, spacing, typography, themeType} = useTheme();
  const {profile} = useUserStore();

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      contentContainerStyle={[styles.content, {padding: spacing.xl}]}>
      <Text
        style={[
          styles.greeting,
          {
            color: colors.text,
            fontSize: themeType === 'K5' ? 28 : 24,
            fontWeight: '700',
          },
        ]}>
        Welcome back{profile?.name ? `, ${profile.name}` : ''}! 👋
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: colors.textSecondary,
            fontSize: typography.base,
            marginTop: spacing.sm,
          },
        ]}>
        Your dashboard is coming soon. This is a placeholder screen.
      </Text>

      {/* Placeholder content */}
      <View
        style={[
          styles.placeholder,
          {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: spacing.lg,
            marginTop: spacing.xl,
          },
        ]}>
        <Text style={[styles.placeholderText, {color: colors.textSecondary}]}>
          📊 Dashboard widgets will appear here
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
  },
  greeting: {
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 22,
  },
  placeholder: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
