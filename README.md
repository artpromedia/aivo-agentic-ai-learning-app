# Aivo Learning

> Personalized AI-powered special education platform for neurodiverse children

[![CI](https://github.com/yourusername/aivo-learning/workflows/CI/badge.svg)](https://github.com/yourusername/aivo-learning/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Overview

Aivo Learning is a comprehensive special education platform that leverages AI to provide personalized learning experiences for neurodiverse children. The platform includes separate interfaces for learners, parents, and teachers, all designed with accessibility and individualized education in mind.

## 🏗️ Architecture

This project is a **Turborepo monorepo** containing:

### Apps

- **`apps/web`** (Port 3000) - Marketing website and landing pages
- **`apps/parent-portal`** (Port 3001) - Parent dashboard for tracking child progress
- **`apps/teacher-portal`** (Port 3002) - Teacher tools for IEP management
- **`apps/learner-app`** (Port 3003) - Child-facing learning interface
- **`apps/api`** - Backend API (placeholder)

### Packages

- **`packages/ui`** - Shared React component library
- **`packages/types`** - Shared TypeScript type definitions
- **`packages/utils`** - Shared utility functions
- **`packages/config`** - Shared configurations (ESLint, TypeScript, Tailwind)

## 🛠️ Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite 7+
- **Language:** TypeScript 5.6+
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand
- **Routing:** React Router v6
- **Monorepo:** Turborepo
- **Package Manager:** pnpm v10
- **Linting:** ESLint v9 (flat config)
- **Node.js:** v20.19.4

## 📋 Prerequisites

- Node.js >= 20.19.4 (use `.nvmrc` for version management)
- pnpm >= 10.0.0

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install pnpm globally if you haven't already
npm install -g pnpm@10

# Install all dependencies
pnpm install
```

### 2. Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter @aivo/web dev
pnpm --filter @aivo/parent-portal dev
pnpm --filter @aivo/teacher-portal dev
pnpm --filter @aivo/learner-app dev
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
│   ├── copilot-instructions.md
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── apps/
│   ├── web/                    # Marketing site (Port 3000)
│   ├── parent-portal/          # Parent dashboard (Port 3001)
│   ├── teacher-portal/         # Teacher tools (Port 3002)
│   ├── learner-app/            # Learning interface (Port 3003)
│   └── api/                    # API server (placeholder)
├── packages/
│   ├── ui/                     # Shared components
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   └── config/                 # Shared configs
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
├── .gitignore
├── .nvmrc
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

## 🎨 Component Library

The `@aivo/ui` package provides reusable components:

- **Button** - Primary, secondary, outline, and ghost variants
- **Card** - Default, bordered, and elevated variants
- **Input** - Form input with label, error, and helper text
- **Grid** - Responsive grid layout system
- **ProgressBar** - Visual progress indicator

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | Type check all packages |
| `pnpm clean` | Clean all build artifacts and dependencies |
| `pnpm format` | Format code with Prettier |

## 🔧 Configuration

### ESLint v9

The project uses ESLint v9 with flat config format. Configuration is located in `packages/config/eslint/index.js`.

### TypeScript

Three TypeScript configurations are available:
- `@aivo/typescript-config/base.json` - Base configuration
- `@aivo/typescript-config/react.json` - React projects
- `@aivo/typescript-config/node.json` - Node.js projects

### Tailwind CSS v4

Shared Tailwind configuration with custom color palette for accessibility:
- Primary colors (blues) for main actions
- Accent colors (purples) for secondary actions
- Custom fonts: Inter (sans), Poppins (display)

## 🚢 Deployment

The project includes GitHub Actions workflows for CI/CD:

- **CI Workflow** - Runs on every push/PR (lint, type-check, build)
- **Deploy Workflow** - Deploys to production on main branch

Configure your deployment provider (Vercel, Netlify, AWS, etc.) in `.github/workflows/deploy.yml`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built with ❤️ for neurodiverse learners and their families.

---

**Note:** This is a production-ready monorepo setup. Run `pnpm install` to get started!
