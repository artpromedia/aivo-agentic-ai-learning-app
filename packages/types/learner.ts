// Learner types
export interface Learner {
  id: string;
  name: string;
  age: number;
  grade?: string;
  parentIds: string[];
  teacherIds: string[];
  profile: LearnerProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearnerProfile {
  interests: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  neurodiversityProfile?: {
    conditions: string[];
    accommodations: string[];
  };
  preferredVoice?: string;
  avatarUrl?: string;
}
