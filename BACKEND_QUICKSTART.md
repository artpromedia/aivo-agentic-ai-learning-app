# 🚀 AIVO Backend Quick Start

## Start the Backend

```powershell
# 1. Navigate to project root
cd C:\Users\ofema\aivo-learning

# 2. Copy environment template
Copy-Item .env.backend.example .env

# 3. Generate secrets (PowerShell)
# JWT Secret
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# DB Password
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Redis Password  
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# 4. Edit .env and replace CHANGE_ME values with generated secrets

# 5. Start Docker containers
docker-compose up -d

# 6. Watch logs
docker-compose logs -f

# 7. Check health
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health

# 8. View API docs
start http://localhost:8000/docs
```

## Verify Everything Works

```powershell
# Check all containers
docker-compose ps

# Test database
curl http://localhost:8000/api/v1/health/db

# Test Redis
curl http://localhost:8000/api/v1/health/redis

# Test services
curl http://localhost:8000/api/v1/health/services
```

## Stop the Backend

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

## Troubleshooting

### Ports Already in Use

```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Docker Issues

```powershell
# Restart Docker Desktop
# Then try again:
docker-compose up -d --build
```

## Next Steps

1. ✅ Backend is running
2. ✅ Database is initialized
3. ✅ API is accessible
4. 📝 Read [BACKEND_SETUP.md](BACKEND_SETUP.md) for detailed docs
5. 🔧 Start building endpoints!
