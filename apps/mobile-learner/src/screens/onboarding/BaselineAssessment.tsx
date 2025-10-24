/**
 * Baseline Assessment Screen
 * 
 * 5 interactive questions to understand the child's learning preferences.
 * This data is used to personalize the AI model cloning process.
 * 
 * Matches the existing learner-app baseline assessment flow.
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../theme/ThemeContext';
import type {OnboardingStackParamList} from '../../navigation/OnboardingStack';

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'BaselineAssessment'
>;

interface Props {
  navigation: NavigationProp;
}

interface AssessmentQuestion {
  id: number;
  question: string;
  type: 'visual' | 'multiple' | 'scale';
  options: {
    value: string;
    label: string;
    emoji?: string;
  }[];
}

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    question: 'How do you feel about reading?',
    type: 'visual',
    options: [
      {value: 'love', label: 'I love it!', emoji: '😍'},
      {value: 'like', label: 'I like it', emoji: '😊'},
      {value: 'okay', label: "It's okay", emoji: '😐'},
      {value: 'hard', label: "It's hard", emoji: '😕'},
    ],
  },
  {
    id: 2,
    question: "What's your favorite way to learn?",
    type: 'multiple',
    options: [
      {value: 'visual', label: '📺 Watching videos'},
      {value: 'reading', label: '📚 Reading books'},
      {value: 'hands-on', label: '🎨 Hands-on activities'},
      {value: 'listening', label: '🎧 Listening to stories'},
    ],
  },
  {
    id: 3,
    question: 'How confident are you with numbers?',
    type: 'scale',
    options: [
      {value: '1', label: '1'},
      {value: '2', label: '2'},
      {value: '3', label: '3'},
      {value: '4', label: '4'},
      {value: '5', label: '5'},
    ],
  },
  {
    id: 4,
    question: 'What makes learning fun for you?',
    type: 'multiple',
    options: [
      {value: 'games', label: '🎮 Playing games'},
      {value: 'stories', label: '📖 Hearing stories'},
      {value: 'challenges', label: '🏆 Solving challenges'},
      {value: 'creating', label: '🎨 Creating things'},
    ],
  },
  {
    id: 5,
    question: 'How do you like to work?',
    type: 'visual',
    options: [
      {value: 'alone', label: 'By myself', emoji: '👤'},
      {value: 'pair', label: 'With a partner', emoji: '👥'},
      {value: 'group', label: 'In a group', emoji: '👨‍👩‍👧‍👦'},
      {value: 'teacher', label: 'With a teacher', emoji: '👨‍🏫'},
    ],
  },
];

export default function BaselineAssessment({navigation}: Props) {
  const {colors, spacing, typography, themeType} = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showEncouragement, setShowEncouragement] = useState(false);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    // Save answer
    setAnswers(prev => ({...prev, [currentQuestion.id]: value}));

    // Show encouragement
    setShowEncouragement(true);

    // Move to next question or complete assessment
    setTimeout(() => {
      setShowEncouragement(false);
      
      if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Assessment complete - save answers and navigate to cloning
        // TODO: Save answers to backend
        navigation.navigate('ModelCloning');
      }
    }, 1500);
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Progress Bar */}
      <View style={[styles.progressContainer, {paddingHorizontal: spacing.xl}]}>
        <View style={styles.progressBarWrapper}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressText,
            {color: colors.text, fontSize: typography.lg, fontWeight: '700'},
          ]}>
          {currentQuestionIndex + 1}/{ASSESSMENT_QUESTIONS.length}
        </Text>
      </View>

      {/* Question Card */}
      <View style={[styles.content, {paddingHorizontal: spacing.xl}]}>
        <View
          style={[
            styles.questionCard,
            {
              backgroundColor: colors.surface,
              borderRadius: 24,
              padding: spacing.xl,
            },
          ]}>
          {/* Question Number */}
          <View style={[styles.questionNumber, {backgroundColor: `${colors.primary}20`}]}>
            <Text style={[styles.questionNumberText, {color: colors.primary}]}>
              Q{currentQuestion.id}
            </Text>
          </View>

          {/* Question Text */}
          <Text
            style={[
              styles.questionText,
              {
                color: colors.text,
                fontSize: themeType === 'K5' ? 28 : 24,
                fontWeight: '700',
              },
            ]}>
            {currentQuestion.question}
          </Text>

          {/* Answer Options */}
          <View style={[styles.optionsContainer, {gap: spacing.md}]}>
            {currentQuestion.type === 'visual' ? (
              // Visual emoji options (2x2 grid)
              <View style={[styles.visualGrid, {gap: spacing.md}]}>
                {currentQuestion.options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.visualOption,
                      {
                        backgroundColor: colors.background,
                        borderWidth: 3,
                        borderColor: colors.border,
                        borderRadius: 20,
                        padding: spacing.lg,
                      },
                    ]}
                    onPress={() => handleAnswer(option.value)}
                    accessibilityRole="button">
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: colors.text,
                          fontSize: typography.sm,
                          fontWeight: '600',
                        },
                      ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : currentQuestion.type === 'scale' ? (
              // Scale options (1-5)
              <View style={[styles.scaleContainer, {gap: spacing.sm}]}>
                <View style={styles.scaleLabels}>
                  <Text style={[styles.scaleLabel, {color: colors.textSecondary}]}>
                    Not confident
                  </Text>
                  <Text style={[styles.scaleLabel, {color: colors.textSecondary}]}>
                    Very confident
                  </Text>
                </View>
                <View style={[styles.scaleButtons, {gap: spacing.sm}]}>
                  {currentQuestion.options.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.scaleButton,
                        {
                          backgroundColor: colors.primary,
                          borderRadius: 12,
                        },
                      ]}
                      onPress={() => handleAnswer(option.value)}
                      accessibilityRole="button">
                      <Text style={[styles.scaleButtonText, {fontSize: typography.xl}]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              // Multiple choice options
              currentQuestion.options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.multipleOption,
                    {
                      backgroundColor: colors.background,
                      borderWidth: 3,
                      borderColor: colors.border,
                      borderRadius: 16,
                      padding: spacing.lg,
                    },
                  ]}
                  onPress={() => handleAnswer(option.value)}
                  accessibilityRole="button">
                  <Text
                    style={[
                      styles.multipleOptionText,
                      {
                        color: colors.text,
                        fontSize: themeType === 'K5' ? 18 : 16,
                        fontWeight: '600',
                      },
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </View>

      {/* Encouragement Banner */}
      {showEncouragement && (
        <View
          style={[
            styles.encouragementBanner,
            {
              backgroundColor: colors.success,
              padding: spacing.lg,
            },
          ]}>
          <Text style={[styles.encouragementText, {fontSize: typography.lg}]}>
            🎉 Great choice! Keep going!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: 60,
    paddingBottom: 24,
  },
  progressBarWrapper: {
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 12,
  },
  progressText: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  questionCard: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionNumber: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  questionText: {
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 16,
  },
  visualGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  visualOption: {
    width: '45%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  optionLabel: {
    textAlign: 'center',
  },
  multipleOption: {
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multipleOptionText: {
    textAlign: 'center',
  },
  scaleContainer: {
    alignItems: 'center',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  scaleLabel: {
    fontSize: 12,
  },
  scaleButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scaleButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  encouragementBanner: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  encouragementText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
