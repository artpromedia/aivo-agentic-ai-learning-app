import { useState } from 'react';
import type { StepProps } from '../EnrollmentWizard';

export function IEPStep({ data, onUpdate }: StepProps) {
  const [customGoal, setCustomGoal] = useState('');

  const addGoal = () => {
    if (customGoal.trim()) {
      const current = data.iepDetails?.goals || [];
      onUpdate({
        iepDetails: {
          ...data.iepDetails!,
          goals: [...current, customGoal.trim()],
        },
      });
      setCustomGoal('');
    }
  };

  const removeGoal = (index: number) => {
    const current = data.iepDetails?.goals || [];
    onUpdate({
      iepDetails: {
        ...data.iepDetails!,
        goals: current.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* IEP Question */}
      <div className="space-y-4">
        <label className="block text-lg font-bold text-neutral-800">
          Does the learner have an Individualized Education Program (IEP)?
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          <label
            className={`flex items-center justify-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${
              data.hasIEP === true
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-neutral-300 hover:border-neutral-400'
            }`}
          >
            <input
              type="radio"
              name="hasIEP"
              checked={data.hasIEP === true}
              onChange={() => onUpdate({ hasIEP: true })}
              className="w-5 h-5 text-blue-600"
            />
            <div className="text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-bold">Yes, they have an IEP</div>
            </div>
          </label>

          <label
            className={`flex items-center justify-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all ${
              data.hasIEP === false
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-neutral-300 hover:border-neutral-400'
            }`}
          >
            <input
              type="radio"
              name="hasIEP"
              checked={data.hasIEP === false}
              onChange={() => onUpdate({ hasIEP: false })}
              className="w-5 h-5 text-blue-600"
            />
            <div className="text-center">
              <div className="text-3xl mb-2">❌</div>
              <div className="font-bold">No IEP</div>
            </div>
          </label>
        </div>
      </div>

      {/* IEP Details (shown only if hasIEP is true) */}
      {data.hasIEP && (
        <div className="space-y-6 mt-6 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
            <span>📋</span> IEP Details
          </h3>

          {/* Case Manager */}
          <div className="space-y-2">
            <label htmlFor="caseManager" className="block text-sm font-semibold text-neutral-700">
              Case Manager Name (Optional)
            </label>
            <input
              id="caseManager"
              type="text"
              value={data.iepDetails?.caseManager || ''}
              onChange={(e) =>
                onUpdate({
                  iepDetails: {
                    ...data.iepDetails!,
                    caseManager: e.target.value,
                  },
                })
              }
              placeholder="Enter case manager's name"
              className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Review Date */}
          <div className="space-y-2">
            <label htmlFor="reviewDate" className="block text-sm font-semibold text-neutral-700">
              Next IEP Review Date (Optional)
            </label>
            <input
              id="reviewDate"
              type="date"
              value={data.iepDetails?.reviewDate || ''}
              onChange={(e) =>
                onUpdate({
                  iepDetails: {
                    ...data.iepDetails!,
                    reviewDate: e.target.value,
                  },
                })
              }
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* IEP Goals */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-neutral-700">
              IEP Goals (Optional)
            </label>
            <p className="text-xs text-neutral-600">
              Add specific learning goals from the IEP
            </p>

            {/* Goal List */}
            {(data.iepDetails?.goals || []).length > 0 && (
              <ul className="space-y-2 mb-3">
                {data.iepDetails!.goals!.map((goal, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-neutral-300"
                  >
                    <span className="text-blue-600 font-bold">{index + 1}.</span>
                    <span className="flex-1 text-sm">{goal}</span>
                    <button
                      onClick={() => removeGoal(index)}
                      className="text-red-600 hover:bg-red-100 rounded p-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add Goal */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add IEP goal..."
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addGoal}
                disabled={!customGoal.trim()}
                className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-lg bg-neutral-100 border border-neutral-300 p-4">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-neutral-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-neutral-700">
            <strong>Privacy Note:</strong> IEP information is securely stored and only accessible to authorized personnel. 
            This helps our AI adapt instruction to meet specific goals.
          </div>
        </div>
      </div>
    </div>
  );
}
