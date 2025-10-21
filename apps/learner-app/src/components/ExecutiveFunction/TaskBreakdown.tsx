/**
 * Task Breakdown Component
 * 
 * Breaks down complex tasks into manageable subtasks with 3 visual styles:
 * - Checklist: Simple checkbox list
 * - Steps: Numbered sequential steps
 * - Flowchart: Visual dependency map
 * 
 * Features:
 * - Subtask completion tracking
 * - Time estimates per subtask
 * - Dependency management (must complete X before Y)
 * - Progress visualization
 * - Motivational feedback
 */

import React, { useState } from 'react';
import type { TaskBreakdown as ITaskBreakdown, Subtask } from '@aivo/types';
import { Card } from '@aivo/ui';

export const TaskBreakdown: React.FC<{
  breakdown: ITaskBreakdown;
  onChange?: (updated: ITaskBreakdown) => void;
  onComplete?: () => void;
}> = ({ breakdown, onChange, onComplete }) => {
  const [tasks, setTasks] = useState(breakdown.subtasks);

  const handleToggle = (taskId: string) => {
    const newTasks = tasks.map(task => {
      if (task.id === taskId) {
        // Check dependencies before allowing toggle
        if (!task.completed && task.dependencies && task.dependencies.length > 0) {
          const dependenciesMet = task.dependencies.every(depId =>
            tasks.find(t => t.id === depId)?.completed
          );
          if (!dependenciesMet) {
            alert('Please complete the required tasks first!');
            return task;
          }
        }
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    setTasks(newTasks);
    
    const updatedBreakdown = { ...breakdown, subtasks: newTasks };
    if (onChange) {
      onChange(updatedBreakdown);
    }

    // Check if all complete
    if (newTasks.every(t => t.completed) && onComplete) {
      onComplete();
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = (completedCount / totalCount) * 100;

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <Card data-testid="task-breakdown">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">{breakdown.mainTask}</h2>
          <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
            <span>
              {completedCount} of {totalCount} steps complete
            </span>
            <span>⏱️ ~{breakdown.estimatedTime} minutes total</span>
          </div>
        </div>

        {/* Progress Bar */}
        {breakdown.showProgress && (
          <div>
            <div className="w-full h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center text-sm font-medium mt-2 dark:text-white">
              {Math.round(progress)}% Complete
            </div>
          </div>
        )}

        {/* Visual Style Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => onChange?.({ ...breakdown, visualType: 'checklist' })}
            className={`px-3 py-1 rounded text-sm ${
              breakdown.visualType === 'checklist'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-200 dark:bg-neutral-700 dark:text-white'
            }`}
            data-testid="view-checklist"
          >
            ☑️ Checklist
          </button>
          <button
            onClick={() => onChange?.({ ...breakdown, visualType: 'steps' })}
            className={`px-3 py-1 rounded text-sm ${
              breakdown.visualType === 'steps'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-200 dark:bg-neutral-700 dark:text-white'
            }`}
            data-testid="view-steps"
          >
            🔢 Steps
          </button>
          <button
            onClick={() => onChange?.({ ...breakdown, visualType: 'flowchart' })}
            className={`px-3 py-1 rounded text-sm ${
              breakdown.visualType === 'flowchart'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-200 dark:bg-neutral-700 dark:text-white'
            }`}
            data-testid="view-flowchart"
          >
            📊 Flowchart
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {breakdown.visualType === 'checklist' && (
            <ChecklistView tasks={sortedTasks} onToggle={handleToggle} />
          )}
          {breakdown.visualType === 'steps' && (
            <StepsView tasks={sortedTasks} onToggle={handleToggle} />
          )}
          {breakdown.visualType === 'flowchart' && (
            <FlowchartView tasks={sortedTasks} onToggle={handleToggle} />
          )}
        </div>

        {/* Motivational Message */}
        {progress > 0 && progress < 100 && (
          <div className="text-center py-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <p className="font-medium text-blue-700 dark:text-blue-300">
              {progress < 33 && "🌟 Great start! Keep going!"}
              {progress >= 33 && progress < 66 && "💪 You're halfway there!"}
              {progress >= 66 && progress < 100 && "🎯 Almost done! You've got this!"}
            </p>
          </div>
        )}

        {/* Completion Celebration */}
        {progress === 100 && (
          <div className="text-center py-6 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <div className="text-6xl mb-2">🎉</div>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
              All Done!
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              You completed all {totalCount} steps!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Checklist View - Simple checkbox list
 */
const ChecklistView: React.FC<{
  tasks: Subtask[];
  onToggle: (id: string) => void;
}> = ({ tasks, onToggle }) => {
  return (
    <div className="space-y-2" data-testid="checklist-view">
      {tasks.map(task => (
        <button
          key={task.id}
          onClick={() => onToggle(task.id)}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
            task.completed
              ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
              : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600'
          }`}
          data-testid={`task-${task.id}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {task.completed ? (
                <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center text-white text-sm">
                  ✓
                </div>
              ) : (
                <div className="w-6 h-6 rounded border-2 border-neutral-300 dark:border-neutral-600" />
              )}
            </div>
            <div className="flex-1">
              <div className={`font-medium ${task.completed ? 'line-through text-neutral-500' : 'dark:text-white'}`}>
                {task.title}
              </div>
              {task.description && (
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  {task.description}
                </div>
              )}
              <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                ⏱️ ~{task.estimatedMinutes} min
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

/**
 * Steps View - Numbered sequential steps with connecting lines
 */
const StepsView: React.FC<{
  tasks: Subtask[];
  onToggle: (id: string) => void;
}> = ({ tasks, onToggle }) => {
  return (
    <div className="space-y-0" data-testid="steps-view">
      {tasks.map((task, index) => (
        <div key={task.id} className="relative">
          <button
            onClick={() => onToggle(task.id)}
            className="w-full text-left"
            data-testid={`step-${task.id}`}
          >
            <div className="flex items-start gap-4">
              {/* Step Number */}
              <div className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    task.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {task.completed ? '✓' : index + 1}
                </div>
              </div>

              {/* Task Content */}
              <div className={`flex-1 pb-8 ${index < tasks.length - 1 ? 'border-l-2 border-neutral-200 dark:border-neutral-700 -ml-6 pl-10' : ''}`}>
                <div className={`font-medium ${task.completed ? 'line-through text-neutral-500' : 'dark:text-white'}`}>
                  {task.title}
                </div>
                {task.description && (
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {task.description}
                  </div>
                )}
                <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
                  ⏱️ ~{task.estimatedMinutes} minutes
                </div>
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * Flowchart View - Visual dependency map
 */
const FlowchartView: React.FC<{
  tasks: Subtask[];
  onToggle: (id: string) => void;
}> = ({ tasks, onToggle }) => {
  const canComplete = (task: Subtask) => {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    return task.dependencies.every(depId =>
      tasks.find(t => t.id === depId)?.completed
    );
  };

  return (
    <div className="space-y-4" data-testid="flowchart-view">
      {tasks.map(task => {
        const isBlocked = !task.completed && !canComplete(task);
        const dependencies = task.dependencies?.map(depId =>
          tasks.find(t => t.id === depId)?.title
        ).filter(Boolean);

        return (
          <button
            key={task.id}
            onClick={() => onToggle(task.id)}
            disabled={isBlocked}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              task.completed
                ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                : isBlocked
                ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 opacity-50 cursor-not-allowed'
                : 'bg-white dark:bg-neutral-800 border-blue-300 dark:border-blue-600 hover:shadow-lg'
            }`}
            data-testid={`flow-${task.id}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {task.completed ? '✅' : isBlocked ? '🔒' : '📋'}
              </div>
              <div className="flex-1">
                <div className={`font-medium ${task.completed ? 'line-through text-neutral-500' : isBlocked ? 'text-neutral-400' : 'dark:text-white'}`}>
                  {task.title}
                </div>
                {task.description && (
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {task.description}
                  </div>
                )}
                {dependencies && dependencies.length > 0 && (
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                    ⚠️ Requires: {dependencies.join(', ')}
                  </div>
                )}
                <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                  ⏱️ ~{task.estimatedMinutes} min
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
