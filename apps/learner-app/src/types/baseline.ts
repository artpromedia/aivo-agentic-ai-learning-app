/**
 * Baseline Assessment Types
 * Implements adaptive testing with IRT scoring
 */

// Grade bands
export type GradeBand = 'K-5' | '6-8' | '9-12';

// Subject domains
export type Domain = 'reading' | 'math' | 'science' | 'writing' | 'sel' | 'speech';

// Sub-domains for deeper analysis
export type SubDomain = 
  // Reading
  | 'phonics' | 'fluency' | 'vocabulary' | 'comprehension' | 'inference'
  // Math
  | 'number_sense' | 'operations' | 'algebra' | 'geometry' | 'data_analysis'
  // Science
  | 'physical_science' | 'life_science' | 'earth_space' | 'scientific_inquiry'
  // Writing
  | 'mechanics' | 'organization' | 'development' | 'conventions' | 'grammar'
  // SEL
  | 'self_awareness' | 'self_management' | 'social_awareness' | 'relationship_skills'
  // Speech Therapy
  | 'articulation' | 'phonology' | 'fluency_stuttering' | 'voice' | 'language_expression' 
  | 'language_comprehension' | 'pragmatics' | 'oral_motor';

// Item types
export type ItemType = 
  | 'yes_no'           // Binary choice
  | 'multi_select'     // Select all that apply
  | 'single_choice'    // One correct answer
  | 'ordering'         // Sequence items
  | 'fill_blank'       // Short answer
  | 'read_aloud'       // Audio recording + self-rating
  | 'constructed_response'; // Extended response

// Difficulty levels (aligned with IRT theta scale)
export type DifficultyLevel = 
  | 'very_easy'    // theta < -2.0
  | 'easy'         // theta -2.0 to -1.0
  | 'medium'       // theta -1.0 to 1.0
  | 'hard'         // theta 1.0 to 2.0
  | 'very_hard';   // theta > 2.0

// Item metadata (IRT parameters)
export interface ItemParameters {
  difficulty: number;        // b parameter (theta location)
  discrimination: number;    // a parameter (slope)
  guessing?: number;         // c parameter (lower asymptote)
  domain?: Domain;           // Optional: can be inferred from item
  subDomain?: SubDomain;     // Optional: can be inferred from item
  gradeBand?: GradeBand;     // Optional: can be inferred from item
  estimatedTime: number;     // seconds
  cognitiveLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

// Question item
export interface BaselineItem {
  id: string;
  type: ItemType;
  domain: Domain;
  subDomain: SubDomain;
  gradeBand: GradeBand;
  
  // Content
  stem: string;              // Question text
  stimulus?: string;         // Reading passage, diagram, etc.
  stimulusType?: 'text' | 'image' | 'audio' | 'video';
  
  // Options (for choice items)
  options?: {
    id: string;
    label: string;
    correct?: boolean;        // Boolean flag for correct answer
    correctness?: number;     // Numeric score (0-1) for partial credit
    distractor?: string;      // Why this is incorrect (for feedback)
  }[];
  
  // Correct answer (for constructed response)
  correctAnswer?: string | string[];
  
  // Scoring
  points: number;
  partialCredit?: boolean;
  
  // IRT parameters
  parameters: ItemParameters;
  
  // Accessibility
  readAloud: boolean;
  allowCalculator?: boolean;
  allowFormula?: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// Response to an item
export interface ItemResponse {
  itemId: string;
  domain: Domain;
  subDomain: SubDomain;
  
  // Response data
  selectedOptions?: string[];      // For choice items
  constructedResponse?: string;    // For open-ended
  audioUrl?: string;               // For read-aloud
  selfRating?: 'easy' | 'just_right' | 'hard';
  
  // Timing
  timeStarted: Date;
  timeSubmitted: Date;
  timeSpentMs: number;
  
  // Engagement indicators
  hesitationCount: number;         // Number of times changed answer
  skipped: boolean;
  usedHint: boolean;
  usedReadAloud: boolean;
  
  // Scoring
  correct: boolean;
  score: number;                   // 0-1 (can be partial credit)
  maxScore: number;
}

// Assessment session
export interface BaselineSession {
  id: string;
  learnerId: string;
  gradeBand: GradeBand;
  
  // Status
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'abandoned';
  
  // Progress
  currentDomain: Domain;
  domainsCompleted: Domain[];
  itemsAnswered: number;
  totalItems: number;
  
  // Responses
  responses: ItemResponse[];
  
  // Timing
  startedAt: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  completedAt?: Date;
  totalTimeMs: number;
  
  // Adaptive tracking
  currentAbilityEstimates: Partial<Record<Domain, number>>;  // theta estimates
  standardErrors: Partial<Record<Domain, number>>;           // measurement error
  
  // Settings
  audioRecordingEnabled: boolean;
  textToSpeechEnabled: boolean;
  
  // Results (computed at end)
  finalResults?: BaselineResults;
}

// Final assessment results
export interface BaselineResults {
  sessionId: string;
  learnerId: string;
  gradeBand: GradeBand;
  completedAt: Date;
  
  // Overall metrics
  totalTimeMs: number;
  itemsAttempted: number;
  accuracyRate: number;
  
  // Domain scores (grade level equivalent)
  domainScores: Partial<Record<Domain, number>>;  // e.g., reading: 4.2 (4th grade, 2nd month)
  
  // Ability estimates (IRT theta scale)
  abilityEstimates: Partial<Record<Domain, number>>;  // theta: -3 to +3
  standardErrors: Partial<Record<Domain, number>>;
  
  // Sub-domain breakdown
  subDomainScores: Partial<Record<SubDomain, number>>;
  
  // Strengths and gaps
  strengths: string[];               // Sub-domains where learner excelled
  gaps: string[];                    // Sub-domains needing support
  
  // Recommendations
  scaffolds: string[];               // Recommended supports
  startingLevels: Partial<Record<Domain, string>>;  // Where to start instruction
  
  // Engagement metrics
  averageTimePerItem: number;
  hesitationRate: number;
  completionRate: number;
  
  // Reading-specific (if audio recorded)
  readingFluency?: {
    wordsPerMinute: number;
    accuracy: number;
    expression: number;
    automaticity: number;
  };
  
  // Speech therapy metrics (if speech domain assessed)
  speechMetrics?: {
    articulation: {
      phonemeAccuracy: number;        // % of phonemes produced correctly
      substitutions: number;          // Count of sound substitutions
      omissions: number;              // Count of sound omissions
      distortions: number;            // Count of sound distortions
      targetSounds: string[];         // Sounds assessed
      errorSounds: string[];          // Sounds with errors
    };
    fluency: {
      stutteringFrequency: number;    // % of syllables stuttered
      disfluencyTypes: string[];      // Types: repetition, prolongation, block
      secondaryBehaviors: string[];   // Associated behaviors
      naturalness: number;            // 1-10 scale
    };
    voice: {
      quality: string;                // Normal, hoarse, breathy, strained
      pitch: string;                  // Appropriate, too high, too low
      loudness: string;               // Appropriate, too loud, too soft
      resonance: string;              // Normal, hyper/hyponasal
    };
    language: {
      expressionScore: number;        // Ability to formulate language
      comprehensionScore: number;     // Ability to understand language
      vocabularyLevel: number;        // Grade equivalency
      sentenceComplexity: number;     // MLU (Mean Length of Utterance)
      narrativeAbility: number;       // Story-telling coherence
    };
    pragmatics: {
      conversationTurns: number;      // Appropriate turn-taking
      topicMaintenance: number;       // Stays on topic
      eyeContact: number;             // Social engagement
      gestureUse: number;             // Non-verbal communication
    };
  };
  
  // Confidence intervals
  confidenceIntervals: Partial<Record<Domain, { lower: number; upper: number }>>;
  
  // Metadata
  modelVersion: string;              // Scoring algorithm version
  itemPoolVersion: string;
}

// Adaptive selection criteria
export interface AdaptiveSelectionCriteria {
  domain: Domain;
  currentTheta: number;              // Current ability estimate
  standardError: number;
  itemsAnswered: number;
  targetAccuracy: number;            // Aim for ~70% correct (optimal info)
  maxItems: number;                  // Stop condition
  minItems: number;
  stopCriterion: 'se' | 'fixed' | 'hybrid';  // When to stop
  targetSE: number;                  // Stop when SE < this (e.g., 0.3)
}

// Item bank configuration
export interface ItemBankConfig {
  gradeBand: GradeBand;
  totalItems: number;
  itemsByDomain: Record<Domain, number>;
  difficultyDistribution: Record<DifficultyLevel, number>;
  exposureControl: boolean;          // Prevent over-exposure of items
  contentBalancing: boolean;         // Ensure sub-domain coverage
}
