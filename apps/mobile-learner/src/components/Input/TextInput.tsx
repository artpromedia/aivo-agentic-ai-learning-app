/**
 * TextInput Component
 * 
 * Enhanced text input with voice input, clear button, and accessibility
 */

import React, {useState} from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  Platform,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showClearButton?: boolean;
  showVoiceButton?: boolean;
  onVoicePress?: () => void;
  gradeTheme?: 'K5' | 'MS' | 'HS';
}

export const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  showClearButton = true,
  showVoiceButton = false,
  onVoicePress,
  gradeTheme = 'K5',
  value,
  onChangeText,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight');
    }
    onChangeText?.('');
  };

  const handleVoice = () => {
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactMedium');
    }
    onVoicePress?.();
  };

  const fontSize = gradeTheme === 'K5' ? 18 : gradeTheme === 'MS' ? 16 : 15;

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {/* Text Input */}
        <RNTextInput
          style={[styles.input, {fontSize}, leftIcon ? styles.inputWithLeftIcon : undefined]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9CA3AF"
          accessible={true}
          accessibilityLabel={label || textInputProps.placeholder}
          accessibilityHint={hint}
          {...textInputProps}
        />

        {/* Clear Button */}
        {showClearButton && value && value.length > 0 && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleClear}
            accessibilityLabel="Clear text"
            accessibilityRole="button"
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>
        )}

        {/* Voice Button */}
        {showVoiceButton && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleVoice}
            accessibilityLabel="Voice input"
            accessibilityRole="button"
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Text style={styles.iconText}>🎤</Text>
          </TouchableOpacity>
        )}

        {/* Right Icon */}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {/* Error or Hint */}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#111827',
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  iconText: {
    fontSize: 18,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default TextInput;
