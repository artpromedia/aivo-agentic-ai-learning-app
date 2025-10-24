/**
 * Aivo Learner - Mobile App Entry Point
 * 
 * React Native app for neurodiverse learners with:
 * - Grade-based theming (K5/MS/HS)
 * - Light/Dark mode support
 * - Comprehensive navigation architecture
 * - Offline-first capabilities
 */

import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet} from 'react-native';

// Theme Provider
import {ThemeProvider} from './src/theme/enhancedTheme';
import {getThemeTypeForGrade} from './src/theme/gradeThemes';

// Navigation
import RootNavigator from './src/navigation/RootNavigator';
import {
  navigationRef,
  linkingConfig,
  onNavigationReady,
  onNavigationStateChange,
} from './src/navigation/navigationUtils';

// Create QueryClient for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

function App(): React.JSX.Element {
  // TODO: Get user grade from user store/profile
  const userGrade = 'K'; // Default to K5 theme
  const themeType = getThemeTypeForGrade(userGrade);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider themeType={themeType}>
            <PaperProvider>
              <NavigationContainer
                ref={navigationRef}
                linking={linkingConfig}
                onReady={onNavigationReady}
                onStateChange={onNavigationStateChange}
              >
                <RootNavigator />
              </NavigationContainer>
            </PaperProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
