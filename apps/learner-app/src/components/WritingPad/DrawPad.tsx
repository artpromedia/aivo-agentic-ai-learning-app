import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocalStorage } from '@aivo/utils';
import type { Point, Stroke, Shape, Layer, ShapeType, BrushPattern, DrawMode, DrawPadProps } from './types';

/**
 * DrawPad - Enhanced drawing component with shapes, fill, brushes, and layers
 * Optimized for art subjects with advanced creative tools
 */
export const DrawPad: React.FC<DrawPadProps> = ({
  storageKey,
  height = 500,
  showControls = true,
  enableShapes = true,
  enableFill = false,
  enableBrushPatterns = false,
  enableLayers = false,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Drawing state
  const [drawMode, setDrawMode] = useLocalStorage<DrawMode>(`${storageKey}_drawMode`, 'pen');
  const [penColor, setPenColor] = useLocalStorage(`${storageKey}_color`, '#FF0000');
  const [penSize, setPenSize] = useLocalStorage(`${storageKey}_size`, 5);
  const [selectedShape, setSelectedShape] = useLocalStorage<ShapeType>(`${storageKey}_shape`, 'rectangle');
  const [shapeFilled, setShapeFilled] = useLocalStorage(`${storageKey}_shapeFilled`, false);
  const [brushPattern, setBrushPattern] = useLocalStorage<BrushPattern>(`${storageKey}_brush`, 'solid');

  // Layer management
  const [layers, setLayers] = useLocalStorage<Layer[]>(`${storageKey}_layers`, [
    {
      id: 'layer-1',
      name: 'Layer 1',
      visible: true,
      opacity: 1,
      strokes: [],
      shapes: [],
      locked: false,
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer-1');

  // Drawing state
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);
  const [tempShape, setTempShape] = useState<Shape | null>(null);

  // Undo/redo
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [redoStack, setRedoStack] = useState<Layer[][]>([]);

  // Color palette - K5 theme (bright and engaging)
  const colorPresets = [
    '#FF0000', // Red
    '#FF7F00', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#00FFFF', // Cyan
    '#0000FF', // Blue
    '#8B00FF', // Purple
    '#FF00FF', // Magenta
    '#000000', // Black
    '#FFFFFF', // White
    '#8B4513', // Brown
    '#FFC0CB', // Pink
  ];

  // Size presets
  const sizePresets = [
    { label: 'XS', value: 2 },
    { label: 'S', value: 5 },
    { label: 'M', value: 10 },
    { label: 'L', value: 15 },
    { label: 'XL', value: 25 },
  ];

  // Initialize canvas
  // Initialize canvas and redraw on layer changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      redrawCanvas(ctx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  // Update undo/redo state
  useEffect(() => {
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    setCanUndo(activeLayer ? activeLayer.strokes.length > 0 || activeLayer.shapes.length > 0 : false);
    setCanRedo(redoStack.length > 0);
  }, [layers, activeLayerId, redoStack]);

  // Redraw all layers
  const redrawCanvas = useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw each visible layer
    layers.forEach((layer) => {
      if (!layer.visible) return;

      ctx.save();
      ctx.globalAlpha = layer.opacity;

      // Draw strokes
      layer.strokes.forEach((stroke) => {
        drawStroke(ctx, stroke);
      });

      // Draw shapes
      layer.shapes.forEach((shape) => {
        drawShape(ctx, shape);
      });

      ctx.restore();
    });

    // Draw temporary shape preview
    if (tempShape) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      drawShape(ctx, tempShape);
      ctx.restore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, tempShape]);

  // Draw a stroke with brush pattern
  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length === 0) return;

    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;

    if (brushPattern === 'spray') {
      drawSprayStroke(ctx, stroke);
    } else if (brushPattern === 'calligraphy') {
      drawCalligraphyStroke(ctx, stroke);
    } else if (brushPattern === 'marker') {
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = stroke.size * 2;
      drawSolidStroke(ctx, stroke);
    } else if (brushPattern === 'dots') {
      drawDottedStroke(ctx, stroke);
    } else {
      drawSolidStroke(ctx, stroke);
    }

    ctx.restore();
  };

  const drawSolidStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length === 0) return;
    
    ctx.beginPath();
    ctx.moveTo(stroke.points[0]!.x, stroke.points[0]!.y);
    stroke.points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  };

  const drawSprayStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    stroke.points.forEach((point) => {
      const density = 20;
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * stroke.size;
        const x = point.x + Math.cos(angle) * radius;
        const y = point.y + Math.sin(angle) * radius;
        ctx.fillStyle = stroke.color;
        ctx.fillRect(x, y, 1, 1);
      }
    });
  };

  const drawCalligraphyStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const p1 = stroke.points[i];
      const p2 = stroke.points[i + 1];
      if (!p1 || !p2) continue;
      
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const angle = Math.atan2(dy, dx);
      const width = stroke.size * Math.abs(Math.cos(angle * 2));
      
      ctx.save();
      ctx.lineWidth = Math.max(1, width);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    }
  };

  const drawDottedStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    const spacing = stroke.size * 1.5;
    let distance = 0;
    
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const p1 = stroke.points[i];
      const p2 = stroke.points[i + 1];
      if (!p1 || !p2) continue;
      
      const segmentDist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      
      while (distance < segmentDist) {
        const ratio = distance / segmentDist;
        const x = p1.x + (p2.x - p1.x) * ratio;
        const y = p1.y + (p2.y - p1.y) * ratio;
        ctx.fillStyle = stroke.color;
        ctx.beginPath();
        ctx.arc(x, y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fill();
        distance += spacing;
      }
      distance -= segmentDist;
    }
  };

  // Draw a shape
  const drawShape = (ctx: CanvasRenderingContext2D, shape: Shape) => {
    ctx.save();
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.color;
    ctx.lineWidth = shape.size;

    const width = shape.endPoint.x - shape.startPoint.x;
    const height = shape.endPoint.y - shape.startPoint.y;

    ctx.beginPath();

    switch (shape.type) {
      case 'rectangle':
        if (shape.filled) {
          ctx.fillRect(shape.startPoint.x, shape.startPoint.y, width, height);
        } else {
          ctx.strokeRect(shape.startPoint.x, shape.startPoint.y, width, height);
        }
        break;

      case 'circle': {
        const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
        const centerX = shape.startPoint.x + width / 2;
        const centerY = shape.startPoint.y + height / 2;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        if (shape.filled) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
        break;
      }

      case 'line':
        ctx.moveTo(shape.startPoint.x, shape.startPoint.y);
        ctx.lineTo(shape.endPoint.x, shape.endPoint.y);
        ctx.stroke();
        break;

      case 'triangle': {
        const midX = shape.startPoint.x + width / 2;
        ctx.moveTo(midX, shape.startPoint.y);
        ctx.lineTo(shape.startPoint.x, shape.endPoint.y);
        ctx.lineTo(shape.endPoint.x, shape.endPoint.y);
        ctx.closePath();
        if (shape.filled) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
        break;
      }

      case 'star': {
        const centerX = shape.startPoint.x + width / 2;
        const centerY = shape.startPoint.y + height / 2;
        const outerRadius = Math.min(Math.abs(width), Math.abs(height)) / 2;
        const innerRadius = outerRadius / 2.5;
        const spikes = 5;

        for (let i = 0; i < spikes * 2; i++) {
          const angle = (i * Math.PI) / spikes - Math.PI / 2;
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        if (shape.filled) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
        break;
      }
    }

    ctx.restore();
  };

  // Fill bucket tool (flood fill algorithm)
  const floodFill = (ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) => {
    const canvas = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const targetColor = getPixelColor(pixels, startX, startY, canvas.width);
    const fillColorRGB = hexToRgb(fillColor);

    if (!fillColorRGB || colorsMatch(targetColor, fillColorRGB)) return;

    const stack: Point[] = [{ x: startX, y: startY }];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const point = stack.pop()!;
      const key = `${point.x},${point.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (
        point.x < 0 ||
        point.x >= canvas.width ||
        point.y < 0 ||
        point.y >= canvas.height
      )
        continue;

      const currentColor = getPixelColor(pixels, point.x, point.y, canvas.width);
      if (!colorsMatch(currentColor, targetColor)) continue;

      setPixelColor(pixels, point.x, point.y, canvas.width, fillColorRGB);

      stack.push({ x: point.x + 1, y: point.y });
      stack.push({ x: point.x - 1, y: point.y });
      stack.push({ x: point.x, y: point.y + 1 });
      stack.push({ x: point.x, y: point.y - 1 });
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const getPixelColor = (pixels: Uint8ClampedArray, x: number, y: number, width: number): RGB => {
    const index = (y * width + x) * 4;
    return {
      r: pixels[index] ?? 0,
      g: pixels[index + 1] ?? 0,
      b: pixels[index + 2] ?? 0,
      a: pixels[index + 3] ?? 0,
    };
  };

  const setPixelColor = (
    pixels: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    color: { r: number; g: number; b: number }
  ) => {
    const index = (y * width + x) * 4;
    pixels[index] = color.r;
    pixels[index + 1] = color.g;
    pixels[index + 2] = color.b;
    pixels[index + 3] = 255;
  };

  interface RGB {
    r: number;
    g: number;
    b: number;
    a?: number;
  }

  const colorsMatch = (c1: RGB, c2: RGB) => {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b;
  };

  const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1]!, 16),
          g: parseInt(result[2]!, 16),
          b: parseInt(result[3]!, 16),
        }
      : null;
  };

  // Mouse handlers
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: (touch?.clientX ?? 0) - rect.left,
      y: (touch?.clientY ?? 0) - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    if (drawMode === 'fill' && enableFill) {
      const dpr = window.devicePixelRatio || 1;
      floodFill(ctx, Math.floor(pos.x * dpr), Math.floor(pos.y * dpr), penColor);
      return;
    }

    if (drawMode === 'shape' && enableShapes) {
      setShapeStart(pos);
      setIsDrawing(true);
    } else if (drawMode === 'pen' || drawMode === 'eraser') {
      const activeLayer = layers.find((l) => l.id === activeLayerId);
      if (!activeLayer || activeLayer.locked) return;

      setCurrentStroke({
        points: [pos],
        color: drawMode === 'eraser' ? '#FFFFFF' : penColor,
        size: penSize,
        isEraser: drawMode === 'eraser',
        timestamp: Date.now(),
      });
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);

    if (drawMode === 'shape' && shapeStart) {
      setTempShape({
        type: selectedShape,
        startPoint: shapeStart,
        endPoint: pos,
        color: penColor,
        size: penSize,
        filled: shapeFilled,
        timestamp: Date.now(),
      });
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) redrawCanvas(ctx);
    } else if (currentStroke) {
      const updated = {
        ...currentStroke,
        points: [...currentStroke.points, pos],
      };
      setCurrentStroke(updated);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        drawStroke(ctx, {
          ...updated,
          points: updated.points.slice(-2),
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (!activeLayer || activeLayer.locked) {
      setIsDrawing(false);
      return;
    }

    if (drawMode === 'shape' && tempShape) {
      const updatedLayers = layers.map((layer) =>
        layer.id === activeLayerId
          ? { ...layer, shapes: [...layer.shapes, tempShape] }
          : layer
      );
      setLayers(updatedLayers);
      setTempShape(null);
      setShapeStart(null);
      setRedoStack([]);
    } else if (currentStroke && currentStroke.points.length > 1) {
      const updatedLayers = layers.map((layer) =>
        layer.id === activeLayerId
          ? { ...layer, strokes: [...layer.strokes, currentStroke] }
          : layer
      );
      setLayers(updatedLayers);
      setCurrentStroke(null);
      setRedoStack([]);
    }

    setIsDrawing(false);
  };

  // Undo/Redo
  const handleUndo = () => {
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (!activeLayer) return;

    const lastShape = activeLayer.shapes[activeLayer.shapes.length - 1];
    const lastStroke = activeLayer.strokes[activeLayer.strokes.length - 1];

    if (!lastShape && !lastStroke) return;

    const shouldRemoveShape = lastShape && (!lastStroke || lastShape.timestamp > lastStroke.timestamp);

    const updatedLayers = layers.map((layer) =>
      layer.id === activeLayerId
        ? {
            ...layer,
            shapes: shouldRemoveShape ? layer.shapes.slice(0, -1) : layer.shapes,
            strokes: !shouldRemoveShape ? layer.strokes.slice(0, -1) : layer.strokes,
          }
        : layer
    );

    setRedoStack([layers, ...redoStack]);
    setLayers(updatedLayers);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const [previousLayers, ...rest] = redoStack;
    if (!previousLayers) return;
    setLayers(previousLayers);
    setRedoStack(rest);
  };

  const handleClear = () => {
    const updatedLayers = layers.map((layer) =>
      layer.id === activeLayerId ? { ...layer, strokes: [], shapes: [] } : layer
    );
    setLayers(updatedLayers);
    setRedoStack([]);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    
    if (onSave) {
      onSave(dataURL);
    }

    const link = document.createElement('a');
    link.download = `artwork-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  // Layer management
  const addLayer = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      strokes: [],
      shapes: [],
      locked: false,
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const deleteLayer = (layerId: string) => {
    if (layers.length === 1) return; // Keep at least one layer
    const filtered = layers.filter((l) => l.id !== layerId);
    setLayers(filtered);
    if (activeLayerId === layerId && filtered[0]) {
      setActiveLayerId(filtered[0].id);
    }
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(
      layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l))
    );
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(
      layers.map((l) => (l.id === layerId ? { ...l, opacity } : l))
    );
  };

  return (
    <div className="draw-pad-container space-y-4">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          e.preventDefault();
          const pos = getTouchPos(e);
          handleMouseDown({ clientX: pos.x, clientY: pos.y, button: 0 } as React.MouseEvent<HTMLCanvasElement>);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const pos = getTouchPos(e);
          handleMouseMove({ clientX: pos.x, clientY: pos.y } as React.MouseEvent<HTMLCanvasElement>);
        }}
        onTouchEnd={handleMouseUp}
        className="border-2 border-neutral-300 rounded-xl cursor-crosshair touch-none bg-white"
        style={{ width: '100%', height: `${height}px` }}
        role="img"
        aria-label="Drawing canvas"
      />

      {showControls && (
        <div className="space-y-4">
          {/* Draw Mode */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDrawMode('pen')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                drawMode === 'pen'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              ✏️ Pen
            </button>
            <button
              onClick={() => setDrawMode('eraser')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                drawMode === 'eraser'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              🧹 Eraser
            </button>
            {enableShapes && (
              <button
                onClick={() => setDrawMode('shape')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  drawMode === 'shape'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                ⬜ Shapes
              </button>
            )}
            {enableFill && (
              <button
                onClick={() => setDrawMode('fill')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  drawMode === 'fill'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                🪣 Fill
              </button>
            )}
          </div>

          {/* Shape Selection */}
          {enableShapes && drawMode === 'shape' && (
            <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
              <p className="font-medium text-sm text-neutral-700">Shape Type:</p>
              <div className="flex flex-wrap gap-2">
                {(['rectangle', 'circle', 'line', 'triangle', 'star'] as ShapeType[]).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setSelectedShape(shape)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      selectedShape === shape
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={shapeFilled}
                  onChange={(e) => setShapeFilled(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-neutral-700">Fill shape</span>
              </label>
            </div>
          )}

          {/* Brush Patterns */}
          {enableBrushPatterns && drawMode === 'pen' && (
            <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
              <p className="font-medium text-sm text-neutral-700">Brush Pattern:</p>
              <div className="flex flex-wrap gap-2">
                {(['solid', 'spray', 'calligraphy', 'marker', 'dots'] as BrushPattern[]).map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => setBrushPattern(pattern)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      brushPattern === pattern
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Palette */}
          <div className="space-y-2">
            <p className="font-medium text-sm text-neutral-700">Color:</p>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  onClick={() => setPenColor(color)}
                  className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                    penColor === color ? 'ring-4 ring-blue-500 ring-offset-2' : 'ring-1 ring-neutral-300'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2">
            <p className="font-medium text-sm text-neutral-700">Size:</p>
            <div className="flex gap-2">
              {sizePresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setPenSize(preset.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    penSize === preset.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`px-4 py-2 rounded-lg font-medium ${
                canUndo
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-50'
              }`}
            >
              ↶ Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`px-4 py-2 rounded-lg font-medium ${
                canRedo
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-50'
              }`}
            >
              ↷ Redo
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
            >
              🗑️ Clear
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
            >
              💾 Export
            </button>
          </div>

          {/* Layers Panel */}
          {enableLayers && (
            <div className="p-4 bg-neutral-50 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm text-neutral-700">Layers:</p>
                <button
                  onClick={addLayer}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                >
                  + Add Layer
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`p-3 rounded-lg border-2 ${
                      activeLayerId === layer.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => setActiveLayerId(layer.id)}
                        className="flex-1 text-left text-sm font-medium"
                      >
                        {layer.name}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLayerVisibility(layer.id)}
                          className="text-lg"
                          aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
                        >
                          {layer.visible ? '👁️' : '🙈'}
                        </button>
                        {layers.length > 1 && (
                          <button
                            onClick={() => deleteLayer(layer.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Delete layer"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-neutral-600">Opacity:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={layer.opacity * 100}
                        onChange={(e) =>
                          updateLayerOpacity(layer.id, parseInt(e.target.value) / 100)
                        }
                        className="flex-1"
                      />
                      <span className="text-xs text-neutral-600 w-10">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
