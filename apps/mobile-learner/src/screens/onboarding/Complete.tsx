/**
 * Onboarding Complete Screen
 * 
 * Final screen in onboarding flow.
 * Celebrates completion and transitions to main app.
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../theme/ThemeContext';
import {useUserStore} from '../../stores/userStore';
import type {OnboardingStackParamList} from '../../navigation/OnboardingStack';

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Complete'
>;

interface Props {
  navigation: NavigationProp;
}

export default function OnboardingComplete({navigation}: Props) {
  const {colors, spacing, typography, themeType} = useTheme();
  const {completeOnboarding} = useUserStore();

  const handleStartLearning = () => {
    // Mark onboarding as complete
    completeOnboarding();
    // Navigation will be handled by RootNavigator based on isOnboarded state
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Progress Indicator */}
      <View style={[styles.progressContainer, {paddingHorizontal: spacing.xl}]}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {backgroundColor: colors.primary, width: '100%'},
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressText,
            {color: colors.textSecondary, fontSize: typography.sm},
          ]}>
          Step 5 of 5
        </Text>
      </View>

      {/* Content */}
      <View style={[styles.content, {gap: spacing.xl}]}>
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <View
            style={[
              styles.animationPlaceholder,
              {backgroundColor: `${colors.success}15`},
            ]}>
            <Text style={{fontSize: 100}}>🎉</Text>
          </View>
        </View>

        {/* Success Text */}
        <View style={[styles.textContainer, {gap: spacing.md}]}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: themeType === 'K5' ? 32 : 28,
                fontWeight: '700',
              },
            ]}>
            You're All Set!
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontSize: themeType === 'K5' ? 18 : 16,
                lineHeight: themeType === 'K5' ? 26 : 24,
              },
            ]}>
            Your personalized learning experience is ready. Let's start your
            journey!
          </Text>
        </View>

        {/* Features Summary */}
        <View style={[styles.featuresSummary, {gap: spacing.md}]}>
          <SummaryItem
            icon="✅"
            text="Profile set up"
            colors={colors}
            typography={typography}
          />
          <SummaryItem
            icon="🎨"
            text="Theme customized"
            colors={colors}
            typography={typography}
          />
          <SummaryItem
            icon="♿"
            text="Accessibility configured"
            colors={colors}
            typography={typography}
          />
        </View>
      </View>

      {/* Start Learning Button */}
      <View style={[styles.footer, {paddingHorizontal: spacing.xl}]}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: spacing.lg,
            },
          ]}
          onPress={handleStartLearning}
          accessibilityLabel="Start learning"
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
            Start Learning! 🚀
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface SummaryItemProps {
  icon: string;
  text: string;
  colors: any;
  typography: any;
}

function SummaryItem({icon, text, colors, typography}: SummaryItemProps) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text
        style={[
          styles.summaryText,
          {color: colors.text, fontSize: typography.base},
        ]}>
        {text}
      </Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  animationPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  featuresSummary: {
    width: '100%',
    marginTop: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    fontSize: 24,
  },
  summaryText: {
    flex: 1,
  },
  footer: {
    paddingBottom: 40,
  },
  button: {
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
  },
});
