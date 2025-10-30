# AIVO Investor Demo - Complete System Startup Script
# Starts Backend API + All Frontend Portals

Write-Host "`n" -NoNewline
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "                    AIVO LEARNING PLATFORM - DEMO STARTUP" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Check Node.js
Write-Host "[1/6] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  [OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Node.js not found! Please install Node.js 20.19.4+" -ForegroundColor Red
    exit 1
}

# Check pnpm
Write-Host "`n[2/6] Checking pnpm installation..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "  [OK] pnpm $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] pnpm not found! Installing..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Check Python
Write-Host "`n[3/6] Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "  [OK] $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Python not found! Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
Write-Host "`n[4/6] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing Node dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    pnpm install
} else {
    Write-Host "  [OK] Node modules found" -ForegroundColor Green
}

# Check Python dependencies for API Gateway
Write-Host "`n[5/6] Checking Python dependencies..." -ForegroundColor Yellow
cd services\api-gateway
try {
    python -c "import fastapi; import sqlalchemy; import uvicorn" 2>$null
    Write-Host "  [OK] Python dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "  Installing Python dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt -q
}
cd ..\..

# Stop any existing processes
Write-Host "`n[6/6] Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name python* -ErrorAction SilentlyContinue | Where-Object { 
    $_.StartTime -gt (Get-Date).AddHours(-2) 
} | Stop-Process -Force -ErrorAction SilentlyContinue

Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { 
    $_.CommandLine -like "*turbo*" -or $_.CommandLine -like "*vite*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2
Write-Host "  [OK] Cleanup complete" -ForegroundColor Green

# Display startup information
Write-Host "`n" -NoNewline
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "                         STARTING AIVO DEMO ENVIRONMENT" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API will start on:" -ForegroundColor White
Write-Host "  -> http://localhost:8000" -ForegroundColor Green
Write-Host "  -> API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend Portals will start on:" -ForegroundColor White
Write-Host "  -> Landing Page:    http://localhost:3000" -ForegroundColor Green
Write-Host "  -> Parent Portal:   http://localhost:3001" -ForegroundColor Green
Write-Host "  -> Teacher Portal:  http://localhost:3002" -ForegroundColor Green
Write-Host "  -> Learner App:     http://localhost:3003" -ForegroundColor Green
Write-Host "  -> Admin Portal:    http://localhost:3004" -ForegroundColor Green
Write-Host ""
Write-Host "This will take 30-60 seconds to start all services..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop all services when done." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend API in background
Write-Host "Starting Backend API Gateway..." -ForegroundColor Yellow
$apiJob = Start-Job -ScriptBlock {
    Set-Location "C:\aivo-agentic-ai-learning-app\services\api-gateway"
    $env:DATABASE_URL = "sqlite:///C:/aivo-agentic-ai-learning-app/services/api-gateway/aivo.db"
    $env:REDIS_URL = "redis://localhost:6379/0"
    $env:JWT_SECRET = "aivo-dev-secret-key"
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
}

Start-Sleep -Seconds 3

# Wait for API to be ready
Write-Host "Waiting for API to be ready..." -ForegroundColor Yellow
$maxAttempts = 20
$attempt = 0
$apiReady = $false

while ($attempt -lt $maxAttempts -and -not $apiReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $apiReady = $true
            Write-Host "  [OK] Backend API is ready!" -ForegroundColor Green
        }
    } catch {
        $attempt++
        Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $apiReady) {
    Write-Host "  [WARNING] API may not be fully ready, but continuing..." -ForegroundColor Yellow
}

# Start Frontend Development Server (All Portals)
Write-Host "`nStarting All Frontend Portals..." -ForegroundColor Yellow
Set-Location "C:\aivo-agentic-ai-learning-app"

# Use turborepo to start all apps in dev mode
Write-Host "  Launching Turborepo dev servers..." -ForegroundColor Gray
pnpm dev

# Cleanup function
function Cleanup {
    Write-Host "`n`n" -NoNewline
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "                         SHUTTING DOWN DEMO ENVIRONMENT" -ForegroundColor Cyan
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Stopping Backend API..." -ForegroundColor Yellow
    Stop-Job -Job $apiJob -ErrorAction SilentlyContinue
    Remove-Job -Job $apiJob -ErrorAction SilentlyContinue
    
    Write-Host "Stopping Frontend Portals..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { 
        $_.CommandLine -like "*turbo*" -or $_.CommandLine -like "*vite*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "Stopping Python processes..." -ForegroundColor Yellow
    Get-Process -Name python* -ErrorAction SilentlyContinue | Where-Object { 
        $_.StartTime -gt (Get-Date).AddHours(-1) 
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "`n[OK] All services stopped" -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Cyan
}

# Register cleanup on exit
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Cleanup }

# Wait for user to press Ctrl+C
try {
    Wait-Job -Job $apiJob
} finally {
    Cleanup
}
