/**
 * Parent - Add Child Form
 * 
 * Step 2: Parent adds child's information
 * 
 * Updated: 2025-10-23 05:53:28 UTC
 * By: aivo-ai
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AddChildForm {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade_level: number | '';
  current_reading_level?: string;
  current_math_level?: string;
  diagnoses: string[];
  accommodations: {
    extended_time?: boolean;
    time_multiplier?: number;
    read_aloud?: boolean;
    break_reminders?: boolean;
    calculator?: boolean;
  };
  has_iep?: boolean;
  location_data: {
    postal_code: string;
    school_name?: string;
    city: string;
    state: string;
    country_code: string;
  };
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  grade_level?: string;
  postal_code?: string;
  city?: string;
  state?: string;
}

export function AddChildPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddChildForm>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    grade_level: '',
    current_reading_level: '',
    current_math_level: '',
    diagnoses: [],
    accommodations: {},
    has_iep: false,
    location_data: {
      postal_code: '',
      school_name: '',
      city: '',
      state: '',
      country_code: 'US'
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.grade_level && formData.grade_level !== 0) newErrors.grade_level = 'Grade level is required';
    if (!formData.location_data.postal_code) newErrors.postal_code = 'Zip code is required';
    if (!formData.location_data.city) newErrors.city = 'City is required';
    if (!formData.location_data.state) newErrors.state = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/auth/add-child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add child');
      }

      const data = await response.json();

      alert(`Child added successfully! ${formData.first_name}'s personalized learning brain is being created.`);

      // Redirect to assessment
      navigate(`/onboarding/assessment/${data.assessment_id}`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to add child: ${message}`);
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

  const gradeOptions = formData.grade_level
    ? Array.from({ length: Number(formData.grade_level) + 3 }, (_, i) => i)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Add Your Child
            </h1>
            <p className="text-gray-600">
              Step 2 of 3: Child's information
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Jayden"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Ofem"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                  {errors.date_of_birth && (
                    <p className="mt-1 text-sm text-red-500">{errors.date_of_birth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Grade Level *
                  </label>
                  <select
                    value={formData.grade_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade_level: parseInt(e.target.value) }))}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.grade_level ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
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
              </div>
            </section>

            {/* Current Levels */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Learning Levels (Optional)
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reading Level
                  </label>
                  <select
                    value={formData.current_reading_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_reading_level: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select reading level</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade === 0 ? 'Kindergarten' : `${grade}th grade`}>
                        {grade === 0 ? 'Kindergarten' : `${grade}th Grade`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Math Level
                  </label>
                  <select
                    value={formData.current_math_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_math_level: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select math level</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade === 0 ? 'Kindergarten' : `${grade}th grade`}>
                        {grade === 0 ? 'Kindergarten' : `${grade}th Grade`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* School Location */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">School Location</h2>
              <p className="text-sm text-gray-600 mb-4">
                This helps us align learning to your child's school district curriculum
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip/Postal Code *
                  </label>
                  <input
                    type="text"
                    placeholder="90001"
                    value={formData.location_data.postal_code}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location_data: { ...prev.location_data, postal_code: e.target.value }
                    }))}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.postal_code ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                  {errors.postal_code && (
                    <p className="mt-1 text-sm text-red-500">{errors.postal_code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="MLK Middle School"
                    value={formData.location_data.school_name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location_data: { ...prev.location_data, school_name: e.target.value }
                    }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="Los Angeles"
                      value={formData.location_data.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location_data: { ...prev.location_data, city: e.target.value }
                      }))}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      placeholder="CA"
                      maxLength={2}
                      value={formData.location_data.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location_data: { ...prev.location_data, state: e.target.value.toUpperCase() }
                      }))}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase`}
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Learning Profile */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Learning Profile (Optional)
              </h2>
              
              <div className="space-y-6">
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
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
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
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="ml-2 text-gray-700">Extended Time</span>
                    </label>

                    {formData.accommodations.extended_time && (
                      <div className="ml-6">
                        <label className="block text-sm text-gray-600 mb-1">Time Multiplier</label>
                        <select
                          value={formData.accommodations.time_multiplier || 1.5}
                          onChange={(e) => handleAccommodationChange('time_multiplier', parseFloat(e.target.value))}
                          className="px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="1.5">1.5x (50% extra time)</option>
                          <option value="2.0">2.0x (100% extra time)</option>
                        </select>
                      </div>
                    )}

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.accommodations.read_aloud || false}
                        onChange={(e) => handleAccommodationChange('read_aloud', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="ml-2 text-gray-700">Read Aloud / Text-to-Speech</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.accommodations.break_reminders || false}
                        onChange={(e) => handleAccommodationChange('break_reminders', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="ml-2 text-gray-700">Break Reminders</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.accommodations.calculator || false}
                        onChange={(e) => handleAccommodationChange('calculator', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
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
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-3 text-gray-700">
                      Child has an IEP (Individualized Education Program)
                    </span>
                  </label>
                </div>
              </div>
            </section>

            {/* Info Alert */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                ℹ️ Next step: A quick 20-minute assessment will help us create
                a personalized AI tutor for {formData.first_name || 'your child'}.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Profile...' : 'Continue to Assessment →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
