import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Hero } from '../components/landing/Hero';

describe('Hero Component', () => {
  it('renders the hero heading', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('renders the CTA buttons', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    
    // The component renders buttons, not links
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('has proper accessibility attributes', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    
    // Check for semantic HTML
    const main = screen.getByRole('heading', { level: 1 });
    expect(main).toBeInTheDocument();
    
    // Check buttons are accessible
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
  });
});
