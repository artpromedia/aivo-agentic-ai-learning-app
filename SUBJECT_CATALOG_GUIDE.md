# Subject Catalog Quick Reference

## Overview
The learner app now has **34 subjects** across **3 themes** with complete routing and metadata.

## Subject Routes

### K5 (Elementary) - 10 Subjects
```
/learner/k5/math           - 🔢 Math
/learner/k5/science        - 🔬 Science
/learner/k5/reading        - 📚 Reading
/learner/k5/writing        - ✏️ Writing
/learner/k5/socialstudies  - 🌍 Social Studies
/learner/k5/art            - 🎨 Art
/learner/k5/music          - 🎵 Music
/learner/k5/pe             - ⚽ Physical Education
/learner/k5/health         - ❤️ Health
/learner/k5/technology     - 💻 Technology
```

### MS (Middle School) - 8 Subjects
```
/learner/ms/math           - 📐 Mathematics
/learner/ms/science        - 🧪 Science
/learner/ms/ela            - 📖 English Language Arts
/learner/ms/socialstudies  - 🗺️ Social Studies
/learner/ms/worldlanguages - 🌐 World Languages
/learner/ms/arts           - 🎭 Arts
/learner/ms/pehealth       - 🏃 PE & Health
/learner/ms/technologycs   - ⌨️ Technology & Computer Science
```

### HS (High School) - 16 Subjects
```
Mathematics (5):
/learner/hs/algebrai       - 🔢 Algebra I
/learner/hs/geometry       - 📏 Geometry
/learner/hs/algebraii      - ∑ Algebra II
/learner/hs/precalculus    - ∞ Precalculus
/learner/hs/calculus       - ∫ Calculus

Sciences (3):
/learner/hs/biology        - 🧬 Biology
/learner/hs/chemistry      - ⚗️ Chemistry
/learner/hs/physics        - ⚛️ Physics

English:
/learner/hs/ela            - 📚 English Language Arts

Social Studies (3):
/learner/hs/ushistory      - 🇺🇸 U.S. History
/learner/hs/worldhistory   - 🌍 World History
/learner/hs/govecon        - 🏛️ Government & Economics

Other (4):
/learner/hs/computerscience - 💻 Computer Science
/learner/hs/worldlanguages  - 🗣️ World Languages
/learner/hs/arts            - 🎨 Arts
/learner/hs/pehealth        - 🏋️ PE & Health
```

## Usage Examples

### Import Subject Catalog
```typescript
import { SUBJECT_CATALOG, getSubject, getSubjectsForTheme } from '@/config/subjects';

// Get all K5 subjects
const k5Subjects = getSubjectsForTheme('K5'); // Returns 10 subjects

// Get specific subject
const mathSubject = getSubject('K5', 'math'); // Returns Math subject object
```

### Subject Object Structure
```typescript
interface Subject {
  id: string;                    // 'math', 'science', etc.
  name: string;                  // 'Math', 'Science', etc.
  displayName: string;           // 'Mathematics', 'Science', etc.
  icon: string;                  // '🔢', '🔬', etc.
  color: string;                 // 'bg-blue-100 border-blue-300...'
  description: string;           // Subject description
  route: string;                 // '/learner/k5/math'
  writingPadEnabled: boolean;    // true/false
  drawPadEnabled: boolean;       // true/false
  estimatedDuration?: string;    // '30 min', '45 min', etc.
}
```

### Using SubjectCard Component
```typescript
import { SubjectCard } from '@/components/SubjectCard';

<SubjectCard
  subject={subject}
  progress={75}            // 0-100
  starsEarned={24}         // Number of stars
  totalStars={30}          // Total possible stars
/>
```

### Using SubjectPage Template
```typescript
import { SubjectPage } from '@/components/SubjectPage';
import { getSubject } from '@/config/subjects';

const subject = getSubject('K5', 'math')!;

const activities = [
  { id: 'counting', name: 'Counting', icon: '🔢', progress: 75 },
  // ... more activities
];

export function MathPage() {
  return <SubjectPage subject={subject} activities={activities} />;
}
```

## File Locations

### Configuration
- `apps/learner-app/src/config/subjects.ts` - Subject catalog

### Components
- `apps/learner-app/src/components/SubjectCard.tsx` - Subject card component
- `apps/learner-app/src/components/SubjectPage.tsx` - Subject page template

### Subject Pages
- `apps/learner-app/src/pages/subjects/k5/` - K5 subject pages (10 files)
- `apps/learner-app/src/pages/subjects/ms/` - MS subject pages (8 files)
- `apps/learner-app/src/pages/subjects/hs/` - HS subject pages (8 files, some with multiple exports)

### Integration
- `apps/learner-app/src/App.tsx` - Route definitions
- `apps/learner-app/src/pages/SubjectSelection.tsx` - Subject grid display

### Types
- `packages/types/src/learner.ts` - LearnerTheme type

## Tool Indicators

Subjects display badges for available tools:

- ✏️ **Writing Pad**: Digital writing/note-taking tool
- 🎨 **Draw Pad**: Digital drawing canvas

Example subjects with tools:
- K5 Math: ✏️ ✏️🎨 (both tools)
- MS ELA: ✏️🎨 (both tools)
- HS Music: ❌ (no tools)

## Duration Estimates

Each subject shows recommended time:
- **K5**: 20-30 minutes
- **MS**: 40-50 minutes
- **HS**: 45-60 minutes

## Color Themes

Subjects use consistent color coding:
- **Math**: Blue/Indigo/Emerald tones
- **Science**: Green/Teal/Cyan tones
- **Reading/ELA**: Purple tones
- **Social Studies**: Yellow/Amber/Orange tones
- **Arts**: Pink/Rose tones
- **PE/Health**: Red/Green/Orange tones
- **Technology**: Cyan/Slate tones

## Adding New Subjects

1. Add subject to appropriate array in `subjects.ts`:
```typescript
export const K5_SUBJECTS: Subject[] = [
  // ... existing subjects
  {
    id: 'newsubject',
    name: 'New Subject',
    displayName: 'New Subject',
    icon: '📖',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    description: 'Subject description',
    route: '/learner/k5/newsubject',
    writingPadEnabled: true,
    drawPadEnabled: false,
    estimatedDuration: '30 min',
  },
];
```

2. Create subject page:
```typescript
// apps/learner-app/src/pages/subjects/k5/NewSubject.tsx
import { getSubject } from '../../../config/subjects';
import { SubjectPage } from '../../../components/SubjectPage';

const subject = getSubject('K5', 'newsubject')!;

export function NewSubjectPage() {
  return <SubjectPage subject={subject} />;
}
```

3. Add route to `App.tsx`:
```typescript
<Route path="/learner/k5/newsubject" element={<NewSubjectPage />} />
```

## Testing Subjects

1. **Navigate**: Go to `/subjects` to see subject grid
2. **Select Theme**: Switch between K5, MS, HS themes
3. **Click Subject**: Should route to subject page
4. **View Details**: Check icon, description, tools, duration
5. **Activities**: Click activities (placeholder functionality)

## Performance Notes

- Subject catalog is loaded once at app startup
- Subjects are filtered per theme dynamically
- No API calls needed for subject metadata
- Progress data can be fetched separately per subject

## Accessibility Features

- Clear subject descriptions
- Tool availability indicators
- Estimated duration for planning
- Visual progress tracking
- High contrast color options
- Keyboard navigation support
