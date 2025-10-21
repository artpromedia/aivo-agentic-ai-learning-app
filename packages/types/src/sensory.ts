/**
 * Sensory Accommodations System
 * Comprehensive types for supporting learners with diverse sensory needs
 * Supports ASD, ADHD, dyslexia, visual/motor/auditory challenges, and more
 */

export interface SensoryProfile {
  learnerId: string;
  createdAt: Date;
  updatedAt: Date;

  // Visual Accommodations
  visual: {
    reduceAnimations: boolean;
    reduceMotion: boolean;
    highContrast: boolean;
    darkMode: boolean;
    reducedClutter: boolean; // Hide non-essential UI elements
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    fontFamily: 'standard' | 'dyslexic' | 'comic-sans' | 'open-dyslexic';
    lineSpacing: 'normal' | 'wide' | 'extra-wide';
    colorScheme: 'default' | 'warm' | 'cool' | 'grayscale' | 'high-contrast';
    flashingContent: 'allow' | 'reduce' | 'remove'; // For seizure risk
  };

  // Auditory Accommodations
  auditory: {
    muteAllSounds: boolean;
    soundVolume: number; // 0-100
    noBackgroundMusic: boolean;
    noSoundEffects: boolean;
    textToSpeechEnabled: boolean;
    textToSpeechSpeed: number; // 0.5-2.0
    textToSpeechVoice: 'male' | 'female' | 'child';
    audioDescriptions: boolean;
  };

  // Motor/Tactile Accommodations
  motor: {
    largerClickTargets: boolean; // 44px minimum
    noDoubleClick: boolean;
    noDragAndDrop: boolean;
    increaseSpacing: boolean;
    stickyKeys: boolean; // Hold keys instead of simultaneous press
    keyboardOnly: boolean; // Full keyboard navigation
    touchAccommodations: boolean; // Longer press time, larger targets
    hoverDelay: number; // ms before hover triggers
  };

  // Cognitive Load Management
  cognitive: {
    oneThingAtATime: boolean; // Single-task focus mode
    noPopups: boolean;
    noAutoplay: boolean;
    simplifyInstructions: boolean;
    showProgressIndicator: boolean;
    limitChoices: number; // Max options to show at once (0 = unlimited)
    extendedTime: boolean;
    timeMultiplier: number; // 1.5x, 2x, etc.
    breakReminders: boolean;
    breakFrequency: number; // minutes
  };

  // Environmental
  environment: {
    fullScreenMode: boolean;
    minimizeDistractions: boolean;
    hideChat: boolean;
    hideNotifications: boolean;
    whiteNoise: boolean;
  };

  // Custom Triggers (for specific sensitivities)
  triggers: {
    avoidColors: string[]; // Hex colors to avoid
    avoidPatterns: boolean;
    avoidFlashing: boolean;
    contentWarnings: string[]; // Topics to warn about
  };
}

export interface SensoryPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  profile: {
    visual?: Partial<SensoryProfile['visual']>;
    auditory?: Partial<SensoryProfile['auditory']>;
    motor?: Partial<SensoryProfile['motor']>;
    cognitive?: Partial<SensoryProfile['cognitive']>;
    environment?: Partial<SensoryProfile['environment']>;
    triggers?: Partial<SensoryProfile['triggers']>;
  };
  recommendedFor: string[]; // e.g., ['ASD', 'ADHD', 'Dyslexia']
}
