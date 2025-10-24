/**
 * Voice Input Button Component
 * 
 * Button for voice-to-text input with:
 * - Visual feedback during recording
 * - Error handling
 * - Accessibility support
 */

import React, {useState} from 'react';
import {TouchableOpacity, Text, View, StyleSheet, ActivityIndicator} from 'react-native';
import {voiceService, VoiceRecognitionResult} from '@/services/accessibility/voiceService';
import {accessibilityService} from '@/services/accessibility/accessibilityService';

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
  onError?: (error: any) => void;
  placeholder?: string;
  language?: string;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onResult,
  onError,
  placeholder = 'Tap to speak',
  language = 'en-US',
  className,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handlePress = async () => {
    if (isListening) {
      // Stop listening
      await voiceService.stopListening();
      setIsListening(false);

      // Send final transcript
      if (transcript) {
        onResult(transcript);
        setTranscript('');
      }
    } else {
      // Start listening
      setIsListening(true);
      setTranscript('');

      accessibilityService.announce('Listening for voice input');
      accessibilityService.triggerHaptic('selection');

      await voiceService.configure({language});
      await voiceService.startListening({
        onResult: (results: VoiceRecognitionResult[]) => {
          if (results.length > 0) {
            const text = results[0].transcript;
            setTranscript(text);

            // Auto-submit on final result
            if (results[0].isFinal) {
              onResult(text);
              setIsListening(false);
              setTranscript('');
            }
          }
        },
        onError: (error) => {
          console.error('[VoiceInput] Error:', error);
          setIsListening(false);
          setTranscript('');
          onError?.(error);
          accessibilityService.announce('Voice input error');
          accessibilityService.triggerHaptic('error');
        },
        onEnd: () => {
          setIsListening(false);
          if (transcript) {
            onResult(transcript);
            setTranscript('');
          }
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.button, isListening && styles.buttonActive]}
        accessible={true}
        accessibilityLabel={isListening ? 'Stop voice input' : 'Start voice input'}
        accessibilityRole="button"
        accessibilityState={{selected: isListening}}
      >
        {isListening ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.icon}>🎤</Text>
        )}
      </TouchableOpacity>

      {transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcript}>{transcript}</Text>
        </View>
      )}

      {!isListening && !transcript && (
        <Text style={styles.placeholder}>{placeholder}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
  },
  icon: {
    fontSize: 24,
  },
  placeholder: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  transcriptContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    maxWidth: 300,
  },
  transcript: {
    fontSize: 16,
    color: '#000000',
  },
});
