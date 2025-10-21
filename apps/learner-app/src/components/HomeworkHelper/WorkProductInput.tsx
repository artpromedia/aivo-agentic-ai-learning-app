import { useState, FC } from 'react';
import { HomeworkStep, WorkProduct } from '@aivo/types';
import { homeworkService } from '@aivo/utils';
import { Button } from '@aivo/ui';
import { WritingPad } from '../WritingPad';

interface WorkProductInputProps {
  sessionId: string;
  step: HomeworkStep;
}

type InputMode = 'text' | 'drawing' | 'equation';

export const WorkProductInput: FC<WorkProductInputProps> = ({
  sessionId,
  step,
}) => {
  const [mode, setMode] = useState<InputMode>('text');
  const [textContent, setTextContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!textContent.trim() && mode === 'text') {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const session = homeworkService.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const workProduct: WorkProduct = {
        id: `wp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        step,
        type: mode === 'text' ? 'text' : mode === 'drawing' ? 'drawing' : 'equation',
        content: textContent,
        createdAt: new Date(),
      };

      homeworkService.updateSession(sessionId, {
        workProducts: [...session.workProducts, workProduct],
      });

      setSaveSuccess(true);
      setTextContent('');

      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to save work product:', error);
      alert('Failed to save your work. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-6" data-testid="work-product-input">
      {/* Mode Selection */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('text')}
          className={`
            px-4 py-2 rounded-lg font-medium transition text-sm
            ${mode === 'text'
              ? 'bg-blue-500 text-white'
              : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }
          `}
          data-testid="mode-text"
        >
          📝 Text
        </button>
        <button
          onClick={() => setMode('drawing')}
          className={`
            px-4 py-2 rounded-lg font-medium transition text-sm
            ${mode === 'drawing'
              ? 'bg-blue-500 text-white'
              : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }
          `}
          data-testid="mode-drawing"
        >
          ✏️ Drawing
        </button>
        <button
          onClick={() => setMode('equation')}
          className={`
            px-4 py-2 rounded-lg font-medium transition text-sm
            ${mode === 'equation'
              ? 'bg-blue-500 text-white'
              : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }
          `}
          data-testid="mode-equation"
        >
          📐 Equation
        </button>
      </div>

      {/* Input Areas */}
      {mode === 'text' && (
        <div className="mb-4">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Type your work here... Show your steps and explain your thinking."
            className="w-full p-4 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 outline-none resize-none font-mono"
            rows={8}
            data-testid="text-input"
          />
        </div>
      )}

      {mode === 'drawing' && (
        <div className="mb-4">
          <WritingPad
            storageKey={`homework-${sessionId}-${step}`}
            onSave={(imageData) => {
              setTextContent(imageData);
            }}
          />
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Use the drawing pad to show your work visually. Click &quot;Save Drawing&quot; when done.
          </p>
        </div>
      )}

      {mode === 'equation' && (
        <div className="mb-4">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Enter your equation or formula... Example: x = (b ± √(b² - 4ac)) / 2a"
            className="w-full p-4 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 outline-none resize-none font-mono"
            rows={4}
            data-testid="equation-input"
          />
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Math notation support coming soon! For now, use text-based equations.
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Your work is automatically saved to this homework session.
        </p>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-sm text-green-600 dark:text-green-400">
              ✓ Saved!
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || (mode === 'text' && !textContent.trim())}
            data-testid="save-work"
          >
            {isSaving ? 'Saving...' : '💾 Save Work'}
          </Button>
        </div>
      </div>
    </div>
  );
};
