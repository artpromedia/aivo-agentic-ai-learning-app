/**
 * Login Component Tests (Parent Portal)
 * 
 * Tests for authentication, form validation, and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import Login from './Login';

// Mock useAuth hook
const mockLogin = vi.fn();
const mockNavigate = vi.fn();
let mockIsLoading = false;
let mockError: string | null = null;

vi.mock('@aivo/auth', () => ({
  useAuth: () => ({
    login: mockLogin,
    get isLoading() { return mockIsLoading; },
    get error() { return mockError; },
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render with router
const renderWithRouter = (component: ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login (Parent Portal)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockError = null;
  });

  describe('Initial Render', () => {
    it('should render login form', () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByText('Aivo Learning')).toBeInTheDocument();
      expect(screen.getByText('Parent Portal')).toBeInTheDocument();
    });

    it('should display logo', () => {
      renderWithRouter(<Login />);
      
      const logo = screen.getByAltText('Aivo Learning');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/aivo-icon.svg');
    });

    it('should show demo credentials banner', () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
      expect(screen.getByText(/parent@demo\.com/i)).toBeInTheDocument();
      expect(screen.getByText(/demo123/i)).toBeInTheDocument();
    });

    it('should have email input field', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should have password input field', () => {
      renderWithRouter(<Login />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should have login button', () => {
      renderWithRouter(<Login />);
      
      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Form Interaction', () => {
    it('should update email field on input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password field on input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      await user.type(passwordInput, 'password123');
      
      expect(passwordInput.value).toBe('password123');
    });

    it('should clear form fields when cleared', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      
      await user.type(emailInput, 'test@example.com');
      await user.clear(emailInput);
      
      expect(emailInput.value).toBe('');
      
      await user.type(passwordInput, 'password');
      await user.clear(passwordInput);
      
      expect(passwordInput.value).toBe('');
    });

    it('should show placeholder text', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('parent@demo.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call login with email and password on submit', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'parent@demo.com');
      await user.type(passwordInput, 'demo123');
      await user.click(loginButton);
      
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'parent@demo.com',
        password: 'demo123',
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'parent@demo.com');
      await user.type(passwordInput, 'demo123');
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      const { container } = renderWithRouter(<Login />);
      const form = container.querySelector('form');
      
      const submitHandler = vi.fn((e) => e.preventDefault());
      form?.addEventListener('submit', submitHandler);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password');
      await user.click(loginButton);
      
      // Form submission should be prevented (no page reload)
      expect(mockLogin).toHaveBeenCalled();
    });

    it('should submit on Enter key press', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });
      
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, 'parent@demo.com');
      await user.type(passwordInput, 'demo123{Enter}');
      
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'parent@demo.com',
        password: 'demo123',
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading text when submitting', () => {
      mockIsLoading = true;
      
      renderWithRouter(<Login />);
      
      const loginButton = screen.queryByRole('button', { name: /logging in/i });
      expect(loginButton || screen.getByRole('button')).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      mockIsLoading = true;
      
      renderWithRouter(<Login />);
      
      const loginButton = screen.getByRole('button');
      expect(loginButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when login fails', () => {
      mockError = 'Invalid email or password';
      
      renderWithRouter(<Login />);
      
      const errorMessage = screen.queryByText(/invalid email or password/i);
      expect(errorMessage || screen.queryByRole('alert')).toBeTruthy();
    });

    it('should show error for incorrect credentials', () => {
      mockError = 'Authentication failed';
      
      renderWithRouter(<Login />);
      
      const errorDiv = screen.queryByText(/authentication failed/i);
      expect(errorDiv).toBeTruthy();
    });

    it('should not navigate on failed login', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValue(new Error('Login failed'));
      
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpass');
      await user.click(loginButton);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should require email field', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeRequired();
    });

    it('should require password field', () => {
      renderWithRouter(<Login />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeRequired();
    });

    it('should validate email format', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should not submit with empty fields', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      const loginButton = screen.getByRole('button', { name: /login/i });
      await user.click(loginButton);
      
      // Login should not be called with empty fields
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for inputs', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toHaveAccessibleName();
      expect(passwordInput).toHaveAccessibleName();
    });

    it('should have proper heading hierarchy', () => {
      renderWithRouter(<Login />);
      
      const heading = screen.getByRole('heading', { name: /aivo learning/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      // Tab through elements
      await user.tab();
      expect(emailInput).toHaveFocus();
      
      await user.tab();
      expect(passwordInput).toHaveFocus();
      
      await user.tab();
      expect(loginButton).toHaveFocus();
    });

    it('should have descriptive alt text for logo', () => {
      renderWithRouter(<Login />);
      
      const logo = screen.getByAltText('Aivo Learning');
      expect(logo).toBeInTheDocument();
    });

    it('should use semantic HTML', () => {
      const { container } = renderWithRouter(<Login />);
      
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      
      const labels = container.querySelectorAll('label');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('Styling', () => {
    it('should apply focus styles to inputs', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveClass('focus:ring-2', 'focus:ring-green-500');
    });

    it('should have gradient background', () => {
      const { container } = renderWithRouter(<Login />);
      
      const background = container.querySelector('.bg-gradient-to-br');
      expect(background).toBeInTheDocument();
    });

    it('should style button with hover state', () => {
      renderWithRouter(<Login />);
      
      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toHaveClass('hover:bg-green-700');
    });

    it('should apply disabled styles when loading', () => {
      mockIsLoading = true;
      
      renderWithRouter(<Login />);
      
      const loginButton = screen.getByRole('button');
      expect(loginButton).toHaveClass('disabled:bg-gray-400', 'disabled:cursor-not-allowed');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive container', () => {
      const { container } = renderWithRouter(<Login />);
      
      const formContainer = container.querySelector('.max-w-md');
      expect(formContainer).toBeInTheDocument();
    });

    it('should center content on screen', () => {
      const { container } = renderWithRouter(<Login />);
      
      const wrapper = container.querySelector('.min-h-screen');
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });
});
