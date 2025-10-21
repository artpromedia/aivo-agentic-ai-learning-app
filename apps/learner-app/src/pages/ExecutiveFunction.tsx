/**
 * Executive Function Tools Hub Page
 * 
 * Central page providing access to all executive function scaffolds
 */

import React, { useState } from 'react';
import { Card, Button } from '@aivo/ui';
import { VisualTimer, TaskBreakdown, FirstThenBoard, VisualSchedule } from '../components/ExecutiveFunction';
import type { VisualTimer as IVisualTimer, TaskBreakdown as ITaskBreakdown, FirstThenBoard as IFirstThenBoard, VisualSchedule as IVisualSchedule } from '@aivo/types';

type ToolType = 'timer' | 'task' | 'first-then' | 'schedule' | null;

export const ExecutiveFunctionPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(null);

  if (activeTool === null) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6" data-testid="executive-function-hub">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Organization Tools</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Choose a tool to help you stay organized and on track!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ToolCard
            icon="⏰"
            title="Visual Timer"
            description="See time passing with fun visual timers"
            onClick={() => setActiveTool('timer')}
            testId="select-timer"
          />
          <ToolCard
            icon="✓"
            title="Task Breakdown"
            description="Break big tasks into small steps"
            onClick={() => setActiveTool('task')}
            testId="select-task"
          />
          <ToolCard
            icon="➡️"
            title="First-Then Board"
            description="First do this, then do that!"
            onClick={() => setActiveTool('first-then')}
            testId="select-first-then"
          />
          <ToolCard
            icon="📅"
            title="Visual Schedule"
            description="See your whole day at a glance"
            onClick={() => setActiveTool('schedule')}
            testId="select-schedule"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => setActiveTool(null)}
        className="mb-4"
        data-testid="back-to-hub"
      >
        ← Back to Tools
      </Button>

      {activeTool === 'timer' && (
        <VisualTimer
          timer={getExampleTimer()}
          onComplete={() => alert('Timer complete!')}
          onCancel={() => setActiveTool(null)}
        />
      )}

      {activeTool === 'task' && (
        <TaskBreakdown
          breakdown={getExampleTask()}
          onComplete={() => alert('All tasks complete!')}
        />
      )}

      {activeTool === 'first-then' && (
        <FirstThenBoard
          board={getExampleFirstThen()}
          onComplete={() => alert('Both activities complete!')}
        />
      )}

      {activeTool === 'schedule' && (
        <VisualSchedule schedule={getExampleSchedule()} />
      )}
    </div>
  );
};

const ToolCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  testId: string;
}> = ({ icon, title, description, onClick, testId }) => {
  return (
    <button
      onClick={onClick}
      className="text-left"
      data-testid={testId}
    >
      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h3 className="font-bold text-xl mb-2 dark:text-white">{title}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        </div>
      </Card>
    </button>
  );
};

// Example data functions
function getExampleTimer(): IVisualTimer {
  return {
    id: 'timer-1',
    name: 'Homework Time',
    duration: 600, // 10 minutes
    style: 'pie',
    warnings: [
      { secondsRemaining: 300, message: '5 minutes left!' },
      { secondsRemaining: 60, message: '1 minute left!' },
    ],
    soundEnabled: true,
    vibrationEnabled: false,
    autoStart: false,
    color: '#3b82f6',
  };
}

function getExampleTask(): ITaskBreakdown {
  return {
    id: 'task-1',
    mainTask: 'Complete Math Homework',
    estimatedTime: 30,
    visualType: 'checklist',
    showProgress: true,
    subtasks: [
      {
        id: 'st-1',
        title: 'Get materials',
        description: 'Get pencil, paper, and math book',
        estimatedMinutes: 2,
        completed: false,
        order: 1,
      },
      {
        id: 'st-2',
        title: 'Read instructions',
        description: 'Read what the assignment asks',
        estimatedMinutes: 3,
        completed: false,
        order: 2,
        dependencies: ['st-1'],
      },
      {
        id: 'st-3',
        title: 'Do problems 1-5',
        estimatedMinutes: 10,
        completed: false,
        order: 3,
        dependencies: ['st-2'],
      },
      {
        id: 'st-4',
        title: 'Check your work',
        description: 'Go back and check each answer',
        estimatedMinutes: 5,
        completed: false,
        order: 4,
        dependencies: ['st-3'],
      },
      {
        id: 'st-5',
        title: 'Put homework in backpack',
        estimatedMinutes: 1,
        completed: false,
        order: 5,
        dependencies: ['st-4'],
      },
    ],
  };
}

function getExampleFirstThen(): IFirstThenBoard {
  return {
    id: 'ft-1',
    first: {
      name: 'Do Homework',
      icon: '📚',
      duration: 30,
    },
    then: {
      name: 'Play Games',
      icon: '🎮',
      duration: 20,
    },
    visualStyle: 'simple',
    showTimer: false,
  };
}

function getExampleSchedule(): IVisualSchedule {
  return {
    id: 'schedule-1',
    name: 'After School Routine',
    currentIndex: 0,
    showTimeEstimates: true,
    allowReordering: false,
    items: [
      {
        id: 'item-1',
        activity: 'Snack Time',
        icon: '🍎',
        duration: 10,
        status: 'current',
        order: 1,
      },
      {
        id: 'item-2',
        activity: 'Do Homework',
        icon: '📚',
        duration: 30,
        status: 'upcoming',
        order: 2,
      },
      {
        id: 'item-3',
        activity: 'Play Outside',
        icon: '⚽',
        duration: 30,
        status: 'upcoming',
        order: 3,
      },
      {
        id: 'item-4',
        activity: 'Dinner',
        icon: '🍝',
        duration: 30,
        status: 'upcoming',
        order: 4,
      },
      {
        id: 'item-5',
        activity: 'Bath Time',
        icon: '🛁',
        duration: 20,
        status: 'upcoming',
        order: 5,
      },
      {
        id: 'item-6',
        activity: 'Bedtime',
        icon: '🌙',
        duration: 30,
        status: 'upcoming',
        order: 6,
      },
    ],
  };
}
