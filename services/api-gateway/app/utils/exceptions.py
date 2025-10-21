"""
Custom exceptions for AIVO API
"""
from typing import Optional, Any
from fastapi import status


class AIVOException(Exception):
    """Base exception for all AIVO errors"""
    
    def __init__(
        self,
        message: str,
        code: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Any] = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)


class AuthenticationError(AIVOException):
    """Authentication failed"""
    
    def __init__(self, message: str = "Authentication failed", details=None):
        super().__init__(
            message=message,
            code="AUTHENTICATION_ERROR",
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details
        )


class AuthorizationError(AIVOException):
    """User not authorized to perform action"""
    
    def __init__(
        self,
        message: str = "Not authorized to perform this action",
        details=None
    ):
        super().__init__(
            message=message,
            code="AUTHORIZATION_ERROR",
            status_code=status.HTTP_403_FORBIDDEN,
            details=details
        )


class NotFoundError(AIVOException):
    """Resource not found"""
    
    def __init__(self, resource: str, identifier: str, details=None):
        message = f"{resource} with id '{identifier}' not found"
        super().__init__(
            message=message,
            code="NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details=details
        )


class ValidationError(AIVOException):
    """Validation failed"""
    
    def __init__(self, message: str, details=None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )


class ConflictError(AIVOException):
    """Resource already exists"""
    
    def __init__(self, message: str, details=None):
        super().__init__(
            message=message,
            code="CONFLICT",
            status_code=status.HTTP_409_CONFLICT,
            details=details
        )


class RateLimitError(AIVOException):
    """Rate limit exceeded"""
    
    def __init__(self, message: str = "Rate limit exceeded", details=None):
        super().__init__(
            message=message,
            code="RATE_LIMIT_EXCEEDED",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details=details
        )


class ExternalServiceError(AIVOException):
    """External service error"""
    
    def __init__(
        self,
        service: str,
        message: str = "External service error",
        details=None
    ):
        super().__init__(
            message=f"{service}: {message}",
            code="EXTERNAL_SERVICE_ERROR",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details
        )


class FileUploadError(AIVOException):
    """File upload failed"""
    
    def __init__(self, message: str, details=None):
        super().__init__(
            message=message,
            code="FILE_UPLOAD_ERROR",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )


class OCRError(AIVOException):
    """OCR processing failed"""
    
    def __init__(self, message: str = "OCR processing failed", details=None):
        super().__init__(
            message=message,
            code="OCR_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details
        )


class AIServiceError(AIVOException):
    """AI service error"""
    
    def __init__(self, message: str = "AI service error", details=None):
        super().__init__(
            message=message,
            code="AI_SERVICE_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details
        )
