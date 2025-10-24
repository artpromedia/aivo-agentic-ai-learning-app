/**
 * Teacher Setup Screen
 * 
 * Teacher onboarding flow:
 * 1. License validation (6-digit code)
 * 2. District information
 * 3. Teacher profile (name, subject, grades taught)
 * 4. Student management info
 * 
 * Teachers don't take baseline assessment - students do individually.
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../theme/ThemeContext';
import {useUserStore} from '../../store/userStore';
import type {OnboardingStackParamList} from '../../navigation/OnboardingStack';

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'TeacherSetup'
>;

interface Props {
  navigation: NavigationProp;
}

export default function TeacherSetup({navigation}: Props) {
  const {colors, spacing, typography, themeType} = useTheme();
  const {setProfile} = useUserStore();

  // Form state
  const [step, setStep] = useState<'license' | 'info'>('license');
  const [licenseCode, setLicenseCode] = useState('');
  const [licenseError, setLicenseError] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [district, setDistrict] = useState('');
  const [school, setSchool] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

  const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const subjects = [
    'Mathematics',
    'English Language Arts',
    'Science',
    'Social Studies',
    'Special Education',
    'Multiple Subjects',
  ];

  const handleValidateLicense = () => {
    // Validate license code format (6 digits)
    if (licenseCode.length !== 6) {
      setLicenseError('License code must be 6 characters');
      return;
    }

    // TODO: Call backend to validate license
    // For now, accept any 6-character code
    setLicenseError('');
    setStep('info');
  };

  const handleGradeToggle = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade]
    );
  };

  const handleContinue = () => {
    // Save teacher profile
    setProfile({
      id: `teacher_${Date.now()}`,
      name: teacherName,
      role: 'teacher',
      district,
      school,
      subject,
      grades: selectedGrades,
    });

    // TODO: Save teacher info to backend
    // TODO: Set up teacher license association

    // Navigate to complete
    navigation.navigate('Complete');
  };

  const canContinue =
    teacherName.trim() !== '' &&
    district.trim() !== '' &&
    school.trim() !== '' &&
    subject !== '' &&
    selectedGrades.length > 0;

  if (step === 'license') {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl},
          ]}>
          {/* Progress Indicator */}
          <View style={[styles.progressContainer, {marginTop: spacing.xl}]}>
            <View
              style={[
                styles.progressBar,
                {backgroundColor: colors.border, borderRadius: 12, height: 8},
              ]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: '25%',
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    height: '100%',
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.progressText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.sm,
                  marginTop: spacing.xs,
                },
              ]}>
              Step 1 of 2
            </Text>
          </View>

          {/* Header */}
          <View style={[styles.header, {marginTop: spacing.xxl}]}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>👨‍🏫</Text>
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
              Welcome, Teacher!
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
              Let's get you set up with your district license
            </Text>
          </View>

          {/* License Code Input */}
          <View style={[styles.formSection, {marginTop: spacing.xxl}]}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: typography.base,
                  fontWeight: '600',
                  marginBottom: spacing.xs,
                },
              ]}>
              District License Code
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: licenseError ? colors.error : colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  color: colors.text,
                  fontSize: typography.base,
                  padding: spacing.md,
                  minHeight: 48,
                },
              ]}
              value={licenseCode}
              onChangeText={(text) => {
                setLicenseCode(text.toUpperCase());
                setLicenseError('');
              }}
              placeholder="Enter 6-character code"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus
            />
            {licenseError ? (
              <Text
                style={[
                  styles.errorText,
                  {
                    color: colors.error,
                    fontSize: typography.sm,
                    marginTop: spacing.xs,
                  },
                ]}>
                {licenseError}
              </Text>
            ) : null}
            <Text
              style={[
                styles.helperText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.sm,
                  marginTop: spacing.xs,
                },
              ]}>
              Contact your district administrator if you don't have a code
            </Text>
          </View>

          {/* Info Box */}
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: `${colors.primary}10`,
                borderRadius: 12,
                padding: spacing.md,
                marginTop: spacing.xl,
              },
            ]}>
            <Text
              style={[
                styles.infoTitle,
                {
                  color: colors.primary,
                  fontSize: typography.sm,
                  fontWeight: '700',
                  marginBottom: spacing.xs,
                },
              ]}>
              💡 What's a license code?
            </Text>
            <Text
              style={[
                styles.infoText,
                {
                  color: colors.text,
                  fontSize: typography.sm,
                  lineHeight: 20,
                },
              ]}>
              Your district license gives you access to manage students, track
              progress, and assign personalized AI-powered lessons.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
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
                backgroundColor:
                  licenseCode.length === 6 ? colors.primary : colors.border,
                borderRadius: 12,
                paddingVertical: spacing.md,
                alignItems: 'center',
              },
            ]}
            onPress={handleValidateLicense}
            disabled={licenseCode.length !== 6}
            accessibilityLabel="Validate License Code"
            accessibilityRole="button">
            <Text
              style={[
                styles.buttonText,
                {
                  color: licenseCode.length === 6 ? '#FFFFFF' : colors.textSecondary,
                  fontSize: typography.lg,
                  fontWeight: '700',
                },
              ]}>
              Validate License
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2: Teacher Information
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl},
        ]}>
        {/* Progress Indicator */}
        <View style={[styles.progressContainer, {marginTop: spacing.xl}]}>
          <View
            style={[
              styles.progressBar,
              {backgroundColor: colors.border, borderRadius: 12, height: 8},
            ]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: '75%',
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  height: '100%',
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.progressText,
              {
                color: colors.textSecondary,
                fontSize: typography.sm,
                marginTop: spacing.xs,
              },
            ]}>
            Step 2 of 2
          </Text>
        </View>

        {/* Header */}
        <View style={[styles.header, {marginTop: spacing.xl}]}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: themeType === 'K5' ? 28 : 24,
                fontWeight: '700',
              },
            ]}>
            Tell us about yourself
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontSize: typography.base,
                marginTop: spacing.sm,
              },
            ]}>
            Help us personalize your teaching experience
          </Text>
        </View>

        {/* Teacher Name */}
        <View style={[styles.formSection, {marginTop: spacing.xl}]}>
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
                fontSize: typography.base,
                fontWeight: '600',
                marginBottom: spacing.xs,
              },
            ]}>
            Your Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                color: colors.text,
                fontSize: typography.base,
                padding: spacing.md,
                minHeight: 48,
              },
            ]}
            value={teacherName}
            onChangeText={setTeacherName}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />
        </View>

        {/* District */}
        <View style={[styles.formSection, {marginTop: spacing.lg}]}>
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
                fontSize: typography.base,
                fontWeight: '600',
                marginBottom: spacing.xs,
              },
            ]}>
            School District
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                color: colors.text,
                fontSize: typography.base,
                padding: spacing.md,
                minHeight: 48,
              },
            ]}
            value={district}
            onChangeText={setDistrict}
            placeholder="Enter district name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />
        </View>

        {/* School */}
        <View style={[styles.formSection, {marginTop: spacing.lg}]}>
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
                fontSize: typography.base,
                fontWeight: '600',
                marginBottom: spacing.xs,
              },
            ]}>
            School Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                color: colors.text,
                fontSize: typography.base,
                padding: spacing.md,
                minHeight: 48,
              },
            ]}
            value={school}
            onChangeText={setSchool}
            placeholder="Enter school name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />
        </View>

        {/* Subject */}
        <View style={[styles.formSection, {marginTop: spacing.lg}]}>
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
                fontSize: typography.base,
                fontWeight: '600',
                marginBottom: spacing.xs,
              },
            ]}>
            Primary Subject
          </Text>
          <View style={[styles.subjectGrid, {gap: spacing.sm}]}>
            {subjects.map((subjectOption) => (
              <TouchableOpacity
                key={subjectOption}
                style={[
                  styles.subjectButton,
                  {
                    backgroundColor:
                      subject === subjectOption ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      subject === subjectOption ? colors.primary : colors.border,
                    borderRadius: 8,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    alignItems: 'center',
                  },
                ]}
                onPress={() => setSubject(subjectOption)}
                accessibilityLabel={subjectOption}
                accessibilityRole="button">
                <Text
                  style={[
                    styles.subjectButtonText,
                    {
                      color: subject === subjectOption ? '#FFFFFF' : colors.text,
                      fontSize: typography.sm,
                      fontWeight: subject === subjectOption ? '700' : '400',
                    },
                  ]}>
                  {subjectOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Grades Taught */}
        <View style={[styles.formSection, {marginTop: spacing.lg}]}>
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
                fontSize: typography.base,
                fontWeight: '600',
                marginBottom: spacing.xs,
              },
            ]}>
            Grades You Teach
          </Text>
          <Text
            style={[
              styles.helperText,
              {
                color: colors.textSecondary,
                fontSize: typography.sm,
                marginBottom: spacing.sm,
              },
            ]}>
            Select all that apply
          </Text>
          <View style={[styles.gradeGrid, {gap: spacing.sm}]}>
            {grades.map((grade) => (
              <TouchableOpacity
                key={grade}
                style={[
                  styles.gradeButton,
                  {
                    backgroundColor: selectedGrades.includes(grade)
                      ? colors.primary
                      : colors.surface,
                    borderWidth: 1,
                    borderColor: selectedGrades.includes(grade)
                      ? colors.primary
                      : colors.border,
                    borderRadius: 8,
                    paddingVertical: spacing.sm,
                    width: '13%',
                    aspectRatio: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
                onPress={() => handleGradeToggle(grade)}
                accessibilityLabel={`Grade ${grade}`}
                accessibilityRole="checkbox"
                accessibilityState={{checked: selectedGrades.includes(grade)}}>
                <Text
                  style={[
                    styles.gradeButtonText,
                    {
                      color: selectedGrades.includes(grade)
                        ? '#FFFFFF'
                        : colors.text,
                      fontSize: typography.base,
                      fontWeight: selectedGrades.includes(grade) ? '700' : '400',
                    },
                  ]}>
                  {grade}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
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
              backgroundColor: canContinue ? colors.primary : colors.border,
              borderRadius: 12,
              paddingVertical: spacing.md,
              alignItems: 'center',
            },
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
          accessibilityLabel="Complete Setup"
          accessibilityRole="button">
          <Text
            style={[
              styles.buttonText,
              {
                color: canContinue ? '#FFFFFF' : colors.textSecondary,
                fontSize: typography.lg,
                fontWeight: '700',
              },
            ]}>
            Complete Setup
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
    flexGrow: 1,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
  },
  progressFill: {},
  progressText: {
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 48,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
  },
  label: {},
  input: {},
  errorText: {},
  helperText: {},
  infoBox: {},
  infoTitle: {},
  infoText: {},
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectButton: {
    flexBasis: '48%',
  },
  subjectButtonText: {},
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradeButton: {},
  gradeButtonText: {},
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
