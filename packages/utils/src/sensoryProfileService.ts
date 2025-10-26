/**
 * Sensory Profile Service
 * Manages sensory accommodation profiles for learners with diverse needs
 * Supports ASD, ADHD, dyslexia, visual/motor/auditory challenges, and more
 */

import type { SensoryProfile, SensoryPreset } from '@aivo/types';

export class SensoryProfileService {
  private static instance: SensoryProfileService;
  private readonly STORAGE_KEY = 'sensory_profiles';

  private constructor() {}

  static getInstance(): SensoryProfileService {
    if (!SensoryProfileService.instance) {
      SensoryProfileService.instance = new SensoryProfileService();
    }
    return SensoryProfileService.instance;
  }

  /**
   * Get preset sensory profiles for common needs
   */
  getPresets(): SensoryPreset[] {
    return [
      {
        id: 'asd-low-sensory',
        name: 'Low Sensory (ASD)',
        description: 'Minimal animations, sounds, and visual clutter',
        icon: '🔇',
        recommendedFor: ['ASD', 'Sensory Processing Disorder'],
        profile: {
          visual: {
            reduceAnimations: true,
            reduceMotion: true,
            reducedClutter: true,
            flashingContent: 'remove',
          },
          auditory: {
            muteAllSounds: true,
            noBackgroundMusic: true,
            noSoundEffects: true,
          },
          cognitive: {
            oneThingAtATime: true,
            noPopups: true,
            noAutoplay: true,
          },
          environment: {
            fullScreenMode: true,
            minimizeDistractions: true,
          },
        },
      },
      {
        id: 'adhd-focus',
        name: 'ADHD Focus Mode',
        description: 'Reduced distractions, break reminders, clear progress',
        icon: '🎯',
        recommendedFor: ['ADHD', 'Executive Function Challenges'],
        profile: {
          visual: {
            reducedClutter: true,
            highContrast: true,
          },
          cognitive: {
            oneThingAtATime: true,
            showProgressIndicator: true,
            breakReminders: true,
            breakFrequency: 20,
            limitChoices: 3,
          },
          environment: {
            fullScreenMode: true,
            minimizeDistractions: true,
            hideNotifications: true,
          },
        },
      },
      {
        id: 'dyslexia',
        name: 'Dyslexia-Friendly',
        description: 'Dyslexic font, increased spacing, text-to-speech',
        icon: '📖',
        recommendedFor: ['Dyslexia', 'Reading Challenges'],
        profile: {
          visual: {
            fontFamily: 'open-dyslexic',
            fontSize: 'large',
            lineSpacing: 'extra-wide',
            colorScheme: 'warm',
          },
          auditory: {
            textToSpeechEnabled: true,
            textToSpeechSpeed: 0.9,
          },
          cognitive: {
            simplifyInstructions: true,
            extendedTime: true,
            timeMultiplier: 1.5,
          },
        },
      },
      {
        id: 'visual-impairment',
        name: 'Vision Support',
        description: 'High contrast, large text, screen reader optimized',
        icon: '👓',
        recommendedFor: ['Low Vision', 'Visual Impairment'],
        profile: {
          visual: {
            highContrast: true,
            fontSize: 'extra-large',
            lineSpacing: 'extra-wide',
            colorScheme: 'high-contrast',
          },
          auditory: {
            textToSpeechEnabled: true,
            audioDescriptions: true,
          },
          motor: {
            largerClickTargets: true,
            keyboardOnly: true,
          },
        },
      },
      {
        id: 'motor-challenges',
        name: 'Motor Support',
        description: 'Larger targets, no drag-drop, keyboard navigation',
        icon: '🖱️',
        recommendedFor: ['Motor Challenges', 'Cerebral Palsy', 'Dyspraxia'],
        profile: {
          motor: {
            largerClickTargets: true,
            noDoubleClick: true,
            noDragAndDrop: true,
            increaseSpacing: true,
            keyboardOnly: true,
            touchAccommodations: true,
            hoverDelay: 500,
          },
          cognitive: {
            extendedTime: true,
            timeMultiplier: 2,
          },
        },
      },
      {
        id: 'anxiety',
        name: 'Anxiety-Friendly',
        description: 'Calm colors, no timers, positive reinforcement',
        icon: '🧘',
        recommendedFor: ['Anxiety', 'Stress Management'],
        profile: {
          visual: {
            colorScheme: 'cool',
            reduceAnimations: true,
          },
          auditory: {
            noBackgroundMusic: true,
            soundVolume: 30,
          },
          cognitive: {
            noPopups: true,
            breakReminders: true,
            breakFrequency: 15,
          },
          environment: {
            minimizeDistractions: true,
            hideNotifications: true,
          },
        },
      },
    ];
  }

  /**
   * Get sensory profile for a learner
   */
  getProfile(learnerId: string): SensoryProfile | null {
    try {
      const profiles = this.getAllProfiles();
      return profiles.find((p) => p.learnerId === learnerId) || null;
    } catch (error) {
      console.error('Failed to get sensory profile:', error);
      return null;
    }
  }

  /**
   * Save sensory profile
   */
  saveProfile(profile: SensoryProfile): void {
    try {
      const profiles = this.getAllProfiles();
      const index = profiles.findIndex((p) => p.learnerId === profile.learnerId);

      if (index >= 0) {
        profiles[index] = { ...profile, updatedAt: new Date() };
      } else {
        profiles.push(profile);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Failed to save sensory profile:', error);
    }
  }

  /**
   * Create profile from preset
   */
  createFromPreset(learnerId: string, presetId: string): SensoryProfile {
    const preset = this.getPresets().find((p) => p.id === presetId);
    if (!preset) {
      throw new Error(`Preset ${presetId} not found`);
    }

    const defaultProfile = this.getDefaultProfile();
    const profile: SensoryProfile = {
      id: `${learnerId}-${presetId}-${Date.now()}`,
      learnerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      visualPreferences: defaultProfile.visualPreferences,
      auditoryPreferences: defaultProfile.auditoryPreferences,
      tactilePreferences: defaultProfile.tactilePreferences,
      interactionPreferences: defaultProfile.interactionPreferences,
      accommodations: preset.profile.accommodations || [],
      visual: { ...defaultProfile.visual, ...preset.profile.visual },
      auditory: { ...defaultProfile.auditory, ...preset.profile.auditory },
      motor: { ...defaultProfile.motor, ...preset.profile.motor },
      cognitive: { ...defaultProfile.cognitive, ...preset.profile.cognitive },
      environment: { ...defaultProfile.environment, ...preset.profile.environment },
      triggers: { ...defaultProfile.triggers, ...preset.profile.triggers },
    };

    this.saveProfile(profile);
    return profile;
  }

  /**
   * Get default profile (no accommodations)
   */
  private getDefaultProfile(): Omit<SensoryProfile, 'learnerId' | 'createdAt' | 'updatedAt'> {
    return {
      id: '',
      visualPreferences: {
        brightness: 'medium',
        contrast: 'medium',
        colorIntensity: 'medium',
        animations: true,
        fontSize: 'medium',
        fontFamily: 'standard',
        lineSpacing: 'normal',
      },
      auditoryPreferences: {
        volume: 'medium',
        backgroundMusic: true,
        soundEffects: true,
        voiceGuidance: false,
        speechRate: 'normal',
      },
      tactilePreferences: {
        vibration: false,
        hapticFeedback: 'medium',
      },
      interactionPreferences: {
        autoAdvance: false,
        timerVisibility: true,
        progressIndicators: true,
        encouragementFrequency: 'medium',
      },
      accommodations: [],
      visual: {
        reduceAnimations: false,
        reduceMotion: false,
        highContrast: false,
        darkMode: false,
        reducedClutter: false,
        fontSize: 'medium',
        fontFamily: 'standard',
        lineSpacing: 'normal',
        colorScheme: 'default',
        flashingContent: 'allow',
      },
      auditory: {
        muteAllSounds: false,
        soundVolume: 70,
        noBackgroundMusic: false,
        noSoundEffects: false,
        textToSpeechEnabled: false,
        textToSpeechSpeed: 1.0,
        textToSpeechVoice: 'female',
        audioDescriptions: false,
      },
      motor: {
        largerClickTargets: false,
        noDoubleClick: false,
        noDragAndDrop: false,
        increaseSpacing: false,
        stickyKeys: false,
        keyboardOnly: false,
        touchAccommodations: false,
        hoverDelay: 0,
      },
      cognitive: {
        oneThingAtATime: false,
        noPopups: false,
        noAutoplay: false,
        simplifyInstructions: false,
        showProgressIndicator: true,
        limitChoices: 0,
        extendedTime: false,
        timeMultiplier: 1,
        breakReminders: false,
        breakFrequency: 30,
      },
      environment: {
        fullScreenMode: false,
        minimizeDistractions: false,
        hideChat: false,
        hideNotifications: false,
        whiteNoise: false,
      },
      triggers: {
        avoidColors: [],
        avoidPatterns: false,
        avoidFlashing: false,
        contentWarnings: [],
      },
    };
  }

  /**
   * Get all profiles from storage
   */
  private getAllProfiles(): SensoryProfile[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Apply sensory profile to the document
   */
  applyProfile(profile: SensoryProfile): void {
    const root = document.documentElement;

    // Visual accommodations
    if (profile.visual?.reduceAnimations || profile.visual?.reduceMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (profile.visual?.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (profile.visual?.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (profile.visual?.reducedClutter) {
      root.classList.add('reduced-clutter');
    } else {
      root.classList.remove('reduced-clutter');
    }

    // Font settings
    root.style.setProperty('--font-family', this.getFontFamily(profile.visual?.fontFamily || 'standard'));
    root.style.setProperty('--font-size-base', this.getFontSize(profile.visual?.fontSize || 'medium'));
    root.style.setProperty('--line-height', this.getLineHeight(profile.visual?.lineSpacing || 'normal'));

    // Color scheme
    if (profile.visual?.colorScheme && profile.visual.colorScheme !== 'default') {
      root.setAttribute('data-color-scheme', profile.visual.colorScheme);
    } else {
      root.removeAttribute('data-color-scheme');
    }

    // Motor accommodations
    if (profile.motor?.largerClickTargets) {
      root.style.setProperty('--min-touch-target', '44px');
    } else {
      root.style.setProperty('--min-touch-target', '32px');
    }

    if (profile.motor?.increaseSpacing) {
      root.style.setProperty('--spacing-scale', '1.5');
    } else {
      root.style.setProperty('--spacing-scale', '1');
    }

    if (profile.motor?.keyboardOnly) {
      root.classList.add('keyboard-only');
    } else {
      root.classList.remove('keyboard-only');
    }

    // Cognitive accommodations
    if (profile.cognitive?.oneThingAtATime) {
      root.classList.add('focus-mode');
    } else {
      root.classList.remove('focus-mode');
    }

    // Environment
    if (profile.environment?.fullScreenMode) {
      root.classList.add('fullscreen-mode');
    } else {
      root.classList.remove('fullscreen-mode');
    }

    if (profile.environment?.minimizeDistractions) {
      root.classList.add('minimize-distractions');
    } else {
      root.classList.remove('minimize-distractions');
    }

    // Store active profile ID for reference
    root.setAttribute('data-sensory-profile', profile.learnerId);
  }

  /**
   * Remove all profile styling
   */
  removeProfile(): void {
    const root = document.documentElement;
    root.classList.remove(
      'reduce-motion',
      'high-contrast',
      'reduced-clutter',
      'keyboard-only',
      'focus-mode',
      'fullscreen-mode',
      'minimize-distractions'
    );
    root.removeAttribute('data-color-scheme');
    root.removeAttribute('data-sensory-profile');
    
    // Reset CSS variables to defaults
    root.style.removeProperty('--animation-duration');
    root.style.removeProperty('--transition-duration');
    root.style.removeProperty('--font-family');
    root.style.removeProperty('--font-size-base');
    root.style.removeProperty('--line-height');
    root.style.removeProperty('--min-touch-target');
    root.style.removeProperty('--spacing-scale');
  }

  private getFontFamily(family: SensoryProfile['visualPreferences']['fontFamily']): string {
    const fonts = {
      standard: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      dyslexic: '"Comic Sans MS", "Comic Sans", cursive',
      'comic-sans': '"Comic Sans MS", "Comic Sans", cursive',
      'open-dyslexic': '"OpenDyslexic", sans-serif',
    };
    return fonts[family];
  }

  private getFontSize(size: SensoryProfile['visualPreferences']['fontSize']): string {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '22px',
    };
    return sizes[size];
  }

  private getLineHeight(spacing: SensoryProfile['visualPreferences']['lineSpacing']): string {
    const heights = {
      normal: '1.5',
      wide: '1.8',
      'extra-wide': '2.2',
    };
    return heights[spacing];
  }
}

export const sensoryProfileService = SensoryProfileService.getInstance();
