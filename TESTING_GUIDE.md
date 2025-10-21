# Testing Guide - Aivo Learning Platform

## Testing Strategy

This project uses a comprehensive testing approach with multiple layers:

1. **Unit Tests** - Individual functions and utilities
2. **Component Tests** - React components in isolation
3. **Integration Tests** - Multiple components working together
4. **E2E Tests** - Full user workflows
5. **Accessibility Tests** - WCAG compliance verification

## Testing Stack

### Unit & Component Testing
- **Vitest** - Fast unit test framework (Vite-native)
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM
- **@testing-library/user-event** - User interaction simulation

### E2E Testing
- **Playwright** - Cross-browser end-to-end testing
- **@axe-core/playwright** - Automated accessibility testing

## Getting Started

### Running Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run only accessibility tests
pnpm test:a11y
```

### Writing Unit Tests

Location: `apps/*/src/__tests__/`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@aivo/ui';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('is accessible', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveAccessibleName('Click me');
  });
});
```

### Writing Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import LoginForm from '../components/LoginForm';

describe('LoginForm', () => {
  it('validates email format', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Enter invalid email
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    // Fill form
    await userEvent.type(
      screen.getByLabelText(/email/i),
      'test@example.com'
    );
    await userEvent.type(
      screen.getByLabelText(/password/i),
      'password123'
    );
    
    // Submit
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify submission
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

### Writing E2E Tests

Location: `e2e/`

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[name="email"]', 'parent@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('/parent/dashboard');
    
    // Verify dashboard loads
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.getByRole('alert')).toContainText(/invalid credentials/i);
  });
});
```

### Writing Accessibility Tests

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility @a11y', () => {
  test('homepage should pass accessibility audit', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('form')
      .analyze();
    
    const labelViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'label'
    );
    expect(labelViolations).toHaveLength(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through page
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });
});
```

## Testing Patterns

### Testing Async Components

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import UserProfile from '../components/UserProfile';

describe('UserProfile', () => {
  it('loads and displays user data', async () => {
    // Mock API call
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'John Doe', email: 'john@example.com' }),
    });
    global.fetch = mockFetch;
    
    render(<UserProfile userId="123" />);
    
    // Check loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(mockFetch).toHaveBeenCalledWith('/api/users/123');
  });
});
```

### Testing with React Router

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

test('renders dashboard with navigation', () => {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </MemoryRouter>
  );
  
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

### Testing Forms

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import ContactForm from '../components/ContactForm';

test('validates required fields', async () => {
  render(<ContactForm />);
  
  const submitButton = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(submitButton);
  
  // Check for validation errors
  expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});
```

### Testing Error Boundaries

```typescript
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

test('catches and displays errors', () => {
  // Suppress console.error for this test
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  spy.mockRestore();
});
```

## Mock Data

Create mock data in `src/__tests__/mocks/`:

```typescript
// src/__tests__/mocks/user.ts
export const mockUser = {
  id: '123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'parent' as const,
};

export const mockLearner = {
  id: '456',
  firstName: 'Alex',
  lastName: 'Smith',
  grade: '3rd',
  parentIds: ['123'],
};
```

## Coverage Goals

- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

View coverage report:
```bash
pnpm test:coverage
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

### 1. Test Behavior, Not Implementation

❌ **Don't:**
```typescript
expect(component.state.isLoading).toBe(true);
```

✅ **Do:**
```typescript
expect(screen.getByText(/loading/i)).toBeInTheDocument();
```

### 2. Use Accessible Queries

Prefer queries that reflect how users interact:
1. `getByRole`
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (last resort)

### 3. Avoid Testing Implementation Details

❌ **Don't:**
```typescript
expect(wrapper.find('.button-class')).toHaveLength(1);
```

✅ **Do:**
```typescript
expect(screen.getByRole('button')).toBeInTheDocument();
```

### 4. Write Descriptive Test Names

❌ **Don't:**
```typescript
test('works', () => { ... });
```

✅ **Do:**
```typescript
test('displays error message when email is invalid', () => { ... });
```

### 5. Keep Tests Independent

Each test should:
- Set up its own data
- Clean up after itself
- Not depend on other tests

### 6. Test Accessibility

Every component test should verify:
- Semantic HTML usage
- ARIA attributes
- Keyboard navigation
- Focus management

## Debugging Tests

### Vitest UI

```bash
pnpm test:ui
```

Opens an interactive UI for debugging tests.

### Playwright Inspector

```bash
pnpm test:e2e --debug
```

Opens step-by-step inspector for E2E tests.

### Console Debugging

```typescript
import { screen } from '@testing-library/react';

// Log current DOM
screen.debug();

// Log specific element
screen.debug(screen.getByRole('button'));
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

Last Updated: January 2025
