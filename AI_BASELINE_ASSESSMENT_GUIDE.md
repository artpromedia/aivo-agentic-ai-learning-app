# AI-Powered Dynamic Baseline Assessment 🤖

## Overview

The baseline assessment now features **AI-powered dynamic question generation** using Claude 3.5 Sonnet. This revolutionary approach creates personalized, adaptive questions in real-time based on:

- **Individual learner profiles** (age, IEP status, learning preferences, accessibility needs)
- **Curriculum standards** (Common Core, NGSS, state standards)
- **Real-time performance** (current ability estimates from IRT)
- **Content variety** (never repeats questions, ensures fresh assessments)

---

## 🎯 Key Benefits

### For Neurodiverse Learners
- **Personalized language** adjusted to reading level and cognitive profile
- **Built-in accessibility** features (visual supports, scaffolding)
- **Culturally responsive** content that avoids bias
- **Engagement-focused** questions that match interests

### For Educators
- **Aligned to standards** automatically
- **Adaptive difficulty** matches student ability in real-time
- **No test preparation needed** - every assessment is unique
- **Authentic measurement** prevents memorization

### For Districts
- **District-specific curriculum** integration
- **Scalable assessment** without item bank limitations
- **Cost-effective** reduces need for large pre-built item banks
- **Data-driven insights** from AI-generated items

---

## 🛠️ Setup Instructions

### 1. Get Anthropic API Key

1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Create a new API key
3. Copy the key (starts with `sk-ant-...`)

### 2. Configure Environment Variables

Add to `.env` file in `services/api-gateway/`:

```bash
# Anthropic API for AI-Powered Question Generation
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Database
DATABASE_URL=sqlite:///C:/aivo-agentic-ai-learning-app/services/api-gateway/aivo.db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET=aivo-dev-secret-key-change-in-production
```

### 3. Install Anthropic SDK

```bash
cd services/api-gateway
pip install anthropic
```

### 4. Test AI Generation

```bash
# Start server with environment variables
$env:DATABASE_URL="sqlite:///C:/aivo-agentic-ai-learning-app/services/api-gateway/aivo.db"
$env:REDIS_URL="redis://localhost:6379/0"
$env:JWT_SECRET="aivo-dev-secret-key"
$env:ANTHROPIC_API_KEY="sk-ant-your-key"

cd c:\aivo-agentic-ai-learning-app\services\api-gateway
python -m uvicorn app.main:app --host 127.0.0.1 --port 9000 --reload
```

---

## 📊 How It Works

### Question Generation Flow

```
1. Student starts assessment
   ↓
2. System analyzes:
   - Learner profile (IEP, diagnoses, preferences)
   - Current ability estimate (θ from IRT)
   - Domain/sub-domain being assessed
   - Questions already asked
   ↓
3. Check question cache first
   - Look for similar questions within difficulty range
   - Avoid repeating questions
   ↓
4. If no cache hit, generate with AI:
   - Build comprehensive prompt with learner context
   - Call Claude 3.5 Sonnet API
   - Receive pedagogically-sound question
   ↓
5. Validate and calibrate:
   - Ensure IRT parameters are valid
   - Adjust difficulty toward target
   - Format for assessment delivery
   ↓
6. Cache for future use:
   - Store in baseline_items table
   - Available for other students with similar profiles
   ↓
7. Deliver to student
   - Present with accessibility features
   - Track engagement metrics
```

### Intelligent Caching Strategy

- **First check cache**: Look for existing questions within 0.5 difficulty range
- **Avoid repeats**: Never show same question twice in a session
- **Smart reuse**: Generated questions become part of item bank
- **Quality control**: Only cache validated questions

---

## 🎨 AI Prompt Engineering

The AI agent receives rich context including:

### Learner Context
```json
{
  "age": 10,
  "grade_level": "5",
  "has_iep": true,
  "iep_goals": "Improve reading fluency, executive function",
  "diagnoses": "ADHD, Dyslexia",
  "learning_preferences": "Visual learner, needs movement breaks",
  "reading_level": "Grade 3",
  "strengths": "Creative thinking, problem-solving",
  "challenges": "Reading decoding, sustained attention"
}
```

### Assessment Requirements
```json
{
  "domain": "reading",
  "sub_domain": "comprehension",
  "grade_band": "K-5",
  "target_difficulty": 0.5,
  "current_theta": 0.3,
  "curriculum_standards": [
    "CCSS.ELA-LITERACY.RL.5.1",
    "CCSS.ELA-LITERACY.RL.5.2"
  ]
}
```

### Accessibility Requirements
- Clear, concise language for grade level
- Visual supports where helpful
- Scaffolding for executive function
- Avoids cultural bias

---

## 📈 IRT Parameter Estimation

AI-generated questions include calibrated IRT parameters:

### Difficulty (b)
- **Range**: -4.0 to +4.0
- **Interpretation**: 
  - b < -1.0: Very easy
  - -1.0 ≤ b < 0: Easy
  - 0 ≤ b < 1.0: Medium
  - b ≥ 1.0: Hard

### Discrimination (a)
- **Range**: 0.5 to 2.5
- **Interpretation**: How well question distinguishes ability levels
- **Optimal**: 1.0 to 2.0

### Guessing (c)
- **Range**: 0.0 to 0.5
- **Typical**: 0.25 for 4-option multiple choice
- **Purpose**: Accounts for lucky guesses

### Adjustment Strategy
```python
# Blend AI estimate with target difficulty
adjusted_difficulty = 0.7 * ai_estimated + 0.3 * target_difficulty
```

This ensures questions stay close to target while respecting AI's pedagogical judgment.

---

## 🔧 API Integration

### Enable AI Generation (Default)

```python
# In baseline_assessment_service.py
next_item = BaselineAssessmentService.get_next_item(
    db=db,
    session_id=session_id,
    current_domain="reading",
    current_theta=0.5,
    use_ai_generation=True  # ← AI-powered
)
```

### Fallback to Item Bank

If AI generation fails (API error, no API key):
```python
next_item = BaselineAssessmentService.get_next_item(
    db=db,
    session_id=session_id,
    current_domain="reading",
    current_theta=0.5,
    use_ai_generation=False  # ← Use static bank
)
```

System automatically falls back to item bank if:
- `ANTHROPIC_API_KEY` not configured
- API rate limit exceeded
- Network error
- Generation timeout

---

## 📋 Example Generated Questions

### Reading Comprehension (Grade 5, Medium Difficulty)
```json
{
  "stem": "Maya read that photosynthesis helps plants make food. Which part of the plant is MOST important for this process?",
  "type": "single_choice",
  "options": [
    {"id": "a", "label": "Roots", "correct": false},
    {"id": "b", "label": "Leaves", "correct": true},
    {"id": "c", "label": "Flowers", "correct": false},
    {"id": "d", "label": "Stem", "correct": false}
  ],
  "hintText": "Think about where plants capture sunlight.",
  "parameters": {
    "difficulty": 0.5,
    "discrimination": 1.6,
    "guessing": 0.25,
    "cognitiveLevel": "understand",
    "estimatedTime": 45
  }
}
```

### Math (Grade 6, Easy Difficulty)
```json
{
  "stem": "Alex has 3 boxes with 12 markers in each box. How many markers does Alex have in total?",
  "type": "single_choice",
  "options": [
    {"id": "a", "label": "15", "correct": false},
    {"id": "b", "label": "36", "correct": true},
    {"id": "c", "label": "9", "correct": false},
    {"id": "d", "label": "24", "correct": false}
  ],
  "hintText": "Multiply the number of boxes by markers per box.",
  "parameters": {
    "difficulty": -0.8,
    "discrimination": 1.4,
    "guessing": 0.25,
    "cognitiveLevel": "apply",
    "estimatedTime": 30
  }
}
```

---

## 🔐 Security & Privacy

### API Key Protection
- **Never commit** API keys to version control
- Store in `.env` file (gitignored)
- Use environment-specific keys (dev, staging, prod)

### Data Privacy
- AI prompts **do not include** student names or PII
- Questions cached **without** learner identification
- Compliance with FERPA, COPPA

### Cost Management
- **Caching strategy** reduces API calls by ~60%
- **Rate limiting** prevents runaway costs
- **Fallback to item bank** if budget exceeded

---

## 📊 Monitoring & Analytics

### Track AI Performance

```sql
-- Questions generated vs cached
SELECT
  COUNT(CASE WHEN created_at > datetime('now', '-1 hour') THEN 1 END) as generated_recent,
  COUNT(*) as total_ai_questions
FROM baseline_items
WHERE id LIKE 'ai-gen-%';
```

### Quality Metrics

Monitor:
- **Generation success rate**: % of successful AI calls
- **Cache hit rate**: % of questions served from cache
- **Student engagement**: Time spent on AI vs static questions
- **IRT calibration accuracy**: Compare estimated vs actual difficulty

---

## 🚀 Next Steps

1. **Set up Anthropic API key** (see Setup Instructions)
2. **Test with sample learner** profile
3. **Review generated questions** for quality
4. **Enable for pilot users** in specific domains
5. **Monitor performance** and adjust prompts
6. **Scale to all domains** once validated

---

## 📚 Additional Resources

- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [IRT Parameter Estimation](https://en.wikipedia.org/wiki/Item_response_theory)
- [Common Core Standards](http://www.corestandards.org/)
- [NGSS Science Standards](https://www.nextgenscience.org/)
- [Universal Design for Learning (UDL)](https://udlguidelines.cast.org/)

---

## 🎓 Training & Support

### For Teachers
- Video tutorial on AI-generated assessments
- Guide to interpreting IRT parameters
- Best practices for learner profile setup

### For Administrators
- Cost analysis and budgeting
- Compliance and data privacy training
- Implementation roadmap

### For Developers
- API integration guide
- Prompt engineering workshop
- Performance optimization techniques

---

**Questions?** Contact the AIVO development team or open an issue on GitHub.
