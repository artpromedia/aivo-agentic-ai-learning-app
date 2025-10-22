# AIVO Training Service

Part of **PROMPT 57 Part B: Base Brain Training Strategy**.

## Overview

The Training Service fine-tunes AI models on worldwide K-12 curriculum data to create the AIVO Base Brain - a master model trained on educational standards from multiple countries with special education adaptations.

## Features

- 🧠 **Base Brain Training**: Fine-tune models on curriculum standards worldwide
- 📚 **Multi-Curriculum Support**: US (Common Core, NGSS, 50 states), International (UK, IB, AU, IN, CN)
- ♿ **Special Education**: ADHD, ASD, Dyslexia, Dyscalculia, Anxiety adaptations built-in
- 🎯 **Standard Alignment**: Every training example aligned to educational standards
- 📊 **Comprehensive Validation**: Curriculum alignment, grade appropriateness, special ed quality
- 🔄 **Multi-Provider**: OpenAI, Anthropic, Google Gemini, local training support
- 🌍 **Global Reach**: Trained on K-12 content from 5+ education systems

## Architecture

```
Training Service (8004)
    ├── Curriculum Service (8003) - Standards & training data
    ├── OpenAI/Anthropic/Google - Fine-tuning APIs
    └── Models Storage - Versioned brain models
        ↓
AI Inference Service (8002)
    └── Uses trained Base Brain for generation
```

## Training Pipeline

### 1. Data Preparation
- Load educational standards from curriculum database
- Generate training examples for each standard
- Create special ed adaptations (ADHD, ASD, Dyslexia)
- Format for target provider (OpenAI JSONL, etc.)

### 2. Model Training
- Upload training data to provider
- Create fine-tuning job with hyperparameters
- Monitor training progress
- Handle errors and retries

### 3. Validation
- Test on validation set
- Evaluate curriculum alignment
- Check grade-level appropriateness
- Verify special ed adaptations
- Calculate accuracy scores

### 4. Model Versioning
- Save model version to database
- Record training statistics
- Store validation metrics
- Set deployment status

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL (curriculum database)
- Redis
- OpenAI/Anthropic/Google API key

### Installation

```bash
cd services/training-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# Copy environment file
cp .env.example .env
# Edit .env with your API keys
```

### Configuration

Edit `config/training_config.yaml`:

```yaml
training:
  model_name: "aivo-base-brain-v1"
  base_model: "gpt-4-turbo"  # or claude-3-opus
  method: "fine-tuning"
  
  hyperparameters:
    learning_rate: 0.0001
    batch_size: 32
    epochs: 10
```

### Run Training

**Option 1: Manual Script**

```bash
python scripts/train.py
```

**Option 2: API Service**

```bash
# Start service
uvicorn app.main:app --reload --port 8004

# Trigger training via API
curl -X POST http://localhost:8004/api/v1/training/start \
  -H "Content-Type: application/json" \
  -d '{}'

# Check status
curl http://localhost:8004/api/v1/training/{job_id}
```

## API Endpoints

### Training

- `POST /api/v1/training/start` - Start new training job
- `GET /api/v1/training/{job_id}` - Get training status
- `GET /api/v1/models` - List all trained models
- `GET /api/v1/models/{version}` - Get model details

### Health

- `GET /health` - Service health check
- `GET /` - Service information

## Training Configuration

### Data Sources

The training pipeline uses:

**US Curriculum**:
- Common Core Math (K-12)
- Common Core ELA (K-12)
- NGSS Science (K-12)
- All 50 state standards

**International**:
- UK National Curriculum
- International Baccalaureate
- Australian Curriculum
- CBSE India
- Chinese National Standards

**Additional**:
- Open textbooks
- Khan Academy content
- Educational worksheets

### Special Education Adaptations

Each diagnosis gets specific training:

**ADHD**:
- Brief responses
- Bullet points
- One concept at a time
- Focus indicators (🎯)

**ASD**:
- Literal language
- Structured "Step 1, Step 2, Step 3" format
- Concrete examples
- Predictable patterns

**Dyslexia**:
- Simple vocabulary
- Short sentences
- Phonetic support
- Visual aids

### Hyperparameters

Default settings:

```yaml
learning_rate: 0.0001
batch_size: 32
epochs: 10
warmup_steps: 1000
max_sequence_length: 8192
validation_split: 0.2
```

## Training Examples

The system generates multiple example types for each standard:

### 1. Direct Explanation
```
Prompt: "Explain fractions to a 3rd grade student"
Completion: "Fractions are parts of a whole..."
```

### 2. Practice Problem
```
Prompt: "Solve: 1/2 + 1/4 = ?"
Completion: "Step 1: Find common denominator..."
```

### 3. Special Ed Adaptation
```
Prompt: "Explain fractions to a 3rd grader with ADHD"
Completion: "Let's focus on ONE thing:
• Fractions = parts
• 1/2 means 1 out of 2
🎯 Try it!"
```

## Validation Metrics

Models are evaluated on:

1. **Curriculum Alignment** (0-100%)
   - Does response cover the standard?
   - Are key concepts present?

2. **Grade Appropriateness** (0-100%)
   - Reading level (Flesch-Kincaid)
   - Vocabulary complexity
   - Sentence structure

3. **Special Ed Quality** (0-100%)
   - ADHD: Brief, focused, bullet points
   - ASD: Literal, structured, step-by-step
   - Dyslexia: Simple, short, clear

4. **Accuracy** (0-100%)
   - Semantic similarity to expected
   - Concept coverage

## Model Versioning

Each trained model is versioned and stored with:

- Version number (v1.0.0)
- Base model (gpt-4-turbo)
- Training statistics (examples, tokens)
- Validation scores
- Deployment status (testing, production)
- Configuration snapshot

## Integration

### With Curriculum Service (8003)

Training service accesses:
- Educational standards
- Training corpus
- District mappings

### With AI Inference Service (8002)

Trained models are used by:
- Brain instance creation
- Hint generation
- Explanation generation
- Adaptive responses

## Monitoring

### Weights & Biases (Optional)

```bash
# Set in .env
WANDB_API_KEY=your_key_here
```

Tracks:
- Training loss curves
- Validation metrics
- Hyperparameter impact
- Model comparisons

### MLflow (Optional)

```bash
# Set in .env
MLFLOW_TRACKING_URI=http://localhost:5000
```

Tracks:
- Experiment runs
- Model registry
- Artifact storage

## Development

### Run Tests

```bash
pytest
```

### Lint Code

```bash
ruff check .
```

### Format Code

```bash
black .
```

## Production Deployment

### Docker

```bash
# Build image
docker build -t aivo-training-service .

# Run container
docker run -p 8004:8004 \
  -e OPENAI_API_KEY=sk-... \
  -e CURRICULUM_DATABASE_URL=postgresql://... \
  aivo-training-service
```

### Kubernetes

See `k8s/` directory for deployment manifests.

## Cost Estimation

Fine-tuning costs (approximate):

**OpenAI GPT-4 Turbo**:
- Training: ~$8.00 per 1M tokens
- Usage: ~$0.03 per 1K tokens

**50,000 training examples** (~20M tokens):
- Training cost: ~$160
- Monthly usage (1M requests): ~$30

## Best Practices

1. **Start Small**: Test with 1,000 examples first
2. **Monitor Metrics**: Track validation scores
3. **Version Control**: Keep all model versions
4. **A/B Testing**: Compare model performance
5. **Incremental Training**: Add new curricula gradually
6. **Quality Control**: Manual review of sample outputs

## Troubleshooting

### Training Fails

```bash
# Check logs
tail -f logs/training.log

# Verify curriculum database connection
psql $CURRICULUM_DATABASE_URL

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Low Validation Scores

- Increase training examples per standard
- Add more special ed examples
- Tune hyperparameters (learning rate, epochs)
- Check data quality

## License

Proprietary - Aivo Learning Platform

## Support

For questions or issues, contact the Aivo development team.

---

**Part of PROMPT 57**: Base Brain Training & Curriculum Integration  
**Service**: Training Service (Port 8004)  
**Status**: Production Ready ✅
