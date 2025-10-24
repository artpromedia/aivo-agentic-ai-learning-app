/**
 * Grade Selection Screen
 * 
 * Allows the user to select their grade level (K-12).
 * This determines the theme and age-appropriate content.
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../theme/ThemeContext';
import {useUserStore} from '../../stores/userStore';
import type {OnboardingStackParamList} from '../../navigation/OnboardingStack';
import type {GradeLevel} from '../../types';

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'GradeSelection'
>;

interface Props {
  navigation: NavigationProp;
}

// Grade levels organized by category
const GRADE_LEVELS: {
  category: string;
  grades: {value: GradeLevel; label: string}[];
}[] = [
  {
    category: 'Elementary',
    grades: [
      {value: 'K', label: 'Kindergarten'},
      {value: '1', label: '1st Grade'},
      {value: '2', label: '2nd Grade'},
      {value: '3', label: '3rd Grade'},
      {value: '4', label: '4th Grade'},
      {value: '5', label: '5th Grade'},
    ],
  },
  {
    category: 'Middle School',
    grades: [
      {value: '6', label: '6th Grade'},
      {value: '7', label: '7th Grade'},
      {value: '8', label: '8th Grade'},
    ],
  },
  {
    category: 'High School',
    grades: [
      {value: '9', label: '9th Grade'},
      {value: '10', label: '10th Grade'},
      {value: '11', label: '11th Grade'},
      {value: '12', label: '12th Grade'},
    ],
  },
];

export default function GradeSelection({navigation}: Props) {
  const {colors, spacing, typography, themeType} = useTheme();
  const {updateGrade} = useUserStore();
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);

  const handleContinue = () => {
    if (selectedGrade) {
      updateGrade(selectedGrade);
      navigation.navigate('InterestsSelection');
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Progress Indicator */}
      <View style={[styles.progressContainer, {paddingHorizontal: spacing.xl}]}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {backgroundColor: colors.primary, width: '40%'},
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressText,
            {color: colors.textSecondary, fontSize: typography.sm},
          ]}>
          Step 2 of 5
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
          What grade are you in?
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontSize: themeType === 'K5' ? 16 : 14,
            },
          ]}>
          This helps us show you the right content
        </Text>
      </View>

      {/* Grade Selection Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingHorizontal: spacing.xl, gap: spacing.lg},
        ]}
        showsVerticalScrollIndicator={false}>
        {GRADE_LEVELS.map((section) => (
          <View key={section.category} style={[styles.section, {gap: spacing.sm}]}>
            <Text
              style={[
                styles.categoryTitle,
                {color: colors.textSecondary, fontSize: typography.sm},
              ]}>
              {section.category}
            </Text>
            <View style={[styles.gradeGrid, {gap: spacing.sm}]}>
              {section.grades.map((grade) => (
                <TouchableOpacity
                  key={grade.value}
                  style={[
                    styles.gradeButton,
                    {
                      backgroundColor:
                        selectedGrade === grade.value
                          ? colors.primary
                          : colors.surface,
                      borderWidth: 2,
                      borderColor:
                        selectedGrade === grade.value
                          ? colors.primary
                          : colors.border,
                      borderRadius: 12,
                      padding: spacing.md,
                    },
                  ]}
                  onPress={() => setSelectedGrade(grade.value)}
                  accessibilityLabel={`Select ${grade.label}`}
                  accessibilityRole="button"
                  accessibilityState={{selected: selectedGrade === grade.value}}>
                  <Text
                    style={[
                      styles.gradeLabel,
                      {
                        color:
                          selectedGrade === grade.value
                            ? '#FFFFFF'
                            : colors.text,
                        fontSize: themeType === 'K5' ? 16 : 14,
                        fontWeight: '600',
                      },
                    ]}>
                    {grade.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, {paddingHorizontal: spacing.xl}]}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: selectedGrade ? colors.primary : colors.border,
              borderRadius: 12,
              paddingVertical: spacing.lg,
            },
          ]}
          onPress={handleContinue}
          disabled={!selectedGrade}
          accessibilityLabel="Continue to interests selection"
          accessibilityRole="button"
          accessibilityState={{disabled: !selectedGrade}}>
          <Text
            style={[
              styles.buttonText,
              {
                color: selectedGrade ? '#FFFFFF' : colors.textSecondary,
                fontSize: themeType === 'K5' ? 18 : 16,
                fontWeight: '600',
              },
            ]}>
            Continue
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
  section: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradeButton: {
    width: '48%',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeLabel: {
    textAlign: 'center',
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
