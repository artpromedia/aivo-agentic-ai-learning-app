"""
Authentication endpoints for user registration, login, and management.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    validate_password_strength,
    verify_password,
)
from app.models.user import (
    License,
    LicenseAssignment,
    RefreshToken,
    Role,
    User,
)
from app.services.email_service import EmailService

router = APIRouter(prefix="/auth", tags=["Authentication"])
email_service = EmailService()


@router.post(
    "/register",
    response_model=dict,
    status_code=status.HTTP_201_CREATED
)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user account.

    Creates a new user with the provided credentials and returns JWT tokens.

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        dict: User data and authentication tokens

    Raises:
        HTTPException 400: If email already exists or password is weak

    Request Body:
        - **email**: Valid email address (must be unique)
        - **password**: Password (min 8 chars, uppercase, lowercase, number)
        - **full_name**: User's full name
        - **role**: User role (default: learner)

    Response:
        - **user**: User profile data
        - **tokens**: JWT access token and refresh token
    """
    # Check if email already exists
    existing_user = db.query(User).filter(
        User.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate password strength
    is_valid, error_msg = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)

    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role,
        is_active=True,
        is_verified=False  # Requires email verification
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create tokens
    access_token = create_access_token(subject=new_user.id)
    new_refresh_token = create_refresh_token(subject=new_user.id)

    return success_response(
        data={
            "user": UserResponse.model_validate(new_user).model_dump(),
            "tokens": {
                "access_token": access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            },
            "message": "User registered successfully"
        }
    )


@router.post("/login", response_model=dict)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login with email and password.

    Authenticates user credentials and returns JWT tokens.

    Args:
        credentials: Login credentials (email and password)
        db: Database session

    Returns:
        dict: User data and authentication tokens

    Raises:
        HTTPException 401: If credentials are invalid
        HTTPException 403: If user account is inactive

    Request Body:
        - **email**: User's email address
        - **password**: User's password

    Response:
        - **user**: User profile data
        - **tokens**: JWT access token and refresh token
    """
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(
        credentials.password,
        str(user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create tokens
    access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)

    return success_response(
        data={
            "user": UserResponse.model_validate(user).model_dump(),
            "tokens": {
                "access_token": access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            },
            "message": "Login successful"
        }
    )


@router.post("/refresh", response_model=dict)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.

    Generates new access and refresh tokens using a valid refresh token.

    Args:
        request: Refresh token request
        db: Database session

    Returns:
        dict: New access token and refresh token

    Raises:
        HTTPException 401: If refresh token is invalid or expired

    Request Body:
        - **refresh_token**: Valid refresh token from login/register

    Response:
        - **access_token**: New JWT access token
        - **refresh_token**: New JWT refresh token
        - **token_type**: "bearer"
        - **expires_in**: Token expiration in seconds
    """
    try:
        payload = decode_token(request.refresh_token)

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )

        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()

        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        # Create new tokens
        access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)

        return success_response(
            data={
                "access_token": access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "message": "Token refreshed successfully"
            }
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        ) from exc


@router.get("/me", response_model=dict)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information.

    Returns the profile data of the currently authenticated user.

    Args:
        current_user: Current authenticated user (from JWT token)

    Returns:
        dict: User profile data

    Headers:
        - **Authorization**: Bearer {access_token}

    Response:
        User profile including:
        - id, email, full_name, role
        - is_active, is_verified
        - created_at, updated_at
    """
    return success_response(
        data=UserResponse.model_validate(current_user).model_dump()
    )


@router.post("/logout", response_model=dict)
async def logout(
    # pylint: disable=unused-argument
    current_user: User = Depends(get_current_user)
):
    """
    Logout current user.

    Note: With JWT, logout is handled client-side by deleting the token.
    This endpoint is for consistency and future token blacklisting.

    Args:
        current_user: Current authenticated user

    Returns:
        dict: Success message

    Headers:
        - **Authorization**: Bearer {access_token}

    Future Enhancement:
        In production, this would:
        1. Add token to a blacklist in Redis
        2. Set expiration to match token expiration
        3. Check blacklist in get_current_user dependency
    """
    # In a production system with Redis, you would:
    # redis_client.setex(
    #     f"blacklist:{token}",
    #     timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    #     "1"
    # )

    return success_response(
        data={"message": "Successfully logged out"}
    )


@router.post("/change-password", response_model=dict)
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change user password.

    Updates the password for the currently authenticated user.

    Args:
        old_password: Current password
        new_password: New password
        current_user: Current authenticated user
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException 400: If old password is incorrect or new password is weak

    Headers:
        - **Authorization**: Bearer {access_token}

    Request Body:
        - **old_password**: Current password (for verification)
        - **new_password**: New password (must meet strength requirements)
    """
    # Verify old password
    if not verify_password(old_password, str(current_user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )

    # Validate new password
    is_valid, error_msg = validate_password_strength(new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )

    # Check if new password is different from old
    if old_password == new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )

    # Update password
    hashed_pwd = get_password_hash(new_password)
    current_user.hashed_password = hashed_pwd  # type: ignore
    db.commit()

    return success_response(
        data={"message": "Password changed successfully"}
    )


@router.post("/forgot-password", response_model=dict)
async def forgot_password(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Request password reset email.

    Sends password reset link to user's email if account exists.
    Always returns success to prevent email enumeration attacks.

    Args:
        email: User's email address
        db: Database session

    Returns:
        dict: Generic success message

    Request Body:
        - **email**: User's registered email address

    Response:
        Generic success message (same whether email exists or not)

    Security:
        - No indication whether email exists (prevents enumeration)
        - Rate limiting recommended in production
        - Token valid for 1 hour only
    """
    user = db.query(User).filter(User.email == email).first()

    # Always return success to prevent email enumeration
    if user:
        # Generate password reset token (1 hour expiration)
        _reset_token = create_access_token(  # noqa: F841
            subject=user.id,
            expires_delta=timedelta(hours=1)
        )

        # TODO: Send email with reset link  # pylint: disable=fixme
        # In production, integrate with email service:
        # reset_link = (
        #     f"{settings.FRONTEND_URL}/reset-password"
        #     f"?token={_reset_token}"
        # )
        # send_password_reset_email(
        #     user.email,
        #     user.full_name,
        #     reset_link
        # )

        # For development, you could log the token
        # print(f"Password reset token for {email}: {_reset_token}")

    return success_response(
        data={
            "message": (
                "If the email exists, a password reset link has been sent. "
                "Please check your inbox."
            )
        }
    )


@router.post("/reset-password", response_model=dict)
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """
    Reset password using reset token.

    Resets user password using the token received via email.

    Args:
        token: Password reset token from email
        new_password: New password to set
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException 400: If token is invalid or password is weak

    Request Body:
        - **token**: Password reset token from email link
        - **new_password**: New password (must meet strength requirements)

    Security:
        - Token valid for 1 hour only
        - Single-use recommended (implement token invalidation)
        - Password strength validation applied
    """
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )

        # Validate new password
        is_valid, error_msg = validate_password_strength(new_password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

        # Update password
        hashed_pw = get_password_hash(new_password)
        user.hashed_password = hashed_pw  # type: ignore
        db.commit()

        return success_response(
            data={"message": "Password reset successfully. You can now login."}
        )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        ) from exc


@router.post("/verify-email", response_model=dict)
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verify user email using verification token.

    Marks user's email as verified using the token sent during registration.

    Args:
        token: Email verification token
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException 400: If token is invalid or already verified

    Request Body:
        - **token**: Email verification token from registration email

    Response:
        Success message confirming email verification
    """
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token"
            )

        if user.is_verified:
            return success_response(
                data={"message": "Email already verified"}
            )

        # Mark email as verified
        user.is_verified = True  # type: ignore
        db.commit()

        return success_response(
            data={"message": "Email verified successfully"}
        )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        ) from exc


@router.post("/resend-verification", response_model=dict)
# pylint: disable=unused-argument
async def resend_verification_email(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resend email verification link.

    Sends a new verification email to the current user.

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException 400: If email is already verified

    Headers:
        - **Authorization**: Bearer {access_token}

    Response:
        Success message confirming verification email sent
    """
    if current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )

    # Generate verification token
    _verification_token = create_access_token(  # noqa: F841
        subject=current_user.id,
        expires_delta=timedelta(days=7)
    )

    # TODO: Send verification email  # pylint: disable=fixme
    # In production:
    # verify_link = (
    #     f"{settings.FRONTEND_URL}/verify-email"
    #     f"?token={_verification_token}"
    # )
    # send_verification_email(
    #     current_user.email,
    #     current_user.full_name,
    #     verify_link
    # )

    return success_response(
        data={
            "message": "Verification email sent. Please check your inbox."
        }
    )
