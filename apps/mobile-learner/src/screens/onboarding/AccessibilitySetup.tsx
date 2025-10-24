/**
 * Accessibility Setup Screen
 * 
 * Allows the user to configure accessibility features.
 * Important for neurodiverse learners.
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../theme/ThemeContext';
import {useUserStore} from '../../stores/userStore';
import type {OnboardingStackParamList} from '../../navigation/OnboardingStack';

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'AccessibilitySetup'
>;

interface Props {
  navigation: NavigationProp;
}

export default function AccessibilitySetup({navigation}: Props) {
  const {colors, spacing, typography, themeType} = useTheme();
  const {setPreferences, accessibilitySettings, setAccessibilitySettings} =
    useUserStore();

  // Local state for settings
  const [highContrast, setHighContrast] = useState(
    accessibilitySettings.highContrast
  );
  const [reducedMotion, setReducedMotion] = useState(
    accessibilitySettings.reducedMotion
  );
  const [largerTouchTargets, setLargerTouchTargets] = useState(
    accessibilitySettings.largerTouchTargets
  );
  const [voiceGuidance, setVoiceGuidance] = useState(
    accessibilitySettings.voiceGuidance
  );
  const [enableTTS, setEnableTTS] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);

  const handleContinue = () => {
    // Save all settings
    setAccessibilitySettings({
      highContrast,
      reducedMotion,
      largerTouchTargets,
      voiceGuidance,
    });

    setPreferences({
      enableTTS,
      enableAnimations,
    });

    navigation.navigate('Complete');
  };

  const handleSkip = () => {
    navigation.navigate('Complete');
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Progress Indicator */}
      <View style={[styles.progressContainer, {paddingHorizontal: spacing.xl}]}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {backgroundColor: colors.primary, width: '80%'},
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressText,
            {color: colors.textSecondary, fontSize: typography.sm},
          ]}>
          Step 4 of 5
        </Text>
      </View>

      {/* Header */}
      <View style={[styles.header, {paddingHorizontal: spacing.xl}]}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: themeType === 'K5' ? 28 : 24,
              fontWeight: '700',
            },
          ]}>
          Accessibility Features
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontSize: themeType === 'K5' ? 16 : 14,
            },
          ]}>
          Customize your learning experience to work best for you
        </Text>
      </View>

      {/* Settings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingHorizontal: spacing.xl, gap: spacing.md},
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Visual Settings */}
        <View style={[styles.section, {gap: spacing.sm}]}>
          <Text
            style={[
              styles.sectionTitle,
              {color: colors.text, fontSize: typography.base, fontWeight: '600'},
            ]}>
            Visual
          </Text>

          <SettingItem
            icon="🎨"
            title="High Contrast"
            description="Increases contrast for better visibility"
            value={highContrast}
            onValueChange={setHighContrast}
            colors={colors}
            typography={typography}
            themeType={themeType}
          />

          <SettingItem
            icon="✨"
            title="Reduce Motion"
            description="Minimizes animations and transitions"
            value={reducedMotion}
            onValueChange={setReducedMotion}
            colors={colors}
            typography={typography}
            themeType={themeType}
          />

          <SettingItem
            icon="🎬"
            title="Enable Animations"
            description="Show fun animations and transitions"
            value={enableAnimations}
            onValueChange={setEnableAnimations}
            colors={colors}
            typography={typography}
            themeType={themeType}
          />
        </View>

        {/* Interaction Settings */}
        <View style={[styles.section, {gap: spacing.sm}]}>
          <Text
            style={[
              styles.sectionTitle,
              {color: colors.text, fontSize: typography.base, fontWeight: '600'},
            ]}>
            Interaction
          </Text>

          <SettingItem
            icon="👆"
            title="Larger Touch Targets"
            description="Makes buttons easier to tap"
            value={largerTouchTargets}
            onValueChange={setLargerTouchTargets}
            colors={colors}
            typography={typography}
            themeType={themeType}
          />
        </View>

        {/* Audio Settings */}
        <View style={[styles.section, {gap: spacing.sm}]}>
          <Text
            style={[
              styles.sectionTitle,
              {color: colors.text, fontSize: typography.base, fontWeight: '600'},
            ]}>
            Audio
          </Text>

          <SettingItem
            icon="🔊"
            title="Voice Guidance"
            description="Hear helpful audio instructions"
            value={voiceGuidance}
            onValueChange={setVoiceGuidance}
            colors={colors}
            typography={typography}
            themeType={themeType}
          />

          <SettingItem
            icon="📢"
            title="Text-to-Speech"
            description="Have text read aloud to you"
            value={enableTTS}
            onValueChange={setEnableTTS}
            colors={colors}
            typography={typography}
            themeType={themeType}
          />
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, {paddingHorizontal: spacing.xl, gap: spacing.md}]}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: spacing.lg,
            },
          ]}
          onPress={handleContinue}
          accessibilityLabel="Continue to complete onboarding"
          accessibilityRole="button">
          <Text
            style={[
              styles.buttonText,
              {
                color: '#FFFFFF',
                fontSize: themeType === 'K5' ? 18 : 16,
                fontWeight: '600',
              },
            ]}>
            Continue
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.skipButton, {paddingVertical: spacing.sm}]}
          onPress={handleSkip}
          accessibilityLabel="Skip accessibility setup"
          accessibilityRole="button">
          <Text
            style={[
              styles.skipText,
              {
                color: colors.textSecondary,
                fontSize: themeType === 'K5' ? 16 : 14,
              },
            ]}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface SettingItemProps {
  icon: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: any;
  typography: any;
  themeType: string;
}

function SettingItem({
  icon,
  title,
  description,
  value,
  onValueChange,
  colors,
  typography,
  themeType,
}: SettingItemProps) {
  return (
    <View
      style={[
        styles.settingItem,
        {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
        },
      ]}>
      <View style={styles.settingContent}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text
            style={[
              styles.settingTitle,
              {
                color: colors.text,
                fontSize: themeType === 'K5' ? 16 : 14,
                fontWeight: '600',
              },
            ]}>
            {title}
          </Text>
          <Text
            style={[
              styles.settingDescription,
              {
                color: colors.textSecondary,
                fontSize: typography.sm,
              },
            ]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{false: colors.border, true: `${colors.primary}80`}}
        thumbColor={value ? colors.primary : '#f4f3f4'}
        accessibilityLabel={`Toggle ${title}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'center',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    marginBottom: 2,
  },
  settingDescription: {
    lineHeight: 18,
  },
  footer: {
    paddingVertical: 20,
  },
  button: {
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
  },
  skipButton: {
    alignItems: 'center',
  },
  skipText: {
    textAlign: 'center',
  },
});
