// Executive function support types
export interface VisualTimer {
  id: string;
  name: string;
  duration: number; // in seconds
  type: 'countdown' | 'stopwatch' | 'interval';
  color?: string;
  icon?: string;
  soundAlert: boolean;
  visualAlert: boolean;
  warnings: TimerWarning[];
}

export interface TimerWarning {
  secondsRemaining: number;
  message: string;
  color?: string;
  sound?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  estimatedMinutes?: number;
  dependencies?: string[]; // IDs of subtasks that must be completed first
}

export interface TaskBreakdown {
  id: string;
  learnerId: string;
  mainTask: string;
  subtasks: Subtask[];
  totalEstimatedTime?: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  duration?: number; // in minutes
  completed: boolean;
  status: 'upcoming' | 'current' | 'completed' | 'skipped';
  order: number;
  icon?: string;
  color?: string;
}

export interface VisualSchedule {
  id: string;
  learnerId: string;
  name: string;
  date: string;
  items: ScheduleItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FirstThenBoard {
  id: string;
  learnerId: string;
  firstTask: {
    title: string;
    description?: string;
    icon?: string;
    completed: boolean;
  };
  thenTask: {
    title: string;
    description?: string;
    icon?: string;
    isReward: boolean;
  };
  timer?: {
    duration: number;
    remaining: number;
  };
  createdAt: Date;
  completedAt?: Date;
}
