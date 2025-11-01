"""
Simple password-based login endpoint for portals
Compatible with traditional username/password authentication
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Form, Header, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.lib.db import db
from app.lib.redis_client import redis_client
from app.middleware.auth import auth_middleware
from app.services.password_service import password_service
from app.types.auth import Role

logger = logging.getLogger(__name__)

router = APIRouter()


class LoginResponse(BaseModel):
    """Login response"""

    access_token: str
    refresh_token: str
    user_id: str
    role: str
    redirect_url: str


class UserResponse(BaseModel):
    """User details response"""

    id: str
    email: str
    full_name: str
    role: str
    user_type: str


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login with email and password",
    description="Traditional login endpoint for portal authentication",
)
async def login(
    email: EmailStr = Form(...),
    password: str = Form(...),
):
    """
    Login with email and password.

    Returns access token and user information.
    """
    logger.info("Login attempt for email: %s", email)

    try:
        # Find user by email with role and profile info
        user = await db.fetchrow(
            """
            SELECT 
                u.id,
                u.email,
                u.password_hash,
                u.is_active,
                u.email_verified as is_verified,
                r.name as role_name,
                r.slug as role_slug,
                COALESCE(
                    pp.full_name,
                    tp.full_name,
                    sap.full_name,
                    dap.full_name,
                    cap.full_name,
                    'User'
                ) as full_name
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            LEFT JOIN parent_profiles pp ON u.id = pp.user_id
            LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
            LEFT JOIN super_admin_profiles sap ON u.id = sap.user_id
            LEFT JOIN district_admin_profiles dap ON u.id = dap.user_id
            LEFT JOIN custom_admin_profiles cap ON u.id = cap.user_id
            WHERE u.email = $1
            LIMIT 1
            """,
            email,
        )

        if not user:
            logger.warning("Login failed: User not found for %s", email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Verify password
        if not await password_service.verify(password, user["password_hash"]):
            logger.warning("Login failed: Invalid password for %s", email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Check if user is active and verified
        if not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive",
            )

        if not user["is_verified"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified. Please verify your email first.",
            )

        # Generate tokens using JWT
        import uuid

        # Map role slug to Role enum
        # Handle various role formats (slug, name, with/without spaces/hyphens)
        role_value = (
            (user["role_slug"] or user["role_name"] or "user")
            .lower()
            .replace(" ", "-")
            .replace("_", "-")
        )
        role_mapping = {
            "parent": Role.PARENT,
            "teacher": Role.TEACHER,
            "district": Role.DISTRICT,  # Actual slug in database
            "district-admin": Role.DISTRICT,
            "district-administrator": Role.DISTRICT,
            "admin": Role.SUPER,
            "super-admin": Role.SUPER,
            "custom-admin": Role.SUPER,
        }
        user_role = role_mapping.get(role_value, Role.PARENT)

        logger.info(
            "Mapped role '%s' (from slug='%s', name='%s') to %s",
            role_value,
            user.get("role_slug"),
            user.get("role_name"),
            user_role,
        )

        # Create JWT tokens
        access_token = auth_middleware.create_access_token(
            user_id=str(user["id"]),
            role=user_role,
            permissions=[],
            email=user["email"],
            phone=None,
            two_factor_enabled=False,
            two_factor_verified=False,
        )
        refresh_token = auth_middleware.create_refresh_token(user_id=str(user["id"]))
        session_id = str(uuid.uuid4())

        # Store session in database (using 'token' field for access_token)
        await db.execute(
            """
            INSERT INTO sessions (
                id, user_id, token,
                expires_at, created_at, last_activity_at
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            session_id,
            user["id"],
            access_token,
            datetime.utcnow() + timedelta(hours=24),
            datetime.utcnow(),
            datetime.utcnow(),
        )

        # Store session in Redis for fast lookup
        session_data = {
            "user_id": str(user["id"]),  # Convert UUID to string
            "email": user["email"],
            "role": user["role_name"] or "user",
            "role_slug": user["role_slug"] or "user",
            "session_id": session_id,
        }
        await redis_client.set_json(
            f"session:{access_token}",
            session_data,
            expire=86400,  # 24 hours
        )

        # Determine redirect URL based on normalized role
        redirect_urls = {
            "parent": "/dashboard",
            "teacher": "/dashboard",
            "district": "/dashboard",  # Actual slug in database
            "district-admin": "/dashboard",
            "district-administrator": "/dashboard",
            "super-admin": "/admin",
            "admin": "/admin",
            "custom-admin": "/admin",
        }
        redirect_url = redirect_urls.get(role_value, "/dashboard")

        logger.info("Login successful for %s", email)

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=str(user["id"]),  # Convert UUID to string
            role=user["role_name"] or "user",
            redirect_url=redirect_url,
        )

    except HTTPException:
        raise
    except Exception as error:
        logger.error("Login error: %s", error, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login",
        )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Get authenticated user details",
)
async def get_current_user(
    authorization: str = Header(..., alias="Authorization"),
):
    """
    Get current user details from access token.

    Requires Authorization header with Bearer token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )

    access_token = authorization.replace("Bearer ", "")

    try:
        # Get session from Redis
        session_data = await redis_client.get_json(f"session:{access_token}")

        if not session_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )

        # Get full user details from database with profile joins
        user = await db.fetchrow(
            """
            SELECT 
                u.id,
                u.email,
                r.name as role_name,
                r.slug as role_slug,
                COALESCE(
                    pp.full_name,
                    tp.full_name,
                    sap.full_name,
                    dap.full_name,
                    u.email
                ) as full_name
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            LEFT JOIN parent_profiles pp ON u.id = pp.user_id
            LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
            LEFT JOIN super_admin_profiles sap ON u.id = sap.user_id
            LEFT JOIN district_admin_profiles dap ON u.id = dap.user_id
            WHERE u.id = $1
            LIMIT 1
            """,
            session_data["user_id"],
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        return UserResponse(
            id=str(user["id"]),  # Convert UUID to string
            email=user["email"],
            full_name=user["full_name"],
            role=user["role_name"] or "user",
            user_type=user["role_slug"] or "user",  # Use role_slug as user_type
        )

    except HTTPException:
        raise
    except Exception as error:
        logger.error("Get user error: %s", error, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
