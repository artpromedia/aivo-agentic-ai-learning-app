# Contributing to AIVO Learning Platform

Thank you for your interest in contributing to AIVO Learning! This platform helps neurodiverse children succeed through personalized AI-powered education. Every contribution makes a difference in a child's learning journey.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing Requirements](#testing-requirements)
- [Code Style Guide](#code-style-guide)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Common Tasks](#common-tasks)
- [Need Help?](#need-help)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Background or identity
- Level of experience
- Nationality or culture
- Personal appearance
- Race, ethnicity, or religion
- Gender identity or sexual orientation

### Expected Behavior

- **Be respectful** and considerate in all communications
- **Be collaborative** and open to feedback
- **Focus on what's best** for the children using our platform
- **Show empathy** towards other contributors
- **Assume positive intent** in discussions

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Spam or self-promotion unrelated to the project

**Violations:** Report to [conduct@aivolearning.com](mailto:conduct@aivolearning.com)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js:** v20.19.4 or later
- **pnpm:** v10.0.0 or later
- **Python:** v3.11 or later
- **Git:** Latest version
- **PostgreSQL:** v14+ (for backend development)
- **Redis:** v7+ (for caching and rate limiting)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/aivo-agentic-ai-learning-app.git
   cd aivo-agentic-ai-learning-app
   ```

2. **Install dependencies**
   ```bash
   # Install all workspace dependencies
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example env files
   cp .env.example .env
   cp services/api-gateway/.env.example services/api-gateway/.env
   
   # Edit .env files with your local values
   ```

4. **Start development services**
   ```bash
   # Start PostgreSQL and Redis (using Docker)
   docker-compose up -d postgres redis
   
   # Run database migrations
   cd services/api-gateway
   alembic upgrade head
   cd ../..
   ```

5. **Start development servers**
   ```bash
   # Start all apps in development mode
   pnpm dev
   
   # Or start specific apps
   pnpm --filter @aivo/learner-app dev
   pnpm --filter @aivo/parent-portal dev
   ```

---

## 🔄 Development Workflow

### 1. Create a Feature Branch

**Always** create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/my-awesome-feature

# For bug fixes
git checkout -b fix/bug-description

# For documentation
git checkout -b docs/what-you-are-documenting
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow our [Code Style Guide](#code-style-guide)
- Add tests for new features
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

**Before committing**, ensure all tests pass:

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter @aivo/learner-app test

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm typecheck
```

### 4. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add new homework hint feature"
```

See [Commit Message Guidelines](#commit-message-guidelines) for details.

### 5. Push to Your Fork

```bash
git push origin feature/my-awesome-feature
```

### 6. Create a Pull Request

1. Go to the [original repository](https://github.com/artpromedia/aivo-agentic-ai-learning-app)
2. Click "New Pull Request"
3. Select your fork and feature branch
4. Fill out the PR template completely
5. Link any related issues
6. Wait for CI checks to pass
7. Request review from maintainers

---

## ✅ Testing Requirements

### Coverage Requirements

**All contributions must maintain or improve test coverage:**
- **Minimum coverage:** 80% for both frontend and backend
- **New features:** Must include tests
- **Bug fixes:** Must include regression tests
- **Refactoring:** Must not decrease coverage

### Frontend Testing (Vitest + React Testing Library)

```bash
# Run tests with coverage
pnpm --filter @aivo/learner-app test:coverage

# Run tests in watch mode
pnpm --filter @aivo/learner-app test:watch

# Run tests for specific file
pnpm --filter @aivo/learner-app test src/components/HomeworkHelper/HomeworkHelper.test.tsx
```

**What to test:**
- ✅ Component rendering with different props
- ✅ User interactions (clicks, typing, form submission)
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Edge cases and error states
- ✅ API integration with MSW mocks

**Example Test:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomeworkHelper } from './HomeworkHelper';

describe('HomeworkHelper', () => {
  it('should generate hint when button clicked', async () => {
    const user = userEvent.setup();
    render(<HomeworkHelper problemText="2x + 5 = 13" />);
    
    const hintButton = screen.getByRole('button', { name: /get hint/i });
    await user.click(hintButton);
    
    expect(await screen.findByText(/helpful hint/i)).toBeInTheDocument();
  });
});
```

### Backend Testing (pytest)

```bash
# Run all backend tests
cd services/api-gateway
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::TestLogin::test_login_success
```

**What to test:**
- ✅ API endpoints (success and error cases)
- ✅ Database operations (CRUD)
- ✅ Authentication and authorization
- ✅ Rate limiting
- ✅ Input validation
- ✅ Business logic

**Example Test:**
```python
def test_create_learner(client, auth_headers):
    response = client.post(
        "/api/learners",
        headers=auth_headers,
        json={
            "first_name": "Emma",
            "grade_level": 8,
            "diagnoses": ["ADHD"]
        }
    )
    
    assert response.status_code == 201
    assert response.json()["first_name"] == "Emma"
```

### E2E Testing (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Run in UI mode
pnpm test:e2e:ui

# Run specific test
pnpm test:e2e tests/auth.spec.ts
```

### Mobile Testing (Detox)

```bash
# Build iOS app for testing
cd apps/mobile-student
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug
```

---

## 🎨 Code Style Guide

### TypeScript/JavaScript

We use **ESLint v9** with flat config:

```typescript
// ✅ Good
export const calculateScore = (answers: Answer[]): number => {
  return answers.reduce((sum, answer) => {
    return answer.isCorrect ? sum + answer.points : sum;
  }, 0);
};

// ❌ Bad
export function calculateScore(answers) {
  var total = 0;
  for (var i = 0; i < answers.length; i++) {
    if (answers[i].isCorrect) {
      total = total + answers[i].points;
    }
  }
  return total;
}
```

**Rules:**
- ✅ Use TypeScript strict mode
- ✅ Prefer `const` over `let`, avoid `var`
- ✅ Use arrow functions for callbacks
- ✅ Use async/await over promises
- ✅ Export named exports, avoid default exports
- ✅ Use meaningful variable names
- ✅ Add JSDoc comments for complex functions

### React Components

```typescript
// ✅ Good - Functional component with TypeScript
interface HomeworkCardProps {
  title: string;
  subject: string;
  dueDate: Date;
  onStart: () => void;
}

export const HomeworkCard: React.FC<HomeworkCardProps> = ({
  title,
  subject,
  dueDate,
  onStart,
}) => {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{subject}</p>
      <button onClick={onStart}>Start</button>
    </div>
  );
};
```

**Rules:**
- ✅ Use functional components with hooks
- ✅ Type all props with interfaces
- ✅ Extract complex logic to custom hooks
- ✅ Keep components under 200 lines
- ✅ Use semantic HTML
- ✅ Follow accessibility best practices

### Python (Backend)

We use **Black** for formatting and **Ruff** for linting:

```python
# ✅ Good
async def create_homework_session(
    learner_id: int,
    subject: str,
    db: AsyncSession
) -> HomeworkSession:
    """Create a new homework session for a learner.
    
    Args:
        learner_id: The ID of the learner
        subject: The subject area (e.g., "Mathematics")
        db: Database session
        
    Returns:
        The created homework session
        
    Raises:
        HTTPException: If learner not found
    """
    learner = await db.get(Learner, learner_id)
    if not learner:
        raise HTTPException(status_code=404, detail="Learner not found")
    
    session = HomeworkSession(
        learner_id=learner_id,
        subject=subject,
        status="active"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return session
```

**Rules:**
- ✅ Use async/await for I/O operations
- ✅ Type hint all function parameters and returns
- ✅ Use docstrings for all public functions
- ✅ Follow PEP 8 naming conventions
- ✅ Use SQLAlchemy ORM (avoid raw SQL)
- ✅ Validate inputs with Pydantic models

### CSS/Styling

We use **Tailwind CSS v4**:

```typescript
// ✅ Good - Tailwind classes, responsive, accessible
<button
  className="
    rounded-lg bg-primary px-4 py-2 text-white
    hover:bg-primary/90 focus:outline-none focus:ring-2
    focus:ring-primary focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    sm:px-6 sm:py-3
  "
  aria-label="Start homework"
>
  Start
</button>

// ❌ Bad - Inline styles, not accessible
<button style={{backgroundColor: '#0066cc', padding: '8px 16px'}}>
  Start
</button>
```

**Rules:**
- ✅ Use Tailwind utility classes
- ✅ Use CSS variables from design system
- ✅ Add responsive classes (sm:, md:, lg:)
- ✅ Include focus states for accessibility
- ✅ Use semantic color names (primary, secondary)

### Accessibility (A11y)

**All UI components must be accessible:**

```typescript
// ✅ Good - Accessible
<button
  onClick={handleSubmit}
  aria-label="Submit homework"
  aria-busy={isSubmitting}
  disabled={isSubmitting}
>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</button>

// ❌ Bad - Not accessible
<div onClick={handleSubmit}>
  Click here
</div>
```

**Requirements:**
- ✅ Use semantic HTML elements
- ✅ Add ARIA labels where needed
- ✅ Ensure keyboard navigation works
- ✅ Maintain color contrast (WCAG AA)
- ✅ Support screen readers
- ✅ Test with keyboard only

---

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, no logic change)
- **refactor:** Code refactoring (no feature change)
- **test:** Adding or updating tests
- **chore:** Maintenance tasks (dependencies, build config)
- **perf:** Performance improvements
- **ci:** CI/CD configuration changes

### Scopes (Optional)

- `learner-app` - Learner-facing application
- `parent-portal` - Parent dashboard
- `teacher-portal` - Teacher dashboard
- `admin-portal` - Admin dashboard
- `api` - Backend API
- `ui` - Shared UI components
- `auth` - Authentication system
- `homework` - Homework features
- `games` - Game library

### Examples

```bash
# Feature
feat(learner-app): add AI hint generation for math problems

# Bug fix
fix(api): resolve rate limiting issue for login endpoint

# Documentation
docs: update database migration guide with rollback instructions

# Breaking change
feat(api)!: change authentication token format

BREAKING CHANGE: JWT tokens now include user role in payload.
Clients must update token parsing logic.
```

### Rules

- ✅ Use imperative mood ("add" not "added")
- ✅ Keep subject line under 72 characters
- ✅ Don't capitalize first letter of subject
- ✅ No period at end of subject
- ✅ Reference issues: "fixes #123" in footer
- ✅ Explain "why" in body, not "what"

---

## 🔍 Pull Request Process

### Before Creating PR

- [ ] All tests pass locally
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Coverage is ≥80%
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### PR Template

When creating a PR, fill out the template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guide
- [ ] All CI checks pass
```

### Review Process

1. **Automated Checks** - CI must pass:
   - ✅ Linting
   - ✅ Type checking
   - ✅ Unit tests
   - ✅ Integration tests
   - ✅ E2E tests
   - ✅ Security scanning

2. **Code Review** - At least 1 approval required:
   - Maintainers review code quality
   - Check for accessibility issues
   - Verify test coverage
   - Ensure documentation is clear

3. **Changes Requested**:
   - Address all feedback
   - Push new commits (don't force push)
   - Re-request review when ready

4. **Approval**:
   - Maintainer approves PR
   - CI checks pass
   - Branch is merged (squash and merge)

### After Merge

- Delete your feature branch
- Update your fork:
  ```bash
  git checkout main
  git pull upstream main
  git push origin main
  ```

---

## 📁 Project Structure

```
aivo-learning/
├── apps/                      # Frontend applications
│   ├── learner-app/          # Student-facing app
│   ├── parent-portal/        # Parent dashboard
│   ├── teacher-portal/       # Teacher dashboard
│   ├── admin-portal/         # Admin dashboard
│   ├── district-portal/      # District management
│   ├── web/                  # Marketing website
│   └── mobile-student/       # React Native app
│
├── services/                  # Backend services
│   ├── api-gateway/          # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/          # API routes
│   │   │   ├── models/       # SQLAlchemy models
│   │   │   ├── schemas/      # Pydantic schemas
│   │   │   └── core/         # Core utilities
│   │   └── tests/            # Backend tests
│   └── ai-services/          # AI/ML services
│
├── packages/                  # Shared packages
│   ├── ui/                   # Shared UI components
│   ├── auth/                 # Auth utilities
│   ├── types/                # TypeScript types
│   ├── utils/                # Utility functions
│   └── config/               # Shared configs
│
├── docs/                      # Documentation
├── .github/                   # GitHub Actions
└── scripts/                   # Build/deploy scripts
```

### Key Files

- `turbo.json` - Turborepo task pipeline
- `pnpm-workspace.yaml` - Workspace configuration
- `.env.example` - Environment variable template
- `vitest.config.ts` - Test configuration
- `pytest.ini` - Backend test configuration

---

## 🛠️ Common Tasks

### Running Specific Apps

```bash
# Learner app
pnpm --filter @aivo/learner-app dev

# Parent portal
pnpm --filter @aivo/parent-portal dev

# Backend API
cd services/api-gateway
uvicorn app.main:app --reload
```

### Database Migrations

```bash
# Create new migration
cd services/api-gateway
alembic revision --autogenerate -m "Add sensory preferences table"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

### Adding Dependencies

```bash
# Add to workspace root
pnpm add -w <package>

# Add to specific app
pnpm --filter @aivo/learner-app add <package>

# Add dev dependency
pnpm --filter @aivo/learner-app add -D <package>
```

### Running Tests

```bash
# All tests
pnpm test

# Specific app
pnpm --filter @aivo/learner-app test

# Backend tests
cd services/api-gateway
pytest

# E2E tests
pnpm test:e2e
```

### Linting and Formatting

```bash
# Lint all
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format with Prettier
pnpm format

# Type check
pnpm typecheck
```

### Building for Production

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @aivo/learner-app build
```

---

## ❓ Need Help?

### Resources

- **Documentation:** [docs/](./docs/)
- **API Docs:** http://localhost:8000/docs (when backend running)
- **Design System:** [packages/ui/](./packages/ui/)
- **CI/CD Guide:** [.github/workflows/README.md](./.github/workflows/README.md)

### Getting Support

- **GitHub Issues:** Report bugs or request features
- **GitHub Discussions:** Ask questions, share ideas
- **Discord:** Join our community (link in README)
- **Email:** dev@aivolearning.com

### First-Time Contributors

Look for issues labeled:
- `good first issue` - Great for beginners
- `help wanted` - Maintainers need help
- `documentation` - Documentation improvements

---

## 🙏 Recognition

All contributors are recognized in:
- README.md contributors section
- Release notes for their contributions
- Annual contributor acknowledgments

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](./LICENSE)).

---

## 🎯 Focus Areas

We especially welcome contributions in:

1. **Accessibility** - Making the platform more accessible for neurodiverse learners
2. **Testing** - Improving test coverage and adding E2E tests
3. **Documentation** - Clarifying setup, API docs, feature guides
4. **Performance** - Optimizing load times and responsiveness
5. **Mobile** - Enhancing the React Native student app
6. **AI Features** - Improving hint generation and personalization
7. **Internationalization** - Adding support for more languages

---

Thank you for contributing to AIVO Learning! Your work helps neurodiverse children succeed. 🌟
