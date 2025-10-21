import { useState, FC } from 'react';
import { HomeworkSession } from '@aivo/types';
import { Card } from '@aivo/ui';

interface CheckStepProps {
  session: HomeworkSession;
  reflection: string;
  onReflectionChange: (value: string) => void;
}

export const CheckStep: FC<CheckStepProps> = ({ session, reflection, onReflectionChange }) => {
  const [checklist, setChecklist] = useState({
    answersQuestion: false,
    showsWork: false,
    unitsCorrect: false,
    makesSense: false,
    alternativeMethod: false,
  });

  const [confidence, setConfidence] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [improvements, setImprovements] = useState('');

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  const completedChecks = Object.values(checklist).filter(Boolean).length;
  const totalChecks = Object.keys(checklist).length;

  return (
    <div className="space-y-6" data-testid="check-step">
      <div>
        <h2 className="text-2xl font-bold mb-2">✅ Check & Reflect</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Review your work and think about what you learned.
        </p>
      </div>

      {/* Quality Checklist */}
      <Card>
        <h3 className="font-semibold mb-3">Quality Check:</h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.answersQuestion}
              onChange={() => handleChecklistChange('answersQuestion')}
              className="w-5 h-5 mt-0.5"
              data-testid="check-answers"
            />
            <div>
              <div className="font-medium">Answers the question completely</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                Did you address all parts of the problem?
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.showsWork}
              onChange={() => handleChecklistChange('showsWork')}
              className="w-5 h-5 mt-0.5"
              data-testid="check-work"
            />
            <div>
              <div className="font-medium">Shows all work and reasoning</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                Can someone else follow your steps?
              </div>
            </div>
          </label>

          {session.detectedSubject === 'Math' && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.unitsCorrect}
                onChange={() => handleChecklistChange('unitsCorrect')}
                className="w-5 h-5 mt-0.5"
                data-testid="check-units"
              />
              <div>
                <div className="font-medium">Units are correct</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Did you include and label units properly?
                </div>
              </div>
            </label>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.makesSense}
              onChange={() => handleChecklistChange('makesSense')}
              className="w-5 h-5 mt-0.5"
              data-testid="check-sense"
            />
            <div>
              <div className="font-medium">Answer makes sense</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                Is your answer reasonable? Does it fit the context?
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checklist.alternativeMethod}
              onChange={() => handleChecklistChange('alternativeMethod')}
              className="w-5 h-5 mt-0.5"
              data-testid="check-alternative"
            />
            <div>
              <div className="font-medium">Verified with alternative method (optional)</div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                Did you double-check using a different approach?
              </div>
            </div>
          </label>
        </div>

        {/* Progress */}
        <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Checklist Progress:</span>
            <span className="font-bold">
              {completedChecks} / {totalChecks} checks
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(completedChecks / totalChecks) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Confidence Level */}
      <Card>
        <h3 className="font-semibold mb-3">How confident are you in your answer?</h3>
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setConfidence(level as 1 | 2 | 3 | 4 | 5)}
              className={`
                flex-1 px-4 py-3 rounded-xl border-2 font-medium transition
                ${
                  confidence === level
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }
              `}
              data-testid={`confidence-${level}`}
            >
              <div className="text-2xl mb-1">
                {level === 1 && '😰'}
                {level === 2 && '😕'}
                {level === 3 && '😐'}
                {level === 4 && '😊'}
                {level === 5 && '🤩'}
              </div>
              <div className="text-xs">{level}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center mt-2">
          1 = Not confident | 5 = Very confident
        </p>
      </Card>

      {/* Reflection */}
      <Card>
        <h3 className="font-semibold mb-3">Explain your reasoning:</h3>
        <textarea
          className="w-full h-24 px-4 py-3 border-2 rounded-xl resize-none focus:border-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
          placeholder="In one or two sentences, explain how you solved this problem..."
          value={reflection}
          onChange={(e) => onReflectionChange(e.target.value)}
          data-testid="reflection-text"
        />
      </Card>

      {/* What Would You Do Differently */}
      <Card>
        <h3 className="font-semibold mb-3">What would you try differently next time?</h3>
        <textarea
          className="w-full h-20 px-4 py-3 border-2 rounded-xl resize-none focus:border-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
          placeholder="What did you learn? What could be improved?"
          value={improvements}
          onChange={(e) => setImprovements(e.target.value)}
          data-testid="improvements"
        />
      </Card>

      {/* Completion Summary */}
      {completedChecks >= 3 && reflection && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <h4 className="font-semibold mb-2">Great work!</h4>
              <p className="text-sm">
                You&apos;ve completed the homework and reflected on your learning. Ready to submit?
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
