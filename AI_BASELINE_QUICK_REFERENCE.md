# AI Baseline Assessment - Quick Reference 🚀

## Setup (2 minutes)

```bash
# 1. Get API key from https://console.anthropic.com/
# 2. Add to .env
echo "ANTHROPIC_API_KEY=sk-ant-your-key" >> services/api-gateway/.env

# 3. Install SDK
cd services/api-gateway
pip install anthropic

# 4. Test
python test_ai_generation.py
```

## Usage

### Generate Question
```python
from app.services.baseline_question_generator import BaselineQuestionGenerator

question = BaselineQuestionGenerator.generate_question(
    db=db,
    learner_id="student-123",
    domain="reading",
    sub_domain="comprehension",
    grade_band="K-5",
    target_difficulty=0.5,
    current_theta=0.3,
    session_id="session-abc"
)
```

### Check Cache First
```python
cached = BaselineQuestionGenerator._check_question_cache(
    db=db,
    domain="math",
    sub_domain="operations",
    grade_band="6-8",
    target_difficulty=0.0,
    asked_questions=[]
)
```

## Response Format

```python
{
    "id": "ai-gen-reading-K-5-abc123def456",
    "stem": "What is the main idea of the passage?",
    "type": "single_choice",
    "options": [
        {"id": "a", "label": "Text", "correct": true},
        {"id": "b", "label": "Text", "correct": false}
    ],
    "parameters": {
        "difficulty": 0.45,
        "discrimination": 1.65,
        "guessing": 0.25,
        "cognitiveLevel": "understand",
        "estimatedTime": 45
    },
    "domain": "reading",
    "subDomain": "comprehension",
    "gradeBand": "K-5",
    "hintText": "Look for the sentence that summarizes...",
    "cached": false
}
```

## Cost

- **Per question**: ~$0.003 (with Claude 3.5 Sonnet)
- **With caching**: ~$0.0012 average
- **Per assessment** (30 questions): ~$0.036

## Performance

- **Generation time**: 2-4 seconds
- **Cache retrieval**: <50ms
- **Cache hit rate**: ~60% after warmup

## Monitoring

```sql
-- Questions generated today
SELECT COUNT(*) FROM baseline_items
WHERE id LIKE 'ai-gen-%'
AND created_at > date('now');

-- Cache hit rate
SELECT
  COUNT(CASE WHEN cached = 1 THEN 1 END) * 100.0 / COUNT(*) as cache_hit_rate
FROM assessment_analytics;
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "ANTHROPIC_API_KEY not configured" | Add key to `.env` file |
| "API rate limit exceeded" | System auto-falls back to item bank |
| "JSON parsing error" | Claude returned markdown - check prompt |
| Slow generation | Normal for first request (2-4s) |

## Fallback

If AI fails, system automatically uses static item bank:
```python
use_ai_generation=False  # Fallback mode
```

## Links

- 📖 [Full Guide](./AI_BASELINE_ASSESSMENT_GUIDE.md)
- 📊 [Implementation Summary](./AI_BASELINE_IMPLEMENTATION_SUMMARY.md)
- 🔧 [Anthropic Docs](https://docs.anthropic.com/)
