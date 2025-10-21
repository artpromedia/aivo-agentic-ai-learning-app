import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';

// Mock the utility functions
vi.mock('../utils/mockData', () => ({
  getPlatformMetrics: () => ({}),
  getSystemHealth: () => ({}),
  getDistricts: () => [],
}));

describe('Admin Dashboard', () => {
  it('should render dashboard with metric cards', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Chats')).toBeInTheDocument();
    expect(screen.getByText('Blogs')).toBeInTheDocument();
  });

  it('should display invoices count', () => {
    render(<Dashboard />);
    expect(screen.getByText('59')).toBeInTheDocument();
  });

  it('should display chats count', () => {
    render(<Dashboard />);
    expect(screen.getByText('3,560')).toBeInTheDocument();
  });

  it('should render metric cards with gradient backgrounds', () => {
    const { container } = render(<Dashboard />);
    const gradientCards = container.querySelectorAll('.bg-gradient-to-br');
    expect(gradientCards.length).toBeGreaterThan(0);
  });
});
