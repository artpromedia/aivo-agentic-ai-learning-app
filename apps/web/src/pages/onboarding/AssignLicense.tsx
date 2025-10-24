/**
 * Teacher - Assign License to Student
 * 
 * Step 2: Teacher creates student account using their license
 * 
 * Updated: 2025-10-23 05:53:28 UTC
 * By: aivo-ai
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AssignLicenseForm {
  student_first_name: string;
  student_last_name: string;
  student_email?: string;
  grade_level: number | '';
  diagnoses: string[];
  accommodations: {
    extended_time?: boolean;
    time_multiplier?: number;
    read_aloud?: boolean;
    break_reminders?: boolean;
    calculator?: boolean;
  };
  has_iep?: boolean;
}

interface LicenseInfo {
  license_id: string;
  license_type: string;
  total_seats: number;
  available_seats: number;
}

export function AssignLicensePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [formData, setFormData] = useState<AssignLicenseForm>({
    student_first_name: '',
    student_last_name: '',
    student_email: '',
    grade_level: '',
    diagnoses: [],
    accommodations: {},
    has_iep: false
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AssignLicenseForm, string>>>({});

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLicenseInfo(data.license_info);
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AssignLicenseForm, string>> = {};

    if (!formData.student_first_name) newErrors.student_first_name = 'First name is required';
    if (!formData.student_last_name) newErrors.student_last_name = 'Last name is required';
    if (!formData.grade_level && formData.grade_level !== 0) newErrors.grade_level = 'Grade level is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/auth/assign-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create student');
      }

      const data = await response.json();

      alert(`Student created! ${formData.student_first_name} ${formData.student_last_name} has been added. Assessment ready.`);

      // Redirect to assessment
      navigate(`/onboarding/assessment/${data.assessment_id}`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to create student: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnosisChange = (diagnosis: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      diagnoses: checked
        ? [...prev.diagnoses, diagnosis]
        : prev.diagnoses.filter(d => d !== diagnosis)
    }));
  };

  const handleAccommodationChange = (field: keyof typeof formData.accommodations, value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      accommodations: {
        ...prev.accommodations,
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Assign License to Student
            </h1>
            <p className="text-gray-600">
              Step 2 of 2: Add student information
            </p>
          </div>

          {/* License Info Badge */}
          {licenseInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">
                    License: {licenseInfo.license_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    {licenseInfo.license_type}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold ${
                  licenseInfo.available_seats > 5 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {licenseInfo.available_seats} of {licenseInfo.total_seats} seats available
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student First Name *
                </label>
                <input
                  type="text"
                  placeholder="Michael"
                  value={formData.student_first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, student_first_name: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.student_first_name ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.student_first_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.student_first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student Last Name *
                </label>
                <input
                  type="text"
                  placeholder="Smith"
                  value={formData.student_last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, student_last_name: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.student_last_name ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.student_last_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.student_last_name}</p>
                )}
              </div>
            </div>

            {/* Student Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Email (Optional)
              </label>
              <input
                type="email"
                placeholder="michael.smith@student.edu"
                value={formData.student_email}
                onChange={(e) => setFormData(prev => ({ ...prev, student_email: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level *
              </label>
              <select
                value={formData.grade_level}
                onChange={(e) => setFormData(prev => ({ ...prev, grade_level: parseInt(e.target.value) }))}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.grade_level ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Select grade</option>
                <option value="0">Kindergarten</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}th Grade
                  </option>
                ))}
              </select>
              {errors.grade_level && (
                <p className="mt-1 text-sm text-red-500">{errors.grade_level}</p>
              )}
            </div>

            {/* Diagnoses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Diagnoses (if applicable)
              </label>
              <div className="space-y-2">
                {['ADHD', 'ASD', 'Dyslexia', 'Dyscalculia', 'Anxiety'].map((diagnosis) => (
                  <label key={diagnosis} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.diagnoses.includes(diagnosis)}
                      onChange={(e) => handleDiagnosisChange(diagnosis, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">
                      {diagnosis === 'ASD' ? 'Autism Spectrum Disorder (ASD)' : diagnosis}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Accommodations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Accommodations
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accommodations.extended_time || false}
                    onChange={(e) => handleAccommodationChange('extended_time', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Extended Time</span>
                </label>

                {formData.accommodations.extended_time && (
                  <div className="ml-6">
                    <label className="block text-sm text-gray-600 mb-1">Time Multiplier</label>
                    <select
                      value={formData.accommodations.time_multiplier || 1.5}
                      onChange={(e) => handleAccommodationChange('time_multiplier', parseFloat(e.target.value))}
                      className="px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1.5">1.5x (50% extra)</option>
                      <option value="2.0">2.0x (100% extra)</option>
                    </select>
                  </div>
                )}

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accommodations.read_aloud || false}
                    onChange={(e) => handleAccommodationChange('read_aloud', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Read Aloud / Text-to-Speech</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accommodations.break_reminders || false}
                    onChange={(e) => handleAccommodationChange('break_reminders', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Break Reminders</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.accommodations.calculator || false}
                    onChange={(e) => handleAccommodationChange('calculator', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Calculator Access</span>
                </label>
              </div>
            </div>

            {/* IEP */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.has_iep || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, has_iep: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">
                  Student has an IEP (Individualized Education Program)
                </span>
              </label>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ℹ️ After creating the student, they'll take a baseline assessment
                to personalize their AI learning brain.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Student...' : 'Create Student & Start Assessment →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
