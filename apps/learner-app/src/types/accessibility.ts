/**
 * Accessibility preferences for neurodiverse learners
 */
export interface AccessibilityPreferences {
  // Visual
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'; // 14px, 16px, 20px, 24px
  fontFamily: 'default' | 'dyslexic' | 'comic'; // System, OpenDyslexic, Comic Sans
  highContrast: boolean;
  colorScheme: 'calm-blue' | 'soft-green' | 'warm-purple' | 'neutral-gray';
  reduceAnimations: boolean;
  
  // Audio
  textToSpeech: boolean;
  ttsVoice: 'male' | 'female' | 'child';
  ttsSpeed: number; // 0.5 to 2.0
  soundEffects: boolean;
  
  // Interaction
  showTimer: boolean;
  autoAdvance: boolean;
  keyboardNav: boolean;
  
  // Breaks & Pacing
  breakReminders: boolean;
  breakInterval: number; // minutes
  focusMode: boolean; // Hide all distractions
  
  // Support
  showHints: boolean;
  showConfidenceSlider: boolean;
  showEncouragement: boolean;
}

export interface EngagementMetrics {
  focusLevel: 'high' | 'medium' | 'low';
  hesitationIndicators: number;
  avgResponseTime: number;
  consecutiveQuickResponses: number;
  consecutiveSlowResponses: number;
  skippedItems: number;
  hintsUsed: number;
  breaksRequested: number;
  confidenceRatings: number[];
}

export const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPreferences = {
  fontSize: 'medium',
  fontFamily: 'default',
  highContrast: false,
  colorScheme: 'calm-blue',
  reduceAnimations: false,
  textToSpeech: false,
  ttsVoice: 'female',
  ttsSpeed: 1.0,
  soundEffects: true,
  showTimer: false,
  autoAdvance: false,
  keyboardNav: true,
  breakReminders: true,
  breakInterval: 15,
  focusMode: false,
  showHints: true,
  showConfidenceSlider: true,
  showEncouragement: true
};
