// Sensory profile and accessibility types
export type SensoryPreference = 'low' | 'medium' | 'high';

export interface SensoryProfile {
  id: string;
  learnerId: string;
  visualPreferences: {
    brightness: SensoryPreference;
    contrast: SensoryPreference;
    colorIntensity: SensoryPreference;
    animations: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    fontFamily: 'standard' | 'dyslexic' | 'comic-sans' | 'open-dyslexic';
    lineSpacing: 'normal' | 'wide' | 'extra-wide';
  };
  auditoryPreferences: {
    volume: SensoryPreference;
    backgroundMusic: boolean;
    soundEffects: boolean;
    voiceGuidance: boolean;
    speechRate: 'slow' | 'normal' | 'fast';
  };
  tactilePreferences: {
    vibration: boolean;
    hapticFeedback: SensoryPreference;
  };
  interactionPreferences: {
    autoAdvance: boolean;
    timerVisibility: boolean;
    progressIndicators: boolean;
    encouragementFrequency: SensoryPreference;
  };
  // Legacy nested properties for backward compatibility
  visual?: {
    reduceAnimations?: boolean;
    reduceMotion?: boolean;
    reducedClutter?: boolean;
    flashingContent?: 'remove' | 'warn' | 'allow';
    highContrast?: boolean;
    fontFamily?: 'standard' | 'dyslexic' | 'comic-sans' | 'open-dyslexic';
    fontSize?: 'small' | 'medium' | 'large' | 'extra-large';
    lineSpacing?: 'normal' | 'wide' | 'extra-wide';
    colorScheme?: 'default' | 'warm' | 'cool' | 'high-contrast';
    darkMode?: boolean;
  };
  auditory?: {
    muteAllSounds?: boolean;
    noBackgroundMusic?: boolean;
    noSoundEffects?: boolean;
    textToSpeechEnabled?: boolean;
    textToSpeechSpeed?: number;
    textToSpeechVoice?: 'male' | 'female';
    audioDescriptions?: boolean;
    soundVolume?: number;
  };
  cognitive?: {
    oneThingAtATime?: boolean;
    noPopups?: boolean;
    noAutoplay?: boolean;
    showProgressIndicator?: boolean;
    breakReminders?: boolean;
    breakFrequency?: number;
    limitChoices?: number;
    simplifyInstructions?: boolean;
    extendedTime?: boolean;
    timeMultiplier?: number;
  };
  motor?: {
    largerClickTargets?: boolean;
    clickTargetSize?: 'normal' | 'large' | 'extra-large';
    reduceDragDrop?: boolean;
    alternativeInputs?: boolean;
    stickyKeys?: boolean;
    keyboardOnly?: boolean;
    noDoubleClick?: boolean;
    noDragAndDrop?: boolean;
    increaseSpacing?: boolean;
    touchAccommodations?: boolean;
    hoverDelay?: number;
  };
  environment?: {
    fullScreenMode?: boolean;
    minimizeDistractions?: boolean;
    hideNotifications?: boolean;
    darkMode?: boolean;
    hideChat?: boolean;
    whiteNoise?: boolean;
  };
  triggers?: {
    avoid?: string[];
    manage?: string[];
    avoidColors?: string[];
    avoidPatterns?: boolean;
    avoidFlashing?: boolean;
    contentWarnings?: string[];
  };
  accommodations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SensoryPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  profile: Partial<SensoryProfile>;
  recommendedFor: string[];
}
