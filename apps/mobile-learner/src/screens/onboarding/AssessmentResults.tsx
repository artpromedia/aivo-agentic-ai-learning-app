/**
 * Assessment Results Screen
 * 
 * Shows child what their AI learned from the baseline assessment.
 * Displays personalized strengths and builds confidence.
 * Matches existing learner-app results display.
 */

import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../theme/ThemeContext';
import type {OnboardingStackParamList} from '../../navigation/OnboardingStack';

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'AssessmentResults'
>;

interface Props {
  navigation: NavigationProp;
}

interface SubjectResult {
  id: string;
  name: string;
  emoji: string;
  level: number; // 1-5
  strength: string;
}

export default function AssessmentResults({navigation}: Props) {
  const {colors, spacing, typography, themeType} = useTheme();

  // Mock results - in production, these would come from assessment answers
  const results: SubjectResult[] = [
    {
      id: 'reading',
      name: 'Reading',
      emoji: '📚',
      level: 4,
      strength: 'You love reading! Your AI will include lots of stories.',
    },
    {
      id: 'math',
      name: 'Math',
      emoji: '🔢',
      level: 3,
      strength: "You're building confidence! We'll make math fun with games.",
    },
    {
      id: 'learning',
      name: 'Learning Style',
      emoji: '🎯',
      level: 5,
      strength: 'You learn best with hands-on activities and visuals!',
    },
  ];

  const handleContinue = () => {
    // Mark onboarding complete
    // TODO: Call completeOnboarding() from userStore
    navigation.navigate('Complete');
  };

  const renderStars = (level: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.star}>
            {star <= level ? '⭐' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, {paddingBottom: spacing.xxl}]}>
        {/* Header */}
        <View style={[styles.header, {paddingHorizontal: spacing.xl}]}>
          <View style={styles.celebrationEmoji}>
            <Text style={styles.celebrationEmojiText}>🎉</Text>
          </View>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: themeType === 'K5' ? 32 : 28,
                fontWeight: '700',
                marginTop: spacing.lg,
              },
            ]}>
            Your AI Brain is Ready!
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontSize: typography.base,
                marginTop: spacing.sm,
                lineHeight: 24,
              },
            ]}>
            Here's what your personal AI tutor learned about you:
          </Text>
        </View>

        {/* Results Cards */}
        <View style={[styles.resultsContainer, {gap: spacing.lg, paddingHorizontal: spacing.xl}]}>
          {results.map((result) => (
            <View
              key={result.id}
              style={[
                styles.resultCard,
                {
                  backgroundColor: colors.surface,
                  borderRadius: 20,
                  padding: spacing.lg,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}>
              {/* Subject Header */}
              <View style={styles.resultHeader}>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectEmoji}>{result.emoji}</Text>
                  <Text
                    style={[
                      styles.subjectName,
                      {
                        color: colors.text,
                        fontSize: typography.lg,
                        fontWeight: '700',
                      },
                    ]}>
                    {result.name}
                  </Text>
                </View>
                {renderStars(result.level)}
              </View>

              {/* Strength Message */}
              <View
                style={[
                  styles.strengthContainer,
                  {
                    backgroundColor: `${colors.primary}10`,
                    borderRadius: 12,
                    padding: spacing.md,
                    marginTop: spacing.md,
                  },
                ]}>
                <Text
                  style={[
                    styles.strengthText,
                    {
                      color: colors.text,
                      fontSize: typography.sm,
                      lineHeight: 20,
                    },
                  ]}>
                  {result.strength}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Encouragement Message */}
        <View
          style={[
            styles.encouragementContainer,
            {
              backgroundColor: `${colors.success}20`,
              borderRadius: 16,
              padding: spacing.lg,
              marginHorizontal: spacing.xl,
              marginTop: spacing.xl,
            },
          ]}>
          <Text
            style={[
              styles.encouragementTitle,
              {
                color: colors.success,
                fontSize: typography.lg,
                fontWeight: '700',
                marginBottom: spacing.xs,
              },
            ]}>
            🌟 You're Amazing!
          </Text>
          <Text
            style={[
              styles.encouragementText,
              {
                color: colors.text,
                fontSize: typography.sm,
                lineHeight: 20,
              },
            ]}>
            Your AI tutor will adapt to your learning style, celebrate your
            strengths, and help you grow in areas where you want to improve.
            Let's start learning together!
          </Text>
        </View>
      </ScrollView>

      {/* Footer - Continue Button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: spacing.md,
              alignItems: 'center',
            },
          ]}
          onPress={handleContinue}
          accessibilityLabel="Start Learning"
          accessibilityRole="button">
          <Text
            style={[
              styles.buttonText,
              {
                color: '#FFFFFF',
                fontSize: typography.lg,
                fontWeight: '700',
              },
            ]}>
            Let's Start Learning! 🚀
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  celebrationEmoji: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationEmojiText: {
    fontSize: 48,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  resultsContainer: {
    width: '100%',
  },
  resultCard: {
    width: '100%',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectEmoji: {
    fontSize: 32,
  },
  subjectName: {
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 18,
  },
  strengthContainer: {
    width: '100%',
  },
  strengthText: {
    textAlign: 'left',
  },
  encouragementContainer: {
    width: '100%',
  },
  encouragementTitle: {
    textAlign: 'center',
  },
  encouragementText: {
    textAlign: 'center',
  },
  footer: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
  buttonText: {
    textAlign: 'center',
  },
});
