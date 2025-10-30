import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:9000'

export const handlers = [
  // ============================================================================
  // Auth endpoints
  // ============================================================================
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (body.email === 'admin@example.com' && body.password === 'Admin123!') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: '123',
          email: 'admin@example.com',
          full_name: 'Test Admin',
          role: 'global_admin',
        },
        redirect_url: 'http://localhost:5176',
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
      email: 'admin@example.com',
      full_name: 'Test Admin',
      role: 'global_admin',
      is_verified: true,
      onboarding_status: 'complete',
    })
  }),

  // ============================================================================
  // License Vault endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/admin/licensing/vault/status`, () => {
    return HttpResponse.json({
      total_licenses: 10000,
      available_licenses: 3500,
      assigned_licenses: 6500,
      utilization_rate: 0.65,
    })
  }),

  http.post(`${API_BASE}/api/v1/admin/licensing/vault/provision`, async ({ request }) => {
    const body = await request.json() as { quantity: number }
    return HttpResponse.json({
      licenses_added: body.quantity,
      new_total: 10000 + body.quantity,
      batch_id: 'batch-123',
    })
  }),

  // ============================================================================
  // District Management endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/admin/licensing/districts`, () => {
    return HttpResponse.json([
      {
        id: 'district-1',
        name: 'Test School District',
        state_code: 'CA',
        total_licenses: 500,
        active_licenses: 350,
      },
    ])
  }),

  http.post(`${API_BASE}/api/v1/admin/licensing/districts`, async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      id: 'new-district-123',
      ...body,
      created_at: new Date().toISOString(),
    })
  }),

  // ============================================================================
  // License provisioning endpoints
  // ============================================================================
  http.post(`${API_BASE}/api/v1/admin/licensing/assign`, async ({ request }) => {
    const body = await request.json() as { district_id: string; quantity: number }
    return HttpResponse.json({
      district_id: body.district_id,
      licenses_assigned: body.quantity,
      assignment_id: 'assignment-123',
    })
  }),

  // ============================================================================
  // Analytics endpoints
  // ============================================================================
  http.get(`${API_BASE}/api/v1/admin/licensing/analytics`, () => {
    return HttpResponse.json({
      total_districts: 50,
      total_schools: 500,
      total_users: 25000,
      total_licenses: 10000,
      daily_active_users: 18000,
      weekly_active_users: 22000,
      monthly_active_users: 24000,
    })
  }),
]

