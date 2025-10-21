// Common Utility Types

// Data Point for tracking measurements over time
export interface DataPoint {
  date: Date;
  value: number;
  notes?: string;
}

// Timestamps for all entities
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

// Soft delete support
export interface SoftDelete extends Timestamps {
  deletedAt?: Date;
  isDeleted: boolean;
}

// Pagination utilities
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage?: number;
  prevPage?: number;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CursorPaginationMetadata {
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  limit: number;
}

// Generic response wrappers
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

// ID types
export type UUID = string;
export type DateString = string;
export type ISODateString = string;

// File/Media types
export interface FileMetadata {
  filename: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// Address type (used across multiple entities)
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Sorting and filtering
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface SearchParams {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
}

// Date range filtering
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface DateRangeString {
  startDate: string;
  endDate: string;
}

export interface DateRangeParams {
  startDate?: Date | string;
  endDate?: Date | string;
}

// Generic result types
export interface Success<T = void> {
  success: true;
  data: T;
}

export interface Failure {
  success: false;
  error: string;
  details?: any;
}

export type Result<T = void> = Success<T> | Failure;

// Enum-like utility types
export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type Visibility = 'public' | 'private' | 'restricted';

// Metadata tracking
export interface AuditMetadata {
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

// Feature flags
export interface FeatureFlags {
  [featureName: string]: boolean;
}

// Configuration
export interface Config {
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'date';
  description?: string;
}
