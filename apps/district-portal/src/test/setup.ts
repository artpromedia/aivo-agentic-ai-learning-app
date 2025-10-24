import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { server } from './mocks/server'

// ============================================================================
// MSW Server Setup
// ============================================================================
beforeAll(() => {
  // Start MSW server before all tests
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  // Reset MSW handlers after each test
  server.resetHandlers()
  // Cleanup DOM after each test
  cleanup()
  // Clear all mocks
  vi.clearAllMocks()
})

afterAll(() => {
  // Close MSW server after all tests
  server.close()
})

// ============================================================================
// Mock window.matchMedia (for responsive components)
// ============================================================================
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// ============================================================================
// Mock localStorage
// ============================================================================
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// ============================================================================
// Mock sessionStorage
// ============================================================================
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// ============================================================================
// Mock IntersectionObserver (for lazy loading, animations)
// ============================================================================
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// ============================================================================
// Mock console methods to reduce noise in tests
// ============================================================================
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}
