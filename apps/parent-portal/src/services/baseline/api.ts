/**
 * Baseline Assessment API Service (Parent Portal)
 * Handles API calls for baseline assessment data
 */

import type { BaselineResults } from '../../types/baseline';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

export const BaselineAPI = {
  /**
   * Get baseline assessment results by session ID for a specific child
   */
  async getResults(childId: string, sessionId: string): Promise<BaselineResults> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/baseline/children/${childId}/sessions/${sessionId}/results`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
        }
      );

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
   * Get all baseline sessions for a child
   */
  async getSessions(childId: string): Promise<Array<{
    sessionId: string;
    completedAt: string;
    gradeBand: string;
  }>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/baseline/children/${childId}/sessions`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load sessions: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching baseline sessions:', error);
      throw error;
    }
  },
};

