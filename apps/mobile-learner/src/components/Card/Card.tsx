/**
 * Card Component
 * 
 * Pressable cards with haptic feedback and grade-themed styling
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  gradeTheme?: 'K5' | 'MS' | 'HS';
  variant?: 'default' | 'elevated' | 'outlined';
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  gradeTheme = 'K5',
  variant = 'default',
  disabled = false,
  testID,
  accessibilityLabel,
}) => {
  const handlePress = () => {
    if (disabled || !onPress) return;

    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', {
        enableVibrateFallback: true,
      });
    }

    onPress();
  };

  const cardStyle: ViewStyle = {
    ...styles.base,
    ...styles[`variant_${variant}`],
    ...styles[`theme_${gradeTheme}`],
    ...(disabled && styles.disabled),
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={cardStyle}
      onPress={onPress ? handlePress : undefined}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  base: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },

  // Variant styles
  variant_default: {
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  variant_elevated: {
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  variant_outlined: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Grade theme styles
  theme_K5: {
    borderRadius: 16, // More rounded
  },
  theme_MS: {
    borderRadius: 12,
  },
  theme_HS: {
    borderRadius: 8, // More professional
  },

  disabled: {
    opacity: 0.5,
  },
});

export default Card;
