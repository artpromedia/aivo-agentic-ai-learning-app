/**
 * Baseline Assessment API Service
 * Handles API calls for baseline assessment data
 */

import type { BaselineResults } from '../../types/baseline';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

export const BaselineAPI = {
  /**
   * Get baseline assessment results by session ID
   */
  async getResults(sessionId: string): Promise<BaselineResults> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/baseline/sessions/${sessionId}/results`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
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
   * Submit baseline assessment responses
   */
  async submitResponses(sessionId: string, responses: any[]): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/baseline/sessions/${sessionId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ responses }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit responses: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error submitting baseline responses:', error);
      throw error;
    }
  },

  /**
   * Create a new baseline assessment session
   */
  async createSession(learnerId: string, gradeBand: string): Promise<{ sessionId: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/baseline/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
