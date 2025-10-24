/**
 * Teacher Registration Form
 * 
 * Step 1: Teacher creates account with license verification
 * 
 * Updated: 2025-10-23 05:53:28 UTC
 * By: aivo-ai
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

interface TeacherSignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  school_name: string;
  district_name?: string;
  license_id: string;
  phone?: string;
}

export function TeacherSignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TeacherSignupForm>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    school_name: '',
    district_name: '',
    license_id: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TeacherSignupForm, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TeacherSignupForm, string>> = {};

    if (!formData.full_name) newErrors.full_name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.school_name) newErrors.school_name = 'School name is required';
    if (!formData.license_id) newErrors.license_id = 'License ID is required';
    else if (!/^[A-Z0-9]{6}$/i.test(formData.license_id)) {
      newErrors.license_id = 'License ID must be exactly 6 alphanumeric characters';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/register/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          school_name: formData.school_name,
          district_name: formData.district_name,
          license_id: formData.license_id.toUpperCase(),
          phone: formData.phone
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();

      // Save tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_role', 'TEACHER');

      // Show success message
      alert(`Account created! License verified: ${data.license_info.available_seats} of ${data.license_info.total_seats} seats available`);

      // Redirect to assign license
      navigate('/onboarding/assign-license');
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Registration failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof TeacherSignupForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Create Teacher Account
            </h1>
            <p className="text-gray-600">
              Step 1 of 2: Your information
            </p>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              💡 You'll need your 6-digit license ID from your school district.
              Contact your district admin if you don't have one.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Ms. Sarah Johnson"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.full_name ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="teacher@school.edu"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name *
              </label>
              <input
                type="text"
                placeholder="MLK Middle School"
                value={formData.school_name}
                onChange={(e) => handleChange('school_name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.school_name ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.school_name && (
                <p className="mt-1 text-sm text-red-500">{errors.school_name}</p>
              )}
            </div>

            {/* District Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Los Angeles Unified"
                value={formData.district_name}
                onChange={(e) => handleChange('district_name', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                If not provided, we'll use the district from your license
              </p>
            </div>

            {/* License ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License ID (6 digits) *
              </label>
              <input
                type="text"
                placeholder="ABC123"
                maxLength={6}
                value={formData.license_id}
                onChange={(e) => handleChange('license_id', e.target.value.toUpperCase())}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.license_id ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase`}
              />
              {errors.license_id && (
                <p className="mt-1 text-sm text-red-500">{errors.license_id}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+1-555-123-4567"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying License...' : 'Verify License & Continue →'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
