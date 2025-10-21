import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    learningNeeds: [] as string[],
    deviceType: '',
  });

  const learningNeedsOptions = [
    { value: 'autism', label: 'Autism Spectrum', icon: '🧩' },
    { value: 'adhd', label: 'ADHD', icon: '⚡' },
    { value: 'dyslexia', label: 'Dyslexia', icon: '📖' },
    { value: 'speech', label: 'Speech Delay', icon: '🗣️' },
    { value: 'other', label: 'Other', icon: '✨' },
  ];

  const deviceOptions = [
    { value: 'ipad', label: 'iPad', icon: '📱' },
    { value: 'tablet', label: 'Android Tablet', icon: '📱' },
    { value: 'computer', label: 'Computer', icon: '💻' },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      navigate('/');
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  const toggleLearningNeed = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      learningNeeds: prev.learningNeeds.includes(value)
        ? prev.learningNeeds.filter((need) => need !== value)
        : [...prev.learningNeeds, value],
    }));
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Skip Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
          >
            Skip Setup →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-neutral-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="text-7xl mb-4">👋</div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                Welcome to Aivo Learning!
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Let's set up your account and create a personalized learning experience for your child. 
                This will only take a few minutes.
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mt-8 border border-purple-200">
                <h3 className="font-semibold text-neutral-900 mb-3">What we'll do:</h3>
                <ul className="text-left space-y-2 text-neutral-700">
                  <li className="flex items-center">
                    <span className="text-purple-600 mr-2">✓</span> Add your child's information
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-600 mr-2">✓</span> Identify learning needs and goals
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-600 mr-2">✓</span> Set up your first device
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-600 mr-2">✓</span> Start your free 14-day trial
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Add Child */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">👶</div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                  Tell us about your child
                </h2>
                <p className="text-neutral-600">
                  This helps us personalize the learning experience
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Child's First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.childName}
                    onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                    placeholder="Enter first name"
                    className="w-full px-4 py-4 rounded-xl border border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Age *
                  </label>
                  <select
                    value={formData.childAge}
                    onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border border-neutral-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-lg"
                  >
                    <option value="">Select age</option>
                    {Array.from({ length: 14 }, (_, i) => i + 3).map((age) => (
                      <option key={age} value={age}>
                        {age} years old
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Learning Needs */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                  Select Learning Needs
                </h2>
                <p className="text-neutral-600">
                  Choose any that apply to help our AI adapt better (optional)
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {learningNeedsOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleLearningNeed(option.value)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      formData.learningNeeds.includes(option.value)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-neutral-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{option.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">{option.label}</h3>
                      </div>
                      {formData.learningNeeds.includes(option.value) && (
                        <div className="text-purple-600 text-2xl">✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-sm text-neutral-700">
                <strong>Privacy Note:</strong> This information is used solely to personalize the learning 
                experience and is kept completely confidential.
              </div>
            </div>
          )}

          {/* Step 4: Device Setup */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">📱</div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                  Choose Your Device
                </h2>
                <p className="text-neutral-600">
                  What device will your child use for learning?
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {deviceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, deviceType: option.value })}
                    className={`p-8 rounded-2xl border-2 transition-all ${
                      formData.deviceType === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-neutral-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="text-5xl mb-3">{option.icon}</div>
                    <h3 className="font-semibold text-neutral-900">{option.label}</h3>
                    {formData.deviceType === option.value && (
                      <div className="text-purple-600 text-xl mt-2">✓</div>
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">🎉</span> You're All Set!
                </h3>
                <p className="text-neutral-700 text-sm mb-4">
                  Your personalized learning environment is ready. Start your 14-day free trial and 
                  watch your child's progress with AI-powered adaptive learning.
                </p>
                <ul className="text-sm text-neutral-700 space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span> Access to all subjects
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span> Personalized AI model
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span> Progress tracking
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span> No credit card required
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-8 py-3 rounded-xl font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                (step === 2 && (!formData.childName || !formData.childAge)) ||
                (step === 4 && !formData.deviceType)
              }
              className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-neutral-300 disabled:to-neutral-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-all"
            >
              {step === totalSteps ? 'Start Learning! 🚀' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
