import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// ============================================================================
// Custom Render Function with All Providers
// ============================================================================
interface AllTheProvidersProps {
  children: ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// ============================================================================
// Helper: Render with authenticated user
// ============================================================================
interface MockUser {
  id: string
  email: string
  full_name: string
  role: string
}

export const renderWithAuth = (
  ui: ReactElement,
  user: MockUser = {
    id: '123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'parent',
  }
) => {
  // Mock localStorage with auth token
  window.localStorage.setItem('auth_token', 'mock-jwt-token')
  window.localStorage.setItem('user', JSON.stringify(user))

  return customRender(ui)
}

// ============================================================================
// Helper: Wait for loading states to complete
// ============================================================================
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}
