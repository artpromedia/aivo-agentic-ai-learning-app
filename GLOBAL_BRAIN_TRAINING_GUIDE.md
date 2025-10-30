# Global Aivo Brain Training - Pre-Baseline Assessment

## 🌍 Overview

Before conducting baseline assessments, the Aivo Main Brain MUST be trained on comprehensive K-12 curriculum from all major global education systems. This ensures accurate, culturally-appropriate, and standards-aligned assessments for all learners.

## 📚 Training Coverage

### Regions & Curriculum Sources

| Region | Sources | Standards Count | Priority |
|--------|---------|----------------|----------|
| **United States** | Common Core (Math, ELA), NGSS Science, All 50 State Standards, AP Courses | ~15,000 | High |
| **Europe** | UK National Curriculum, IB (PYP/MYP/DP), Cambridge IGCSE, French/German/EU standards | ~8,000 | High |
| **Asia** | China, India (CBSE/ICSE), Japan (MEXT), South Korea, Singapore | ~12,000 | High |
| **Africa** | South Africa (CAPS), Nigeria, Kenya (8-4-4), Egypt | ~4,000 | Medium |
| **Middle East** | UAE, Saudi Arabia, Qatar, Israel, IB Middle Years | ~3,000 | Medium |

**Total Standards**: ~42,000 K-12 standards from 5 continents

## 🚀 Quick Start

### Option 1: Full Training (Recommended for Production)

```bash
cd services/ai-inference-service

# Full training with all providers (~4-6 hours)
python scripts/train_global_brain.py --providers openai,anthropic,gemini

# Training with validation
python scripts/train_global_brain.py --providers openai
```

### Option 2: Quick Training (Testing/Development)

```bash
# Quick mode processes ~500 standards per region
python scripts/train_global_brain.py --quick --providers openai

# Skip validation for faster testing
python scripts/train_global_brain.py --quick --skip-validation --providers openai
```

## 📋 Pre-Training Checklist

### 1. Environment Setup

- [ ] AI providers configured (OpenAI, Anthropic, Gemini)
- [ ] API keys loaded in `.env`
- [ ] Curriculum Service running (port 5000)
- [ ] AI Inference Service running (port 8002)
- [ ] Database connections verified

### 2. Curriculum Data

- [ ] Educational standards imported (US, UK, IB, etc.)
- [ ] School districts configured
- [ ] Training corpus prepared
- [ ] Regional data validated

### 3. AI Provider Status

Check provider availability:

```bash
# Test provider connections
curl http://localhost:9000/api/v1/ai/test-providers

# Check fallback order
curl http://localhost:9000/api/v1/ai/fallback-order
```

### 4. Training Execution

```bash
# Start training
python scripts/train_global_brain.py --providers openai,anthropic

# Monitor progress (logs)
tail -f training.log

# Check training reports
ls training_reports/
```

### 5. Post-Training Validation

- [ ] Validation tests pass (US/UK/Asia samples)
- [ ] Brain responds to multi-regional questions
- [ ] Special education adaptations work (ADHD, ASD, Dyslexia)
- [ ] All domains covered (reading, math, science, writing, SEL, speech)
- [ ] Grade-level appropriateness verified (K-12)

## 🧪 Verify Training Status

After training, verify the brain is ready:

```bash
# Check brain status
curl http://localhost:8002/v1/brain/status

# Test question generation
curl -X POST http://localhost:8002/v1/inference/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Generate a 5th grade math word problem about fractions",
    "context": {
      "domain": "math",
      "grade_band": "K-5",
      "region": "US"
    }
  }'
```

## 📊 Training Outputs

Training generates:

1. **Training Report** (`training_reports/global_brain_YYYYMMDD_HHMMSS.json`)
   - Duration, regions trained, standards processed
   - Examples generated, tokens used
   - Provider usage statistics
   - Errors encountered

2. **Training Log** (`training.log`)
   - Detailed progress logs
   - Per-source training status
   - Validation results

3. **Model Artifacts** (saved to model storage)
   - Base brain weights
   - Curriculum embeddings
   - Regional adaptations

## 🔄 Integration with Baseline Assessment

Once training is complete, the baseline assessment will:

1. **Use Trained Brain** for question generation
2. **Apply Regional Context** based on learner's location
3. **Follow Curriculum Standards** from learner's district
4. **Adapt for Special Needs** using trained accommodations
5. **Maintain Cultural Relevance** based on region

## ⚙️ Training Configuration

### Providers Priority

The system will attempt providers in order:

1. **OpenAI GPT-4** (fastest, most reliable)
2. **Anthropic Claude** (excellent reasoning)
3. **Google Gemini** (multimodal capabilities)
4. **Aivo Brain** (trained model, used after training)

### Training Parameters

```python
{
  "temperature": 0.7,  # Balanced creativity
  "max_tokens": 2000,  # Comprehensive responses
  "timeout": 30,       # 30 second timeout
  "retry_attempts": 3  # Retry failed requests
}
```

## 🚦 Current Status Indicators

### ✅ Ready for Baseline Assessment

- All regions trained (5/5)
- Validation tests passed
- Model artifacts saved
- Brain service running
- No training errors

### ⚠️ Partial Training

- Some regions trained (3-4/5)
- Minor validation warnings
- Some training errors (< 5%)
- Brain available with fallbacks

### ❌ Not Ready

- Training not started
- No regions trained
- Validation failed
- Brain service unavailable
- Major training errors (> 10%)

## 📞 Support

If training fails:

1. **Check Logs**: `tail -f training.log`
2. **Verify Providers**: Test AI provider connections
3. **Review Report**: Check `training_reports/` for details
4. **Retry Training**: Re-run with `--skip-validation` to continue
5. **Contact Support**: Provide training report and error logs

## 🎓 Next Steps

After successful training:

1. ✅ **Verify Brain Status**: Run validation tests
2. ✅ **Start Baseline Assessment**: Create assessment session
3. ✅ **Monitor Performance**: Track question quality and accuracy
4. ✅ **Collect Feedback**: Use Human-in-the-Loop for improvements
5. ✅ **Continuous Training**: Update with new district curriculum

---

**Important**: Training should be completed BEFORE allowing learners to take baseline assessments. The trained brain ensures culturally-appropriate, standards-aligned, and neurodiverse-friendly assessments.
