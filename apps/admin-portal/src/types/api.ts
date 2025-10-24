/**
 * API Type Definitions
 * 
 * TypeScript interfaces for API responses
 * 
 * Created: 2025-10-23 22:35 UTC
 * By: aivo-ai
 */

export interface ProvisionResult {
  pool_code: string;
  pool_name: string | null;
  valid_from: string;
  valid_until: string;
  license_codes: string[];
  total_seats: number;
}
