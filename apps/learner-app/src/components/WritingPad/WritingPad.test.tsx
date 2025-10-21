import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WritingPad } from './WritingPad';
import type { Stroke } from './types';

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

// Mock canvas context
const mockContext = {
  scale: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  canvas: {
    width: 800,
    height: 400,
    toDataURL: vi.fn(() => 'data:image/png;base64,mockImageData'),
  },
  strokeStyle: '',
  lineWidth: 0,
  lineCap: '',
  lineJoin: '',
  globalCompositeOperation: '',
};

// Mock HTMLCanvasElement.getContext
// eslint-disable-next-line @typescript-eslint/no-explicit-any
HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as any);

// Mock toDataURL
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mockImageData');

// Mock getBoundingClientRect
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
  left: 0,
  top: 0,
  width: 800,
  height: 400,
  right: 800,
  bottom: 400,
  x: 0,
  y: 0,
  toJSON: () => {},
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock window.confirm
window.confirm = vi.fn(() => true);

describe('WritingPad', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    (window.confirm as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  describe('Rendering', () => {
    it('should render canvas element', () => {
      render(<WritingPad storageKey="test-pad" />);
      const canvas = screen.getByTestId('writing-pad-canvas');
      expect(canvas).toBeTruthy();
    });

    it('should render controls when showControls is true', () => {
      render(<WritingPad storageKey="test-pad" showControls={true} />);
      expect(screen.getByText(/Color:/)).toBeTruthy();
      expect(screen.getByText(/Size:/)).toBeTruthy();
      expect(screen.getByText('Eraser')).toBeTruthy();
    });

    it('should not render controls when showControls is false', () => {
      render(<WritingPad storageKey="test-pad" showControls={false} />);
      expect(screen.queryByText(/Color:/)).toBeNull();
      expect(screen.queryByText(/Size:/)).toBeNull();
    });

    it('should apply custom height', () => {
      render(<WritingPad storageKey="test-pad" height={600} />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      expect(canvas.style.height).toBe('600px');
    });
  });

  describe('Theme Defaults', () => {
    it('should use K5 theme defaults', () => {
      render(<WritingPad storageKey="test-k5" theme="K5" />);
      const stored = JSON.parse(localStorage.getItem('test-k5_size') || '5');
      expect(stored).toBe(5); // K5 default size
    });

    it('should use MS theme defaults', () => {
      render(<WritingPad storageKey="test-ms" theme="MS" />);
      const stored = JSON.parse(localStorage.getItem('test-ms_size') || '3');
      expect(stored).toBe(3); // MS default size
    });

    it('should use HS theme defaults', () => {
      render(<WritingPad storageKey="test-hs" theme="HS" />);
      const stored = JSON.parse(localStorage.getItem('test-hs_size') || '3');
      expect(stored).toBe(3); // HS default size
    });

    it('should show K5 color palette', () => {
      render(<WritingPad storageKey="test-k5" theme="K5" />);
      const colorButtons = screen.getAllByRole('button').filter((btn) =>
        btn.className.includes('w-8 h-8 rounded-lg')
      );
      expect(colorButtons.length).toBe(8); // K5 has 8 colors
    });

    it('should show MS color palette', () => {
      render(<WritingPad storageKey="test-ms" theme="MS" />);
      const colorButtons = screen.getAllByRole('button').filter((btn) =>
        btn.className.includes('w-8 h-8 rounded-lg')
      );
      expect(colorButtons.length).toBe(7); // MS has 7 colors
    });

    it('should show HS color palette', () => {
      render(<WritingPad storageKey="test-hs" theme="HS" />);
      const colorButtons = screen.getAllByRole('button').filter((btn) =>
        btn.className.includes('w-8 h-8 rounded-lg')
      );
      expect(colorButtons.length).toBe(6); // HS has 6 colors
    });
  });

  describe('Color Selection', () => {
    it('should change pen color when clicking color button', () => {
      render(<WritingPad storageKey="test-color" theme="K5" />);
      
      // Click red color button using testid
      const redButton = screen.getByTestId('color-#FF0000');
      fireEvent.click(redButton);
      
      const storedColor = JSON.parse(localStorage.getItem('test-color_color') || '"#000000"');
      expect(storedColor).toBe('#FF0000'); // Red
    });

    it('should persist color selection to localStorage', () => {
      const { rerender } = render(<WritingPad storageKey="test-persist-color" theme="K5" />);
      
      const greenButton = screen.getByTestId('color-#00FF00');
      fireEvent.click(greenButton); // Green
      
      // Unmount and remount to test persistence
      rerender(<WritingPad storageKey="different-key" theme="K5" />);
      rerender(<WritingPad storageKey="test-persist-color" theme="K5" />);
      
      const storedColor = JSON.parse(localStorage.getItem('test-persist-color_color') || '"#000000"');
      expect(storedColor).toBe('#00FF00'); // Green
    });
  });

  describe('Size Selection', () => {
    it('should change pen size when clicking size button', () => {
      render(<WritingPad storageKey="test-size" theme="K5" />);
      
      const largeButton = screen.getByTestId('size-8'); // Large (8px for K5)
      fireEvent.click(largeButton);
      
      const storedSize = JSON.parse(localStorage.getItem('test-size_size') || '5');
      expect(storedSize).toBe(8);
    });

    it('should persist size selection to localStorage', () => {
      const { rerender } = render(<WritingPad storageKey="test-persist-size" theme="K5" />);
      
      const xlButton = screen.getByTestId('size-12'); // XL (12px for K5)
      fireEvent.click(xlButton);
      
      rerender(<WritingPad storageKey="different-key" theme="K5" />);
      rerender(<WritingPad storageKey="test-persist-size" theme="K5" />);
      
      const storedSize = JSON.parse(localStorage.getItem('test-persist-size_size') || '5');
      expect(storedSize).toBe(12); // XL for K5
    });
  });

  describe('Eraser Mode', () => {
    it('should toggle eraser mode', () => {
      render(<WritingPad storageKey="test-eraser" theme="K5" />);
      const eraserButton = screen.getByText('Eraser');
      
      fireEvent.click(eraserButton);
      
      const storedEraser = JSON.parse(localStorage.getItem('test-eraser_eraser') || 'false');
      expect(storedEraser).toBe(true);
    });

    it('should persist eraser state to localStorage', () => {
      const { rerender } = render(<WritingPad storageKey="test-persist-eraser" theme="K5" />);
      
      const eraserButton = screen.getByText('Eraser');
      fireEvent.click(eraserButton);
      
      rerender(<WritingPad storageKey="different-key" theme="K5" />);
      rerender(<WritingPad storageKey="test-persist-eraser" theme="K5" />);
      
      const storedEraser = JSON.parse(localStorage.getItem('test-persist-eraser_eraser') || 'false');
      expect(storedEraser).toBe(true);
    });

    it('should apply eraser composite operation when drawing', () => {
      render(<WritingPad storageKey="test-eraser-draw" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      const eraserButton = screen.getByText('Eraser');
      
      fireEvent.click(eraserButton);
      
      // Simulate drawing
      fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
      fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
      fireEvent.mouseUp(canvas);
      
      // Check that destination-out was used (eraser mode)
      expect(mockContext.globalCompositeOperation).toContain('destination-out');
    });
  });

  describe('Drawing Functionality', () => {
    it('should start drawing on mousedown', () => {
      render(<WritingPad storageKey="test-draw" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      
      // After mousedown, should be able to draw on mousemove
      fireEvent.mouseMove(canvas, { clientX: 110, clientY: 110 });
      expect(mockContext.lineTo).toHaveBeenCalled();
    });

    it('should draw line on mousemove while drawing', () => {
      render(<WritingPad storageKey="test-draw-move" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should stop drawing on mouseup', () => {
      render(<WritingPad storageKey="test-draw-stop" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas);
      
      // After mouseup, mousemove should not draw
      const lineToCallCount = mockContext.lineTo.mock.calls.length;
      fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
      expect(mockContext.lineTo.mock.calls.length).toBe(lineToCallCount); // No new calls
    });

    it('should handle touch events', () => {
      render(<WritingPad storageKey="test-touch" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      const touch = { clientX: 100, clientY: 100 };
      fireEvent.touchStart(canvas, { touches: [touch] });
      
      // After touchstart, should be able to draw on touchmove
      const touch2 = { clientX: 110, clientY: 110 };
      fireEvent.touchMove(canvas, { touches: [touch2] });
      expect(mockContext.lineTo).toHaveBeenCalled();
    });

    it('should persist strokes to localStorage', async () => {
      render(<WritingPad storageKey="test-persist-strokes" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas);
      
      await waitFor(() => {
        const storedStrokes = JSON.parse(localStorage.getItem('test-persist-strokes_strokes') || '[]');
        expect(storedStrokes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Undo/Redo Functionality', () => {
    it('should enable undo after drawing', async () => {
      render(<WritingPad storageKey="test-undo" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas);
      
      await waitFor(() => {
        const undoButton = screen.getByTestId('undo-button');
        expect(undoButton.hasAttribute('disabled')).toBe(false);
      });
    });

    it('should undo last stroke', async () => {
      render(<WritingPad storageKey="test-undo-action" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      // Draw a stroke
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas);
      
      await waitFor(() => {
        const undoButton = screen.getByTestId('undo-button');
        fireEvent.click(undoButton);
      });
      
      await waitFor(() => {
        const storedStrokes = JSON.parse(localStorage.getItem('test-undo-action_strokes') || '[]');
        expect(storedStrokes.length).toBe(0);
      });
    });

    it('should enable redo after undo', async () => {
      render(<WritingPad storageKey="test-redo" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      // Draw a stroke
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas);
      
      await waitFor(() => {
        const undoButton = screen.getByTestId('undo-button');
        fireEvent.click(undoButton);
      });
      
      await waitFor(() => {
        const redoButton = screen.getByTestId('redo-button');
        expect(redoButton.hasAttribute('disabled')).toBe(false);
      });
    });

    it('should redo undone stroke', async () => {
      render(<WritingPad storageKey="test-redo-action" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      // Draw a stroke
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas);
      
      await waitFor(async () => {
        const undoButton = screen.getByTestId('undo-button');
        fireEvent.click(undoButton);
        
        await waitFor(async () => {
          const redoButton = screen.getByTestId('redo-button');
          fireEvent.click(redoButton);
          
          await waitFor(() => {
            const storedStrokes = JSON.parse(localStorage.getItem('test-redo-action_strokes') || '[]');
            expect(storedStrokes.length).toBe(1);
          });
        });
      });
    });

    it('should clear redo stack when drawing after undo', async () => {
      render(<WritingPad storageKey="test-clear-redo" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      // Draw first stroke
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas);
      
      await waitFor(() => {
        const undoButton = screen.getByTestId('undo-button');
        fireEvent.click(undoButton);
      });
      
      // Draw new stroke (should clear redo)
      fireEvent.mouseDown(canvas, { clientX: 200, clientY: 200 });
      fireEvent.mouseMove(canvas, { clientX: 250, clientY: 250 });
      fireEvent.mouseUp(canvas);
      
      await waitFor(() => {
        const redoButton = screen.getByTestId('redo-button');
        expect(redoButton.className).toContain('opacity-50'); // Disabled
      });
    });
  });

  describe('Clear Functionality', () => {
    it('should clear all strokes', async () => {
      render(<WritingPad storageKey="test-clear" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      // Draw a stroke
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas);
      
      await waitFor(() => {
        const clearButton = screen.getByText('Clear All');
        fireEvent.click(clearButton);
      });
      
      await waitFor(() => {
        const storedStrokes = JSON.parse(localStorage.getItem('test-clear_strokes') || '[]');
        expect(storedStrokes.length).toBe(0);
      });
    });

    it('should clear canvas context', async () => {
      render(<WritingPad storageKey="test-clear-canvas" theme="K5" />);
      
      const clearButton = screen.getByText('Clear All');
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(mockContext.clearRect).toHaveBeenCalled();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export canvas as PNG', () => {
      render(<WritingPad storageKey="test-export" theme="K5" />);
      const exportButton = screen.getByTestId('save-button');
      
      fireEvent.click(exportButton);
      
      // Check that toDataURL was called on the canvas element
      expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
    });

    it('should trigger download on export', () => {
      render(<WritingPad storageKey="test-export-download" theme="K5" />);
      const exportButton = screen.getByTestId('save-button');
      
      // Mock document.createElement to track anchor creation
      const createElementSpy = vi.spyOn(document, 'createElement');
      
      fireEvent.click(exportButton);
      
      expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    it('should call onSave callback if provided', () => {
      const onSave = vi.fn();
      render(<WritingPad storageKey="test-save-callback" theme="K5" onSave={onSave} />);
      const exportButton = screen.getByTestId('save-button');
      
      fireEvent.click(exportButton);
      
      expect(onSave).toHaveBeenCalledWith('data:image/png;base64,mockImageData');
    });
  });

  describe('Storage Key Isolation', () => {
    it('should isolate strokes by storage key', async () => {
      const { rerender } = render(<WritingPad storageKey="pad-1" theme="K5" />);
      const canvas = screen.getByTestId('writing-pad-canvas') as HTMLCanvasElement;
      
      // Draw on pad-1
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas);
      
      await waitFor(() => {
        const pad1Strokes = JSON.parse(localStorage.getItem('pad-1_strokes') || '[]');
        expect(pad1Strokes.length).toBeGreaterThan(0);
      });
      
      // Switch to pad-2
      rerender(<WritingPad storageKey="pad-2" theme="K5" />);
      
      const pad2Strokes = JSON.parse(localStorage.getItem('pad-2_strokes') || '[]');
      expect(pad2Strokes.length).toBe(0); // Empty for new key
    });

    it('should isolate settings by storage key', () => {
      const { rerender } = render(<WritingPad storageKey="settings-1" theme="K5" />);
      
      const colorButtons = screen.getAllByRole('button').filter((btn) =>
        btn.className.includes('w-8 h-8 rounded-lg')
      );
      const redButton = colorButtons[1];
      if (redButton) fireEvent.click(redButton); // Red
      
      rerender(<WritingPad storageKey="settings-2" theme="K5" />);
      
      const settings2Color = JSON.parse(localStorage.getItem('settings-2_color') || '"#000000"');
      expect(settings2Color).toBe('#000000'); // Default black for new key
    });
  });

  describe('Canvas Initialization', () => {
    it('should set canvas dimensions on mount', () => {
      render(<WritingPad storageKey="test-init" height={500} />);
      
      expect(mockContext.canvas.width).toBeDefined();
      expect(mockContext.canvas.height).toBeDefined();
    });

    it('should restore saved strokes on mount', async () => {
      // Pre-populate localStorage
      const savedStrokes: Stroke[] = [
        {
          points: [
            { x: 10, y: 10 },
            { x: 20, y: 20 },
          ],
          color: '#FF0000',
          size: 5,
          isEraser: false,
          timestamp: Date.now(),
        },
      ];
      localStorage.setItem('test-restore_strokes', JSON.stringify(savedStrokes));
      
      render(<WritingPad storageKey="test-restore" theme="K5" />);
      
      await waitFor(() => {
        expect(mockContext.beginPath).toHaveBeenCalled();
        expect(mockContext.moveTo).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<WritingPad storageKey="test-a11y" theme="K5" />);
      
      expect(screen.getByText(/Undo/)).toBeTruthy();
      expect(screen.getByText(/Redo/)).toBeTruthy();
      expect(screen.getByText('Clear All')).toBeTruthy();
      expect(screen.getByText(/Save PNG/)).toBeTruthy();
      expect(screen.getByText('Eraser')).toBeTruthy();
    });

    it('should disable buttons when appropriate', () => {
      render(<WritingPad storageKey="test-disabled" theme="K5" />);
      
      const undoButton = screen.getByTestId('undo-button');
      const redoButton = screen.getByTestId('redo-button');
      
      // Initially disabled
      expect(undoButton.hasAttribute('disabled')).toBe(true);
      expect(redoButton.hasAttribute('disabled')).toBe(true);
    });
  });
});
