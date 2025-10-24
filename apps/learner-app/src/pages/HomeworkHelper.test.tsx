/**
 * HomeworkHelper Component Tests
 * 
 * Tests for homework upload, session creation, and guidance interface
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HomeworkHelperPage from './HomeworkHelper';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('HomeworkHelperPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render homework upload interface', () => {
      renderWithRouter(<HomeworkHelperPage />);
      
      expect(screen.getByText(/upload homework/i)).toBeInTheDocument();
    });

    it('should display upload options', () => {
      renderWithRouter(<HomeworkHelperPage />);
      
      // Should show different input methods
      expect(screen.getByText(/take photo/i) || screen.getByText(/upload/i)).toBeInTheDocument();
    });

    it('should be accessible with proper ARIA labels', () => {
      renderWithRouter(<HomeworkHelperPage />);
      
      const uploadButton = screen.getByRole('button', { name: /upload|photo|file/i });
      expect(uploadButton).toBeInTheDocument();
    });
  });

  describe('File Upload', () => {
    it('should handle file selection', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const file = new File(['homework content'], 'homework.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText(/homework\.pdf/i)).toBeInTheDocument();
      });
    });

    it('should accept image files', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const imageFile = new File(['image'], 'homework.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      
      await user.upload(input, imageFile);
      
      await waitFor(() => {
        expect(screen.getByText(/homework\.jpg/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid file types', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const invalidFile = new File(['code'], 'script.exe', { type: 'application/x-msdownload' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      
      await user.upload(input, invalidFile);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid file type|not supported/i)).toBeInTheDocument();
      });
    });

    it('should handle multiple file uploads', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const files = [
        new File(['page 1'], 'page1.jpg', { type: 'image/jpeg' }),
        new File(['page 2'], 'page2.jpg', { type: 'image/jpeg' }),
      ];
      
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      await user.upload(input, files);
      
      await waitFor(() => {
        expect(screen.getByText(/page1\.jpg/i)).toBeInTheDocument();
        expect(screen.getByText(/page2\.jpg/i)).toBeInTheDocument();
      });
    });
  });

  describe('Session Creation', () => {
    it('should create session after file upload', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const file = new File(['homework'], 'math.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      
      await user.upload(input, file);
      
      // Click continue or submit button
      const continueButton = await screen.findByRole('button', { name: /continue|start|create/i });
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/session created|success/i)).toBeInTheDocument();
      });
    });

    it('should display session details after creation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const file = new File(['homework'], 'math.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      
      await user.upload(input, file);
      
      const continueButton = await screen.findByRole('button', { name: /continue|start/i });
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/session id/i)).toBeInTheDocument();
        expect(screen.getByText(/title/i)).toBeInTheDocument();
        expect(screen.getByText(/current step/i)).toBeInTheDocument();
      });
    });

    it('should show uploaded files in session details', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const file = new File(['homework'], 'algebra.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      
      await user.upload(input, file);
      
      const continueButton = await screen.findByRole('button', { name: /continue|start/i });
      await user.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/uploaded files/i)).toBeInTheDocument();
        expect(screen.getByText(/algebra\.pdf/i)).toBeInTheDocument();
      });
    });
  });

  describe('Text Input', () => {
    it('should allow manual text input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      // Click text input option if available
      const textInputButton = screen.queryByRole('button', { name: /type|text|manual/i });
      if (textInputButton) {
        await user.click(textInputButton);
      }
      
      const textarea = screen.getByRole('textbox', { name: /problem|homework|question/i });
      await user.type(textarea, 'Solve: 2x + 5 = 13');
      
      expect(textarea).toHaveValue('Solve: 2x + 5 = 13');
    });

    it('should create session from text input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const textarea = screen.getByRole('textbox', { name: /problem|homework/i });
      await user.type(textarea, 'Find the area of a circle with radius 5cm');
      
      const submitButton = screen.getByRole('button', { name: /submit|start|continue/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/session created/i)).toBeInTheDocument();
      });
    });

    it('should show character count for text input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const textarea = screen.getByRole('textbox', { name: /problem|homework/i });
      await user.type(textarea, 'Test problem');
      
      expect(screen.getByText(/\d+\/\d+|characters/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to guidance page after session creation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      // Create session
      const file = new File(['homework'], 'math.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      await user.upload(input, file);
      
      const continueButton = await screen.findByRole('button', { name: /continue|start/i });
      await user.click(continueButton);
      
      // Wait for session creation
      await waitFor(() => {
        expect(screen.getByText(/session created/i)).toBeInTheDocument();
      });
      
      // Click navigate to guidance
      const guidanceButton = screen.getByRole('button', { name: /continue to guidance|next/i });
      await user.click(guidanceButton);
      
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/homework-helper/'));
    });
  });

  describe('Loading States', () => {
    it('should show loading state during file upload', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const file = new File(['large file'], 'large.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      
      await user.upload(input, file);
      
      // Should show loading indicator
      expect(screen.getByRole('status') || screen.getByText(/uploading|processing/i)).toBeInTheDocument();
    });

    it('should show loading state during OCR processing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const file = new File(['homework'], 'scan.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText(/processing|analyzing|ocr/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on upload failure', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      // Mock upload failure
      const file = new File([''], 'empty.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      
      await user.upload(input, file);
      
      await waitFor(() => {
        expect(screen.getByText(/error|failed|try again/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      // Simulate error
      const file = new File([''], 'error.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      
      await user.upload(input, file);
      
      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry|try again/i });
        expect(retryButton).toBeInTheDocument();
      });
    });

    it('should validate file size limit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      // Create large file (> 10MB)
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      await user.upload(input, largeFile);
      
      await waitFor(() => {
        expect(screen.getByText(/file too large|size limit|maximum/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<HomeworkHelperPage />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      expect(headings[0].tagName).toBe('H1');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const uploadButton = screen.getByRole('button', { name: /upload|file/i });
      
      // Tab to button
      await user.tab();
      expect(uploadButton).toHaveFocus();
      
      // Press Enter to activate
      await user.keyboard('{Enter}');
      // Button should trigger file input
    });

    it('should have descriptive labels for form elements', () => {
      renderWithRouter(<HomeworkHelperPage />);
      
      const fileInput = screen.getByLabelText(/upload|file/i, { exact: false });
      expect(fileInput).toHaveAccessibleName();
    });

    it('should announce upload progress to screen readers', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HomeworkHelperPage />);
      
      const file = new File(['homework'], 'math.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload|file/i, { exact: false });
      
      await user.upload(input, file);
      
      // Should have aria-live region for status updates
      const statusRegion = screen.getByRole('status') || screen.getByLabelText(/status/i);
      expect(statusRegion).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render on mobile viewport', () => {
      global.innerWidth = 375;
      global.innerHeight = 667;
      
      renderWithRouter(<HomeworkHelperPage />);
      
      expect(screen.getByText(/upload homework|homework helper/i)).toBeInTheDocument();
    });

    it('should show mobile-friendly upload button', () => {
      global.innerWidth = 375;
      
      renderWithRouter(<HomeworkHelperPage />);
      
      const uploadButton = screen.getByRole('button', { name: /upload|photo|camera/i });
      expect(uploadButton).toBeInTheDocument();
    });
  });
});
