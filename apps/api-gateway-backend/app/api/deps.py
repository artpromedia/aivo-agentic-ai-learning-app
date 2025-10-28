"""API dependency functions for authentication and authorization."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer token credentials
        db: Database session
        
    Returns:
        User: Current authenticated user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )
            
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        ) from exc
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current active user
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def require_role(*allowed_roles: UserRole):
    """
    Dependency factory to require specific user roles.
    
    Args:
        *allowed_roles: One or more UserRole values that are allowed
        
    Returns:
        Callable: Dependency function that checks user role
        
    Usage:
        @router.get("/admin")
        def admin_endpoint(
            user: User = Depends(require_role(UserRole.GLOBAL_ADMIN))
        ):
            pass
            
        @router.get("/parent-or-teacher")
        def restricted_endpoint(
            user: User = Depends(
                require_role(UserRole.PARENT, UserRole.TEACHER)
            )
        ):
            pass
    """
    async def role_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if current_user.role not in allowed_roles:
            role_names = ', '.join([r.value for r in allowed_roles])
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Access denied. Required roles: {role_names}. "
                    f"Your role: {current_user.role.value}"
                )
            )
        return current_user
    
    return role_checker


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if authenticated, None otherwise.
    Useful for endpoints that work with or without authentication.
    
    Args:
        credentials: Optional HTTP Bearer token credentials
        db: Database session
        
    Returns:
        Optional[User]: Current user if authenticated, None otherwise
        
    Example:
        @router.get("/public-or-private")
        def flexible_endpoint(
            user: Optional[User] = Depends(get_optional_user)
        ):
            if user:
                # Return personalized content
                pass
            else:
                # Return public content
                pass
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = decode_token(token)
        user_id = payload.get("sub")
        
        if user_id is None:
            return None
        
        user = db.query(User).filter(User.id == user_id).first()
        
        if user and user.is_active:
            return user
            
    except Exception:  # noqa: S110
        pass
    
    return None


async def get_current_verified_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user with verified email.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current verified user
        
    Raises:
        HTTPException: If user email is not verified
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required"
        )
    return current_user


def require_admin():
    """
    Dependency to require admin role (global admin or district admin).
    
    Returns:
        Callable: Dependency function that checks for admin role
        
    Usage:
        @router.delete("/users/{user_id}")
        def delete_user(
            user_id: str,
            admin: User = Depends(require_admin())
        ):
            pass
    """
    return require_role(UserRole.GLOBAL_ADMIN, UserRole.DISTRICT_ADMIN)


def require_educator():
    """
    Dependency to require educator role.
    
    Allows: teacher, district admin, or global admin.
    
    Returns:
        Callable: Dependency function that checks for educator role
        
    Usage:
        @router.post("/lessons")
        def create_lesson(
            educator: User = Depends(require_educator())
        ):
            pass
    """
    return require_role(
        UserRole.TEACHER,
        UserRole.DISTRICT_ADMIN,
        UserRole.GLOBAL_ADMIN
    )
