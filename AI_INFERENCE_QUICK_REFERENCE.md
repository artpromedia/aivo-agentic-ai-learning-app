# AI Inference Service - Quick Reference Guide

## 🚀 Quick Start

### 1. Start the Service
```bash
cd services/ai-inference-service

# Copy environment template
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY="sk-..."

# Install dependencies
pip install -r requirements.txt

# Start Redis (required for brain caching)
docker run -d -p 6379:6379 redis:7-alpine

# Run the service
uvicorn app.main:app --reload --port 8002
```

### 2. Test the Service
```bash
# Health check
curl http://localhost:8002/health

# Root endpoint
curl http://localhost:8002/
```

## 📝 Common Usage Patterns

### Create a Brain Instance
```python
import requests

# Define learner profile
profile = {
    "learner_id": "jayden123",
    "age": 10,
    "grade_level": "5th grade",
    "learning_style": "visual",
    "diagnoses": ["adhd", "dyslexia"],
    "strengths": ["creative thinking", "problem solving"],
    "challenges": ["reading comprehension", "sustained attention"],
    "accommodations": ["extra time", "frequent breaks", "visual aids"],
    "preferred_complexity": "moderate",
    "attention_span_minutes": 15,
    "support_level": "substantial"
}

# Create brain
response = requests.post(
    "http://localhost:8002/v1/brain/create/jayden123",
    json=profile
)
brain_data = response.json()
brain_id = brain_data["brain_id"]
print(f"Brain created: {brain_id}")
```

### Generate a Hint
```python
# Request a hint
hint_request = {
    "brain_id": brain_id,
    "problem_context": "Solve the equation: 2x + 5 = 13",
    "current_attempt": "x = 4",
    "hint_level": "moderate",  # or "simple", "detailed"
    "subject": "algebra",
    "grade_level": "5th grade"
}

response = requests.post(
    "http://localhost:8002/v1/generate/hint",
    json=hint_request
)
hint = response.json()

print(f"Hint: {hint['hint_text']}")
print(f"Complexity: {hint['complexity_level']}")
print(f"Follow-ups: {hint['follow_up_questions']}")
print(f"Visual aids: {hint['visual_aids_suggested']}")
```

### Generate an Explanation
```python
# Request explanation
explanation_request = {
    "brain_id": brain_id,
    "concept": "solving linear equations",
    "subject": "algebra",
    "grade_level": "5th grade",
    "context": "Working on equations with variables on one side"
}

response = requests.post(
    "http://localhost:8002/v1/generate/explanation",
    json=explanation_request
)
explanation = response.json()

print(f"Explanation: {explanation['explanation_text']}")
print(f"Examples: {explanation['examples']}")
print(f"Analogies: {explanation['analogies']}")
```

### Record an Interaction
```python
# Record whether the hint was successful
response = requests.post(
    f"http://localhost:8002/v1/adapt/record-interaction/{brain_id}",
    params={
        "success": True,  # Did the hint help?
        "complexity_used": "moderate",
        "tokens": 150,
        "response_time_ms": 1250.0
    }
)
result = response.json()
print(f"Total interactions: {result['total_interactions']}")
print(f"Success rate: {result['success_rate']:.2%}")
```

### Adapt Brain Based on Outcomes
```python
# After several interactions, adapt the brain
recent_outcomes = [
    {"success": True, "complexity": "moderate"},
    {"success": True, "complexity": "moderate"},
    {"success": False, "complexity": "moderate"},
    {"success": True, "complexity": "moderate"},
    {"success": True, "complexity": "moderate"}
]

adaptation_request = {
    "brain_id": brain_id,
    "recent_outcomes": recent_outcomes
}

response = requests.post(
    "http://localhost:8002/v1/adapt/brain",
    json=adaptation_request
)
adapted = response.json()

print(f"New complexity: {adapted['preferred_complexity']}")
print(f"Adaptations made: {adapted['adaptations_made']}")
print(f"Success rate: {adapted['success_rate']:.2%}")
```

### Get Brain Statistics
```python
# Get brain stats for a learner
response = requests.get(
    f"http://localhost:8002/v1/brain/stats/jayden123"
)
stats = response.json()

print(f"Brain ID: {stats['brain_id']}")
print(f"Status: {stats['status']}")
print(f"Total interactions: {stats['total_interactions']}")
print(f"Success rate: {stats['success_rate']:.2%}")
print(f"Adaptations: {stats['adaptations_made']}")
print(f"Preferred complexity: {stats['preferred_complexity']}")
```

### Sync Brain to Global Model
```python
# Sync brain adaptations (happens automatically every hour)
response = requests.post(
    f"http://localhost:8002/v1/brain/sync/{brain_id}"
)
result = response.json()
print(f"Sync status: {result['status']}")
```

## 🎯 Diagnosis-Specific Examples

### ADHD Learner
```python
profile = {
    "learner_id": "student_adhd",
    "age": 9,
    "grade_level": "4th grade",
    "learning_style": "kinesthetic",
    "diagnoses": ["adhd"],
    "accommodations": ["frequent breaks", "movement breaks"],
    "preferred_complexity": "simple",
    "attention_span_minutes": 10,
    "support_level": "substantial"
}
# Brain will generate:
# - Short, focused hints
# - Bullet points
# - Clear structure
# - Lower temperature (0.6) for focused responses
```

### ASD Learner
```python
profile = {
    "learner_id": "student_asd",
    "age": 11,
    "grade_level": "6th grade",
    "learning_style": "visual",
    "diagnoses": ["asd"],
    "accommodations": ["visual schedules", "explicit instructions"],
    "preferred_complexity": "moderate",
    "support_level": "moderate"
}
# Brain will generate:
# - Explicit, literal language
# - Predictable format
# - Visual structure markers
# - Step-by-step instructions
```

### Dyslexia Learner
```python
profile = {
    "learner_id": "student_dyslexia",
    "age": 10,
    "grade_level": "5th grade",
    "learning_style": "auditory",
    "diagnoses": ["dyslexia"],
    "accommodations": ["text-to-speech", "phonetic support"],
    "preferred_complexity": "simple",
    "support_level": "substantial"
}
# Brain will generate:
# - Simple vocabulary
# - Phonetic breakdowns
# - Multi-sensory approach
# - Avoid long text blocks
```

## 🔧 Integration Examples

### Homework Helper Integration
```python
# In homework-helper service
async def get_hint_for_problem(problem_id: str, learner_id: str):
    # Get problem details
    problem = await db.get_problem(problem_id)
    
    # Get learner profile
    profile = await db.get_learner_profile(learner_id)
    
    # Get or create brain
    brain_response = await http_client.post(
        f"{AI_INFERENCE_URL}/v1/brain/create/{learner_id}",
        json=profile
    )
    brain_id = brain_response.json()["brain_id"]
    
    # Request hint
    hint_response = await http_client.post(
        f"{AI_INFERENCE_URL}/v1/generate/hint",
        json={
            "brain_id": brain_id,
            "problem_context": problem["description"],
            "current_attempt": problem.get("student_work", ""),
            "subject": problem["subject"],
            "grade_level": profile["grade_level"]
        }
    )
    
    return hint_response.json()
```

### Interactive Lessons Integration
```python
# In interactive-lessons service
async def explain_concept(concept: str, learner_id: str):
    # Get learner's brain
    profile = await db.get_learner_profile(learner_id)
    brain_response = await http_client.post(
        f"{AI_INFERENCE_URL}/v1/brain/create/{learner_id}",
        json=profile
    )
    brain_id = brain_response.json()["brain_id"]
    
    # Request explanation
    explanation_response = await http_client.post(
        f"{AI_INFERENCE_URL}/v1/generate/explanation",
        json={
            "brain_id": brain_id,
            "concept": concept,
            "subject": "current_subject",
            "grade_level": profile["grade_level"]
        }
    )
    
    return explanation_response.json()
```

### Metrics Tracking Integration
```python
# Record every interaction for adaptation
async def track_hint_usage(brain_id: str, was_helpful: bool, 
                          complexity: str, duration_ms: float):
    await http_client.post(
        f"{AI_INFERENCE_URL}/v1/adapt/record-interaction/{brain_id}",
        params={
            "success": was_helpful,
            "complexity_used": complexity,
            "tokens": 150,  # estimate or track
            "response_time_ms": duration_ms
        }
    )
```

## 📊 Monitoring

### Check Brain Status
```bash
# Get stats for a learner
curl http://localhost:8002/v1/brain/stats/jayden123
```

### Health Check
```bash
# Ensure service is running
curl http://localhost:8002/health
```

### Redis Connection
```bash
# Check Redis cache
docker exec -it <redis-container> redis-cli
> KEYS brain:*
> GET brain:jayden123
```

## 🐛 Troubleshooting

### Brain Not Found
```python
# Error: 404 Brain not found
# Solution: Create brain first
response = requests.post(
    f"http://localhost:8002/v1/brain/create/{learner_id}",
    json=learning_profile
)
```

### Redis Connection Error
```bash
# Error: Connection refused to Redis
# Solution: Start Redis
docker run -d -p 6379:6379 redis:7-alpine
```

### OpenAI API Error
```bash
# Error: OpenAI API key not configured
# Solution: Set in .env
OPENAI_API_KEY="sk-your-key-here"
```

### Import Errors
```bash
# Error: Module not found
# Solution: Install dependencies
pip install -r requirements.txt
```

## 🔐 Environment Variables

Required:
- `OPENAI_API_KEY`: OpenAI API key for inference

Optional:
- `REDIS_URL`: Redis connection URL (default: redis://localhost:6379/2)
- `BASE_MODEL_NAME`: Model to use (default: gpt-4-turbo)
- `BRAIN_SYNC_INTERVAL`: Sync interval in seconds (default: 3600)
- `MAX_BRAIN_INSTANCES`: Max cached brains (default: 1000)

## 📦 Docker Deployment

```bash
# Build image
docker build -t aivo-ai-inference:latest .

# Run container
docker run -d \
  -p 8002:8002 \
  -e OPENAI_API_KEY="your-key" \
  -e REDIS_URL="redis://redis:6379/2" \
  --name ai-inference \
  aivo-ai-inference:latest
```

## 🧪 Testing

```bash
# Run tests
cd services/ai-inference-service
pytest tests/ -v

# Run specific test
pytest tests/test_basic.py::test_brain_instance_creation -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

## 📈 Performance Tips

1. **Use Redis caching** - Brain instances are cached for 1 hour
2. **Batch interactions** - Record multiple interactions before adapting
3. **Monitor token usage** - Track costs via brain metrics
4. **Adjust sync interval** - Balance freshness vs. performance
5. **Use appropriate complexity** - Start with "moderate" and let adaptation work

## 🎓 Best Practices

1. **Create brain once per learner** - Reuse the same brain across sessions
2. **Record all interactions** - More data = better adaptation
3. **Adapt periodically** - After 5-10 interactions
4. **Sync regularly** - Let federated learning work
5. **Monitor success rates** - Track if hints are helping
6. **Use diagnosis info** - Provide complete learning profile
7. **Test with real learners** - Validate adaptations work

## 📚 API Documentation

Full API docs available at: http://localhost:8002/docs (Swagger UI)

Interactive API testing: http://localhost:8002/redoc (ReDoc)
