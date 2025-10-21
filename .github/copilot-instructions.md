# Aivo Learning - Copilot Instructions

## Project Overview
Aivo Learning is a special education platform with personalized AI models for neurodiverse children.

## Tech Stack
- Node.js: v20.19.4
- Package Manager: pnpm v10
- Build Tool: Vite v7+
- Framework: React 19
- TypeScript: v5.6+
- ESLint: v9 (flat config)
- Styling: Tailwind CSS v4
- State Management: Zustand
- Routing: React Router v6
- Monorepo: Turborepo

## Project Structure
- `apps/web`: Main marketing/landing site
- `apps/parent-portal`: Parent dashboard
- `apps/teacher-portal`: Teacher dashboard
- `apps/learner-app`: Child-facing learning interface
- `apps/api`: Backend API
- `packages/ui`: Shared UI components
- `packages/config`: Shared configurations
- `packages/types`: Shared TypeScript types
- `packages/utils`: Shared utilities

## Development Guidelines
- Use pnpm for package management
- Follow ESLint v9 flat config format
- Use TypeScript strict mode
- Implement responsive design with Tailwind CSS v4
- Focus on accessibility for neurodiverse learners
- Follow atomic design principles for UI components
