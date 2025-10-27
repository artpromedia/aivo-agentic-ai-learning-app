import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@aivo/ui';
import { PageWrapper } from '../components/PageWrapper';

export function Lock() {
  const { themeConfig } = useTheme();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [isWrongPin, setIsWrongPin] = useState(false);
  const [correctPin, setCorrectPin] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First, check if onboarding is complete
    const baselineComplete = localStorage.getItem('baseline_complete');
    const modelCloningComplete = localStorage.getItem('model_cloning_complete');
    
    // If onboarding not complete, redirect to appropriate step
    if (!baselineComplete || baselineComplete !== 'true') {
      console.log('⚠️ Baseline assessment not complete, redirecting...');
      navigate('/onboarding/assessment');
      return;
    }
    
    if (!modelCloningComplete || modelCloningComplete !== 'true') {
      console.log('⚠️ Model cloning not complete, redirecting...');
      navigate('/cloning');
      return;
    }
    
    // Check if PIN is set up
    const learnerId = localStorage.getItem('current_learner_id');
    const storedPin = localStorage.getItem(`learner_pin_${learnerId}`);
    const pinSetupComplete = localStorage.getItem('pin_setup_complete');
    const pinSetupSkipped = localStorage.getItem('pin_setup_skipped');
    
    // If PIN setup was skipped during onboarding or no PIN is configured, go directly to subjects
    if (pinSetupSkipped || (!pinSetupComplete && !storedPin)) {
      console.log('ℹ️ PIN not configured, redirecting to subjects...');
      navigate('/subjects');
      return;
    }
    
    // If PIN is set up, use it for authentication
    if (storedPin) {
      setCorrectPin(storedPin);
      setLoading(false);
    }
  }, [navigate]);

  const childProfile = {
    name: 'Alex',
    avatar: '👦',
    level: 5,
    streak: '3 day streak 🔥',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const handleNumberClick = (num: number) => {
    if (pin.length < 4) {
      const newPin = pin + num.toString();
      setPin(newPin);
      
      if (newPin.length === 4) {
        setTimeout(() => checkPin(newPin), 300);
      }
    }
  };

  const checkPin = (pinToCheck: string) => {
    if (pinToCheck === correctPin) {
      navigate('/subjects');
    } else {
      setIsWrongPin(true);
      setTimeout(() => {
        setIsWrongPin(false);
        setPin('');
      }, 500);
    }
  };

  const handleClear = () => {
    setPin('');
    setIsWrongPin(false);
  };

  return (
    <PageWrapper>
    <div 
      className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom right, ${themeConfig.colors.primary}dd, ${themeConfig.colors.secondary}dd, ${themeConfig.colors.accent}dd)`,
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      <div className="max-w-lg w-full relative z-10">
        <div 
          className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20"
          style={{
            borderRadius: themeConfig.borderRadius.card,
            padding: themeConfig.spacing.card,
          }}
        >
          <div className="mb-8 text-center animate-fade-in">
            <div className="relative inline-block mb-6">
              <div 
                className="flex items-center justify-center shadow-xl ring-4 ring-white"
                style={{
                  width: themeConfig.iconSize.subject,
                  height: themeConfig.iconSize.subject,
                  background: `linear-gradient(to bottom right, ${themeConfig.colors.primary}, ${themeConfig.colors.secondary})`,
                  borderRadius: '50%',
                  fontSize: `calc(${themeConfig.iconSize.subject} * 0.6)`,
                }}
              >
                {childProfile.avatar}
              </div>
              <div 
                className="absolute -bottom-2 -right-2 rounded-full px-4 py-2 shadow-lg transform hover:scale-110 transition-transform"
                style={{
                  background: `linear-gradient(to right, ${themeConfig.colors.accent}, ${themeConfig.colors.secondary})`,
                }}
              >
                <span 
                  className="font-bold text-white"
                  style={{ fontSize: themeConfig.fontSize.label }}
                >
                  Level {childProfile.level}
                </span>
              </div>
            </div>
            
            <h1 
              className="font-bold text-neutral-900 mb-2"
              style={{ fontSize: themeConfig.fontSize.heading }}
            >
              Hi, {childProfile.name}! 👋
            </h1>
            <p 
              className="text-neutral-600 mb-4"
              style={{ fontSize: themeConfig.fontSize.base }}
            >
              Enter your PIN to start learning
            </p>
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full px-6 py-2 border border-orange-200">
              <span className="text-xl font-semibold text-orange-600">{childProfile.streak}</span>
            </div>
          </div>

          <div className={`flex justify-center gap-3 md:gap-4 mb-8 ${isWrongPin ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`bg-gradient-to-br shadow-inner border-2 flex items-center justify-center transition-all ${
                  pin.length > index ? 'scale-105' : ''
                }`}
                style={{
                  width: `calc(${themeConfig.iconSize.navigation} * 2)`,
                  height: `calc(${themeConfig.iconSize.navigation} * 2)`,
                  borderRadius: themeConfig.borderRadius.button,
                  backgroundColor: `${themeConfig.colors.background}`,
                  borderColor: pin.length > index ? themeConfig.colors.primary : themeConfig.colors.border,
                  transitionDuration: `${themeConfig.animations.duration}ms`,
                  fontSize: `calc(${themeConfig.iconSize.navigation} * 1.5)`,
                }}
              >
                <span className="text-3xl md:text-4xl">
                  {pin.length > index ? '●' : '○'}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 max-w-xs mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="aspect-square bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 shadow-md hover:shadow-lg border transform hover:scale-105 active:scale-95 transition-all"
                style={{
                  backgroundColor: `${themeConfig.colors.background}`,
                  color: themeConfig.colors.primary,
                  borderRadius: themeConfig.borderRadius.button,
                  fontSize: `calc(${themeConfig.fontSize.heading} * 1.2)`,
                  fontWeight: 'bold',
                  borderColor: themeConfig.colors.border,
                  transitionDuration: `${themeConfig.animations.duration}ms`,
                }}
                aria-label={`Number ${num}`}
              >
                {num}
              </button>
            ))}
            <div className="aspect-square" />
            <button
              onClick={() => handleNumberClick(0)}
              className="aspect-square bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 shadow-md hover:shadow-lg border transform hover:scale-105 active:scale-95 transition-all"
              style={{
                backgroundColor: `${themeConfig.colors.background}`,
                color: themeConfig.colors.primary,
                borderRadius: themeConfig.borderRadius.button,
                fontSize: `calc(${themeConfig.fontSize.heading} * 1.2)`,
                fontWeight: 'bold',
                borderColor: themeConfig.colors.border,
                transitionDuration: `${themeConfig.animations.duration}ms`,
              }}
              aria-label="Number 0"
            >
              0
            </button>
            <button
              onClick={handleClear}
              className="aspect-square bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl md:rounded-2xl text-2xl md:text-3xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
              aria-label="Clear"
            >
              ✕
            </button>
          </div>

          <div className="text-center bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-base md:text-lg text-blue-700 font-medium">
              👨‍👩‍👧‍👦 Ask a grown-up if you forgot your PIN
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }
      `}</style>
    </div>
    </PageWrapper>
  );
}
