# API Documentation Guide

Comprehensive guide to AIVO Learning Platform API including endpoint documentation, Postman collections, API versioning, and integration examples.

---

## 📋 Table of Contents

- [API Overview](#api-overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Postman Collections](#postman-collections)
- [API Versioning Strategy](#api-versioning-strategy)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Response Formats](#response-formats)
- [Integration Examples](#integration-examples)

---

## 🎯 API Overview

### Base URLs

```
Development:  http://localhost:8000
Staging:      https://api-staging.aivolearning.com
Production:   https://api.aivolearning.com
```

### API Version

**Current Version:** `v1`  
**Base Path:** `/api/v1`

### Interactive Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI Schema:** `http://localhost:8000/openapi.json`

### Tech Stack

- **Framework:** FastAPI 0.104+
- **Database:** PostgreSQL 14+
- **Caching:** Redis 7+
- **Authentication:** JWT (JSON Web Tokens)
- **ORM:** SQLAlchemy 2.0+
- **Validation:** Pydantic v2

---

## 🔐 Authentication

### Overview

All API endpoints (except public ones) require authentication using **JWT Bearer tokens**.

### Authentication Flow

```
1. User registers/logs in
2. API returns access_token and refresh_token
3. Client includes access_token in Authorization header
4. Token expires after 30 minutes
5. Client refreshes token using refresh_token
```

### Obtaining Tokens

**POST** `/api/v1/auth/login`

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "email": "parent@example.com",
    "full_name": "John Doe",
    "role": "parent"
  }
}
```

### Using Tokens

Include the access token in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refreshing Tokens

**POST** `/api/v1/auth/refresh`

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Token Expiration

- **Access Token:** 30 minutes
- **Refresh Token:** 7 days

---

## 📡 API Endpoints

### Authentication Endpoints

#### Register User

**POST** `/api/v1/auth/register`

Register a new parent or teacher account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "full_name": "Jane Smith",
  "role": "parent"
}
```

**Teacher Registration:**
```json
{
  "email": "teacher@school.edu",
  "password": "TeacherPass123!",
  "full_name": "Ms. Johnson",
  "role": "teacher",
  "teaching_license": "EDU-12345-2025"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "full_name": "Jane Smith",
  "role": "parent",
  "is_active": true,
  "created_at": "2025-10-23T10:30:00Z"
}
```

**Rate Limit:** 3 registrations per hour per IP

---

#### Login

**POST** `/api/v1/auth/login`

Authenticate and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "parent"
  }
}
```

**Rate Limit:** 5 login attempts per 15 minutes per user

---

#### Logout

**POST** `/api/v1/auth/logout`

Invalidate current access token.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "message": "Successfully logged out"
}
```

---

#### Get Current User

**GET** `/api/v1/auth/me`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "parent",
  "is_active": true,
  "created_at": "2025-01-15T10:00:00Z",
  "preferences": {
    "notifications_enabled": true,
    "language": "en"
  }
}
```

---

### Learner Endpoints

#### Create Learner

**POST** `/api/v1/learners`

Create a new learner profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "first_name": "Emma",
  "last_name": "Smith",
  "grade_level": 8,
  "date_of_birth": "2011-05-15",
  "diagnoses": ["ADHD", "Dyslexia"],
  "has_iep": true,
  "iep_accommodations": [
    "Extended time on tests",
    "Preferential seating",
    "Frequent breaks"
  ],
  "learning_preferences": {
    "visual_learner": true,
    "prefers_quiet": true,
    "needs_movement_breaks": true
  }
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "first_name": "Emma",
  "last_name": "Smith",
  "grade_level": 8,
  "date_of_birth": "2011-05-15",
  "diagnoses": ["ADHD", "Dyslexia"],
  "has_iep": true,
  "iep_accommodations": [
    "Extended time on tests",
    "Preferential seating",
    "Frequent breaks"
  ],
  "parent_id": 1,
  "created_at": "2025-10-23T10:30:00Z"
}
```

---

#### List Learners

**GET** `/api/v1/learners`

List all learners for authenticated parent/teacher.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `grade_level` (optional): Filter by grade level
- `has_iep` (optional): Filter by IEP status
- `diagnosis` (optional): Filter by diagnosis

**Example:**
```
GET /api/v1/learners?grade_level=8&has_iep=true
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "first_name": "Emma",
    "last_name": "Smith",
    "grade_level": 8,
    "has_iep": true,
    "diagnoses": ["ADHD", "Dyslexia"]
  },
  {
    "id": 2,
    "first_name": "Liam",
    "last_name": "Johnson",
    "grade_level": 8,
    "has_iep": true,
    "diagnoses": ["ASD"]
  }
]
```

---

#### Get Learner by ID

**GET** `/api/v1/learners/{learner_id}`

Get detailed learner profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `include_profile` (optional): Include sensory profile

**Response:** `200 OK`
```json
{
  "id": 1,
  "first_name": "Emma",
  "last_name": "Smith",
  "grade_level": 8,
  "date_of_birth": "2011-05-15",
  "diagnoses": ["ADHD", "Dyslexia"],
  "has_iep": true,
  "iep_accommodations": ["Extended time", "Quiet space"],
  "sensory_profile": {
    "noise_sensitivity": "high",
    "light_sensitivity": "medium",
    "preferred_seating": "back of room",
    "movement_breaks_needed": true
  },
  "learning_preferences": {
    "visual_learner": true,
    "prefers_quiet": true
  }
}
```

---

#### Update Learner

**PATCH** `/api/v1/learners/{learner_id}`

Update learner profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:** (partial update)
```json
{
  "grade_level": 9,
  "diagnoses": ["ADHD", "Dyslexia", "Anxiety"],
  "iep_accommodations": [
    "Extended time",
    "Quiet space",
    "Calculator allowed"
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "first_name": "Emma",
  "last_name": "Smith",
  "grade_level": 9,
  "diagnoses": ["ADHD", "Dyslexia", "Anxiety"],
  "updated_at": "2025-10-23T11:00:00Z"
}
```

---

#### Delete Learner

**DELETE** `/api/v1/learners/{learner_id}`

Delete a learner profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `204 No Content`

---

### Homework Session Endpoints

#### Create Homework Session

**POST** `/api/v1/homework/sessions`

Start a new homework session.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "learner_id": 1,
  "subject": "Mathematics",
  "title": "Solving Linear Equations",
  "description": "Practice 2-step equations",
  "grade_level": 8,
  "settings": {
    "read_aloud": true,
    "show_hints": true,
    "timer_enabled": false,
    "parent_assist_mode": false
  }
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "learner_id": 1,
  "subject": "Mathematics",
  "title": "Solving Linear Equations",
  "current_step": "understand",
  "completed_steps": [],
  "status": "active",
  "hints_given": 0,
  "created_at": "2025-10-23T10:30:00Z"
}
```

---

#### Get Homework Session

**GET** `/api/v1/homework/sessions/{session_id}`

Get homework session details.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "learner_id": 1,
  "subject": "Mathematics",
  "title": "Solving Linear Equations",
  "current_step": "solve",
  "completed_steps": ["understand", "plan"],
  "status": "active",
  "hints_given": 2,
  "settings": {
    "read_aloud": true,
    "show_hints": true
  },
  "created_at": "2025-10-23T10:30:00Z",
  "updated_at": "2025-10-23T10:45:00Z"
}
```

---

#### Generate AI Hint

**POST** `/api/v1/homework/sessions/{session_id}/hint`

Generate AI-powered hint for current problem.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "problem_text": "Solve: 2x + 5 = 13",
  "context": "Student is stuck on isolating the variable",
  "scaffolding_level": "moderate"
}
```

**Response:** `200 OK`
```json
{
  "hint": "Remember, to solve for x, we need to get x by itself. What operation can we use to remove the +5 from the left side?",
  "hints_given": 3,
  "hints_remaining": 0
}
```

**Rate Limit:** Maximum 3 hints per problem

---

#### Upload Homework File

**POST** `/api/v1/homework/sessions/{session_id}/upload`

Upload homework files (PDF, images).

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body:** (multipart/form-data)
```
file: [binary file data]
```

**Response:** `200 OK`
```json
{
  "file_url": "https://storage.aivolearning.com/homework/session-1/file-abc123.pdf",
  "file_type": "application/pdf",
  "file_size": 2048576,
  "uploaded_at": "2025-10-23T10:50:00Z"
}
```

**Allowed File Types:**
- PDF: `application/pdf`
- Images: `image/jpeg`, `image/png`, `image/heic`

**Max File Size:** 10 MB

---

#### Complete Homework Session

**POST** `/api/v1/homework/sessions/{session_id}/complete`

Mark homework session as completed.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "final_answers": ["x = 4", "x = -2"],
  "confidence_level": 4,
  "time_spent_minutes": 45
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "completed",
  "completed_at": "2025-10-23T11:15:00Z",
  "time_spent_minutes": 45,
  "hints_used": 2,
  "steps_completed": ["understand", "plan", "solve", "check", "reflect"]
}
```

---

### IEP Goal Endpoints

#### Create IEP Goal

**POST** `/api/v1/learners/{learner_id}/iep-goals`

Create an IEP goal for a learner.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "category": "reading",
  "description": "Improve reading comprehension",
  "target": "Read and comprehend grade-level texts with 80% accuracy",
  "current_level": "60% accuracy on grade-level texts",
  "target_date": "2026-06-01",
  "accommodations": [
    "Extended time",
    "Audiobook option",
    "Graphic organizers"
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "learner_id": 1,
  "category": "reading",
  "description": "Improve reading comprehension",
  "target": "Read and comprehend grade-level texts with 80% accuracy",
  "current_level": "60% accuracy",
  "progress_percentage": 0,
  "status": "active",
  "created_at": "2025-10-23T10:00:00Z"
}
```

---

#### Update IEP Goal Progress

**PATCH** `/api/v1/iep-goals/{goal_id}/progress`

Update progress on an IEP goal.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "progress_percentage": 65,
  "notes": "Showing improvement with graphic organizers",
  "assessment_date": "2025-10-23"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "progress_percentage": 65,
  "status": "in_progress",
  "last_assessment": "2025-10-23",
  "notes": "Showing improvement with graphic organizers"
}
```

---

## 📮 Postman Collections

### Setting Up Postman

1. **Install Postman**
   - Download from [postman.com](https://www.postman.com/downloads/)
   
2. **Import OpenAPI Spec**
   ```
   GET http://localhost:8000/openapi.json
   ```
   - File → Import → Link
   - Paste: `http://localhost:8000/openapi.json`
   - Click Import

3. **Configure Environment**

Create a new environment with these variables:

```json
{
  "base_url": "http://localhost:8000",
  "api_version": "v1",
  "access_token": "",
  "refresh_token": "",
  "user_id": "",
  "learner_id": ""
}
```

### Pre-request Script (Auto Token Refresh)

Add this pre-request script to your collection:

```javascript
// Check if access token exists and is expired
const accessToken = pm.environment.get("access_token");
const refreshToken = pm.environment.get("refresh_token");

if (!accessToken && refreshToken) {
    // Refresh the token
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/api/v1/auth/refresh",
        method: 'POST',
        header: {
            'Content-Type': 'application/json',
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                refresh_token: refreshToken
            })
        }
    }, function (err, res) {
        if (!err && res.code === 200) {
            const data = res.json();
            pm.environment.set("access_token", data.access_token);
        }
    });
}
```

### Collection Structure

```
AIVO Learning API
├── Authentication
│   ├── Register Parent
│   ├── Register Teacher
│   ├── Login
│   ├── Logout
│   ├── Refresh Token
│   └── Get Current User
│
├── Learners
│   ├── Create Learner
│   ├── List Learners
│   ├── Get Learner
│   ├── Update Learner
│   └── Delete Learner
│
├── Homework Sessions
│   ├── Create Session
│   ├── Get Session
│   ├── List Sessions
│   ├── Generate Hint
│   ├── Upload File
│   ├── Progress Step
│   └── Complete Session
│
├── IEP Goals
│   ├── Create Goal
│   ├── List Goals
│   ├── Update Goal
│   └── Update Progress
│
└── Admin (Teachers/Admins only)
    ├── List All Users
    ├── Manage Licenses
    └── View Analytics
```

### Example Requests

**Login Request:**
```javascript
POST {{base_url}}/api/{{api_version}}/auth/login
Content-Type: application/json

{
  "email": "parent@example.com",
  "password": "SecurePass123!"
}

// Test Script
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    const data = pm.response.json();
    pm.environment.set("access_token", data.access_token);
    pm.environment.set("refresh_token", data.refresh_token);
    pm.environment.set("user_id", data.user.id);
});
```

**Create Learner Request:**
```javascript
POST {{base_url}}/api/{{api_version}}/learners
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "first_name": "Emma",
  "last_name": "Smith",
  "grade_level": 8,
  "diagnoses": ["ADHD"]
}

// Test Script
pm.test("Learner created", function () {
    pm.response.to.have.status(201);
    const data = pm.response.json();
    pm.environment.set("learner_id", data.id);
});
```

---

## 🔄 API Versioning Strategy

### Current Version: v1

**Base Path:** `/api/v1`

### Versioning Approach

We use **URL path versioning** for clear, explicit API versions:

```
✅ GOOD: /api/v1/learners
❌ BAD:  /api/learners?version=1
```

### Version Support Policy

- **Current Version (v1):** Full support, active development
- **Previous Version:** 6 months deprecation notice
- **Legacy Version:** Read-only, 12 months total support

### Breaking Changes

A new version is required for:
- ❌ Removing endpoints
- ❌ Removing request/response fields
- ❌ Changing field types
- ❌ Changing authentication method
- ❌ Changing rate limits (stricter)

### Non-Breaking Changes (Same Version)

- ✅ Adding new endpoints
- ✅ Adding optional request fields
- ✅ Adding response fields
- ✅ Deprecating (not removing) fields
- ✅ Bug fixes

### Version Lifecycle

```
v1 (Current)
├── 2025-01 - Released
├── 2025-10 - Stable
└── 2027-01 - Support ends (if v2 released)

v2 (Future)
├── 2026-07 - Beta release
├── 2026-10 - Stable release
└── v1 deprecation notice
```

### Deprecation Process

1. **Announcement** - 6 months notice
2. **Headers** - Add deprecation header
   ```
   Deprecation: true
   Sunset: Sat, 01 Jul 2026 00:00:00 GMT
   Link: </api/v2/docs>; rel="successor-version"
   ```
3. **Documentation** - Mark as deprecated
4. **Migration Guide** - Provide v1 → v2 guide
5. **Support Period** - 6 months parallel support
6. **Shutdown** - Remove v1 endpoints

---

## ⚡ Rate Limiting

### Rate Limit Tiers

| Endpoint | Limit | Window |
|----------|-------|--------|
| **Authentication** | | |
| Login | 5 attempts | 15 minutes |
| Registration | 3 attempts | 1 hour |
| Password Reset | 3 attempts | 1 hour |
| **General API** | | |
| Authenticated | 100 requests | 1 minute |
| Public | 20 requests | 1 minute |
| **AI Hints** | | |
| Per Problem | 3 hints | Per session |
| Per Session | 15 hints | Per session |

### Rate Limit Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698076800
```

### Rate Limit Exceeded Response

**Status:** `429 Too Many Requests`

```json
{
  "detail": "Rate limit exceeded. Try again in 45 seconds.",
  "retry_after": 45
}
```

---

## ❌ Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "detail": "Error message describing what went wrong",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2025-10-23T10:30:00Z",
  "path": "/api/v1/learners/999"
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PATCH |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Missing/invalid token |
| `403` | Forbidden | Valid token, insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `422` | Unprocessable Entity | Validation error |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | Maintenance mode |

### Common Error Codes

```python
# Authentication Errors
AUTH_001 = "Invalid credentials"
AUTH_002 = "Token expired"
AUTH_003 = "Token invalid"
AUTH_004 = "Insufficient permissions"

# Validation Errors
VAL_001 = "Missing required field"
VAL_002 = "Invalid email format"
VAL_003 = "Password too weak"
VAL_004 = "Invalid date format"

# Resource Errors
RES_001 = "Learner not found"
RES_002 = "Session not found"
RES_003 = "Duplicate resource"

# Business Logic Errors
BIZ_001 = "Hint limit exceeded"
BIZ_002 = "Session already completed"
BIZ_003 = "File type not allowed"
```

### Validation Error Example

**Status:** `422 Unprocessable Entity`

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "invalid email format",
      "type": "value_error.email"
    },
    {
      "loc": ["body", "grade_level"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

---

## 📊 Response Formats

### Success Response

```json
{
  "id": 1,
  "name": "Resource Name",
  "created_at": "2025-10-23T10:30:00Z",
  "updated_at": "2025-10-23T10:30:00Z"
}
```

### List Response with Pagination

```json
{
  "items": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Item 2" }
  ],
  "total": 42,
  "page": 1,
  "size": 20,
  "pages": 3
}
```

### Date/Time Format

All timestamps use **ISO 8601** format with UTC timezone:

```
2025-10-23T10:30:00Z
```

---

## 💻 Integration Examples

### JavaScript/TypeScript (Fetch API)

```typescript
// api.ts
const BASE_URL = 'http://localhost:8000/api/v1';

class AIVOApiClient {
  private accessToken: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    this.accessToken = data.access_token;
    localStorage.setItem('access_token', data.access_token);
    return data.user;
  }

  async createLearner(learnerData: any) {
    const response = await fetch(`${BASE_URL}/learners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify(learnerData)
    });

    if (!response.ok) throw new Error('Failed to create learner');
    return response.json();
  }

  async generateHint(sessionId: number, problemText: string) {
    const response = await fetch(
      `${BASE_URL}/homework/sessions/${sessionId}/hint`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({ problem_text: problemText })
      }
    );

    if (!response.ok) throw new Error('Failed to generate hint');
    return response.json();
  }
}

export const apiClient = new AIVOApiClient();
```

### Python (httpx)

```python
# aivo_client.py
import httpx
from typing import Dict, Any

class AIVOClient:
    def __init__(self, base_url: str = "http://localhost:8000/api/v1"):
        self.base_url = base_url
        self.access_token: str | None = None
        self.client = httpx.AsyncClient()

    async def login(self, email: str, password: str) -> Dict[str, Any]:
        response = await self.client.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        
        data = response.json()
        self.access_token = data["access_token"]
        return data["user"]

    async def create_learner(self, learner_data: Dict[str, Any]) -> Dict[str, Any]:
        response = await self.client.post(
            f"{self.base_url}/learners",
            json=learner_data,
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        response.raise_for_status()
        return response.json()

    async def generate_hint(
        self, session_id: int, problem_text: str
    ) -> Dict[str, Any]:
        response = await self.client.post(
            f"{self.base_url}/homework/sessions/{session_id}/hint",
            json={"problem_text": problem_text},
            headers={"Authorization": f"Bearer {self.access_token}"}
        )
        response.raise_for_status()
        return response.json()

# Usage
async def main():
    client = AIVOClient()
    await client.login("parent@example.com", "password123")
    
    learner = await client.create_learner({
        "first_name": "Emma",
        "last_name": "Smith",
        "grade_level": 8
    })
    
    print(f"Created learner: {learner['id']}")
```

### React (TanStack Query)

```typescript
// hooks/useAuth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user);
    }
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
    retry: false
  });
}

// hooks/useLearners.ts
export function useCreateLearner() {
  return useMutation({
    mutationFn: (data: CreateLearnerInput) => apiClient.createLearner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learners'] });
    }
  });
}

export function useLearners() {
  return useQuery({
    queryKey: ['learners'],
    queryFn: () => apiClient.getLearners()
  });
}
```

---

## 🔧 Testing the API

### Using curl

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@example.com","password":"password123"}'

# Create Learner (with token)
curl -X POST http://localhost:8000/api/v1/learners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"first_name":"Emma","last_name":"Smith","grade_level":8}'

# Get Learners
curl -X GET http://localhost:8000/api/v1/learners \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using HTTPie

```bash
# Login
http POST :8000/api/v1/auth/login \
  email=parent@example.com \
  password=password123

# Create Learner
http POST :8000/api/v1/learners \
  Authorization:"Bearer YOUR_TOKEN" \
  first_name=Emma \
  last_name=Smith \
  grade_level:=8
```

---

## 📚 Additional Resources

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI Schema:** http://localhost:8000/openapi.json
- **Source Code:** `services/api-gateway/app/api/`
- **Models:** `services/api-gateway/app/models/`
- **Schemas:** `services/api-gateway/app/schemas/`

---

## 🆘 Support

- **Issues:** https://github.com/artpromedia/aivo-agentic-ai-learning-app/issues
- **Email:** api-support@aivolearning.com
- **Discord:** #api-help channel

---

**Last Updated:** October 23, 2025  
**API Version:** v1.0.0
