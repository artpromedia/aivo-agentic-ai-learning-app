/**
 * Comprehensive Neurodiverse Assessment Container
 * Manages the full baseline assessment experience with all accessibility features
 */
import { useEffect, useState } from 'react';
import type { AccessibilityPreferences } from '../../types/accessibility';
import { DEFAULT_ACCESSIBILITY_PREFS } from '../../types/accessibility';
import type { BaselineItem, ItemResponse } from '../../types/baseline';
import { AccessibilityPanel } from './AccessibilityPanel';
import { BreakReminder } from './BreakReminder';
import { ItemRenderer } from './ItemRenderer';

interface AssessmentContainerProps {
  items: BaselineItem[];
  onComplete: (responses: ItemResponse[]) => void;
  gradeBand: 'K-5' | '6-8' | '9-12';
}

export function AssessmentContainer({ items, onComplete, gradeBand }: AssessmentContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<ItemResponse[]>([]);
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    const saved = localStorage.getItem('accessibility_prefs');
    return saved ? JSON.parse(saved) : DEFAULT_ACCESSIBILITY_PREFS;
  });
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);

  // Check for break reminders
  useEffect(() => {
    if (preferences.breakReminders && currentIndex > 0 && currentIndex % 5 === 0) {
      setShowBreakReminder(true);
    }
  }, [currentIndex, preferences.breakReminders]);

  // Break timer
  useEffect(() => {
    if (isOnBreak && breakTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setBreakTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isOnBreak && breakTimeRemaining === 0) {
      setIsOnBreak(false);
    }
  }, [isOnBreak, breakTimeRemaining]);

  const handleItemSubmit = (response: Partial<ItemResponse>) => {
    const fullResponse: ItemResponse = {
      ...response,
      itemId: response.itemId!,
      domain: response.domain!,
      timeStarted: response.timeStarted || new Date(),
      timeSubmitted: response.timeSubmitted || new Date(),
      timeSpentMs: response.timeSpentMs || 0,
      hesitationCount: response.hesitationCount || 0,
      skipped: false,
    };

    setResponses([...responses, fullResponse]);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete([...responses, fullResponse]);
    }
  };

  const handleBreakContinue = () => {
    setShowBreakReminder(false);
  };

  const handleTakeBreak = () => {
    setShowBreakReminder(false);
    setIsOnBreak(true);
    setBreakTimeRemaining(300); // 5 minutes
  };

  const currentItem = items[currentIndex];

  if (!currentItem) {
    return null;
  }

  if (isOnBreak) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="text-6xl">☕</div>
          <h2 className="text-3xl font-bold text-gray-900">Taking a Break</h2>
          <div className="text-6xl font-bold text-purple-600">
            {Math.floor(breakTimeRemaining / 60)}:{(breakTimeRemaining % 60).toString().padStart(2, '0')}
          </div>
          <p className="text-gray-600">Stretch, breathe, or walk around!</p>
          <button
            onClick={() => setIsOnBreak(false)}
            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all"
          >
            I'm Ready to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AccessibilityPanel
        preferences={preferences}
        onPreferencesChange={setPreferences}
        isOpen={showAccessibilityPanel}
        onToggle={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
      />

      <ItemRenderer
        item={currentItem}
        onSubmit={handleItemSubmit}
        preferences={preferences}
        questionNumber={currentIndex + 1}
        totalQuestions={items.length}
      />

      {showBreakReminder && (
        <BreakReminder
          questionsCompleted={currentIndex}
          onContinue={handleBreakContinue}
          onTakeBreak={handleTakeBreak}
          gradeBand={gradeBand}
        />
      )}
    </div>
  );
}
