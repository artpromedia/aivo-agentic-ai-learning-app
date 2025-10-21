/**
 * WritingPad Types
 */

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  color: string;
  size: number;
  points: Point[];
  isEraser: boolean;
  timestamp: number;
}

export interface WritingPadProps {
  storageKey: string;
  height?: number;
  showControls?: boolean;
  theme?: 'K5' | 'MS' | 'HS';
  onSave?: (imageData: string) => void;
}

// DrawPad Advanced Features

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'triangle' | 'star';
export type BrushPattern = 'solid' | 'spray' | 'calligraphy' | 'marker' | 'dots';
export type DrawMode = 'pen' | 'eraser' | 'shape' | 'fill';

export interface Shape {
  type: ShapeType;
  startPoint: Point;
  endPoint: Point;
  color: string;
  size: number;
  filled: boolean;
  timestamp: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  strokes: Stroke[];
  shapes: Shape[];
  locked: boolean;
}

export interface DrawPadProps extends Omit<WritingPadProps, 'theme'> {
  enableShapes?: boolean;
  enableFill?: boolean;
  enableBrushPatterns?: boolean;
  enableLayers?: boolean;
}
