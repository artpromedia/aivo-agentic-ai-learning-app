# Homework Helper - Usage Examples

Complete examples showing how to use the Homework Helper system in real applications.

## Example 1: Photo Upload Workflow

```typescript
import { homeworkService } from '@aivo/utils';

async function photoHomeworkWorkflow() {
  // Step 1: Get photo from file input
  const photoFile = document.querySelector<HTMLInputElement>('#file-input')?.files?.[0];
  if (!photoFile) return;

  // Step 2: Create session
  const session = await homeworkService.createSession({
    learnerId: 'student_123',
    title: 'Math Chapter 5 - Word Problems',
    inputMethod: 'photo',
    files: [photoFile],
  });

  console.log('Session created:', session.id);
  console.log('Detected subject:', session.detectedSubject);
  console.log('OCR status:', session.files[0].ocrStatus);

  // Step 3: Wait for OCR to complete
  await new Promise(resolve => setTimeout(resolve, 2500));
  const updatedSession = homeworkService.getSession(session.id);
  console.log('Extracted text:', updatedSession?.files[0].extractedText);

  return session;
}
```

## Example 2: Text Paste Workflow

```typescript
import { homeworkService } from '@aivo/utils';

async function textHomeworkWorkflow() {
  const homeworkText = `
Read the following passage and answer the questions:

The water cycle is the continuous movement of water on Earth.
Water evaporates, forms clouds, and returns as precipitation.

1. What is the water cycle?
2. Name three stages of the water cycle.
3. Why is the water cycle important?
`;

  const session = await homeworkService.createSession({
    learnerId: 'student_456',
    title: 'Science - Water Cycle Reading',
    inputMethod: 'text',
    text: homeworkText,
  });

  console.log('Problem statement:', session.problemStatement);
  console.log('Key questions:', session.keyQuestions);
  console.log('Detected elements:', session.extractedContent.detectedElements);

  return session;
}
```

## Example 3: Step-by-Step Guidance

```typescript
import { getStepGuidance } from '@aivo/utils';
import type { HomeworkStep } from '@aivo/types';

function showStepGuidance(step: HomeworkStep) {
  const guidance = getStepGuidance(step);

  console.log(`\n=== ${guidance.title} ===`);
  console.log(guidance.description);
  
  console.log('\nGuiding Questions:');
  guidance.prompts.forEach((prompt, i) => {
    console.log(`  ${i + 1}. ${prompt}`);
  });

  console.log('\nResources:');
  guidance.resources.forEach(resource => {
    console.log(`  - ${resource.type}: ${resource.title}`);
  });

  console.log('\nCheckpoints:');
  guidance.checkpoints.forEach(checkpoint => {
    console.log(`  ☐ ${checkpoint}`);
  });
}

// Show all steps
showStepGuidance('understand');
showStepGuidance('plan');
showStepGuidance('solve');
showStepGuidance('check');
```

## Example 4: Hint System

```typescript
import { homeworkService } from '@aivo/utils';

async function hintSystemExample(sessionId: string) {
  console.log('Student clicks "Need a hint?"...\n');

  // First hint
  const hint1 = await homeworkService.requestHint(sessionId);
  console.log('Hint 1:', hint1);

  // Second hint
  const hint2 = await homeworkService.requestHint(sessionId);
  console.log('Hint 2:', hint2);

  // Check hint usage
  const session = homeworkService.getSession(sessionId);
  console.log(`Total hints given: ${session?.hintsGiven}`);
}
```

## Example 5: Complete Homework Flow

```typescript
import { homeworkService, getStepGuidance, calculateStepProgress } from '@aivo/utils';

async function completeHomeworkFlow() {
  // 1. Create session
  const session = await homeworkService.createSession({
    learnerId: 'student_789',
    title: 'Algebra - Solving Equations',
    inputMethod: 'text',
    text: 'Solve for x: 2x + 5 = 13. Show your work.',
  });

  console.log('\n📚 Starting homework:', session.title);

  // 2. UNDERSTAND step
  console.log('\n📖 UNDERSTAND STEP');
  const understandGuidance = getStepGuidance('understand');
  console.log('Prompt:', understandGuidance.prompts[0]);
  
  const hint = await homeworkService.requestHint(session.id);
  console.log('Hint:', hint);

  homeworkService.completeStep(session.id);
  console.log('✅ Completed');

  // 3. PLAN step
  console.log('\n🗺️ PLAN STEP');
  let currentSession = homeworkService.getSession(session.id);
  console.log('Current step:', currentSession?.currentStep);
  
  const explanation = await homeworkService.explainStep(session.id, 'plan');
  console.log('Explanation:', explanation);

  homeworkService.completeStep(session.id);
  console.log('✅ Completed');

  // 4. SOLVE step
  console.log('\n✏️ SOLVE STEP');
  homeworkService.completeStep(session.id);
  console.log('✅ Completed');

  // 5. CHECK step
  console.log('\n✅ CHECK STEP');
  homeworkService.completeStep(session.id);
  console.log('✅ Completed');

  // 6. Session complete
  currentSession = homeworkService.getSession(session.id);
  console.log('\n🎉 Homework completed!');
  console.log('Status:', currentSession?.status);
  console.log('Progress:', calculateStepProgress(currentSession?.completedSteps || []), '%');
}
```

## Example 6: Session Management

```typescript
import { homeworkService, calculateStepProgress } from '@aivo/utils';

function sessionManagementExample(learnerId: string) {
  const sessions = homeworkService.getAllSessions(learnerId);

  console.log(`Homework Sessions for ${learnerId}:`);
  console.log(`Total: ${sessions.length}\n`);

  sessions.forEach((session, i) => {
    const progress = calculateStepProgress(session.completedSteps);
    const status = session.status === 'completed' ? '✅' : 
                   session.status === 'in-progress' ? '🔄' : '⏸️';

    console.log(`${i + 1}. ${status} ${session.title}`);
    console.log(`   Subject: ${session.detectedSubject}`);
    console.log(`   Progress: ${progress}%`);
    console.log(`   Current step: ${session.currentStep}`);
    console.log(`   Hints used: ${session.hintsGiven}`);
    console.log(`   Updated: ${new Date(session.updatedAt).toLocaleDateString()}\n`);
  });
}
```

## Example 7: Accessibility Settings

```typescript
import { homeworkService } from '@aivo/utils';

function configureAccessibility(sessionId: string) {
  const session = homeworkService.getSession(sessionId);
  if (!session) return;

  homeworkService.updateSession(sessionId, {
    settings: {
      ...session.settings,
      readAloud: true,
      showHints: true,
      allowCalculator: true,
      timerEnabled: false,
      breakReminders: true,
      targetReadingLevel: '3rd grade',
    },
  });

  console.log('✅ Accessibility settings updated');
  console.log('Read-aloud: ON');
  console.log('Calculator: ALLOWED');
  console.log('Reading level: 3rd grade');
}
```

## Example 8: Parent Assist Mode

```typescript
import { homeworkService } from '@aivo/utils';

function enableParentAssistMode(sessionId: string) {
  const session = homeworkService.getSession(sessionId);
  if (!session) return;

  homeworkService.updateSession(sessionId, {
    settings: {
      ...session.settings,
      parentAssistMode: true,
      showHints: false, // Parent manually shows hints
    },
  });

  console.log('👨‍👩‍👧 Parent Assist Mode enabled');
  console.log('\nTips for parents:');
  console.log('- Ask guiding questions, don\'t give answers');
  console.log('- Use hints to guide your child');
  console.log('- Let your child do the work');
}
```

## Example 9: Multiple File Upload

```typescript
import { homeworkService } from '@aivo/utils';

async function multipleFileWorkflow() {
  const files = Array.from(
    document.querySelector<HTMLInputElement>('#multi-file-input')?.files || []
  );

  const session = await homeworkService.createSession({
    learnerId: 'student_999',
    title: 'Science Lab Report',
    inputMethod: 'multiple',
    text: 'Hypothesis: Plants grow faster with more sunlight.',
    files: files, // diagram.png, data-table.jpg, results.pdf
  });

  console.log('Multiple files uploaded:');
  session.files.forEach(file => {
    console.log(`- ${file.name} (${file.size} bytes, OCR: ${file.ocrStatus})`);
  });

  console.log('\nCombined extracted content:');
  console.log(session.extractedContent.rawText.substring(0, 200) + '...');
}
```

## Example 10: React Component

```typescript
import { useState } from 'react';
import { homeworkService, getStepGuidance, calculateStepProgress } from '@aivo/utils';
import type { HomeworkSession } from '@aivo/types';

export function HomeworkHelper({ learnerId }: { learnerId: string }) {
  const [session, setSession] = useState<HomeworkSession | null>(null);
  const [hint, setHint] = useState<string>('');

  const handleCreateSession = async (files: File[], text?: string) => {
    const newSession = await homeworkService.createSession({
      learnerId,
      title: text?.substring(0, 50) || 'New Homework',
      inputMethod: files.length > 0 ? 'photo' : 'text',
      text,
      files,
    });
    setSession(newSession);
  };

  const handleRequestHint = async () => {
    if (!session) return;
    const newHint = await homeworkService.requestHint(session.id);
    setHint(newHint);
  };

  const handleCompleteStep = () => {
    if (!session) return;
    homeworkService.completeStep(session.id);
    const updated = homeworkService.getSession(session.id);
    setSession(updated);
  };

  if (!session) {
    return (
      <div className="homework-upload">
        <h2>Upload Your Homework</h2>
        <input type="file" accept="image/*,.pdf" />
        <textarea placeholder="Or paste your homework here..." />
        <button>Get Help</button>
      </div>
    );
  }

  const guidance = getStepGuidance(session.currentStep);
  const progress = calculateStepProgress(session.completedSteps);

  return (
    <div className="homework-helper">
      <header>
        <h1>{session.title}</h1>
        <div className="progress-bar">
          <div className="fill" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      </header>

      <div className="step-guidance">
        <h2>{guidance.title}</h2>
        <p>{guidance.description}</p>
        
        <div className="prompts">
          <h3>Guiding Questions:</h3>
          <ul>
            {guidance.prompts.map((prompt, i) => (
              <li key={i}>{prompt}</li>
            ))}
          </ul>
        </div>

        <div className="checkpoints">
          <h3>Checkpoints:</h3>
          <ul>
            {guidance.checkpoints.map((checkpoint, i) => (
              <li key={i}>
                <input type="checkbox" />
                <label>{checkpoint}</label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="actions">
        <button onClick={handleRequestHint} className="hint-button">
          💡 Need a hint?
        </button>
        {hint && (
          <div className="hint-display">
            <strong>Hint:</strong> {hint}
          </div>
        )}
        <button onClick={handleCompleteStep} className="complete-button">
          ✅ Complete Step
        </button>
      </div>

      <div className="settings">
        <label>
          <input type="checkbox" checked={session.settings.readAloud} />
          Read Aloud
        </label>
        <label>
          <input type="checkbox" checked={session.settings.allowCalculator} />
          Allow Calculator
        </label>
        <label>
          <input type="checkbox" checked={session.settings.parentAssistMode} />
          Parent Assist Mode
        </label>
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. Always Handle OCR Delays
```typescript
// Wait for OCR to complete before showing extracted text
const checkOCR = setInterval(() => {
  const session = homeworkService.getSession(sessionId);
  if (session?.files.every(f => f.ocrStatus === 'completed')) {
    clearInterval(checkOCR);
    showExtractedContent(session);
  }
}, 500);
```

### 2. Save Work Products
```typescript
const workProduct = {
  id: `work_${Date.now()}`,
  step: session.currentStep,
  type: 'text' as const,
  content: studentAnswer,
  createdAt: new Date(),
};

homeworkService.updateSession(sessionId, {
  workProducts: [...session.workProducts, workProduct],
});
```

### 3. Track Analytics
```typescript
const analytics = {
  sessionId: session.id,
  subject: session.detectedSubject,
  hintsUsed: session.hintsGiven,
  timeSpent: Date.now() - new Date(session.createdAt).getTime(),
  completedSteps: session.completedSteps.length,
};

console.log('Session analytics:', analytics);
```

### 4. Error Handling
```typescript
try {
  const session = await homeworkService.createSession(input);
  setSession(session);
} catch (error) {
  console.error('Failed to create homework session:', error);
  showError('Could not upload homework. Please try again.');
}
```

---

These examples demonstrate the full power of the Homework Helper system! 🚀
