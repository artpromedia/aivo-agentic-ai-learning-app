/**
 * Accessibility Control Panel
 * Allows learners to customize their assessment experience
 */
import { Eye, Heart, Palette, Settings, Timer, Type, Volume2, VolumeX } from 'lucide-react';
import type { AccessibilityPreferences } from '../../types/accessibility';

interface AccessibilityPanelProps {
  preferences: AccessibilityPreferences;
  onPreferencesChange: (prefs: AccessibilityPreferences) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function AccessibilityPanel({
  preferences,
  onPreferencesChange,
  isOpen,
  onToggle
}: AccessibilityPanelProps) {
  const updatePref = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => {
    onPreferencesChange({ ...preferences, [key]: value });
    localStorage.setItem('accessibility_prefs', JSON.stringify({ ...preferences, [key]: value }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all"
        aria-label="Open accessibility settings"
      >
        <Settings className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 z-50 w-96 h-full bg-white shadow-2xl overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Settings</h2>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <Type className="w-5 h-5" />
            Text Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['small', 'medium', 'large', 'xlarge'] as const).map(size => (
              <button
                key={size}
                onClick={() => updatePref('fontSize', size)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  preferences.fontSize === size
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`font-semibold ${
                  size === 'small' ? 'text-xs' :
                  size === 'medium' ? 'text-sm' :
                  size === 'large' ? 'text-base' : 'text-lg'
                }`}>
                  Aa
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <Type className="w-5 h-5" />
            Font Style
          </label>
          <select
            value={preferences.fontFamily}
            onChange={(e) => updatePref('fontFamily', e.target.value as any)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
          >
            <option value="default">Regular Font</option>
            <option value="dyslexic">Dyslexia-Friendly</option>
            <option value="comic">Fun & Easy</option>
          </select>
        </div>

        {/* Color Scheme */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            <Palette className="w-5 h-5" />
            Colors
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'calm-blue', label: 'Calm Blue', bg: 'bg-blue-100' },
              { value: 'soft-green', label: 'Soft Green', bg: 'bg-green-100' },
              { value: 'warm-purple', label: 'Warm Purple', bg: 'bg-purple-100' },
              { value: 'neutral-gray', label: 'Neutral Gray', bg: 'bg-gray-100' }
            ].map(scheme => (
              <button
                key={scheme.value}
                onClick={() => updatePref('colorScheme', scheme.value as any)}
                className={`p-4 rounded-lg border-2 transition-all ${scheme.bg} ${
                  preferences.colorScheme === scheme.value
                    ? 'border-purple-600 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">{scheme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text to Speech */}
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold text-gray-700">
              {preferences.textToSpeech ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              Read Questions Aloud
            </span>
            <button
              onClick={() => updatePref('textToSpeech', !preferences.textToSpeech)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                preferences.textToSpeech ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  preferences.textToSpeech ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </label>
          {preferences.textToSpeech && (
            <div className="pl-7 space-y-2">
              <label className="text-sm text-gray-600">Voice Speed</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={preferences.ttsSpeed}
                onChange={(e) => updatePref('ttsSpeed', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Slower</span>
                <span>{preferences.ttsSpeed}x</span>
                <span>Faster</span>
              </div>
            </div>
          )}
        </div>

        {/* High Contrast */}
        <label className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-gray-700">
            <Eye className="w-5 h-5" />
            High Contrast
          </span>
          <button
            onClick={() => updatePref('highContrast', !preferences.highContrast)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              preferences.highContrast ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                preferences.highContrast ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </label>

        {/* Reduce Animations */}
        <label className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-gray-700">
            <Heart className="w-5 h-5" />
            Less Movement
          </span>
          <button
            onClick={() => updatePref('reduceAnimations', !preferences.reduceAnimations)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              preferences.reduceAnimations ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                preferences.reduceAnimations ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </label>

        {/* Show Timer */}
        <label className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-gray-700">
            <Timer className="w-5 h-5" />
            Show Timer
          </span>
          <button
            onClick={() => updatePref('showTimer', !preferences.showTimer)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              preferences.showTimer ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                preferences.showTimer ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </label>

        {/* Break Reminders */}
        <label className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-gray-700">
            Break Reminders
          </span>
          <button
            onClick={() => updatePref('breakReminders', !preferences.breakReminders)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              preferences.breakReminders ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                preferences.breakReminders ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </label>
      </div>
    </div>
  );
}
