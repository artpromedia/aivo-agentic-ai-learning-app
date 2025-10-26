# 🧪 Baseline Results Testing Quick Reference

## 🚀 **Quick Start Testing**

### Learner Results Page (No Auth Required)

```
URL: http://localhost:5173/#/demo/baseline-results/test-session-123
```

**What to Check:**
- [ ] Confetti plays (unless reduced motion enabled)
- [ ] 4 domain cards render (Reading, Math, Science, SEL)
- [ ] Grade level badges show
- [ ] Fluency metrics display
- [ ] "Continue Learning" button works

**Expected Data:**
- Reading: 4th Grade
- Math: 3rd Grade
- Science: 4th Grade
- SEL: 4th Grade
- Reading Fluency: 95 WPM, 97% accuracy
- Time: 45 minutes
- Engagement: High

---

### Parent Results Page (Auth Required)

```
URL: http://localhost:5174/children/test-child/baseline/test-session-123
```

**What to Check:**
- [ ] Executive summary loads
- [ ] All 4 tabs work
- [ ] IRT visualization displays
- [ ] Strengths/gaps render
- [ ] Export buttons enabled

**Expected Data:**
- Overall Performance: Advanced (Grade 4.2)
- Reading Ability: +0.8 (Above Grade Level)
- Math Ability: +0.2 (At Grade Level)
- Science Ability: +0.5 (Above Grade Level)
- SEL Ability: +0.3 (At Grade Level)

---

## 🎨 **Visual Testing**

### Confetti Animation
```javascript
// Should play for 3 seconds
// Should NOT play if prefers-reduced-motion is enabled
```

**Test Reduced Motion:**
1. In DevTools > Rendering > Emulate CSS prefers-reduced-motion: reduce
2. Reload page
3. Confetti should NOT play

### Domain Cards
```
Expected Colors:
- Reading: Blue (#3B82F6)
- Math: Purple (#8B5CF6)
- Science: Green (#10B981)
- SEL: Orange (#F59E0B)
```

### IRT Visualization
```
Scale: -3 to +3
Student mark should be clearly visible
Confidence interval should be shaded
Grade band markers should show
```

---

## ⌨️ **Keyboard Testing**

### Tab Order (Learner Page)
1. Domain cards (4 stops)
2. Fluency metrics (4 stops)
3. Learning supports badges
4. Next steps items
5. "Continue Learning" button

### Tab Order (Parent Page)
1. Executive summary metrics
2. Domain tabs (4 stops)
3. Technical IRT toggle
4. Export buttons (3 stops)
5. Content within active tab

**Test:**
- Press Tab repeatedly
- Each stop should show clear focus ring
- No focus traps or infinite loops
- Space/Enter should activate buttons

---

## 📱 **Responsive Testing**

### Breakpoints to Test

**Mobile (320px - 639px):**
```
Domain cards: Stack vertically (1 column)
Fluency metrics: Stack vertically
Executive summary: Stack metrics
Tabs: Horizontal scroll
```

**Tablet (640px - 1023px):**
```
Domain cards: 2x2 grid
Fluency metrics: 2x2 grid
Executive summary: 2 columns
Tabs: All visible
```

**Desktop (1024px+):**
```
Domain cards: 2x2 grid
Fluency metrics: 1x4 row
Executive summary: 3 columns
Tabs: All visible with padding
```

**Test in DevTools:**
```
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select responsive mode
4. Test at: 320px, 375px, 768px, 1024px, 1440px
```

---

## 🔍 **API Testing**

### Mock Data Currently Active

Both pages use inline mock data. To test real API:

**Learner App:**
```typescript
// In LearnerResultsPage.tsx, line ~60
// Comment out mock data, uncomment API call:

useEffect(() => {
  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await BaselineAPI.getResults(sessionId!);
      setResults(data);
    } catch (error) {
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };
  
  loadResults();
}, [sessionId]);
```

**Test API Endpoint:**
```bash
curl http://localhost:9000/api/baseline/sessions/test-session-123/results
```

**Expected Response:**
```json
{
  "sessionId": "test-session-123",
  "learnerId": "learner-123",
  "learnerName": "Alex",
  "completedAt": "2024-12-15T10:30:00Z",
  "totalTimeMinutes": 45,
  "overallEngagement": "high",
  "domains": { ... },
  "learningSupports": ["visual", "kinesthetic"],
  "readingFluency": { ... },
  "nextSteps": [ ... ]
}
```

---

## 📥 **Export Testing**

### PDF Export

**Test:**
1. Click "Download Report (PDF)" button
2. Check file downloads: `alex-baseline-assessment-2024-12-15.pdf`
3. Open PDF and verify:
   - [ ] Cover page with learner name
   - [ ] Executive summary
   - [ ] Domain analysis tables
   - [ ] Strengths and gaps
   - [ ] Recommendations
   - [ ] Professional formatting

**If PDF Fails:**
```
Check console for errors
Verify jspdf and jspdf-autotable are installed:
pnpm list jspdf jspdf-autotable --filter @aivo/learner-app
```

### CSV Export

**Test:**
1. Click "Export Data (CSV)" button
2. Check file downloads: `alex-baseline-results-2024-12-15.csv`
3. Open in Excel/Sheets and verify:
   - [ ] Headers present
   - [ ] All domain data included
   - [ ] Fluency metrics (if applicable)
   - [ ] Proper formatting (no broken cells)

### Print Layout

**Test:**
1. Click "Print" button
2. Check print preview:
   - [ ] No cut-off content
   - [ ] Page breaks at logical points
   - [ ] Headers/footers if applicable
   - [ ] No background animations

---

## ♿ **Accessibility Testing**

### Screen Reader Testing

**Windows (NVDA):**
```
1. Install NVDA (free)
2. Start NVDA
3. Navigate page with arrow keys
4. Check all content is announced
5. Verify button labels make sense
```

**macOS (VoiceOver):**
```
1. Press Cmd + F5 to start VoiceOver
2. Use VO + arrow keys to navigate
3. Check all content is announced
4. Verify ARIA labels are correct
```

**Expected Announcements:**
- "Reading domain: 4th grade level"
- "Math domain: 3rd grade level"
- "Reading fluency: 95 words per minute"
- "Download report PDF button"
- "Continue learning button"

### ARIA Testing

**Check in DevTools:**
```html
<!-- Domain cards should have: -->
<div role="article" aria-label="Reading domain results">

<!-- Buttons should have: -->
<button aria-label="Download PDF report">

<!-- Tabs should have: -->
<button role="tab" aria-selected="true" aria-controls="reading-panel">

<!-- Tab panels should have: -->
<div role="tabpanel" id="reading-panel" aria-labelledby="reading-tab">
```

### Focus Testing

**Test:**
1. Press Tab to navigate through page
2. Each interactive element should show clear focus ring
3. Skip links should work (if present)
4. No focus traps (can Tab forward and Shift+Tab back)

---

## 🐛 **Common Issues & Fixes**

### Issue: Confetti not showing
```
✓ Check: prefers-reduced-motion not enabled
✓ Check: Window size > 0
✓ Check: react-confetti installed
✓ Fix: npm install react-confetti
```

### Issue: Routes show 404
```
✓ Check: HashRouter in learner-app (uses /#/ prefix)
✓ Check: BrowserRouter in parent-portal (no # prefix)
✓ Fix: Verify route path matches App.tsx configuration
```

### Issue: PDF download fails
```
✓ Check: jspdf and jspdf-autotable installed
✓ Check: Browser console for errors
✓ Fix: pnpm add jspdf jspdf-autotable --filter @aivo/learner-app
```

### Issue: IRT visualization not displaying
```
✓ Check: Browser supports SVG
✓ Check: Data has theta values
✓ Fix: Ensure domain.theta is a valid number between -3 and +3
```

### Issue: Tabs not working
```
✓ Check: onClick handlers present
✓ Check: activeTab state updates
✓ Fix: Verify useState and setState logic
```

---

## 🎯 **Test Scenarios**

### Scenario 1: Successful Assessment

**Given:** Learner completes baseline assessment
**When:** Assessment finishes
**Then:** 
- Navigate to results page
- Show confetti animation
- Display all domain scores
- Show next steps
- Enable "Continue Learning" button

### Scenario 2: Parent Reviews Child Results

**Given:** Parent logged in
**When:** Parent clicks on child's completed assessment
**Then:**
- Load comprehensive results
- Show executive summary
- Enable all domain tabs
- Display IRT metrics (with toggle)
- Enable PDF/CSV export

### Scenario 3: Fluency Data Available

**Given:** Reading assessment includes fluency test
**When:** Results page loads
**Then:**
- Show WPM (words per minute)
- Show accuracy percentage
- Show expression level
- Show automaticity score
- Display fluency badge

### Scenario 4: Speech Therapy Metrics

**Given:** Learner has speech therapy enabled
**When:** Results include speech data
**Then:**
- Show articulation score
- Show fluency disruptions
- Show clarity rating
- Display therapy-specific recommendations

### Scenario 5: Export Workflows

**Given:** Results page loaded
**When:** User clicks export button
**Then:**
- PDF: Download complete report
- CSV: Download data file
- Print: Open print dialog with clean layout

---

## 📊 **Performance Benchmarks**

### Load Times
- Initial page load: < 2 seconds
- Confetti animation: Starts within 100ms
- Tab switching: < 50ms
- Export generation: < 1 second

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

**Run Lighthouse:**
```
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select categories
4. Click "Generate report"
```

---

## 🔄 **Continuous Testing**

### Before Every Commit
- [ ] Run TypeScript compiler: `pnpm type-check`
- [ ] Run linter: `pnpm lint`
- [ ] Test key user flows manually
- [ ] Check console for errors

### Before Deployment
- [ ] Full accessibility audit
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Performance testing
- [ ] Security review

---

## 📞 **Report Issues**

If you find bugs:
1. Check console for errors
2. Note browser and version
3. Note steps to reproduce
4. Screenshot if visual issue
5. Report to dev-team@aivolearning.com

---

**Quick Reference Created:** December 2024
**Last Updated:** December 2024
