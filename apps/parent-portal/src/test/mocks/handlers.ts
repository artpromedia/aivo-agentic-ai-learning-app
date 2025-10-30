import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:9000'

export const handlers = [
  // ============================================================================
  // Auth endpoints
  // ============================================================================
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (body.email === 'parent@example.com' && body.password === 'Test123!') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: '123',
          email: 'parent@example.com',
          full_name: 'Test Parent',
          role: 'parent',
        },
        redirect_url: 'http://localhost:5173',
      })
    }
    
    return HttpResponse.json(
      { detail: 'Incorrect email or password' },
      { status: 401 }
    )
  }),

  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json({
      id: '123',
      email: 'parent@example.com',
      full_name: 'Test Parent',
      role: 'parent',
      is_verified: true,
      onboarding_status: 'complete',
    })
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  // ============================================================================
  // Parent/Learner endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/parents/me/learners`, () => {
    return HttpResponse.json([
      {
        id: '456',
        first_name: 'Sarah',
        last_name: 'Smith',
        grade_level: 3,
        grade_theme: 'K5',
        has_iep: false,
      },
    ])
  }),

  http.post(`${API_BASE}/api/v1/learners`, async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      id: 'new-learner-123',
      ...body,
      created_at: new Date().toISOString(),
    })
  }),

  // ============================================================================
  // Progress & Analytics endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/learners/:id/progress`, () => {
    return HttpResponse.json({
      overall_progress: 75,
      subjects: {
        math: 80,
        reading: 85,
        science: 70,
        writing: 65,
      },
      recent_sessions: [],
    })
  }),

  http.get(`${API_BASE}/api/v1/learners/:id/homework/history`, () => {
    return HttpResponse.json([
      {
        id: '789',
        subject: 'Math',
        topic: 'Fractions',
        status: 'completed',
        completed_at: new Date().toISOString(),
      },
    ])
  }),

  // ============================================================================
  // IEP endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/learners/:id/iep`, () => {
    return HttpResponse.json({
      id: 'iep-123',
      learner_id: '456',
      goals: [],
      accommodations: [],
      last_updated: new Date().toISOString(),
    })
  }),
]

