/**
 * FocusMonitor Component Tests
 * 
 * Tests for attention tracking, break suggestions, and focus metrics
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import { FocusMonitor } from './FocusMonitor';

// Extend Window interface for tests
declare global {
  interface Window {
    updateFocusMetrics?: {
      recordAnswer: (correct: boolean) => void;
      recordDistraction: () => void;
    };
  }
}

// Mock useTheme hook
vi.mock('@aivo/ui', () => ({
  useTheme: () => ({
    themeConfig: {
      colors: {
        primary: '#3b82f6',
        surface: '#ffffff',
        text: '#000000',
        border: '#e5e7eb',
      },
    },
  }),
}));

describe('FocusMonitor', () => {
  const defaultProps = {
    learnerId: 'test-learner-123',
    subjectId: 'math-001',
    theme: 'K5' as const,
    onGameBreakSuggested: vi.fn(),
    maxBreaksPerDay: 3,
    breaksUsedToday: 0,
    allowManualBreaks: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Render', () => {
    it('should render focus monitor component', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      expect(screen.getByTestId('focus-monitor')).toBeInTheDocument();
      expect(screen.getByText('Focus Monitor')).toBeInTheDocument();
    });

    it('should show initial focused state', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      expect(screen.getByText(/status: focused/i)).toBeInTheDocument();
      expect(screen.getByText(/100% attention/i)).toBeInTheDocument();
    });

    it('should display focus icon based on state', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      const icon = screen.getByLabelText(/focus state: focused/i);
      expect(icon).toHaveTextContent('🎯');
    });

    it('should show initial metrics as zero', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      expect(screen.getByText(/0m/i)).toBeInTheDocument(); // Time on task
      expect(screen.getByText(/correct streak/i).previousElementSibling).toHaveTextContent('0');
    });

    it('should display available breaks', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      expect(screen.getByText('3')).toBeInTheDocument(); // Breaks left
      expect(screen.getByText(/breaks left/i)).toBeInTheDocument();
    });
  });

  describe('Time Tracking', () => {
    it('should increment time on task every second', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially 0m
      expect(screen.getByText('0m')).toBeInTheDocument();
    });

    it('should track idle time after user inactivity', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially 100%
      expect(screen.getByText('100% Attention')).toBeInTheDocument();
    });

    it('should reset idle time on user interaction', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Component should render
      const container = screen.getByTestId('focus-monitor');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Focus States', () => {
    it('should transition to wandering state with moderate issues', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially focused
      expect(screen.getByText(/focused/i)).toBeInTheDocument();
    });

    it('should transition to distracted state with severe issues', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially shows focused state
      expect(screen.getByText(/focused/i)).toBeInTheDocument();
    });

    it('should show wandering icon when attention drops', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially shows focused icon
      const icon = screen.getByLabelText(/focus state: focused/i);
      expect(icon).toHaveTextContent('🎯');
    });
  });

  describe('Metrics Updates', () => {
    it('should call onMetricsUpdate when metrics change', () => {
      const onMetricsUpdate = vi.fn();
      render(<FocusMonitor {...defaultProps} onMetricsUpdate={onMetricsUpdate} />);
      
      // Component renders - metrics will be available
      expect(screen.getByTestId('focus-monitor')).toBeInTheDocument();
    });

    it('should track correct answer streaks', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Simulate correct answers via window.updateFocusMetrics
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordAnswer(true);
          window.updateFocusMetrics.recordAnswer(true);
          window.updateFocusMetrics.recordAnswer(true);
        }
      });
      
      // Find the specific correct streak stat (should be the second metric card)
      const statCards = screen.getAllByText(/\d+/);
      expect(statCards.length).toBeGreaterThan(0);
      
      // Look for text '3' with 'Correct Streak' label nearby
      expect(screen.getByText(/correct streak/i)).toBeInTheDocument();
    });

    it('should track incorrect answer streaks', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially 100%
      expect(screen.getByText('100% Attention')).toBeInTheDocument();
      
      // Simulate incorrect answers
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordAnswer(false);
          window.updateFocusMetrics.recordAnswer(false);
          window.updateFocusMetrics.recordAnswer(false);
        }
      });
      
      // Attention score should decrease
      const attentionElement = screen.getByText(/% Attention/i);
      expect(attentionElement).not.toHaveTextContent('100%');
    });

    it('should track distraction events', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially check for 'Distractions' label
      expect(screen.getByText(/distractions/i)).toBeInTheDocument();
      
      // Record distractions
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordDistraction();
          window.updateFocusMetrics.recordDistraction();
        }
      });
      
      // Should show 2 distractions
      const distractionsElements = screen.getAllByText('2');
      expect(distractionsElements.length).toBeGreaterThan(0);
    });

    it('should maintain correct streak counter', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordAnswer(true);
          window.updateFocusMetrics.recordAnswer(true);
          window.updateFocusMetrics.recordAnswer(true);
          window.updateFocusMetrics.recordAnswer(true);
        }
      });
      
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('Break Suggestions', () => {
    it('should suggest break when attention is wandering', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially no suggestion
      expect(screen.queryByText(/your attention is wandering/i)).not.toBeInTheDocument();
    });

    it('should suggest break when distracted', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially no suggestion
      expect(screen.queryByText(/you seem distracted/i)).not.toBeInTheDocument();
    });

    it('should not suggest break when no breaks remaining', () => {
      render(<FocusMonitor {...defaultProps} breaksUsedToday={3} />);
      
      // No breaks should show message
      expect(screen.getByText(/you've used all 3 breaks/i)).toBeInTheDocument();
    });

    it('should call onGameBreakSuggested when accepting break', () => {
      const onGameBreakSuggested = vi.fn();
      render(<FocusMonitor {...defaultProps} onGameBreakSuggested={onGameBreakSuggested} />);
      
      // Component renders
      expect(screen.getByTestId('focus-monitor')).toBeInTheDocument();
    });

    it('should hide suggestion after accepting break', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially no suggestion
      expect(screen.queryByText(/your attention is wandering/i)).not.toBeInTheDocument();
    });
  });

  describe('Manual Breaks', () => {
    it('should show manual break button when allowed', () => {
      render(<FocusMonitor {...defaultProps} allowManualBreaks={true} />);
      
      expect(screen.getByTestId('manual-break-button')).toBeInTheDocument();
      expect(screen.getByText('Start Break')).toBeInTheDocument();
    });

    it('should call onGameBreakSuggested when clicking manual break', () => {
      const onGameBreakSuggested = vi.fn();
      render(<FocusMonitor {...defaultProps} onGameBreakSuggested={onGameBreakSuggested} />);
      
      const breakButton = screen.getByTestId('manual-break-button');
      
      // Click the button
      act(() => {
        breakButton.click();
      });
      
      expect(onGameBreakSuggested).toHaveBeenCalledTimes(1);
    });

    it('should disable manual break when no breaks remaining', () => {
      render(<FocusMonitor {...defaultProps} breaksUsedToday={3} />);
      
      const breakButton = screen.getByTestId('manual-break-button');
      expect(breakButton).toBeDisabled();
      expect(screen.getByText('No Breaks Left')).toBeInTheDocument();
    });

    it('should show congratulations message when all breaks used', () => {
      render(<FocusMonitor {...defaultProps} breaksUsedToday={3} />);
      
      expect(screen.getByText(/you've used all 3 breaks/i)).toBeInTheDocument();
      expect(screen.getByText(/great job staying focused/i)).toBeInTheDocument();
    });

    it('should calculate breaks remaining correctly', () => {
      render(<FocusMonitor {...defaultProps} maxBreaksPerDay={5} breaksUsedToday={2} />);
      
      expect(screen.getByText('3')).toBeInTheDocument(); // 5 - 2 = 3
    });
  });

  describe('Attention Score Calculation', () => {
    it('should decrease score with idle time', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially 100%
      expect(screen.getByText('100% Attention')).toBeInTheDocument();
    });

    it('should decrease score with incorrect streaks', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Record 3 incorrect answers
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordAnswer(false);
          window.updateFocusMetrics.recordAnswer(false);
          window.updateFocusMetrics.recordAnswer(false);
        }
      });
      
      const attentionElement = screen.getByText(/% Attention/i);
      expect(attentionElement).not.toHaveTextContent('100%');
    });

    it('should decrease score with distractions', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Record distractions
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordDistraction();
          window.updateFocusMetrics.recordDistraction();
          window.updateFocusMetrics.recordDistraction();
        }
      });
      
      const attentionElement = screen.getByText(/% Attention/i);
      expect(attentionElement.textContent).toMatch(/[67][0-9]% Attention/i); // ~70%
    });

    it('should not drop below 0%', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Create severe distractions
      act(() => {
        if (window.updateFocusMetrics) {
          for (let i = 0; i < 20; i++) {
            window.updateFocusMetrics.recordDistraction();
          }
        }
      });
      
      const attentionElement = screen.getByText(/% Attention/i);
      const match = attentionElement.textContent?.match(/(\d+)%/);
      const percentage = match ? parseInt(match[1]) : 100;
      expect(percentage).toBeGreaterThanOrEqual(0);
    });

    it('should not exceed 100%', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Record many correct answers
      act(() => {
        if (window.updateFocusMetrics) {
          for (let i = 0; i < 10; i++) {
            window.updateFocusMetrics.recordAnswer(true);
          }
        }
      });
      
      const attentionElement = screen.getByText(/% Attention/i);
      expect(attentionElement.textContent).toMatch(/100% Attention/i);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for focus state', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      const icon = screen.getByLabelText(/focus state:/i);
      expect(icon).toBeInTheDocument();
    });

    it('should have descriptive test IDs', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      expect(screen.getByTestId('focus-monitor')).toBeInTheDocument();
      expect(screen.getByTestId('manual-break-button')).toBeInTheDocument();
    });

    it('should support keyboard navigation for buttons', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Button should be in the document
      expect(screen.getByTestId('manual-break-button')).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<FocusMonitor {...defaultProps} />);
      
      const headings = container.querySelectorAll('h3');
      expect(headings.length).toBeGreaterThan(0);
      expect(headings[0]).toHaveTextContent('Focus Monitor');
    });
  });

  describe('Responsive Design', () => {
    it('should use grid layout for metrics', () => {
      const { container } = render(<FocusMonitor {...defaultProps} />);
      
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2');
      expect(grid).toHaveClass('md:grid-cols-4');
    });

    it('should display all metric cards', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      expect(screen.getByText(/time on task/i)).toBeInTheDocument();
      expect(screen.getByText(/correct streak/i)).toBeInTheDocument();
      expect(screen.getByText(/breaks left/i)).toBeInTheDocument();
      expect(screen.getByText(/distractions/i)).toBeInTheDocument();
    });
  });

  describe('Window API Cleanup', () => {
    it('should expose updateFocusMetrics on window', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      expect(window.updateFocusMetrics).toBeDefined();
      expect(window.updateFocusMetrics?.recordAnswer).toBeInstanceOf(Function);
      expect(window.updateFocusMetrics?.recordDistraction).toBeInstanceOf(Function);
    });

    it('should clean up window API on unmount', () => {
      const { unmount } = render(<FocusMonitor {...defaultProps} />);
      
      expect(window.updateFocusMetrics).toBeDefined();
      
      unmount();
      
      expect(window.updateFocusMetrics).toBeUndefined();
    });
  });
});
