"""
Utilities module
"""
from app.utils.exceptions import (
    AIVOException,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ValidationError,
    ConflictError,
    RateLimitError,
    ExternalServiceError,
    FileUploadError,
    OCRError,
    AIServiceError,
)
from app.utils.pagination import PaginationParams, PaginatedResponse
from app.utils.validators import (
    validate_email,
    validate_phone,
    validate_file_extension,
    validate_file_size,
    sanitize_filename,
    validate_uuid,
)
from app.utils.formatters import (
    format_datetime,
    format_bytes,
    format_duration,
    truncate_string,
    format_error_message,
)

__all__ = [
    # Exceptions
    "AIVOException",
    "AuthenticationError",
    "AuthorizationError",
    "NotFoundError",
    "ValidationError",
    "ConflictError",
    "RateLimitError",
    "ExternalServiceError",
    "FileUploadError",
    "OCRError",
    "AIServiceError",
    # Pagination
    "PaginationParams",
    "PaginatedResponse",
    # Validators
    "validate_email",
    "validate_phone",
    "validate_file_extension",
    "validate_file_size",
    "sanitize_filename",
    "validate_uuid",
    # Formatters
    "format_datetime",
    "format_bytes",
    "format_duration",
    "truncate_string",
    "format_error_message",
]
