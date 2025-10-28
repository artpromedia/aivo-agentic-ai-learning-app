import { ArrowLeft, GraduationCap, User } from 'lucide-react';
import { useState } from 'react';

interface RoleSelectionProps {
  onClose: () => void;
}

export function RoleSelection({ onClose }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<'parent' | 'teacher' | null>(null);

  const handleRoleSelect = (role: 'parent' | 'teacher') => {
    setSelectedRole(role);
  };

  const handleSignIn = () => {
    if (!selectedRole) return;
    // Redirect to the appropriate portal login page
    const portalUrl = selectedRole === 'parent' ? 'http://localhost:3001' : 'http://localhost:3002';
    window.open(portalUrl, '_blank');
  };

  const handleCreateAccount = () => {
    if (!selectedRole) return;
    
    if (selectedRole === 'teacher') {
      // Teachers have district license, go directly to teacher portal
      window.open('http://localhost:3002', '_blank');
    } else {
      // Parents need to create account - redirect to parent registration/onboarding
      // Assuming parent portal has a /register or /signup route
      window.open('http://localhost:3001/register', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full transform transition-all animate-slideUp">
        {/* Back button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Welcome! 👋
          </h2>
          <p className="text-lg text-gray-600">
            Please select your role to continue
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Parent Card */}
          <button
            onClick={() => handleRoleSelect('parent')}
            className={`relative p-8 rounded-2xl border-4 transition-all transform hover:scale-105 ${
              selectedRole === 'parent'
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                : 'border-gray-200 hover:border-purple-300 bg-white'
            }`}
          >
            {selectedRole === 'parent' && (
              <div className="absolute -top-3 -right-3 bg-purple-500 text-white rounded-full p-2 shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full ${
                selectedRole === 'parent' 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-br from-purple-400 to-pink-400'
              }`}>
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Parent</h3>
                <p className="text-gray-600 text-sm">
                  Manage your child's learning journey
                </p>
              </div>
            </div>
          </button>

          {/* Teacher Card */}
          <button
            onClick={() => handleRoleSelect('teacher')}
            className={`relative p-8 rounded-2xl border-4 transition-all transform hover:scale-105 ${
              selectedRole === 'teacher'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300 bg-white'
            }`}
          >
            {selectedRole === 'teacher' && (
              <div className="absolute -top-3 -right-3 bg-blue-500 text-white rounded-full p-2 shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full ${
                selectedRole === 'teacher' 
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                  : 'bg-gradient-to-br from-blue-400 to-cyan-400'
              }`}>
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Teacher</h3>
                <p className="text-gray-600 text-sm">
                  Support students in their learning
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        {selectedRole && (
          <div className="space-y-4 animate-fadeIn">
            <button
              onClick={handleSignIn}
              className={`w-full font-bold text-xl py-4 px-8 rounded-2xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 ${
                selectedRole === 'parent'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
              }`}
            >
              <User className="w-6 h-6" />
              Sign In
            </button>

            <button
              onClick={handleCreateAccount}
              className={`w-full font-bold text-xl py-4 px-8 rounded-2xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 ${
                selectedRole === 'parent'
                  ? 'bg-white border-4 border-purple-500 text-purple-600 hover:bg-purple-50'
                  : 'bg-white border-4 border-blue-500 text-blue-600 hover:bg-blue-50'
              }`}
            >
              <GraduationCap className="w-6 h-6" />
              {selectedRole === 'teacher' ? 'Go to Teacher Portal' : 'Create Account'}
            </button>
          </div>
        )}

        {!selectedRole && (
          <div className="text-center text-gray-500 animate-pulse">
            👆 Please select a role above to continue
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
