/**
 * Agentic AI Brain API Service
 * Connects to the autonomous monitoring and intervention system
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

export interface LearningGoal {
  id: string;
  brain_id: string;
  goal_type: 'skill_mastery' | 'confidence_building' | 'engagement' | 'breakthrough';
  title: string;
  description: string;
  target_metric?: string;
  current_value?: number;
  target_value?: number;
  confidence_score: number;
  reasoning: string;
  status: 'active' | 'achieved' | 'revised' | 'abandoned';
  created_at: string;
  updated_at?: string;
  achieved_at?: string;
}

export interface ReasoningTrace {
  id: string;
  brain_id: string;
  decision_type: string;
  context: Record<string, unknown>;
  reasoning_steps: string[];
  decision: string;
  confidence: number;
  alternatives_considered?: string[];
  timestamp: string;
}

export interface ProactiveIntervention {
  id: string;
  brain_id: string;
  session_id: string;
  trigger_type: 'frustration' | 'disengagement' | 'success_momentum' | 'fatigue' | 'stuck' | 'breakthrough';
  intervention_type: 'hint' | 'encouragement' | 'break_suggestion' | 'difficulty_adjustment' | 'celebration' | 'reflection_prompt';
  severity: number;
  message: string;
  reasoning: string;
  learner_response?: 'accepted' | 'rejected' | 'ignored' | 'modified';
  timestamp: string;
  outcome?: string;
}

export interface InterventionPolicy {
  autonomy_level: 1 | 2 | 3;
  enabled_triggers: string[];
  min_interval_minutes: number;
  max_per_session: number;
}

export interface AgenticDashboard {
  brain_id: string;
  active_goals: LearningGoal[];
  recent_interventions: ProactiveIntervention[];
  reasoning_traces: ReasoningTrace[];
  current_policy: InterventionPolicy;
  summary: {
    total_goals: number;
    active_goals: number;
    achieved_goals: number;
    total_interventions: number;
    acceptance_rate: number;
    avg_confidence: number;
  };
}

export interface MonitoringStatus {
  brain_id: string;
  session_id?: string;
  is_monitoring: boolean;
  started_at?: string;
  interventions_count: number;
  last_check?: string;
}

class AgenticAPIService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get the parent dashboard view of the AI brain
   */
  async getDashboard(brainId: string): Promise<AgenticDashboard> {
    const response = await fetch(`${API_BASE_URL}/v1/agentic/dashboard/${brainId}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get active learning goals
   */
  async getGoals(brainId: string, status?: string): Promise<LearningGoal[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const response = await fetch(
      `${API_BASE_URL}/v1/agentic/goals/${brainId}?${params.toString()}`,
      {
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch goals: ${response.statusText}`);
    }

    const data = await response.json();
    return data.goals || [];
  }

  /**
   * Get intervention history
   */
  async getInterventions(
    brainId: string,
    options?: {
      sessionId?: string;
      triggerType?: string;
      limit?: number;
    }
  ): Promise<ProactiveIntervention[]> {
    const params = new URLSearchParams();
    if (options?.sessionId) params.append('session_id', options.sessionId);
    if (options?.triggerType) params.append('trigger_type', options.triggerType);
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/v1/agentic/interventions/${brainId}?${params.toString()}`,
      {
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch interventions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.interventions || [];
  }

  /**
   * Get reasoning traces (decision history)
   */
  async getReasoningTraces(
    brainId: string,
    options?: {
      decisionType?: string;
      limit?: number;
    }
  ): Promise<ReasoningTrace[]> {
    const params = new URLSearchParams();
    if (options?.decisionType) params.append('decision_type', options.decisionType);
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/v1/agentic/reasoning/trace/${brainId}?${params.toString()}`,
      {
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch reasoning traces: ${response.statusText}`);
    }

    const data = await response.json();
    return data.traces || [];
  }

  /**
   * Update intervention policy (parent controls)
   */
  async updatePolicy(brainId: string, policy: InterventionPolicy): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/agentic/policy/${brainId}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(policy),
    });

    if (!response.ok) {
      throw new Error(`Failed to update policy: ${response.statusText}`);
    }
  }

  /**
   * Start monitoring a session
   */
  async startMonitoring(
    brainId: string,
    sessionId: string,
    policy?: InterventionPolicy
  ): Promise<MonitoringStatus> {
    const response = await fetch(`${API_BASE_URL}/v1/agentic/monitor/start`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify({
        brain_id: brainId,
        session_id: sessionId,
        policy,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start monitoring: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Stop monitoring a session
   */
  async stopMonitoring(brainId: string, sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/v1/agentic/monitor/stop`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify({
        brain_id: brainId,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to stop monitoring: ${response.statusText}`);
    }
  }

  /**
   * Analyze learner state and generate new goals
   */
  async analyzeGoals(brainId: string): Promise<{ goals: LearningGoal[] }> {
    const response = await fetch(`${API_BASE_URL}/v1/agentic/goals/analyze`, {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify({
        brain_id: brainId,
        include_recent_sessions: true,
        session_limit: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze goals: ${response.statusText}`);
    }

    return response.json();
  }
}

export const agenticAPI = new AgenticAPIService();
