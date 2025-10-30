# AI Provider Setup Guide 🤖

## Quick Start

### For Development/Testing (No API Keys Needed)
If you just want to test the system without real AI:

1. Open `services/api-gateway/.env`
2. Set `USE_MOCK_AI=true`
3. Restart the backend
4. The system will use mock AI responses for testing

### For Production (Real AI Integration)

You need at least **ONE** API key from any provider. The system automatically falls back to the next available provider if one fails.

## Getting API Keys

### 1️⃣ OpenAI (Recommended - Primary Provider)

**Cost:** ~$0.002 per question generation  
**Models Used:** GPT-4, GPT-3.5-turbo

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Add to `.env`:
   ```bash
   OPENAI_API_KEY=sk-proj-abc123...
   ```

**Free Tier:** $5 free credits for new accounts

### 2️⃣ Anthropic Claude (Fallback Provider)

**Cost:** ~$0.003 per question generation  
**Models Used:** Claude 3 Opus, Claude 3 Sonnet

1. Go to https://console.anthropic.com/settings/keys
2. Sign in or create account
3. Click "Create Key"
4. Copy the key (starts with `sk-ant-`)
5. Add to `.env`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-api03-abc123...
   ```

**Free Tier:** Limited free credits for testing

### 3️⃣ Google Gemini (Second Fallback)

**Cost:** Free tier available, then ~$0.001 per question  
**Models Used:** Gemini Pro, Gemini Pro Vision

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Select or create a project
5. Copy the key (starts with `AIzaSy`)
6. Add to `.env`:
   ```bash
   GOOGLE_API_KEY=AIzaSyAbc123...
   ```

**Free Tier:** 60 requests per minute free

## Configuration Examples

### Example 1: OpenAI Only (Simplest)
```bash
# services/api-gateway/.env
OPENAI_API_KEY=sk-proj-abc123...
# ANTHROPIC_API_KEY=  # Leave commented
# GOOGLE_API_KEY=     # Leave commented
```

### Example 2: Full Redundancy (Recommended for Production)
```bash
# All three providers for maximum reliability
OPENAI_API_KEY=sk-proj-abc123...
ANTHROPIC_API_KEY=sk-ant-api03-xyz789...
GOOGLE_API_KEY=AIzaSyDef456...
```

### Example 3: Testing Specific Provider
```bash
# Force use of Anthropic for testing
ANTHROPIC_API_KEY=sk-ant-api03-xyz789...
PRIMARY_AI_PROVIDER=anthropic  # Uncomment this line
```

### Example 4: Development Mode (No API Keys)
```bash
# Use mock AI for testing
USE_MOCK_AI=true
# No API keys needed!
```

## Provider Fallback Chain

The system tries providers in this order:

```
1. OpenAI (Primary)
   ↓ (if fails)
2. Anthropic Claude
   ↓ (if fails)
3. Google Gemini
   ↓ (if fails)
4. Mock AI (development only)
```

## Testing Your Setup

### 1. Verify Environment Variables
```powershell
# In services/api-gateway directory
cd c:\aivo-agentic-ai-learning-app\services\api-gateway
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('OpenAI:', 'SET' if os.getenv('OPENAI_API_KEY') else 'NOT SET')"
```

### 2. Start Backend
```powershell
cd c:\aivo-agentic-ai-learning-app\services\api-gateway
python -m uvicorn app.main:app --reload --port 9000
```

### 3. Test API Endpoint
```powershell
# In new terminal
curl http://localhost:9000/api/v1/baseline/preview-items?domain=math&count=1
```

If you see a JSON response with a question, it's working! 🎉

### 4. Test in Frontend
1. Start frontend: `cd apps/learner-app && pnpm dev`
2. Navigate to: http://localhost:3003
3. Start baseline assessment
4. Watch the console for AI generation logs

## Monitoring AI Usage

### Check Logs
The backend logs which AI provider is being used:
```
INFO: Using OpenAI for question generation
INFO: Generated question for domain: math, difficulty: 0.5
```

### Monitor Costs
- **OpenAI:** https://platform.openai.com/usage
- **Anthropic:** https://console.anthropic.com/settings/billing
- **Google:** https://console.cloud.google.com/billing

## Common Issues & Solutions

### ❌ "No AI provider available"
**Problem:** No API keys configured  
**Solution:** Add at least one API key or set `USE_MOCK_AI=true`

### ❌ "Invalid API key"
**Problem:** Key is incorrect or expired  
**Solution:** 
- Check for typos
- Verify key hasn't been rotated
- Check billing/quota limits on provider dashboard

### ❌ "Rate limit exceeded"
**Problem:** Too many requests to AI provider  
**Solution:**
- Upgrade to paid tier
- Add additional providers for fallback
- Implement caching (already built-in for repeated questions)

### ❌ "Connection timeout"
**Problem:** Network issues or provider downtime  
**Solution:**
- Check internet connection
- Verify provider status page
- System will automatically fallback to next provider

## Cost Estimation

Based on typical usage:

| Scenario | Questions/Day | Cost/Day | Cost/Month |
|----------|--------------|----------|------------|
| Small School (100 students) | 3,000 | $6 | $180 |
| Medium School (500 students) | 15,000 | $30 | $900 |
| Large District (5,000 students) | 150,000 | $300 | $9,000 |

*Assumes 30 questions per student assessment, OpenAI pricing*

## Security Best Practices

1. **Never commit `.env` to git** - Already in `.gitignore`
2. **Rotate keys regularly** - Every 90 days minimum
3. **Use different keys for dev/staging/production**
4. **Monitor usage dashboards** - Set up billing alerts
5. **Restrict API keys** - Use API key restrictions when available

## Advanced Configuration

### Custom AI Provider
To add a new AI provider:
1. Edit `services/api-gateway/app/services/ai_inference_service.py`
2. Add provider logic to the fallback chain
3. Add environment variable to `.env`

### Caching Strategy
Built-in caching reduces costs:
- Repeated questions cached for 24 hours
- IRT parameters cached per session
- Reduces API calls by ~40%

### Load Balancing
For high-traffic scenarios:
- Use multiple API keys (round-robin)
- Implement request queuing
- Use Redis for distributed caching

## Support & Resources

- **OpenAI Docs:** https://platform.openai.com/docs
- **Anthropic Docs:** https://docs.anthropic.com
- **Google AI Docs:** https://ai.google.dev/docs
- **Aivo Documentation:** See `BASELINE_ASSESSMENT_AI_INTEGRATION_COMPLETE.md`

---

**Need Help?** Open an issue in the repo or contact the development team.

**Ready to Test?** Start with `USE_MOCK_AI=true` then gradually add real API keys!
