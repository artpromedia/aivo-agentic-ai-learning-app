/**
 * Voice Service
 * 
 * Provides voice input and text-to-speech capabilities:
 * - Voice recognition for text input
 * - TTS for reading content
 * - Voice commands
 */

// @ts-ignore - Package may not have complete types
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import {analyticsService} from '../analytics/analyticsService';

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface VoiceServiceConfig {
  language?: string;
  maxResults?: number;
  partialResults?: boolean;
}

class VoiceService {
  private isListening = false;
  private config: VoiceServiceConfig = {
    language: 'en-US',
    maxResults: 5,
    partialResults: true,
  };
  private recognitionCallbacks: {
    onResult?: (results: VoiceRecognitionResult[]) => void;
    onError?: (error: any) => void;
    onEnd?: () => void;
  } = {};

  /**
   * Initialize voice service
   */
  async initialize(): Promise<void> {
    try {
      // Check if voice recognition is available
      const available = await Voice.isAvailable();
      console.log('[Voice] Voice recognition available:', available);

      // Set up event listeners
      Voice.onSpeechStart = this.onSpeechStart;
      Voice.onSpeechEnd = this.onSpeechEnd;
      Voice.onSpeechResults = this.onSpeechResults;
      Voice.onSpeechPartialResults = this.onSpeechPartialResults;
      Voice.onSpeechError = this.onSpeechError;

      console.log('[Voice] Initialized successfully');
    } catch (error) {
      console.error('[Voice] Initialization error:', error);
    }
  }

  /**
   * Configure voice service
   */
  configure(config: Partial<VoiceServiceConfig>): void {
    this.config = {...this.config, ...config};
    console.log('[Voice] Configuration updated:', this.config);
  }

  /**
   * Start voice recognition
   */
  async startListening(callbacks?: {
    onResult?: (results: VoiceRecognitionResult[]) => void;
    onError?: (error: any) => void;
    onEnd?: () => void;
  }): Promise<void> {
    if (this.isListening) {
      console.warn('[Voice] Already listening');
      return;
    }

    try {
      this.recognitionCallbacks = callbacks || {};

      await Voice.start(this.config.language || 'en-US', {
        EXTRA_MAX_RESULTS: this.config.maxResults,
        EXTRA_PARTIAL_RESULTS: this.config.partialResults,
        EXTRA_LANGUAGE_MODEL: 'free_form',
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
      });

      this.isListening = true;
      console.log('[Voice] Started listening');

      // Track analytics
      analyticsService.logVoiceInputUsed();
    } catch (error) {
      console.error('[Voice] Start listening error:', error);
      this.recognitionCallbacks.onError?.(error);
    }
  }

  /**
   * Stop voice recognition
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    try {
      await Voice.stop();
      this.isListening = false;
      console.log('[Voice] Stopped listening');
    } catch (error) {
      console.error('[Voice] Stop listening error:', error);
    }
  }

  /**
   * Cancel voice recognition
   */
  async cancelListening(): Promise<void> {
    try {
      await Voice.cancel();
      this.isListening = false;
      console.log('[Voice] Cancelled listening');
    } catch (error) {
      console.error('[Voice] Cancel listening error:', error);
    }
  }

  /**
   * Check if currently listening
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Speak text using TTS
   */
  async speak(text: string, options?: {rate?: number; pitch?: number}): Promise<void> {
    if (!text) return;

    try {
      // Stop any current speech
      await Tts.stop();

      // Set options if provided
      if (options?.rate !== undefined) {
        await Tts.setDefaultRate(options.rate);
      }
      if (options?.pitch !== undefined) {
        await Tts.setDefaultPitch(options.pitch);
      }

      // Speak
      await Tts.speak(text);

      console.log('[Voice] Speaking:', text.substring(0, 50));
    } catch (error) {
      console.error('[Voice] TTS error:', error);
    }
  }

  /**
   * Stop TTS
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Tts.stop();
      console.log('[Voice] Stopped speaking');
    } catch (error) {
      console.error('[Voice] Stop speaking error:', error);
    }
  }

  /**
   * Get available TTS voices
   */
  async getVoices(): Promise<any[]> {
    try {
      const voices = await Tts.voices();
      return voices;
    } catch (error) {
      console.error('[Voice] Get voices error:', error);
      return [];
    }
  }

  /**
   * Set TTS voice
   */
  async setVoice(voiceId: string): Promise<void> {
    try {
      await Tts.setDefaultVoice(voiceId);
      console.log('[Voice] Voice set:', voiceId);
    } catch (error) {
      console.error('[Voice] Set voice error:', error);
    }
  }

  // Event handlers
  private onSpeechStart = (e: any) => {
    console.log('[Voice] Speech started');
  };

  private onSpeechEnd = (e: any) => {
    console.log('[Voice] Speech ended');
    this.isListening = false;
    this.recognitionCallbacks.onEnd?.();
  };

  private onSpeechResults = (e: any) => {
    if (!e.value || e.value.length === 0) return;

    const results: VoiceRecognitionResult[] = e.value.map(
      (transcript: string, index: number) => ({
        transcript,
        confidence: 1.0 - index * 0.1, // Approximate confidence
        isFinal: true,
      })
    );

    console.log('[Voice] Results:', results[0].transcript);
    this.recognitionCallbacks.onResult?.(results);
  };

  private onSpeechPartialResults = (e: any) => {
    if (!e.value || e.value.length === 0) return;

    const results: VoiceRecognitionResult[] = e.value.map(
      (transcript: string, index: number) => ({
        transcript,
        confidence: 1.0 - index * 0.1,
        isFinal: false,
      })
    );

    console.log('[Voice] Partial:', results[0].transcript);
    this.recognitionCallbacks.onResult?.(results);
  };

  private onSpeechError = (e: any) => {
    console.error('[Voice] Error:', e.error);
    this.isListening = false;
    this.recognitionCallbacks.onError?.(e.error);
  };

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    try {
      await Voice.destroy();
      await Tts.stop();
      this.isListening = false;
      console.log('[Voice] Cleaned up');
    } catch (error) {
      console.error('[Voice] Cleanup error:', error);
    }
  }
}

export const voiceService = new VoiceService();
