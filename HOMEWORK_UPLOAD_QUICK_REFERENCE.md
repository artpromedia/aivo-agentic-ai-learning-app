# Homework Helper Upload - Quick Reference

## 🚀 Quick Start

### Basic Usage

```typescript
import { HomeworkUpload } from '../components/HomeworkHelper';
import type { HomeworkSession } from '@aivo/types';

function MyPage() {
  const handleSessionCreated = (session: HomeworkSession) => {
    console.log('Created:', session.id);
    // Navigate to guidance, save, etc.
  };

  return (
    <HomeworkUpload
      learnerId="learner_123"
      onSessionCreated={handleSessionCreated}
    />
  );
}
```

---

## 📸 Input Methods

### 1. Take Photo
- Camera access for instant capture
- Mobile-optimized with `capture="environment"`
- Accepts: `image/*`

### 2. Upload Files
- Multiple file selection
- Accepts: `image/*,.pdf,.doc,.docx`
- Shows preview with icons

### 3. Type/Paste Text
- Large text area (h-32)
- Character count display
- Focus on button click

### 4. Combination
- Use multiple methods together
- Auto-detects as "multiple" input

---

## 🎯 Component API

```typescript
interface HomeworkUploadProps {
  learnerId: string;
  onSessionCreated: (session: HomeworkSession) => void;
}
```

---

## 🧪 Test IDs

```typescript
// Container
data-testid="homework-upload"

// Inputs
data-testid="homework-title"
data-testid="homework-text-input"

// Buttons
data-testid="take-photo"
data-testid="upload-file"
data-testid="use-text"
data-testid="start-homework"

// Files
data-testid="file-0"
data-testid="remove-file-0"
```

---

## 📁 File Handling

### File Icons
```typescript
'📷' - images
'📄' - PDF
'📝' - Word docs
'📎' - others
```

### File Size Display
- < 1 KB: "X B"
- < 1 MB: "X.X KB"  
- ≥ 1 MB: "X.X MB"

---

## 🎨 UI Features

### Input Method Cards
- Grid layout (1-3 columns)
- Hover: shadow-lg
- Icons: 4xl emojis
- Full-width buttons

### File Preview
- Rounded bg cards
- File icon + name + size
- Remove button (red)
- Hover effects

### Processing State
- Spinner animation
- Disabled buttons
- "Processing..." text

---

## ✅ Validation

Required: **At least ONE of:**
- Title (optional but recommended)
- Pasted text
- Uploaded file(s)

Shows alert if all empty.

---

## 🌙 Dark Mode

Automatic support with Tailwind:
```tsx
className="dark:bg-neutral-800 dark:text-white"
```

All components styled for both themes.

---

## ♿ Accessibility

- ARIA labels on all inputs
- Keyboard navigation
- Focus indicators
- Semantic HTML
- Screen reader support

---

## 🔧 Session Creation

```typescript
const session = await homeworkService.createSession({
  learnerId: 'learner_123',
  title: 'Math Homework',
  inputMethod: 'photo', // or 'document', 'text', 'multiple'
  text: pastedText || undefined,
  files: filesArray || undefined,
});

// Returns HomeworkSession with:
// - session.id
// - session.detectedSubject
// - session.files (with OCR status)
// - session.problemStatement
// - session.keyQuestions
// - session.currentStep ('understand')
```

---

## 📱 Responsive Design

- **Mobile**: 1 column, stacked
- **Tablet**: 2-3 columns
- **Desktop**: 3 columns, max-w-4xl

---

## 💡 Tips Card

Always shows helpful guidance:
- Clear photo tips
- Multi-step reminder
- Instructions upload
- Multiple files OK

---

## 🚀 Example E2E Test

```typescript
test('upload homework', async ({ page }) => {
  await page.goto('/homework-helper');
  
  // Upload file
  const input = page.locator('input[type="file"]').first();
  await input.setInputFiles('./homework.pdf');
  
  // Verify preview
  await expect(page.getByTestId('file-0')).toBeVisible();
  
  // Add title
  await page.getByTestId('homework-title').fill('Chapter 5');
  
  // Submit
  await page.getByTestId('start-homework').click();
  
  // Check success
  await expect(page.getByText('Session Created!')).toBeVisible();
});
```

---

## 🔗 Route

```typescript
// Add to App.tsx
<Route path="/homework-helper" element={<HomeworkHelperPage />} />
```

Visit: `/homework-helper`

---

## 📦 Files

```
apps/learner-app/src/
├── components/HomeworkHelper/
│   ├── HomeworkUpload.tsx  (300 lines)
│   └── index.ts
├── pages/
│   └── HomeworkHelper.tsx  (120 lines)
└── App.tsx (route added)
```

---

## ✨ Key Features

✅ 3 input methods (photo, file, text)  
✅ Multiple file support  
✅ File preview & removal  
✅ Smart input detection  
✅ Processing states  
✅ Error handling  
✅ Dark mode  
✅ Fully accessible  
✅ Responsive design  
✅ Production-ready  

---

**Ready to use! Test at `/homework-helper`** 🚀
