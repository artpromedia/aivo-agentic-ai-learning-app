import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useAuth } from '@aivo/auth';
import { userAPI } from '../services/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // 1. Upload avatar first (if changed)
      let avatarUrl = formData.avatar;
      if (avatarFile) {
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
        avatar: avatarUrl || updatedUser.avatar || formData.avatar,
      });

      setSaveSuccess(true);
      setIsEditing(false);
      setAvatarFile(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSaveError('Please select an image file (JPEG, PNG, WEBP)');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setSaveError('Image must be less than 5MB');
        return;
      }

      // Store file for upload
      setAvatarFile(file);
      setSaveError(null);

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Profile</h1>
          <p className="text-neutral-600 mt-1">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        
        <div className="px-8 pb-8">
          {/* Avatar */}
          <div className="flex items-end -mt-16 mb-6">
            <div className="relative">
              <img
                src={formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                alt={formData.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              {isEditing && (
                <label className={`absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-indigo-700'}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={isSaving}
                  />
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              )}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-neutral-900">{formData.name}</h2>
              <p className="text-neutral-600">{user?.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              <div className="flex items-center mt-2 text-sm text-neutral-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {formData.email}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {saveError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{saveError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                    required
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      avatar: user?.avatar || '',
                    });
                    setAvatarFile(null);
                    setSaveError(null);
                  }}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              {saveSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">✓ Profile updated successfully!</p>
                </div>
              )}

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-neutral-500">User ID</p>
                    <p className="text-neutral-900 font-medium mt-1">{user?.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Member Since</p>
                    <p className="text-neutral-900 font-medium mt-1">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Last Login</p>
                    <p className="text-neutral-900 font-medium mt-1">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Role</p>
                    <p className="text-neutral-900 font-medium mt-1">
                      {user?.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization/School Info (if applicable) */}
              {(user?.organizationId || user?.schoolId || user?.districtId) && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Organization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user?.organizationId && (
                      <div>
                        <p className="text-sm text-neutral-500">Organization ID</p>
                        <p className="text-neutral-900 font-medium mt-1">{user.organizationId}</p>
                      </div>
                    )}
                    {user?.schoolId && (
                      <div>
                        <p className="text-sm text-neutral-500">School ID</p>
                        <p className="text-neutral-900 font-medium mt-1">{user.schoolId}</p>
                      </div>
                    )}
                    {user?.districtId && (
                      <div>
                        <p className="text-sm text-neutral-500">District ID</p>
                        <p className="text-neutral-900 font-medium mt-1">{user.districtId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/settings"
          className="p-6 bg-white rounded-xl shadow-sm border border-neutral-200 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-neutral-900">Settings</h3>
              <p className="text-sm text-neutral-500">Manage preferences</p>
            </div>
          </div>
        </a>

        <a
          href="/settings?tab=security"
          className="p-6 bg-white rounded-xl shadow-sm border border-neutral-200 hover:border-green-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-neutral-900">Security</h3>
              <p className="text-sm text-neutral-500">Password & 2FA</p>
            </div>
          </div>
        </a>

        <a
          href="/settings?tab=notifications"
          className="p-6 bg-white rounded-xl shadow-sm border border-neutral-200 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-neutral-900">Notifications</h3>
              <p className="text-sm text-neutral-500">Email & alerts</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
