/**
 * Model Cloning Screen
 * 
 * Shows animated AI brain creation process (10 seconds).
 * Uses baseline assessment data to personalize the AI model.
 * Matches the existing learner-app cloning animation.
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../theme/ThemeContext';
import type {OnboardingStackParamList} from '../../navigation/OnboardingStack';

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'ModelCloning'
>;

interface Props {
  navigation: NavigationProp;
}

interface CloningMessage {
  progress: number;
  message: string;
  emoji: string;
}

const CLONING_MESSAGES: CloningMessage[] = [
  {progress: 0, message: 'Starting your AI brain... 🧠', emoji: '🔮'},
  {progress: 20, message: 'Learning your strengths... 💪', emoji: '✨'},
  {progress: 40, message: 'Understanding how you learn... 📚', emoji: '🎯'},
  {progress: 60, message: 'Personalizing just for you... 🎨', emoji: '🌟'},
  {progress: 80, message: 'Almost ready... 🚀', emoji: '⚡'},
  {progress: 100, message: 'Your AI is ready! 🎉', emoji: '🎊'},
];

export default function ModelCloning({navigation}: Props) {
  const {colors, spacing, typography, themeType} = useTheme();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(CLONING_MESSAGES[0]);

  useEffect(() => {
    // Simulate cloning progress (completes in ~10 seconds)
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 2, 100);

        // Update message based on progress
        const message = [...CLONING_MESSAGES]
          .reverse()
          .find((m) => newProgress >= m.progress);
        if (message) {
          setCurrentMessage(message);
        }

        // Navigate when complete
        if (newProgress === 100) {
          setTimeout(() => {
            navigation.navigate('AssessmentResults');
          }, 2000);
        }

        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [navigation]);

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Content */}
      <View style={[styles.content, {gap: spacing.xl}]}>
        {/* Progress Ring */}
        <View style={styles.progressRingContainer}>
          <View
            style={[
              styles.progressRing,
              {
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: `${colors.primary}20`,
                borderWidth: 8,
                borderColor: colors.border,
              },
            ]}>
            {/* Inner filled ring - simulated progress */}
            <View
              style={[
                styles.progressRingFill,
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 100,
                  borderWidth: 8,
                  borderColor: colors.primary,
                  opacity: progress / 100,
                },
              ]}
            />
            
            {/* Emoji in center */}
            <View style={styles.progressRingCenter}>
              <Text style={styles.centerEmoji}>{currentMessage.emoji}</Text>
              <Text
                style={[
                  styles.progressText,
                  {
                    color: colors.primary,
                    fontSize: typography.xl,
                    fontWeight: '700',
                  },
                ]}>
                {progress}%
              </Text>
            </View>
          </View>
        </View>

        {/* Message */}
        <View style={[styles.messageContainer, {paddingHorizontal: spacing.xl}]}>
          <Text
            style={[
              styles.message,
              {
                color: colors.text,
                fontSize: themeType === 'K5' ? 24 : 20,
                fontWeight: '700',
                textAlign: 'center',
              },
            ]}>
            {currentMessage.message}
          </Text>
        </View>

        {/* Info Text */}
        <View style={[styles.infoContainer, {paddingHorizontal: spacing.xl}]}>
          <Text
            style={[
              styles.infoText,
              {
                color: colors.textSecondary,
                fontSize: typography.base,
                textAlign: 'center',
                lineHeight: 24,
              },
            ]}>
            We're using your assessment answers to create a personalized AI tutor
            that understands how you learn best.
          </Text>
        </View>

        {/* Fun Facts Rotating */}
        <View
          style={[
            styles.funFactContainer,
            {
              backgroundColor: `${colors.primary}10`,
              borderRadius: 16,
              padding: spacing.lg,
              marginHorizontal: spacing.xl,
            },
          ]}>
          <Text
            style={[
              styles.funFactLabel,
              {
                color: colors.primary,
                fontSize: typography.xs,
                fontWeight: '700',
                textTransform: 'uppercase',
              },
            ]}>
            💡 Did you know?
          </Text>
          <Text
            style={[
              styles.funFactText,
              {
                color: colors.text,
                fontSize: typography.sm,
                marginTop: 4,
              },
            ]}>
            Your AI tutor will adapt to your learning style and pace, making
            every lesson perfect for you!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  progressRing: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRingFill: {
    borderWidth: 8,
  },
  progressRingCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  centerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
  },
  messageContainer: {
    width: '100%',
  },
  message: {
    marginBottom: 16,
  },
  infoContainer: {
    width: '100%',
  },
  infoText: {
    marginTop: 8,
  },
  funFactContainer: {
    width: '90%',
  },
  funFactLabel: {
    letterSpacing: 0.5,
  },
  funFactText: {
    lineHeight: 20,
  },
});
