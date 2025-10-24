/**
 * Interests Selection Screen
 * 
 * Allows the user to select their interests/hobbies.
 * This helps personalize content recommendations.
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

type NavigationProp = NativeStackNavigationProp<
  OnboardingStackParamList,
  'InterestsSelection'
>;

interface Props {
  navigation: NavigationProp;
}

// Available interests
const INTERESTS = [
  {icon: '📚', label: 'Reading', value: 'reading'},
  {icon: '🎨', label: 'Art', value: 'art'},
  {icon: '🎵', label: 'Music', value: 'music'},
  {icon: '⚽', label: 'Sports', value: 'sports'},
  {icon: '🔬', label: 'Science', value: 'science'},
  {icon: '💻', label: 'Technology', value: 'technology'},
  {icon: '🎮', label: 'Gaming', value: 'gaming'},
  {icon: '🎭', label: 'Drama', value: 'drama'},
  {icon: '🌍', label: 'Geography', value: 'geography'},
  {icon: '📐', label: 'Math', value: 'math'},
  {icon: '🐕', label: 'Animals', value: 'animals'},
  {icon: '🚀', label: 'Space', value: 'space'},
  {icon: '🎬', label: 'Movies', value: 'movies'},
  {icon: '🍳', label: 'Cooking', value: 'cooking'},
  {icon: '📖', label: 'History', value: 'history'},
  {icon: '🌱', label: 'Nature', value: 'nature'},
];

export default function InterestsSelection({navigation}: Props) {
  const {colors, spacing, typography, themeType} = useTheme();
  const {addInterest, removeInterest, profile} = useUserStore();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile?.interests || []
  );

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests((prev) => prev.filter((i) => i !== interest));
      removeInterest(interest);
    } else {
      setSelectedInterests((prev) => [...prev, interest]);
      addInterest(interest);
    }
  };

  const handleContinue = () => {
    // Can continue even with no interests selected
    navigation.navigate('AccessibilitySetup');
  };

  const handleSkip = () => {
    navigation.navigate('AccessibilitySetup');
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Progress Indicator */}
      <View style={[styles.progressContainer, {paddingHorizontal: spacing.xl}]}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {backgroundColor: colors.primary, width: '60%'},
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressText,
            {color: colors.textSecondary, fontSize: typography.sm},
          ]}>
          Step 3 of 5
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
          What are you interested in?
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
              fontSize: themeType === 'K5' ? 16 : 14,
            },
          ]}>
          Select as many as you like. We'll suggest content you'll enjoy!
        </Text>
      </View>

      {/* Interests Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingHorizontal: spacing.xl},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.interestsGrid, {gap: spacing.sm}]}>
          {INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest.value);
            return (
              <TouchableOpacity
                key={interest.value}
                style={[
                  styles.interestButton,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surface,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: 16,
                    padding: spacing.md,
                  },
                ]}
                onPress={() => toggleInterest(interest.value)}
                accessibilityLabel={`${isSelected ? 'Deselect' : 'Select'} ${interest.label}`}
                accessibilityRole="button"
                accessibilityState={{selected: isSelected}}>
                <Text style={styles.interestIcon}>{interest.icon}</Text>
                <Text
                  style={[
                    styles.interestLabel,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontSize: themeType === 'K5' ? 14 : 12,
                      fontWeight: '600',
                    },
                  ]}>
                  {interest.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
          accessibilityLabel="Continue to accessibility setup"
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
          accessibilityLabel="Skip interests selection"
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
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestButton: {
    width: '31%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  interestLabel: {
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
  skipButton: {
    alignItems: 'center',
  },
  skipText: {
    textAlign: 'center',
  },
});
