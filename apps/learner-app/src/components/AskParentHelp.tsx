import { Heart, Sparkles, User } from 'lucide-react';
import { useState } from 'react';
import { RoleSelection } from './RoleSelection';

/**
 * Beautiful UI component shown when learner needs parent help to get started
 */
export function AskParentHelp() {
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-4">
      {/* Role Selection Modal */}
      {showRoleSelection && (
        <RoleSelection onClose={() => setShowRoleSelection(false)} />
      )}

      <div className="max-w-2xl w-full">
        {/* Floating animated sparkles */}
        <div className="relative">
          <div className="absolute -top-8 left-1/4 animate-bounce">
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>
          <div className="absolute -top-4 right-1/4 animate-bounce delay-100">
            <Sparkles className="w-6 h-6 text-pink-300" />
          </div>
          <div className="absolute top-0 right-1/3 animate-bounce delay-200">
            <Sparkles className="w-7 h-7 text-blue-300" />
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center transform transition-all hover:scale-105">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-6">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Hi There! 👋
          </h1>

          {/* Message */}
          <div className="space-y-4 mb-8">
            <p className="text-xl md:text-2xl text-gray-700 font-medium">
              Let's get you started with learning!
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Heart className="w-8 h-8 text-pink-500 animate-pulse" />
                <p className="text-2xl font-bold text-gray-800">
                  Ask a Parent or Teacher for Help
                </p>
                <Heart className="w-8 h-8 text-pink-500 animate-pulse" />
              </div>
              <p className="text-lg text-gray-600">
                Your parent, guardian, or teacher needs to set up your account first
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => setShowRoleSelection(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl py-4 px-8 rounded-2xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
            >
              <User className="w-6 h-6" />
              Sign In (Parent/Teacher)
            </button>

            <button
              onClick={() => setShowRoleSelection(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-xl py-4 px-8 rounded-2xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Create Account
            </button>
          </div>

          {/* Footer message */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <p className="text-gray-500 text-sm md:text-base flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              We can't wait to start learning with you!
              <Sparkles className="w-4 h-4" />
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="mt-8 flex justify-center gap-4">
          <div className="w-16 h-16 bg-purple-300 rounded-full opacity-50 animate-bounce"></div>
          <div className="w-12 h-12 bg-pink-300 rounded-full opacity-50 animate-bounce delay-100"></div>
          <div className="w-20 h-20 bg-blue-300 rounded-full opacity-50 animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
}
