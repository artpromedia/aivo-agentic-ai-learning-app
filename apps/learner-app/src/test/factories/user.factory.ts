export interface MockUser {
  id: string
  email: string
  full_name: string
  role: 'parent' | 'teacher' | 'learner' | 'admin' | 'global_admin' | 'district_admin'
  is_verified: boolean
  onboarding_status: string
  created_at: string
}

let userIdCounter = 1

export const createMockUser = (overrides?: Partial<MockUser>): MockUser => {
  const id = `user-${userIdCounter++}`
  return {
    id,
    email: `user${id}@example.com`,
    full_name: `Test User ${id}`,
    role: 'parent',
    is_verified: true,
    onboarding_status: 'complete',
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

export const createMockParent = (overrides?: Partial<MockUser>): MockUser => {
  return createMockUser({
    role: 'parent',
    ...overrides,
  })
}

export const createMockTeacher = (overrides?: Partial<MockUser>): MockUser => {
  return createMockUser({
    role: 'teacher',
    ...overrides,
  })
}

export const createMockLearner = (overrides?: Partial<MockUser>): MockUser => {
  return createMockUser({
    role: 'learner',
    ...overrides,
  })
}

export const createMockAdmin = (overrides?: Partial<MockUser>): MockUser => {
  return createMockUser({
    role: 'global_admin',
    ...overrides,
  })
}
