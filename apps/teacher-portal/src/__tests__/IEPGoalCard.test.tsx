import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IEPGoalCard } from '../components/IEPGoalCard';
import type { IEPGoalData } from '../utils/mockData';

describe('IEPGoalCard', () => {
  const mockGoal: IEPGoalData = {
    id: '1',
    domain: 'reading',
    description: 'Improve reading comprehension',
    measurableObjective: 'Student will answer 4 out of 5 comprehension questions correctly',
    progress: 75,
    status: 'on-track',
    targetDate: new Date('2024-12-31'),
    lastActivity: new Date('2024-01-15'),
    totalActivities: 20,
    activitiesCompleted: 15,
    evidence: ['Completed reading assessment'],
    teacherNotes: ['Student shows improvement'],
  };

  it('should render goal description', () => {
    render(<IEPGoalCard goal={mockGoal} />);
    expect(screen.getByText('Improve reading comprehension')).toBeInTheDocument();
  });

  it('should display progress percentage', () => {
    render(<IEPGoalCard goal={mockGoal} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should show measurable objective', () => {
    render(<IEPGoalCard goal={mockGoal} />);
    expect(
      screen.getByText('Student will answer 4 out of 5 comprehension questions correctly')
    ).toBeInTheDocument();
  });

  it('should display activity completion count', () => {
    render(<IEPGoalCard goal={mockGoal} />);
    expect(screen.getByText('15/20')).toBeInTheDocument();
  });

  it('should show status badge', () => {
    render(<IEPGoalCard goal={mockGoal} />);
    expect(screen.getByText(/on track/i)).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<IEPGoalCard goal={mockGoal} />);
    expect(screen.getByText('Update Progress')).toBeInTheDocument();
    expect(screen.getByText('Add Evidence')).toBeInTheDocument();
  });

  it('should show evidence when showDetails is true', () => {
    render(<IEPGoalCard goal={mockGoal} showDetails={true} />);
    expect(screen.getByText('Evidence:')).toBeInTheDocument();
    expect(screen.getByText('Completed reading assessment')).toBeInTheDocument();
  });
});
