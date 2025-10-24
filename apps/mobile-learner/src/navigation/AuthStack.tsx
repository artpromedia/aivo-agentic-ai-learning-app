/**
 * AuthStack Navigator
 * 
 * Stack navigator for authentication flow.
 * Screens: Welcome, Login, Register, ForgotPassword
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Auth Screens
import WelcomeScreen from '../screens/auth/Welcome';
import LoginScreen from '../screens/auth/Login';
import RegisterScreen from '../screens/auth/Register';
import ForgotPasswordScreen from '../screens/auth/ForgotPassword';

// Auth Stack Param List
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: {userType?: 'learner' | 'parent'};
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * AuthStack Component
 * 
 * Handles navigation between authentication screens.
 * All screens have no header (headerShown: false).
 */
export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
