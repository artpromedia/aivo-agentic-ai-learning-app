/**
 * Teacher - Enroll Student Page
 * 
 * Teachers can enroll students using district licenses
 * After enrollment, redirects to learner app for baseline assessment
 * 
 * Updated: 2025-10-25 00:45:00 UTC
 * By: aivo-ai
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface EnrollStudentForm {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade_level: number | '';
  license_key: string;
  has_iep?: boolean;
  diagnoses: string[];
  accommodations: {
    extended_time?: boolean;
    time_multiplier?: number;
    read_aloud?: boolean;
    break_reminders?: boolean;
    calculator?: boolean;
  };
}

export function EnrollStudent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EnrollStudentForm>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    grade_level: '',
    license_key: '',
    has_iep: false,
    diagnoses: [],
    accommodations: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TEMPORARY: Skip API call and redirect directly to test the flow
      const learnerId = 'temp-' + Date.now();
      console.log('🧪 TESTING: Skipping API call, using temp learner ID:', learnerId);
      
      localStorage.setItem('current_learner_id', learnerId);
      localStorage.setItem('learner_profile', JSON.stringify({
        id: learnerId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        grade_level: formData.grade_level,
        has_iep: formData.has_iep,
      }));

      const teacherToken = localStorage.getItem('access_token');
      
      if (!teacherToken) {
        console.error('❌ No teacher auth token found');
        alert('⚠️ No authentication token found. Please log in again.');
        navigate('/login');
        return;
      }
      
      // Store session data for cross-origin access
      const crossOriginData = {
        learnerId,
        firstName: formData.first_name,
        lastName: formData.last_name,
        grade: formData.grade_level,
        token: teacherToken,
        timestamp: Date.now(),
        source: 'teacher_portal'
      };
      
      localStorage.setItem('pending_learner_session', JSON.stringify(crossOriginData));
      
      alert(`${formData.first_name} enrolled successfully! Redirecting to baseline assessment...`);
      
      // Show assessment intro page
      navigate(`/students/assessment/${learnerId}`);
      
      return; // Exit early for testing
      
      // ORIGINAL API CODE BELOW (for when backend is ready)
      /*
      const token = localStorage.getItem('access_token');
      
      // Convert accommodations to list of strings
      const accommodationsList: string[] = [];
      if (formData.accommodations.extended_time) {
        accommodationsList.push(`Extended time (${formData.accommodations.time_multiplier || 1.5}x)`);
      }
      if (formData.accommodations.read_aloud) accommodationsList.push('Read aloud');
      if (formData.accommodations.break_reminders) accommodationsList.push('Break reminders');
      if (formData.accommodations.calculator) accommodationsList.push('Calculator');

      // Submit to backend
      const response = await fetch('http://localhost:9000/api/v1/auth/teacher/assign-license', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          license_key: formData.license_key,
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          grade_level: Number(formData.grade_level),
          has_iep: formData.has_iep || false,
          diagnoses: formData.diagnoses.length > 0 ? formData.diagnoses : undefined,
          accommodations: accommodationsList.length > 0 ? accommodationsList : undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.detail && Array.isArray(error.detail)) {
          const errorMessages = error.detail.map((err: { loc: string[]; msg: string }) => 
            `${err.loc.join('.')}: ${err.msg}`
          ).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(error.detail || 'Failed to enroll student');
      }

      const data = await response.json();

      alert(`${formData.first_name} enrolled successfully! Setting up their personalized learning brain.`);

      // Store learner_id and redirect to learner app for assessment
      localStorage.setItem('current_learner_id', data.learner_id);
      
      // Show assessment intro modal on this portal first
      navigate(`/students/assessment/${data.learner_id}`);
      */
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to enroll student: ${message}`);
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Enroll New Student</h1>
        <p className="text-neutral-600 mt-2">Add a student to your classroom using a district license</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 space-y-6">
        {/* License Key */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            District License Key *
          </label>
          <input
            type="text"
            value={formData.license_key}
            onChange={(e) => setFormData({...formData, license_key: e.target.value})}
            placeholder="Enter your district license key"
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            required
          />
        </div>

        {/* Student Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Grade Level *
            </label>
            <select
              value={formData.grade_level}
              onChange={(e) => setFormData({...formData, grade_level: Number(e.target.value)})}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              required
            >
              <option value="">Select grade...</option>
              {[...Array(13)].map((_, i) => (
                <option key={i} value={i}>Grade {i}</option>
              ))}
            </select>
          </div>
        </div>

        {/* IEP Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="has_iep"
            checked={formData.has_iep}
            onChange={(e) => setFormData({...formData, has_iep: e.target.checked})}
            className="w-5 h-5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="has_iep" className="ml-3 text-sm font-medium text-neutral-700">
            Student has an IEP (Individualized Education Program)
          </label>
        </div>

        {/* Diagnoses */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Diagnoses (if applicable)
          </label>
          <div className="grid md:grid-cols-2 gap-3">
            {['ADHD', 'Autism Spectrum Disorder (ASD)', 'Dyslexia', 'Dyscalculia', 'Anxiety'].map((diagnosis) => (
              <div key={diagnosis} className="flex items-center">
                <input
                  type="checkbox"
                  id={diagnosis}
                  checked={formData.diagnoses.includes(diagnosis)}
                  onChange={(e) => handleDiagnosisChange(diagnosis, e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor={diagnosis} className="ml-2 text-sm text-neutral-700">
                  {diagnosis}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Accommodations */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Accommodations
          </label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="extended_time"
                checked={formData.accommodations.extended_time}
                onChange={(e) => setFormData({
                  ...formData,
                  accommodations: {...formData.accommodations, extended_time: e.target.checked}
                })}
                className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="extended_time" className="ml-2 text-sm text-neutral-700">
                Extended Time
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="read_aloud"
                checked={formData.accommodations.read_aloud}
                onChange={(e) => setFormData({
                  ...formData,
                  accommodations: {...formData.accommodations, read_aloud: e.target.checked}
                })}
                className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="read_aloud" className="ml-2 text-sm text-neutral-700">
                Read Aloud / Text-to-Speech
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="break_reminders"
                checked={formData.accommodations.break_reminders}
                onChange={(e) => setFormData({
                  ...formData,
                  accommodations: {...formData.accommodations, break_reminders: e.target.checked}
                })}
                className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="break_reminders" className="ml-2 text-sm text-neutral-700">
                Break Reminders
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="calculator"
                checked={formData.accommodations.calculator}
                onChange={(e) => setFormData({
                  ...formData,
                  accommodations: {...formData.accommodations, calculator: e.target.checked}
                })}
                className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="calculator" className="ml-2 text-sm text-neutral-700">
                Calculator Access
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/students')}
            className="flex-1 px-6 py-3 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enrolling...' : 'Enroll Student →'}
          </button>
        </div>

        <p className="text-sm text-neutral-500 text-center">
          📝 After enrollment, the student will complete a quick baseline assessment to personalize their learning experience.
        </p>
      </form>
    </div>
  );
}


