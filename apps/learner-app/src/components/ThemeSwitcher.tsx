import { useTheme, type LearnerTheme } from '@aivo/ui';

const THEME_LABELS: Record<LearnerTheme, string> = {
  K5: 'K-5 (Elementary)',
  MS: 'Middle School',
  HS: 'High School',
};

const GRADE_EXAMPLES: Record<LearnerTheme, string> = {
  K5: 'Kindergarten - 5th Grade',
  MS: '6th - 8th Grade',
  HS: '9th - 12th Grade',
};

export function ThemeSwitcher() {
  const { theme, setTheme, themeConfig } = useTheme();

  // Only show in development
  if (import.meta.env.MODE === 'production') {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border-2"
      style={{
        borderColor: themeConfig.colors.primary,
      }}
    >
      <div className="flex flex-col gap-2">
        <h3 
          className="font-semibold mb-2"
          style={{
            fontSize: themeConfig.fontSize.heading,
            color: themeConfig.colors.text,
          }}
        >
          🎨 Theme Switcher
        </h3>
        
        <p 
          className="text-xs text-gray-600 mb-2"
          style={{
            fontSize: themeConfig.fontSize.label,
          }}
        >
          Current: <strong>{THEME_LABELS[theme]}</strong>
        </p>

        <div className="flex flex-col gap-2">
          {(['K5', 'MS', 'HS'] as LearnerTheme[]).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                theme === themeOption
                  ? 'ring-2 ring-offset-2'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: theme === themeOption ? themeConfig.colors.primary : '#f3f4f6',
                color: theme === themeOption ? '#ffffff' : themeConfig.colors.text,
                fontSize: themeConfig.fontSize.label,
                borderRadius: themeConfig.borderRadius.button,
                transitionDuration: `${themeConfig.animations.duration}ms`,
              }}
            >
              <div className="text-left">
                <div className="font-semibold">{THEME_LABELS[themeOption]}</div>
                <div 
                  className="text-xs opacity-80"
                  style={{
                    fontSize: `calc(${themeConfig.fontSize.label} * 0.85)`,
                  }}
                >
                  {GRADE_EXAMPLES[themeOption]}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Theme Preview Info */}
        <div 
          className="mt-3 pt-3 border-t text-xs"
          style={{
            fontSize: `calc(${themeConfig.fontSize.label} * 0.9)`,
            borderColor: themeConfig.colors.border,
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="font-semibold">Font Size:</div>
              <div className="text-gray-600">{themeConfig.fontSize.base}</div>
            </div>
            <div>
              <div className="font-semibold">Icon Size:</div>
              <div className="text-gray-600">{themeConfig.iconSize.subject}</div>
            </div>
            <div>
              <div className="font-semibold">Spacing:</div>
              <div className="text-gray-600">{themeConfig.spacing.card}</div>
            </div>
            <div>
              <div className="font-semibold">Animation:</div>
              <div className="text-gray-600">{themeConfig.animations.intensity}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
