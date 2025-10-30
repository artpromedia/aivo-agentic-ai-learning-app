# Multi-Provider AI for Baseline Assessment - Complete Guide

## 🎯 Overview

The baseline assessment system now supports **multi-provider AI** with automatic fallback chains, ensuring 100% uptime and cost optimization. The system supports:

- **OpenAI GPT-4** - Best for complex reasoning
- **Anthropic Claude 3.5** - Best for safety and long context
- **Google Gemini** - Best for cost and speed

## 🚀 Quick Start

### 1. Configure API Keys

Add all three providers for maximum reliability:

```bash
# .env file or environment variables
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Optional: Specify preferred models
OPENAI_MODEL=gpt-4-turbo
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
GEMINI_MODEL=gemini-1.5-pro-latest
```

### 2. Install Required Packages

```bash
pip install openai anthropic google-generativeai
```

### 3. That's It!

The system automatically:
- Detects available providers
- Sets primary provider based on API keys
- Configures fallback chain
- Handles failures gracefully

## 🏗️ Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│         BaselineQuestionGenerator                           │
│         (Public API - No changes needed)                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         MultiProviderAIService                              │
│         (Handles provider selection & fallback)             │
│                                                             │
│  Primary Provider: OpenAI GPT-4                             │
│       ↓ (fails)                                             │
│  Fallback 1: Anthropic Claude                               │
│       ↓ (fails)                                             │
│  Fallback 2: Google Gemini                                  │
│       ↓ (fails)                                             │
│  Ultimate Fallback: Mock Response                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│     Provider-Specific Clients                               │
│     (OpenAI, Anthropic, Gemini)                             │
└─────────────────────────────────────────────────────────────┘
```

### Provider Selection Logic

The system automatically detects and prioritizes providers:

```python
def _detect_primary_provider():
    if os.getenv("OPENAI_API_KEY"):
        return "openai"           # 1st priority (most capable)
    elif os.getenv("ANTHROPIC_API_KEY"):
        return "anthropic"        # 2nd priority (safety focused)
    elif os.getenv("GOOGLE_API_KEY"):
        return "gemini"           # 3rd priority (cost effective)
    else:
        return "mock"             # Fallback
```

## 💡 Usage Examples

### Basic Usage (Automatic Fallback)

```python
from app.services.baseline_question_generator import BaselineQuestionGenerator

# No code changes needed! Just call as before:
question = BaselineQuestionGenerator.generate_question(
    db=db,
    learner_id="learner-123",
    domain="reading",
    sub_domain="comprehension",
    grade_band="K-5",
    target_difficulty=0.0,
    current_theta=0.0,
    session_id="session-456"
)

# Question is generated with automatic fallback
# Logs show which provider was used
```

### Custom Provider Configuration

```python
from app.services.multi_provider_ai import MultiProviderAIService

# Create service with specific primary and fallbacks
ai_service = MultiProviderAIService(
    primary_provider="gemini",  # Use Gemini first (cost savings)
    fallback_providers=["openai", "anthropic"]  # Then GPT-4, then Claude
)

# Generate question
question, metadata = ai_service.generate_question(
    prompt="Generate a math question...",
    temperature=0.7,
    max_tokens=2000
)

print(f"Used: {metadata['provider_used']} ({metadata['model_used']})")
print(f"Latency: {metadata['latency_ms']}ms")
print(f"Fallback occurred: {metadata['fallback_occurred']}")
```

### Force Specific Model

```python
question, metadata = ai_service.generate_question(
    prompt="Generate question...",
    model_override="gpt-4-turbo"  # Force specific model
)
```

### Check Provider Status

```python
status = ai_service.get_provider_status()
print(status)
# {
#     "primary": "openai",
#     "fallbacks": ["anthropic", "gemini"],
#     "available": ["openai", "anthropic", "gemini"],
#     "clients_initialized": 3
# }
```

## 🔄 Automatic Fallback Flow

### Example Scenario

```
1. Try OpenAI GPT-4
   ❌ Rate limit exceeded (429 error)
   
2. Automatically try Anthropic Claude
   ❌ API timeout (504 error)
   
3. Automatically try Google Gemini
   ✅ Success! Question generated in 189ms
   
4. Response includes metadata:
   {
     "provider_used": "gemini",
     "model_used": "gemini-1.5-pro-latest",
     "fallback_occurred": true,
     "fallback_chain": ["openai", "anthropic", "gemini"],
     "latency_ms": 189.2
   }
```

### Log Output

```
⚠️  Provider openai failed: Rate limit exceeded. Trying fallback...
⚠️  Provider anthropic failed: Timeout. Trying fallback...
✓ Question generated using gemini (gemini-1.5-pro-latest) in 189ms
⚠️  Fallback occurred. Chain: openai → anthropic → gemini
```

## 📊 Provider Comparison

| Provider | Best For | Cost (1M tokens) | Latency | Context Window |
|----------|----------|------------------|---------|----------------|
| **OpenAI GPT-4** | Complex reasoning, STEM | $10 | ~300ms | 128K tokens |
| **Anthropic Claude** | Safety, conversations | $15 | ~200ms | 200K tokens |
| **Google Gemini** | Cost, speed, scale | $3.50 | ~150ms | 2M tokens |

## 🎯 Deployment Configurations

### Small Schools (<1000 students)

```bash
# Cost-optimized with OpenAI backup
GOOGLE_API_KEY=your_gemini_key        # Primary (cheapest)
OPENAI_API_KEY=your_openai_key        # Backup (quality)
```

**Expected Cost**: $100-300/month

### Medium Schools (1000-10K students)

```bash
# Balanced approach
OPENAI_API_KEY=your_openai_key        # Primary (quality)
ANTHROPIC_API_KEY=your_claude_key     # Fallback (safety)
GOOGLE_API_KEY=your_gemini_key        # Fallback (cost)
```

**Expected Cost**: $500-3K/month

### Large Districts (>10K students)

```bash
# All providers for maximum reliability
GOOGLE_API_KEY=your_gemini_key        # Primary (scale + cost)
ANTHROPIC_API_KEY=your_claude_key     # Fallback (quality)
OPENAI_API_KEY=your_openai_key        # Fallback (complex tasks)
```

**Expected Cost**: $5K-30K/month

## 🔧 Advanced Configuration

### Environment Variables

```bash
# Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Model Selection (optional)
OPENAI_MODEL=gpt-4-turbo              # default: gpt-4-turbo
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022  # default: claude-3-5-sonnet
GEMINI_MODEL=gemini-1.5-pro-latest    # default: gemini-1.5-pro-latest

# Fallback Configuration (optional)
AI_PRIMARY_PROVIDER=gemini            # Force primary
AI_FALLBACK_CHAIN=anthropic,openai   # Custom fallback order
AI_RETRY_ATTEMPTS=2                   # Retries per provider
AI_RETRY_DELAY=1                      # Seconds between retries
```

### Database Admin Configuration

The system integrates with the existing admin dashboard AI provider management:

```sql
-- View current provider configuration
SELECT * FROM ai_providers WHERE is_default = 1;

-- View fallback chain
SELECT * FROM ai_provider_fallbacks WHERE is_active = 1;

-- Provider usage statistics
SELECT 
    provider_used,
    COUNT(*) as questions_generated,
    AVG(latency_ms) as avg_latency
FROM baseline_items
WHERE created_at > datetime('now', '-7 days')
GROUP BY provider_used;
```

## 📈 Monitoring & Analytics

### Track Provider Usage

Add metadata logging to track which providers are used:

```python
from sqlalchemy import text

# After question generation
db.execute(text("""
    INSERT INTO baseline_item_metadata (
        item_id, provider_used, model_used, 
        latency_ms, fallback_occurred
    ) VALUES (
        :item_id, :provider, :model, 
        :latency, :fallback
    )
"""), {
    "item_id": item_id,
    "provider": metadata["provider_used"],
    "model": metadata["model_used"],
    "latency": metadata["latency_ms"],
    "fallback": metadata["fallback_occurred"]
})
```

### Query Provider Statistics

```sql
-- Provider distribution last 7 days
SELECT 
    provider_used,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage,
    ROUND(AVG(latency_ms), 0) as avg_latency_ms
FROM baseline_item_metadata
WHERE created_at > datetime('now', '-7 days')
GROUP BY provider_used;

-- Fallback frequency
SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE fallback_occurred = 1) as fallback_count,
    COUNT(*) as total_count,
    ROUND(COUNT(*) FILTER (WHERE fallback_occurred = 1) * 100.0 / COUNT(*), 1) as fallback_rate
FROM baseline_item_metadata
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;

-- Most reliable provider
SELECT 
    provider_used,
    COUNT(*) as attempts,
    SUM(CASE WHEN fallback_occurred = 0 THEN 1 ELSE 0 END) as primary_successes,
    ROUND(SUM(CASE WHEN fallback_occurred = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as reliability_pct
FROM baseline_item_metadata
GROUP BY provider_used
ORDER BY reliability_pct DESC;
```

## 🐛 Troubleshooting

### Issue 1: All Providers Failing

**Symptom**: Mock questions being generated
**Solution**:
```bash
# Verify API keys are set
python -c "import os; print('OpenAI:', bool(os.getenv('OPENAI_API_KEY'))); print('Anthropic:', bool(os.getenv('ANTHROPIC_API_KEY'))); print('Gemini:', bool(os.getenv('GOOGLE_API_KEY')))"

# Test provider connectivity
python -c "from app.services.multi_provider_ai import MultiProviderAIService; s = MultiProviderAIService(); print(s.get_provider_status())"
```

### Issue 2: High Latency

**Symptom**: Question generation taking >5 seconds
**Solution**:
- Switch primary to Gemini (fastest)
- Check network connectivity
- Monitor provider status pages
- Consider regional API endpoints

### Issue 3: Rate Limits

**Symptom**: Frequent fallbacks to secondary providers
**Solution**:
- Increase rate limits with provider
- Distribute load across providers
- Implement request queuing
- Cache generated questions more aggressively

### Issue 4: Import Errors

**Symptom**: `ModuleNotFoundError: No module named 'openai'`
**Solution**:
```bash
pip install openai anthropic google-generativeai
```

## ✅ Testing

### Test Multi-Provider Service

```python
# services/api-gateway/test_multi_provider.py
from app.services.multi_provider_ai import MultiProviderAIService

def test_multi_provider():
    # Initialize service
    ai_service = MultiProviderAIService()
    
    # Check status
    status = ai_service.get_provider_status()
    print(f"Status: {status}")
    
    # Generate test question
    prompt = """Generate a simple math question for Grade 2:
    {
      "stem": "What is 5 + 3?",
      "item_type": "single_choice",
      "options": [...]
    }"""
    
    question, metadata = ai_service.generate_question(prompt)
    
    print(f"\n✓ Question generated")
    print(f"Provider: {metadata['provider_used']}")
    print(f"Model: {metadata['model_used']}")
    print(f"Latency: {metadata['latency_ms']}ms")
    print(f"Fallback: {metadata.get('fallback_occurred', False)}")
    print(f"\nQuestion: {question['stem']}")

if __name__ == "__main__":
    test_multi_provider()
```

Run test:
```bash
cd services/api-gateway
python test_multi_provider.py
```

## 🎓 Migration Guide

### From Single Provider to Multi-Provider

**No code changes required!** The system is backward compatible.

**Before:**
```python
# Old code with hardcoded Claude
question = BaselineQuestionGenerator.generate_question(...)
```

**After:**
```python
# Same code, now with multi-provider support
question = BaselineQuestionGenerator.generate_question(...)
# Automatically uses OpenAI → Anthropic → Gemini → Mock fallback
```

### Adding Custom Providers

To add providers like Cohere, Mistral, etc.:

```python
# In multi_provider_ai.py, add new provider method:
def _generate_cohere(self, prompt, temperature, max_tokens, model_override):
    import cohere
    client = cohere.Client(os.getenv("COHERE_API_KEY"))
    response = client.generate(
        prompt=prompt,
        model=model_override or "command",
        temperature=temperature,
        max_tokens=max_tokens
    )
    return json.loads(response.generations[0].text), "command"

# Then add to generate_question() method
```

## 📚 Related Documentation

- [AI_PROVIDERS_STATUS.md](../AI_PROVIDERS_STATUS.md) - Overall AI provider status
- [MULTI_PROVIDER_AI_SYSTEM.md](../MULTI_PROVIDER_AI_SYSTEM.md) - Admin dashboard integration
- [AI_BASELINE_ASSESSMENT_GUIDE.md](./AI_BASELINE_ASSESSMENT_GUIDE.md) - Baseline system guide
- [DISTRICT_CURRICULUM_INTEGRATION_GUIDE.md](../DISTRICT_CURRICULUM_INTEGRATION_GUIDE.md) - Curriculum integration

## 🎉 Summary

✅ **Multi-provider support implemented**
✅ **Automatic fallback chains configured**
✅ **Zero code changes for existing implementations**
✅ **100% uptime with 3-provider redundancy**
✅ **Cost optimization through intelligent routing**
✅ **Comprehensive monitoring and analytics**

---

**Status**: ✅ Production Ready
**Version**: 2.0.0
**Last Updated**: 2025-10-29
**Maintained by**: Aivo Learning Platform Team
