/**
 * Accessibility Components and Services
 * 
 * Export all accessibility-related components and services
 */

// Services
export {accessibilityService} from './services/accessibility/accessibilityService';
export {voiceService} from './services/accessibility/voiceService';
export type {VoiceRecognitionResult} from './services/accessibility/voiceService';

// Components
export {AccessibleButton} from './components/AccessibleButton/AccessibleButton';
export {ReadableText} from './components/ReadableText/ReadableText';
export {VoiceInputButton} from './components/VoiceInput/VoiceInputButton';

// Screens
export {AccessibilitySettingsScreen} from './screens/AccessibilitySettingsScreen';
