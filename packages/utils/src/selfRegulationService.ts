/**
 * Self-Regulation Service
 * 
 * Manages emotion tracking, regulation activities, and session management
 * for learners with emotional regulation needs (ASD, ADHD, anxiety).
 * 
 * Features:
 * - 14 evidence-based regulation activities
 * - Emotion history tracking
 * - Activity recommendations based on emotion
 * - Session management and progress tracking
 */

import type { RegulationActivity, EmotionState, RegulationSession } from '@aivo/types';

export class SelfRegulationService {
  private static instance: SelfRegulationService;
  private readonly STORAGE_KEY = 'regulation_sessions';
  private readonly EMOTION_KEY = 'emotion_history';

  private constructor() {}

  static getInstance(): SelfRegulationService {
    if (!SelfRegulationService.instance) {
      SelfRegulationService.instance = new SelfRegulationService();
    }
    return SelfRegulationService.instance;
  }

  /**
   * Get all available regulation activities (14 total)
   */
  getActivities(): RegulationActivity[] {
    return [
      // ===== BREATHING EXERCISES (3) =====
      {
        id: 'box-breathing',
        type: 'breathing',
        name: 'Box Breathing',
        description: 'Breathe in a square pattern to calm down',
        duration: 240, // 4 minutes
        instructions: [
          'Breathe in for 4 seconds',
          'Hold for 4 seconds',
          'Breathe out for 4 seconds',
          'Hold for 4 seconds',
          'Repeat',
        ],
        icon: '🟦',
        difficulty: 'easy',
        bestFor: ['anxiety', 'stress', 'anger'],
        visualSupport: {
          type: 'animation',
          description: 'Animated box that grows and shrinks',
        },
      },
      {
        id: 'belly-breathing',
        type: 'breathing',
        name: 'Belly Breathing',
        description: 'Deep breathing from your belly',
        duration: 180,
        instructions: [
          'Put one hand on your belly',
          'Breathe in slowly through your nose (count to 3)',
          'Feel your belly rise like a balloon',
          'Breathe out slowly through your mouth (count to 3)',
          'Feel your belly go down',
          'Repeat 5 times',
        ],
        icon: '🎈',
        difficulty: 'easy',
        bestFor: ['anxiety', 'panic', 'overstimulation'],
        visualSupport: {
          type: 'animation',
          description: 'Balloon inflating and deflating',
        },
      },
      {
        id: 'five-finger-breathing',
        type: 'breathing',
        name: 'Five Finger Breathing',
        description: 'Trace your hand while breathing',
        duration: 120,
        instructions: [
          'Hold one hand up like a star',
          'Use your other finger to trace',
          'Breathe IN as you trace up a finger',
          'Breathe OUT as you trace down',
          'Do all 5 fingers',
        ],
        icon: '✋',
        difficulty: 'easy',
        bestFor: ['anxiety', 'focus', 'fidgeting'],
        visualSupport: {
          type: 'animation',
          description: 'Hand with tracing animation',
        },
      },

      // ===== MOVEMENT BREAKS (3) =====
      {
        id: 'body-scan',
        type: 'movement',
        name: 'Body Scan',
        description: 'Notice and relax each part of your body',
        duration: 300,
        instructions: [
          'Sit or lie down comfortably',
          'Start at your toes - wiggle them, then relax',
          'Move to your legs - tense them, then relax',
          'Move to your belly - take a deep breath, then relax',
          'Move to your shoulders - shrug them, then relax',
          'Move to your face - scrunch it up, then relax',
          'Notice how your whole body feels relaxed',
        ],
        icon: '🧘',
        difficulty: 'medium',
        bestFor: ['tension', 'stress', 'bedtime'],
      },
      {
        id: 'shake-it-out',
        type: 'movement',
        name: 'Shake It Out',
        description: 'Shake your body to release energy',
        duration: 60,
        instructions: [
          'Stand up with space around you',
          'Shake your hands fast for 10 seconds',
          'Shake your arms for 10 seconds',
          'Shake your legs (one at a time!) for 10 seconds each',
          'Shake your whole body for 10 seconds',
          'Take a deep breath and notice how you feel',
        ],
        icon: '💪',
        difficulty: 'easy',
        bestFor: ['hyperactivity', 'restlessness', 'excess-energy'],
      },
      {
        id: 'wall-pushes',
        type: 'movement',
        name: 'Wall Pushes',
        description: 'Push against a wall for calming pressure',
        duration: 120,
        instructions: [
          'Stand facing a wall, arm\'s length away',
          'Put both hands flat on the wall',
          'Push as hard as you can for 10 seconds',
          'Rest for 5 seconds',
          'Repeat 5 times',
        ],
        icon: '🧱',
        difficulty: 'easy',
        bestFor: ['anxiety', 'sensory-seeking', 'focus'],
      },

      // ===== SENSORY ACTIVITIES (3) =====
      {
        id: 'sensory-grounding',
        type: 'sensory',
        name: '5-4-3-2-1 Grounding',
        description: 'Use your senses to calm down',
        duration: 180,
        instructions: [
          'Name 5 things you can SEE',
          'Name 4 things you can TOUCH',
          'Name 3 things you can HEAR',
          'Name 2 things you can SMELL',
          'Name 1 thing you can TASTE',
        ],
        icon: '👁️',
        difficulty: 'easy',
        bestFor: ['anxiety', 'panic', 'overwhelm'],
      },
      {
        id: 'cold-water',
        type: 'sensory',
        name: 'Cold Water Reset',
        description: 'Cold water on your face or hands',
        duration: 60,
        instructions: [
          'With adult permission, go to a sink',
          'Run cold water',
          'Splash cold water on your face OR',
          'Hold your wrists under cold water for 30 seconds',
          'Notice how the cold helps you feel more alert',
        ],
        icon: '💧',
        difficulty: 'easy',
        bestFor: ['panic', 'meltdown', 'dissociation'],
      },
      {
        id: 'quiet-corner',
        type: 'sensory',
        name: 'Quiet Corner',
        description: 'Find a calm, quiet space',
        duration: 300,
        instructions: [
          'Find a quiet spot (closet, under desk, corner)',
          'Sit comfortably',
          'Close your eyes or look at something calming',
          'Listen to quiet music or white noise (optional)',
          'Stay as long as you need',
        ],
        icon: '🏠',
        difficulty: 'easy',
        bestFor: ['overstimulation', 'overwhelm', 'shutdown'],
      },

      // ===== GROUNDING TECHNIQUES (3) =====
      {
        id: 'math-distraction',
        type: 'grounding',
        name: 'Count Backwards',
        description: 'Count backwards to refocus your brain',
        duration: 120,
        instructions: [
          'Pick a number like 100',
          'Count backwards by 3s: 100, 97, 94...',
          'If you lose track, start over',
          'Keep going until you feel calmer',
        ],
        icon: '🔢',
        difficulty: 'medium',
        bestFor: ['anxiety', 'rumination', 'focus'],
      },
      {
        id: 'alphabet-game',
        type: 'grounding',
        name: 'Alphabet Game',
        description: 'Find things for each letter',
        duration: 180,
        instructions: [
          'Look around the room',
          'Find something that starts with A',
          'Then B, then C...',
          'Keep going through the alphabet',
          'It\'s okay to skip hard letters!',
        ],
        icon: '🔤',
        difficulty: 'easy',
        bestFor: ['anxiety', 'distraction', 'waiting'],
      },
      {
        id: 'category-game',
        type: 'grounding',
        name: 'Category Game',
        description: 'Name things in categories',
        duration: 180,
        instructions: [
          'Pick a category (animals, colors, foods)',
          'Name as many things in that category as you can',
          'Try to think of 10 items',
          'Switch to a new category',
          'Keep going until you feel calmer',
        ],
        icon: '📋',
        difficulty: 'easy',
        bestFor: ['anxiety', 'distraction', 'focus'],
      },

      // ===== VISUALIZATION (2) =====
      {
        id: 'safe-place',
        type: 'visualization',
        name: 'Safe Place Visualization',
        description: 'Imagine your favorite calm place',
        duration: 240,
        instructions: [
          'Close your eyes (or look at something calming)',
          'Think of a place where you feel safe and happy',
          'It can be real or imaginary',
          'Picture what you see, hear, smell, and feel there',
          'Stay in that place in your mind',
          'Take deep breaths while you imagine',
        ],
        icon: '🌈',
        difficulty: 'medium',
        bestFor: ['anxiety', 'stress', 'fear'],
      },
      {
        id: 'balloon-worries',
        type: 'visualization',
        name: 'Balloon Worries',
        description: 'Let your worries float away',
        duration: 180,
        instructions: [
          'Think of something worrying you',
          'Imagine putting that worry into a balloon',
          'Picture the balloon floating up, up, up into the sky',
          'Watch it get smaller and smaller',
          'Until it\'s so tiny you can\'t see it anymore',
          'Repeat with other worries',
        ],
        icon: '🎈',
        difficulty: 'medium',
        bestFor: ['anxiety', 'worry', 'rumination'],
      },
    ];
  }

  /**
   * Record an emotion check-in
   */
  recordEmotion(learnerId: string, emotion: Omit<EmotionState, 'timestamp'>): void {
    try {
      const history = this.getEmotionHistory(learnerId);
      history.push({
        ...emotion,
        timestamp: new Date(),
      });

      // Keep last 100 emotions
      const trimmed = history.slice(-100);
      
      localStorage.setItem(
        `${this.EMOTION_KEY}_${learnerId}`,
        JSON.stringify(trimmed)
      );
    } catch (error) {
      console.error('Failed to record emotion:', error);
    }
  }

  /**
   * Get emotion history for a learner
   */
  getEmotionHistory(learnerId: string): EmotionState[] {
    try {
      const stored = localStorage.getItem(`${this.EMOTION_KEY}_${learnerId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get most recent emotion
   */
  getCurrentEmotion(learnerId: string): EmotionState | null {
    const history = this.getEmotionHistory(learnerId);
    return history.length > 0 ? history[history.length - 1] : null;
  }

  /**
   * Start a regulation activity session
   */
  startSession(
    learnerId: string,
    activityId: string,
    emotionBefore: EmotionState
  ): RegulationSession {
    const session: RegulationSession = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      learnerId,
      activityId,
      startTime: new Date(),
      emotionBefore,
      completed: false,
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Complete a regulation session
   */
  completeSession(
    sessionId: string,
    emotionAfter: EmotionState,
    notes?: string
  ): void {
    const sessions = this.getAllSessions();
    const index = sessions.findIndex(s => s.id === sessionId);

    if (index >= 0) {
      sessions[index] = {
        ...sessions[index],
        endTime: new Date(),
        emotionAfter,
        completed: true,
        notes,
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));

      // Also record the emotion
      this.recordEmotion(sessions[index].learnerId, emotionAfter);
    }
  }

  /**
   * Save a session to storage
   */
  private saveSession(session: RegulationSession): void {
    const sessions = this.getAllSessions();
    sessions.push(session);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
  }

  /**
   * Get all sessions from storage
   */
  private getAllSessions(): RegulationSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get sessions for a specific learner
   */
  getSessions(learnerId: string): RegulationSession[] {
    return this.getAllSessions()
      .filter(s => s.learnerId === learnerId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  /**
   * Get activity recommendations based on emotion
   */
  getRecommendations(emotion: EmotionState['emotion']): RegulationActivity[] {
    const activities = this.getActivities();
    
    // Map emotions to regulation needs
    const needsMap: Record<string, string[]> = {
      anxious: ['anxiety', 'worry', 'panic', 'stress'],
      angry: ['anger', 'frustration'],
      frustrated: ['frustration', 'anger'],
      sad: ['sadness', 'low-energy'],
      tired: ['focus', 'energy'],
      excited: ['hyperactivity', 'excess-energy', 'focus'],
      calm: [], // Already calm
      happy: [], // Already good
    };

    const needs = needsMap[emotion] || [];
    
    return activities
      .filter(a => a.bestFor.some(b => needs.includes(b)))
      .slice(0, 3); // Top 3 recommendations
  }

  /**
   * Get activity by ID
   */
  getActivity(activityId: string): RegulationActivity | undefined {
    return this.getActivities().find(a => a.id === activityId);
  }

  /**
   * Get emotion statistics for a learner
   */
  getEmotionStats(learnerId: string, days: number = 7): {
    mostCommon: EmotionState['emotion'];
    averageLevel: number;
    totalCheckIns: number;
    improvements: number; // Sessions where emotion improved
  } {
    const history = this.getEmotionHistory(learnerId);
    const sessions = this.getSessions(learnerId);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recentEmotions = history.filter(
      e => new Date(e.timestamp) >= cutoff
    );

    if (recentEmotions.length === 0) {
      return {
        mostCommon: 'calm',
        averageLevel: 3,
        totalCheckIns: 0,
        improvements: 0,
      };
    }

    // Most common emotion
    const emotionCounts: Record<string, number> = {};
    recentEmotions.forEach(e => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });
    const mostCommon = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)[0][0] as EmotionState['emotion'];

    // Average level
    const averageLevel = recentEmotions.reduce((sum, e) => sum + e.level, 0) / recentEmotions.length;

    // Count improvements
    const improvements = sessions.filter(s => {
      if (!s.emotionAfter || !s.completed) return false;
      return s.emotionAfter.level < s.emotionBefore.level;
    }).length;

    return {
      mostCommon,
      averageLevel: Math.round(averageLevel * 10) / 10,
      totalCheckIns: recentEmotions.length,
      improvements,
    };
  }
}

export const selfRegulationService = SelfRegulationService.getInstance();
