// Self-regulation and emotional support types
export type EmotionState = 
  | 'calm'
  | 'happy'
  | 'excited'
  | 'anxious'
  | 'frustrated'
  | 'sad'
  | 'angry'
  | 'overwhelmed';

export type RegulationTechnique = 
  | 'breathing'
  | 'movement'
  | 'sensory'
  | 'mindfulness'
  | 'visualization'
  | 'grounding';

export interface RegulationActivity {
  id: string;
  name: string;
  type: RegulationTechnique;
  description: string;
  duration: number; // in seconds
  difficulty: 'easy' | 'medium' | 'advanced';
  instructions: string[];
  benefits: string[];
  bestFor: EmotionState[];
  voiceGuidance?: boolean;
  visualAids?: string[];
  audioUrl?: string;
  videoUrl?: string;
}

export interface RegulationSession {
  id: string;
  learnerId: string;
  activityId: string;
  emotionBefore: EmotionState;
  emotionAfter?: EmotionState;
  completed: boolean;
  duration: number;
  helpful: boolean | null;
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface EmotionCheckIn {
  id: string;
  learnerId: string;
  emotion: EmotionState;
  intensity: number; // 1-10
  triggers?: string[];
  timestamp: Date;
}
