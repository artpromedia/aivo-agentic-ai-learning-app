# AIVO Auth Service Backend# @aivo/auth-service



Lightweight FastAPI microservice providing authentication for the AIVO AI Learning Platform.Authentication Microservice



## Features## Description



- **JWT Authentication**: Secure token-based authenticationDedicated authentication and authorization service.

- **Health Checks**: Built-in health monitoring endpoints

- **Database Ready**: PostgreSQL integration with SQLAlchemy## Setup

- **Security**: Password hashing with bcrypt, JWT with python-jose

```bash

## Project Structure# Create virtual environment

python -m venv venv

```

apps/auth-service-backend/# Activate (Windows PowerShell)

├── main.py              # Application entry point.\venv\Scripts\Activate.ps1

├── test_main.py         # Basic tests

├── .env                 # Environment config (from container)# Install dependencies

├── .env.local           # Local development config templatepip install -r requirements.txt

├── requirements.txt     # Python dependencies```

├── venv/               # Virtual environment (created locally)

├── Dockerfile          # Production container config## Development

└── Dockerfile.dev      # Development container config

``````bash

uvicorn main:app --reload --port 8001

## Prerequisites```



- Python 3.11+## Environment Variables

- PostgreSQL 15+ (running in Docker: `aivo-postgres` on port 5432)

Create a `.env` file:

## Quick Start

```env

### 1. Activate Virtual EnvironmentDATABASE_URL=postgresql://user:pass@localhost:5432/aivo_auth

JWT_SECRET=your-secret-key

```powershellJWT_ALGORITHM=HS256

cd apps\auth-service-backendACCESS_TOKEN_EXPIRE_MINUTES=30

.\venv\Scripts\Activate.ps1```

```

## Tech Stack

### 2. Configure Environment

- FastAPI

For local customization, edit `.env.local` and copy to `.env` if needed:- Python 3.11+

- PostgreSQL

```powershell- JWT

# Copy the local template
cp .env.local .env

# Edit .env to customize
```

**Key environment variables:**
- `DATABASE_URL`: PostgreSQL connection (default: `postgresql://aivo_user:aivo_dev_password@localhost:5432/aivo_db`)
- `JWT_SECRET`: Secret key for JWT tokens (change in production!)
- `CORS_ORIGINS`: Allowed frontend origins

### 3. Start the Server

**Development mode (with auto-reload):**
```powershell
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Production mode:**
```powershell
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4
```

### 4. Access the Service

- **Service Base**: http://localhost:8001
- **Root Endpoint**: http://localhost:8001/ - Returns service status
- **Health Check**: http://localhost:8001/health - Health status
- **API Health**: http://localhost:8001/api/health - Service health info
- **API Docs**: http://localhost:8001/docs - Swagger UI
- **ReDoc**: http://localhost:8001/redoc - Alternative docs

## API Endpoints

- `GET /` - Root endpoint (service info)
- `GET /health` - Health check
- `GET /api/health` - Detailed health status

## Testing

```powershell
# Run tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test
pytest test_main.py
```

## Development

### Code Quality

```powershell
# Type checking (if mypy configured)
mypy main.py

# Linting (if configured)
pylint main.py
```

## Docker Integration

This service is currently running in Docker as `aivo-auth-service`. The local setup allows you to:
- Develop and test changes locally
- Use the same PostgreSQL instance as the container
- Hot-reload code changes

**Container info:**
- Container name: `aivo-auth-service`
- Port: 8001
- Health check: Configured and passing

## Troubleshooting

### Connection Errors

**PostgreSQL not accessible:**
```powershell
# Verify Docker container is running
docker ps -f name=aivo-postgres

# Check connection
docker exec aivo-postgres pg_isready -U aivo_user
```

### Port Conflicts

If port 8001 is in use, stop the Docker container or use a different port:
```powershell
uvicorn main:app --port 8002
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `ENVIRONMENT` | Environment name | `development` |
| `DEBUG` | Enable debug mode | `true` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `30` |
| `CORS_ORIGINS` | Allowed CORS origins | `[...]` |

## Production Deployment

1. Set `ENVIRONMENT=production`
2. Set `DEBUG=false`
3. Generate a secure `JWT_SECRET` (32+ chars)
4. Configure production DATABASE_URL
5. Use a process manager or Docker
6. Enable HTTPS
7. Configure proper CORS_ORIGINS

## Extending the Service

This is a minimal auth service. To add full authentication features:

1. **User Models**: Add SQLAlchemy models for users
2. **Registration**: Add `/register` endpoint
3. **Login**: Add `/login` endpoint with JWT token generation
4. **Token Validation**: Add middleware for protected routes
5. **Password Reset**: Add password reset flow
6. **Refresh Tokens**: Implement refresh token logic

## Support

For issues or questions:
- Check main API Gateway README for more context
- Review FastAPI docs: https://fastapi.tiangolo.com/
- Consult the main project README at repo root
