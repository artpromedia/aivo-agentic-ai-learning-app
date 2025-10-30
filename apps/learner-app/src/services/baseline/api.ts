/**
 * Baseline Assessment API Service
 * Connects frontend to backend AI question generation system
 * Uses multi-provider AI (OpenAI, Anthropic, Gemini) for dynamic questions
 */

import type { BaselineResults } from '../../types/baseline';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';
const API_BASE = `${API_BASE_URL}/api/v1/baseline`;

// ═══════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════

export interface StartSessionRequest {
  learner_id: string;
  grade_band: 'K-5' | '6-8' | '9-12';
  audio_enabled?: boolean;
  tts_enabled?: boolean;
  device_info?: Record<string, unknown>;
  accessibility_preferences?: {
    fontSize: string;
    fontFamily: string;
    highContrast: boolean;
    colorScheme: string;
    reduceAnimations: boolean;
    textToSpeech: boolean;
    ttsVoice: string;
    ttsSpeed: number;
    soundEffects: boolean;
    showTimer: boolean;
    autoAdvance: boolean;
    keyboardNav: boolean;
    breakReminders: boolean;
    breakInterval: number;
    focusMode: boolean;
    showHints: boolean;
    showConfidenceSlider: boolean;
    showEncouragement: boolean;
  };
}

export interface EngagementMetrics {
  hesitationCount: number;
  usedHint: boolean;
  usedReadAloud: boolean;
  confidenceLevel?: number; // 1-5
  focusLevel?: string; // 'high', 'medium', 'low'
  timeSpentMs: number;
  deviceType?: string;
}

export interface SubmitResponseRequest {
  session_id: string;
  item_id: string;
  response: {
    selected_options?: string[];
    constructed_response?: string;
  };
  engagement_metrics: EngagementMetrics;
  time_started: string; // ISO datetime
  time_submitted: string; // ISO datetime
}

export interface AssessmentItem {
  id: string;
  domain: string;
  subDomain: string;
  type: 'multiple-choice' | 'constructed-response' | 'true-false';
  stem: string;
  stimulus?: string;
  stimulusType?: string;
  stimulusUrl?: string;
  // Options can be either an array (multiple choice) or object (fluency)
  options?: Array<{
    id: string;
    label: string;
    correct?: boolean;
  }> | {
    expected_wpm?: number;
    target_accuracy?: number;
    [key: string]: unknown;
  };
  parameters: {
    difficulty: number;
    discrimination: number;
    guessing: number;
  };
  readAloud: boolean;
  allowCalculator: boolean;
  gradeBand: string;
  hintText?: string;
  visualSupportUrl?: string;
  audioSupportUrl?: string;
  estimatedDifficultyLevel?: string;
  neurodiverseFriendly: boolean;
}

export interface StartSessionResponse {
  session_id: string;
  resumed: boolean;
  current_domain: string;
  first_item: AssessmentItem;
  ability_estimates: Record<string, number>;
  standard_errors: Record<string, number>;
  ui_config: Record<string, unknown>;
}

export interface SubmitResponseResponse {
  scored: boolean;
  correct: boolean;
  score: number;
  max_score: number;
  updated_theta: number;
  updated_se: number;
  should_stop_domain: boolean;
  next_domain?: string;
  next_item?: AssessmentItem;
  assessment_complete: boolean;
  encouragement_message: string;
  should_suggest_break: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
// API FUNCTIONS - Connect to AI-Powered Backend
// ═══════════════════════════════════════════════════════════════════════

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string => {
  return localStorage.getItem('access_token') || '';
};

/**
 * Common headers for API requests
 */
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : '',
});

export const BaselineAPI = {
  /**
   * Start or resume assessment session with AI-generated questions
   * Uses multi-provider AI (OpenAI, Anthropic, Gemini)
   */
  async startSession(
    request: StartSessionRequest
  ): Promise<StartSessionResponse> {
    try {
      const response = await fetch(`${API_BASE}/start-session`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to start assessment session');
      }

      return response.json();
    } catch (error) {
      console.error('Error starting baseline session:', error);
      throw error;
    }
  },

  /**
   * Submit answer and get next AI-generated question
   * Backend uses IRT (Item Response Theory) to adapt difficulty
   */
  async submitResponse(
    request: SubmitResponseRequest
  ): Promise<SubmitResponseResponse> {
    try {
      const response = await fetch(`${API_BASE}/submit-response`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to submit response');
      }

      return response.json();
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  },

  /**
   * Get session status and progress
   */
  async getSessionStatus(sessionId: string) {
    try {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/status`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get session status');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching session status:', error);
      throw error;
    }
  },

  /**
   * Pause session and save progress
   */
  async pauseSession(sessionId: string) {
    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}/pause`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to pause session');
      }

      return response.json();
    } catch (error) {
      console.error('Error pausing session:', error);
      throw error;
    }
  },

  /**
   * Resume paused session
   */
  async resumeSession(sessionId: string) {
    try {
      const response = await fetch(`${API_BASE}/session/${sessionId}/resume`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to resume session');
      }

      return response.json();
    } catch (error) {
      console.error('Error resuming session:', error);
      throw error;
    }
  },

  /**
   * Start a break with mindfulness activities
   */
  async startBreak(
    sessionId: string,
    breakType: 'breathing' | 'physical' | 'mindful' | 'custom'
  ) {
    try {
      const response = await fetch(`${API_BASE}/sessions/${sessionId}/break`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          session_id: sessionId,
          break_type: breakType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start break');
      }

      return response.json();
    } catch (error) {
      console.error('Error starting break:', error);
      throw error;
    }
  },

  /**
   * End break and return to assessment
   */
  async endBreak(sessionId: string, breakId: string, feltHelpful?: boolean) {
    try {
      const response = await fetch(
        `${API_BASE}/sessions/${sessionId}/break/${breakId}/end`,
        {
          method: 'POST',
          headers: getHeaders(),
          credentials: 'include',
          body: JSON.stringify({ felt_helpful: feltHelpful }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to end break');
      }

      return response.json();
    } catch (error) {
      console.error('Error ending break:', error);
      throw error;
    }
  },
  /**
   * Get final assessment results with AI-powered recommendations
   */
  async getResults(sessionId: string): Promise<BaselineResults> {
    try {
      const response = await fetch(`${API_BASE}/results/${sessionId}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to load results: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching baseline results:', error);
      throw error;
    }
  },

  /**
   * Get learner's accessibility preferences
   */
  async getAccessibilityPreferences(learnerId: string) {
    try {
      const response = await fetch(
        `${API_BASE}/learner/${learnerId}/accessibility-preferences`,
        {
          method: 'GET',
          headers: getHeaders(),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load accessibility preferences');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching accessibility preferences:', error);
      throw error;
    }
  },

  /**
   * Update learner's accessibility preferences
   */
  async updateAccessibilityPreferences(
    learnerId: string,
    preferences: StartSessionRequest['accessibility_preferences']
  ) {
    try {
      const response = await fetch(
        `${API_BASE}/learner/${learnerId}/accessibility-preferences`,
        {
          method: 'PUT',
          headers: getHeaders(),
          credentials: 'include',
          body: JSON.stringify(preferences),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update accessibility preferences');
      }

      return response.json();
    } catch (error) {
      console.error('Error updating accessibility preferences:', error);
      throw error;
    }
  },

  /**
   * Preview questions for a domain (for parents/teachers)
   * Returns sanitized items without correct answers
   */
  async previewItems(
    domain: string,
    gradeBand: string,
    limit: number = 5
  ) {
    try {
      const params = new URLSearchParams({
        domain,
        grade_band: gradeBand,
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE}/items/preview?${params}`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load preview items');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching preview items:', error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LEGACY METHODS (Keep for backward compatibility)
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Submit baseline assessment responses (legacy format)
   * @deprecated Use submitResponse instead
   */
  async submitResponses(
    sessionId: string,
    responses: Array<{
      item_id: string;
      response: Record<string, unknown>;
      time_spent_ms: number;
    }>
  ): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/baseline/sessions/${sessionId}/responses`,
        {
          method: 'POST',
          headers: getHeaders(),
          credentials: 'include',
          body: JSON.stringify({ responses }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to submit responses: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error submitting baseline responses:', error);
      throw error;
    }
  },

  /**
   * Create a new baseline assessment session (legacy format)
   * @deprecated Use startSession instead
   */
  async createSession(
    learnerId: string,
    gradeBand: string
  ): Promise<{ sessionId: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/baseline/sessions`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ learnerId, gradeBand }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating baseline session:', error);
      throw error;
    }
  },
};


