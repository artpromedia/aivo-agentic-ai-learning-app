# Multi-Provider AI - Quick Reference

## 🚀 Quick Setup (30 seconds)

### 1. Add API Keys
```bash
# Add to .env file
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

### 2. Install Dependencies
```bash
pip install openai anthropic google-generativeai
```

### 3. Done!
Automatic fallback is now enabled: OpenAI → Anthropic → Gemini → Mock

---

## 📦 What Was Changed

### New File
- `services/api-gateway/app/services/multi_provider_ai.py` (400 lines)
  - MultiProviderAIService class with 3 provider integrations
  - Automatic fallback chain mechanism
  - Provider detection and client initialization

### Modified Files
- `services/api-gateway/app/services/baseline_question_generator.py`
  - Removed: `import anthropic`, hardcoded `claude_client`
  - Added: `from app.services.multi_provider_ai import MultiProviderAIService`
  - Updated: `_call_ai_agent()` method to use multi-provider service

### No Breaking Changes
- Existing code works without modifications
- Same function signatures and return types
- Backward compatible with single-provider setup

---

## 🎯 Provider Priority

**Default Chain** (when all API keys configured):
```
1. OpenAI GPT-4        (best quality)
   ↓ (if fails)
2. Anthropic Claude    (best safety)
   ↓ (if fails)
3. Google Gemini       (best cost)
   ↓ (if fails)
4. Mock Response       (always works)
```

**Auto-Detected Based on Available Keys**:
- Only OpenAI key? → OpenAI → Mock
- Only Anthropic key? → Anthropic → Mock
- Only Gemini key? → Gemini → Mock
- No keys? → Mock only

---

## 💰 Cost Comparison

| Provider | Cost per 1M tokens | Use Case |
|----------|-------------------|----------|
| **Gemini** | $3.50 | 🏆 Best for scale & cost |
| **GPT-4** | $10.00 | 🧠 Best for complex reasoning |
| **Claude** | $15.00 | 🛡️ Best for safety & context |

**Recommendation**: Configure all three for maximum uptime and cost optimization.

---

## 🧪 Quick Test

```bash
cd services/api-gateway
python test_multi_provider_baseline.py
```

**Expected Output**:
```
✓ PASS  Provider Detection
✓ PASS  Basic Generation  
✓ PASS  All Providers
✓ PASS  Fallback Chain
✓ PASS  Curriculum Integration
✓ PASS  Performance Comparison

Total: 6/6 tests passed
🎉 All tests passed!
```

---

## 📊 Monitoring

### Check Provider Usage
```sql
SELECT 
    provider_used,
    COUNT(*) as count,
    ROUND(AVG(latency_ms), 0) as avg_latency_ms
FROM baseline_item_metadata
WHERE created_at > datetime('now', '-7 days')
GROUP BY provider_used;
```

### Track Fallback Rate
```sql
SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE fallback_occurred = 1) * 100.0 / COUNT(*) as fallback_rate_pct
FROM baseline_item_metadata
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;
```

---

## 🔧 Configuration Options

### Override Primary Provider
```bash
AI_PRIMARY_PROVIDER=gemini  # Force Gemini as primary
```

### Custom Fallback Chain
```bash
AI_FALLBACK_CHAIN=anthropic,openai  # Gemini → Anthropic → OpenAI
```

### Specify Models
```bash
OPENAI_MODEL=gpt-4-turbo
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
GEMINI_MODEL=gemini-1.5-pro-latest
```

---

## 🐛 Troubleshooting

### All providers fail (using mock)
```bash
# Check API keys are set
python -c "import os; print('OpenAI:', bool(os.getenv('OPENAI_API_KEY')))"

# Verify providers
cd services/api-gateway
python -c "from app.services.multi_provider_ai import MultiProviderAIService; print(MultiProviderAIService().get_provider_status())"
```

### High latency (>3 seconds)
- Switch to Gemini as primary: `AI_PRIMARY_PROVIDER=gemini`
- Check network connectivity
- Monitor provider status pages

### Rate limits hit frequently
- Add more providers for load distribution
- Increase rate limits with provider
- Implement request queuing

---

## 📚 Documentation

- **Full Guide**: [MULTI_PROVIDER_BASELINE_ASSESSMENT.md](../MULTI_PROVIDER_BASELINE_ASSESSMENT.md)
- **API Docs**: [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
- **Provider Status**: [AI_PROVIDERS_STATUS.md](../AI_PROVIDERS_STATUS.md)

---

## ✅ Implementation Checklist

- [x] Multi-provider service created (400 lines)
- [x] Baseline generator updated to use service
- [x] Automatic fallback chain implemented
- [x] Provider detection logic added
- [x] Metadata tracking (provider, model, latency)
- [x] Test suite created (6 comprehensive tests)
- [x] Documentation written (full guide + quick ref)
- [ ] API keys configured in production
- [ ] Test suite run successfully
- [ ] Monitoring queries set up

---

**Status**: ✅ Ready for Testing
**Next Step**: Configure API keys and run test suite
