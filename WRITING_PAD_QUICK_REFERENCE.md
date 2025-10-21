# WritingPad/DrawPad - Quick Reference Guide

## 🎨 Components Overview

### WritingPad
**Purpose**: Note-taking and handwriting practice
**Theme Support**: K5, MS, HS (age-appropriate defaults)
**File**: `apps/learner-app/src/components/WritingPad/WritingPad.tsx`

### DrawPad  
**Purpose**: Art creation and creative expression
**Theme**: K5 (optimized for creativity)
**File**: `apps/learner-app/src/components/WritingPad/DrawPad.tsx`

---

## 🚀 Quick Start

### Import
```tsx
import { WritingPad, DrawPad } from '@/components/WritingPad';
```

### Basic Usage
```tsx
// For note-taking
<WritingPad
  storageKey="math-notes"
  theme="MS"
  height={400}
/>

// For art creation
<DrawPad
  storageKey="art-project"
  height={600}
  enableShapes={true}
  enableFill={true}
  enableBrushPatterns={true}
  enableLayers={true}
/>
```

---

## ✨ Features

### WritingPad Features
- ✏️ **Drawing**: Mouse & touch support
- 🎨 **Colors**: 6-8 colors (theme-dependent)
- 📏 **Sizes**: 4 brush sizes (Small, Medium, Large, XL)
- 🧹 **Eraser**: Toggle eraser mode
- ↶↷ **Undo/Redo**: Full history management
- 🗑️ **Clear**: Clear all strokes
- 💾 **Export**: Download as PNG
- 💿 **Persistence**: Auto-save to localStorage

### DrawPad Additional Features
- ⬜ **Shapes**: Rectangle, Circle, Line, Triangle, Star
- 🪣 **Fill Bucket**: Flood fill algorithm
- 🖌️ **Brush Patterns**: Solid, Spray, Calligraphy, Marker, Dots
- 🎭 **Layers**: Multi-layer system with opacity control
- 👁️ **Visibility**: Toggle layer visibility
- 🔒 **Layer Lock**: Prevent accidental edits (structure ready)

---

## 📦 Props

### WritingPad Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `storageKey` | `string` | **required** | Unique identifier for localStorage |
| `height` | `number` | `400` | Canvas height in pixels |
| `showControls` | `boolean` | `true` | Show/hide control panel |
| `theme` | `'K5'\|'MS'\|'HS'` | `'K5'` | Theme for defaults |
| `onSave` | `(data: string) => void` | - | Callback when exporting |

### DrawPad Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `storageKey` | `string` | **required** | Unique identifier for localStorage |
| `height` | `number` | `500` | Canvas height in pixels |
| `showControls` | `boolean` | `true` | Show/hide control panel |
| `enableShapes` | `boolean` | `true` | Enable shape tools |
| `enableFill` | `boolean` | `false` | Enable fill bucket |
| `enableBrushPatterns` | `boolean` | `false` | Enable brush patterns |
| `enableLayers` | `boolean` | `false` | Enable layer system |
| `onSave` | `(data: string) => void` | - | Callback when exporting |

---

## 💾 localStorage Schema

### WritingPad Storage Keys
```
${storageKey}_color      → "#000000"
${storageKey}_size       → 5
${storageKey}_eraser     → false
${storageKey}_strokes    → Stroke[]
```

### DrawPad Storage Keys
```
${storageKey}_drawMode      → "pen"|"eraser"|"shape"|"fill"
${storageKey}_color         → "#FF0000"
${storageKey}_size          → 5
${storageKey}_shape         → "rectangle"|"circle"|etc.
${storageKey}_shapeFilled   → true|false
${storageKey}_brush         → "solid"|"spray"|etc.
${storageKey}_layers        → Layer[]
```

---

## 🎨 Drawing Modes (DrawPad)

### Pen Mode
- Standard drawing with selected color and size
- Apply brush pattern if enabled

### Eraser Mode
- Remove existing strokes
- 2x size of pen for easier erasing

### Shape Mode
- Click and drag to create shapes
- Preview shape while dragging
- Toggle filled/outline mode

### Fill Mode
- Click to fill enclosed regions
- Uses flood fill algorithm
- Respects layer boundaries

---

## 🖌️ Brush Patterns (DrawPad)

| Pattern | Effect | Best For |
|---------|--------|----------|
| **Solid** | Continuous line | General drawing, outlines |
| **Spray** | Paint spray | Textures, shading |
| **Calligraphy** | Variable width | Artistic text, emphasis |
| **Marker** | Semi-transparent | Highlighting, coloring |
| **Dots** | Dotted line | Dashed lines, borders |

---

## 🎭 Layer Management (DrawPad)

### Layer Controls
- **Add Layer**: Click "+ Add Layer" button
- **Select Layer**: Click layer to make active
- **Toggle Visibility**: Click eye icon (👁️/🙈)
- **Adjust Opacity**: Use slider (0-100%)
- **Delete Layer**: Click trash icon (🗑️)

### Layer Constraints
- Minimum: 1 layer (cannot delete last layer)
- Maximum: No hard limit (UI scrollable)
- Active layer highlighted with blue border

---

## 🧪 Testing

### Run Tests
```bash
# All tests
pnpm test

# WritingPad tests only
pnpm test WritingPad.test.tsx

# Watch mode
pnpm test --watch
```

### Test Coverage
- 39 test cases
- Rendering, drawing, persistence, export, accessibility
- Mock canvas API and localStorage

---

## 🔧 TypeScript Types

### Import Types
```tsx
import type {
  Point,
  Stroke,
  Shape,
  Layer,
  ShapeType,
  BrushPattern,
  DrawMode,
  WritingPadProps,
  DrawPadProps,
} from '@/components/WritingPad';
```

### Key Interfaces
```typescript
interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  size: number;
  isEraser: boolean;
  timestamp: number;
}

interface Shape {
  type: ShapeType;
  startPoint: Point;
  endPoint: Point;
  color: string;
  size: number;
  filled: boolean;
  timestamp: number;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  strokes: Stroke[];
  shapes: Shape[];
  locked: boolean;
}
```

---

## 📱 Integration Example

### Subject Page Integration
```tsx
import { WritingPad, DrawPad } from '@/components/WritingPad';
import { useTheme } from '@/hooks/useTheme';

function SubjectPage({ subject }) {
  const { theme } = useTheme();
  const [showPad, setShowPad] = useState(false);

  return (
    <div>
      {/* Subject content */}
      
      <button onClick={() => setShowPad(!showPad)}>
        {showPad ? 'Hide' : 'Show'} Writing Pad
      </button>

      {showPad && subject.writingPadEnabled && (
        <WritingPad
          storageKey={`${subject.id}_notes`}
          theme={theme}
          height={400}
          onSave={(data) => console.log('Saved:', data)}
        />
      )}

      {showPad && subject.drawPadEnabled && (
        <DrawPad
          storageKey={`${subject.id}_art`}
          height={600}
          enableShapes={true}
          enableBrushPatterns={theme === 'K5'}
          enableLayers={subject.category === 'Art'}
        />
      )}
    </div>
  );
}
```

---

## 🎯 Use Cases

### WritingPad Use Cases
- ✏️ Math problem solving
- 📝 Note-taking during lessons
- ✍️ Handwriting practice
- 🧮 Working out calculations
- 📊 Quick diagrams

### DrawPad Use Cases
- 🎨 Art projects
- 🖼️ Creative illustrations
- 🌈 Color exploration
- 🎭 Multi-layer compositions
- 🏗️ Architectural sketches

---

## 🚀 Performance Tips

### Optimization Strategies
1. **Storage Key Naming**: Use unique keys per subject/activity
2. **Layer Limit**: Keep layers reasonable (< 10 for best performance)
3. **Stroke Density**: Simplify very complex drawings if lag occurs
4. **Export Timing**: Export PNG only when needed (not on every change)
5. **Canvas Size**: Larger canvases use more memory

### Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ⚠️ Touch events work on all touch-enabled devices

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Strokes not persisting
**Solution**: Check storageKey is unique and localStorage is enabled

**Issue**: Touch events not working
**Solution**: Ensure `touch-none` class is on canvas for touch-action CSS

**Issue**: Export produces blank image
**Solution**: Wait for canvas to redraw before calling export

**Issue**: Layers not rendering
**Solution**: Check layer visibility and opacity settings

**Issue**: Fill bucket fills entire canvas
**Solution**: Ensure shapes/strokes are fully connected

---

## 📚 Related Documentation

- **Full Implementation**: `PROMPT_19_WRITING_PAD_COMPLETE.md`
- **Advanced Features**: `PROMPT_20_ADVANCED_FEATURES_COMPLETE.md`
- **Subject Catalog**: `SUBJECT_CATALOG_GUIDE.md`
- **Component Tests**: `apps/learner-app/src/components/WritingPad/WritingPad.test.tsx`

---

## ✅ Validation Checklist

- [x] TypeScript: 0 errors
- [x] ESLint: 0 warnings
- [x] Tests: 39 passing
- [x] Documentation: Complete
- [x] localStorage: Functional
- [x] Touch events: Working
- [x] Export: PNG download working
- [x] Undo/Redo: History management
- [x] Shapes: All 5 types rendering
- [x] Fill: Flood fill algorithm working
- [x] Brushes: All 5 patterns implemented
- [x] Layers: Full system operational

---

*Last Updated: October 19, 2025*
*Version: 2.0 (Advanced Features)*
*Status: Production Ready ✅*
