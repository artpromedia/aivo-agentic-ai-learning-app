# 🎓 AIVO Backend Setup Guide

> **Complete FastAPI Backend Integration with Next.js Frontend**

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)

---

## 🏗️ Overview

The AIVO backend consists of three main microservices:

1. **API Gateway** (`:8000`) - Main API orchestrator
2. **Auth Service** (`:8001`) - Authentication & authorization
3. **AI Inference Service** (`:8002`) - AI brain cloning and adaptation

### Tech Stack

- **Framework**: FastAPI 0.115+
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **ORM**: SQLAlchemy 2.0
- **Migration**: Alembic
- **Auth**: JWT (python-jose)
- **Container**: Docker & Docker Compose

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Docker Desktop 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for frontend)
- pnpm 10+

# Optional for local development
- Python 3.11+
- PostgreSQL 16+
- Redis 7+
```

### One-Command Setup

```bash
# 1. Copy environment template
cp .env.backend.example .env

# 2. Generate secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -base64 32  # For DB_PASSWORD
openssl rand -base64 32  # For REDIS_PASSWORD

# 3. Update .env with generated secrets

# 4. Start all services
docker-compose up -d

# 5. View logs
docker-compose logs -f

# 6. Check health
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
```

### Verify Installation

```bash
# Check all containers are running
docker-compose ps

# Should show:
# - aivo-postgres (healthy)
# - aivo-redis (healthy)
# - aivo-api-gateway (healthy)
# - aivo-auth-service (healthy)
# - aivo-ai-inference (healthy)

# Test API
curl http://localhost:8000/api/v1/health/db
curl http://localhost:8000/api/v1/health/redis
curl http://localhost:8000/api/v1/health/services

# View API docs
open http://localhost:8000/docs  # Swagger UI
open http://localhost:8000/redoc  # ReDoc
```

---

## 📂 Project Structure

```
aivo-learning/
├── services/                  # Backend microservices
│   ├── api-gateway/          # Main API (:8000)
│   │   ├── app/
│   │   │   ├── api/v1/       # API routes
│   │   │   ├── core/         # Config, database
│   │   │   ├── models/       # SQLAlchemy models
│   │   │   ├── schemas/      # Pydantic schemas
│   │   │   └── main.py       # FastAPI app
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── auth-service/         # Auth (:8001)
│   │   ├── app/
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   └── ai-inference-service/ # AI (:8002)
│       ├── app/
│       ├── Dockerfile
│       └── requirements.txt
│
├── infra/                    # Infrastructure
│   └── docker/
│       └── postgres/
│           └── init.sql      # DB initialization
│
├── docker-compose.yml        # Service orchestration
├── .env.backend.example      # Environment template
└── BACKEND_SETUP.md         # This file
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` from `.env.backend.example`:

```bash
# Critical - Must Change
JWT_SECRET=<generated-with-openssl-rand-hex-32>
DB_PASSWORD=<generated-with-openssl-rand-base64-32>
REDIS_PASSWORD=<generated-with-openssl-rand-base64-32>
OPENAI_API_KEY=<your-openai-api-key>

# Database
DATABASE_URL=postgresql://aivo_user:YOUR_DB_PASSWORD@postgres:5432/aivo_db

# Redis
REDIS_URL=redis://:YOUR_REDIS_PASSWORD@redis:6379/0

# API
API_V1_STR=/api/v1
PROJECT_NAME=AIVO API Gateway
ENVIRONMENT=development
DEBUG=true

# CORS - Update for production
CORS_ORIGINS=http://localhost:3000,http://localhost:3004,http://localhost:3005
```

### Generate Secrets

```bash
# JWT Secret (64 characters)
openssl rand -hex 32

# Database Password
openssl rand -base64 32

# Redis Password
openssl rand -base64 32
```

---

## 🔧 Development

### Running Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up api-gateway

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Database Operations

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U aivo_user -d aivo_db

# Run migrations
docker-compose exec api-gateway alembic upgrade head

# Create new migration
docker-compose exec api-gateway alembic revision --autogenerate -m "Add table"

# Backup database
docker-compose exec postgres pg_dump -U aivo_user aivo_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U aivo_user -d aivo_db < backup.sql
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
docker-compose logs -f ai-inference-service
docker-compose logs -f postgres
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 api-gateway

# Since timestamp
docker-compose logs --since 5m api-gateway
```

### Making Code Changes

```bash
# Backend changes auto-reload in development mode
# Just edit files in services/api-gateway/app/

# Example: Add new endpoint
services/api-gateway/app/api/v1/endpoints/my_endpoint.py

# Changes are reflected immediately due to --reload flag
```

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
docker-compose exec api-gateway pytest

# Run specific test file
docker-compose exec api-gateway pytest tests/test_health.py

# Run with coverage
docker-compose exec api-gateway pytest --cov=app --cov-report=html

# View coverage report
open htmlcov/index.html
```

### API Testing

```bash
# Using curl
curl -X GET http://localhost:8000/api/v1/health/db

# Using httpie (prettier output)
brew install httpie
http GET http://localhost:8000/api/v1/health/db

# Using Postman
# Import: http://localhost:8000/openapi.json
```

---

## 🚢 Deployment

### Production Environment

```bash
# 1. Update environment variables
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING

# 2. Use production compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 3. Run migrations
docker-compose exec api-gateway alembic upgrade head

# 4. Check health
curl https://api.aivo.app/health
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Generate new JWT secret
- [ ] Set DEBUG=false
- [ ] Configure CORS for production domains only
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure database backups
- [ ] Set up monitoring/alerts
- [ ] Review security headers

---

## 📚 API Documentation

### Endpoints

#### Health Checks
- `GET /health` - Overall health
- `GET /api/v1/health/db` - Database health
- `GET /api/v1/health/redis` - Redis health
- `GET /api/v1/health/services` - Microservices health

#### Users
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/{user_id}` - Get user

#### Learners
- `GET /api/v1/learners` - List learners
- `POST /api/v1/learners` - Create learner
- `GET /api/v1/learners/{learner_id}` - Get learner

#### IEP Management
- `GET /api/v1/iep/{learner_id}` - Get IEP
- `POST /api/v1/iep/{learner_id}` - Create IEP
- `PUT /api/v1/iep/{learner_id}` - Update IEP

#### AI Brain
- `POST /api/v1/brain/clone/{learner_id}` - Clone brain
- `GET /api/v1/brain/{learner_id}` - Get brain instance
- `POST /api/v1/brain/{learner_id}/adapt` - Adapt brain

#### Homework
- `POST /api/v1/homework/upload/{learner_id}` - Upload homework
- `GET /api/v1/homework/{learner_id}` - Get homework

#### Progress
- `GET /api/v1/progress/{learner_id}` - Get progress
- `POST /api/v1/progress/{learner_id}` - Record progress

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :8000
lsof -i :5432

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

#### Database Connection Failed

```bash
# Check if postgres is running
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres

# Verify connection
docker-compose exec postgres pg_isready -U aivo_user
```

#### Can't Connect to API from Frontend

```bash
# 1. Check API is running
curl http://localhost:8000/health

# 2. Verify CORS settings in .env
CORS_ORIGINS=http://localhost:3000,...

# 3. Check Docker network
docker network inspect aivo-network

# 4. Restart API gateway
docker-compose restart api-gateway
```

#### Redis Connection Error

```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping

# Check password
docker-compose exec redis redis-cli -a YOUR_REDIS_PASSWORD ping
```

---

## 🤝 Next Steps

1. **Implement Authentication**: Add user registration, login, JWT tokens
2. **Create Database Models**: Define SQLAlchemy models for all entities
3. **Implement IEP Management**: Secure storage and retrieval of IEPs
4. **Build AI Brain Service**: Implement federated learning and adaptation
5. **Add File Upload**: Handle homework uploads with validation
6. **Progress Tracking**: Record and analyze learner progress
7. **Testing**: Write comprehensive tests for all endpoints
8. **Documentation**: Expand API documentation with examples

---

## 📞 Support

- **Issues**: GitHub Issues
- **Docs**: http://localhost:8000/docs
- **Email**: support@aivo.app

---

**Ready to build!** 🚀
