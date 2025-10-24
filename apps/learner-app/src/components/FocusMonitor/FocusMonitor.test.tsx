/**
 * FocusMonitor Component Tests
 * 
 * Tests for attention tracking, break suggestions, and focus metrics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusMonitor } from './FocusMonitor';

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
      expect(screen.getByText('0')).toBeInTheDocument(); // Correct streak (appears twice)
    });

    it('should display available breaks', () => {
      render(<FocusMonitor {...defaultProps} />);
      
      expect(screen.getByText('3')).toBeInTheDocument(); // Breaks left
      expect(screen.getByText(/breaks left/i)).toBeInTheDocument();
    });
  });

  describe('Time Tracking', () => {
    it('should increment time on task every second', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially 0m
      expect(screen.getByText(/0m/i)).toBeInTheDocument();
      
      // Advance 60 seconds
      act(() => {
        vi.advanceTimersByTime(60000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/1m/i)).toBeInTheDocument();
      });
    });

    it('should track idle time after user inactivity', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Simulate user going idle
      act(() => {
        vi.advanceTimersByTime(15000); // 15 seconds idle
      });
      
      // Attention score should decrease
      await waitFor(() => {
        const attentionElement = screen.getByText(/% attention/i);
        expect(attentionElement).not.toHaveTextContent('100%');
      });
    });

    it('should reset idle time on user interaction', async () => {
      const user = userEvent.setup({ delay: null });
      render(<FocusMonitor {...defaultProps} />);
      
      // Go idle
      act(() => {
        vi.advanceTimersByTime(15000);
      });
      
      // User interacts
      const manualBreakButton = screen.getByTestId('manual-break-button');
      await user.click(manualBreakButton);
      
      // Idle time should reset
      // Attention score should improve
      await waitFor(() => {
        expect(screen.getByText(/focused/i)).toBeInTheDocument();
      });
    });
  });

  describe('Focus States', () => {
    it('should transition to wandering state with moderate issues', async () => {
      const onMetricsUpdate = vi.fn();
      render(<FocusMonitor {...defaultProps} onMetricsUpdate={onMetricsUpdate} />);
      
      // Simulate idle time
      act(() => {
        vi.advanceTimersByTime(35000); // 35 seconds idle
      });
      
      await waitFor(() => {
        expect(screen.getByText(/wandering/i)).toBeInTheDocument();
      });
    });

    it('should transition to distracted state with severe issues', async () => {
      const onMetricsUpdate = vi.fn();
      render(<FocusMonitor {...defaultProps} onMetricsUpdate={onMetricsUpdate} />);
      
      // Simulate prolonged idle time
      act(() => {
        vi.advanceTimersByTime(65000); // 65 seconds idle
      });
      
      await waitFor(() => {
        expect(screen.getByText(/distracted/i)).toBeInTheDocument();
        const icon = screen.getByLabelText(/focus state: distracted/i);
        expect(icon).toHaveTextContent('😵');
      });
    });

    it('should show wandering icon when attention drops', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Create wandering state
      act(() => {
        vi.advanceTimersByTime(35000);
      });
      
      await waitFor(() => {
        const icon = screen.getByLabelText(/focus state: wandering/i);
        expect(icon).toHaveTextContent('💭');
      });
    });
  });

  describe('Metrics Updates', () => {
    it('should call onMetricsUpdate when metrics change', async () => {
      const onMetricsUpdate = vi.fn();
      render(<FocusMonitor {...defaultProps} onMetricsUpdate={onMetricsUpdate} />);
      
      // Advance time
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      await waitFor(() => {
        expect(onMetricsUpdate).toHaveBeenCalled();
      });
    });

    it('should track correct answer streaks', async () => {
      const onMetricsUpdate = vi.fn();
      render(<FocusMonitor {...defaultProps} onMetricsUpdate={onMetricsUpdate} />);
      
      // Simulate correct answers via window.updateFocusMetrics
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordAnswer(true);
          window.updateFocusMetrics.recordAnswer(true);
          window.updateFocusMetrics.recordAnswer(true);
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // Correct streak
      });
    });

    it('should track incorrect answer streaks', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Simulate incorrect answers
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordAnswer(false);
          window.updateFocusMetrics.recordAnswer(false);
        }
      });
      
      // Attention score should decrease
      await waitFor(() => {
        const attentionElement = screen.getByText(/% attention/i);
        expect(attentionElement).not.toHaveTextContent('100%');
      });
    });

    it('should track distraction events', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially 0 distractions
      expect(screen.getByText(/0.*distractions/i).closest('div')).toHaveTextContent('0');
      
      // Record distractions
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordDistraction();
          window.updateFocusMetrics.recordDistraction();
        }
      });
      
      await waitFor(() => {
        const distractionsElement = screen.getByText(/distractions/i).previousElementSibling;
        expect(distractionsElement).toHaveTextContent('2');
      });
    });

    it('should maintain correct streak counter', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordAnswer(true);
          window.updateFocusMetrics.recordAnswer(true);
          window.updateFocusMetrics.recordAnswer(true);
          window.updateFocusMetrics.recordAnswer(true);
        }
      });
      
      await waitFor(() => {
        expect(screen.getByText('4')).toBeInTheDocument();
      });
    });
  });

  describe('Break Suggestions', () => {
    it('should suggest break when attention is wandering', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Simulate wandering attention
      act(() => {
        vi.advanceTimersByTime(35000); // Idle time
      });
      
      // Wait for suggestion delay
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/your attention is wandering/i)).toBeInTheDocument();
      });
    });

    it('should suggest break when distracted', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Simulate distracted state
      act(() => {
        vi.advanceTimersByTime(65000);
      });
      
      // Wait for suggestion
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/you seem distracted/i)).toBeInTheDocument();
      });
    });

    it('should not suggest break when no breaks remaining', async () => {
      render(<FocusMonitor {...defaultProps} breaksUsedToday={3} />);
      
      // Simulate distracted state
      act(() => {
        vi.advanceTimersByTime(65000);
      });
      
      // Wait for potential suggestion
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      await waitFor(() => {
        expect(screen.queryByText(/start game break/i)).not.toBeInTheDocument();
      });
    });

    it('should call onGameBreakSuggested when accepting break', async () => {
      const user = userEvent.setup({ delay: null });
      const onGameBreakSuggested = vi.fn();
      render(<FocusMonitor {...defaultProps} onGameBreakSuggested={onGameBreakSuggested} />);
      
      // Create wandering state with suggestion
      act(() => {
        vi.advanceTimersByTime(35000);
      });
      
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      await waitFor(async () => {
        const acceptButton = screen.getByTestId('accept-break-suggestion');
        await user.click(acceptButton);
      });
      
      expect(onGameBreakSuggested).toHaveBeenCalledTimes(1);
    });

    it('should hide suggestion after accepting break', async () => {
      const user = userEvent.setup({ delay: null });
      render(<FocusMonitor {...defaultProps} />);
      
      // Show suggestion
      act(() => {
        vi.advanceTimersByTime(35000);
      });
      
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      await waitFor(async () => {
        const acceptButton = screen.getByTestId('accept-break-suggestion');
        await user.click(acceptButton);
      });
      
      expect(screen.queryByText(/your attention is wandering/i)).not.toBeInTheDocument();
    });
  });

  describe('Manual Breaks', () => {
    it('should show manual break button when allowed', () => {
      render(<FocusMonitor {...defaultProps} allowManualBreaks={true} />);
      
      expect(screen.getByTestId('manual-break-button')).toBeInTheDocument();
      expect(screen.getByText('Start Break')).toBeInTheDocument();
    });

    it('should call onGameBreakSuggested when clicking manual break', async () => {
      const user = userEvent.setup({ delay: null });
      const onGameBreakSuggested = vi.fn();
      render(<FocusMonitor {...defaultProps} onGameBreakSuggested={onGameBreakSuggested} />);
      
      const breakButton = screen.getByTestId('manual-break-button');
      await user.click(breakButton);
      
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
    it('should decrease score with idle time', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Initially 100%
      expect(screen.getByText(/100% attention/i)).toBeInTheDocument();
      
      // Simulate 35 seconds idle
      act(() => {
        vi.advanceTimersByTime(35000);
      });
      
      await waitFor(() => {
        const attentionElement = screen.getByText(/% attention/i);
        expect(attentionElement.textContent).toMatch(/8[0-9]% attention/i); // ~85%
      });
    });

    it('should decrease score with incorrect streaks', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Record 3 incorrect answers
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordAnswer(false);
          window.updateFocusMetrics.recordAnswer(false);
          window.updateFocusMetrics.recordAnswer(false);
        }
      });
      
      await waitFor(() => {
        const attentionElement = screen.getByText(/% attention/i);
        expect(attentionElement).not.toHaveTextContent('100%');
      });
    });

    it('should decrease score with distractions', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Record distractions
      act(() => {
        if (window.updateFocusMetrics) {
          window.updateFocusMetrics.recordDistraction();
          window.updateFocusMetrics.recordDistraction();
          window.updateFocusMetrics.recordDistraction();
        }
      });
      
      await waitFor(() => {
        const attentionElement = screen.getByText(/% attention/i);
        expect(attentionElement.textContent).toMatch(/[67][0-9]% attention/i); // ~70%
      });
    });

    it('should not drop below 0%', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Create severe distractions
      act(() => {
        if (window.updateFocusMetrics) {
          for (let i = 0; i < 20; i++) {
            window.updateFocusMetrics.recordDistraction();
          }
        }
      });
      
      await waitFor(() => {
        const attentionElement = screen.getByText(/% attention/i);
        const match = attentionElement.textContent?.match(/(\d+)%/);
        const percentage = match ? parseInt(match[1]) : 100;
        expect(percentage).toBeGreaterThanOrEqual(0);
      });
    });

    it('should not exceed 100%', async () => {
      render(<FocusMonitor {...defaultProps} />);
      
      // Record many correct answers
      act(() => {
        if (window.updateFocusMetrics) {
          for (let i = 0; i < 10; i++) {
            window.updateFocusMetrics.recordAnswer(true);
          }
        }
      });
      
      await waitFor(() => {
        const attentionElement = screen.getByText(/% attention/i);
        expect(attentionElement.textContent).toMatch(/100% attention/i);
      });
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

    it('should support keyboard navigation for buttons', async () => {
      const user = userEvent.setup({ delay: null });
      render(<FocusMonitor {...defaultProps} />);
      
      const breakButton = screen.getByTestId('manual-break-button');
      
      // Tab to button
      await user.tab();
      expect(breakButton).toHaveFocus();
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
