# 🎨 Aivo Learning Design System & UI Component Library

**Status:** ✅ **Complete**  
**Last Updated:** October 18, 2025  
**Package:** `@aivo/ui` v1.0.0

---

## 📚 Table of Contents

1. [Design Tokens](#design-tokens)
2. [Components](#components)
3. [Usage Examples](#usage-examples)
4. [Accessibility](#accessibility)
5. [Best Practices](#best-practices)

---

## 🎨 Design Tokens

### Color Palette

#### Primary (Purple) - Main Brand Color
```tsx
primary-50:  '#f5f3ff'  // Lightest
primary-100: '#ede9fe'
primary-200: '#ddd6fe'
primary-300: '#c4b5fd'
primary-400: '#a78bfa'
primary-500: '#8b5cf6'  // Main purple
primary-600: '#7c3aed'  // Primary action color
primary-700: '#6d28d9'
primary-800: '#5b21b6'
primary-900: '#4c1d95'  // Darkest
```

#### Subject-Specific Colors

**Reading (Blue)**
```tsx
reading-50:  '#eff6ff'
reading-100: '#dbeafe'
reading-500: '#3b82f6'  // Main reading color
reading-600: '#2563eb'
```

**Math (Green)**
```tsx
math-50:  '#f0fdf4'
math-100: '#dcfce7'
math-500: '#22c55e'  // Main math color
math-600: '#16a34a'
```

**Speech (Purple)**
```tsx
speech-50:  '#faf5ff'
speech-100: '#f3e8ff'
speech-500: '#a855f7'  // Main speech color
speech-600: '#9333ea'
```

**Writing (Orange)**
```tsx
writing-50:  '#fff7ed'
writing-100: '#ffedd5'
writing-500: '#f97316'  // Main writing color
writing-600: '#ea580c'
```

**Neutral (Grays)**
```tsx
neutral-50:  '#fafafa'
neutral-100: '#f5f5f5'
neutral-300: '#d4d4d4'  // Borders
neutral-600: '#525252'  // Secondary text
neutral-700: '#404040'  // Primary text
neutral-900: '#171717'  // Headings
```

### Typography

**Font Families:**
- **Sans:** `Inter var, system-ui, sans-serif`

**Font Sizes:**
```tsx
xs:   0.75rem (12px) - line-height: 1rem
sm:   0.875rem (14px) - line-height: 1.25rem
base: 1rem (16px) - line-height: 1.5rem
lg:   1.125rem (18px) - line-height: 1.75rem
xl:   1.25rem (20px) - line-height: 1.75rem
2xl:  1.5rem (24px) - line-height: 2rem
3xl:  1.875rem (30px) - line-height: 2.25rem
4xl:  2.25rem (36px) - line-height: 2.5rem
5xl:  3rem (48px) - line-height: 1
6xl:  3.75rem (60px) - line-height: 1
```

### Spacing

**Custom Spacing:**
```tsx
18:  4.5rem (72px)
88:  22rem (352px)
128: 32rem (512px)
```

### Border Radius

```tsx
xl:  1rem (16px)
2xl: 1.5rem (24px)
3xl: 2rem (32px)
```

### Shadows

```tsx
card:       '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
card-hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
```

---

## 🧩 Components

### 1. Button

**Location:** `packages/ui/src/components/Button/`

#### Props
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // ...standard button HTML attributes
}
```

#### Variants
- **primary:** Purple background, white text (main CTA)
- **secondary:** White background, purple border and text
- **outline:** Transparent background, neutral border
- **ghost:** Transparent background, hover effect only

#### Sizes
- **sm:** `px-3 py-2 text-sm` - Compact buttons
- **md:** `px-4 py-3 text-base` - Default size
- **lg:** `px-6 py-4 text-lg` - Large CTAs

#### Features
- ✅ Loading state with spinner
- ✅ Icon support (left/right)
- ✅ Full-width option
- ✅ Disabled state
- ✅ Focus rings (accessibility)
- ✅ Forward ref support

---

### 2. Card

**Location:** `packages/ui/src/components/Card/`

#### Props
```tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}
```

#### Padding Sizes
- **none:** No padding
- **sm:** `p-4` (16px)
- **md:** `p-6` (24px) - Default
- **lg:** `p-8` (32px)

#### Features
- ✅ Optional title and subtitle
- ✅ Icon with customizable background color
- ✅ Hover effect (shadow elevation)
- ✅ Rounded corners (2xl)
- ✅ Default card shadow

---

### 3. Grid

**Location:** `packages/ui/src/components/Grid/`

#### Props
```tsx
interface GridProps {
  cols?: '1' | '2' | '3' | '4' | 'auto';
  gap?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}
```

#### Column Layouts
- **'1':** Single column (all screens)
- **'2':** 1 col → 2 cols at md breakpoint
- **'3':** 1 col → 2 cols (md) → 3 cols (lg)
- **'4':** 1 col → 2 cols (md) → 4 cols (lg)
- **'auto':** 1 col → 2 cols (sm) → 3 cols (lg) → 4 cols (xl)

#### Gap Sizes
- **sm:** `gap-3` (12px)
- **md:** `gap-4` (16px) - Default
- **lg:** `gap-6` (24px)

#### Features
- ✅ Fully responsive
- ✅ Mobile-first design
- ✅ CSS Grid-based

---

### 4. ProgressBar

**Location:** `packages/ui/src/components/ProgressBar/`

#### Props
```tsx
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'reading' | 'math' | 'speech' | 'writing';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}
```

#### Color Variants
- **primary:** Purple (general progress)
- **reading:** Blue
- **math:** Green
- **speech:** Purple
- **writing:** Orange

#### Sizes
- **sm:** `h-1` (4px)
- **md:** `h-2` (8px) - Default
- **lg:** `h-3` (12px)

#### Features
- ✅ Percentage calculation
- ✅ Optional label with percentage
- ✅ Smooth animation (500ms ease-out)
- ✅ ARIA attributes (accessibility)
- ✅ Rounded ends

---

### 5. Input

**Location:** `packages/ui/src/components/Input/`

#### Props
```tsx
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // ...standard input HTML attributes
}
```

#### States
- **Default:** Neutral border
- **Focus:** Primary border with ring
- **Error:** Red border with error message
- **Disabled:** Gray background, cursor not-allowed

#### Features
- ✅ Optional label
- ✅ Error state with message
- ✅ Helper text
- ✅ Left/right icon support
- ✅ Auto-generated IDs from labels
- ✅ ARIA attributes (accessibility)
- ✅ Forward ref support

---

## 💻 Usage Examples

### Complete Form Example

```tsx
import { Button, Card, Input, Grid } from '@aivo/ui';

function StudentForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  return (
    <Card title="Student Information" subtitle="Enter student details" padding="lg">
      <Grid cols="2" gap="md">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />
        
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          helperText="We'll never share your email"
          leftIcon={<MailIcon />}
        />
      </Grid>
      
      <Button variant="primary" fullWidth className="mt-4">
        Save Student
      </Button>
    </Card>
  );
}
```

### Dashboard with Progress

```tsx
import { Card, Grid, ProgressBar } from '@aivo/ui';

function LearningDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-neutral-900">Learning Progress</h1>
      
      <Grid cols="3" gap="lg">
        <Card 
          title="Reading" 
          icon={<BookIcon />}
          iconColor="bg-reading-100"
          padding="lg"
          hover
        >
          <ProgressBar value={75} showLabel color="reading" />
          <p className="mt-2 text-sm text-neutral-600">5 lessons completed</p>
        </Card>
        
        <Card 
          title="Math" 
          icon={<CalculatorIcon />}
          iconColor="bg-math-100"
          padding="lg"
          hover
        >
          <ProgressBar value={60} showLabel color="math" />
          <p className="mt-2 text-sm text-neutral-600">3 lessons completed</p>
        </Card>
        
        <Card 
          title="Writing" 
          icon={<PencilIcon />}
          iconColor="bg-writing-100"
          padding="lg"
          hover
        >
          <ProgressBar value={45} showLabel color="writing" />
          <p className="mt-2 text-sm text-neutral-600">2 lessons completed</p>
        </Card>
      </Grid>
    </div>
  );
}
```

### Button Variants Showcase

```tsx
import { Button } from '@aivo/ui';

function ButtonShowcase() {
  return (
    <div className="space-y-4">
      {/* Variants */}
      <div className="flex gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      
      {/* Sizes */}
      <div className="flex gap-4 items-center">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      
      {/* With Icons */}
      <div className="flex gap-4">
        <Button leftIcon={<PlusIcon />}>Add Student</Button>
        <Button rightIcon={<ArrowRightIcon />}>Continue</Button>
      </div>
      
      {/* States */}
      <div className="flex gap-4">
        <Button isLoading>Loading...</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  );
}
```

---

## ♿ Accessibility

All components follow WCAG 2.1 AA standards:

### Button
- ✅ Focus visible (2px ring)
- ✅ Keyboard navigable
- ✅ Disabled state clear
- ✅ Loading state communicated

### Input
- ✅ Labels properly associated
- ✅ Error messages with `aria-describedby`
- ✅ Invalid state with `aria-invalid`
- ✅ Helper text accessible

### ProgressBar
- ✅ `role="progressbar"`
- ✅ `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- ✅ Visual percentage indicator

### Card
- ✅ Semantic HTML structure
- ✅ Clear heading hierarchy
- ✅ Hover effects don't hide content

---

## 📖 Best Practices

### Color Usage

1. **Primary Purple** - Main CTAs, primary actions
2. **Subject Colors** - Use consistently for subject areas:
   - Reading: Blue
   - Math: Green
   - Speech: Purple
   - Writing: Orange
3. **Neutral** - Text, backgrounds, borders

### Component Composition

```tsx
// ✅ Good: Compose components
<Card padding="lg" hover>
  <ProgressBar value={75} showLabel color="math" />
  <Button variant="primary" fullWidth className="mt-4">
    Continue Lesson
  </Button>
</Card>

// ❌ Avoid: Inline styles
<div style={{padding: '2rem', background: 'white'}}>
  {/* Don't bypass the design system */}
</div>
```

### Responsive Design

```tsx
// ✅ Good: Use Grid for responsive layouts
<Grid cols="auto" gap="lg">
  {students.map(student => (
    <Card key={student.id} {...studentProps} />
  ))}
</Grid>

// ✅ Good: Adjust based on screen size
<Grid cols="1" gap="md" className="lg:cols-3">
  {/* Mobile: 1 col, Desktop: 3 cols */}
</Grid>
```

### Typography

```tsx
// ✅ Good: Use neutral colors for text
<h1 className="text-3xl font-bold text-neutral-900">Title</h1>
<p className="text-base text-neutral-600">Body text</p>

// ✅ Good: Use subject colors for emphasis
<span className="text-math-600 font-semibold">Math Score: 95%</span>
```

---

## 🔧 Utility Function

### cn() - Class Name Merger

**Location:** `packages/ui/src/utils/cn.ts`

Combines Tailwind classes intelligently, resolving conflicts:

```tsx
import { cn } from '@aivo/ui';

// Merges classes, later classes override earlier ones
cn('px-4 py-2', 'px-6')
// Result: 'px-6 py-2'

// Conditional classes
cn('base-class', condition && 'conditional-class', anotherCondition && 'another-class')

// Array support
cn(['class1', 'class2'], 'class3')
```

**Internal Implementation:**
```tsx
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 📦 Package Information

**Package Name:** `@aivo/ui`  
**Version:** 1.0.0  
**Dependencies:**
- `react`: ^19.0.0
- `clsx`: ^2.1.1
- `tailwind-merge`: ^2.6.0

**Exports:**
```tsx
// Component exports
export { Button, type ButtonProps } from './components/Button';
export { Card, type CardProps } from './components/Card';
export { Grid, type GridProps } from './components/Grid';
export { Input, type InputProps } from './components/Input';
export { ProgressBar, type ProgressBarProps } from './components/ProgressBar';

// Utility exports
export { cn } from './utils/cn';
```

---

## 🚀 Next Steps

### Planned Components
- [ ] **Modal/Dialog** - Overlay modals with focus trap
- [ ] **Dropdown/Select** - Custom select component
- [ ] **Tabs** - Tabbed navigation
- [ ] **Badge** - Small status indicators
- [ ] **Alert** - Notification/alert messages
- [ ] **Tooltip** - Contextual help
- [ ] **Avatar** - User profile images
- [ ] **Toggle/Switch** - Boolean input
- [ ] **Checkbox** - Multi-select input
- [ ] **Radio** - Single-select input

### Enhancements
- [ ] Dark mode support
- [ ] Animation system
- [ ] Component variants documentation
- [ ] Storybook integration
- [ ] Visual regression testing

---

**Last Updated:** October 18, 2025  
**Maintained by:** Aivo Learning Team
