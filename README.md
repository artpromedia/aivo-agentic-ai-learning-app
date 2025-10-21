# Aivo Learning

> Personalized AI-powered special education platform for neurodiverse children

[![CI](https://github.com/yourusername/aivo-learning/workflows/CI/badge.svg)](https://github.com/yourusername/aivo-learning/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Overview

Aivo Learning is a comprehensive special education platform that leverages **multi-provider AI** (OpenAI, Anthropic, Google, Meta, etc.) to provide personalized learning experiences for neurodiverse children. The platform includes separate interfaces for learners, parents, teachers, district administrators, and global admins, all designed with accessibility and individualized education in mind.

### **Key Features**
- 🎯 **Personalized AI Learning** - Dynamic AI model selection based on learner needs
- 📚 **Homework Helper** - 4-step scaffolded homework assistance with OCR support
- 🧠 **IEP Goal Tracking** - Real-time progress monitoring and data collection
- 🎮 **Focus Monitor & Game Breaks** - Attention tracking with educational game breaks
- 🌈 **Sensory Profiles** - Customizable accommodations for visual, auditory, motor, cognitive needs
- 📊 **Analytics Dashboard** - Engagement metrics, subject performance, and regulation data
- 🔄 **Self-Regulation Tools** - Breathing exercises, movement breaks, grounding activities
- 👥 **Multi-Role Support** - Learner, Parent, Teacher, District Admin, Global Admin portals

## 🏗️ Architecture

This project is a **full-stack Turborepo monorepo** containing:

### Frontend Apps

- **`apps/web`** (Port 5173) - Marketing website and landing pages (Next.js)
- **`apps/parent-portal`** (Port 5174) - Parent dashboard for tracking child progress
- **`apps/teacher-portal`** (Port 5175) - Teacher tools for IEP management and lesson planning
- **`apps/learner-app`** (Port 5176) - Child-facing learning interface with grade-based theming (K5/MS/HS)
- **`apps/district-portal`** (Port 5177) - District administrator dashboard
- **`apps/admin-portal`** (Port 5178) - Global admin dashboard for multi-tenant management

### Backend Services

- **`services/api-gateway`** (Port 8000) - FastAPI gateway with authentication, rate limiting, and request routing
- **`services/ai-service`** (Port 8001) - Multi-provider AI service (OpenAI, Anthropic, Google, Meta, Cohere, Mistral, HuggingFace, Custom)
- **`services/homework-service`** (Port 8002) - Homework helper with OCR and 4-step scaffolding
- **Database:** PostgreSQL 16 (Port 5432) with Alembic migrations
- **Cache:** Redis 7 (Port 6379) for session management and rate limiting

### Shared Packages

- **`packages/ui`** - Shared React component library with theme support
- **`packages/types`** - Shared TypeScript type definitions
- **`packages/utils`** - Shared utility functions (route registry, validators, formatters)
- **`packages/config`** - Shared configurations (ESLint, TypeScript, Tailwind)
- **`packages/auth`** - Authentication library with JWT and role-based access control

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 19
- **Build Tool:** Vite 7+
- **Language:** TypeScript 5.6+ (strict mode)
- **Styling:** Tailwind CSS v4 with custom theme system
- **State Management:** Zustand
- **Routing:** React Router v6 (HashRouter for SPA compatibility)
- **Authentication:** JWT with role-based access control (9 roles)
- **UI Components:** Custom component library with grade-based theming (K5/MS/HS)
- **PWA Support:** Service workers, offline mode, install prompts

### **Backend**
- **API Framework:** FastAPI 0.115 (Python 3.11)
- **Database:** PostgreSQL 16 Alpine
- **ORM:** SQLAlchemy 2.0 with Alembic migrations
- **Cache:** Redis 7 Alpine
- **Authentication:** JWT tokens with bcrypt password hashing
- **Validation:** Pydantic v2 with strict validation
- **Server:** Uvicorn with auto-reload (development)
- **API Docs:** OpenAPI/Swagger auto-generated

### **AI & ML**
- **Multi-Provider Support:** OpenAI, Anthropic, Google, Meta, Cohere, Mistral, HuggingFace, Custom
- **Dynamic Model Selection:** Priority-based with automatic fallback chains
- **Cost Tracking:** Real-time usage and cost analytics per provider/model
- **OCR:** Tesseract for homework image processing
- **Use Cases:** Homework help, IEP analysis, lesson planning, math solving, reading comprehension

### **Infrastructure**
- **Monorepo:** Turborepo
- **Package Manager:** pnpm v10
- **Linting:** ESLint v9 (flat config), Ruff (Python)
- **Type Checking:** TypeScript strict mode, Pyright/Pylance
- **Containerization:** Docker Compose (PostgreSQL, Redis, FastAPI services)
- **Node.js:** v20.19.4
- **Python:** v3.11

## 📋 Prerequisites

- **Node.js** >= 20.19.4 (use `.nvmrc` for version management)
- **pnpm** >= 10.0.0
- **Python** >= 3.11 (for backend services)
- **Docker** & Docker Compose (for database and cache)
- **PostgreSQL** 16 (via Docker or local)
- **Redis** 7 (via Docker or local)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install pnpm globally if you haven't already
npm install -g pnpm@10

# Install all frontend dependencies
pnpm install

# Install backend dependencies (Python)
cd services/api-gateway
pip install -r requirements.txt
cd ../..
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Configure environment variables
# - DATABASE_URL: PostgreSQL connection string
# - REDIS_URL: Redis connection string
# - JWT_SECRET_KEY: Secret for JWT token signing
# - AI provider API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)
```

### 3. Start Database & Cache (Docker)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run database migrations
cd services/api-gateway
python -m alembic upgrade head
cd ../..
```

### 4. Development Mode

```bash
# Terminal 1: Start all frontend apps
pnpm dev

# Terminal 2: Start backend services
cd services/api-gateway
uvicorn app.main:app --reload --port 8000

# Terminal 3: Start AI service (optional)
cd services/ai-service
uvicorn app.main:app --reload --port 8001
```

### Frontend Apps URLs:
- **Web (Marketing)**: http://localhost:5173
- **Parent Portal**: http://localhost:5174
- **Teacher Portal**: http://localhost:5175
- **Learner App**: http://localhost:5176
- **District Portal**: http://localhost:5177
- **Admin Portal**: http://localhost:5178

### Backend APIs URLs:
- **API Gateway**: http://localhost:8000/docs (Swagger UI)
- **AI Service**: http://localhost:8001/docs
- **Homework Service**: http://localhost:8002/docs

### 5. Development with Specific Apps

```bash
# Run specific frontend app
pnpm --filter @aivo/web dev
pnpm --filter @aivo/parent-portal dev
pnpm --filter @aivo/teacher-portal dev
pnpm --filter @aivo/learner-app dev
pnpm --filter @aivo/district-portal dev
pnpm --filter @aivo/admin-portal dev
```

### 3. Build

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @aivo/web build
```

### 4. Lint & Type Check

```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check
```

## 📁 Project Structure

```
aivo-learning/
├── .github/
│   ├── copilot-instructions.md    # GitHub Copilot configuration
│   └── workflows/
│       ├── ci.yml                  # Continuous integration
│       └── deploy.yml              # Deployment pipeline
├── apps/
│   ├── web/                        # Marketing site (Port 5173)
│   ├── parent-portal/              # Parent dashboard (Port 5174)
│   ├── teacher-portal/             # Teacher tools (Port 5175)
│   ├── learner-app/                # Learning interface (Port 5176)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── FocusMonitor/   # Attention tracking
│   │   │   │   ├── HomeworkHelper/ # Homework assistance
│   │   │   │   ├── SelfRegulation/ # Calm corner tools
│   │   │   │   └── SensoryProfile/ # Accessibility settings
│   │   │   ├── pages/
│   │   │   │   ├── subjects/       # K5, MS, HS subject pages
│   │   │   │   ├── activities/     # Learning activities
│   │   │   │   └── HomeworkHelper.tsx
│   │   │   └── config/
│   │   │       └── subjects.ts     # Subject catalog
│   ├── district-portal/            # District admin (Port 5177)
│   └── admin-portal/               # Global admin (Port 5178)
├── services/
│   ├── api-gateway/                # FastAPI Gateway (Port 8000)
│   │   ├── app/
│   │   │   ├── api/v1/            # API endpoints
│   │   │   ├── core/              # Config, database, security
│   │   │   ├── models/            # SQLAlchemy models (16 tables)
│   │   │   │   ├── user.py        # User authentication (9 roles)
│   │   │   │   ├── learner.py     # Student profiles
│   │   │   │   ├── homework.py    # Homework sessions (3 tables)
│   │   │   │   ├── iep.py         # IEP goals and data
│   │   │   │   ├── regulation.py  # Self-regulation tracking
│   │   │   │   ├── analytics.py   # Metrics and reporting
│   │   │   │   └── ai_provider.py # Multi-provider AI (3 tables)
│   │   │   ├── schemas/           # Pydantic validation
│   │   │   └── utils/             # Helpers and formatters
│   │   ├── alembic/               # Database migrations
│   │   │   └── versions/          # Migration files
│   │   ├── requirements.txt
│   │   └── pyrightconfig.json     # Type checking config
│   ├── ai-service/                # AI inference (Port 8001)
│   └── homework-service/          # Homework helper (Port 8002)
├── packages/
│   ├── ui/                        # Shared component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   ├── Input/
│   │   │   │   └── ThemeProvider/
│   │   │   └── themes/            # K5, MS, HS themes
│   ├── types/                     # TypeScript definitions
│   │   └── src/
│   │       ├── user.ts
│   │       ├── learner.ts
│   │       ├── homework.ts
│   │       └── iep.ts
│   ├── utils/                     # Utility functions
│   │   └── src/
│   │       ├── route-registry.ts
│   │       ├── validators.ts
│   │       └── formatters.ts
│   ├── config/                    # Shared configs
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   └── auth/                      # Authentication library
│       └── src/
│           ├── AuthProvider.tsx
│           ├── ProtectedRoute.tsx
│           └── useAuth.ts
├── docker-compose.yml             # Docker services
├── .env.example                   # Environment template
├── .gitignore
├── .nvmrc                         # Node version
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## 🎨 Component Library

The `@aivo/ui` package provides reusable components with grade-based theming:

### **Core Components**
- **Button** - Primary, secondary, outline, ghost variants with theme colors
- **Card** - Default, bordered, elevated variants with responsive design
- **Input** - Form input with label, error, helper text, and validation
- **Grid** - Responsive grid layout system
- **ProgressBar** - Visual progress indicator with animations
- **ThemeProvider** - Context provider for K5/MS/HS themes with persistence
- **ErrorBoundary** - Graceful error handling with fallback UI

### **Learner-Specific Components**
- **FocusMonitor** - Real-time attention tracking with break suggestions
- **HomeworkHelper** - 4-step scaffolded homework assistance (Understand → Plan → Solve → Check)
- **SelfRegulationHub** - Breathing exercises, movement breaks, grounding activities
- **SensoryProfile** - Customizable accommodations (visual, auditory, motor, cognitive)
- **SubjectCard** - Interactive subject selection with progress tracking
- **BigButton** - Accessible large buttons for K5 learners

### **Grade-Based Themes**
- **K5 (Kindergarten-5th):** Playful colors, large buttons, simple navigation
- **MS (Middle School):** Balanced design, moderate complexity
- **HS (High School):** Professional design, advanced features

## 📦 Available Scripts

### **Frontend**

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Lint all packages with ESLint v9 |
| `pnpm type-check` | Type check all packages with TypeScript |
| `pnpm clean` | Clean all build artifacts and dependencies |
| `pnpm format` | Format code with Prettier |

### **Backend**

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start PostgreSQL and Redis containers |
| `docker-compose down` | Stop all containers |
| `python -m alembic upgrade head` | Run database migrations |
| `python -m alembic revision --autogenerate -m "message"` | Create new migration |
| `uvicorn app.main:app --reload` | Start FastAPI server with hot reload |
| `pytest` | Run backend tests |
| `ruff check .` | Lint Python code |

### **Database Management**

```bash
# Create new migration
cd services/api-gateway
python -m alembic revision --autogenerate -m "Add new feature"

# Apply migrations
python -m alembic upgrade head

# Rollback migration
python -m alembic downgrade -1

# View migration history
python -m alembic history
```

## 🔧 Configuration

### **ESLint v9**

The project uses ESLint v9 with flat config format. Configuration is located in `packages/config/eslint/index.js`.

**Features:**
- React Hooks linting
- TypeScript strict rules
- Import order enforcement
- Accessibility checks (jsx-a11y)

### **TypeScript**

Three TypeScript configurations are available:
- `@aivo/typescript-config/base.json` - Base configuration with strict mode
- `@aivo/typescript-config/react.json` - React projects with JSX support
- `@aivo/typescript-config/node.json` - Node.js/backend projects

### **Tailwind CSS v4**

Shared Tailwind configuration with custom color palette for accessibility:
- **Primary colors** (blues) for main actions
- **Accent colors** (purples) for secondary actions
- **Custom fonts:** Inter (sans), Poppins (display)
- **Grade-based themes:** K5, MS, HS with different color schemes

### **Environment Variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql+psycopg2://aivo_user:aivo_dev_password@localhost:5432/aivo_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Providers (Optional - configure as needed)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Application
ENVIRONMENT=development
API_BASE_URL=http://localhost:8000
```

### **Database Models**

The backend includes 16 database tables across 9 model files:

1. **Users** - Authentication with 9 roles (global_admin → learner)
2. **Learners** - Student profiles with diagnoses and accommodations
3. **Homework** - Sessions, files (with OCR), work products (3 tables)
4. **Sensory Profiles** - Accessibility accommodations (5 categories)
5. **Regulation** - Self-regulation sessions and emotion history (2 tables)
6. **IEP** - Goals and data points for progress tracking (2 tables)
7. **Progress** - Activity completion and performance records
8. **Analytics** - Daily metrics and subject-specific metrics (2 tables)
9. **AI Providers** - Multi-provider configuration, models, fallbacks (3 tables)

## 🤖 Multi-Provider AI System

The platform supports **dynamic AI provider switching** without code changes:

### **Supported Providers**
- **OpenAI** (GPT-4, GPT-3.5 Turbo)
- **Anthropic** (Claude 3.5 Sonnet, Claude 3 Opus)
- **Google** (Gemini 1.5 Pro, Gemini 1.0 Pro)
- **Meta** (Llama 3.1, Llama 3)
- **Cohere** (Command R+, Command)
- **Mistral** (Mistral Large, Mistral Medium)
- **HuggingFace** (Open source models)
- **Custom** (Self-hosted models)

### **Key Features**
- ✅ **Priority-Based Selection** - Route requests to preferred providers
- ✅ **Automatic Fallback Chains** - Seamless failover if primary provider fails
- ✅ **Cost Tracking** - Real-time monitoring of usage and costs per provider/model
- ✅ **Rate Limiting** - RPM/TPM limits to prevent quota exhaustion
- ✅ **Use-Case Filtering** - Different models for homework_help, iep_analysis, lesson_planning, etc.
- ✅ **Admin Dashboard** - Configure providers without touching code

### **Architecture**
```
Request → API Gateway → AI Provider Service → Select Provider (Priority + Use Case)
                                            ↓
                                    Try Primary Provider
                                            ↓
                                    Fallback if Failure
                                            ↓
                                    Track Usage & Cost
                                            ↓
                                    Return Response
```

**Documentation:** See `MULTI_PROVIDER_AI_SYSTEM.md` for detailed configuration guide.

## 🚢 Deployment

The project includes GitHub Actions workflows for CI/CD:

### **CI Workflow** (`ci.yml`)
Runs on every push/PR:
- ✅ Install dependencies (pnpm, Python)
- ✅ Lint all packages (ESLint v9, Ruff)
- ✅ Type check (TypeScript strict mode, Pyright)
- ✅ Build all apps (Vite production build)
- ✅ Run tests (frontend + backend)

### **Deploy Workflow** (`deploy.yml`)
Deploys to production on main branch:
- ✅ Build optimized production bundles
- ✅ Deploy frontend apps (Vercel/Netlify/AWS)
- ✅ Deploy backend services (AWS ECS/Docker)
- ✅ Run database migrations
- ✅ Health checks and smoke tests

### **Deployment Checklist**

**Frontend (Static Sites):**
- Build command: `pnpm build`
- Output directory: `apps/*/dist`
- Environment variables: Copy from `.env.example`

**Backend (Docker Containers):**
```bash
# Build Docker images
docker build -t aivo-api-gateway ./services/api-gateway
docker build -t aivo-ai-service ./services/ai-service

# Run migrations before deployment
python -m alembic upgrade head

# Start services
docker-compose up -d
```

**Database:**
- PostgreSQL 16 with persistent volumes
- Automated backups every 24 hours
- Point-in-time recovery enabled

**Recommended Providers:**
- **Frontend:** Vercel (automatic deployments from GitHub)
- **Backend:** AWS ECS, Google Cloud Run, or Railway
- **Database:** AWS RDS PostgreSQL, Supabase, or Neon
- **Cache:** AWS ElastiCache Redis or Upstash

## 🧪 Testing

### **Frontend Tests**
```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter @aivo/learner-app test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### **Backend Tests**
```bash
# Run all Python tests
cd services/api-gateway
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_models.py
```

### **E2E Tests** (Playwright)
```bash
# Run end-to-end tests
pnpm test:e2e

# Run in UI mode
pnpm test:e2e:ui

# Generate test report
pnpm test:e2e:report
```

## 🔐 Authentication & Authorization

### **User Roles** (9 levels)
1. **global_admin** - Platform-wide administration
2. **district_admin** - District-level management
3. **school_admin** - School-level management
4. **teacher** - Classroom teacher
5. **special_ed_teacher** - Special education specialist
6. **therapist** - Related service provider
7. **parent** - Parent/guardian access
8. **support_staff** - Teaching assistants, etc.
9. **learner** - Student access

### **Authentication Flow**
```
1. User Login → JWT Token Generated
2. Token Stored in HTTP-only Cookie
3. Protected Routes Check Token & Role
4. API Requests Include Token in Header
5. Backend Validates Token & Permissions
```

### **Security Features**
- ✅ JWT tokens with bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ HTTP-only cookies (XSS protection)
- ✅ CSRF protection
- ✅ Rate limiting per IP/user
- ✅ MFA support (planned)

## 📚 Documentation

- **`PROMPT_48_49_COMPLETE.md`** - Database models and Pydantic schemas
- **`MULTI_PROVIDER_AI_SYSTEM.md`** - AI provider configuration guide
- **`HOMEWORK_HELPER_NAVIGATION_FIX.md`** - Homework helper implementation
- **`ERROR_FIXING_SUMMARY.md`** - Error resolution documentation
- **`BACKEND_SETUP.md`** - Backend architecture and setup
- **`.github/copilot-instructions.md`** - Project guidelines for GitHub Copilot

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Development Process**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our code style
4. Write/update tests for your changes
5. Run linting and type checking (`pnpm lint && pnpm type-check`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### **Commit Message Convention**
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding/updating tests
- `chore:` Maintenance tasks

### **Code Style**
- **TypeScript:** ESLint v9 flat config, strict mode
- **Python:** Ruff linting, Black formatting
- **Commits:** Conventional Commits format
- **PR Reviews:** At least 1 approval required

## 🐛 Bug Reports & Feature Requests

Please use GitHub Issues to report bugs or request features:
- **Bug Report:** Provide steps to reproduce, expected vs actual behavior
- **Feature Request:** Describe the feature and its use case
- **Security Issue:** Email security@aivolearning.com (do not create public issue)

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ for neurodiverse learners and their families.

### **Special Thanks**
- Special education teachers and therapists who provided invaluable feedback
- Families of neurodiverse children who helped shape our accessibility features
- Open source community for amazing tools and libraries

### **Technologies We Love**
- React 19 & Vite 7 - Lightning-fast development
- FastAPI - Modern Python web framework
- SQLAlchemy - Powerful ORM for Python
- Tailwind CSS v4 - Utility-first styling
- Turborepo - Monorepo build system
- Anthropic, OpenAI, Google - AI providers

## 📞 Contact & Support

- **Website:** https://aivolearning.com
- **Email:** support@aivolearning.com
- **GitHub Issues:** https://github.com/artpromedia/aivo-learning/issues
- **Documentation:** https://docs.aivolearning.com

---

## 🚀 Quick Start Summary

```bash
# 1. Clone repository
git clone https://github.com/artpromedia/aivo-learning.git
cd aivo-learning

# 2. Install dependencies
pnpm install

# 3. Start database
docker-compose up -d postgres redis

# 4. Run migrations
cd services/api-gateway && python -m alembic upgrade head && cd ../..

# 5. Start development servers
pnpm dev  # Frontend apps
cd services/api-gateway && uvicorn app.main:app --reload  # Backend API
```

**Frontend Apps:** http://localhost:5173-5178  
**Backend API:** http://localhost:8000/docs  
**Database:** PostgreSQL on localhost:5432  
**Cache:** Redis on localhost:6379

---

**Production-ready full-stack special education platform with multi-provider AI support!** 🎉
