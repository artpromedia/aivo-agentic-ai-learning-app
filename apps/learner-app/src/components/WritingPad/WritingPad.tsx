import React, { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '@aivo/utils';
import type { Point, Stroke, WritingPadProps } from './types';

export const WritingPad: React.FC<WritingPadProps> = ({
  storageKey,
  height = 400,
  showControls = true,
  theme = 'K5',
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Persistent settings per storage key
  const [penColor, setPenColor] = useLocalStorage(`${storageKey}_color`, '#000000');
  const [penSize, setPenSize] = useLocalStorage(`${storageKey}_size`, theme === 'K5' ? 5 : 3);
  const [isEraser, setIsEraser] = useLocalStorage(`${storageKey}_eraser`, false);
  const [strokes, setStrokes] = useLocalStorage<Stroke[]>(`${storageKey}_strokes`, []);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);

  // Color presets by theme
  const colorPresets =
    theme === 'K5'
      ? ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500']
      : theme === 'MS'
        ? ['#000000', '#4B5563', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']
        : ['#000000', '#374151', '#DC2626', '#2563EB', '#059669', '#D97706'];

  // Size presets by theme
  const sizePresets = theme === 'K5' ? [3, 5, 8, 12] : theme === 'MS' ? [2, 4, 6, 10] : [1, 3, 5, 8];

  // Redraw canvas
  const redrawCanvas = (ctx: CanvasRenderingContext2D, allStrokes: Stroke[]) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    allStrokes.forEach((stroke) => {
      ctx.save();

      if (stroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = stroke.size * 2; // Eraser is thicker
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();

      ctx.restore();
    });
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle HiDPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Redraw existing strokes
    redrawCanvas(ctx, strokes);
  }, [height, strokes]);

  // Update undo/redo button states
  useEffect(() => {
    setCanUndo(strokes.length > 0);
  }, [strokes]);

  // Get coordinates from event
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? 0) : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);

    const point = getCoordinates(e);
    const newStroke: Stroke = {
      color: penColor,
      size: penSize,
      points: [point],
      isEraser,
      timestamp: Date.now(),
    };

    setCurrentStroke(newStroke);
    setRedoStack([]); // Clear redo stack on new action
  };

  // Continue drawing
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();

    const point = getCoordinates(e);
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };

    setCurrentStroke(updatedStroke);

    // Live preview
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redrawCanvas(ctx, [...strokes, updatedStroke]);
  };

  // Stop drawing
  const stopDrawing = () => {
    if (currentStroke && currentStroke.points.length > 1) {
      setStrokes([...strokes, currentStroke]);
      setCanUndo(true);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  // Undo
  const undo = () => {
    if (strokes.length === 0) return;

    const lastStroke = strokes[strokes.length - 1];
    if (!lastStroke) return;
    
    const newStrokes = strokes.slice(0, -1);

    setStrokes(newStrokes);
    setRedoStack([...redoStack, lastStroke]);
    setCanUndo(newStrokes.length > 0);
    setCanRedo(true);
  };

  // Redo
  const redo = () => {
    if (redoStack.length === 0) return;

    const strokeToRedo = redoStack[redoStack.length - 1];
    if (!strokeToRedo) return;
    
    const newRedoStack = redoStack.slice(0, -1);

    setStrokes([...strokes, strokeToRedo]);
    setRedoStack(newRedoStack);
    setCanUndo(true);
    setCanRedo(newRedoStack.length > 0);
  };

  // Clear all
  const clear = () => {
    if (window.confirm('Clear all drawings? This cannot be undone.')) {
      setStrokes([]);
      setRedoStack([]);
      setCanUndo(false);
      setCanRedo(false);
    }
  };

  // Save as PNG
  const saveAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');

    if (onSave) {
      onSave(dataUrl);
    }

    // Download
    const link = document.createElement('a');
    link.download = `${storageKey}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="writing-pad-container">
      <canvas
        ref={canvasRef}
        className="w-full bg-white border-2 border-neutral-300 rounded-xl cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        data-testid="writing-pad-canvas"
      />

      {showControls && (
        <div className="mt-4 space-y-4">
          {/* Color Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Color:</span>
            {colorPresets.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-lg border-2 transition-transform ${
                  penColor === color && !isEraser ? 'border-black scale-110' : 'border-neutral-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setPenColor(color);
                  setIsEraser(false);
                }}
                data-testid={`color-${color}`}
                aria-label={`Select color ${color}`}
              />
            ))}
            <input
              type="color"
              value={penColor}
              onChange={(e) => {
                setPenColor(e.target.value);
                setIsEraser(false);
              }}
              className="w-8 h-8 rounded cursor-pointer"
              title="Custom color"
              data-testid="color-picker"
            />
          </div>

          {/* Size Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Size:</span>
            {sizePresets.map((size) => (
              <button
                key={size}
                className={`px-3 py-1.5 rounded-lg border-2 text-sm transition ${
                  penSize === size && !isEraser
                    ? 'border-black bg-neutral-100'
                    : 'border-neutral-300'
                }`}
                onClick={() => {
                  setPenSize(size);
                  setIsEraser(false);
                }}
                data-testid={`size-${size}`}
              >
                {size}px
              </button>
            ))}
            <input
              type="range"
              min={1}
              max={theme === 'K5' ? 20 : 15}
              value={penSize}
              onChange={(e) => {
                setPenSize(parseInt(e.target.value));
                setIsEraser(false);
              }}
              className="flex-1 max-w-xs"
              data-testid="size-slider"
            />
          </div>

          {/* Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                isEraser
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-neutral-300'
              }`}
              onClick={() => setIsEraser(!isEraser)}
              data-testid="eraser-toggle"
            >
              {isEraser ? '✓ Eraser' : 'Eraser'}
            </button>

            <button
              className="px-4 py-2 rounded-lg border-2 font-medium disabled:opacity-50"
              onClick={undo}
              disabled={!canUndo}
              data-testid="undo-button"
            >
              ↶ Undo
            </button>

            <button
              className="px-4 py-2 rounded-lg border-2 font-medium disabled:opacity-50"
              onClick={redo}
              disabled={!canRedo}
              data-testid="redo-button"
            >
              ↷ Redo
            </button>

            <button
              className="px-4 py-2 rounded-lg border-2 font-medium text-red-600 border-red-300"
              onClick={clear}
              data-testid="clear-button"
            >
              Clear All
            </button>

            <button
              className="px-4 py-2 rounded-lg border-2 font-medium bg-blue-600 text-white border-blue-600"
              onClick={saveAsPNG}
              data-testid="save-button"
            >
              💾 Save PNG
            </button>
          </div>

          {/* Status */}
          <div className="text-xs text-neutral-500">
            {strokes.length} stroke{strokes.length !== 1 ? 's' : ''} • Auto-saved locally
          </div>
        </div>
      )}
    </div>
  );
};
