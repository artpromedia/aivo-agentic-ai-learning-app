import { useMemo } from 'react';
import type { StepProps } from '../EnrollmentWizard';

export function AccessibilityStep({ data, onUpdate }: StepProps) {
  // Suggested settings based on learning profile
  const suggestedSettings = useMemo(() => {
    const suggestions: { key: string; reason: string }[] = [];
    
    if (data.diagnoses?.includes('Dyslexia')) {
      suggestions.push(
        { key: 'dyslexiaFont', reason: 'Dyslexia-friendly font for easier reading' },
        { key: 'textToSpeech', reason: 'Audio support for reading comprehension' }
      );
    }
    
    if (data.diagnoses?.includes('ADHD')) {
      suggestions.push(
        { key: 'calmMode', reason: 'Reduced visual stimulation for better focus' },
        { key: 'reducedMotion', reason: 'Minimize distracting animations' }
      );
    }
    
    if (data.diagnoses?.includes('Autism Spectrum Disorder (ASD)')) {
      suggestions.push(
        { key: 'calmMode', reason: 'Sensory-friendly interface' },
        { key: 'reducedMotion', reason: 'Predictable, calm visual experience' }
      );
    }
    
    if (data.diagnoses?.includes('Visual Processing Disorder')) {
      suggestions.push(
        { key: 'largeText', reason: 'Larger text for easier reading' },
        { key: 'highContrast', reason: 'Better visual clarity' }
      );
    }
    
    return suggestions;
  }, [data.diagnoses]);

  const applySuggested = () => {
    const prefs = data.accessibilityPrefs || {
      textToSpeech: true,
      voiceInput: false,
      largeText: false,
      highContrast: false,
      reducedMotion: false,
      calmMode: false,
      dyslexiaFont: false,
    };
    
    const updates = { ...prefs };
    suggestedSettings.forEach(({ key }) => {
      updates[key as keyof typeof prefs] = true;
    });
    onUpdate({ accessibilityPrefs: updates });
  };

  const accessibilityOptions = [
    {
      key: 'textToSpeech' as const,
      label: 'Text-to-Speech',
      description: 'Read content aloud automatically',
      icon: '🔊',
      recommended: true,
    },
    {
      key: 'voiceInput' as const,
      label: 'Voice Input',
      description: 'Answer questions by speaking',
      icon: '🎤',
    },
    {
      key: 'largeText' as const,
      label: 'Large Text',
      description: 'Increase font size throughout',
      icon: '🔍',
    },
    {
      key: 'highContrast' as const,
      label: 'High Contrast',
      description: 'Stronger colors for better visibility',
      icon: '🌓',
    },
    {
      key: 'reducedMotion' as const,
      label: 'Reduced Motion',
      description: 'Minimize animations and transitions',
      icon: '⏸️',
    },
    {
      key: 'calmMode' as const,
      label: 'Calm Mode',
      description: 'Reduce visual distractions',
      icon: '🧘',
    },
    {
      key: 'dyslexiaFont' as const,
      label: 'Dyslexia-Friendly Font',
      description: 'Use OpenDyslexic font',
      icon: '📝',
    },
  ];

  const toggleOption = (key: 'textToSpeech' | 'voiceInput' | 'largeText' | 'highContrast' | 'reducedMotion' | 'calmMode' | 'dyslexiaFont') => {
    const prefs = data.accessibilityPrefs || {
      textToSpeech: true,
      voiceInput: false,
      largeText: false,
      highContrast: false,
      reducedMotion: false,
      calmMode: false,
      dyslexiaFont: false,
    };
    onUpdate({
      accessibilityPrefs: {
        ...prefs,
        [key]: !prefs[key],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Suggested Settings Alert */}
      {suggestedSettings.length > 0 && (
        <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✨</span>
            <div className="flex-1">
              <p className="font-bold text-blue-900 mb-2">
                Recommended Settings Based on Learning Profile
              </p>
              <ul className="text-sm text-blue-800 space-y-1 mb-3">
                {suggestedSettings.map((setting) => (
                  <li key={setting.key} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      <strong className="capitalize">
                        {setting.key.replace(/([A-Z])/g, ' $1').trim()}:
                      </strong>{' '}
                      {setting.reason}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={applySuggested}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                Apply All Recommended Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Options */}
      <div className="space-y-3">
        {accessibilityOptions.map((option) => (
          <label
            key={option.key}
            className={`relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
              data.accessibilityPrefs?.[option.key]
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
            }`}
          >
            {option.recommended && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  RECOMMENDED
                </span>
              </div>
            )}
            
            <input
              type="checkbox"
              checked={data.accessibilityPrefs?.[option.key] || false}
              onChange={() => toggleOption(option.key)}
              className="w-6 h-6 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 mt-1"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{option.icon}</span>
                <span className="font-bold text-neutral-900">{option.label}</span>
              </div>
              <p className="text-sm text-neutral-600">{option.description}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Selected Count */}
      <div className="text-center p-4 bg-neutral-100 rounded-lg">
        <p className="text-sm text-neutral-700">
          <strong>
            {Object.values(data.accessibilityPrefs || {}).filter(Boolean).length}
          </strong>{' '}
          of {accessibilityOptions.length} accessibility features enabled
        </p>
      </div>

      {/* Help Text */}
      <div className="text-center text-xs text-neutral-500">
        💡 These preferences will be applied immediately to the learner's account
      </div>
    </div>
  );
}
