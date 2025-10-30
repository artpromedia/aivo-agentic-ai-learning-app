import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:9000'

export const handlers = [
  // ============================================================================
  // Auth endpoints
  // ============================================================================
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (body.email === 'district@example.com' && body.password === 'Test123!') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: '123',
          email: 'district@example.com',
          full_name: 'Test District Admin',
          role: 'district_admin',
        },
        redirect_url: 'http://localhost:5177',
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
      email: 'district@example.com',
      full_name: 'Test District Admin',
      role: 'district_admin',
      is_verified: true,
      onboarding_status: 'complete',
    })
  }),

  // ============================================================================
  // District endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/district/licenses/status`, () => {
    return HttpResponse.json({
      total_licenses: 500,
      active_licenses: 350,
      available_licenses: 150,
      expiring_soon: 20,
    })
  }),

  http.get(`${API_BASE}/api/v1/district/schools`, () => {
    return HttpResponse.json([
      {
        id: 'school-1',
        name: 'Lincoln Elementary',
        total_students: 450,
        active_licenses: 400,
      },
      {
        id: 'school-2',
        name: 'Washington Middle School',
        total_students: 650,
        active_licenses: 600,
      },
    ])
  }),

  http.get(`${API_BASE}/api/v1/district/analytics`, () => {
    return HttpResponse.json({
      total_schools: 10,
      total_students: 5000,
      total_teachers: 250,
      license_utilization: 0.78,
    })
  }),
]

