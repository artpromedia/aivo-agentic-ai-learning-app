"""
Validation utilities
"""
import re
from typing import Optional


def validate_email(email: str) -> tuple[bool, Optional[str]]:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False, "Invalid email format"
    return True, None


def validate_phone(phone: str) -> tuple[bool, Optional[str]]:
    """Validate phone number (US format)"""
    # Remove common separators
    cleaned = re.sub(r'[\s\-\(\)]', '', phone)
    
    # Check if it's 10 or 11 digits (with optional country code)
    if not re.match(r'^(\+?1)?[0-9]{10}$', cleaned):
        return False, "Invalid phone number format"
    return True, None


def validate_file_extension(filename: str, allowed: list[str]) -> bool:
    """Check if file extension is allowed"""
    extension = filename.rsplit('.', 1)[-1].lower()
    return extension in allowed


def validate_file_size(size: int, max_size: int) -> tuple[bool, Optional[str]]:
    """Check if file size is within limit"""
    if size > max_size:
        max_mb = max_size / 1048576
        return False, f"File size exceeds maximum of {max_mb}MB"
    return True, None


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal"""
    # Remove path separators and keep only filename
    filename = filename.replace('\\', '').replace('/', '')
    # Remove potentially dangerous characters
    filename = re.sub(r'[^\w\s\-\.]', '', filename)
    return filename


def validate_uuid(uuid_str: str) -> bool:
    """Validate UUID format"""
    pattern = (
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    )
    return bool(re.match(pattern, uuid_str.lower()))
