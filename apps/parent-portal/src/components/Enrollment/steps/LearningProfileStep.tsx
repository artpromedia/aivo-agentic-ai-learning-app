import { useState } from 'react';
import type { StepProps } from '../EnrollmentWizard';

export function LearningProfileStep({ data, onUpdate }: StepProps) {
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [customAccommodation, setCustomAccommodation] = useState('');

  const diagnosisOptions = [
    'ADHD',
    'Autism Spectrum Disorder (ASD)',
    'Dyslexia',
    'Dyscalculia',
    'Dysgraphia',
    'Auditory Processing Disorder',
    'Visual Processing Disorder',
    'Anxiety',
    'Other Learning Disability',
  ];

  const accommodationOptions = [
    'Extended time on tests',
    'Frequent breaks',
    'Preferential seating',
    'Read-aloud support',
    'Reduced distractions',
    'Visual supports',
    'Chunked instructions',
    'Alternative assessments',
    'Text-to-speech',
    'Speech-to-text',
  ];

  const toggleDiagnosis = (diagnosis: string) => {
    const current = data.diagnoses || [];
    const updated = current.includes(diagnosis)
      ? current.filter((d) => d !== diagnosis)
      : [...current, diagnosis];
    onUpdate({ diagnoses: updated });
  };

  const addCustomDiagnosis = () => {
    if (customDiagnosis.trim()) {
      const current = data.diagnoses || [];
      onUpdate({ diagnoses: [...current, customDiagnosis.trim()] });
      setCustomDiagnosis('');
    }
  };

  const removeDiagnosis = (diagnosis: string) => {
    const current = data.diagnoses || [];
    onUpdate({ diagnoses: current.filter((d) => d !== diagnosis) });
  };

  const toggleAccommodation = (accommodation: string) => {
    const current = data.accommodations || [];
    const updated = current.includes(accommodation)
      ? current.filter((a) => a !== accommodation)
      : [...current, accommodation];
    onUpdate({ accommodations: updated });
  };

  const addCustomAccommodation = () => {
    if (customAccommodation.trim()) {
      const current = data.accommodations || [];
      onUpdate({ accommodations: [...current, customAccommodation.trim()] });
      setCustomAccommodation('');
    }
  };

  const removeAccommodation = (accommodation: string) => {
    const current = data.accommodations || [];
    onUpdate({ accommodations: current.filter((a) => a !== accommodation) });
  };

  return (
    <div className="space-y-8">
      {/* Privacy Alert */}
      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="text-sm text-green-800">
            <strong>Privacy Protected:</strong> This information is optional and helps us provide better support. All data is encrypted and HIPAA-compliant.
          </div>
        </div>
      </div>

      {/* Diagnoses */}
      <div className="space-y-4">
        <div>
          <label className="block text-base font-bold text-neutral-800 mb-1">
            Diagnoses or Learning Differences (Optional)
          </label>
          <p className="text-sm text-neutral-600">
            Select all that apply. This helps us adapt content and pacing.
          </p>
        </div>
        
        <div className="grid gap-3 md:grid-cols-2">
          {diagnosisOptions.map((diagnosis) => (
            <label
              key={diagnosis}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                (data.diagnoses || []).includes(diagnosis)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
              }`}
            >
              <input
                type="checkbox"
                checked={(data.diagnoses || []).includes(diagnosis)}
                onChange={() => toggleDiagnosis(diagnosis)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm font-medium">{diagnosis}</span>
            </label>
          ))}
        </div>

        {/* Custom Diagnosis */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom diagnosis..."
            value={customDiagnosis}
            onChange={(e) => setCustomDiagnosis(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomDiagnosis()}
            className="flex-1 px-4 py-3 rounded-lg border-2 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={addCustomDiagnosis}
            disabled={!customDiagnosis.trim()}
            className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Selected Diagnoses */}
        {(data.diagnoses || []).length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-neutral-50 rounded-lg">
            {data.diagnoses!.map((diagnosis) => (
              <span
                key={diagnosis}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
              >
                {diagnosis}
                <button
                  onClick={() => removeDiagnosis(diagnosis)}
                  className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Accommodations */}
      <div className="space-y-4">
        <div>
          <label className="block text-base font-bold text-neutral-800 mb-1">
            Accommodations & Supports (Optional)
          </label>
          <p className="text-sm text-neutral-600">
            Select strategies that help the learner succeed.
          </p>
        </div>
        
        <div className="grid gap-3 md:grid-cols-2">
          {accommodationOptions.map((accommodation) => (
            <label
              key={accommodation}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                (data.accommodations || []).includes(accommodation)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
              }`}
            >
              <input
                type="checkbox"
                checked={(data.accommodations || []).includes(accommodation)}
                onChange={() => toggleAccommodation(accommodation)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">{accommodation}</span>
            </label>
          ))}
        </div>

        {/* Custom Accommodation */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom accommodation..."
            value={customAccommodation}
            onChange={(e) => setCustomAccommodation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomAccommodation()}
            className="flex-1 px-4 py-3 rounded-lg border-2 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addCustomAccommodation}
            disabled={!customAccommodation.trim()}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Selected Accommodations */}
        {(data.accommodations || []).length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 bg-neutral-50 rounded-lg">
            {data.accommodations!.map((accommodation) => (
              <span
                key={accommodation}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {accommodation}
                <button
                  onClick={() => removeAccommodation(accommodation)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Learning Strengths */}
      <div className="space-y-2">
        <label htmlFor="strengths" className="block text-base font-bold text-neutral-800">
          Learning Strengths (Optional)
        </label>
        <p className="text-sm text-neutral-600 mb-2">
          What are they good at? E.g., visual learning, creative problem-solving, strong memory
        </p>
        <textarea
          id="strengths"
          placeholder="Describe their learning strengths..."
          value={(data.learningStrengths || []).join(', ')}
          onChange={(e) =>
            onUpdate({
              learningStrengths: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
          rows={3}
          className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {/* Learning Challenges */}
      <div className="space-y-2">
        <label htmlFor="challenges" className="block text-base font-bold text-neutral-800">
          Learning Challenges (Optional)
        </label>
        <p className="text-sm text-neutral-600 mb-2">
          What do they struggle with? E.g., reading comprehension, staying focused, test anxiety
        </p>
        <textarea
          id="challenges"
          placeholder="Describe their learning challenges..."
          value={(data.learningChallenges || []).join(', ')}
          onChange={(e) =>
            onUpdate({
              learningChallenges: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
          rows={3}
          className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </div>
    </div>
  );
}
