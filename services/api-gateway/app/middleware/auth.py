"""
Authentication middleware for protecting routes.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.lib.db import db
from app.types.auth import Role, SessionData

logger = logging.getLogger(__name__)

security = HTTPBearer()


class AuthMiddleware:
    """Authentication middleware using JWT tokens."""

    def __init__(self):
        """Initialize auth middleware."""
        self.secret_key = settings.JWT_SECRET
        self.algorithm = "HS256"
        self.access_token_expire = timedelta(hours=24)
        self.refresh_token_expire = timedelta(days=30)

    def create_access_token(
        self,
        user_id: str,
        role: Role,
        permissions: list[str],
        email: Optional[str] = None,
        phone: Optional[str] = None,
        two_factor_enabled: bool = False,
        two_factor_verified: bool = False,
    ) -> str:
        """Create JWT access token.

        Args:
            user_id: User ID
            role: User role
            permissions: List of permission slugs
            email: User email
            phone: User phone
            two_factor_enabled: Whether 2FA is enabled
            two_factor_verified: Whether 2FA has been verified this session

        Returns:
            JWT token string
        """
        now = datetime.utcnow()
        exp = now + self.access_token_expire

        payload = {
            "sub": user_id,
            "role": role.value,
            "permissions": permissions,
            "email": email,
            "phone": phone,
            "2fa_enabled": two_factor_enabled,
            "2fa_verified": two_factor_verified,
            "iat": now.timestamp(),
            "exp": exp.timestamp(),
        }

        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        return token

    def create_refresh_token(self, user_id: str) -> str:
        """Create JWT refresh token.

        Args:
            user_id: User ID

        Returns:
            JWT refresh token string
        """
        now = datetime.utcnow()
        exp = now + self.refresh_token_expire

        payload = {
            "sub": user_id,
            "type": "refresh",
            "iat": now.timestamp(),
            "exp": exp.timestamp(),
        }

        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        return token

    def verify_token(self, token: str) -> SessionData:
        """Verify JWT token and extract session data.

        Args:
            token: JWT token string

        Returns:
            SessionData extracted from token

        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            # Add 10 second leeway for clock skew
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm], leeway=10)

            # Check expiration
            exp = datetime.fromtimestamp(payload["exp"])
            if exp < datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired"
                )

            # Create session data
            session = SessionData(
                user_id=payload["sub"],
                role=Role(payload["role"]),
                permissions=payload["permissions"],
                email=payload.get("email"),
                phone=payload.get("phone"),
                two_factor_enabled=payload.get("2fa_enabled", False),
                two_factor_verified=payload.get("2fa_verified", False),
                created_at=datetime.fromtimestamp(payload["iat"]).isoformat(),
            )

            return session

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token"
            )

    async def get_current_user(
        self, credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> SessionData:
        """FastAPI dependency to get current user from token.

        Args:
            credentials: HTTP Bearer token from request

        Returns:
            SessionData for the authenticated user
        """
        token = credentials.credentials
        session = self.verify_token(token)

        # Check if user is still active
        user_row = await db.fetchrow("SELECT is_active FROM users WHERE id = $1", session.user_id)

        if not user_row or not user_row["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive"
            )

        # Check 2FA requirement
        if session.two_factor_enabled and not session.two_factor_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Two-factor authentication required"
            )

        return session

    async def require_role(
        self,
        required_roles: list[Role],
        session: SessionData = Depends(lambda s=None: s.get_current_user()),
    ) -> SessionData:
        """Require user to have one of the specified roles.

        Args:
            required_roles: List of acceptable roles
            session: Current user session

        Returns:
            SessionData if user has required role

        Raises:
            HTTPException: If user doesn't have required role
        """
        if session.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of the following roles: {', '.join([r.value for r in required_roles])}",  # noqa: E501
            )

        return session


# Global auth middleware instance
auth_middleware = AuthMiddleware()


# Convenience functions for FastAPI dependencies
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> SessionData:
    """Get current authenticated user."""
    return await auth_middleware.get_current_user(credentials)


async def get_current_super_admin(session: SessionData = Depends(get_current_user)) -> SessionData:
    """Require super admin role."""
    if session.role != Role.SUPER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires super admin privileges",
        )
    return session


async def get_current_admin(session: SessionData = Depends(get_current_user)) -> SessionData:
    """Require any admin role (super, district, or custom admin roles)."""
    admin_roles = [
        Role.SUPER,
        Role.DISTRICT,
        Role.TECH_SUPPORT,
        Role.LEGAL,
        Role.FINOPS,
        Role.OPERATIONS,
        Role.COMPLIANCE,
        Role.CUSTOMER_SUCCESS,
        Role.CONTENT_MANAGER,
        Role.DATA_ANALYST,
    ]

    if session.role not in admin_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="This action requires admin privileges"
        )
    return session
