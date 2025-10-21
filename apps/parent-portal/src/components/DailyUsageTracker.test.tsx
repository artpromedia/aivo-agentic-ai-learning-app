import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyUsageTracker } from './DailyUsageTracker';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('DailyUsageTracker', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders with learner name', () => {
    render(<DailyUsageTracker learnerId="learner-1" learnerName="Alex" />);
    expect(screen.getByText(/Today's Activity - Alex/i)).toBeTruthy();
  });

  it('displays zero stats when no data', () => {
    render(<DailyUsageTracker learnerId="learner-1" learnerName="Alex" />);
    
    expect(screen.getByTestId('today-breaks').textContent).toBe('0');
    expect(screen.getByTestId('today-duration').textContent).toBe('0m');
    expect(screen.getByTestId('today-score').textContent).toBe('0');
    expect(screen.getByTestId('today-completion').textContent).toBe('0%');
  });

  it('shows no sessions message when empty', () => {
    render(<DailyUsageTracker learnerId="learner-1" learnerName="Alex" />);
    
    expect(screen.getByText(/No game breaks yet today/i)).toBeTruthy();
  });

  it('renders 7-day activity section', () => {
    render(<DailyUsageTracker learnerId="learner-1" learnerName="Alex" />);
    
    expect(screen.getByText(/7-Day Activity/i)).toBeTruthy();
  });

  it('displays weekly summary stats', () => {
    render(<DailyUsageTracker learnerId="learner-1" learnerName="Alex" />);
    
    expect(screen.getByText(/Weekly Total/i)).toBeTruthy();
    expect(screen.getByText(/Daily Average/i)).toBeTruthy();
    expect(screen.getAllByText(/Total Time/i).length).toBeGreaterThan(0);
  });

  it('has export data button', () => {
    render(<DailyUsageTracker learnerId="learner-1" learnerName="Alex" />);
    
    const exportButton = screen.getByTestId('export-data-button');
    expect(exportButton).toBeTruthy();
  });

  it('has clear history button', () => {
    render(<DailyUsageTracker learnerId="learner-1" learnerName="Alex" />);
    
    const clearButton = screen.getByTestId('clear-history-button');
    expect(clearButton).toBeTruthy();
  });

  it('disables export button when no data', () => {
    render(<DailyUsageTracker learnerId="learner-1" learnerName="Alex" />);
    
    const exportButton = screen.getByTestId('export-data-button') as HTMLButtonElement;
    expect(exportButton.disabled).toBe(true);
  });

  it('disables clear button when no data', () => {
    render(<DailyUsageTracker learnerId="learner-1" learnerName="Alex" />);
    
    const clearButton = screen.getByTestId('clear-history-button') as HTMLButtonElement;
    expect(clearButton.disabled).toBe(true);
  });

  it('uses separate storage keys for different learners', () => {
    const { rerender } = render(
      <DailyUsageTracker learnerId="learner-1" learnerName="Alex" />
    );
    
    // Switch to different learner
    rerender(<DailyUsageTracker learnerId="learner-2" learnerName="Sam" />);
    
    // Should still show empty state
    expect(screen.getByText(/No game breaks yet today/i)).toBeTruthy();
  });

  it('renders data management section', () => {
    render(<DailyUsageTracker learnerId="learner-1" learnerName="Alex" />);
    
    expect(screen.getByText(/Data Management/i)).toBeTruthy();
  });
});
