/**
 * Signup Choice Page
 * 
 * Allows users to choose between Parent and Teacher signup flows
 * 
 * Created: 2025-10-24
 */

import { Link } from 'react-router-dom';
import { Users, GraduationCap, ArrowRight } from 'lucide-react';

export function SignupChoicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Get Started with AIVO
          </h1>
          <p className="text-xl text-gray-600">
            Choose how you'd like to sign up
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Parent Card */}
          <Link
            to="/signup/parent"
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-purple-600" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                I'm a Parent
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                Sign up to add your child and provide personalized AI-powered learning support at home
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6 text-left w-full">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>Add and manage your children's profiles</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>Track progress and learning milestones</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>Get personalized AI tutoring for each child</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-purple-600 mr-2">✓</span>
                  <span>Free baseline assessment included</span>
                </li>
              </ul>

              {/* Button */}
              <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-4 transition-all">
                Continue as Parent
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Teacher Card */}
          <Link
            to="/signup/teacher"
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-10 h-10 text-blue-600" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                I'm a Teacher
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                Sign up with your district license to enroll students and manage classroom learning
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6 text-left w-full">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Verify with district license code</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Enroll and manage multiple students</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Access classroom analytics and insights</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>IEP management tools included</span>
                </li>
              </ul>

              {/* Button */}
              <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
                Continue as Teacher
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Login Link */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
