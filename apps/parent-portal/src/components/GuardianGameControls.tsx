import React from 'react';
import { Card, Input, Switch, Button } from '@aivo/ui';
import { useLocalStorage } from '@aivo/utils';

interface GameBreakSettings {
  maxBreaksPerDay: number;
  breakDurationMinutes: number;
  allowManualBreaks: boolean;
  requireApproval: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM format
  quietHoursEnd: string;
  allowedGameTypes: string[];
}

interface GuardianGameControlsProps {
  learnerId: string;
  learnerName: string;
}

export const GuardianGameControls: React.FC<GuardianGameControlsProps> = ({
  learnerId,
  learnerName,
}) => {
  const [settings, setSettings] = useLocalStorage<GameBreakSettings>(
    `game_settings_${learnerId}`,
    {
      maxBreaksPerDay: 3,
      breakDurationMinutes: 3,
      allowManualBreaks: true,
      requireApproval: false,
      quietHoursEnabled: false,
      quietHoursStart: '21:00',
      quietHoursEnd: '07:00',
      allowedGameTypes: ['reaction', 'breathing', 'memory', 'pattern', 'sorting'],
    }
  );

  const handleUpdate = (key: keyof GameBreakSettings, value: number | boolean | string | string[]) => {
    setSettings({ ...settings, [key]: value });
  };

  const toggleGameType = (gameType: string) => {
    const updated = settings.allowedGameTypes.includes(gameType)
      ? settings.allowedGameTypes.filter(t => t !== gameType)
      : [...settings.allowedGameTypes, gameType];
    handleUpdate('allowedGameTypes', updated);
  };

  return (
    <div className="space-y-6" data-testid="guardian-game-controls">
      <Card>
        <h3 className="text-xl font-bold mb-4">
          Game Break Settings for {learnerName}
        </h3>

        {/* Basic Settings */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Max Game Breaks Per Day
            </label>
            <Input
              type="number"
              min={0}
              max={10}
              value={settings.maxBreaksPerDay}
              onChange={(e) => handleUpdate('maxBreaksPerDay', parseInt(e.target.value))}
              data-testid="max-breaks-input"
            />
            <p className="text-xs text-neutral-600 mt-1">
              Recommended: 2-4 breaks for optimal focus
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Break Duration (minutes)
            </label>
            <Input
              type="number"
              min={1}
              max={10}
              value={settings.breakDurationMinutes}
              onChange={(e) => handleUpdate('breakDurationMinutes', parseInt(e.target.value))}
              data-testid="break-duration-input"
            />
            <p className="text-xs text-neutral-600 mt-1">
              Recommended: 2-5 minutes
            </p>
          </div>
        </div>

        {/* Toggle Settings */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <p className="font-medium">Allow Manual Breaks</p>
              <p className="text-sm text-neutral-600">
                Let {learnerName} start a game break anytime
              </p>
            </div>
            <Switch
              checked={settings.allowManualBreaks}
              onChange={(checked: boolean) => handleUpdate('allowManualBreaks', checked)}
              data-testid="manual-breaks-toggle"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <p className="font-medium">Require Parent Approval</p>
              <p className="text-sm text-neutral-600">
                Send notification before starting game break
              </p>
            </div>
            <Switch
              checked={settings.requireApproval}
              onChange={(checked: boolean) => handleUpdate('requireApproval', checked)}
              data-testid="require-approval-toggle"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <div>
              <p className="font-medium">Quiet Hours</p>
              <p className="text-sm text-neutral-600">
                Disable game breaks during specific hours
              </p>
            </div>
            <Switch
              checked={settings.quietHoursEnabled}
              onChange={(checked: boolean) => handleUpdate('quietHoursEnabled', checked)}
              data-testid="quiet-hours-toggle"
            />
          </div>

          {settings.quietHoursEnabled && (
            <div className="ml-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <Input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => handleUpdate('quietHoursStart', e.target.value)}
                  data-testid="quiet-hours-start-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <Input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => handleUpdate('quietHoursEnd', e.target.value)}
                  data-testid="quiet-hours-end-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Allowed Game Types */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Allowed Game Types
          </label>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { id: 'reaction', name: 'Quick Reflex', icon: '⚡' },
              { id: 'breathing', name: 'Breathing Coach', icon: '🫁' },
              { id: 'memory', name: 'Memory Match', icon: '🧠' },
              { id: 'pattern', name: 'Pattern Finder', icon: '🔢' },
              { id: 'sorting', name: 'Quick Sort', icon: '🎯' },
            ].map((game) => (
              <div
                key={game.id}
                className={`
                  p-3 rounded-lg border-2 cursor-pointer transition
                  ${settings.allowedGameTypes.includes(game.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 bg-white'
                  }
                `}
                onClick={() => toggleGameType(game.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleGameType(game.id);
                  }
                }}
                role="checkbox"
                aria-checked={settings.allowedGameTypes.includes(game.id)}
                tabIndex={0}
                data-testid={`game-type-${game.id}`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.allowedGameTypes.includes(game.id)}
                    onChange={() => toggleGameType(game.id)}
                    className="cursor-pointer"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <span className="text-2xl" aria-hidden="true">{game.icon}</span>
                  <span className="font-medium">{game.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t">
          <Button variant="primary" data-testid="save-settings">
            💾 Save Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};
