import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuardianGameControls } from './GuardianGameControls';

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

describe('GuardianGameControls', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders with learner name', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    expect(screen.getByText(/Game Break Settings for Alex/i)).toBeTruthy();
  });

  it('displays default settings', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const maxBreaksInput = screen.getByTestId('max-breaks-input') as HTMLInputElement;
    const breakDurationInput = screen.getByTestId('break-duration-input') as HTMLInputElement;
    
    expect(maxBreaksInput.value).toBe('3');
    expect(breakDurationInput.value).toBe('3');
  });

  it('updates max breaks per day', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const input = screen.getByTestId('max-breaks-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });
    
    expect(input.value).toBe('5');
  });

  it('updates break duration', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const input = screen.getByTestId('break-duration-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '7' } });
    
    expect(input.value).toBe('7');
  });

  it('toggles allow manual breaks', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const toggle = screen.getByTestId('manual-breaks-toggle');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles require approval', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const toggle = screen.getByTestId('require-approval-toggle');
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });

  it('toggles quiet hours', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const toggle = screen.getByTestId('quiet-hours-toggle');
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });

  it('shows quiet hours inputs when enabled', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const toggle = screen.getByTestId('quiet-hours-toggle');
    fireEvent.click(toggle);
    
    expect(screen.getByTestId('quiet-hours-start-input')).toBeTruthy();
    expect(screen.getByTestId('quiet-hours-end-input')).toBeTruthy();
  });

  it('updates quiet hours start time', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const toggle = screen.getByTestId('quiet-hours-toggle');
    fireEvent.click(toggle);
    
    const input = screen.getByTestId('quiet-hours-start-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '20:00' } });
    
    expect(input.value).toBe('20:00');
  });

  it('updates quiet hours end time', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const toggle = screen.getByTestId('quiet-hours-toggle');
    fireEvent.click(toggle);
    
    const input = screen.getByTestId('quiet-hours-end-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '08:00' } });
    
    expect(input.value).toBe('08:00');
  });

  it('displays all game types', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    expect(screen.getByTestId('game-type-reaction')).toBeTruthy();
    expect(screen.getByTestId('game-type-breathing')).toBeTruthy();
    expect(screen.getByTestId('game-type-memory')).toBeTruthy();
    expect(screen.getByTestId('game-type-pattern')).toBeTruthy();
    expect(screen.getByTestId('game-type-sorting')).toBeTruthy();
  });

  it('all game types are enabled by default', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const reactionGame = screen.getByTestId('game-type-reaction');
    expect(reactionGame.getAttribute('aria-checked')).toBe('true');
  });

  it('toggles game type on click', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const reactionGame = screen.getByTestId('game-type-reaction');
    fireEvent.click(reactionGame);
    
    expect(reactionGame.getAttribute('aria-checked')).toBe('false');
    
    fireEvent.click(reactionGame);
    expect(reactionGame.getAttribute('aria-checked')).toBe('true');
  });

  it('toggles game type with Enter key', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const reactionGame = screen.getByTestId('game-type-reaction');
    fireEvent.keyDown(reactionGame, { key: 'Enter' });
    
    expect(reactionGame.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles game type with Space key', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const reactionGame = screen.getByTestId('game-type-reaction');
    fireEvent.keyDown(reactionGame, { key: ' ' });
    
    expect(reactionGame.getAttribute('aria-checked')).toBe('false');
  });

  it('has save settings button', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    expect(screen.getByTestId('save-settings')).toBeTruthy();
  });

  it('persists settings to localStorage', () => {
    const { rerender } = render(
      <GuardianGameControls learnerId="learner-1" learnerName="Alex" />
    );
    
    const maxBreaksInput = screen.getByTestId('max-breaks-input') as HTMLInputElement;
    fireEvent.change(maxBreaksInput, { target: { value: '5' } });
    
    // Unmount and remount to test persistence
    rerender(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    const newInput = screen.getByTestId('max-breaks-input') as HTMLInputElement;
    expect(newInput.value).toBe('5');
  });

  it('uses separate storage keys for different learners', () => {
    const { unmount } = render(
      <GuardianGameControls learnerId="learner-1" learnerName="Alex" />
    );
    
    const maxBreaksInput = screen.getByTestId('max-breaks-input') as HTMLInputElement;
    fireEvent.change(maxBreaksInput, { target: { value: '5' } });
    
    // Unmount the component completely
    unmount();
    
    // Render with different learner
    render(<GuardianGameControls learnerId="learner-2" learnerName="Sam" />);
    
    const newInput = screen.getByTestId('max-breaks-input') as HTMLInputElement;
    expect(newInput.value).toBe('3'); // Should have default value
  });

  it('displays recommendations for settings', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    expect(screen.getByText(/Recommended: 2-4 breaks for optimal focus/i)).toBeTruthy();
    expect(screen.getByText(/Recommended: 2-5 minutes/i)).toBeTruthy();
  });

  it('shows learner name in manual breaks description', () => {
    render(<GuardianGameControls learnerId="learner-1" learnerName="Alex" />);
    
    expect(screen.getByText(/Let Alex start a game break anytime/i)).toBeTruthy();
  });
});
