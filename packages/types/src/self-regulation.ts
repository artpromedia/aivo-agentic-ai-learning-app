/**
 * Self-Regulation & Calming Tools Types
 * 
 * Comprehensive emotion tracking and regulation activities for learners
 * with ASD, ADHD, anxiety, and other emotional regulation needs.
 */

export interface EmotionState {
  level: 1 | 2 | 3 | 4 | 5; // 1 = calm, 5 = very upset
  emotion: 'calm' | 'happy' | 'sad' | 'angry' | 'frustrated' | 'anxious' | 'tired' | 'excited';
  timestamp: Date;
  trigger?: string; // What caused this feeling
  strategy?: string; // What helped
}

export interface VisualSupport {
  type: 'animation' | 'video' | 'image' | 'countdown';
  url?: string;
  description: string;
}

export interface AudioSupport {
  type: 'guided' | 'music' | 'nature-sounds' | 'white-noise';
  url?: string;
  volume: number;
}

export interface RegulationActivity {
  id: string;
  type: 'breathing' | 'movement' | 'sensory' | 'grounding' | 'visualization';
  name: string;
  description: string;
  duration: number; // seconds
  instructions: string[];
  icon: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  bestFor: string[]; // e.g., ['anxiety', 'anger', 'overstimulation']
  visualSupport?: VisualSupport;
  audioSupport?: AudioSupport;
}

export interface RegulationSession {
  id: string;
  learnerId: string;
  activityId: string;
  startTime: Date;
  endTime?: Date;
  emotionBefore: EmotionState;
  emotionAfter?: EmotionState;
  completed: boolean;
  notes?: string;
}

export interface BreakTimer {
  id: string;
  duration: number; // seconds
  visualStyle: 'pie' | 'bar' | 'hourglass' | 'traffic-light';
  warnings: number[]; // e.g., [300, 120, 60] = warn at 5min, 2min, 1min
  soundEnabled: boolean;
  autoStart: boolean;
}

export interface CalmingSpace {
  learnerId: string;
  backgroundColor: string;
  message: string;
  showTimer: boolean;
  allowEarlyExit: boolean;
}
