import { AlertCircle, Brain, CheckCircle, Clock, Info, Shield, Target } from 'lucide-react';
import { useState } from 'react';

interface AgenticConsentFlowProps {
  learnerId: string;
  learnerName: string;
  onComplete: (config: AgenticConfig) => void;
  onCancel: () => void;
}

interface AgenticConfig {
  autonomyLevel: 'MINIMAL' | 'GUIDED' | 'PROACTIVE' | 'AUTONOMOUS';
  enabledTriggers: string[];
  maxInterventionsPerSession: number;
  requireApproval: boolean;
  notificationPreferences: {
    goalUpdates: boolean;
    interventions: boolean;
    weeklyReports: boolean;
  };
}

export function AgenticConsentFlow({
  learnerId,
  learnerName,
  onComplete,
  onCancel
}: AgenticConsentFlowProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<AgenticConfig>({
    autonomyLevel: 'GUIDED',
    enabledTriggers: ['frustration', 'disengagement', 'stuck'],
    maxInterventionsPerSession: 5,
    requireApproval: false,
    notificationPreferences: {
      goalUpdates: true,
      interventions: true,
      weeklyReports: true,
    }
  });

  const totalSteps = 5;

  const autonomyLevels = [
    {
      level: 'MINIMAL' as const,
      name: 'Minimal Autonomy',
      description: 'AI only suggests - you approve all actions',
      icon: Shield,
      features: [
        'AI generates learning goal suggestions',
        'You review and approve every goal',
        'No autonomous interventions',
        'Full parental control at all times'
      ],
      color: 'blue'
    },
    {
      level: 'GUIDED' as const,
      name: 'Guided Autonomy (Recommended)',
      description: 'AI acts within predefined boundaries',
      icon: Brain,
      features: [
        'AI generates and implements learning goals',
        'Autonomous hints when child struggles',
        'Weekly progress reports for your review',
        'You can override any decision'
      ],
      color: 'green'
    },
    {
      level: 'PROACTIVE' as const,
      name: 'Proactive Autonomy',
      description: 'AI actively monitors and adjusts',
      icon: Target,
      features: [
        'Real-time learning adjustments',
        'Proactive intervention when needed',
        'Autonomous difficulty adaptation',
        'Immediate notifications on major changes'
      ],
      color: 'purple'
    },
    {
      level: 'AUTONOMOUS' as const,
      name: 'Full Autonomy',
      description: 'AI operates independently (requires explicit consent)',
      icon: Clock,
      features: [
        'Complete autonomous operation',
        'AI makes all learning decisions',
        'Retrospective reports only',
        'Maximum adaptation speed'
      ],
      color: 'orange'
    }
  ];

  const availableTriggers = [
    { id: 'frustration', name: 'Frustration Detected', description: 'When child shows signs of frustration' },
    { id: 'disengagement', name: 'Disengagement', description: 'When attention starts to wander' },
    { id: 'stuck', name: 'Stuck on Problem', description: 'When child struggles for too long' },
    { id: 'success_momentum', name: 'Success Momentum', description: 'When child is excelling' },
    { id: 'fatigue', name: 'Fatigue Signs', description: 'When child shows signs of tiredness' },
    { id: 'breakthrough', name: 'Breakthrough Moment', description: 'When child has an "aha!" moment' },
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Brain className="w-16 h-16 mx-auto text-purple-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Meet {learnerName}'s AI Learning Brain
        </h2>
        <p className="text-gray-600">
          An intelligent system that personalizes learning in real-time
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">What is Agentic AI?</h3>
            <p className="text-blue-800 text-sm">
              Traditional AI responds to requests. Agentic AI proactively sets goals, 
              monitors progress, and adjusts learning paths - all personalized for {learnerName}'s 
              unique needs and learning style.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">How It Works:</h3>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-semibold">1</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Analyzes Learning Patterns</h4>
            <p className="text-sm text-gray-600">
              The AI studies {learnerName}'s sessions to understand strengths, challenges, and preferences
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-semibold">2</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Sets Personalized Goals</h4>
            <p className="text-sm text-gray-600">
              Generates learning goals aligned with IEP objectives and district standards
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-semibold">3</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Monitors & Adjusts</h4>
            <p className="text-sm text-gray-600">
              Provides real-time support when {learnerName} needs it, adapting to their pace
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-semibold">4</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Learns & Improves</h4>
            <p className="text-sm text-gray-600">
              Every interaction makes the AI better at supporting {learnerName}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900 mb-1">You Stay in Control</h4>
            <p className="text-sm text-green-800">
              You'll configure how autonomous the AI can be, what actions it can take, 
              and receive regular reports on all decisions made.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          See It In Action
        </h2>
        <p className="text-gray-600">
          Real examples of how AI helps {learnerName} learn
        </p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-2">📊 Example 1: Goal Setting</h3>
          <div className="bg-gray-50 rounded p-3 text-sm">
            <p className="text-gray-600 mb-2"><strong>AI Analysis:</strong></p>
            <p className="text-gray-700 mb-3">
              "{learnerName} shows strong visual learning but struggles with reading comprehension. 
              Success rate: 65%. Recommended focus: Main idea identification."
            </p>
            <p className="text-gray-600 mb-2"><strong>AI Decision:</strong></p>
            <p className="text-purple-700 font-medium">
              ✨ Generated Goal: "Improve reading comprehension using graphic organizers" 
              (2-week plan, 6 sessions)
            </p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Example 2: Real-Time Support</h3>
          <div className="bg-gray-50 rounded p-3 text-sm">
            <p className="text-gray-600 mb-2"><strong>Situation:</strong></p>
            <p className="text-gray-700 mb-3">
              {learnerName} attempts same math problem 3 times, errors increasing, 
              time on problem: 3 minutes
            </p>
            <p className="text-gray-600 mb-2"><strong>AI Decision:</strong></p>
            <p className="text-purple-700 font-medium">
              💭 Provided visual hint: "Think of the problem as groups. How many groups do you see?"
            </p>
            <p className="text-green-600 text-xs mt-2">✓ Result: {learnerName} solved it independently!</p>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-2">📈 Example 3: Progress Adjustment</h3>
          <div className="bg-gray-50 rounded p-3 text-sm">
            <p className="text-gray-600 mb-2"><strong>AI Observation:</strong></p>
            <p className="text-gray-700 mb-3">
              {learnerName} completed last 5 sessions with 90%+ accuracy. 
              Current difficulty: Level 5.
            </p>
            <p className="text-gray-600 mb-2"><strong>AI Decision:</strong></p>
            <p className="text-purple-700 font-medium">
              🎯 Increased difficulty to Level 6. Added challenge problems. 
              Parent notified via dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
        <p className="text-purple-900 text-sm">
          <strong>Transparency Promise:</strong> Every decision includes the AI's reasoning, 
          so you always understand why actions were taken.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Autonomy Level
        </h2>
        <p className="text-gray-600">
          How much independence should the AI have?
        </p>
      </div>

      <div className="space-y-3">
        {autonomyLevels.map((level) => {
          const Icon = level.icon;
          const isSelected = config.autonomyLevel === level.level;
          
          return (
            <button
              key={level.level}
              onClick={() => setConfig({ ...config, autonomyLevel: level.level })}
              className={`w-full text-left border-2 rounded-lg p-4 transition-all ${
                isSelected
                  ? `border-${level.color}-500 bg-${level.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <Icon className={`w-6 h-6 ${isSelected ? `text-${level.color}-600` : 'text-gray-400'} mr-3 flex-shrink-0 mt-1`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{level.name}</h3>
                    {level.level === 'GUIDED' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Recommended
                      </span>
                    )}
                    {isSelected && (
                      <CheckCircle className={`w-5 h-5 text-${level.color}-600`} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{level.description}</p>
                  <ul className="space-y-1">
                    {level.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {level.level === 'AUTONOMOUS' && (
                    <div className="mt-3 bg-orange-50 border border-orange-200 rounded p-2">
                      <p className="text-xs text-orange-800 flex items-start">
                        <AlertCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                        Requires explicit consent and additional verification
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-purple-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Configure Triggers & Limits
        </h2>
        <p className="text-gray-600">
          Fine-tune when the AI should act
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">When should AI intervene?</h3>
        <div className="space-y-2">
          {availableTriggers.map((trigger) => (
            <label key={trigger.id} className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={config.enabledTriggers.includes(trigger.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setConfig({
                      ...config,
                      enabledTriggers: [...config.enabledTriggers, trigger.id]
                    });
                  } else {
                    setConfig({
                      ...config,
                      enabledTriggers: config.enabledTriggers.filter(t => t !== trigger.id)
                    });
                  }
                }}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">{trigger.name}</div>
                <div className="text-sm text-gray-600">{trigger.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-900 mb-2">
          Max interventions per session
        </label>
        <select
          value={config.maxInterventionsPerSession}
          onChange={(e) => setConfig({ ...config, maxInterventionsPerSession: parseInt(e.target.value) })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="3">3 (Conservative)</option>
          <option value="5">5 (Balanced)</option>
          <option value="8">8 (Active Support)</option>
          <option value="999">Unlimited</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Prevents overwhelming {learnerName} with too many hints
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Notification Preferences</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.notificationPreferences.goalUpdates}
              onChange={(e) => setConfig({
                ...config,
                notificationPreferences: {
                  ...config.notificationPreferences,
                  goalUpdates: e.target.checked
                }
              })}
              className="mr-3"
            />
            <span className="text-gray-900">Notify when new goals are set</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.notificationPreferences.interventions}
              onChange={(e) => setConfig({
                ...config,
                notificationPreferences: {
                  ...config.notificationPreferences,
                  interventions: e.target.checked
                }
              })}
              className="mr-3"
            />
            <span className="text-gray-900">Notify when AI intervenes during sessions</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.notificationPreferences.weeklyReports}
              onChange={(e) => setConfig({
                ...config,
                notificationPreferences: {
                  ...config.notificationPreferences,
                  weeklyReports: e.target.checked
                }
              })}
              className="mr-3"
            />
            <span className="text-gray-900">Send weekly progress reports</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Consent
        </h2>
        <p className="text-gray-600">
          Confirm your AI configuration for {learnerName}
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Autonomy Level</h3>
          <p className="text-gray-700">
            {autonomyLevels.find(l => l.level === config.autonomyLevel)?.name}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Enabled Triggers</h3>
          <p className="text-gray-700">
            {config.enabledTriggers.map(id => 
              availableTriggers.find(t => t.id === id)?.name
            ).join(', ')}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Session Limits</h3>
          <p className="text-gray-700">
            Max {config.maxInterventionsPerSession} interventions per session
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Notifications</h3>
          <p className="text-gray-700">
            {Object.entries(config.notificationPreferences)
              .filter(([_, enabled]) => enabled)
              .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
              .join(', ') || 'None selected'}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Your Rights:</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>✓ Review all AI decisions in the dashboard</li>
          <li>✓ Override any AI action at any time</li>
          <li>✓ Modify these settings whenever you want</li>
          <li>✓ Disable AI autonomy completely if needed</li>
          <li>✓ Export all AI decision data</li>
        </ul>
      </div>

      <div className="border-2 border-gray-300 rounded-lg p-4">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            required
            className="mt-1 mr-3"
          />
          <div className="text-sm text-gray-700">
            <strong>I consent</strong> to enable Agentic AI features for {learnerName}. 
            I understand the AI will operate within the configured autonomy level, 
            and I can review, override, or disable these features at any time. 
            All AI decisions will be transparent and explainable.
          </div>
        </label>
      </div>

      <div className="text-xs text-gray-500 text-center">
        By clicking "Enable AI Brain", you agree to the terms above. 
        Consent can be withdrawn at any time.
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded ${
                s <= step ? 'bg-purple-600' : 'bg-gray-200'
              } ${s < totalSteps ? 'mr-2' : ''}`}
            />
          ))}
        </div>
        <div className="text-sm text-gray-600 text-center">
          Step {step} of {totalSteps}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => step === 1 ? onCancel() : setStep(step - 1)}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button
          onClick={() => {
            if (step === totalSteps) {
              onComplete(config);
            } else {
              setStep(step + 1);
            }
          }}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {step === totalSteps ? 'Enable AI Brain' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
