/**
 * Readable Text Component
 * 
 * Accessible text component with:
 * - Dynamic text scaling
 * - Dyslexia-friendly font option
 * - Read-on-tap TTS support
 * - Proper line height for readability
 * - Screen reader support
 */

import React from 'react';
import {Text, TouchableOpacity, StyleSheet, TextStyle} from 'react-native';
import {voiceService} from '@/services/accessibility/voiceService';

interface ReadableTextProps {
  children: string | React.ReactNode;
  style?: TextStyle;
  readOnTap?: boolean;
  textScale?: number;
  dyslexiaFont?: boolean;
  accessibilityLabel?: string;
  className?: string;
}

export const ReadableText: React.FC<ReadableTextProps> = ({
  children,
  style,
  readOnTap = false,
  textScale = 1.0,
  dyslexiaFont = false,
  accessibilityLabel,
  className,
}) => {
  const handlePress = async () => {
    if (readOnTap && typeof children === 'string') {
      await voiceService.speak(children);
    }
  };

  const getFontFamily = (): string => {
    if (dyslexiaFont) {
      return 'OpenDyslexic'; // Dyslexia-friendly font
    }
    return 'Inter'; // Default font
  };

  const baseFontSize = (style?.fontSize as number) || 16;
  const scaledFontSize = baseFontSize * textScale;
  const lineHeight = scaledFontSize * 1.5; // 1.5x for readability

  const textStyle: TextStyle = {
    ...style,
    fontSize: scaledFontSize,
    fontFamily: getFontFamily(),
    lineHeight,
  };

  const Component = readOnTap ? TouchableOpacity : Text;
  const textContent = typeof children === 'string' ? children : '';

  return (
    <Component
      onPress={readOnTap ? handlePress : undefined}
      style={textStyle}
      accessible={true}
      accessibilityLabel={accessibilityLabel || textContent}
      accessibilityRole="text"
      // @ts-ignore - className works with NativeWind
      className={className}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#000000',
  },
});
