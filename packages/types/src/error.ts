// Error Types and Codes

export type ErrorCode =
  // Authentication Errors (1000-1099)
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_TOKEN_INVALID'
  | 'AUTH_TOKEN_MISSING'
  | 'AUTH_REFRESH_TOKEN_INVALID'
  | 'AUTH_EMAIL_NOT_VERIFIED'
  | 'AUTH_ACCOUNT_LOCKED'
  | 'AUTH_ACCOUNT_DISABLED'
  | 'AUTH_PASSWORD_RESET_REQUIRED'
  | 'AUTH_MFA_REQUIRED'
  
  // Authorization Errors (1100-1199)
  | 'AUTHZ_INSUFFICIENT_PERMISSIONS'
  | 'AUTHZ_ACCESS_DENIED'
  | 'AUTHZ_RESOURCE_FORBIDDEN'
  | 'AUTHZ_ROLE_REQUIRED'
  | 'AUTHZ_OWNERSHIP_REQUIRED'
  
  // Validation Errors (1200-1299)
  | 'VALIDATION_FAILED'
  | 'VALIDATION_REQUIRED_FIELD'
  | 'VALIDATION_INVALID_EMAIL'
  | 'VALIDATION_INVALID_PHONE'
  | 'VALIDATION_INVALID_DATE'
  | 'VALIDATION_INVALID_FORMAT'
  | 'VALIDATION_MIN_LENGTH'
  | 'VALIDATION_MAX_LENGTH'
  | 'VALIDATION_OUT_OF_RANGE'
  | 'VALIDATION_INVALID_ENUM'
  | 'VALIDATION_PASSWORD_WEAK'
  | 'VALIDATION_DUPLICATE_VALUE'
  
  // Resource Errors (1300-1399)
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_ALREADY_EXISTS'
  | 'RESOURCE_CONFLICT'
  | 'RESOURCE_DELETED'
  | 'RESOURCE_EXPIRED'
  
  // User Errors (1400-1499)
  | 'USER_NOT_FOUND'
  | 'USER_ALREADY_EXISTS'
  | 'USER_EMAIL_TAKEN'
  | 'USER_INACTIVE'
  
  // Learner Errors (1500-1599)
  | 'LEARNER_NOT_FOUND'
  | 'LEARNER_ACCESS_DENIED'
  | 'LEARNER_PIN_INCORRECT'
  | 'LEARNER_MODEL_NOT_READY'
  
  // IEP Errors (1600-1699)
  | 'IEP_NOT_FOUND'
  | 'IEP_ACCESS_DENIED'
  | 'IEP_EXPIRED'
  | 'IEP_REVIEW_OVERDUE'
  | 'IEP_GOAL_NOT_FOUND'
  | 'IEP_INVALID_STATUS_TRANSITION'
  
  // Activity Errors (1700-1799)
  | 'ACTIVITY_NOT_FOUND'
  | 'ACTIVITY_NOT_ASSIGNED'
  | 'ACTIVITY_ALREADY_COMPLETED'
  | 'ACTIVITY_EXPIRED'
  | 'ACTIVITY_INVALID_RESPONSE'
  
  // Assessment Errors (1800-1899)
  | 'ASSESSMENT_NOT_FOUND'
  | 'ASSESSMENT_ALREADY_COMPLETED'
  | 'ASSESSMENT_NOT_SCHEDULED'
  | 'ASSESSMENT_INVALID_DATA'
  
  // Content Errors (1900-1999)
  | 'CONTENT_NOT_FOUND'
  | 'CONTENT_NOT_AVAILABLE'
  | 'CONTENT_UPLOAD_FAILED'
  | 'CONTENT_INVALID_TYPE'
  
  // AI Model Errors (2000-2099)
  | 'MODEL_NOT_FOUND'
  | 'MODEL_NOT_TRAINED'
  | 'MODEL_TRAINING_FAILED'
  | 'MODEL_PREDICTION_FAILED'
  
  // Subscription Errors (2100-2199)
  | 'SUBSCRIPTION_NOT_FOUND'
  | 'SUBSCRIPTION_EXPIRED'
  | 'SUBSCRIPTION_PAST_DUE'
  | 'SUBSCRIPTION_LIMIT_REACHED'
  | 'SUBSCRIPTION_PAYMENT_FAILED'
  
  // Payment Errors (2200-2299)
  | 'PAYMENT_FAILED'
  | 'PAYMENT_DECLINED'
  | 'PAYMENT_METHOD_INVALID'
  | 'PAYMENT_INSUFFICIENT_FUNDS'
  
  // Rate Limit Errors (2300-2399)
  | 'RATE_LIMIT_EXCEEDED'
  | 'RATE_LIMIT_QUOTA_EXCEEDED'
  
  // Server Errors (5000-5099)
  | 'INTERNAL_SERVER_ERROR'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT_ERROR'
  
  // Unknown/Generic
  | 'UNKNOWN_ERROR';

// Error Interfaces
export interface AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  isOperational: boolean;
  details?: any;
  field?: string;
  timestamp: Date;
}

export interface ValidationError extends AppError {
  code: 'VALIDATION_FAILED';
  errors: ValidationFieldError[];
}

export interface ValidationFieldError {
  field: string;
  message: string;
  value?: any;
  constraint?: string;
}

export interface AuthenticationError extends AppError {
  code: ErrorCode;
  statusCode: 401;
  remainingAttempts?: number;
  lockoutEndTime?: Date;
}

export interface AuthorizationError extends AppError {
  code: ErrorCode;
  statusCode: 403;
  requiredPermissions?: string[];
  userPermissions?: string[];
}

export interface NotFoundError extends AppError {
  code: ErrorCode;
  statusCode: 404;
  resourceType?: string;
  resourceId?: string;
}

export interface ConflictError extends AppError {
  code: ErrorCode;
  statusCode: 409;
  conflictingField?: string;
  conflictingValue?: any;
}

export interface RateLimitError extends AppError {
  code: ErrorCode;
  statusCode: 429;
  limit: number;
  remaining: number;
  resetTime: Date;
}

export interface InternalServerError extends AppError {
  code: ErrorCode;
  statusCode: 500;
  requestId?: string;
  trace?: string;
}

// Error Response Interface
export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    field?: string;
    details?: any;
    statusCode: number;
    timestamp: Date;
    requestId?: string;
  };
}

// HTTP Status Code Mapping
export const ErrorStatusCodes: Record<ErrorCode, number> = {
  // Authentication - 401
  AUTH_INVALID_CREDENTIALS: 401,
  AUTH_TOKEN_EXPIRED: 401,
  AUTH_TOKEN_INVALID: 401,
  AUTH_TOKEN_MISSING: 401,
  AUTH_REFRESH_TOKEN_INVALID: 401,
  AUTH_EMAIL_NOT_VERIFIED: 401,
  AUTH_ACCOUNT_LOCKED: 401,
  AUTH_ACCOUNT_DISABLED: 401,
  AUTH_PASSWORD_RESET_REQUIRED: 401,
  AUTH_MFA_REQUIRED: 401,
  
  // Authorization - 403
  AUTHZ_INSUFFICIENT_PERMISSIONS: 403,
  AUTHZ_ACCESS_DENIED: 403,
  AUTHZ_RESOURCE_FORBIDDEN: 403,
  AUTHZ_ROLE_REQUIRED: 403,
  AUTHZ_OWNERSHIP_REQUIRED: 403,
  
  // Validation - 400
  VALIDATION_FAILED: 400,
  VALIDATION_REQUIRED_FIELD: 400,
  VALIDATION_INVALID_EMAIL: 400,
  VALIDATION_INVALID_PHONE: 400,
  VALIDATION_INVALID_DATE: 400,
  VALIDATION_INVALID_FORMAT: 400,
  VALIDATION_MIN_LENGTH: 400,
  VALIDATION_MAX_LENGTH: 400,
  VALIDATION_OUT_OF_RANGE: 400,
  VALIDATION_INVALID_ENUM: 400,
  VALIDATION_PASSWORD_WEAK: 400,
  VALIDATION_DUPLICATE_VALUE: 400,
  
  // Resource - 404/409
  RESOURCE_NOT_FOUND: 404,
  RESOURCE_ALREADY_EXISTS: 409,
  RESOURCE_CONFLICT: 409,
  RESOURCE_DELETED: 410,
  RESOURCE_EXPIRED: 410,
  
  // User - 404/409
  USER_NOT_FOUND: 404,
  USER_ALREADY_EXISTS: 409,
  USER_EMAIL_TAKEN: 409,
  USER_INACTIVE: 403,
  
  // Learner - 404/403
  LEARNER_NOT_FOUND: 404,
  LEARNER_ACCESS_DENIED: 403,
  LEARNER_PIN_INCORRECT: 401,
  LEARNER_MODEL_NOT_READY: 503,
  
  // IEP - 404/403/400
  IEP_NOT_FOUND: 404,
  IEP_ACCESS_DENIED: 403,
  IEP_EXPIRED: 410,
  IEP_REVIEW_OVERDUE: 400,
  IEP_GOAL_NOT_FOUND: 404,
  IEP_INVALID_STATUS_TRANSITION: 400,
  
  // Activity - 404/400
  ACTIVITY_NOT_FOUND: 404,
  ACTIVITY_NOT_ASSIGNED: 403,
  ACTIVITY_ALREADY_COMPLETED: 409,
  ACTIVITY_EXPIRED: 410,
  ACTIVITY_INVALID_RESPONSE: 400,
  
  // Assessment - 404/400
  ASSESSMENT_NOT_FOUND: 404,
  ASSESSMENT_ALREADY_COMPLETED: 409,
  ASSESSMENT_NOT_SCHEDULED: 400,
  ASSESSMENT_INVALID_DATA: 400,
  
  // Content - 404/500
  CONTENT_NOT_FOUND: 404,
  CONTENT_NOT_AVAILABLE: 503,
  CONTENT_UPLOAD_FAILED: 500,
  CONTENT_INVALID_TYPE: 400,
  
  // AI Model - 404/500/503
  MODEL_NOT_FOUND: 404,
  MODEL_NOT_TRAINED: 503,
  MODEL_TRAINING_FAILED: 500,
  MODEL_PREDICTION_FAILED: 500,
  
  // Subscription - 404/402/403
  SUBSCRIPTION_NOT_FOUND: 404,
  SUBSCRIPTION_EXPIRED: 402,
  SUBSCRIPTION_PAST_DUE: 402,
  SUBSCRIPTION_LIMIT_REACHED: 403,
  SUBSCRIPTION_PAYMENT_FAILED: 402,
  
  // Payment - 402
  PAYMENT_FAILED: 402,
  PAYMENT_DECLINED: 402,
  PAYMENT_METHOD_INVALID: 400,
  PAYMENT_INSUFFICIENT_FUNDS: 402,
  
  // Rate Limit - 429
  RATE_LIMIT_EXCEEDED: 429,
  RATE_LIMIT_QUOTA_EXCEEDED: 429,
  
  // Server - 500/503
  INTERNAL_SERVER_ERROR: 500,
  DATABASE_ERROR: 500,
  EXTERNAL_SERVICE_ERROR: 502,
  SERVICE_UNAVAILABLE: 503,
  TIMEOUT_ERROR: 504,
  
  // Unknown - 500
  UNKNOWN_ERROR: 500,
};

// Error Messages
export const ErrorMessages: Record<ErrorCode, string> = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_TOKEN_EXPIRED: 'Your session has expired. Please log in again',
  AUTH_TOKEN_INVALID: 'Invalid authentication token',
  AUTH_TOKEN_MISSING: 'Authentication token is required',
  AUTH_REFRESH_TOKEN_INVALID: 'Invalid refresh token',
  AUTH_EMAIL_NOT_VERIFIED: 'Please verify your email address',
  AUTH_ACCOUNT_LOCKED: 'Your account has been locked due to multiple failed login attempts',
  AUTH_ACCOUNT_DISABLED: 'Your account has been disabled',
  AUTH_PASSWORD_RESET_REQUIRED: 'Password reset is required',
  AUTH_MFA_REQUIRED: 'Multi-factor authentication is required',
  
  // Authorization
  AUTHZ_INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
  AUTHZ_ACCESS_DENIED: 'Access denied',
  AUTHZ_RESOURCE_FORBIDDEN: 'You do not have access to this resource',
  AUTHZ_ROLE_REQUIRED: 'This action requires a specific role',
  AUTHZ_OWNERSHIP_REQUIRED: 'You must be the owner of this resource',
  
  // Validation
  VALIDATION_FAILED: 'Validation failed',
  VALIDATION_REQUIRED_FIELD: 'This field is required',
  VALIDATION_INVALID_EMAIL: 'Invalid email address',
  VALIDATION_INVALID_PHONE: 'Invalid phone number',
  VALIDATION_INVALID_DATE: 'Invalid date',
  VALIDATION_INVALID_FORMAT: 'Invalid format',
  VALIDATION_MIN_LENGTH: 'Value is too short',
  VALIDATION_MAX_LENGTH: 'Value is too long',
  VALIDATION_OUT_OF_RANGE: 'Value is out of valid range',
  VALIDATION_INVALID_ENUM: 'Invalid value',
  VALIDATION_PASSWORD_WEAK: 'Password does not meet security requirements',
  VALIDATION_DUPLICATE_VALUE: 'This value already exists',
  
  // Resource
  RESOURCE_NOT_FOUND: 'Resource not found',
  RESOURCE_ALREADY_EXISTS: 'Resource already exists',
  RESOURCE_CONFLICT: 'Resource conflict',
  RESOURCE_DELETED: 'Resource has been deleted',
  RESOURCE_EXPIRED: 'Resource has expired',
  
  // User
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_EMAIL_TAKEN: 'Email address is already in use',
  USER_INACTIVE: 'User account is inactive',
  
  // Learner
  LEARNER_NOT_FOUND: 'Learner not found',
  LEARNER_ACCESS_DENIED: 'Access to learner denied',
  LEARNER_PIN_INCORRECT: 'Incorrect PIN',
  LEARNER_MODEL_NOT_READY: 'AI model is not ready',
  
  // IEP
  IEP_NOT_FOUND: 'IEP not found',
  IEP_ACCESS_DENIED: 'Access to IEP denied',
  IEP_EXPIRED: 'IEP has expired',
  IEP_REVIEW_OVERDUE: 'IEP review is overdue',
  IEP_GOAL_NOT_FOUND: 'IEP goal not found',
  IEP_INVALID_STATUS_TRANSITION: 'Invalid IEP status transition',
  
  // Activity
  ACTIVITY_NOT_FOUND: 'Activity not found',
  ACTIVITY_NOT_ASSIGNED: 'Activity not assigned to this learner',
  ACTIVITY_ALREADY_COMPLETED: 'Activity has already been completed',
  ACTIVITY_EXPIRED: 'Activity has expired',
  ACTIVITY_INVALID_RESPONSE: 'Invalid activity response',
  
  // Assessment
  ASSESSMENT_NOT_FOUND: 'Assessment not found',
  ASSESSMENT_ALREADY_COMPLETED: 'Assessment has already been completed',
  ASSESSMENT_NOT_SCHEDULED: 'Assessment is not scheduled',
  ASSESSMENT_INVALID_DATA: 'Invalid assessment data',
  
  // Content
  CONTENT_NOT_FOUND: 'Content not found',
  CONTENT_NOT_AVAILABLE: 'Content is not available',
  CONTENT_UPLOAD_FAILED: 'Content upload failed',
  CONTENT_INVALID_TYPE: 'Invalid content type',
  
  // AI Model
  MODEL_NOT_FOUND: 'AI model not found',
  MODEL_NOT_TRAINED: 'AI model is not trained',
  MODEL_TRAINING_FAILED: 'AI model training failed',
  MODEL_PREDICTION_FAILED: 'AI model prediction failed',
  
  // Subscription
  SUBSCRIPTION_NOT_FOUND: 'Subscription not found',
  SUBSCRIPTION_EXPIRED: 'Subscription has expired',
  SUBSCRIPTION_PAST_DUE: 'Subscription payment is past due',
  SUBSCRIPTION_LIMIT_REACHED: 'Subscription limit reached',
  SUBSCRIPTION_PAYMENT_FAILED: 'Subscription payment failed',
  
  // Payment
  PAYMENT_FAILED: 'Payment failed',
  PAYMENT_DECLINED: 'Payment was declined',
  PAYMENT_METHOD_INVALID: 'Invalid payment method',
  PAYMENT_INSUFFICIENT_FUNDS: 'Insufficient funds',
  
  // Rate Limit
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  RATE_LIMIT_QUOTA_EXCEEDED: 'API quota exceeded',
  
  // Server
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  DATABASE_ERROR: 'A database error occurred',
  EXTERNAL_SERVICE_ERROR: 'An external service error occurred',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
  TIMEOUT_ERROR: 'Request timed out',
  
  // Unknown
  UNKNOWN_ERROR: 'An unknown error occurred',
};
