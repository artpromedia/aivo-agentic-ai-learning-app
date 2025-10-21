/**
 * Executive Function Support Types
 * 
 * Comprehensive scaffolds for learners with executive function challenges
 * including ADHD, ASD, and other learning disabilities.
 * 
 * Features:
 * - Visual timers (5 styles)
 * - Task breakdown and sequencing
 * - First-then boards
 * - Visual schedules
 * - Transition warnings
 */

export interface TimerWarning {
  secondsRemaining: number;
  message: string;
  sound?: 'beep' | 'chime' | 'voice';
  visual?: 'flash' | 'shake' | 'color-change';
}

export interface VisualTimer {
  id: string;
  name: string;
  duration: number; // seconds
  style: 'pie' | 'bar' | 'hourglass' | 'traffic-light' | 'countdown';
  warnings: TimerWarning[];
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoStart: boolean;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  completed: boolean;
  order: number;
  dependencies?: string[]; // IDs of tasks that must be done first
}

export interface TaskBreakdown {
  id: string;
  mainTask: string;
  subtasks: Subtask[];
  estimatedTime: number; // total minutes
  visualType: 'checklist' | 'steps' | 'flowchart';
  showProgress: boolean;
}

export interface BoardActivity {
  name: string;
  icon?: string;
  image?: string;
  duration?: number;
}

export interface FirstThenBoard {
  id: string;
  first: BoardActivity;
  then: BoardActivity;
  visualStyle: 'simple' | 'detailed';
  showTimer: boolean;
}

export interface ScheduleItem {
  id: string;
  activity: string;
  icon: string;
  duration?: number;
  status: 'upcoming' | 'current' | 'completed';
  order: number;
}

export interface VisualSchedule {
  id: string;
  name: string;
  items: ScheduleItem[];
  currentIndex: number;
  showTimeEstimates: boolean;
  allowReordering: boolean;
}

export interface TransitionWarning {
  minutesBefore: number;
  message: string;
  visual: boolean;
  audio: boolean;
}

export interface ExecutiveFunctionPreset {
  id: string;
  name: string;
  description: string;
  category: 'homework' | 'routine' | 'task' | 'break';
  timer?: Partial<VisualTimer>;
  taskBreakdown?: Partial<TaskBreakdown>;
  firstThen?: Partial<FirstThenBoard>;
}
