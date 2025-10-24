/**
 * Screenshot Generator Screen
 * 
 * Developer-only screen for generating app store screenshots.
 * Access via dev menu or deep link.
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  screenshotGenerator,
  ScreenshotConfig,
} from '../../../scripts/generate-screenshots';

const SCREENS_TO_CAPTURE: ScreenshotConfig[] = [
  {
    name: '01-Welcome',
    route: 'Welcome',
    delay: 1500,
  },
  {
    name: '02-Home',
    route: 'Home',
    delay: 2000,
  },
  {
    name: '03-Subjects',
    route: 'Subjects',
    delay: 2000,
  },
  {
    name: '04-Lesson',
    route: 'LessonDetail',
    delay: 2000,
  },
  {
    name: '05-Activity',
    route: 'Activity',
    delay: 2000,
  },
  {
    name: '06-Progress',
    route: 'Progress',
    delay: 2000,
  },
  {
    name: '07-Homework',
    route: 'HomeworkHelper',
    delay: 2000,
  },
  {
    name: '08-Rewards',
    route: 'Rewards',
    delay: 2000,
  },
  {
    name: '09-Accessibility',
    route: 'AccessibilitySettings',
    delay: 2000,
  },
];

export function ScreenshotGeneratorScreen() {
  const navigation = useNavigation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [generatedPaths, setGeneratedPaths] = useState<string[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<string>('');

  React.useEffect(() => {
    const info = screenshotGenerator.getCurrentDeviceInfo();
    setDeviceInfo(`${info.name} (${info.width}x${info.height}@${info.scale}x)`);
  }, []);

  const captureCurrentScreen = async () => {
    try {
      await screenshotGenerator.initialize();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const path = await screenshotGenerator.captureScreen(
        `manual-${timestamp}`
      );

      Alert.alert(
        'Screenshot Saved',
        `Screenshot saved to:\n${path}`,
        [{text: 'OK'}]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to capture screenshot: ${error}`,
        [{text: 'OK'}]
      );
    }
  };

  const generateAllScreenshots = async () => {
    setIsGenerating(true);
    setCurrentIndex(0);
    setGeneratedPaths([]);

    try {
      await screenshotGenerator.initialize();

      const paths: string[] = [];

      for (let i = 0; i < SCREENS_TO_CAPTURE.length; i++) {
        const screen = SCREENS_TO_CAPTURE[i];
        setCurrentIndex(i);

        // Navigate to screen
        try {
          (navigation as any).navigate(screen.route);
        } catch (navError) {
          console.warn(`Navigation to ${screen.route} failed:`, navError);
        }

        // Wait for navigation + screen load
        await new Promise((resolve) =>
          setTimeout(resolve, screen.delay || 2000)
        );

        // Capture screenshot
        const path = await screenshotGenerator.captureScreen(screen.name);
        paths.push(path);
      }

      setGeneratedPaths(paths);

      Alert.alert(
        'Success!',
        `Generated ${paths.length} screenshots!\n\nSaved to:\n${screenshotGenerator.getScreenshotsDirectory()}`,
        [{text: 'OK'}]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        `Screenshot generation failed: ${error}`,
        [{text: 'OK'}]
      );
    } finally {
      setIsGenerating(false);
      setCurrentIndex(-1);
    }
  };

  const listScreenshots = async () => {
    try {
      const screenshots = await screenshotGenerator.listScreenshots();

      if (screenshots.length === 0) {
        Alert.alert('No Screenshots', 'No screenshots found.', [{text: 'OK'}]);
        return;
      }

      Alert.alert(
        'Screenshots',
        `Found ${screenshots.length} screenshots:\n\n${screenshots.map((p) => p.split('/').pop()).join('\n')}`,
        [{text: 'OK'}]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to list screenshots: ${error}`, [
        {text: 'OK'},
      ]);
    }
  };

  const clearScreenshots = async () => {
    Alert.alert(
      'Clear Screenshots?',
      'This will delete all generated screenshots. Continue?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await screenshotGenerator.clearScreenshots();
              setGeneratedPaths([]);
              Alert.alert('Success', 'All screenshots deleted.', [
                {text: 'OK'},
              ]);
            } catch (error) {
              Alert.alert('Error', `Failed to clear screenshots: ${error}`, [
                {text: 'OK'},
              ]);
            }
          },
        },
      ]
    );
  };

  const getRequiredSizes = () => {
    const sizes = screenshotGenerator.getRequiredSizes();
    const sizeText = sizes
      .map((s) => `• ${s.name}: ${s.width}x${s.height}@${s.scale}x`)
      .join('\n');

    Alert.alert('Required Sizes', sizeText, [{text: 'OK'}]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Screenshot Generator</Text>
        <Text style={styles.subtitle}>App Store Assets</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Info</Text>
        <Text style={styles.deviceInfo}>{deviceInfo}</Text>
        <TouchableOpacity style={styles.linkButton} onPress={getRequiredSizes}>
          <Text style={styles.linkText}>View Required Sizes →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={captureCurrentScreen}
          disabled={isGenerating}>
          <Text style={styles.buttonText}>Capture Current Screen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={generateAllScreenshots}
          disabled={isGenerating}>
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={[styles.buttonText, styles.loadingText]}>
                Generating {currentIndex + 1}/{SCREENS_TO_CAPTURE.length}...
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              Generate All Screenshots ({SCREENS_TO_CAPTURE.length})
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={listScreenshots}
          disabled={isGenerating}>
          <Text style={styles.buttonText}>List Screenshots</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearScreenshots}
          disabled={isGenerating}>
          <Text style={styles.buttonText}>Clear All Screenshots</Text>
        </TouchableOpacity>
      </View>

      {generatedPaths.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Generated ({generatedPaths.length})
          </Text>
          {generatedPaths.map((path, index) => (
            <Text key={index} style={styles.pathText}>
              {index + 1}. {path.split('/').pop()}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instructions}>
          1. Run this app on different device sizes (iPhone 6.7", iPad Pro,
          etc.)
          {'\n\n'}
          2. Tap "Generate All Screenshots" to capture all screens
          {'\n\n'}
          3. Screenshots are saved to Documents/screenshots/
          {'\n\n'}
          4. Access files via Files app or Xcode/Android Studio
          {'\n\n'}
          5. Upload to App Store Connect / Play Console
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Screens to Capture</Text>
        {SCREENS_TO_CAPTURE.map((screen, index) => (
          <View
            key={index}
            style={[
              styles.screenItem,
              currentIndex === index && styles.screenItemActive,
            ]}>
            <Text
              style={[
                styles.screenName,
                currentIndex === index && styles.screenNameActive,
              ]}>
              {screen.name}
            </Text>
            <Text
              style={[
                styles.screenRoute,
                currentIndex === index && styles.screenRouteActive,
              ]}>
              {screen.route}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  deviceInfo: {
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
    }),
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  linkButton: {
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  successButton: {
    backgroundColor: '#34C759',
  },
  secondaryButton: {
    backgroundColor: '#5856D6',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 12,
  },
  pathText: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
    }),
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  screenItem: {
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  screenItemActive: {
    backgroundColor: '#34C759',
  },
  screenName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  screenNameActive: {
    color: '#fff',
  },
  screenRoute: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  screenRouteActive: {
    color: '#fff',
    opacity: 0.9,
  },
});
