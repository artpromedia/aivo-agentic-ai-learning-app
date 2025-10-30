/**
 * Assessment API Client
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const assessmentApi = {
  /**
   * Check if assessment is required for learner
   */
  checkRequired: async (learnerId: string) => {
    return axios.get(
      `${API_URL}/api/v1/assessments/check-required/${learnerId}`,
      { headers: getAuthHeaders() }
    );
  },

  /**
   * Start an assessment
   */
  start: async (assessmentId: string) => {
    return axios.post(
      `${API_URL}/api/v1/assessments/${assessmentId}/start`,
      {},
      { headers: getAuthHeaders() }
    );
  },

  /**
   * Submit answer to question
   */
  submitAnswer: async (
    assessmentId: string,
    questionId: string,
    data: {
      answer: string;
      time_spent_seconds: number;
    }
  ) => {
    return axios.post(
      `${API_URL}/api/v1/assessments/${assessmentId}/questions/${questionId}/answer`,
      data,
      { headers: getAuthHeaders() }
    );
  },

  /**
   * Submit quick assessment (5 questions)
   */
  submitQuick: async (data: {
    learner_id: string;
    schedule_id: string;
    responses: Array<{
      question_number: number;
      question_text: string;
      answer_value: string;
      answer_type: string;
      response_time_seconds: number;
    }>;
  }) => {
    return axios.post(
      `${API_URL}/api/v1/assessments/quick/submit`,
      data,
      { headers: getAuthHeaders() }
    );
  },

  /**
   * Complete assessment and get results
   */
  complete: async (assessmentId: string) => {
    return axios.post(
      `${API_URL}/api/v1/assessments/${assessmentId}/complete`,
      {},
      { headers: getAuthHeaders() }
    );
  },

  /**
   * Get assessment results
   */
  getResults: async (assessmentId: string) => {
    return axios.get(
      `${API_URL}/api/v1/assessments/${assessmentId}/results`,
      { headers: getAuthHeaders() }
    );
  },

  /**
   * Get assessment history for learner
   */
  getHistory: async (learnerId: string) => {
    return axios.get(
      `${API_URL}/api/v1/assessments/learner/${learnerId}/history`,
      { headers: getAuthHeaders() }
    );
  }
};

