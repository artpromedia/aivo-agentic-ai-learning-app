# Backend API Endpoints Implementation Summary

## ✅ Status: Security Utilities Complete

The security utilities in `app/core/security.py` already exist with:
- Password hashing (bcrypt)
- JWT token generation/verification
- Password strength validation

## 📝 Authentication Endpoints - Implementation Guide

Create `services/api-gateway/app/api/v1/auth.py` with the following endpoints:

### 1. POST /auth/register/parent
- Validate password strength
- Check email doesn't exist
- Create user with role="parent", onboarding_status="profile_complete"
- Send verification email
- Return user_id and email

### 2. POST /auth/register/teacher
- Validate password strength
- Validate license_key exists and has available seats
- Check email doesn't exist
- Create user with role="teacher", link to license
- Send verification email
- Return user_id, email, and license_info

### 3. POST /auth/login
- Find user by email
- Verify password with bcrypt
- Check user.is_active
- Generate access_token and refresh_token
- Update user.last_login
- Return LoginResponse with redirect_url based on role:
  - parent (profile_complete) → `/onboarding/add-child`
  - parent (child_added) → `https://parent.aivoai.com/dashboard`
  - teacher (profile_complete) → `/onboarding/assign-license`
  - teacher (license_assigned) → `https://teacher.aivoai.com/dashboard`
  - admin → `https://admin.aivoai.com/dashboard`

### 4. POST /auth/logout
- Revoke refresh_token (if provided)
- Return success message

### 5. POST /auth/refresh
- Verify refresh_token
- Check not revoked
- Generate new access_token
- Return new token

### 6. GET /auth/me
- Extract token from Authorization header
- Decode token to get user_id
- Return user profile (id, email, full_name, role, onboarding_status)

### 7. POST /auth/parent/add-child
- Verify parent is authenticated
- Create Learner record with provided data
- Update parent onboarding_status to "child_added"
- Send welcome email
- Return learner_id and redirect_url

### 8. POST /auth/teacher/assign-license
- Verify teacher is authenticated
- Validate license has available seats
- Create Learner record
- Create LicenseAssignment record
- Update teacher onboarding_status to "license_assigned" (if first)
- Return learner_id, seats_remaining, redirect_url

### 9. POST /auth/verify-email/{token}
- Decode verification token
- Find user by ID
- Set user.is_verified = True
- Return success message

### 10. POST /auth/request-password-reset
- Find user by email
- Generate password reset token
- Send reset email (TODO)
- Return generic success message

### 11. POST /auth/reset-password
- Validate new password strength
- Decode reset token
- Find user by ID
- Update user.hashed_password
- Return success message

## 🔧 Request/Response Models Needed

```python
class RegisterParentRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str]

class RegisterTeacherRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    license_key: str
    phone: Optional[str]
    district_name: Optional[str]

class AddChildRequest(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: str
    grade_level: int
    school_name: str
    district_name: str
    state_code: str
    has_iep: bool
    diagnoses: Optional[list[str]]
    accommodations: Optional[list[str]]

class AssignLicenseRequest(BaseModel):
    license_key: str
    first_name: str
    last_name: str
    date_of_birth: str
    grade_level: int
    parent_email: Optional[EmailStr]
    has_iep: bool
    diagnoses: Optional[list[str]]
    accommodations: Optional[list[str]]

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    role: str
    redirect_url: str
```

## 📋 Dependencies Already Available

- ✅ `app.core.security` - Password hashing, JWT tokens, validation
- ✅ `app.core.database` - Database session
- ✅ `app.models.user` - User, License, LicenseAssignment models
- ✅ `app.models.learner` - Learner model
- ✅ `app.services.email_service` - Email sending with templates

## ✅ What's Already Complete

1. Database schema with all required tables
2. Security utilities (JWT, bcrypt, validation)
3. Email service with verification & welcome templates
4. Frontend forms (7 components)
5. API client with 11 methods

## 📝 What's Needed

1. Create the auth.py file with 11 endpoints
2. Test with demo accounts:
   - demo.parent@aivoai.com (DemoParent123!)
   - demo.teacher@aivoai.com (DemoTeacher123!)
   - demo.admin@aivoai.com (DemoAdmin123!)

## 🚀 Next Steps

1. Copy the code from `PROMPT_63_AUTH_ENDPOINTS.txt` (attached)
2. Create `services/api-gateway/app/api/v1/auth.py`
3. The router is already registered in `app/api/v1/__init__.py`
4. Start the API Gateway
5. Test the endpoints with the demo accounts
