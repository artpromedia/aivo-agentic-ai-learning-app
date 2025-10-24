/**
 * Parent Setup - Add Child Screen
 * 
 * Parent enters child information including:
 * - Name, age, grade
 * - Special education needs (IEP/504)
 * - Learning challenges
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../theme/ThemeContext';
import {useUserStore} from '../../stores/userStore';
import type {OnboardingStackParamList} from '../../navigation/OnboardingStack';
import type {GradeLevel} from '../../types';

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'ParentSetup'
>;

interface Props {
  navigation: NavigationProp;
}

const GRADE_OPTIONS: GradeLevel[] = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const LEARNING_CHALLENGES = [
  {value: 'autism', label: 'Autism Spectrum', icon: '🧩'},
  {value: 'adhd', label: 'ADHD', icon: '⚡'},
  {value: 'dyslexia', label: 'Dyslexia', icon: '📖'},
  {value: 'speech', label: 'Speech Delay', icon: '🗣️'},
  {value: 'dyscalculia', label: 'Dyscalculia', icon: '🔢'},
  {value: 'processing', label: 'Processing Disorder', icon: '🧠'},
  {value: 'other', label: 'Other', icon: '✨'},
];

export default function ParentSetup({navigation}: Props) {
  const {colors, spacing, typography, themeType} = useTheme();
  const {setProfile} = useUserStore();

  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('K');
  const [hasIEP, setHasIEP] = useState(false);
  const [has504, setHas504] = useState(false);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);

  const toggleChallenge = (challenge: string) => {
    if (selectedChallenges.includes(challenge)) {
      setSelectedChallenges(prev => prev.filter(c => c !== challenge));
    } else {
      setSelectedChallenges(prev => [...prev, challenge]);
    }
  };

  const handleContinue = () => {
    // Save child info to profile
    setProfile({
      id: `child_${Date.now()}`,
      name: childName,
      grade: selectedGrade,
      interests: [],
      dateOfBirth: childAge ? new Date(new Date().getFullYear() - parseInt(childAge), 0, 1).toISOString() : undefined,
    });

    // TODO: Save IEP/504 status and challenges to backend

    // Navigate to baseline assessment
    navigation.navigate('BaselineAssessment');
  };

  const canContinue = childName.trim() !== '' && childAge !== '' && selectedGrade !== null;

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Progress Indicator */}
      <View style={[styles.progressContainer, {paddingHorizontal: spacing.xl}]}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {backgroundColor: colors.primary, width: '25%'},
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressText,
            {color: colors.textSecondary, fontSize: typography.sm},
          ]}>
          Step 2 of 8
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
          Tell us about your child
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontSize: themeType === 'K5' ? 16 : 14,
            },
          ]}>
          This helps us create a personalized AI tutor
        </Text>
      </View>

      {/* Form */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingHorizontal: spacing.xl, gap: spacing.lg},
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Child Name */}
        <View style={[styles.formGroup, {gap: spacing.xs}]}>
          <Text style={[styles.label, {color: colors.text, fontSize: typography.sm}]}>
            Child's Name *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                fontSize: typography.base,
                padding: spacing.md,
              },
            ]}
            value={childName}
            onChangeText={setChildName}
            placeholder="Enter child's name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />
        </View>

        {/* Child Age */}
        <View style={[styles.formGroup, {gap: spacing.xs}]}>
          <Text style={[styles.label, {color: colors.text, fontSize: typography.sm}]}>
            Child's Age *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                fontSize: typography.base,
                padding: spacing.md,
              },
            ]}
            value={childAge}
            onChangeText={setChildAge}
            placeholder="Enter age"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        {/* Grade Selection */}
        <View style={[styles.formGroup, {gap: spacing.xs}]}>
          <Text style={[styles.label, {color: colors.text, fontSize: typography.sm}]}>
            Current Grade *
          </Text>
          <View style={[styles.gradeGrid, {gap: spacing.xs}]}>
            {GRADE_OPTIONS.map((grade) => (
              <TouchableOpacity
                key={grade}
                style={[
                  styles.gradeButton,
                  {
                    backgroundColor:
                      selectedGrade === grade ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      selectedGrade === grade ? colors.primary : colors.border,
                    borderRadius: 8,
                    padding: spacing.sm,
                  },
                ]}
                onPress={() => setSelectedGrade(grade)}
                accessibilityRole="button">
                <Text
                  style={[
                    styles.gradeText,
                    {
                      color: selectedGrade === grade ? '#FFFFFF' : colors.text,
                      fontSize: typography.sm,
                      fontWeight: '600',
                    },
                  ]}>
                  {grade === 'K' ? 'K' : grade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* IEP/504 */}
        <View style={[styles.formGroup, {gap: spacing.sm}]}>
          <Text style={[styles.label, {color: colors.text, fontSize: typography.sm}]}>
            Special Education Plan
          </Text>
          <View style={[styles.switchRow, {gap: spacing.lg}]}>
            <View style={styles.switchItem}>
              <Text style={[styles.switchLabel, {color: colors.text}]}>Has IEP</Text>
              <Switch
                value={hasIEP}
                onValueChange={setHasIEP}
                trackColor={{false: colors.border, true: `${colors.primary}80`}}
                thumbColor={hasIEP ? colors.primary : '#f4f3f4'}
              />
            </View>
            <View style={styles.switchItem}>
              <Text style={[styles.switchLabel, {color: colors.text}]}>Has 504 Plan</Text>
              <Switch
                value={has504}
                onValueChange={setHas504}
                trackColor={{false: colors.border, true: `${colors.primary}80`}}
                thumbColor={has504 ? colors.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Learning Challenges */}
        <View style={[styles.formGroup, {gap: spacing.xs}]}>
          <Text style={[styles.label, {color: colors.text, fontSize: typography.sm}]}>
            Learning Challenges (Optional)
          </Text>
          <Text
            style={[
              styles.helperText,
              {color: colors.textSecondary, fontSize: typography.xs},
            ]}>
            Select all that apply
          </Text>
          <View style={[styles.challengeGrid, {gap: spacing.sm}]}>
            {LEARNING_CHALLENGES.map((challenge) => {
              const isSelected = selectedChallenges.includes(challenge.value);
              return (
                <TouchableOpacity
                  key={challenge.value}
                  style={[
                    styles.challengeButton,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: 12,
                      padding: spacing.sm,
                    },
                  ]}
                  onPress={() => toggleChallenge(challenge.value)}
                  accessibilityRole="button">
                  <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                  <Text
                    style={[
                      styles.challengeText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text,
                        fontSize: typography.xs,
                        fontWeight: '600',
                      },
                    ]}>
                    {challenge.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, {paddingHorizontal: spacing.xl}]}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: canContinue ? colors.primary : colors.border,
              borderRadius: 12,
              paddingVertical: spacing.lg,
            },
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
          accessibilityRole="button">
          <Text
            style={[
              styles.buttonText,
              {
                color: canContinue ? '#FFFFFF' : colors.textSecondary,
                fontSize: themeType === 'K5' ? 18 : 16,
                fontWeight: '600',
              },
            ]}>
            Continue to Assessment →
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
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  formGroup: {
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  helperText: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradeButton: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '2%',
    marginBottom: 8,
  },
  gradeText: {
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
  },
  challengeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  challengeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  challengeIcon: {
    fontSize: 20,
  },
  challengeText: {
    flex: 1,
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
});
