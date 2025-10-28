import React from 'react';
import { OnboardingChecklist } from '../components/OnboardingChecklist';

export const OnboardingDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Onboarding Checklist Demo</h1>
          <p className="text-lg text-neutral-600">
            Interactive checklist to guide new users through platform setup
          </p>
        </div>

        {/* Onboarding Checklist */}
        <OnboardingChecklist />

        {/* Information Section */}
        <div className="mt-8 p-6 bg-white rounded-xl border-2 border-neutral-200">
          <h2 className="text-xl font-bold mb-4">About This Component</h2>
          
          <div className="space-y-4 text-sm text-neutral-700">
            <div>
              <h3 className="font-semibold mb-2">Features:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>8 predefined onboarding tasks across 4 categories</li>
                <li>Task dependencies (some tasks require others to be completed first)</li>
                <li>Priority levels: Required, Recommended, Optional</li>
                <li>Progress tracking with percentage complete</li>
                <li>Filter by category or completion status</li>
                <li>Local storage persistence (survives page refresh)</li>
                <li>Collapsible interface to save screen space</li>
                <li>Action buttons that link to relevant pages</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Task Categories:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="font-medium">Account:</span> Profile setup, platform tour, mobile app</li>
                <li><span className="font-medium">Security:</span> Two-factor authentication</li>
                <li><span className="font-medium">Content:</span> Add learners, upload IEP documents</li>
                <li><span className="font-medium">Learning:</span> Baseline assessment, first activity</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Usage:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check off tasks as you complete them</li>
                <li>Tasks with dependencies are disabled until prerequisites are met</li>
                <li>Click action buttons to navigate to relevant pages</li>
                <li>Use filters to focus on specific categories</li>
                <li>Progress is saved automatically to localStorage</li>
                <li>Reset button clears all progress for testing</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Integration:</h3>
              <p>
                This component can be added to any dashboard or home page. It automatically tracks
                progress and dismisses when the user chooses. Perfect for parent portals, teacher
                dashboards, or any user-facing application.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-6 p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
          <h2 className="text-xl font-bold mb-4">Technical Details</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold">Component:</span>{' '}
              <code className="bg-purple-100 px-2 py-1 rounded">
                apps/web/src/components/OnboardingChecklist/OnboardingChecklist.tsx
              </code>
            </div>
            
            <div>
              <span className="font-semibold">Types:</span>{' '}
              <code className="bg-purple-100 px-2 py-1 rounded">
                packages/types/src/onboarding.ts
              </code>
            </div>
            
            <div>
              <span className="font-semibold">Storage:</span>{' '}
              <code className="bg-purple-100 px-2 py-1 rounded">
                localStorage['onboarding_progress']
              </code>
            </div>
            
            <div>
              <span className="font-semibold">State Management:</span>{' '}
              useLocalStorage hook for persistent state
            </div>
            
            <div>
              <span className="font-semibold">Styling:</span>{' '}
              Tailwind CSS v4 with responsive design
            </div>
            
            <div>
              <span className="font-semibold">Testing:</span>{' '}
              All interactive elements have data-testid attributes
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="mt-6 p-6 bg-amber-50 rounded-xl border-2 border-amber-200">
          <h2 className="text-xl font-bold mb-4">Testing Instructions</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold">1. Check off tasks in order</span>
              <p className="text-neutral-600 mt-1">
                Notice how dependent tasks become enabled only after prerequisites are completed
              </p>
            </div>
            
            <div>
              <span className="font-semibold">2. Try filtering</span>
              <p className="text-neutral-600 mt-1">
                Click category buttons to see only specific types of tasks
              </p>
            </div>
            
            <div>
              <span className="font-semibold">3. Test persistence</span>
              <p className="text-neutral-600 mt-1">
                Complete some tasks, refresh the page, and verify progress is saved
              </p>
            </div>
            
            <div>
              <span className="font-semibold">4. Complete all tasks</span>
              <p className="text-neutral-600 mt-1">
                Check all tasks and see the completion celebration message
              </p>
            </div>
            
            <div>
              <span className="font-semibold">5. Reset and repeat</span>
              <p className="text-neutral-600 mt-1">
                Use the Reset button to clear progress and test again
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
