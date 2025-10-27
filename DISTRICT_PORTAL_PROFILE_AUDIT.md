# District Portal - Profile Page Audit

**Audit Date**: October 26, 2025  
**File**: `apps/district-portal/src/pages/Profile.tsx`  
**Page Location**: `/profile`  
**Status**: 🟡 PARTIALLY FUNCTIONAL

---

## 📊 Executive Summary

**Total Interactive Elements**: 9  
**Functional**: 5 (56%)  
**Partially Functional**: 2 (22%)  
**Dead/Static**: 2 (22%)  

**Priority**: 🔴 MEDIUM - Profile updates are not persisted to backend

---

## 🔍 Detailed Findings

### ✅ Functional Elements (5)

#### 1. **Edit Profile Button**
- **Location**: Top right corner of page
- **Current Behavior**: Shows/hides edit form
- **Functionality**: ✅ Works (toggles `isEditing` state)
- **Status**: FUNCTIONAL

#### 2. **Avatar Upload Input (Edit Mode)**
- **Location**: Camera icon on avatar (visible when editing)
- **Current Behavior**: Opens file picker, reads file with FileReader
- **Functionality**: ✅ Works (local preview only)
- **Issue**: ⚠️ No backend upload - file is not saved
- **Status**: PARTIALLY FUNCTIONAL

#### 3. **Name Input Field (Edit Mode)**
- **Location**: Form field in edit mode
- **Current Behavior**: Updates `formData.name` state
- **Functionality**: ✅ Works (local state only)
- **Status**: FUNCTIONAL (for UI)

#### 4. **Email Input Field (Edit Mode)**
- **Location**: Form field in edit mode
- **Current Behavior**: Updates `formData.email` state
- **Functionality**: ✅ Works (local state only)
- **Status**: FUNCTIONAL (for UI)

#### 5. **Cancel Button (Edit Mode)**
- **Location**: Bottom left of edit form
- **Current Behavior**: Reverts form data, exits edit mode
- **Functionality**: ✅ Works perfectly
- **Code**:
  ```typescript
  onClick={() => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
    });
  }}
  ```
- **Status**: FUNCTIONAL

### 🔴 Dead/Non-Functional Elements (2)

#### 6. **Save Changes Button** 🔴 HIGH PRIORITY
- **Location**: Bottom right of edit form
- **Current Code**:
  ```typescript
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      updateUser(formData);  // ⚠️ THIS IS THE PROBLEM
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show error message
    }
  };
  ```
- **Issue**: `updateUser()` from `@aivo/auth` **ONLY UPDATES LOCAL STATE**
  ```typescript
  // In packages/auth/src/contexts/AuthContext.tsx
  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...updates };
      TokenManager.setUser(updatedUser);  // Only localStorage
      return { ...prev, user: updatedUser };
    });
  }, []);
  ```
- **What Happens Now**:
  1. User edits name/email
  2. Clicks "Save Changes"
  3. Form closes (looks successful)
  4. Changes visible in UI (localStorage)
  5. **BUT**: No API call to backend
  6. **Result**: Changes lost on next login or refresh from server

- **Required Fix**:
  - Add backend API endpoint: `PUT /api/v1/admin/users/me/profile`
  - Add frontend API method: `userAPI.updateMyProfile()`
  - Call API in `handleSubmit` before calling `updateUser`
  - Add loading/error/success states

- **Status**: 🔴 NON-FUNCTIONAL (no backend persistence)

#### 7. **Avatar Upload** 🔴 HIGH PRIORITY
- **Location**: Camera icon overlay on avatar
- **Current Code**:
  ```typescript
  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to server and get URL  ← ⚠️ COMMENT SAYS IT
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  ```
- **Issue**: 
  - Comment admits: "In production, upload to server and get URL"
  - Only converts to base64 data URL (local preview)
  - Not uploaded to backend
  - base64 string could be huge (bloats localStorage)

- **What Happens Now**:
  1. User selects image
  2. Image shows in UI (base64 preview)
  3. Clicks "Save Changes"
  4. base64 stored in localStorage
  5. **No file upload to server**
  6. **Result**: Image lost on logout or other device

- **Required Fix**:
  - Add backend API endpoint: `POST /api/v1/admin/users/me/avatar`
  - Accept file upload (multipart/form-data)
  - Store file in cloud storage (AWS S3, Azure Blob, etc.)
  - Return avatar URL
  - Update frontend to upload file first, then use URL in profile update

- **Status**: 🔴 NON-FUNCTIONAL (no backend upload)

### 🔗 Navigation Links (3) - Status Unknown

#### 8. **Settings Link**
- **Location**: Quick Actions section (first card)
- **Href**: `/settings`
- **Status**: ✅ FUNCTIONAL (Settings page exists and works)

#### 9. **Security Link**
- **Location**: Quick Actions section (second card)
- **Href**: `/settings?tab=security`
- **Status**: ⚠️ DEPENDS on Settings page having tabs
- **Note**: Need to verify Settings page supports `?tab=security` query param

#### 10. **Notifications Link**
- **Location**: Quick Actions section (third card)
- **Href**: `/settings?tab=notifications`
- **Status**: ⚠️ DEPENDS on Settings page having tabs
- **Note**: Need to verify Settings page supports `?tab=notifications` query param

---

## 🔴 Critical Issues

### Issue #1: No Backend Profile Update API

**Problem**: Profile changes not saved to database

**Current Flow**:
```
User edits → Save Changes → updateUser() → localStorage only → No API call
```

**Required Flow**:
```
User edits → Save Changes → API call → Database update → updateUser() → localStorage sync
```

**Impact**: 
- Changes lost on next login
- Changes not synchronized across devices
- Users frustrated by "lost" edits

### Issue #2: No Avatar Upload System

**Problem**: Avatar images not uploaded to server

**Current Flow**:
```
User selects image → FileReader base64 → localStorage → No API call
```

**Required Flow**:
```
User selects image → Upload to server → Get URL → Save URL in profile → Display
```

**Impact**:
- Images lost on logout
- Large base64 strings bloat localStorage
- Images not accessible from other devices

---

## 🛠️ Required Backend APIs

### API #1: Update My Profile ⭐ HIGH PRIORITY

**Endpoint**: `PUT /api/v1/admin/users/me/profile`

**Purpose**: Allow users to update their own profile information

**Request Body**:
```json
{
  "full_name": "John Updated Doe",
  "email": "john.updated@school.edu"
}
```

**Response**:
```json
{
  "id": "user-123",
  "email": "john.updated@school.edu",
  "full_name": "John Updated Doe",
  "role": "district-admin",
  "avatar": "https://storage.example.com/avatars/user-123.jpg",
  "is_active": true,
  "is_verified": true,
  "onboarding_status": "completed",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2025-10-26T12:00:00Z"
}
```

**Validation**:
- Email must be unique (check existing users)
- Email must be valid format
- Full name must not be empty

**Security**:
- User can only update their own profile
- Cannot change: role, is_active, is_verified, onboarding_status
- Use current user from JWT token (`current_user` dependency)

### API #2: Upload Avatar Image ⭐ HIGH PRIORITY

**Endpoint**: `POST /api/v1/admin/users/me/avatar`

**Purpose**: Allow users to upload profile picture

**Request**: multipart/form-data
```
file: <image file>
```

**Response**:
```json
{
  "avatar_url": "https://storage.example.com/avatars/user-123-1729944000.jpg",
  "message": "Avatar uploaded successfully"
}
```

**Implementation**:
1. Accept file upload (UploadFile)
2. Validate file type (image/jpeg, image/png, image/webp)
3. Validate file size (max 5MB)
4. Resize/optimize image (max 512x512)
5. Generate unique filename (user-id + timestamp)
6. Upload to cloud storage (S3, Azure Blob, etc.)
   - **For now**: Save to local `uploads/avatars/` directory
   - **Production**: Use cloud storage
7. Update user.avatar field with URL
8. Delete old avatar file (if exists)
9. Return new avatar URL

**Security**:
- User can only upload their own avatar
- File type validation
- File size validation
- Sanitize filename
- No path traversal

### API #3: Get Current User Profile (May Already Exist)

**Endpoint**: `GET /api/v1/admin/users/me`

**Purpose**: Get current user's full profile

**Check**: This might already exist! Need to verify in users.py

---

## 📋 Implementation Plan

### Phase 1: Backend APIs (2-3 hours)

#### Task 1.1: Add Update Profile Endpoint
- [ ] **File**: `services/api-gateway/app/api/v1/admin/users.py`
- [ ] **Endpoint**: `PUT /api/v1/admin/users/me/profile`
- [ ] **Schema**: `UpdateMyProfileRequest` (email, full_name)
- [ ] **Logic**:
  ```python
  @router.put("/me/profile", response_model=UserResponse)
  async def update_my_profile(
      profile_data: UpdateMyProfileRequest,
      db: Session = Depends(get_db),
      current_user: User = Depends(get_current_user),
  ):
      # Validate email uniqueness (if changed)
      if profile_data.email != current_user.email:
          existing = db.query(User).filter(User.email == profile_data.email).first()
          if existing:
              raise HTTPException(status_code=400, detail="Email already in use")
      
      # Update fields
      current_user.email = profile_data.email
      current_user.full_name = profile_data.full_name
      current_user.updated_at = datetime.utcnow()
      
      db.commit()
      db.refresh(current_user)
      
      return current_user
  ```

#### Task 1.2: Add Avatar Upload Endpoint
- [ ] **File**: `services/api-gateway/app/api/v1/admin/users.py`
- [ ] **Endpoint**: `POST /api/v1/admin/users/me/avatar`
- [ ] **Dependencies**: 
  - PIL (Pillow) for image processing
  - pathlib for file operations
- [ ] **Logic**:
  ```python
  from PIL import Image
  import os
  from pathlib import Path
  
  UPLOAD_DIR = Path("uploads/avatars")
  UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
  
  @router.post("/me/avatar")
  async def upload_avatar(
      file: UploadFile = File(...),
      db: Session = Depends(get_db),
      current_user: User = Depends(get_current_user),
  ):
      # Validate file type
      if not file.content_type.startswith("image/"):
          raise HTTPException(status_code=400, detail="File must be an image")
      
      # Read file
      contents = await file.read()
      
      # Open with PIL
      try:
          image = Image.open(io.BytesIO(contents))
      except Exception:
          raise HTTPException(status_code=400, detail="Invalid image file")
      
      # Resize to max 512x512 (maintain aspect ratio)
      image.thumbnail((512, 512), Image.Resampling.LANCZOS)
      
      # Generate filename
      ext = file.filename.split('.')[-1].lower()
      filename = f"{current_user.id}-{int(time.time())}.{ext}"
      filepath = UPLOAD_DIR / filename
      
      # Save file
      image.save(filepath, optimize=True, quality=85)
      
      # Delete old avatar (if exists and not default)
      if current_user.avatar and not current_user.avatar.startswith("http"):
          old_file = Path(current_user.avatar)
          if old_file.exists():
              old_file.unlink()
      
      # Update database
      avatar_url = f"/uploads/avatars/{filename}"
      current_user.avatar = avatar_url
      current_user.updated_at = datetime.utcnow()
      
      db.commit()
      
      return {"avatar_url": avatar_url, "message": "Avatar uploaded successfully"}
  ```

#### Task 1.3: Serve Static Files
- [ ] **File**: `services/api-gateway/app/main.py`
- [ ] **Add**: Static file serving for uploads
  ```python
  from fastapi.staticfiles import StaticFiles
  
  app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
  ```

### Phase 2: Frontend Integration (1-2 hours)

#### Task 2.1: Add API Methods
- [ ] **File**: `apps/district-portal/src/services/api.ts`
- [ ] **Methods**:
  ```typescript
  async updateMyProfile(data: { full_name: string; email: string }) {
    return fetchAPI('/api/v1/admin/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/me/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail);
    }
    
    return response.json();
  }
  ```

#### Task 2.2: Update Profile.tsx handleSubmit
- [ ] **File**: `apps/district-portal/src/pages/Profile.tsx`
- [ ] **Add state**: 
  ```typescript
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  ```
- [ ] **Update handleSubmit**:
  ```typescript
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      // 1. Upload avatar first (if changed)
      let avatarUrl = formData.avatar;
      if (avatarFile) {  // New state for file object
        const avatarResult = await userAPI.uploadAvatar(avatarFile);
        avatarUrl = avatarResult.avatar_url;
      }
      
      // 2. Update profile
      const updatedUser = await userAPI.updateMyProfile({
        full_name: formData.name,
        email: formData.email,
      });
      
      // 3. Update local auth state
      updateUser({
        name: updatedUser.full_name,
        email: updatedUser.email,
        avatar: avatarUrl || updatedUser.avatar,
      });
      
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Show success message for 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };
  ```

#### Task 2.3: Update handleAvatarUpload
- [ ] **Add state**: `const [avatarFile, setAvatarFile] = useState<File | null>(null);`
- [ ] **Update handler**:
  ```typescript
  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      
      // Store file for upload
      setAvatarFile(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  ```

#### Task 2.4: Add UI Feedback
- [ ] **Loading state**: Disable form during save
- [ ] **Error message**: Display error if save fails
- [ ] **Success message**: Show "Profile updated!" message
- [ ] **Button text**: "Saving..." when isSaving is true

### Phase 3: Testing (30 minutes)

- [ ] Test profile update (name only)
- [ ] Test profile update (email only)
- [ ] Test profile update (both)
- [ ] Test duplicate email validation
- [ ] Test avatar upload (JPEG)
- [ ] Test avatar upload (PNG)
- [ ] Test avatar file size validation
- [ ] Test avatar file type validation
- [ ] Test avatar preview
- [ ] Verify old avatar deleted
- [ ] Verify changes persist after logout/login
- [ ] Verify changes visible in other pages (header, etc.)

---

## ⏱️ Time Estimates

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| Backend | Update profile endpoint | 1 hour | 🔴 HIGH |
| Backend | Avatar upload endpoint | 1.5 hours | 🔴 HIGH |
| Backend | Static file serving | 15 min | 🔴 HIGH |
| Frontend | API methods | 30 min | 🔴 HIGH |
| Frontend | Update Profile.tsx | 1 hour | 🔴 HIGH |
| Frontend | UI feedback | 30 min | 🟡 MEDIUM |
| Testing | All scenarios | 30 min | 🔴 HIGH |
| **TOTAL** | | **~5.5 hours** | |

---

## 🎯 Success Criteria

### Must Have (Phase 1)
- [ ] User can update name and email
- [ ] Email uniqueness validated
- [ ] Changes persist to database
- [ ] Changes visible after logout/login
- [ ] API errors displayed to user

### Should Have (Phase 2)
- [ ] User can upload avatar image
- [ ] Avatar uploaded to server
- [ ] Avatar URL stored in database
- [ ] Old avatar file deleted
- [ ] Image file validation (type, size)
- [ ] Image optimization (resize)

### Nice to Have (Future)
- [ ] Crop avatar before upload
- [ ] Avatar preview modal
- [ ] Email verification when changing email
- [ ] Profile change history/audit log
- [ ] Social profile links (LinkedIn, Twitter, etc.)

---

## 📊 Impact Assessment

### User Impact
**Before Fix**:
- Users can "edit" profile but changes don't save
- Frustration when changes disappear
- Support tickets about "broken" profile page

**After Fix**:
- Users can successfully update profile
- Changes persist across sessions
- Professional avatar images
- Reduced support burden

### Technical Debt
**Current State**: Profile page is a "fake" UI (no real functionality)

**After Fix**: Profile page fully functional with:
- Backend persistence
- Image upload system
- Proper error handling
- User feedback

### Priority Justification
- **Medium Priority** (not critical for MVP)
- District admins likely don't change their info often
- More important: User Management page (already fixed)
- Avatar upload can be deferred if needed
- Should fix before marketing/demos (looks unprofessional)

---

## 🚀 Recommendation

### Immediate Action
**Implement Profile Update API** (2 hours)
- Most critical for user experience
- Simple to implement
- High value / low effort

### Short-term (Next Week)
**Implement Avatar Upload** (2 hours)
- Important for professional appearance
- Moderate complexity
- Good user experience improvement

### Nice-to-Have (Future)
- Email verification flow
- Cropping tool for avatars
- Profile change history
- Social profile links

---

## 📝 Notes

### Observations
1. **Code Quality**: Clean React code, good state management
2. **UX Design**: Beautiful UI, good edit/view mode toggle
3. **Auth Integration**: Properly uses `@aivo/auth` context
4. **Issue**: `updateUser()` function is misleading - only updates localStorage

### Related Pages
- `/settings` - Has similar update needs, check if implemented there
- `/user-management` - Edit other users works, shows pattern to follow

### Dependencies
- PIL (Pillow) for image processing
- Cloud storage SDK (AWS S3 / Azure Blob) for production

---

**Audit Complete** ✅  
**Recommendation**: Proceed with implementation (5.5 hours total)  
**Priority**: 🟡 MEDIUM (should fix before public launch)
