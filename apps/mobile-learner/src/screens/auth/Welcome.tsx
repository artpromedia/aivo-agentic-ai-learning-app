/**
 * Welcome Screen
 * 
 * Initial screen when app launches (unauthenticated)
 * - App logo and branding
 * - "Get Started" and "Login" buttons
 * - Grade-based theming
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {AuthStackScreenProps} from '../../navigation/types';
import {useTheme} from '../../theme/enhancedTheme';
import {useResponsive} from '../../utils/responsive';

export default function WelcomeScreen() {
  const navigation = useNavigation<AuthStackScreenProps<'Welcome'>['navigation']>();
  const {colors, themeType} = useTheme();
  const {isPhone} = useResponsive();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />
      
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View
          style={[
            styles.logoPlaceholder,
            {backgroundColor: colors.primary, opacity: 0.1},
          ]}
        />
        <Text
          style={[
            styles.appName,
            {color: colors.text, fontSize: themeType === 'K5' ? 32 : 28},
          ]}
        >
          Aivo Learning
        </Text>
        <Text
          style={[
            styles.tagline,
            {color: colors.textSecondary, fontSize: themeType === 'K5' ? 18 : 16},
          ]}
        >
          Personalized learning for everyone
        </Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsSection}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            {backgroundColor: colors.primary},
          ]}
          onPress={() => navigation.navigate('Register', {userType: 'learner'})}
          accessibilityLabel="Get Started"
          accessibilityRole="button"
        >
          <Text style={[styles.primaryButtonText, {fontSize: themeType === 'K5' ? 18 : 16}]}>
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              borderColor: colors.primary,
              borderWidth: 2,
            },
          ]}
          onPress={() => navigation.navigate('Login')}
          accessibilityLabel="Login"
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.secondaryButtonText,
              {color: colors.primary, fontSize: themeType === 'K5' ? 18 : 16},
            ]}
          >
            I Already Have an Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  appName: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    fontWeight: '400',
  },
  buttonsSection: {
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
});
