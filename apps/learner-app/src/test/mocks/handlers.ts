import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000'

export const handlers = [
  // ============================================================================
  // Auth endpoints
  // ============================================================================
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (body.email === 'test@example.com' && body.password === 'Test123!') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: '123',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'parent',
        },
        redirect_url: 'http://localhost:5174',
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
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'parent',
      is_verified: true,
      onboarding_status: 'complete',
    })
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  http.post(`${API_BASE}/auth/refresh`, () => {
    return HttpResponse.json({
      access_token: 'new-mock-access-token',
    })
  }),

  // ============================================================================
  // Learners endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/learners`, () => {
    return HttpResponse.json([
      {
        id: '456',
        user_id: '123',
        first_name: 'Sarah',
        last_name: 'Smith',
        grade_level: 3,
        grade_theme: 'K5',
        school_name: 'Test Elementary School',
        has_iep: false,
      },
    ])
  }),

  http.get(`${API_BASE}/api/v1/learners/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      user_id: '123',
      first_name: 'Sarah',
      last_name: 'Smith',
      date_of_birth: '2015-03-15',
      grade_level: 3,
      grade_theme: 'K5',
      school_name: 'Test Elementary School',
      district_name: 'Test District',
      state_code: 'CA',
      has_iep: false,
      diagnoses: [],
      accommodations: [],
      baseline_assessment_completed: true,
    })
  }),

  // ============================================================================
  // Homework endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/homework/sessions`, () => {
    return HttpResponse.json([
      {
        id: '789',
        learner_id: '456',
        subject: 'Math',
        topic: 'Multiplication Tables',
        status: 'in_progress',
        current_step: 2,
        total_steps: 4,
        started_at: new Date().toISOString(),
        completed_at: null,
      },
    ])
  }),

  http.post(`${API_BASE}/api/v1/homework/sessions`, async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      id: 'new-session-123',
      learner_id: body.learner_id,
      subject: body.subject,
      topic: body.topic,
      status: 'in_progress',
      current_step: 1,
      total_steps: 4,
      started_at: new Date().toISOString(),
      completed_at: null,
    })
  }),

  http.post(`${API_BASE}/api/v1/homework/upload`, async () => {
    return HttpResponse.json({
      file_id: 'file-123',
      ocr_text: 'Solve: 1/2 + 1/4 = ?',
      detected_subject: 'Math',
    })
  }),

  http.post(`${API_BASE}/api/v1/homework/complete`, async ({ request }) => {
    const body = await request.json() as { session_id: string }
    return HttpResponse.json({
      session_id: body.session_id,
      completed_at: new Date().toISOString(),
    })
  }),

  http.post(`${API_BASE}/api/v1/homework/autosave`, () => {
    return HttpResponse.json({ saved: true })
  }),

  // ============================================================================
  // AI endpoints
  // ============================================================================
  http.post(`${API_BASE}/api/v1/ai/generate`, () => {
    return HttpResponse.json({
      response: 'This is a mock AI response for testing.',
      provider: 'openai',
      model: 'gpt-4',
    })
  }),

  http.post(`${API_BASE}/api/v1/ai/hint`, async ({ request }) => {
    await request.json() as { question: string }
    return HttpResponse.json({
      hint: 'To add fractions, you need a common denominator.',
      explanation: 'The common denominator for 2 and 4 is 4.',
      next_step: 'Convert 1/2 to 2/4, then add to 1/4.',
    })
  }),

  // ============================================================================
  // Focus & Regulation endpoints
  // ============================================================================
  http.post(`${API_BASE}/api/v1/focus/track`, () => {
    return HttpResponse.json({ tracked: true })
  }),

  http.get(`${API_BASE}/api/v1/focus/status/:learnerId`, () => {
    return HttpResponse.json({
      current_state: 'focused',
      attention_score: 0.85,
      should_break: false,
      game_recommendations: [],
    })
  }),

  http.post(`${API_BASE}/api/v1/regulation/start`, () => {
    return HttpResponse.json({
      session_id: 'reg-session-123',
      game_type: 'breathing',
      duration_seconds: 180,
    })
  }),

  // ============================================================================
  // Games endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/games/suggestions`, () => {
    return HttpResponse.json([
      {
        id: 'breathing-coach',
        name: 'Breathing Coach',
        type: 'breathing',
        difficulty: 'easy',
        duration_minutes: 3,
        helps_with: 'Deep breathing and relaxation',
      },
      {
        id: 'quick-reflex',
        name: 'Quick Reflex',
        type: 'reaction',
        difficulty: 'medium',
        duration_minutes: 2,
        helps_with: 'Hand-eye coordination and focus',
      },
    ])
  }),
]
