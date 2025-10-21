# Homework Session - Quick Reference

## 🚀 Quick Start

### Create a Session
```typescript
// Navigate user to homework helper
navigate('/homework-helper');

// Upload homework (PROMPT 37)
<HomeworkUpload learnerId="user_123" onSessionCreated={handleCreated} />

// Navigate to session
navigate(`/homework-helper/${session.id}`);
```

### Load Existing Session
```typescript
import { homeworkService } from '@aivo/utils';

// Get session
const session = homeworkService.getSession(sessionId);

// Get all sessions
const allSessions = homeworkService.getAllSessions();
```

---

## 📦 Components

### HomeworkSession
Main guidance interface with 4-step workflow.

```typescript
// Route setup
<Route path="/homework-helper/:sessionId" element={<HomeworkSession />} />

// No props - uses URL param
```

**Features**:
- Step navigation
- Progress tracking
- Hint system
- Settings panel
- Work review

### Step Components

```typescript
import { UnderstandStep, PlanStep, SolveStep, CheckStep } from './steps';

// Each step receives session
<UnderstandStep session={session} />
<PlanStep session={session} />
<SolveStep session={session} />
<CheckStep session={session} reflection={text} onReflectionChange={setText} />
```

### WorkProductInput

```typescript
<WorkProductInput
  sessionId="hw_123"
  step="solve"
/>
```

**Modes**: text | drawing | equation

---

## 🎯 Common Patterns

### Navigate Between Steps
```typescript
const handleStepChange = (step: HomeworkStep) => {
  homeworkService.updateSession(sessionId, { currentStep: step });
  setSession({ ...session, currentStep: step });
};
```

### Complete Step
```typescript
const handleCompleteStep = () => {
  const nextIndex = currentStepIndex + 1;
  if (nextIndex < STEPS.length) {
    // Move to next step
    homeworkService.updateSession(sessionId, {
      currentStep: STEPS[nextIndex].id,
      completedSteps: [...session.completedSteps, session.currentStep],
    });
  } else {
    // Complete session
    homeworkService.updateSession(sessionId, {
      status: 'completed',
      completedSteps: [...session.completedSteps, session.currentStep],
    });
  }
};
```

### Request Hint
```typescript
const handleRequestHint = async () => {
  const hint = await homeworkService.requestHint(sessionId);
  setHint(hint);
};
```

### Save Work
```typescript
const handleSaveWork = (content: string, type: WorkProduct['type']) => {
  const workProduct: WorkProduct = {
    id: `wp_${Date.now()}`,
    step: session.currentStep,
    type,
    content,
    createdAt: new Date(),
  };
  
  homeworkService.updateSession(sessionId, {
    workProducts: [...session.workProducts, workProduct],
  });
};
```

### Update Settings
```typescript
const handleSettingChange = (key: keyof HomeworkSettings, value: boolean) => {
  const updatedSettings = {
    ...session.settings,
    [key]: value,
  };
  
  homeworkService.updateSession(sessionId, { settings: updatedSettings });
};
```

---

## 🧪 Testing

### Test IDs

**Session**:
- `homework-session`
- `step-understand`
- `step-plan`
- `step-solve`
- `step-check`
- `toggle-settings`
- `exit-session`
- `request-hint`
- `request-explanation`
- `complete-step`

**Settings**:
- `setting-read-aloud`
- `setting-parent-assist`
- `setting-show-hints`
- `setting-allow-calculator`

**Work Input**:
- `work-product-input`
- `mode-text`
- `mode-drawing`
- `mode-equation`
- `text-input`
- `equation-input`
- `save-work`

**Steps**:
- `checkpoint-{index}` (UnderstandStep)
- `strategy-{id}` (PlanStep)
- `plan-step-{index}` (PlanStep)
- `add-plan-step` (PlanStep)
- `toggle-calculator` (SolveStep)
- `reflection-input` (CheckStep)

### Playwright Example
```typescript
test('completes homework session', async ({ page }) => {
  await page.goto('/homework-helper/hw_123');
  
  // Understand step
  await page.click('[data-testid="checkpoint-0"]');
  await page.click('[data-testid="complete-step"]');
  
  // Plan step
  await page.click('[data-testid="strategy-use-formula"]');
  await page.fill('[data-testid="plan-step-0"]', 'Step 1');
  await page.click('[data-testid="complete-step"]');
  
  // Solve step
  await page.fill('[data-testid="text-input"]', 'My solution');
  await page.click('[data-testid="save-work"]');
  await page.click('[data-testid="complete-step"]');
  
  // Check step
  await page.fill('[data-testid="reflection-input"]', 'I learned...');
  await page.click('[data-testid="complete-step"]');
  
  await expect(page).toHaveURL(/\/homework-helper$/);
});
```

---

## 🔧 API

### homeworkService Methods

```typescript
// Get session
getSession(id: string): HomeworkSession | null

// Update session
updateSession(id: string, updates: Partial<HomeworkSession>): void

// Request hint
requestHint(id: string): Promise<string>

// Get explanation
explainStep(id: string, step: HomeworkStep): Promise<string>

// Complete step
completeStep(id: string, step: HomeworkStep): void

// Delete session
deleteSession(id: string): void

// Get all sessions
getAllSessions(): HomeworkSession[]
```

### stepGuidance Utilities

```typescript
// Get guidance for step
getStepGuidance(step: HomeworkStep): StepGuidance

// Get all guidance
getAllStepGuidance(): Record<HomeworkStep, StepGuidance>

// Navigate steps
getNextStep(current: HomeworkStep): HomeworkStep | null
getPreviousStep(current: HomeworkStep): HomeworkStep | null

// Progress
calculateStepProgress(session: HomeworkSession): number
isStepAccessible(step: HomeworkStep, completedSteps: HomeworkStep[]): boolean

// Display helpers
getStepIcon(step: HomeworkStep): string
getStepColor(step: HomeworkStep): string
```

---

## 💡 Tips

### Best Practices

1. **Always validate session exists**
   ```typescript
   if (!session) {
     return <div>Session not found</div>;
   }
   ```

2. **Clear hints/explanations on step change**
   ```typescript
   setHint(null);
   setExplanation(null);
   ```

3. **Show save feedback**
   ```typescript
   setSaveSuccess(true);
   setTimeout(() => setSaveSuccess(false), 2000);
   ```

4. **Handle edge cases**
   ```typescript
   const nextStepData = STEPS[nextIndex];
   if (!nextStepData) return; // Prevent undefined
   ```

5. **Use test IDs for all interactive elements**
   ```typescript
   <Button data-testid="complete-step">Next</Button>
   ```

### Common Mistakes

❌ **Don't**:
- Skip session validation
- Forget to update completedSteps
- Hardcode step titles (use stepGuidance)
- Ignore dark mode styles

✅ **Do**:
- Validate before rendering
- Update session in storage
- Use stepGuidance utilities
- Support both light/dark modes

---

## 📝 Example: Custom Step

```typescript
import { FC } from 'react';
import { HomeworkSession } from '@aivo/types';
import { getStepGuidance } from '@aivo/utils';

interface CustomStepProps {
  session: HomeworkSession;
}

export const CustomStep: FC<CustomStepProps> = ({ session }) => {
  const guidance = getStepGuidance(session.currentStep);
  
  return (
    <div data-testid="custom-step">
      <h2>{guidance.title}</h2>
      <p>{guidance.description}</p>
      
      {guidance.prompts.map((prompt, i) => (
        <div key={i}>{prompt}</div>
      ))}
      
      {guidance.checkpoints.map((checkpoint, i) => (
        <label key={i}>
          <input type="checkbox" />
          {checkpoint}
        </label>
      ))}
    </div>
  );
};
```

---

## 🎨 Styling Patterns

### Step Container
```tsx
<div className="space-y-6" data-testid="step-name">
  {/* Content */}
</div>
```

### Prompt Card
```tsx
<div className="p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
  <p className="text-sm">{prompt}</p>
</div>
```

### Checkpoint
```tsx
<label className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer">
  <input type="checkbox" className="mt-1 w-5 h-5" />
  <span className="text-sm">{checkpoint}</span>
</label>
```

### Progress Bar
```tsx
<div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
  <div 
    className="h-full bg-green-500 transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

---

## 🐛 Debugging

### Enable Debug Logs
```typescript
useEffect(() => {
  if (import.meta.env.DEV) {
    console.log('Session:', session);
    console.log('Current Step:', session?.currentStep);
    console.log('Completed:', session?.completedSteps);
    console.log('Work Products:', session?.workProducts.length);
  }
}, [session]);
```

### Inspect Session
```typescript
// In browser console
localStorage.getItem('aivo_homework_sessions');

// Or use homeworkService
const sessions = homeworkService.getAllSessions();
console.table(sessions);
```

### Test Hints
```typescript
// Mock hint response
jest.spyOn(homeworkService, 'requestHint').mockResolvedValue('Test hint');
```

---

## 🚀 Launch Checklist

- [ ] Session loads from URL param
- [ ] All 4 steps render correctly
- [ ] Step navigation works
- [ ] Progress bar updates
- [ ] Hints display properly
- [ ] Settings persist
- [ ] Work saves successfully
- [ ] Completion flow works
- [ ] Dark mode looks good
- [ ] Mobile responsive
- [ ] All test IDs present
- [ ] No TypeScript errors
- [ ] No console errors

---

**Quick Reference Version**: 1.0  
**Last Updated**: January 2025  
**Related**: PROMPT_38_HOMEWORK_GUIDANCE_COMPLETE.md
