/**
 * Admin License API Client
 * 
 * Axios-based client for admin licensing vault endpoints
 * 
 * Created: 2025-10-23 22:21:45 UTC
 * By: aivo-ai
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ListParams {
  page?: number;
  page_size?: number;
  status?: string;
  state?: string;
  search?: string;
}

interface CreateDistrictData {
  district_name: string;
  district_code: string;
  state: string;
  city?: string;
  postal_codes?: string[];
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone?: string;
  billing_contact_name?: string;
  billing_contact_email?: string;
  billing_contact_phone?: string;
  contract_start_date: string;
  contract_end_date: string;
  total_seats_purchased: number;
  price_per_seat?: number;
  auto_renewal: boolean;
  allow_teacher_self_registration: boolean;
  notes?: string;
}

interface ProvisionLicensesData {
  quantity: number;
  seats_per_license: number;
  pool_name?: string;
  vault_entry_id?: string;
}

interface CreateVaultEntryData {
  license_type: string;
  quantity: number;
  valid_from: string;
  valid_until: string;
  created_reason: string;
  cost_per_license?: number;
  notes?: string;
}

interface CreateSchoolData {
  school_name: string;
  school_code: string;
  city?: string;
  postal_codes?: string[];
  principal_name?: string;
  principal_email?: string;
  principal_phone?: string;
}

class AdminLicenseApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1/admin/licenses`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token interceptor
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ===========================
  // Vault Endpoints
  // ===========================

  async createVaultEntry(data: CreateVaultEntryData) {
    return this.client.post('/vault', data);
  }

  async listVaultEntries(params?: ListParams) {
    return this.client.get('/vault', { params });
  }

  async getVaultSummary() {
    return this.client.get('/vault/summary');
  }

  // ===========================
  // District Endpoints
  // ===========================

  async createDistrict(data: CreateDistrictData) {
    return this.client.post('/districts', data);
  }

  async listDistricts(params?: ListParams) {
    return this.client.get('/districts', { params });
  }

  async getDistrictDetails(districtId: string) {
    return this.client.get(`/districts/${districtId}`);
  }

  async updateDistrict(districtId: string, data: Partial<CreateDistrictData>) {
    return this.client.put(`/districts/${districtId}`, data);
  }

  // ===========================
  // Provisioning Endpoints
  // ===========================

  async provisionLicenses(districtId: string, data: ProvisionLicensesData) {
    return this.client.post(`/districts/${districtId}/provision`, data);
  }

  async getDistrictLicenses(districtId: string, params?: ListParams) {
    return this.client.get(`/districts/${districtId}/licenses`, { params });
  }

  async getDistrictPools(districtId: string, params?: ListParams) {
    return this.client.get(`/districts/${districtId}/pools`, { params });
  }

  // ===========================
  // School Endpoints
  // ===========================

  async createSchool(districtId: string, data: CreateSchoolData) {
    return this.client.post(`/districts/${districtId}/schools`, data);
  }

  async listSchools(districtId: string, params?: ListParams) {
    return this.client.get(`/districts/${districtId}/schools`, { params });
  }

  async getSchoolDetails(districtId: string, schoolId: string) {
    return this.client.get(`/districts/${districtId}/schools/${schoolId}`);
  }

  // ===========================
  // Analytics Endpoints
  // ===========================

  async getAnalyticsOverview() {
    return this.client.get('/analytics/overview');
  }

  async getAnalyticsSummary() {
    return this.client.get('/analytics/summary');
  }

  async getDistrictStats(districtId: string) {
    return this.client.get(`/analytics/districts/${districtId}/stats`);
  }

  async getUsageBySchool(districtId: string) {
    return this.client.get(`/analytics/districts/${districtId}/usage-by-school`);
  }

  async getActivationTimeline(districtId: string) {
    return this.client.get(`/analytics/districts/${districtId}/activation-timeline`);
  }

  // ===========================
  // License Pool Endpoints
  // ===========================

  async listLicensePools(districtId: string, params?: ListParams) {
    return this.client.get(`/districts/${districtId}/pools`, { params });
  }
}

export const adminLicenseApi = new AdminLicenseApiClient();
