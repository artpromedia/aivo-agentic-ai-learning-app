/**
 * EmptyState Component
 * 
 * Friendly empty state with illustrations and action buttons
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button} from '../Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  gradeTheme?: 'K5' | 'MS' | 'HS';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📚',
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  gradeTheme = 'K5',
}) => {
  return (
    <View style={styles.container}>
      {/* Icon */}
      <Text style={styles.icon}>{icon}</Text>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Action Buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actions}>
          {actionLabel && onAction && (
            <Button
              variant="primary"
              size="md"
              gradeTheme={gradeTheme}
              onPress={onAction}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              size="md"
              gradeTheme={gradeTheme}
              onPress={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  actions: {
    gap: 12,
    width: '100%',
    maxWidth: 300,
  },
});

export default EmptyState;
