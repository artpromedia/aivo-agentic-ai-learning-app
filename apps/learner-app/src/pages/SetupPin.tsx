import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SetupPin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState('');

  const handleNumberClick = (num: string) => {
    if (step === 'create' && pin.length < 4) {
      setPin(pin + num);
      if (pin.length === 3) {
        // Move to confirm step when 4 digits entered
        setTimeout(() => setStep('confirm'), 300);
      }
    } else if (step === 'confirm' && confirmPin.length < 4) {
      const newConfirmPin = confirmPin + num;
      setConfirmPin(newConfirmPin);
      
      if (newConfirmPin.length === 4) {
        // Check if PINs match
        if (pin === newConfirmPin) {
          // Save PIN and navigate to dashboard
          const learnerId = localStorage.getItem('current_learner_id');
          localStorage.setItem(`learner_pin_${learnerId}`, pin);
          localStorage.setItem('pin_setup_complete', 'true');
          
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          // PINs don't match, reset
          setError("PINs don't match! Let's try again.");
          setTimeout(() => {
            setPin('');
            setConfirmPin('');
            setStep('create');
            setError('');
          }, 2000);
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'create' && pin.length > 0) {
      setPin(pin.slice(0, -1));
    } else if (step === 'confirm' && confirmPin.length > 0) {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const currentPin = step === 'create' ? pin : confirmPin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-6 animate-bounce">🔐</div>
          <h1 className="text-5xl font-bold text-white mb-4">
            {step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN'}
          </h1>
          <p className="text-2xl text-white/90">
            {step === 'create' 
              ? 'Choose 4 numbers to lock your account' 
              : 'Enter your PIN again to confirm'}
          </p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-12">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold transition-all duration-300 ${
                currentPin.length > index
                  ? 'bg-white text-purple-600 scale-110'
                  : 'bg-white/30 text-white'
              }`}
            >
              {currentPin.length > index ? '●' : '○'}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white text-xl font-semibold text-center py-4 rounded-2xl mb-6 animate-shake">
            {error}
          </div>
        )}

        {/* Number Pad */}
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="aspect-square bg-white hover:bg-purple-100 rounded-2xl text-4xl font-bold text-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                disabled={currentPin.length >= 4}
              >
                {num}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div></div>
            <button
              onClick={() => handleNumberClick('0')}
              className="aspect-square bg-white hover:bg-purple-100 rounded-2xl text-4xl font-bold text-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
              disabled={currentPin.length >= 4}
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="aspect-square bg-red-500 hover:bg-red-600 rounded-2xl text-3xl font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              ←
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-xl text-white/90 mt-8">
          {step === 'create' 
            ? '💡 Choose numbers you can remember!' 
            : '✨ Almost there!'}
        </p>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
}
