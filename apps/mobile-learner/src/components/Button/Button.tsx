/**
 * Button Component
 * 
 * Adaptive button with grade-themed variants and accessibility features
 * - Minimum 44x44dp touch target (WCAG AAA)
 * - Haptic feedback
 * - Loading states
 * - TalkBack/VoiceOver support
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  gradeTheme?: 'K5' | 'MS' | 'HS';
  isLoading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
  haptic?: boolean;
  fullWidth?: boolean;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  gradeTheme = 'K5',
  isLoading = false,
  disabled = false,
  onPress,
  children,
  accessibilityLabel,
  haptic = true,
  fullWidth = false,
  testID,
}) => {
  const handlePress = () => {
    if (isLoading || disabled) return;

    // Haptic feedback
    if (haptic && Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }

    onPress();
  };

  const buttonStyle: ViewStyle = {
    ...styles.base,
    ...styles[`size_${size}`],
    ...styles[`variant_${variant}`],
    ...styles[`theme_${gradeTheme}`],
    ...(fullWidth && styles.fullWidth),
    ...(disabled && styles.disabled),
  };

  const textStyle: TextStyle = {
    ...styles.text,
    ...styles[`text_${size}`],
    ...styles[`text_${variant}`],
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || isLoading}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : 'Button')}
      accessibilityRole="button"
      accessibilityState={{disabled: disabled || isLoading, busy: isLoading}}
      testID={testID}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#3B82F6' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  // Size styles (minimum 44dp touch target)
  size_sm: {
    height: 44,
    paddingHorizontal: 16,
    minWidth: 44,
  },
  size_md: {
    height: 48,
    paddingHorizontal: 24,
    minWidth: 48,
  },
  size_lg: {
    height: 56,
    paddingHorizontal: 32,
    minWidth: 56,
  },

  // Variant styles
  variant_primary: {
    backgroundColor: '#3B82F6',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  variant_secondary: {
    backgroundColor: '#10B981',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },

  // Grade theme styles
  theme_K5: {
    borderRadius: 16, // More rounded for younger kids
    ...Platform.select({
      ios: {
        shadowRadius: 12, // More prominent shadow
      },
      android: {
        elevation: 6,
      },
    }),
  },
  theme_MS: {
    borderRadius: 12, // Balanced
  },
  theme_HS: {
    borderRadius: 8, // More professional
    ...Platform.select({
      ios: {
        shadowRadius: 4, // Subtle shadow
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_sm: {
    fontSize: 14,
    lineHeight: 20,
  },
  text_md: {
    fontSize: 16,
    lineHeight: 24,
  },
  text_lg: {
    fontSize: 18,
    lineHeight: 28,
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#FFFFFF',
  },
  text_outline: {
    color: '#3B82F6',
  },
  text_ghost: {
    color: '#3B82F6',
  },

  // State styles
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button;
