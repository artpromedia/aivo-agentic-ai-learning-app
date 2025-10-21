/**
 * Step-by-Step Guidance for Homework Helper
 * Provides structured guidance, prompts, and resources for each problem-solving step
 */

import type { HomeworkStep, StepGuidance } from '@aivo/types';

/**
 * Get detailed guidance for a specific homework step
 */
export function getStepGuidance(step: HomeworkStep): StepGuidance {
  const guidanceMap: Record<HomeworkStep, StepGuidance> = {
    understand: {
      step: 'understand',
      title: '📖 Understand the Problem',
      description: 'Read carefully and identify what you know and what you need to find.',
      prompts: [
        'What is the problem asking me to do?',
        'What information do I already have?',
        'What am I trying to find or figure out?',
        'Are there any words I don\'t understand?',
        'Can I restate this problem in my own words?',
      ],
      resources: [
        {
          type: 'video',
          title: 'How to Understand Word Problems',
          url: '/resources/understanding-problems',
        },
        {
          type: 'tool',
          title: 'Highlight Key Information',
          url: '/tools/highlighter',
        },
        {
          type: 'example',
          title: 'Example: Breaking Down a Problem',
          url: '/examples/problem-breakdown',
        },
      ],
      checkpoints: [
        'I can explain the problem in my own words',
        'I identified what information is given',
        'I know what I need to find or solve for',
        'I understand all the important words',
      ],
    },

    plan: {
      step: 'plan',
      title: '🗺️ Make a Plan',
      description: 'Choose a strategy and decide how you will solve the problem.',
      prompts: [
        'What strategy should I use? (draw, equation, list, table, etc.)',
        'Have I solved a similar problem before?',
        'Can I draw a picture or diagram?',
        'Should I break this into smaller steps?',
        'What tools or formulas might help?',
      ],
      resources: [
        {
          type: 'article',
          title: 'Problem-Solving Strategies',
          url: '/resources/strategies',
        },
        {
          type: 'tool',
          title: 'Drawing Tool',
          url: '/tools/drawing',
        },
        {
          type: 'tool',
          title: 'Equation Builder',
          url: '/tools/equation-builder',
        },
        {
          type: 'example',
          title: 'Example: Choosing the Right Strategy',
          url: '/examples/choosing-strategy',
        },
      ],
      checkpoints: [
        'I chose a problem-solving strategy',
        'I know what steps I need to take',
        'I identified any formulas or tools I need',
        'My plan makes sense for this type of problem',
      ],
    },

    solve: {
      step: 'solve',
      title: '✏️ Solve the Problem',
      description: 'Carry out your plan step by step, showing all your work.',
      prompts: [
        'Am I following my plan?',
        'Am I showing all my steps clearly?',
        'Do my calculations look correct?',
        'Does this answer make sense so far?',
        'Should I check my work as I go?',
      ],
      resources: [
        {
          type: 'tool',
          title: 'Calculator',
          url: '/tools/calculator',
        },
        {
          type: 'tool',
          title: 'Scratch Pad',
          url: '/tools/scratch-pad',
        },
        {
          type: 'video',
          title: 'Showing Your Work',
          url: '/resources/showing-work',
        },
        {
          type: 'example',
          title: 'Example: Step-by-Step Solution',
          url: '/examples/solution-steps',
        },
      ],
      checkpoints: [
        'I followed my plan carefully',
        'I showed all my work step by step',
        'I checked my calculations',
        'I arrived at an answer',
      ],
    },

    check: {
      step: 'check',
      title: '✅ Check Your Answer',
      description: 'Review your answer to make sure it makes sense and is complete.',
      prompts: [
        'Does my answer make sense?',
        'Did I answer all parts of the question?',
        'Can I solve it a different way to check?',
        'Are my units correct?',
        'Does my answer fit the real-world context?',
      ],
      resources: [
        {
          type: 'article',
          title: 'How to Check Your Work',
          url: '/resources/checking-work',
        },
        {
          type: 'tool',
          title: 'Answer Checker',
          url: '/tools/answer-checker',
        },
        {
          type: 'example',
          title: 'Example: Verifying Your Answer',
          url: '/examples/verification',
        },
      ],
      checkpoints: [
        'My answer makes sense in the context',
        'I answered all parts of the question',
        'I checked my work using a different method',
        'My units and labels are correct',
        'I\'m confident in my final answer',
      ],
    },
  };

  return guidanceMap[step];
}

/**
 * Get all step guidance in order
 */
export function getAllStepGuidance(): StepGuidance[] {
  const steps: HomeworkStep[] = ['understand', 'plan', 'solve', 'check'];
  return steps.map(step => getStepGuidance(step));
}

/**
 * Get the next step in the sequence
 */
export function getNextStep(currentStep: HomeworkStep): HomeworkStep | null {
  const stepOrder: HomeworkStep[] = ['understand', 'plan', 'solve', 'check'];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return null; // No next step
  }
  
  return stepOrder[currentIndex + 1] ?? null;
}

/**
 * Get the previous step in the sequence
 */
export function getPreviousStep(currentStep: HomeworkStep): HomeworkStep | null {
  const stepOrder: HomeworkStep[] = ['understand', 'plan', 'solve', 'check'];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  if (currentIndex <= 0) {
    return null; // No previous step
  }
  
  return stepOrder[currentIndex - 1] ?? null;
}

/**
 * Calculate step progress percentage
 */
export function calculateStepProgress(completedSteps: string[]): number {
  const totalSteps = 4; // understand, plan, solve, check
  const completed = completedSteps.length;
  return Math.round((completed / totalSteps) * 100);
}

/**
 * Check if a step is accessible (prerequisites met)
 */
export function isStepAccessible(
  targetStep: HomeworkStep,
  completedSteps: string[]
): boolean {
  const stepOrder: HomeworkStep[] = ['understand', 'plan', 'solve', 'check'];
  const targetIndex = stepOrder.indexOf(targetStep);
  
  if (targetIndex === 0) {
    return true; // First step always accessible
  }
  
  // Check if previous step is completed
  const previousStep = stepOrder[targetIndex - 1];
  if (!previousStep) {
    return false;
  }
  return completedSteps.includes(previousStep);
}

/**
 * Get step icon emoji
 */
export function getStepIcon(step: HomeworkStep): string {
  const icons: Record<HomeworkStep, string> = {
    understand: '📖',
    plan: '🗺️',
    solve: '✏️',
    check: '✅',
  };
  return icons[step];
}

/**
 * Get step color for UI
 */
export function getStepColor(step: HomeworkStep): string {
  const colors: Record<HomeworkStep, string> = {
    understand: 'blue',
    plan: 'purple',
    solve: 'green',
    check: 'orange',
  };
  return colors[step];
}
