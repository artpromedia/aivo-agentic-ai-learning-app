/**
 * Accessibility Settings Screen
 * 
 * Comprehensive accessibility settings including:
 * - Text size adjustment
 * - Dyslexia-friendly font
 * - High contrast mode
 * - Reduce motion
 * - Text-to-speech
 * - Voice speed
 * - Haptic feedback
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {accessibilityService} from '@/services/accessibility/accessibilityService';
import {voiceService} from '@/services/accessibility/voiceService';
import {AccessibleButton} from '@/components/AccessibleButton/AccessibleButton';
import {ReadableText} from '@/components/ReadableText/ReadableText';

interface SettingToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessible={true}
        accessibilityLabel={`${label} ${value ? 'enabled' : 'disabled'}`}
        accessibilityRole="switch"
      />
    </View>
  );
};

export const AccessibilitySettingsScreen: React.FC = () => {
  // Text size
  const [textScale, setTextScale] = useState(1.0);

  // Font settings
  const [dyslexiaFont, setDyslexiaFont] = useState(false);

  // Visual settings
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [boldText, setBoldText] = useState(false);

  // Audio settings
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.0);

  // Interaction settings
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [voiceInput, setVoiceInput] = useState(false);

  // System settings (read-only)
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Initialize with current accessibility settings
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await accessibilityService.getAccessibilitySettings();
    setScreenReaderEnabled(settings.screenReader);
    setTextScale(settings.textScale);
    setBoldText(settings.boldText);
    setReduceMotion(settings.reduceMotion);
  };

  const handleTextScaleChange = (value: number) => {
    setTextScale(value);
    accessibilityService.announce(
      `Text size ${Math.round(value * 100)}%`
    );
  };

  const handleDyslexiaFontChange = (value: boolean) => {
    setDyslexiaFont(value);
    accessibilityService.announce(
      value ? 'Dyslexia font enabled' : 'Dyslexia font disabled'
    );
  };

  const handleHighContrastChange = (value: boolean) => {
    setHighContrast(value);
    accessibilityService.announce(
      value ? 'High contrast enabled' : 'High contrast disabled'
    );
  };

  const handleReduceMotionChange = (value: boolean) => {
    setReduceMotion(value);
    accessibilityService.announce(
      value ? 'Reduce motion enabled' : 'Reduce motion disabled'
    );
  };

  const handleTextToSpeechChange = (value: boolean) => {
    setTextToSpeech(value);
    accessibilityService.configure({enableTts: value});

    if (value) {
      accessibilityService.announce('Text to speech enabled');
    } else {
      accessibilityService.announce('Text to speech disabled');
    }
  };

  const handleVoiceSpeedChange = (value: number) => {
    setVoiceSpeed(value);
    accessibilityService.configure({ttsRate: value});
  };

  const handleVoicePitchChange = (value: number) => {
    setVoicePitch(value);
    accessibilityService.configure({ttsPitch: value});
  };

  const handleHapticFeedbackChange = (value: boolean) => {
    setHapticFeedback(value);
    accessibilityService.configure({enableHaptics: value});

    if (value) {
      accessibilityService.triggerHaptic('success');
    }
    accessibilityService.announce(
      value ? 'Haptic feedback enabled' : 'Haptic feedback disabled'
    );
  };

  const handleVoiceInputChange = (value: boolean) => {
    setVoiceInput(value);
    accessibilityService.announce(
      value ? 'Voice input enabled' : 'Voice input disabled'
    );
  };

  const handleTestVoice = async () => {
    await voiceService.speak(
      'This is a test of the text to speech feature. How does it sound?',
      {rate: voiceSpeed, pitch: voicePitch}
    );
  };

  return (
    <ScrollView style={styles.container} accessible={true}>
      <View style={styles.header}>
        <Text style={styles.title}>Accessibility Settings</Text>
        <Text style={styles.subtitle}>
          Customize the app to match your needs
        </Text>
      </View>

      {/* System Settings (Read-only) */}
      {screenReaderEnabled && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ✓ Screen Reader Active (TalkBack/VoiceOver)
          </Text>
        </View>
      )}

      {/* Text Size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Text & Font</Text>

        <View style={styles.sliderContainer}>
          <Text style={styles.settingLabel}>Text Size</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.8}
            maximumValue={2.0}
            step={0.1}
            value={textScale}
            onValueChange={handleTextScaleChange}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#E5E5EA"
            thumbTintColor="#007AFF"
            accessible={true}
            accessibilityLabel="Text size slider"
            accessibilityValue={{
              min: 80,
              max: 200,
              now: Math.round(textScale * 100),
            }}
          />
          <ReadableText
            style={styles.previewText}
            textScale={textScale}
          >
            Preview Text ({Math.round(textScale * 100)}%)
          </ReadableText>
        </View>

        <SettingToggle
          label="Dyslexia-Friendly Font"
          description="Use OpenDyslexic font for easier reading"
          value={dyslexiaFont}
          onValueChange={handleDyslexiaFontChange}
        />
      </View>

      {/* Visual Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visual</Text>

        <SettingToggle
          label="High Contrast Mode"
          description="Increase contrast for better visibility"
          value={highContrast}
          onValueChange={handleHighContrastChange}
        />

        <SettingToggle
          label="Reduce Motion"
          description="Minimize animations and transitions"
          value={reduceMotion}
          onValueChange={handleReduceMotionChange}
        />

        {boldText && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ✓ Bold Text enabled in system settings
            </Text>
          </View>
        )}
      </View>

      {/* Audio Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio</Text>

        <SettingToggle
          label="Text-to-Speech"
          description="Read text aloud automatically"
          value={textToSpeech}
          onValueChange={handleTextToSpeechChange}
          disabled={screenReaderEnabled}
        />

        {screenReaderEnabled && (
          <Text style={styles.disabledNote}>
            Disabled while screen reader is active
          </Text>
        )}

        {textToSpeech && (
          <>
            <View style={styles.sliderContainer}>
              <Text style={styles.settingLabel}>
                Voice Speed ({voiceSpeed.toFixed(1)}x)
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0.5}
                maximumValue={2.0}
                step={0.1}
                value={voiceSpeed}
                onValueChange={handleVoiceSpeedChange}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                thumbTintColor="#007AFF"
              />
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.settingLabel}>
                Voice Pitch ({voicePitch.toFixed(1)}x)
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0.5}
                maximumValue={2.0}
                step={0.1}
                value={voicePitch}
                onValueChange={handleVoicePitchChange}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                thumbTintColor="#007AFF"
              />
            </View>

            <AccessibleButton
              onPress={handleTestVoice}
              accessibilityLabel="Test voice settings"
              accessibilityHint="Plays a sample with current voice settings"
              style={styles.testButton}
            >
              <Text style={styles.testButtonText}>Test Voice</Text>
            </AccessibleButton>
          </>
        )}
      </View>

      {/* Interaction Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interaction</Text>

        <SettingToggle
          label="Haptic Feedback"
          description="Feel vibrations when tapping buttons"
          value={hapticFeedback}
          onValueChange={handleHapticFeedbackChange}
        />

        <SettingToggle
          label="Voice Input"
          description="Enable voice-to-text for all input fields"
          value={voiceInput}
          onValueChange={handleVoiceInputChange}
        />
      </View>

      {/* Help Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help</Text>
        <Text style={styles.helpText}>
          These settings help make the app easier to use. You can adjust text
          size, enable voice features, and customize visual elements to match
          your preferences.
        </Text>
        <Text style={styles.helpText}>
          For additional accessibility features, check your device's system
          settings.
        </Text>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 60,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sliderContainer: {
    marginVertical: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  previewText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#000000',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  disabledNote: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    fontStyle: 'italic',
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginTop: 16,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    height: 40,
  },
});
