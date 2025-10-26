# Deploy all baseline assessment Edge Functions to Supabase
# Prerequisites:
# 1. Supabase CLI installed: npm install -g supabase
# 2. Logged in: supabase login
# 3. Linked to project: supabase link --project-ref your-project-ref

Write-Host "🚀 Deploying Baseline Assessment Edge Functions..." -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCmd) {
    Write-Host "❌ Supabase CLI not found. Install with: npm install -g supabase" -ForegroundColor Red
    exit 1
}

# Check if logged in
$projectsResult = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Supabase. Run: supabase login" -ForegroundColor Red
    exit 1
}

# Check if environment variables are set
if (-not (Test-Path "supabase\.env")) {
    Write-Host "⚠️  Warning: supabase\.env file not found" -ForegroundColor Yellow
    Write-Host "   Copy supabase\.env.example and fill in your values" -ForegroundColor Yellow
    Write-Host ""
}

# Deploy functions
Write-Host "📤 Deploying baseline-transcribe-audio..." -ForegroundColor Green
supabase functions deploy baseline-transcribe-audio --no-verify-jwt=false

Write-Host ""
Write-Host "📤 Deploying baseline-score-fluency..." -ForegroundColor Green
supabase functions deploy baseline-score-fluency --no-verify-jwt=false

Write-Host ""
Write-Host "📤 Deploying baseline-process-audio..." -ForegroundColor Green
supabase functions deploy baseline-process-audio --no-verify-jwt=false

Write-Host ""
Write-Host "📤 Deploying baseline-cleanup-audio..." -ForegroundColor Green
supabase functions deploy baseline-cleanup-audio --no-verify-jwt=false

Write-Host ""
Write-Host "✅ All functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set environment variables in Supabase Dashboard:"
Write-Host "   - OPENAI_API_KEY"
Write-Host "   - SUPABASE_URL (auto-set)"
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY (auto-set)"
Write-Host ""
Write-Host "2. Configure scheduled cleanup job in Supabase Dashboard:"
Write-Host "   Function: baseline-cleanup-audio"
Write-Host "   Schedule: 0 2 * * * (Daily at 2 AM)"
Write-Host ""
Write-Host "3. Test functions with:"
Write-Host "   .\scripts\test-audio-processing.ps1"
