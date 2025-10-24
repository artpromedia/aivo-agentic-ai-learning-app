/**
 * ThemeProvider Component
 * 
 * Provides theme context to all child components
 * Manages theme switching and persistence
 */

import React, {useState, useEffect, useMemo, type ReactNode} from 'react';
import {useColorScheme} from 'react-native';
import {MMKV} from 'react-native-mmkv';
import {
  ThemeContext,
  getTheme,
  getSystemColorScheme,
  type ThemeType,
  type ColorMode,
  type ThemeContextValue,
} from '../theme';

const storage = new MMKV();

const THEME_TYPE_KEY = 'theme_type';
const COLOR_MODE_KEY = 'color_mode';

export interface ThemeProviderProps {
  children: ReactNode;
  defaultThemeType?: ThemeType;
  defaultColorMode?: ColorMode | 'system';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultThemeType = 'K5',
  defaultColorMode = 'system',
}) => {
  // Get system color scheme
  const systemColorScheme = useColorScheme();

  // Load saved theme type from storage
  const [themeType, setThemeTypeState] = useState<ThemeType>(() => {
    const saved = storage.getString(THEME_TYPE_KEY);
    return (saved as ThemeType) || defaultThemeType;
  });

  // Load saved color mode from storage
  const [colorModePreference, setColorModePreference] = useState<
    ColorMode | 'system'
  >(() => {
    const saved = storage.getString(COLOR_MODE_KEY);
    return (saved as ColorMode | 'system') || defaultColorMode;
  });

  // Determine actual color mode (resolve 'system' to 'light' or 'dark')
  const colorMode: ColorMode = useMemo(() => {
    if (colorModePreference === 'system') {
      return getSystemColorScheme(systemColorScheme);
    }
    return colorModePreference;
  }, [colorModePreference, systemColorScheme]);

  // Get current theme based on themeType and colorMode
  const theme = useMemo(() => {
    return getTheme(themeType, colorMode);
  }, [themeType, colorMode]);

  // Set theme type and persist to storage
  const setThemeType = (type: ThemeType) => {
    setThemeTypeState(type);
    storage.set(THEME_TYPE_KEY, type);
  };

  // Set color mode and persist to storage
  const setColorMode = (mode: ColorMode | 'system') => {
    setColorModePreference(mode);
    storage.set(COLOR_MODE_KEY, mode);
  };

  // Toggle between light and dark mode
  const toggleColorMode = () => {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
  };

  // Context value
  const value: ThemeContextValue = {
    theme,
    themeType,
    colorMode,
    setThemeType,
    setColorMode: (mode: ColorMode) => setColorMode(mode),
    toggleColorMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;
