import { useState, FC } from 'react';
import { HomeworkSession } from '@aivo/types';
import { Card, Input, Button } from '@aivo/ui';

interface PlanStepProps {
  session: HomeworkSession;
  onComplete: () => void;
}

export const PlanStep: FC<PlanStepProps> = ({ session }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [customStrategy, setCustomStrategy] = useState('');
  const [steps, setSteps] = useState<Array<{ step: string; estimated: number }>>([
    { step: '', estimated: 5 },
  ]);
  const [similarProblem, setSimilarProblem] = useState('');

  const strategies = [
    {
      id: 'draw',
      name: 'Draw a Diagram or Picture',
      icon: '🎨',
      description: 'Visualize the problem with drawings, charts, or graphs',
      bestFor: ['Math', 'Science'],
    },
    {
      id: 'equation',
      name: 'Write an Equation',
      icon: '🔢',
      description: 'Express the problem mathematically',
      bestFor: ['Math'],
    },
    {
      id: 'outline',
      name: 'Create an Outline',
      icon: '📋',
      description: 'Organize your thoughts with bullet points or structure',
      bestFor: ['ELA', 'History'],
    },
    {
      id: 'table',
      name: 'Make a Table or Chart',
      icon: '📊',
      description: 'Organize data systematically',
      bestFor: ['Math', 'Science'],
    },
    {
      id: 'break-down',
      name: 'Break into Smaller Parts',
      icon: '🧩',
      description: 'Divide complex problems into manageable pieces',
      bestFor: ['Math', 'Science', 'ELA'],
    },
    {
      id: 'research',
      name: 'Research & Gather Evidence',
      icon: '🔍',
      description: 'Find relevant information and sources',
      bestFor: ['ELA', 'History', 'Science'],
    },
  ];

  const addStep = () => {
    setSteps([...steps, { step: '', estimated: 5 }]);
  };

  const updateStep = (index: number, field: 'step' | 'estimated', value: string | number) => {
    const updated = [...steps];
    if (updated[index]) {
      updated[index][field] = value as never;
    }
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const totalTime = steps.reduce((sum, s) => sum + s.estimated, 0);

  const relevantStrategies = strategies.filter(
    (s) => !session.detectedSubject || s.bestFor.includes(session.detectedSubject)
  );

  return (
    <div className="space-y-6" data-testid="plan-step">
      <div>
        <h2 className="text-2xl font-bold mb-2">📋 Plan Your Approach</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Choose a strategy and break down your work into smaller steps.
        </p>
      </div>

      {/* Strategy Selection */}
      <div>
        <h3 className="font-semibold mb-3">1. Choose your strategy:</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {relevantStrategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className={`
                text-left p-4 rounded-xl border-2 transition
                ${
                  selectedStrategy === strategy.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }
              `}
              data-testid={`strategy-${strategy.id}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{strategy.icon}</span>
                <div className="flex-1">
                  <div className="font-medium mb-1">{strategy.name}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {strategy.description}
                  </div>
                </div>
                {selectedStrategy === strategy.id && (
                  <span className="text-blue-600 dark:text-blue-400 text-xl">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Strategy */}
        <div className="mt-3">
          <label className="block text-sm font-medium mb-2">Or describe your own strategy:</label>
          <Input
            placeholder="Describe how you'll approach this..."
            value={customStrategy}
            onChange={(e) => setCustomStrategy(e.target.value)}
            data-testid="custom-strategy"
          />
        </div>
      </div>

      {/* Break into Steps */}
      <div>
        <h3 className="font-semibold mb-3">2. Break it into steps:</h3>
        <div className="space-y-3">
          {steps.map((stepItem, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-3">
                {index + 1}.
              </span>
              <Input
                placeholder={`What will you do in step ${index + 1}?`}
                value={stepItem.step}
                onChange={(e) => updateStep(index, 'step', e.target.value)}
                className="flex-1"
                data-testid={`step-${index}`}
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={stepItem.estimated}
                  onChange={(e) => updateStep(index, 'estimated', parseInt(e.target.value) || 5)}
                  className="w-16 px-2 py-2 border-2 rounded-lg text-center dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                  data-testid={`time-${index}`}
                />
                <span className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                  min
                </span>
              </div>
              {steps.length > 1 && (
                <button
                  onClick={() => removeStep(index)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  data-testid={`remove-step-${index}`}
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addStep} className="mt-3" data-testid="add-step">
          + Add Another Step
        </Button>

        {/* Time Estimate */}
        {totalTime > 0 && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Estimated total time:</span>
              <span className="ml-2 text-lg font-bold text-purple-700 dark:text-purple-300">
                {totalTime} minutes
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Similar Problems */}
      <div>
        <h3 className="font-semibold mb-3">3. Have you solved something similar before?</h3>
        <textarea
          className="w-full h-20 px-4 py-3 border-2 rounded-xl resize-none focus:border-blue-500 focus:outline-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
          placeholder="Describe a similar problem and what strategy worked..."
          value={similarProblem}
          onChange={(e) => setSimilarProblem(e.target.value)}
          data-testid="similar-problem"
        />
      </div>

      {/* Planning Checklist */}
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <h4 className="font-semibold mb-3">Planning Checklist:</h4>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!selectedStrategy || !!customStrategy}
              readOnly
              className="w-4 h-4"
            />
            <span>Chosen a strategy</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={steps.some((s) => s.step.trim())}
              readOnly
              className="w-4 h-4"
            />
            <span>Broken down into steps</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={totalTime > 0} readOnly className="w-4 h-4" />
            <span>Estimated time needed</span>
          </label>
        </div>
      </Card>
    </div>
  );
};
