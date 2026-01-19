// Self-regulation and emotional support types

// All possible emotion values used in the application
export type EmotionType =
  | 'calm'
  | 'happy'
  | 'excited'
  | 'anxious'
  | 'frustrated'
  | 'sad'
  | 'angry'
  | 'overwhelmed'
  | 'anxiety'
  | 'stress'
  | 'panic'
  | 'overstimulation'
  | 'focus'
  | 'fidgeting'
  | 'tension'
  | 'bedtime'
  | 'hyperactivity'
  | 'restlessness'
  | 'excess-energy'
  | 'sensory-seeking'
  | 'overwhelm'
  | 'meltdown'
  | 'dissociation'
  | 'shutdown'
  | 'rumination'
  | 'distraction'
  | 'waiting'
  | 'fear'
  | 'worry'
  | 'anger';

// EmotionState is the object type used for tracking emotion records
export interface EmotionState {
  emotion: EmotionType;
  level: number;
  timestamp?: Date;
}

export type RegulationTechnique =
  | 'breathing'
  | 'movement'
  | 'sensory'
  | 'mindfulness'
  | 'visualization'
  | 'grounding';

export interface VisualSupport {
  type: 'animation' | 'image' | 'video';
  description: string;
  url?: string;
}

export interface RegulationActivity {
  id: string;
  name: string;
  type: RegulationTechnique;
  description: string;
  duration: number; // in seconds
  difficulty: 'easy' | 'medium' | 'advanced';
  instructions: string[];
  benefits?: string[];
  bestFor: string[]; // Allow any string for flexibility
  voiceGuidance?: boolean;
  visualAids?: string[];
  audioUrl?: string;
  videoUrl?: string;
  icon?: string;
  visualSupport?: VisualSupport;
}

export interface RegulationSession {
  id: string;
  learnerId: string;
  activityId: string;
  emotionBefore: EmotionState;
  emotionAfter?: EmotionState;
  completed: boolean;
  duration?: number;
  helpful?: boolean | null;
  notes?: string;
  startTime?: Date;
  endTime?: Date;
  createdAt?: Date;
  completedAt?: Date;
}

export interface EmotionCheckIn {
  id: string;
  learnerId: string;
  emotion: EmotionType;
  intensity: number; // 1-10
  triggers?: string[];
  timestamp: Date;
}
