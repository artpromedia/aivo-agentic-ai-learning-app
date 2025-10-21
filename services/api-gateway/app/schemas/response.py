"""Standard API response schemas."""
from typing import TypeVar, Generic, Optional, Any, Dict
from pydantic import BaseModel, Field
import time

T = TypeVar('T')


class ErrorDetail(BaseModel):
    """Error detail structure."""
    code: str = Field(..., description="Error code")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[Any] = Field(None, description="Additional details")


class ResponseMeta(BaseModel):
    """Response metadata."""
    timestamp: float = Field(
        default_factory=time.time,
        description="Response timestamp"
    )
    path: Optional[str] = Field(None, description="Request path")
    page: Optional[int] = Field(None, description="Current page number")
    page_size: Optional[int] = Field(None, description="Items per page")
    total: Optional[int] = Field(None, description="Total items count")
    total_pages: Optional[int] = Field(None, description="Total pages")


class StandardResponse(BaseModel, Generic[T]):
    """
    Standard API response format.

    Example success response:
    {
        "success": true,
        "data": {...},
        "error": null,
        "meta": {
            "timestamp": 1698765432.123,
            "path": "/api/v1/learners"
        }
    }

    Example error response:
    {
        "success": false,
        "data": null,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "Invalid input data",
            "details": {"field": "email", "issue": "Invalid format"}
        },
        "meta": {
            "timestamp": 1698765432.123,
            "path": "/api/v1/learners"
        }
    }
    """
    success: bool = Field(..., description="Request successful")
    data: Optional[T] = Field(None, description="Response data")
    error: Optional[ErrorDetail] = Field(None, description="Error details")
    meta: ResponseMeta = Field(
        default_factory=ResponseMeta,
        description="Response metadata"
    )


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Paginated response format.

    Example:
    {
        "success": true,
        "data": {
            "items": [...],
            "pagination": {
                "page": 1,
                "page_size": 20,
                "total": 100,
                "total_pages": 5
            }
        },
        "error": null,
        "meta": {"timestamp": 1698765432.123}
    }
    """
    success: bool = True
    data: Optional[Dict[str, Any]] = None
    error: Optional[ErrorDetail] = None
    meta: ResponseMeta = Field(default_factory=ResponseMeta)


# Helper functions for creating responses
def success_response(
    data: Any,
    meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create a success response."""
    response_meta = ResponseMeta(**(meta or {}))
    return {
        "success": True,
        "data": data,
        "error": None,
        "meta": response_meta.dict()
    }


def error_response(
    code: str,
    message: str,
    details: Optional[Any] = None,
    status_code: int = 400
) -> Dict[str, Any]:
    """Create an error response."""
    return {
        "success": False,
        "data": None,
        "error": {
            "code": code,
            "message": message,
            "details": details
        },
        "meta": {
            "timestamp": time.time()
        }
    }


def paginated_response(
    items: list,
    page: int,
    page_size: int,
    total: int
) -> Dict[str, Any]:
    """Create a paginated response."""
    total_pages = (total + page_size - 1) // page_size

    return {
        "success": True,
        "data": {
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": total_pages
            }
        },
        "error": None,
        "meta": {
            "timestamp": time.time(),
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages
        }
    }
