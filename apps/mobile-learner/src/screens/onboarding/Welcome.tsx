/**
 * Onboarding Welcome Screen - Role Selection
 * 
 * First screen in the onboarding flow.
 * User selects their role: Parent, Teacher, or Student
 * This determines the entire onboarding path.
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTheme} from '../../theme/ThemeContext';
import {useUserStore} from '../../stores/userStore';
import type {OnboardingStackParamList} from '../../navigation/OnboardingStack';

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'Welcome'
>;

interface Props {
  navigation: NavigationProp;
}

type UserRole = 'parent' | 'teacher' | 'student';

export default function OnboardingWelcome({navigation}: Props) {
  const {colors, spacing, typography, themeType} = useTheme();
  const {setProfile} = useUserStore();

  const handleRoleSelect = (role: UserRole) => {
    // Save role to user profile
    setProfile({
      id: `temp_${Date.now()}`, // Temporary ID until registration
      name: '',
      grade: 'K',
      interests: [],
    });

    // Navigate based on role
    if (role === 'parent') {
      navigation.navigate('ParentSetup');
    } else if (role === 'teacher') {
      navigation.navigate('TeacherSetup');
    } else {
      // Student goes directly to grade selection
      navigation.navigate('GradeSelection');
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
              {backgroundColor: colors.primary, width: '10%'},
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressText,
            {color: colors.textSecondary, fontSize: typography.sm},
          ]}>
          Step 1 of 8
        </Text>
      </View>

      {/* Content */}
      <View style={[styles.content, {gap: spacing.xl}]}>
        {/* Welcome Image */}
        <View style={styles.imageContainer}>
          <View
            style={[
              styles.imagePlaceholder,
              {backgroundColor: `${colors.primary}15`},
            ]}>
            <Text style={{fontSize: 80}}>👋</Text>
          </View>
        </View>

        {/* Welcome Text */}
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
            Welcome to Aivo Learning!
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
            Let's get started! First, tell us who you are:
          </Text>
        </View>

        {/* Role Selection Cards */}
        <View style={[styles.roleContainer, {gap: spacing.md}]}>
          <RoleCard
            icon="👨‍👩‍👧"
            title="I'm a Parent"
            description="Set up learning for my child"
            onPress={() => handleRoleSelect('parent')}
            colors={colors}
            spacing={spacing}
            typography={typography}
            themeType={themeType}
          />
          <RoleCard
            icon="👨‍🏫"
            title="I'm a Teacher"
            description="Manage students and curriculum"
            onPress={() => handleRoleSelect('teacher')}
            colors={colors}
            spacing={spacing}
            typography={typography}
            themeType={themeType}
          />
          <RoleCard
            icon="👦"
            title="I'm a Student"
            description="Start my learning journey"
            onPress={() => handleRoleSelect('student')}
            colors={colors}
            spacing={spacing}
            typography={typography}
            themeType={themeType}
          />
        </View>
      </View>
    </View>
  );
}

interface RoleCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  colors: any;
  spacing: any;
  typography: any;
  themeType: string;
}

function RoleCard({
  icon,
  title,
  description,
  onPress,
  colors,
  spacing,
  typography,
  themeType,
}: RoleCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.roleCard,
        {
          backgroundColor: colors.surface,
          borderWidth: 2,
          borderColor: colors.border,
          borderRadius: 16,
          padding: spacing.lg,
        },
      ]}
      onPress={onPress}
      accessibilityLabel={`Select ${title}`}
      accessibilityRole="button">
      <View style={styles.roleCardContent}>
        <Text style={styles.roleIcon}>{icon}</Text>
        <View style={styles.roleTextContainer}>
          <Text
            style={[
              styles.roleTitle,
              {
                color: colors.text,
                fontSize: themeType === 'K5' ? 18 : 16,
                fontWeight: '600',
              },
            ]}>
            {title}
          </Text>
          <Text
            style={[
              styles.roleDescription,
              {
                color: colors.textSecondary,
                fontSize: typography.sm,
              },
            ]}>
            {description}
          </Text>
        </View>
        <Text style={[styles.arrow, {color: colors.primary}]}>→</Text>
      </View>
    </TouchableOpacity>
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
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
  roleContainer: {
    width: '100%',
    marginTop: 24,
  },
  roleCard: {
    width: '100%',
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  roleIcon: {
    fontSize: 36,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    marginBottom: 4,
  },
  roleDescription: {
    lineHeight: 18,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '600',
  },
});
