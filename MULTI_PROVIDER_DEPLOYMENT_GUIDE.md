# Multi-Provider AI - Deployment Guide

## 🚀 Quick Deployment (5 minutes)

### Step 1: Configure API Keys (2 min)

Add to your `.env` file or environment variables:

```bash
# Required: At least ONE provider
OPENAI_API_KEY=sk-proj-...              # OpenAI GPT-4
ANTHROPIC_API_KEY=sk-ant-api03-...      # Anthropic Claude
GOOGLE_API_KEY=AIzaSy...                # Google Gemini

# Optional: Model overrides
OPENAI_MODEL=gpt-4-turbo
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
GEMINI_MODEL=gemini-1.5-pro-latest
```

**Recommendation**: Configure all three for maximum reliability (99.99% uptime)

### Step 2: Install Dependencies (1 min)

```bash
cd services/api-gateway
pip install openai anthropic google-generativeai
```

### Step 3: Restart API Gateway (1 min)

```bash
# Stop existing service
pkill -f "uvicorn app.main:app"

# Start with new configuration
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 4: Verify Deployment (1 min)

```bash
# Run integration test
python test_integration.py

# Run comprehensive test suite
python test_multi_provider_baseline.py
```

Expected output:
```
✓ Database connection working
✓ Multi-provider AI service configured
✓ Baseline question generation functional
✓ Curriculum integration ready
```

---

## 📋 Pre-Deployment Checklist

### Environment Configuration
- [ ] API keys added to environment variables or `.env`
- [ ] At least one provider key configured (OpenAI, Anthropic, or Gemini)
- [ ] All three providers configured for maximum reliability (recommended)
- [ ] Model names verified (optional - defaults work for most cases)

### Dependency Installation
- [ ] `openai` package installed (`pip install openai`)
- [ ] `anthropic` package installed (`pip install anthropic`)
- [ ] `google-generativeai` package installed (`pip install google-generativeai`)
- [ ] Packages compatible with Python 3.10+

### Code Verification
- [ ] `multi_provider_ai.py` exists in `services/api-gateway/app/services/`
- [ ] `baseline_question_generator.py` imports `MultiProviderAIService`
- [ ] No import errors when running `python -c "from app.services.multi_provider_ai import MultiProviderAIService"`

### Testing
- [ ] Integration test runs successfully (`python test_integration.py`)
- [ ] Multi-provider test passes (`python test_multi_provider_baseline.py`)
- [ ] Provider detection shows expected primary and fallbacks
- [ ] At least one provider generates questions successfully

---

## 🔄 Deployment Steps

### Production Deployment

#### 1. Backup Current Configuration
```bash
# Backup current baseline_question_generator.py (if needed for rollback)
cp services/api-gateway/app/services/baseline_question_generator.py \
   services/api-gateway/app/services/baseline_question_generator.py.backup
```

#### 2. Set Environment Variables

**Option A: Using .env file**
```bash
cd services/api-gateway
cat >> .env << EOF
OPENAI_API_KEY=sk-proj-your-key-here
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
GOOGLE_API_KEY=AIzaSy-your-key-here
EOF
```

**Option B: System environment (Linux/Mac)**
```bash
export OPENAI_API_KEY=sk-proj-your-key-here
export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
export GOOGLE_API_KEY=AIzaSy-your-key-here
```

**Option C: System environment (Windows)**
```powershell
$env:OPENAI_API_KEY="sk-proj-your-key-here"
$env:ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
$env:GOOGLE_API_KEY="AIzaSy-your-key-here"
```

#### 3. Install Dependencies
```bash
cd services/api-gateway

# Install required packages
pip install openai anthropic google-generativeai

# Verify installations
python -c "import openai; import anthropic; import google.generativeai; print('✓ All packages installed')"
```

#### 4. Run Pre-Deployment Tests
```bash
# Quick integration test
python test_integration.py

# If that passes, run full test suite
python test_multi_provider_baseline.py
```

#### 5. Deploy to Production

**Using Docker:**
```bash
# Rebuild container with new dependencies
docker-compose build api-gateway

# Restart service
docker-compose up -d api-gateway

# Check logs
docker-compose logs -f api-gateway
```

**Using systemd:**
```bash
# Restart service
sudo systemctl restart aivo-api-gateway

# Check status
sudo systemctl status aivo-api-gateway

# Monitor logs
sudo journalctl -u aivo-api-gateway -f
```

**Manual restart:**
```bash
# Stop current process
pkill -f "uvicorn app.main:app"

# Start with reload
cd services/api-gateway
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 6. Post-Deployment Verification

**Immediate checks (first 5 minutes):**
```bash
# 1. Check service is running
curl http://localhost:8000/health

# 2. Generate test question
curl -X POST http://localhost:8000/api/baseline/generate \
  -H "Content-Type: application/json" \
  -d '{
    "learner_id": "test-001",
    "domain": "math",
    "sub_domain": "arithmetic",
    "grade_band": "K-5",
    "target_difficulty": 0.0,
    "current_theta": 0.0,
    "session_id": "deployment-test"
  }'

# 3. Check logs for provider usage
tail -n 50 logs/api-gateway.log | grep "Question generated using"
```

**Short-term monitoring (first hour):**
- Monitor error rates in logs
- Check provider fallback frequency
- Verify question generation latency
- Confirm all three providers are being used

**Long-term monitoring (first 24 hours):**
- Track provider distribution (should match configured priority)
- Monitor fallback rates (should be <5%)
- Check average latencies per provider
- Verify no unusual error patterns

---

## 📊 Monitoring Setup

### 1. Database Monitoring Tables

Add metadata tracking (optional but recommended):

```sql
-- Create metadata table if doesn't exist
CREATE TABLE IF NOT EXISTS baseline_item_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT NOT NULL,
    provider_used TEXT NOT NULL,
    model_used TEXT NOT NULL,
    latency_ms REAL NOT NULL,
    fallback_occurred BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES baseline_items(id)
);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_metadata_created 
ON baseline_item_metadata(created_at);

CREATE INDEX IF NOT EXISTS idx_metadata_provider 
ON baseline_item_metadata(provider_used);
```

### 2. Monitoring Queries

**Provider Usage Distribution:**
```sql
SELECT 
    provider_used,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage,
    ROUND(AVG(latency_ms), 0) as avg_latency_ms
FROM baseline_item_metadata
WHERE created_at > datetime('now', '-1 day')
GROUP BY provider_used
ORDER BY count DESC;
```

**Fallback Frequency:**
```sql
SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE fallback_occurred = 1) as fallback_count,
    COUNT(*) as total_count,
    ROUND(COUNT(*) FILTER (WHERE fallback_occurred = 1) * 100.0 / COUNT(*), 1) as fallback_rate
FROM baseline_item_metadata
WHERE created_at > datetime('now', '-7 days')
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Provider Reliability:**
```sql
SELECT 
    provider_used,
    COUNT(*) as total_attempts,
    SUM(CASE WHEN fallback_occurred = 0 THEN 1 ELSE 0 END) as primary_successes,
    ROUND(SUM(CASE WHEN fallback_occurred = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as reliability_pct
FROM baseline_item_metadata
WHERE created_at > datetime('now', '-30 days')
GROUP BY provider_used
ORDER BY reliability_pct DESC;
```

### 3. Alerting Thresholds

Set up alerts for:

- **High Fallback Rate** (>15%): Primary provider may be having issues
- **High Latency** (>3000ms avg): Performance degradation
- **Mock Provider Usage** (>1%): All real providers failing
- **Error Rate** (>5%): System instability

---

## 🐛 Troubleshooting

### Issue 1: "No module named 'openai'"

**Symptom**: Import error on startup
**Solution**:
```bash
pip install openai anthropic google-generativeai
```

### Issue 2: All providers using mock

**Symptom**: All questions generated with provider_used="mock"
**Solution**:
```bash
# Check API keys are set
python -c "import os; print('OpenAI:', bool(os.getenv('OPENAI_API_KEY'))); print('Anthropic:', bool(os.getenv('ANTHROPIC_API_KEY'))); print('Gemini:', bool(os.getenv('GOOGLE_API_KEY')))"

# If all show False, add keys to environment
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_API_KEY=AIza...

# Restart service
```

### Issue 3: High latency (>5 seconds)

**Symptom**: Questions taking >5 seconds to generate
**Solution**:
```bash
# Switch to Gemini as primary (fastest)
export AI_PRIMARY_PROVIDER=gemini

# Or configure fallback order
export AI_FALLBACK_CHAIN=gemini,anthropic,openai

# Restart service
```

### Issue 4: Rate limit errors

**Symptom**: Frequent 429 errors in logs, high fallback rate
**Solution**:
1. Add more providers to distribute load
2. Increase rate limits with provider
3. Implement request queuing (optional)
4. Cache questions more aggressively

### Issue 5: Inconsistent question quality

**Symptom**: Some questions better than others
**Solution**:
```bash
# Force specific high-quality model
export OPENAI_MODEL=gpt-4-turbo
export AI_PRIMARY_PROVIDER=openai

# Restart service
```

---

## 🔙 Rollback Plan

If issues occur after deployment:

### Quick Rollback (5 minutes)

```bash
# 1. Restore backup
cp services/api-gateway/app/services/baseline_question_generator.py.backup \
   services/api-gateway/app/services/baseline_question_generator.py

# 2. Remove multi-provider service
rm services/api-gateway/app/services/multi_provider_ai.py

# 3. Restart service
pkill -f "uvicorn app.main:app"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Complete Rollback

```bash
# Revert to previous commit
git checkout HEAD~1 -- services/api-gateway/app/services/baseline_question_generator.py
git checkout HEAD~1 -- services/api-gateway/app/services/multi_provider_ai.py

# Restart service
docker-compose restart api-gateway
```

---

## 📈 Cost Optimization

### Recommended Configurations

**Small Schools (<1000 students):**
```bash
AI_PRIMARY_PROVIDER=gemini          # Use cheapest provider
AI_FALLBACK_CHAIN=openai            # GPT-4 as backup only
```
**Expected cost**: $100-300/month

**Medium Schools (1000-10K students):**
```bash
AI_PRIMARY_PROVIDER=gemini          # Cost-effective primary
AI_FALLBACK_CHAIN=anthropic,openai # Quality backups
```
**Expected cost**: $500-3K/month

**Large Districts (>10K students):**
```bash
# Use default (OpenAI primary for quality)
# All three providers for maximum reliability
```
**Expected cost**: $5K-30K/month

---

## ✅ Post-Deployment Checklist

### Day 1: Immediate Verification
- [ ] Service started successfully
- [ ] No import/dependency errors in logs
- [ ] Provider detection shows expected configuration
- [ ] Test question generated successfully
- [ ] Correct provider used (matches primary configuration)

### Week 1: Short-term Monitoring
- [ ] Provider distribution matches expected (80%+ primary)
- [ ] Fallback rate <5%
- [ ] Average latency <1000ms
- [ ] No critical errors in logs
- [ ] Question quality maintained

### Month 1: Long-term Validation
- [ ] Cost tracking aligns with expectations
- [ ] Provider reliability >95%
- [ ] User feedback positive (question quality)
- [ ] Performance metrics stable
- [ ] Monitoring/alerting working correctly

---

## 📚 Related Documentation

- **Quick Reference**: [MULTI_PROVIDER_BASELINE_QUICK_REF.md](../MULTI_PROVIDER_BASELINE_QUICK_REF.md)
- **Full Guide**: [MULTI_PROVIDER_BASELINE_ASSESSMENT.md](../MULTI_PROVIDER_BASELINE_ASSESSMENT.md)
- **Implementation Summary**: [MULTI_PROVIDER_IMPLEMENTATION_SUMMARY.md](../MULTI_PROVIDER_IMPLEMENTATION_SUMMARY.md)
- **API Documentation**: [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)

---

**Status**: ✅ Ready for Production Deployment
**Estimated Deployment Time**: 5-10 minutes
**Risk Level**: Low (backward compatible, no breaking changes)
**Rollback Time**: <5 minutes
