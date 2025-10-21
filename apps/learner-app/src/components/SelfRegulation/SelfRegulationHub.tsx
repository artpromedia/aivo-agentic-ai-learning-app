/**
 * Self-Regulation Hub Component
 * 
 * Main interface for self-regulation system:
 * - Emotion check-in
 * - Activity recommendations
 * - Activity selection and execution
 * - Calming space for high distress
 */

import React, { useState } from 'react';
import { selfRegulationService } from '@aivo/utils';
import type { EmotionState, RegulationActivity } from '@aivo/types';
import { Button, Card } from '@aivo/ui';
import { EmotionCheckIn } from './EmotionCheckIn';
import { RegulationActivityView } from './RegulationActivity';
import { CalmingSpace } from './CalmingSpace';

export const SelfRegulationHub: React.FC<{
  learnerId: string;
  onClose?: () => void;
}> = ({ learnerId, onClose }) => {
  const [phase, setPhase] = useState<'check-in' | 'select' | 'activity' | 'calming'>('check-in');
  const [emotion, setEmotion] = useState<Omit<EmotionState, 'timestamp'> | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<RegulationActivity | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleCheckInComplete = (emotionState: Omit<EmotionState, 'timestamp'>) => {
    setEmotion(emotionState);
    selfRegulationService.recordEmotion(learnerId, emotionState);

    // If very upset (level 4-5), offer calming space first
    if (emotionState.level >= 4) {
      setPhase('calming');
    } else {
      setPhase('select');
    }
  };

  const handleActivitySelect = (activity: RegulationActivity) => {
    if (!emotion) return;

    setSelectedActivity(activity);
    const session = selfRegulationService.startSession(
      learnerId,
      activity.id,
      { ...emotion, timestamp: new Date() }
    );
    setSessionId(session.id);
    setPhase('activity');
  };

  const handleActivityComplete = (emotionAfter: EmotionState, notes?: string) => {
    if (sessionId) {
      selfRegulationService.completeSession(sessionId, emotionAfter, notes);
    }

    if (onClose) {
      onClose();
    } else {
      // Reset for another activity
      setPhase('check-in');
      setEmotion(null);
      setSelectedActivity(null);
      setSessionId(null);
    }
  };

  const handleBackToSelect = () => {
    setSelectedActivity(null);
    setSessionId(null);
    setPhase('select');
  };

  if (phase === 'calming') {
    return (
      <CalmingSpace
        duration={300} // 5 minutes
        onExit={() => setPhase('select')}
      />
    );
  }

  if (phase === 'check-in') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <EmotionCheckIn
          onComplete={handleCheckInComplete}
          onSkip={onClose}
        />
      </div>
    );
  }

  if (phase === 'activity' && selectedActivity && emotion) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <RegulationActivityView
          activity={selectedActivity}
          emotionBefore={{ ...emotion, timestamp: new Date() }}
          onComplete={handleActivityComplete}
          onBack={handleBackToSelect}
        />
      </div>
    );
  }

  // Activity Selection
  const recommendations = emotion
    ? selfRegulationService.getRecommendations(emotion.emotion)
    : [];
  const allActivities = selfRegulationService.getActivities();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" data-testid="regulation-hub">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Let's Feel Better</h1>
        <p className="text-neutral-600 dark:text-neutral-300">
          Choose an activity to help you feel {emotion?.emotion === 'calm' ? 'even better' : 'calmer'}
        </p>
      </div>

      {/* Recommended */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            ⭐ Recommended for You
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendations.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onSelect={() => handleActivitySelect(activity)}
                highlighted
              />
            ))}
          </div>
        </div>
      )}

      {/* All Activities by Type */}
      <div>
        <h2 className="text-xl font-semibold mb-4 dark:text-white">All Activities</h2>
        
        {/* Breathing Exercises */}
        <ActivitySection
          title="🌬️ Breathing Exercises"
          activities={allActivities.filter(a => a.type === 'breathing')}
          onSelect={handleActivitySelect}
          recommendations={recommendations}
        />

        {/* Movement Breaks */}
        <ActivitySection
          title="💪 Movement Breaks"
          activities={allActivities.filter(a => a.type === 'movement')}
          onSelect={handleActivitySelect}
          recommendations={recommendations}
        />

        {/* Sensory Activities */}
        <ActivitySection
          title="👁️ Sensory Activities"
          activities={allActivities.filter(a => a.type === 'sensory')}
          onSelect={handleActivitySelect}
          recommendations={recommendations}
        />

        {/* Grounding Techniques */}
        <ActivitySection
          title="🔢 Grounding Techniques"
          activities={allActivities.filter(a => a.type === 'grounding')}
          onSelect={handleActivitySelect}
          recommendations={recommendations}
        />

        {/* Visualization */}
        <ActivitySection
          title="🌈 Visualization"
          activities={allActivities.filter(a => a.type === 'visualization')}
          onSelect={handleActivitySelect}
          recommendations={recommendations}
        />
      </div>

      {/* Quick Access to Calming Space */}
      <Card className="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1 dark:text-white">Need a Break Right Now?</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Go to a calming space with no distractions
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setPhase('calming')}
            data-testid="quick-calming-space"
          >
            Take a Break 🌙
          </Button>
        </div>
      </Card>

      {/* Quick Exit */}
      {onClose && (
        <div className="text-center">
          <Button variant="ghost" onClick={onClose} data-testid="close-hub">
            ← Back
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Activity Section Component
 */
const ActivitySection: React.FC<{
  title: string;
  activities: RegulationActivity[];
  onSelect: (activity: RegulationActivity) => void;
  recommendations: RegulationActivity[];
}> = ({ title, activities, onSelect, recommendations }) => {
  if (activities.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">{title}</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {activities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onSelect={() => onSelect(activity)}
            highlighted={recommendations.some(r => r.id === activity.id)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Activity Card Component
 */
const ActivityCard: React.FC<{
  activity: RegulationActivity;
  onSelect: () => void;
  highlighted?: boolean;
}> = ({ activity, onSelect, highlighted }) => {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };

  return (
    <button
      onClick={onSelect}
      className="w-full text-left"
      data-testid={`activity-${activity.id}`}
    >
      <Card
        className={`cursor-pointer hover:shadow-lg transition ${
          highlighted ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
        }`}
      >
        <div className="text-center">
          <div className="text-5xl mb-3">{activity.icon}</div>
          <h3 className="font-bold mb-2 dark:text-white">{activity.name}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            {activity.description}
          </p>

          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>{Math.ceil(activity.duration / 60)} min</span>
            <span className={`px-2 py-1 rounded ${difficultyColors[activity.difficulty]}`}>
              {activity.difficulty}
            </span>
          </div>
        </div>
      </Card>
    </button>
  );
};
