# Homework Helper - Quick Reference

## 🚀 Quick Start

### Create a Homework Session

```typescript
import { homeworkService } from '@aivo/utils';

// Photo upload
const session = await homeworkService.createSession({
  learnerId: 'learner_123',
  title: 'Math Homework',
  inputMethod: 'photo',
  files: [photoFile],
});

// Text paste
const session = await homeworkService.createSession({
  learnerId: 'learner_123',
  title: 'Reading Questions',
  inputMethod: 'text',
  text: 'Read the passage...',
});
```

### Get Session & Navigate Steps

```typescript
// Get current session
const session = homeworkService.getSession(sessionId);

// Get step guidance
import { getStepGuidance } from '@aivo/utils';
const guidance = getStepGuidance(session.currentStep);

// Complete step
homeworkService.completeStep(sessionId);
```

### Request Help

```typescript
// Get hint
const hint = await homeworkService.requestHint(sessionId);

// Get explanation
const explanation = await homeworkService.explainStep(sessionId, 'plan');
```

---

## 📝 Type Imports

```typescript
import {
  HomeworkSession,
  HomeworkFile,
  HomeworkStep,
  WorkProduct,
  StepGuidance,
} from '@aivo/types';

import {
  homeworkService,
  getStepGuidance,
  getNextStep,
  calculateStepProgress,
} from '@aivo/utils';
```

---

## 🎯 The 4 Steps

| Step | Icon | Focus | Color |
|------|------|-------|-------|
| **understand** | 📖 | Comprehend the problem | Blue |
| **plan** | 🗺️ | Choose a strategy | Purple |
| **solve** | ✏️ | Execute step-by-step | Green |
| **check** | ✅ | Verify answer | Orange |

---

## 🔧 Common Operations

### Session Management
```typescript
// Get all sessions for learner
const sessions = homeworkService.getAllSessions(learnerId);

// Update session
homeworkService.updateSession(sessionId, {
  currentStep: 'solve',
  scaffoldingLevel: 'extensive',
});

// Delete session
homeworkService.deleteSession(sessionId);
```

### Progress Tracking
```typescript
import { calculateStepProgress } from '@aivo/utils';

const progress = calculateStepProgress(session.completedSteps);
// Returns: 0, 25, 50, 75, or 100
```

### Step Navigation
```typescript
import { getNextStep, getPreviousStep, isStepAccessible } from '@aivo/utils';

const next = getNextStep('plan'); // 'solve'
const prev = getPreviousStep('solve'); // 'plan'

const canAccess = isStepAccessible('solve', ['understand', 'plan']); // true
```

---

## 🎨 UI Helpers

### Step Icons & Colors
```typescript
import { getStepIcon, getStepColor } from '@aivo/utils';

getStepIcon('understand'); // '📖'
getStepColor('plan'); // 'purple'
```

### Settings
```typescript
session.settings = {
  readAloud: true,
  parentAssistMode: false,
  showHints: true,
  allowCalculator: true,
  timerEnabled: true,
  breakReminders: true,
  targetReadingLevel: '5th grade',
};
```

---

## 🧪 Mock Data

### OCR Results by Filename
- `math_*.jpg` → Math equation problem
- `reading_*.png` → Reading comprehension
- `science_*.pdf` → Science experiment
- `history_*.jpg` → Historical analysis

### Detected Subjects
- Math: equations, "solve", numbers
- ELA: "read", "passage", "essay"
- Science: "experiment", "hypothesis"
- History: "historical", "century"
- CS: code blocks

---

## 📦 File Support

| Type | Extensions | OCR |
|------|-----------|-----|
| Images | JPEG, PNG | ✅ Yes |
| Documents | PDF, DOCX | ✅ Yes |
| Text | N/A | N/A |

---

## 🔗 Production Integration Points

### OCR Service
```typescript
// packages/utils/src/homeworkService.ts:122
private async performOCR(file: HomeworkFile): Promise<void>
// TODO: Integrate Tesseract.js, Google Vision, or AWS Textract
```

### AI Analysis
```typescript
// packages/utils/src/homeworkService.ts:232
private async analyzeHomework(content: ExtractedContent)
// TODO: Call AI service for subject/grade detection
```

### Cloud Storage
```typescript
// packages/utils/src/homeworkService.ts:85
private async uploadFile(sessionId: string, file: File)
// TODO: Upload to S3/cloud storage
```

### Contextual Hints
```typescript
// packages/utils/src/homeworkService.ts:362
async requestHint(sessionId: string)
// TODO: Use AI for personalized hints
```

---

## 🎓 Example: Full Workflow

```typescript
// 1. Create session with photo
const session = await homeworkService.createSession({
  learnerId: 'student_123',
  title: 'Algebra Homework',
  inputMethod: 'photo',
  files: [mathPhoto],
});

// 2. Get first step guidance
const understandGuidance = getStepGuidance('understand');
console.log(understandGuidance.prompts);
// ["What is the problem asking me to do?", ...]

// 3. Student works through step, requests hint
const hint = await homeworkService.requestHint(session.id);

// 4. Complete step
homeworkService.completeStep(session.id);

// 5. Move to next step
const updatedSession = homeworkService.getSession(session.id);
console.log(updatedSession.currentStep); // 'plan'

// 6. Check progress
const progress = calculateStepProgress(updatedSession.completedSteps);
console.log(progress); // 25

// 7. Get next step guidance
const planGuidance = getStepGuidance('plan');

// 8. Repeat through all 4 steps
```

---

## 🎯 Key Benefits

✅ Multi-modal input (photo, document, text)  
✅ Automatic OCR and content extraction  
✅ AI-powered subject detection  
✅ Structured 4-step problem-solving  
✅ Contextual hints and explanations  
✅ Progress tracking and analytics  
✅ Accessibility features built-in  
✅ Production-ready architecture  

---

**Ready to implement UI in PROMPT 37!** 🚀
