import React, { useState } from 'react';
import { OnboardingTask, OnboardingProgress } from '@aivo/types';
import { useLocalStorage } from '@aivo/utils';

const DEFAULT_TASKS: OnboardingTask[] = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your name, photo, and timezone',
    category: 'account',
    priority: 'required',
    completed: false,
    action: {
      label: 'Edit Profile',
      path: '/settings/profile',
    },
  },
  {
    id: 'mfa',
    title: 'Enable Two-Factor Authentication',
    description: 'Secure your account with 2FA and download recovery codes',
    category: 'security',
    priority: 'required',
    completed: false,
    action: {
      label: 'Setup 2FA',
      path: '/settings/security',
    },
    dependencies: ['profile'],
  },
  {
    id: 'learner',
    title: 'Add Your First Learner',
    description: 'Create a learner profile to start personalized learning',
    category: 'content',
    priority: 'required',
    completed: false,
    action: {
      label: 'Add Learner',
      path: '/learners/new',
    },
    dependencies: ['profile'],
  },
  {
    id: 'baseline',
    title: 'Complete Baseline Assessment',
    description: "Help the AI understand your learner's current level",
    category: 'learning',
    priority: 'recommended',
    completed: false,
    action: {
      label: 'Start Assessment',
      path: '/assessment/baseline',
    },
    dependencies: ['learner'],
  },
  {
    id: 'iep',
    title: 'Upload IEP Document',
    description: 'Import IEP goals for personalized learning paths',
    category: 'content',
    priority: 'recommended',
    completed: false,
    action: {
      label: 'Upload IEP',
      path: '/iep/upload',
    },
    dependencies: ['learner'],
  },
  {
    id: 'activity',
    title: 'Complete First Activity',
    description: 'Try out a learning activity with your student',
    category: 'learning',
    priority: 'recommended',
    completed: false,
    action: {
      label: 'Browse Activities',
      path: '/activities',
    },
    dependencies: ['learner', 'baseline'],
  },
  {
    id: 'tour',
    title: 'Take the Platform Tour',
    description: 'Learn about all the features available to you',
    category: 'account',
    priority: 'optional',
    completed: false,
    action: {
      label: 'Start Tour',
      path: '/tour',
    },
  },
  {
    id: 'mobile',
    title: 'Download Mobile App',
    description: 'Access learning on-the-go with our mobile app',
    category: 'account',
    priority: 'optional',
    completed: false,
    action: {
      label: 'Get App',
      path: 'https://apps.aivo.ai',
      external: true,
    },
  },
];

export const OnboardingChecklist: React.FC = () => {
  const [progress, setProgress] = useLocalStorage<OnboardingProgress>('onboarding_progress', {
    userId: 'current-user',
    startedAt: new Date(),
    currentStep: 0,
    totalSteps: DEFAULT_TASKS.filter(t => t.priority === 'required').length,
    tasks: DEFAULT_TASKS,
    dismissed: false,
  });

  const [expanded, setExpanded] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const completedCount = progress.tasks.filter(t => t.completed).length;
  const requiredCount = progress.tasks.filter(t => t.priority === 'required').length;
  const completedRequired = progress.tasks.filter(t => t.priority === 'required' && t.completed).length;
  const percentComplete = Math.round((completedCount / progress.tasks.length) * 100);

  const handleToggleTask = (taskId: string) => {
    setProgress({
      ...progress,
      tasks: progress.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined,
            }
          : task
      ),
    });
  };

  const handleDismiss = () => {
    if (completedRequired < requiredCount) {
      if (!window.confirm("You haven't completed all required tasks. Dismiss anyway?")) {
        return;
      }
    }

    setProgress({
      ...progress,
      dismissed: true,
      completedAt: new Date(),
    });
  };

  const handleReset = () => {
    if (window.confirm('Reset onboarding progress? This will mark all tasks as incomplete.')) {
      setProgress({
        userId: 'current-user',
        startedAt: new Date(),
        currentStep: 0,
        totalSteps: DEFAULT_TASKS.filter(t => t.priority === 'required').length,
        tasks: DEFAULT_TASKS.map(t => ({ ...t, completed: false, completedAt: undefined })),
        dismissed: false,
      });
    }
  };

  if (progress.dismissed && !expanded) {
    return null;
  }

  const filteredTasks = progress.tasks.filter(task => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'incomplete') return !task.completed;
    return task.category === filterCategory;
  });

  const canComplete = (task: OnboardingTask) => {
    if (!task.dependencies) return true;
    return task.dependencies.every(depId =>
      progress.tasks.find(t => t.id === depId)?.completed
    );
  };

  return (
    <div className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50" data-testid="onboarding-checklist">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <h3 className="font-bold text-lg">Getting Started</h3>
            <p className="text-sm text-neutral-600">
              {completedCount} of {progress.tasks.length} tasks completed
              {completedRequired < requiredCount && (
                <span className="ml-2 text-orange-600 font-medium">
                  ({requiredCount - completedRequired} required remaining)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:underline"
            data-testid="toggle-checklist"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            onClick={handleDismiss}
            className="text-sm text-neutral-600 hover:text-neutral-800"
            title="Dismiss checklist"
            data-testid="dismiss-checklist"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="relative w-full h-8 bg-white rounded-lg overflow-hidden border-2 border-neutral-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${percentComplete}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-neutral-700">
              {percentComplete}% Complete
            </span>
          </div>
        </div>
      </div>

      {expanded && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filterCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
              data-testid="filter-all"
            >
              All ({progress.tasks.length})
            </button>
            <button
              onClick={() => setFilterCategory('incomplete')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filterCategory === 'incomplete'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
              data-testid="filter-incomplete"
            >
              Incomplete ({progress.tasks.filter(t => !t.completed).length})
            </button>
            <button
              onClick={() => setFilterCategory('account')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filterCategory === 'account'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setFilterCategory('security')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filterCategory === 'security'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setFilterCategory('content')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filterCategory === 'content'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setFilterCategory('learning')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filterCategory === 'learning'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Learning
            </button>
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {filteredTasks.map(task => {
              const isDisabled = !canComplete(task) && !task.completed;
              const priorityColor =
                task.priority === 'required'
                  ? 'bg-red-100 text-red-800'
                  : task.priority === 'recommended'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-100 text-blue-800';

              return (
                <div
                  key={task.id}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border-2 transition
                    ${task.completed ? 'bg-green-50 border-green-300' : 'bg-white border-neutral-200'}
                    ${isDisabled ? 'opacity-50' : ''}
                  `}
                  data-testid={`task-${task.id}`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    disabled={isDisabled}
                    className="mt-1 w-4 h-4 cursor-pointer"
                    data-testid={`task-checkbox-${task.id}`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold text-sm ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColor}`}>
                        {task.priority}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mb-2">{task.description}</p>

                    {task.dependencies && task.dependencies.length > 0 && !task.completed && (
                      <div className="text-xs text-neutral-500 mb-2">
                        Requires:{' '}
                        {task.dependencies.map((depId, idx) => {
                          const dep = progress.tasks.find(t => t.id === depId);
                          return (
                            <React.Fragment key={depId}>
                              {idx > 0 && ', '}
                              <span className={dep?.completed ? 'text-green-600' : 'text-orange-600'}>
                                {dep?.title}
                                {dep?.completed ? ' ✓' : ''}
                              </span>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {task.completedAt && (
                      <div className="text-xs text-green-700">
                        ✓ Completed {new Date(task.completedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {task.action && !task.completed && canComplete(task) && (
                    <a
                      href={task.action.external ? task.action.path : `#${task.action.path}`}
                      target={task.action.external ? '_blank' : undefined}
                      rel={task.action.external ? 'noopener noreferrer' : undefined}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition whitespace-nowrap"
                      data-testid={`task-action-${task.id}`}
                    >
                      {task.action.label}
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-neutral-500 text-sm">
              No tasks in this category
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-blue-200 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-800 hover:bg-white rounded-lg transition"
              data-testid="reset-checklist"
            >
              Reset Progress
            </button>

            {completedCount === progress.tasks.length && (
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-lg">🎉</span>
                <span className="text-sm font-semibold">All tasks completed!</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
