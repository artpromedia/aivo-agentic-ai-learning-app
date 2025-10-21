# Homework Upload Interface - Visual Guide

## 🎨 Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│                     📚 Homework Helper                       │
│        Get step-by-step guidance on your homework           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Homework Title (optional)                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ e.g., Math Problem Set #3                               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│      📸      │      📄      │      ✏️      │
│  Take Photo  │ Upload File  │Type or Paste │
│              │              │              │
│ Snap picture │ PDF, DOCX or │Copy from     │
│ of homework  │ image files  │email/online  │
│              │              │              │
│ [Open Camera]│[Choose Files]│  [Use Text]  │
└──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Paste homework instructions (optional)                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │ Paste your homework problem or instructions here...     ││
│  │                                                          ││
│  └─────────────────────────────────────────────────────────┘│
│  250 characters                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Uploaded Files (2)                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📷  homework-page1.jpg           [Remove]              ││
│  │     2.3 MB                                              ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📄  instructions.pdf             [Remove]              ││
│  │     156.2 KB                                            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

              ┌────────────────────────────┐
              │ 🚀 Start Homework Session  │
              └────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  💡 Tips for Best Results                                    │
│  • Take clear, well-lit photos with all text visible        │
│  • Include all parts of multi-step problems                 │
│  • Upload teacher instructions or rubrics if available      │
│  • You can add multiple files for complex assignments       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎬 User Interactions

### Photo Capture Flow
```
1. Click "Open Camera" button
   ↓
2. Device camera opens
   ↓
3. Take photo
   ↓
4. Photo appears in "Uploaded Files" list
   ┌─────────────────────────────────┐
   │ 📷 IMG_1234.jpg    [Remove]    │
   │    1.8 MB                       │
   └─────────────────────────────────┘
```

### File Upload Flow
```
1. Click "Choose Files" button
   ↓
2. File picker dialog opens
   ↓
3. Select one or more files
   ↓
4. Files appear in list with icons
   ┌─────────────────────────────────┐
   │ 📄 homework.pdf    [Remove]    │
   │    245.6 KB                     │
   ├─────────────────────────────────┤
   │ 📝 notes.docx      [Remove]    │
   │    89.3 KB                      │
   └─────────────────────────────────┘
```

### Text Input Flow
```
1. Click "Use Text" OR scroll to text area
   ↓
2. Text area receives focus
   ↓
3. Paste or type homework content
   ┌──────────────────────────────────┐
   │ Solve for x: 2x + 5 = 13        │
   │ Show your work and explain...   │
   └──────────────────────────────────┘
   45 characters
```

### Submit Flow
```
1. Click "🚀 Start Homework Session"
   ↓
2. Button shows processing state
   ┌──────────────────────────────────┐
   │  ⟳  Processing...                │
   └──────────────────────────────────┘
   ↓
3. Session created
   ↓
4. Success screen appears
```

---

## 🌈 State Variations

### Empty State
```
┌─────────────────────────────────┐
│ 📚 Homework Helper               │
│                                  │
│ [Empty form]                     │
│ [3 input options]                │
│ [Empty text area]                │
│ [No files]                       │
│                                  │
│ [ Start Session ] (disabled)     │
└─────────────────────────────────┘
```

### With Files
```
┌─────────────────────────────────┐
│ 📚 Homework Helper               │
│                                  │
│ Title: Math Homework             │
│ [3 input options]                │
│ [Empty text area]                │
│                                  │
│ Uploaded Files (2)               │
│ • homework.jpg                   │
│ • notes.pdf                      │
│                                  │
│ [ Start Session ] (enabled)      │
└─────────────────────────────────┘
```

### Processing
```
┌─────────────────────────────────┐
│ 📚 Homework Helper               │
│                                  │
│ [All inputs shown]               │
│ [Files listed]                   │
│                                  │
│ [ ⟳ Processing... ] (disabled)   │
└─────────────────────────────────┘
```

### Success
```
┌─────────────────────────────────┐
│           🎉                     │
│    Session Created!              │
│                                  │
│ Session Details:                 │
│ • ID: hw_1234567_abc123         │
│ • Subject: Math                  │
│ • Files: 2 uploaded              │
│ • Step: understand               │
│                                  │
│ [Start New]  [Continue →]        │
└─────────────────────────────────┘
```

---

## 🎨 Visual Hierarchy

### Size Scale
```
Heading:     3xl (30px) - "📚 Homework Helper"
Subheading:  base (16px) - "Get step-by-step guidance..."
Section:     lg (18px) - "Uploaded Files (2)"
Body:        base (16px) - File names, descriptions
Small:       sm (14px) - File sizes, tips
Tiny:        xs (12px) - Character count
```

### Icon Scale
```
Main Emojis:  4xl (36px) - 📸 📄 ✏️
File Icons:   2xl (24px) - 📷 📄 📝 📎
UI Emojis:    xl (20px)  - 💡 🎉
```

### Spacing
```
Section Gap:     24px (space-y-6)
Grid Gap:        16px (gap-4)
Card Padding:    24px (p-6)
Button Padding:  12px 24px (px-6 py-3)
```

---

## 🖱️ Interactive Elements

### Buttons
```
Primary (Blue):
┌────────────────┐
│  🚀 Start      │ ← Hover: Darker blue, slight lift
└────────────────┘

Secondary (Neutral):
┌────────────────┐
│  Choose Files  │ ← Hover: Darker gray
└────────────────┘

Danger (Red):
┌────────────┐
│  Remove    │ ← Hover: Darker red, light bg
└────────────┘
```

### Cards
```
Default:
┌─────────────────┐
│  Content here   │
└─────────────────┘

Hover:
┌─────────────────┐
│  Content here   │ ← Shadow lifts
└─────────────────┘ ← Scale: 1.01
```

### File Items
```
Default:
┌──────────────────────────┐
│ 📷  file.jpg  [Remove]  │
└──────────────────────────┘

Hover:
┌──────────────────────────┐
│ 📷  file.jpg  [Remove]  │ ← Background lightens
└──────────────────────────┘
```

---

## 📱 Responsive Breakpoints

### Mobile (< 768px)
```
┌──────────────────┐
│                  │
│  [Photo]         │
│                  │
├──────────────────┤
│                  │
│  [File]          │
│                  │
├──────────────────┤
│                  │
│  [Text]          │
│                  │
└──────────────────┘
```

### Tablet (768px - 1024px)
```
┌─────────┬─────────┐
│         │         │
│ [Photo] │ [File]  │
│         │         │
└─────────┴─────────┘
┌───────────────────┐
│                   │
│     [Text]        │
│                   │
└───────────────────┘
```

### Desktop (> 1024px)
```
┌────────┬────────┬────────┐
│        │        │        │
│[Photo] │ [File] │ [Text] │
│        │        │        │
└────────┴────────┴────────┘
```

---

## 🌙 Dark Mode Comparison

### Light Mode
```
Background:   white / gray-50
Text:         gray-900
Border:       gray-200
Accent:       blue-600
```

### Dark Mode
```
Background:   gray-900 / gray-800
Text:         white / gray-100
Border:       gray-700
Accent:       blue-500
```

---

## ♿ Accessibility Features

### Keyboard Navigation
```
Tab Order:
1. Title input
2. Camera button
3. File button
4. Text button
5. Text area
6. File remove buttons
7. Submit button
```

### ARIA Labels
```
<button aria-label="Take photo of homework">
  Open Camera
</button>

<textarea aria-label="Homework text input">
</textarea>

<input 
  type="file" 
  aria-label="Upload homework files"
/>
```

### Focus Indicators
```
Default:  2px blue outline
Active:   2px blue outline + ring
Error:    2px red outline
```

---

## 🎯 Visual Feedback

### Success States

```
✅ File uploaded
✅ Session created
✅ Processing complete
```

### Loading
```
⟳ Processing...
⟳ Uploading files...
⟳ Analyzing content...
```

### Error
```
❌ Upload failed
❌ Invalid file type
❌ File too large
```

---

## 🖼️ File Type Icons

```
Image Files:    📷
PDF Documents:  📄
Word Docs:      📝
Other:          📎
```

---

This visual guide helps designers and developers understand the complete interface layout and behavior! 🎨
