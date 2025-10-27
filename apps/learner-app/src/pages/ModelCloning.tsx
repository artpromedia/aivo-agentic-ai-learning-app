import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '../components/ProgressRing';

const cloningMessages = [
  { progress: 0, message: "Starting your AI brain... 🧠", emoji: "🔮" },
  { progress: 20, message: "Learning your strengths... 💪", emoji: "✨" },
  { progress: 40, message: "Understanding how you learn... 📚", emoji: "🎯" },
  { progress: 60, message: "Personalizing just for you... 🎨", emoji: "🌟" },
  { progress: 80, message: "Almost ready... 🚀", emoji: "⚡" },
  { progress: 100, message: "Your AI is ready! 🎉", emoji: "🎊" },
];

export function ModelCloning() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(cloningMessages[0]);

  useEffect(() => {
    const startCloning = async () => {
      try {
        // Get learner_id from localStorage
        const learnerId = localStorage.getItem('current_learner_id');
        const assessmentResults = localStorage.getItem('assessment_results');
        
        if (!learnerId) {
          console.error('❌ No learner ID found');
          return;
        }

        console.log('🧬 Starting model cloning for learner:', learnerId);

        // Get auth token from onboarding flow or regular auth
        const authToken = localStorage.getItem('onboarding_token') || localStorage.getItem('access_token');
        
        if (authToken && assessmentResults) {
          console.log('📡 Calling AI brain cloning API...');
          
          // Send assessment results and trigger model cloning
          const response = await fetch('http://localhost:9000/api/v1/ai/clone-model', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              learner_id: learnerId,
              assessment_results: JSON.parse(assessmentResults)
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Model cloned successfully:', result.brain_id);
            localStorage.setItem('brain_id', result.brain_id);
          } else {
            console.error('❌ Model cloning API error:', response.status);
          }
        } else {
          console.warn('⚠️ Missing auth token or assessment results for model cloning');
        }
        
      } catch (err) {
        console.error('Error starting cloning:', err);
      }
    };

    startCloning();

    // Simulate cloning progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 2, 100);
        
        // Update message based on progress
        const message = [...cloningMessages].reverse().find(m => newProgress >= m.progress);
        if (message) {
          setCurrentMessage(message);
        }
        
        // Navigate when complete
        if (newProgress === 100) {
          setTimeout(() => {
            // Mark model cloning as complete
            localStorage.setItem('model_cloning_complete', 'true');
            console.log('✅ Model cloning complete!');
            
            // Clear onboarding flags
            localStorage.removeItem('needs_assessment');
            localStorage.removeItem('onboarding_flow');
            
            // Check if we should skip PIN setup (first-time onboarding)
            const skipPinSetup = localStorage.getItem('skip_pin_setup');
            
            if (skipPinSetup) {
              // First-time onboarding - skip PIN setup and go to subject selection
              console.log('🎓 First-time onboarding complete! Skipping PIN setup, going to subjects...');
              localStorage.removeItem('skip_pin_setup'); // Clear the flag
              // Mark that PIN setup was skipped (optional)
              localStorage.setItem('pin_setup_skipped', 'true');
              navigate('/subjects');
            } else {
              // Regular flow - go to PIN setup
              console.log('🔐 Redirecting to PIN setup...');
              navigate('/setup-pin');
            }
          }, 2000);
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Icon */}
        <div className="mb-12 animate-float">
          <div className="text-9xl mb-6 inline-block animate-pulse-slow">
            {currentMessage?.emoji || '🔮'}
          </div>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center mb-8">
          <ProgressRing 
            progress={progress} 
            size={200} 
            strokeWidth={16}
            color="#ffffff"
            backgroundColor="rgba(255,255,255,0.3)"
          />
        </div>

        {/* Message */}
        <h1 className="text-5xl font-bold text-white mb-6 animate-fade-in">
          {currentMessage?.message || 'Getting ready...'}
        </h1>

        {/* Loading Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* Encouraging Text */}
        <p className="text-2xl text-white/90">
          This will only take a moment... ⏰
        </p>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes pulse-slow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
          }
          
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
