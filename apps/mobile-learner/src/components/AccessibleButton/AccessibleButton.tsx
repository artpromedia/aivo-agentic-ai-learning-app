/**
 * Accessible Button Component
 * 
 * Fully accessible button with:
 * - Proper accessibility labels and hints
 * - Haptic feedback
 * - Minimum touch target (44x44)
 * - Screen reader support
 * - Focus management
 */

import React, {useRef} from 'react';
import {
  TouchableOpacity,
  Text,
  AccessibilityRole,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import {accessibilityService} from '@/services/accessibility/accessibilityService';

interface AccessibleButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
  accessibilityHint?: string;
  role?: AccessibilityRole;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticType?: 'selection' | 'success' | 'warning' | 'error';
  announceOnPress?: string;
  className?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onPress,
  children,
  accessibilityLabel,
  accessibilityHint,
  role = 'button',
  disabled = false,
  style,
  textStyle,
  hapticType = 'selection',
  announceOnPress,
  className,
}) => {
  const ref = useRef(null);

  const handlePress = () => {
    if (disabled) return;

    // Haptic feedback
    accessibilityService.triggerHaptic(hapticType);

    // Call onPress
    onPress();

    // Announce action if specified
    if (announceOnPress) {
      accessibilityService.announceDelayed(announceOnPress, 100);
    }
  };

  return (
    <TouchableOpacity
      ref={ref}
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={role}
      accessibilityState={{disabled}}
      style={[styles.button, style]}
      className={className}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
