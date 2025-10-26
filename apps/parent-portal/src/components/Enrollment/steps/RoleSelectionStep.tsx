/**
 * Role Selection Step
 * First step in onboarding - choose between Parent or Teacher enrollment
 */
import { UserCircle, GraduationCap } from 'lucide-react';

interface RoleSelectionStepProps {
  onSelectRole: (role: 'parent' | 'teacher') => void;
}

export function RoleSelectionStep({ onSelectRole }: RoleSelectionStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to Aivo Learning
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Let's get started! First, tell us a bit about yourself.
        </p>
      </div>

      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Parent Option */}
        <button
          onClick={() => onSelectRole('parent')}
          className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-8 text-left transition-all hover:border-purple-500 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <UserCircle className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              I'm a Parent
            </h3>
            
            <p className="text-gray-600 mb-4">
              Enrolling my child with a purchased individual license
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                <span>Complete child profile</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                <span>Add IEP & accommodations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">✓</span>
                <span>Purchase license during setup</span>
              </div>
            </div>

            <div className="mt-6 flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
              Get Started
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Teacher Option */}
        <button
          onClick={() => onSelectRole('teacher')}
          className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-8 text-left transition-all hover:border-blue-500 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              I'm a Teacher
            </h3>
            
            <p className="text-gray-600 mb-4">
              Enrolling a student with a district bulk license
            </p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Enter district license code</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Quick student setup</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>License provided by school</span>
              </div>
            </div>

            <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
              Get Started
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Not sure which to choose?{' '}
          <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
            Learn more about our enrollment options
          </a>
        </p>
      </div>
    </div>
  );
}
