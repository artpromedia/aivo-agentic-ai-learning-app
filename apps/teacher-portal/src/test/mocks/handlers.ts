import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:9000'

export const handlers = [
  // ============================================================================
  // Auth endpoints
  // ============================================================================
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (body.email === 'teacher@example.com' && body.password === 'Test123!') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: '123',
          email: 'teacher@example.com',
          full_name: 'Test Teacher',
          role: 'teacher',
        },
        redirect_url: 'http://localhost:5175',
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
      email: 'teacher@example.com',
      full_name: 'Test Teacher',
      role: 'teacher',
      is_verified: true,
      onboarding_status: 'complete',
    })
  }),

  // ============================================================================
  // Teacher/Classroom endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/teachers/me/learners`, () => {
    return HttpResponse.json([
      {
        id: '456',
        first_name: 'Sarah',
        last_name: 'Smith',
        grade_level: 3,
        has_iep: false,
      },
      {
        id: '457',
        first_name: 'John',
        last_name: 'Doe',
        grade_level: 3,
        has_iep: true,
      },
    ])
  }),

  http.get(`${API_BASE}/api/v1/teachers/me/roster`, () => {
    return HttpResponse.json({
      total_students: 22,
      students_with_iep: 5,
      average_grade_level: 3.2,
    })
  }),

  // ============================================================================
  // Assignment endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/assignments`, () => {
    return HttpResponse.json([
      {
        id: 'assignment-1',
        title: 'Multiplication Practice',
        subject: 'Math',
        due_date: new Date(Date.now() + 86400000).toISOString(),
        assigned_to: 22,
        completed_by: 15,
      },
    ])
  }),

  http.post(`${API_BASE}/api/v1/assignments`, async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      id: 'new-assignment-123',
      ...body,
      created_at: new Date().toISOString(),
    })
  }),
]

