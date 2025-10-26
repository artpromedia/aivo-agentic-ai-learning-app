#!/bin/bash

# Deploy all baseline assessment Edge Functions to Supabase
# Prerequisites:
# 1. Supabase CLI installed: npm install -g supabase
# 2. Logged in: supabase login
# 3. Linked to project: supabase link --project-ref your-project-ref

echo "🚀 Deploying Baseline Assessment Edge Functions..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install with: npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Run: supabase login"
    exit 1
fi

# Check if environment variables are set
if [ ! -f "supabase/.env" ]; then
    echo "⚠️  Warning: supabase/.env file not found"
    echo "   Copy supabase/.env.example and fill in your values"
    echo ""
fi

# Deploy functions
echo "📤 Deploying baseline-transcribe-audio..."
supabase functions deploy baseline-transcribe-audio --no-verify-jwt=false

echo ""
echo "📤 Deploying baseline-score-fluency..."
supabase functions deploy baseline-score-fluency --no-verify-jwt=false

echo ""
echo "📤 Deploying baseline-process-audio..."
supabase functions deploy baseline-process-audio --no-verify-jwt=false

echo ""
echo "📤 Deploying baseline-cleanup-audio..."
supabase functions deploy baseline-cleanup-audio --no-verify-jwt=false

echo ""
echo "✅ All functions deployed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables in Supabase Dashboard:"
echo "   - OPENAI_API_KEY"
echo "   - SUPABASE_URL (auto-set)"
echo "   - SUPABASE_SERVICE_ROLE_KEY (auto-set)"
echo ""
echo "2. Configure scheduled cleanup job in Supabase Dashboard:"
echo "   Function: baseline-cleanup-audio"
echo "   Schedule: 0 2 * * * (Daily at 2 AM)"
echo ""
echo "3. Test functions with:"
echo "   ./scripts/test-audio-processing.sh"
