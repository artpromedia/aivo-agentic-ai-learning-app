/**
 * App Configuration
 * 
 * Central configuration for the mobile app
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },

  // App Information
  app: {
    name: 'Aivo Learner',
    version: '1.0.0',
    bundleId: 'com.aivolearning.learner',
  },

  // Feature Flags
  features: {
    offlineMode: true,
    voiceInput: true,
    textToSpeech: true,
    cameraUpload: true,
    videoPlayback: true,
    analytics: __DEV__ ? false : true,
  },

  // Storage Keys
  storage: {
    authToken: 'auth_token',
    refreshToken: 'refresh_token',
    userId: 'user_id',
    learnerId: 'learner_id',
    theme: 'theme_preference',
    offlineData: 'offline_data',
  },

  // Accessibility Settings
  accessibility: {
    minFontSize: 14,
    maxFontSize: 24,
    defaultFontSize: 16,
    textToSpeechRate: 1.0,
    textToSpeechPitch: 1.0,
  },

  // Game Break Settings
  gameBreak: {
    maxBreaksPerDay: 3,
    breakDuration: 300, // 5 minutes in seconds
    focusThreshold: 70, // Attention score threshold
  },

  // Homework Helper Settings
  homework: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxFilesPerSession: 5,
    ocrTimeout: 60000, // 60 seconds
  },

  // Session Management
  session: {
    idleTimeout: 900000, // 15 minutes
    autoSaveInterval: 30000, // 30 seconds
    maxSessionDuration: 3600000, // 1 hour
  },
} as const;

export type AppConfig = typeof config;

export default config;
