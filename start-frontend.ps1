# AIVO Demo Startup - Frontend Only (Backend runs separately)
# This starts all React/Vite portals without the Python backends

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  AIVO DEMO - Frontend Portals Startup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Backend API should be running on: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Check with: curl http://localhost:8000/health`n" -ForegroundColor Gray

Write-Host "Starting Frontend Portals..." -ForegroundColor Yellow
Write-Host ""  
Write-Host "  Landing Page:   http://localhost:3000" -ForegroundColor Green
Write-Host "  Parent Portal:  http://localhost:5173" -ForegroundColor Green
Write-Host "  Teacher Portal: http://localhost:5174" -ForegroundColor Green
Write-Host "  Learner App:    http://localhost:5175" -ForegroundColor Green
Write-Host "  Admin Portal:   http://localhost:5007" -ForegroundColor Green
Write-Host "  District Portal:http://localhost:5176" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow

cd C:\aivo-agentic-ai-learning-app

# Use turbo filter to skip Python backends
pnpm turbo dev --filter=!@aivo/auth-service --filter=!@aivo/api
