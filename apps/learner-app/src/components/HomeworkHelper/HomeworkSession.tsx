import { useState, useEffect, FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { homeworkService } from '@aivo/utils';
import { HomeworkSession as IHomeworkSession, HomeworkStep } from '@aivo/types';
import { Button, Card } from '@aivo/ui';
import { UnderstandStep, PlanStep, SolveStep, CheckStep } from './steps';

const STEPS: { id: HomeworkStep; title: string; icon: string }[] = [
  { id: 'understand', title: 'Understand', icon: '🤔' },
  { id: 'plan', title: 'Plan', icon: '📋' },
  { id: 'solve', title: 'Solve', icon: '✍️' },
  { id: 'check', title: 'Check', icon: '✅' },
];

export const HomeworkSession: FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<IHomeworkSession | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (sessionId) {
      const loadedSession = homeworkService.getSession(sessionId);
      setSession(loadedSession);
    }
  }, [sessionId]);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <h2 className="text-xl font-bold mb-4">Session Not Found</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            The homework session you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => navigate('/homework-helper')}>
            Back to Homework Helper
          </Button>
        </Card>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === session.currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleStepChange = (step: HomeworkStep) => {
    homeworkService.updateSession(session.id, { currentStep: step });
    setSession({ ...session, currentStep: step });
    setHint(null);
    setExplanation(null);
  };

  const handleCompleteStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStepData = STEPS[nextIndex];
      if (!nextStepData) return;
      
      const nextStep = nextStepData.id;
      const completedSteps = [...session.completedSteps, session.currentStep];
      
      homeworkService.updateSession(session.id, {
        currentStep: nextStep,
        completedSteps,
      });
      
      setSession({
        ...session,
        currentStep: nextStep,
        completedSteps,
      });
      
      setHint(null);
      setExplanation(null);
    } else {
      // Complete the session
      homeworkService.updateSession(session.id, {
        status: 'completed',
        completedSteps: [...session.completedSteps, session.currentStep],
      });
      
      navigate('/homework-helper?completed=true');
    }
  };

  const handleRequestHint = async () => {
    const hintText = await homeworkService.requestHint(session.id);
    setHint(hintText);
  };

  const handleRequestExplanation = async () => {
    const explanationText = await homeworkService.explainStep(session.id, session.currentStep);
    setExplanation(explanationText);
  };

  const handleSettingChange = (key: keyof IHomeworkSession['settings'], value: boolean) => {
    const updatedSettings = {
      ...session.settings,
      [key]: value,
    };
    
    homeworkService.updateSession(session.id, { settings: updatedSettings });
    setSession({ ...session, settings: updatedSettings });
  };

  return (
    <div className="max-w-7xl mx-auto p-6" data-testid="homework-session">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{session.title}</h1>
            <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
              {session.detectedSubject && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                  {session.detectedSubject}
                </span>
              )}
              {session.targetLevel && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
                  Level: {session.targetLevel}
                </span>
              )}
              <span>Started {new Date(session.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              data-testid="toggle-settings"
            >
              ⚙️ Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/homework-helper')}
              data-testid="exit-session"
            >
              Exit
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-neutral-900 dark:text-white">
            Step {currentStepIndex + 1} of {STEPS.length} • {Math.round(progress)}%
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Step Navigation */}
          <Card>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {STEPS.map((step, index) => {
                const isCompleted = session.completedSteps.includes(step.id);
                const isCurrent = session.currentStep === step.id;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepChange(step.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition whitespace-nowrap
                      ${isCurrent 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' 
                        : isCompleted
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                      }
                    `}
                    data-testid={`step-${step.id}`}
                  >
                    <span className="text-2xl">{step.icon}</span>
                    <span className="font-medium">
                      {index + 1}. {step.title}
                    </span>
                    {isCompleted && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Step Content */}
          <Card>
            <StepContent
              session={session}
              onComplete={handleCompleteStep}
              onRequestHint={handleRequestHint}
              onRequestExplanation={handleRequestExplanation}
            />
          </Card>

          {/* Hints & Explanations */}
          {(hint || explanation) && (
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <span className="text-3xl">💡</span>
                <div className="flex-1">
                  {hint && (
                    <div className="mb-3">
                      <h4 className="font-semibold mb-2">Hint:</h4>
                      <p className="text-sm">{hint}</p>
                    </div>
                  )}
                  {explanation && (
                    <div>
                      <h4 className="font-semibold mb-2">Explanation:</h4>
                      <p className="text-sm whitespace-pre-wrap">{explanation}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setHint(null);
                    setExplanation(null);
                  }}
                  className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  aria-label="Close hint"
                >
                  ✕
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Settings Panel */}
          {showSettings && (
            <Card>
              <h3 className="font-semibold mb-4">Session Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Read Aloud</span>
                  <input
                    type="checkbox"
                    checked={session.settings.readAloud}
                    onChange={(e) => handleSettingChange('readAloud', e.target.checked)}
                    className="w-5 h-5"
                    data-testid="setting-read-aloud"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm">Parent Assist Mode</span>
                  <input
                    type="checkbox"
                    checked={session.settings.parentAssistMode}
                    onChange={(e) => handleSettingChange('parentAssistMode', e.target.checked)}
                    className="w-5 h-5"
                    data-testid="setting-parent-assist"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm">Show Hints</span>
                  <input
                    type="checkbox"
                    checked={session.settings.showHints}
                    onChange={(e) => handleSettingChange('showHints', e.target.checked)}
                    className="w-5 h-5"
                    data-testid="setting-show-hints"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-sm">Allow Calculator</span>
                  <input
                    type="checkbox"
                    checked={session.settings.allowCalculator}
                    onChange={(e) => handleSettingChange('allowCalculator', e.target.checked)}
                    className="w-5 h-5"
                    data-testid="setting-allow-calculator"
                  />
                </label>
              </div>
            </Card>
          )}

          {/* Problem Statement */}
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <h3 className="font-semibold mb-2">📝 Problem</h3>
            <p className="text-sm">{session.problemStatement}</p>
          </Card>

          {/* Key Questions */}
          {session.keyQuestions.length > 0 && (
            <Card>
              <h3 className="font-semibold mb-2">Key Questions</h3>
              <ul className="text-sm space-y-1 list-disc pl-5">
                {session.keyQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Attachments */}
          {session.files.length > 0 && (
            <Card>
              <h3 className="font-semibold mb-2">Attachments</h3>
              <div className="space-y-2">
                {session.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded"
                  >
                    <span className="text-xl">
                      {file.type.startsWith('image/') ? '📷' : '📄'}
                    </span>
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    {file.ocrStatus === 'completed' && (
                      <span className="text-green-600 dark:text-green-400 text-xs">✓ OCR</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Progress Stats */}
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <h3 className="font-semibold mb-3">Progress</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Steps Completed:</span>
                <span className="font-semibold">
                  {session.completedSteps.length} / {STEPS.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hints Used:</span>
                <span className="font-semibold">{session.hintsGiven}</span>
              </div>
              <div className="flex justify-between">
                <span>Work Products:</span>
                <span className="font-semibold">{session.workProducts.length}</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

// Step Content Component
const StepContent: FC<{
  session: IHomeworkSession;
  onComplete: () => void;
  onRequestHint: () => void;
  onRequestExplanation: () => void;
}> = ({ session, onComplete, onRequestHint, onRequestExplanation }) => {
  const [reflection, setReflection] = useState('');

  const renderStepContent = () => {
    switch (session.currentStep) {
      case 'understand':
        return <UnderstandStep session={session} onComplete={onComplete} />;
      case 'plan':
        return <PlanStep session={session} onComplete={onComplete} />;
      case 'solve':
        return <SolveStep session={session} onComplete={onComplete} />;
      case 'check':
        return (
          <CheckStep session={session} reflection={reflection} onReflectionChange={setReflection} />
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderStepContent()}

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-2">
          {session.settings.showHints && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestHint}
              data-testid="request-hint"
            >
              💡 Get Hint
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestExplanation}
            data-testid="request-explanation"
          >
            📖 Explain This Step
          </Button>
        </div>

        <Button
          variant="primary"
          onClick={onComplete}
          data-testid="complete-step"
        >
          {session.currentStep === 'check' ? '🎉 Finish Homework' : 'Next Step →'}
        </Button>
      </div>
    </div>
  );
};
