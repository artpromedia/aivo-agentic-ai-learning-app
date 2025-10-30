# Quick Demo Start - Minimal Version
# Just starts the essential services

Write-Host "`nStarting AIVO Demo..." -ForegroundColor Cyan

# Start Backend
Start-Job -Name "API" -ScriptBlock {
    cd C:\aivo-agentic-ai-learning-app\services\api-gateway
    $env:DATABASE_URL = "sqlite:///C:/aivo-agentic-ai-learning-app/services/api-gateway/aivo.db"
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
} | Out-Null

Write-Host "[1/2] Backend API starting on http://localhost:8000" -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start All Frontends with Turbo
cd C:\aivo-agentic-ai-learning-app
Write-Host "[2/2] Starting all frontend portals..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Services will be available at:" -ForegroundColor Green
Write-Host "  - Landing:  http://localhost:3000" -ForegroundColor White
Write-Host "  - Parent:   http://localhost:3001" -ForegroundColor White  
Write-Host "  - Teacher:  http://localhost:3002" -ForegroundColor White
Write-Host "  - Learner:  http://localhost:3003" -ForegroundColor White
Write-Host "  - Admin:    http://localhost:3004" -ForegroundColor White
Write-Host "  - API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

pnpm dev
