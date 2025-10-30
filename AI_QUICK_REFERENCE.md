# 🚀 AI Provider Quick Reference Card

## Current Configuration Status

✅ **Mock AI Mode: ENABLED**  
The system is configured for development/testing without real API keys.

---

## Quick Commands

### Test Configuration
```powershell
cd c:\aivo-agentic-ai-learning-app\services\api-gateway
python test_ai_config.py
```

### Start Backend (Mock Mode)
```powershell
cd c:\aivo-agentic-ai-learning-app\services\api-gateway
python -m uvicorn app.main:app --reload --port 9000
```

### Start Frontend
```powershell
cd c:\aivo-agentic-ai-learning-app\apps\learner-app
pnpm dev
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `services/api-gateway/.env` | Main configuration (edit API keys here) |
| `services/api-gateway/.env.example` | Template for new developers |
| `services/api-gateway/app/core/config.py` | Settings loader |

---

## Switching Modes

### 🧪 Development Mode (Current - Mock AI)
**File:** `services/api-gateway/.env`
```bash
USE_MOCK_AI=true
# No API keys needed!
```

### 🔑 Production Mode (Real AI)
**File:** `services/api-gateway/.env`
```bash
# Comment out or remove the mock line:
# USE_MOCK_AI=true

# Add at least one real API key:
OPENAI_API_KEY=sk-proj-your-real-key-here
```

---

## Getting API Keys

| Provider | URL | Free Tier |
|----------|-----|-----------|
| **OpenAI** | https://platform.openai.com/api-keys | $5 credit |
| **Anthropic** | https://console.anthropic.com/settings/keys | Limited |
| **Google Gemini** | https://makersuite.google.com/app/apikey | 60 req/min |

---

## Testing the Integration

### 1. Verify Backend Health
```powershell
curl http://localhost:9000/health
```

Expected response:
```json
{"status": "healthy", "timestamp": "..."}
```

### 2. Test Baseline API
```powershell
curl http://localhost:9000/api/v1/baseline/preview-items?domain=math&count=1
```

Should return a mock math question in JSON format.

### 3. Test Frontend
1. Open http://localhost:3003
2. Navigate to baseline assessment
3. Start assessment
4. Verify questions appear

---

## Troubleshooting

### ❌ "No AI provider available"
**Solution:** Enable mock mode or add API key
```bash
# In .env file:
USE_MOCK_AI=true
```

### ❌ Backend won't start
**Solution:** Check for port conflicts
```powershell
# Kill processes on port 9000:
Get-Process | Where-Object {$_.ProcessName -match 'python|uvicorn'} | Stop-Process -Force
```

### ❌ Frontend can't connect
**Solution:** Verify CORS settings
```bash
# In .env file, ensure frontend port is included:
CORS_ORIGINS=["http://localhost:3003",...]
```

---

## Cost Estimation (Production)

| Provider | Cost per Question | 100 Students/Day | 1000 Students/Day |
|----------|-------------------|------------------|-------------------|
| OpenAI | $0.002 | $6/day | $60/day |
| Anthropic | $0.003 | $9/day | $90/day |
| Gemini | $0.001 | $3/day | $30/day |

*Based on 30 questions per student assessment*

---

## Support

- **Setup Guide:** `AI_PROVIDER_SETUP_GUIDE.md`
- **Integration Docs:** `BASELINE_ASSESSMENT_AI_INTEGRATION_COMPLETE.md`
- **Test Script:** `services/api-gateway/test_ai_config.py`

---

**Last Updated:** October 29, 2025  
**Status:** ✅ Ready for Development/Testing
