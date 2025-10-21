/**
 * Sensory Profile Setup Component
 * Allows learners to choose accommodations from presets or customize their own
 */

import { useState, type FC } from 'react';
import { sensoryProfileService } from '@aivo/utils';
import type { SensoryProfile } from '@aivo/types';
import { Button, Card } from '@aivo/ui';

interface SensoryProfileSetupProps {
  learnerId: string;
  onComplete: (profile: SensoryProfile) => void;
}

export const SensoryProfileSetup: FC<SensoryProfileSetupProps> = ({ learnerId, onComplete }) => {
  const [step, setStep] = useState<'presets' | 'customize'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [profile, setProfile] = useState<SensoryProfile | null>(null);

  const presets = sensoryProfileService.getPresets();

  const handlePresetSelect = (presetId: string) => {
    const newProfile = sensoryProfileService.createFromPreset(learnerId, presetId);
    setProfile(newProfile);
    setSelectedPreset(presetId);
  };

  const handleCustomize = () => {
    if (selectedPreset && profile) {
      setStep('customize');
    } else {
      // Create blank profile
      const blank = sensoryProfileService.createFromPreset(learnerId, 'asd-low-sensory');
      setProfile(blank);
      setStep('customize');
    }
  };

  const handleSave = () => {
    if (profile) {
      sensoryProfileService.saveProfile(profile);
      sensoryProfileService.applyProfile(profile);
      onComplete(profile);
    }
  };

  if (step === 'customize' && profile) {
    return (
      <SensoryProfileCustomizer
        profile={profile}
        onChange={setProfile}
        onSave={handleSave}
        onBack={() => setStep('presets')}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" data-testid="sensory-profile-setup">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">🎨 Sensory Profile Setup</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Choose settings that help you learn comfortably. You can change these anytime.
        </p>
      </div>

      {/* Presets */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className={`
              cursor-pointer transition-all hover:shadow-lg rounded-xl p-6 border-2
              ${
                selectedPreset === preset.id
                  ? 'ring-4 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
              }
            `}
            onClick={() => handlePresetSelect(preset.id)}
            data-testid={`preset-${preset.id}`}
          >
            <div className="text-center">
              <div className="text-5xl mb-3">{preset.icon}</div>
              <h3 className="font-bold text-lg mb-2 dark:text-white">{preset.name}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                {preset.description}
              </p>

              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                <div className="font-medium mb-1">Recommended for:</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {preset.recommendedFor.map((condition) => (
                    <span
                      key={condition}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={handleCustomize} data-testid="customize-button">
          ⚙️ Customize Settings
        </Button>

        {selectedPreset && (
          <Button variant="primary" size="lg" onClick={handleSave} data-testid="use-preset">
            ✓ Use This Profile
          </Button>
        )}
      </div>

      {/* Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm dark:text-neutral-300">
            <p className="font-semibold mb-2">What is a Sensory Profile?</p>
            <p className="text-neutral-700 dark:text-neutral-400">
              Everyone learns differently! A sensory profile helps us adjust the app to match how
              your brain works best. You can try different profiles and change them whenever you
              want.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Customizer Component
interface SensoryProfileCustomizerProps {
  profile: SensoryProfile;
  onChange: (profile: SensoryProfile) => void;
  onSave: () => void;
  onBack: () => void;
}

const SensoryProfileCustomizer: FC<SensoryProfileCustomizerProps> = ({
  profile,
  onChange,
  onSave,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'auditory' | 'motor' | 'cognitive'>(
    'visual'
  );

  const updateProfile = <K extends keyof SensoryProfile>(
    category: K,
    updates: Partial<SensoryProfile[K]>
  ) => {
    onChange({
      ...profile,
      [category]: {
        ...(profile[category] as object),
        ...updates,
      } as SensoryProfile[K],
    });
  };

  const tabs = [
    { id: 'visual' as const, label: 'Visual', icon: '👁️' },
    { id: 'auditory' as const, label: 'Sound', icon: '🔊' },
    { id: 'motor' as const, label: 'Touch', icon: '👆' },
    { id: 'cognitive' as const, label: 'Focus', icon: '🧠' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" data-testid="sensory-customizer">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Customize Your Sensory Profile</h1>
        <Button variant="outline" onClick={onBack}>
          ← Back to Presets
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b dark:border-neutral-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-3 font-medium transition border-b-4 whitespace-nowrap
              ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }
            `}
            data-testid={`tab-${tab.id}`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'visual' && (
          <VisualSettings
            settings={profile.visual}
            onChange={(updates) => updateProfile('visual', updates)}
          />
        )}
        {activeTab === 'auditory' && (
          <AuditorySettings
            settings={profile.auditory}
            onChange={(updates) => updateProfile('auditory', updates)}
          />
        )}
        {activeTab === 'motor' && (
          <MotorSettings
            settings={profile.motor}
            onChange={(updates) => updateProfile('motor', updates)}
          />
        )}
        {activeTab === 'cognitive' && (
          <CognitiveSettings
            settings={profile.cognitive}
            onChange={(updates) => updateProfile('cognitive', updates)}
          />
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end gap-4 pt-6 border-t dark:border-neutral-700">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button variant="primary" size="lg" onClick={onSave} data-testid="save-profile">
          💾 Save Profile
        </Button>
      </div>
    </div>
  );
};

// Setting Components
interface VisualSettingsProps {
  settings: SensoryProfile['visual'];
  onChange: (updates: Partial<SensoryProfile['visual']>) => void;
}

const VisualSettings: FC<VisualSettingsProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6" data-testid="visual-settings">
      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Animation & Motion</h3>
        <div className="space-y-4">
          <ToggleSetting
            label="Reduce Animations"
            description="Slower, less distracting animations"
            checked={settings.reduceAnimations}
            onChange={(checked) => onChange({ reduceAnimations: checked })}
            testId="reduce-animations"
          />
          <ToggleSetting
            label="Reduce Motion"
            description="Minimal movement on screen"
            checked={settings.reduceMotion}
            onChange={(checked) => onChange({ reduceMotion: checked })}
            testId="reduce-motion"
          />
          <SelectSetting
            label="Flashing Content"
            description="Important for seizure safety"
            value={settings.flashingContent}
            options={[
              { value: 'allow', label: 'Allow' },
              { value: 'reduce', label: 'Reduce' },
              { value: 'remove', label: 'Remove Completely' },
            ]}
            onChange={(value) => onChange({ flashingContent: value as typeof settings.flashingContent })}
            testId="flashing-content"
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Visual Clarity</h3>
        <div className="space-y-4">
          <ToggleSetting
            label="High Contrast"
            description="Stronger colors for better visibility"
            checked={settings.highContrast}
            onChange={(checked) => onChange({ highContrast: checked })}
            testId="high-contrast"
          />
          <ToggleSetting
            label="Dark Mode"
            description="Dark background, light text"
            checked={settings.darkMode}
            onChange={(checked) => onChange({ darkMode: checked })}
            testId="dark-mode"
          />
          <ToggleSetting
            label="Reduced Clutter"
            description="Hide non-essential buttons and decorations"
            checked={settings.reducedClutter}
            onChange={(checked) => onChange({ reducedClutter: checked })}
            testId="reduced-clutter"
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Text & Reading</h3>
        <div className="space-y-4">
          <SelectSetting
            label="Font Size"
            value={settings.fontSize}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
              { value: 'extra-large', label: 'Extra Large' },
            ]}
            onChange={(value) => onChange({ fontSize: value as typeof settings.fontSize })}
            testId="font-size"
          />
          <SelectSetting
            label="Font Style"
            value={settings.fontFamily}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'dyslexic', label: 'Dyslexic-Friendly (Comic Sans)' },
              { value: 'open-dyslexic', label: 'OpenDyslexic' },
            ]}
            onChange={(value) => onChange({ fontFamily: value as typeof settings.fontFamily })}
            testId="font-family"
          />
          <SelectSetting
            label="Line Spacing"
            value={settings.lineSpacing}
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'wide', label: 'Wide' },
              { value: 'extra-wide', label: 'Extra Wide' },
            ]}
            onChange={(value) => onChange({ lineSpacing: value as typeof settings.lineSpacing })}
            testId="line-spacing"
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Color Scheme</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { value: 'default' as const, label: 'Default', color: 'bg-blue-500' },
            { value: 'warm' as const, label: 'Warm', color: 'bg-orange-500' },
            { value: 'cool' as const, label: 'Cool', color: 'bg-cyan-500' },
            { value: 'grayscale' as const, label: 'Grayscale', color: 'bg-neutral-500' },
            { value: 'high-contrast' as const, label: 'High Contrast', color: 'bg-black' },
          ].map((scheme) => (
            <button
              key={scheme.value}
              onClick={() => onChange({ colorScheme: scheme.value })}
              className={`
                p-4 rounded-xl border-2 transition
                ${
                  settings.colorScheme === scheme.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }
              `}
              data-testid={`color-${scheme.value}`}
            >
              <div className={`w-full h-12 ${scheme.color} rounded mb-2`} />
              <div className="text-sm font-medium dark:text-white">{scheme.label}</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

interface AuditorySettingsProps {
  settings: SensoryProfile['auditory'];
  onChange: (updates: Partial<SensoryProfile['auditory']>) => void;
}

const AuditorySettings: FC<AuditorySettingsProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6" data-testid="auditory-settings">
      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Sound Controls</h3>
        <div className="space-y-4">
          <ToggleSetting
            label="Mute All Sounds"
            description="Complete silence mode"
            checked={settings.muteAllSounds}
            onChange={(checked) => onChange({ muteAllSounds: checked })}
            testId="mute-all"
          />

          {!settings.muteAllSounds && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Volume: {settings.soundVolume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.soundVolume}
                  onChange={(e) => onChange({ soundVolume: parseInt(e.target.value) })}
                  className="w-full"
                  data-testid="sound-volume"
                />
              </div>

              <ToggleSetting
                label="No Background Music"
                description="Remove background music, keep important sounds"
                checked={settings.noBackgroundMusic}
                onChange={(checked) => onChange({ noBackgroundMusic: checked })}
                testId="no-music"
              />

              <ToggleSetting
                label="No Sound Effects"
                description="Remove click sounds and effects"
                checked={settings.noSoundEffects}
                onChange={(checked) => onChange({ noSoundEffects: checked })}
                testId="no-effects"
              />
            </>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Text-to-Speech</h3>
        <div className="space-y-4">
          <ToggleSetting
            label="Enable Text-to-Speech"
            description="Have text read aloud"
            checked={settings.textToSpeechEnabled}
            onChange={(checked) => onChange({ textToSpeechEnabled: checked })}
            testId="tts-enabled"
          />

          {settings.textToSpeechEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Reading Speed: {settings.textToSpeechSpeed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.textToSpeechSpeed}
                  onChange={(e) => onChange({ textToSpeechSpeed: parseFloat(e.target.value) })}
                  className="w-full"
                  data-testid="tts-speed"
                />
              </div>

              <SelectSetting
                label="Voice Type"
                value={settings.textToSpeechVoice}
                options={[
                  { value: 'male', label: 'Male Voice' },
                  { value: 'female', label: 'Female Voice' },
                  { value: 'child', label: 'Child Voice' },
                ]}
                onChange={(value) =>
                  onChange({ textToSpeechVoice: value as typeof settings.textToSpeechVoice })
                }
                testId="tts-voice"
              />

              <ToggleSetting
                label="Audio Descriptions"
                description="Describe images and visual content"
                checked={settings.audioDescriptions}
                onChange={(checked) => onChange({ audioDescriptions: checked })}
                testId="audio-descriptions"
              />
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

interface MotorSettingsProps {
  settings: SensoryProfile['motor'];
  onChange: (updates: Partial<SensoryProfile['motor']>) => void;
}

const MotorSettings: FC<MotorSettingsProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6" data-testid="motor-settings">
      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Click & Touch</h3>
        <div className="space-y-4">
          <ToggleSetting
            label="Larger Click Targets"
            description="Bigger buttons and links (44px minimum)"
            checked={settings.largerClickTargets}
            onChange={(checked) => onChange({ largerClickTargets: checked })}
            testId="larger-targets"
          />

          <ToggleSetting
            label="No Double-Click"
            description="Everything works with single click"
            checked={settings.noDoubleClick}
            onChange={(checked) => onChange({ noDoubleClick: checked })}
            testId="no-double-click"
          />

          <ToggleSetting
            label="No Drag-and-Drop"
            description="Use buttons instead of dragging"
            checked={settings.noDragAndDrop}
            onChange={(checked) => onChange({ noDragAndDrop: checked })}
            testId="no-drag-drop"
          />

          <ToggleSetting
            label="Touch Accommodations"
            description="Longer press time, accidental touch prevention"
            checked={settings.touchAccommodations}
            onChange={(checked) => onChange({ touchAccommodations: checked })}
            testId="touch-accommodations"
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Spacing & Layout</h3>
        <div className="space-y-4">
          <ToggleSetting
            label="Increase Spacing"
            description="More space between elements"
            checked={settings.increaseSpacing}
            onChange={(checked) => onChange({ increaseSpacing: checked })}
            testId="increase-spacing"
          />

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Hover Delay: {settings.hoverDelay}ms
            </label>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
              Time before hover effects trigger (helps with tremors)
            </p>
            <input
              type="range"
              min="0"
              max="1000"
              step="100"
              value={settings.hoverDelay}
              onChange={(e) => onChange({ hoverDelay: parseInt(e.target.value) })}
              className="w-full"
              data-testid="hover-delay"
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Keyboard Navigation</h3>
        <div className="space-y-4">
          <ToggleSetting
            label="Keyboard-Only Mode"
            description="Navigate entire app with keyboard"
            checked={settings.keyboardOnly}
            onChange={(checked) => onChange({ keyboardOnly: checked })}
            testId="keyboard-only"
          />

          <ToggleSetting
            label="Sticky Keys"
            description="Press keys one at a time instead of together"
            checked={settings.stickyKeys}
            onChange={(checked) => onChange({ stickyKeys: checked })}
            testId="sticky-keys"
          />
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
          <p className="font-medium mb-1 dark:text-white">Keyboard Shortcuts:</p>
          <ul className="text-xs space-y-1 list-disc pl-5 dark:text-neutral-300">
            <li>Tab: Move between items</li>
            <li>Enter/Space: Select or activate</li>
            <li>Escape: Cancel or go back</li>
            <li>Arrow keys: Navigate menus</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

interface CognitiveSettingsProps {
  settings: SensoryProfile['cognitive'];
  onChange: (updates: Partial<SensoryProfile['cognitive']>) => void;
}

const CognitiveSettings: FC<CognitiveSettingsProps> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6" data-testid="cognitive-settings">
      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Focus & Attention</h3>
        <div className="space-y-4">
          <ToggleSetting
            label="One Thing at a Time"
            description="Hide everything except current task"
            checked={settings.oneThingAtATime}
            onChange={(checked) => onChange({ oneThingAtATime: checked })}
            testId="one-thing"
          />

          <ToggleSetting
            label="No Pop-ups"
            description="Disable all pop-up windows"
            checked={settings.noPopups}
            onChange={(checked) => onChange({ noPopups: checked })}
            testId="no-popups"
          />

          <ToggleSetting
            label="No Autoplay"
            description="Videos and audio need manual start"
            checked={settings.noAutoplay}
            onChange={(checked) => onChange({ noAutoplay: checked })}
            testId="no-autoplay"
          />

          <ToggleSetting
            label="Show Progress Indicator"
            description="Always show how much is left"
            checked={settings.showProgressIndicator}
            onChange={(checked) => onChange({ showProgressIndicator: checked })}
            testId="show-progress"
          />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Simplification</h3>
        <div className="space-y-4">
          <ToggleSetting
            label="Simplify Instructions"
            description="Use shorter, clearer language"
            checked={settings.simplifyInstructions}
            onChange={(checked) => onChange({ simplifyInstructions: checked })}
            testId="simplify"
          />

          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium dark:text-white">Limit Choices</span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {settings.limitChoices === 0 ? 'Unlimited' : `Max ${settings.limitChoices}`}
              </span>
            </label>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
              Maximum number of options to show at once (0 = no limit)
            </p>
            <input
              type="range"
              min="0"
              max="5"
              value={settings.limitChoices}
              onChange={(e) => onChange({ limitChoices: parseInt(e.target.value) })}
              className="w-full"
              data-testid="limit-choices"
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 dark:text-white">Time & Breaks</h3>
        <div className="space-y-4">
          <ToggleSetting
            label="Extended Time"
            description="More time to complete activities"
            checked={settings.extendedTime}
            onChange={(checked) => onChange({ extendedTime: checked })}
            testId="extended-time"
          />

          {settings.extendedTime && (
            <SelectSetting
              label="Time Multiplier"
              value={settings.timeMultiplier.toString()}
              options={[
                { value: '1', label: 'Standard Time (1x)' },
                { value: '1.5', label: 'Time and a Half (1.5x)' },
                { value: '2', label: 'Double Time (2x)' },
                { value: '3', label: 'Triple Time (3x)' },
              ]}
              onChange={(value) => onChange({ timeMultiplier: parseFloat(value) })}
              testId="time-multiplier"
            />
          )}

          <ToggleSetting
            label="Break Reminders"
            description="Gentle reminders to take breaks"
            checked={settings.breakReminders}
            onChange={(checked) => onChange({ breakReminders: checked })}
            testId="break-reminders"
          />

          {settings.breakReminders && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Break Frequency: Every {settings.breakFrequency} minutes
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={settings.breakFrequency}
                onChange={(e) => onChange({ breakFrequency: parseInt(e.target.value) })}
                className="w-full"
                data-testid="break-frequency"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// Helper Components
interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  testId: string;
}

const ToggleSetting: FC<ToggleSettingProps> = ({ label, description, checked, onChange, testId }) => {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 mt-0.5"
        data-testid={testId}
      />
      <div className="flex-1">
        <div className="font-medium dark:text-white">{label}</div>
        <div className="text-xs text-neutral-600 dark:text-neutral-400">{description}</div>
      </div>
    </label>
  );
};

interface SelectSettingProps {
  label: string;
  description?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  testId: string;
}

const SelectSetting: FC<SelectSettingProps> = ({
  label,
  description,
  value,
  options,
  onChange,
  testId,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 dark:text-white">{label}</label>
      {description && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">{description}</p>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border-2 rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
        data-testid={testId}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
