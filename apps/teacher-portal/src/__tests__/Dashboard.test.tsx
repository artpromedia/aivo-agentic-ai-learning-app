import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';

// Mock the utility functions
vi.mock('../utils/mockData', () => ({
  getStudents: () => [
    {
      id: '1',
      name: 'Test Student',
      avatar: 'https://example.com/avatar.jpg',
      iepStatus: 'active',
      overallProgress: 75,
      currentActivity: { 
        subject: 'reading',
        activityName: 'Reading Comprehension', 
        startedAt: new Date('2024-01-15T10:00:00'),
        accuracy: 85,
        questionsCompleted: 5,
        totalQuestions: 10,
      },
      iepGoals: [],
    },
  ],
  getAnalytics: () => ({
    classroomSummary: { iepGoalsOnTrack: 10 },
  }),
  getMessages: () => [{ id: '1', isRead: false }],
  getInterventionAlerts: () => [],
}));

describe('Teacher Dashboard', () => {
  it('should render dashboard with stats', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('Active IEPs')).toBeInTheDocument();
    expect(screen.getByText('Avg. Progress')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  it('should display student count', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Check for "1 active now" text which is unique to the student count card
    expect(screen.getByText('1 active now')).toBeInTheDocument();
  });

  it('should show progress percentage', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
