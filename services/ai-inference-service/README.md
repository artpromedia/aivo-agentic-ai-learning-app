# AIVO AI Inference Service

Federated brain cloning and adaptive learning service for personalized special education.

## Overview

The AI Inference Service provides:
- **Federated Brain Cloning**: Each learner gets their own AI brain instance
- **Adaptive Learning**: Real-time complexity adjustment based on learner outcomes
- **Special Education Support**: Diagnosis-specific accommodations (ADHD, ASD, Dyslexia)
- **Context-Aware Hints**: Scaffolded hint generation with learning style adaptation
- **Brain Metrics**: Track success rates, adaptations, and learning progress

## Architecture

### Federated Learning Pattern
```
Base Model (GPT-4 Turbo)
    ↓
Brain Cloning (per learner)
    ↓
Local Adaptation (real-time)
    ↓
Periodic Sync (global learning)
```

### Core Components

- **BrainManager**: Manages brain lifecycle, cloning, and adaptation
- **HintGenerator**: Generates adaptive hints with diagnosis-specific templates
- **ExplanationGenerator**: Creates detailed explanations with examples
- **InferenceEngine**: Handles AI inference using OpenAI/Anthropic
- **PromptTemplates**: Diagnosis and learning-style specific prompts

## Features

### 1. Brain Cloning
Each learner gets a personalized brain instance:
```python
brain = brain_manager.get_or_create_brain(learner_id, learning_profile)
```

### 2. Adaptive Hints
Hints adapt to learner profile and complexity level:
```python
hint = await hint_generator.generate_hint(brain, hint_request)
```

### 3. Real-time Adaptation
Brain adapts based on recent outcomes:
```python
brain = brain_manager.adapt_brain(brain_id, recent_outcomes)
```

### 4. Special Education Accommodations

**ADHD Adaptations**:
- Short, clear chunks
- Bullet points and numbered lists
- Focused responses (lower temperature)

**ASD Adaptations**:
- Explicit, literal language
- Predictable format
- Visual structure markers

**Dyslexia Adaptations**:
- Simple vocabulary
- Phonetic breakdowns
- Multi-sensory approach

## API Endpoints

### Brain Management

#### Create Brain
```
POST /v1/brain/create/{learner_id}
Body: LearningProfile
```

#### Get Brain Stats
```
GET /v1/brain/stats/{learner_id}
```

#### Sync Brain
```
POST /v1/brain/sync/{brain_id}
```

### Generation

#### Generate Hint
```
POST /v1/generate/hint
Body: HintRequest
```

#### Generate Explanation
```
POST /v1/generate/explanation
Body: ExplanationRequest
```

### Adaptation

#### Adapt Brain
```
POST /v1/adapt/brain
Body: AdaptationRequest
```

#### Record Interaction
```
POST /v1/adapt/record-interaction/{brain_id}
```

## Configuration

### Environment Variables

```bash
# Application
PROJECT_NAME="AIVO AI Inference Service"
DEBUG=false

# Model Configuration
BASE_MODEL_NAME="gpt-4-turbo"
MODEL_CACHE_DIR="/app/models"

# Brain Cloning
ENABLE_BRAIN_CLONING=true
MAX_BRAIN_INSTANCES=1000
BRAIN_SYNC_INTERVAL=3600

# Redis
REDIS_URL="redis://localhost:6379/2"
BRAIN_CACHE_TTL=3600

# API Keys
OPENAI_API_KEY="your-key-here"
ANTHROPIC_API_KEY="your-key-here"
```

## Data Models

### BrainInstance
```python
{
  "brain_id": "brain_learner123_abc12345",
  "learner_id": "learner123",
  "status": "active",
  "learning_profile": {...},
  "metrics": {
    "total_interactions": 150,
    "hint_success_rate": 0.75,
    "adaptations_made": 5
  }
}
```

### LearningProfile
```python
{
  "learner_id": "learner123",
  "age": 10,
  "grade_level": "5th grade",
  "learning_style": "visual",
  "diagnoses": ["adhd", "dyslexia"],
  "preferred_complexity": "moderate",
  "support_level": "substantial"
}
```

## Development

### Setup
```bash
cd services/ai-inference-service
pip install -r requirements.txt
```

### Run Locally
```bash
uvicorn app.main:app --reload --port 8002
```

### Run with Docker
```bash
docker build -t aivo-ai-inference .
docker run -p 8002:8002 -e OPENAI_API_KEY=your-key aivo-ai-inference
```

### Run Tests
```bash
pytest tests/
```

## Redis Cache Structure

Brain instances are cached in Redis:
```
Key: brain:{learner_id}
TTL: 3600 seconds (1 hour)
Value: JSON serialized BrainInstance
```

## Metrics Tracked

- **Total Interactions**: Number of hints/explanations generated
- **Success Rate**: Percentage of successful hint outcomes
- **Average Complexity**: Tracks complexity level usage
- **Adaptations Made**: Count of brain adaptations
- **Response Time**: Average inference response time
- **Tokens Used**: Total tokens consumed

## Special Education Features

### Complexity Levels
1. **Simple**: Basic guidance, minimal cognitive load
2. **Moderate**: Balanced support and challenge
3. **Detailed**: Comprehensive explanation with examples

### Learning Style Adaptation
- **Visual**: Diagrams, color-coding, graphic organizers
- **Auditory**: Verbal explanations, mnemonic devices
- **Kinesthetic**: Hands-on activities, movement-based
- **Reading/Writing**: Text-based, note-taking focused

### Diagnosis-Specific Prompts
Each diagnosis has tailored prompt templates that:
- Adapt language complexity
- Adjust cognitive load
- Provide appropriate scaffolding
- Use effective learning strategies

## Performance

- **Brain Cloning**: < 100ms per instance
- **Hint Generation**: 500-2000ms (depends on model)
- **Cache Hit Rate**: ~90% for active learners
- **Brain Sync**: Every 1 hour (configurable)

## Future Enhancements

- [ ] Multi-modal support (images, audio)
- [ ] Real-time collaboration hints
- [ ] Advanced federated learning aggregation
- [ ] Custom model fine-tuning per learner
- [ ] Parent/teacher dashboard integration
- [ ] A/B testing for hint strategies

## License

Proprietary - AIVO Learning Platform
