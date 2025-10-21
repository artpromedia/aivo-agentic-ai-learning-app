import { useState, FC } from 'react';
import { HomeworkSession } from '@aivo/types';
import { Card, Button } from '@aivo/ui';
import { WritingPad } from '../../WritingPad';

interface SolveStepProps {
  session: HomeworkSession;
  onComplete: () => void;
}

export const SolveStep: FC<SolveStepProps> = ({ session }) => {
  const [workMethod, setWorkMethod] = useState<'draw' | 'type'>('draw');
  const [typedWork, setTypedWork] = useState('');

  return (
    <div className="space-y-6" data-testid="solve-step">
      <div>
        <h2 className="text-2xl font-bold mb-2">✍️ Solve It!</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Show your work step by step. You can draw or type your solution.
        </p>
      </div>

      {/* Work Method Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setWorkMethod('draw')}
          className={`
            flex-1 px-4 py-3 rounded-xl border-2 font-medium transition
            ${
              workMethod === 'draw'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
            }
          `}
          data-testid="method-draw"
        >
          🎨 Draw/Write
        </button>
        <button
          onClick={() => setWorkMethod('type')}
          className={`
            flex-1 px-4 py-3 rounded-xl border-2 font-medium transition
            ${
              workMethod === 'type'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
            }
          `}
          data-testid="method-type"
        >
          ⌨️ Type
        </button>
      </div>

      {/* Drawing Pad */}
      {workMethod === 'draw' && (
        <Card>
          <h3 className="font-semibold mb-3">Show your work:</h3>
          <WritingPad
            storageKey={`homework_solve_${session.id}`}
            onSave={(imageData) => {
              console.log('Work saved:', imageData);
            }}
          />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            💡 Your work is automatically saved
          </p>
        </Card>
      )}

      {/* Typed Work */}
      {workMethod === 'type' && (
        <Card>
          <h3 className="font-semibold mb-3">Type your solution:</h3>
          <textarea
            className="w-full h-64 px-4 py-3 border-2 rounded-xl font-mono resize-none focus:border-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
            placeholder="Show each step of your work here..."
            value={typedWork}
            onChange={(e) => setTypedWork(e.target.value)}
            data-testid="typed-work"
          />
        </Card>
      )}

      {/* Calculator Tool */}
      {session.settings?.allowCalculator && session.detectedSubject === 'Math' && (
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">🧮 Calculator Available</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                You can use a calculator for computations, but show your reasoning.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://www.desmos.com/calculator', '_blank')}
            >
              Open Calculator
            </Button>
          </div>
        </Card>
      )}

      {/* Work Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold mb-2">💡 Tips for showing your work:</h4>
        <ul className="text-sm space-y-1 list-disc pl-5">
          <li>Write down every step, even if it seems obvious</li>
          <li>Label your work so you can follow it later</li>
          <li>If you make a mistake, don&apos;t erase it—learn from it!</li>
          <li>Check your calculations as you go</li>
          <li>Ask for a hint if you get stuck</li>
        </ul>
      </Card>
    </div>
  );
};
