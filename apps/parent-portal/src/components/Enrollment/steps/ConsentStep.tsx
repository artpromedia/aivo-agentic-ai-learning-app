import type { StepProps } from '../EnrollmentWizard';

export function ConsentStep({ data, onUpdate, errors }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 p-6">
        <h3 className="text-xl font-bold text-neutral-900 mb-3 flex items-center gap-2">
          <span>📋</span> Enrollment Summary
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-700 w-32">Learner:</span>
            <span className="text-neutral-900">
              {data.firstName} {data.lastName}
              {data.preferredName && ` (${data.preferredName})`}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-700 w-32">Grade:</span>
            <span className="text-neutral-900">{data.grade}</span>
          </div>
          
          {data.diagnoses && data.diagnoses.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="font-semibold text-neutral-700 w-32">Diagnoses:</span>
              <span className="text-neutral-900">{data.diagnoses.length} selected</span>
            </div>
          )}
          
          {data.accommodations && data.accommodations.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="font-semibold text-neutral-700 w-32">Accommodations:</span>
              <span className="text-neutral-900">{data.accommodations.length} selected</span>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <span className="font-semibold text-neutral-700 w-32">Accessibility:</span>
            <span className="text-neutral-900">
              {Object.values(data.accessibilityPrefs || {}).filter(Boolean).length} features enabled
            </span>
          </div>
          
          {data.hasIEP !== undefined && (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-neutral-700 w-32">IEP:</span>
              <span className="text-neutral-900">{data.hasIEP ? 'Yes' : 'No'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-neutral-800">Required Consents</h3>
        
        {/* Parental Consent */}
        <label
          className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
            data.parentConsent
              ? 'border-green-500 bg-green-50'
              : errors.parentConsent
              ? 'border-red-500 bg-red-50'
              : 'border-neutral-300 hover:border-neutral-400'
          }`}
        >
          <input
            type="checkbox"
            checked={data.parentConsent || false}
            onChange={(e) => onUpdate({ parentConsent: e.target.checked })}
            className="w-6 h-6 text-green-600 rounded focus:ring-2 focus:ring-green-500 mt-1"
          />
          <div className="flex-1">
            <div className="font-bold text-neutral-900 mb-2">
              Parental Consent <span className="text-red-500">*</span>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              I certify that I am the parent or legal guardian of the learner named above. 
              I give permission for them to use the Aivo Learning platform and understand that 
              their learning activities will be monitored to provide personalized education.
            </p>
            {errors.parentConsent && (
              <p className="text-sm text-red-600 mt-2 font-semibold">
                ⚠️ {errors.parentConsent}
              </p>
            )}
          </div>
        </label>

        {/* Data Processing Consent */}
        <label
          className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
            data.dataProcessingConsent
              ? 'border-green-500 bg-green-50'
              : errors.dataProcessingConsent
              ? 'border-red-500 bg-red-50'
              : 'border-neutral-300 hover:border-neutral-400'
          }`}
        >
          <input
            type="checkbox"
            checked={data.dataProcessingConsent || false}
            onChange={(e) => onUpdate({ dataProcessingConsent: e.target.checked })}
            className="w-6 h-6 text-green-600 rounded focus:ring-2 focus:ring-green-500 mt-1"
          />
          <div className="flex-1">
            <div className="font-bold text-neutral-900 mb-2">
              Data Processing Consent <span className="text-red-500">*</span>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              I consent to Aivo Learning securely collecting and processing educational data 
              to provide personalized AI-driven instruction. All data is encrypted, 
              COPPA/FERPA compliant, and will never be sold to third parties.
            </p>
            {errors.dataProcessingConsent && (
              <p className="text-sm text-red-600 mt-2 font-semibold">
                ⚠️ {errors.dataProcessingConsent}
              </p>
            )}
          </div>
        </label>

        {/* Assessment Consent */}
        <label
          className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
            data.assessmentConsent
              ? 'border-green-500 bg-green-50'
              : errors.assessmentConsent
              ? 'border-red-500 bg-red-50'
              : 'border-neutral-300 hover:border-neutral-400'
          }`}
        >
          <input
            type="checkbox"
            checked={data.assessmentConsent || false}
            onChange={(e) => onUpdate({ assessmentConsent: e.target.checked })}
            className="w-6 h-6 text-green-600 rounded focus:ring-2 focus:ring-green-500 mt-1"
          />
          <div className="flex-1">
            <div className="font-bold text-neutral-900 mb-2">
              Baseline Assessment Consent <span className="text-red-500">*</span>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              I consent to my child completing an initial baseline assessment to determine 
              their current skill level. This assessment is used to create a personalized 
              learning path and will take approximately 15-20 minutes.
            </p>
            {errors.assessmentConsent && (
              <p className="text-sm text-red-600 mt-2 font-semibold">
                ⚠️ {errors.assessmentConsent}
              </p>
            )}
          </div>
        </label>
      </div>

      {/* Legal Footer */}
      <div className="rounded-lg bg-neutral-100 border border-neutral-300 p-4">
        <p className="text-xs text-neutral-600 leading-relaxed">
          By completing this enrollment, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:underline font-semibold">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:underline font-semibold">
            Privacy Policy
          </a>
          . You can review and update your consent preferences at any time from your account settings.
        </p>
      </div>

      {/* Success Preview */}
      {data.parentConsent && data.dataProcessingConsent && data.assessmentConsent && (
        <div className="rounded-xl bg-green-50 border-2 border-green-200 p-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎉</span>
            <div>
              <h4 className="font-bold text-green-900 text-lg mb-1">
                Ready to Complete Enrollment!
              </h4>
              <p className="text-sm text-green-800">
                Click "Complete Enrollment" below to create {data.firstName}'s account and 
                start their personalized learning journey.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
