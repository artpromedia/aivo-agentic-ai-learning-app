# Subject Detail Page - Quick Reference

## 🚀 Quick Start

### URL Pattern
```
/learner/:theme/subject/:subjectId

Examples:
/learner/k5/subject/math
/learner/ms/subject/science
/learner/hs/subject/algebra1
```

### Component Location
```
apps/learner-app/src/pages/SubjectDetail.tsx
```

---

## 📋 Unit Interface

```typescript
interface Unit {
  id: string;
  number: number;
  name: string;
  description: string;
  progress: number;              // 0-100
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  lessonsTotal: number;
  lessonsCompleted: number;
}
```

---

## 🎨 Theme-Specific Units

### K5 (3 Units)
1. **Explore** - Introduction and discovery (10 lessons)
2. **Practice** - Build skills through activities (12 lessons)
3. **Show & Tell** - Demonstrate learning (8 lessons)

### MS (3 Units)
1. **Concepts** - Core ideas and foundations (15 lessons)
2. **Practice** - Apply concepts to problems (18 lessons)
3. **Projects** - Hands-on applications (10 lessons)

### HS (4 Units)
1. **Foundations** - Essential concepts (20 lessons)
2. **Skills Development** - Advanced techniques (22 lessons)
3. **Applications** - Real-world problems (18 lessons)
4. **Exam Preparation** - Review and assessment (15 lessons)

---

## 🔧 Status System

| Status | Icon | Behavior |
|--------|------|----------|
| **locked** | 🔒 | No progress bar, grayed out, no button |
| **available** | ⭐ | Progress bar shown, "Continue Learning" button |
| **in-progress** | 🚀 | Progress bar shown, "Continue Learning" button |
| **completed** | ✅ | 100% progress, "Review Unit" button |

---

## 💾 WritingPad Integration

### Storage Keys
```typescript
`pad_${theme}_${subjectId}`

Examples:
"pad_K5_math"
"pad_MS_science"
"pad_HS_algebra1"
```

### Heights by Theme
- **K5**: 400px (larger for drawing)
- **MS**: 350px (balanced)
- **HS**: 300px (compact)

---

## 🎯 Component Structure

```tsx
<SubjectDetailPage>
  <Header>
    <BackButton />
    <SubjectCard>
      <Icon />
      <Title />
      <Description />
      <ThemeBadge />
      <Duration />
    </SubjectCard>
  </Header>
  
  <UnitsSection>
    <UnitCard status="in-progress">
      <StatusIcon />
      <UnitInfo />
      <ProgressBar />
      <ActionButton />
    </UnitCard>
    {/* More units... */}
  </UnitsSection>
  
  <WritingPadSection>
    <ToggleButton />
    <WritingPad />
  </WritingPadSection>
</SubjectDetailPage>
```

---

## 🔄 Navigation Flow

### From Subject Selection
```tsx
// Old way (direct to subject)
navigate('/learner/k5/math');

// New way (to detail page)
navigate('/learner/k5/subject/math');
```

### Back Navigation
```tsx
// Always returns to portal
navigate('/learner/portal');
```

---

## 🎨 Styling Props Used

### Theme Colors
```typescript
themeConfig.colors.background
themeConfig.colors.surface
themeConfig.colors.border
themeConfig.colors.text
themeConfig.colors.primary
```

### Typography
```typescript
themeConfig.fontSize.heading
themeConfig.fontSize.base
themeConfig.iconSize.subject
themeConfig.iconSize.navigation
```

---

## 🧪 Testing

### Test IDs
```typescript
data-testid="back-button"
data-testid="toggle-writing-pad"
data-testid="unit-unit1"
data-testid="unit-unit1-button"
```

### Manual Test Checklist
- [ ] Navigate from subject selection
- [ ] Back button works
- [ ] Subject not found shows error
- [ ] Units render correctly
- [ ] Progress bars animate
- [ ] Locked units are grayed
- [ ] WritingPad toggles
- [ ] Theme styling applied
- [ ] Responsive on mobile

---

## 📊 Progress Calculation

### Example Progress Bar
```tsx
<div style={{ width: `${unit.progress}%` }}>
  {/* Filled portion */}
</div>

// Progress: 30%
// Lessons: 5/18 completed
// Bar fills 30% of width
```

---

## 🔮 Future Integration

### Backend API Connection
```typescript
// Replace static units with API call
const { data: units } = useQuery(['units', theme, subjectId], () =>
  fetch(`/api/subjects/${theme}/${subjectId}/units`).then(r => r.json())
);

// Update progress
const updateProgress = useMutation((data) =>
  fetch(`/api/units/${unitId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  })
);
```

---

## ✅ Validation

### TypeScript Check
```bash
pnpm run type-check
# Result: 0 errors ✓
```

### Browser Test
```bash
pnpm run dev
# Navigate to: http://localhost:5173/learner/k5/subject/math
```

---

*Last Updated: October 19, 2025*
*Version: 1.0*
*Status: Production Ready ✅*
