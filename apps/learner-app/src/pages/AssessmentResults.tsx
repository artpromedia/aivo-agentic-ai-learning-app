import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';
import { ProgressRing } from '../components/ProgressRing';

interface SubjectResult {
  subject: string;
  icon: string;
  score: number;
  strength: string;
  color: string;
}

const mockResults: SubjectResult[] = [
  {
    subject: 'Reading',
    icon: '📚',
    score: 75,
    strength: 'You recognize lots of words!',
    color: 'from-blue-400 to-blue-600',
  },
  {
    subject: 'Math',
    icon: '🔢',
    score: 60,
    strength: 'You understand numbers well!',
    color: 'from-green-400 to-green-600',
  },
  {
    subject: 'Speech',
    icon: '🗣️',
    score: 85,
    strength: 'You communicate clearly!',
    color: 'from-purple-400 to-purple-600',
  },
];

export function AssessmentResults() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Celebration Header */}
        <div className="text-center mb-12 animate-bounce-in">
          <div className="text-9xl mb-6 animate-spin-slow">🎉</div>
          <h1 className="text-6xl font-bold text-neutral-900 mb-4">
            Amazing Work!
          </h1>
          <p className="text-3xl text-purple-600">
            You did a fantastic job! Here's what we learned about you:
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {mockResults.map((result, index) => (
            <div
              key={result.subject}
              className="bg-white rounded-3xl p-8 shadow-xl animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Icon */}
              <div className="text-8xl text-center mb-6 animate-bounce-slow">
                {result.icon}
              </div>

              {/* Subject Name */}
              <h3 className="text-3xl font-bold text-center text-neutral-900 mb-6">
                {result.subject}
              </h3>

              {/* Progress Ring */}
              <div className="flex justify-center mb-6">
                <ProgressRing 
                  progress={result.score} 
                  size={140}
                  strokeWidth={14}
                />
              </div>

              {/* Strength */}
              <div className={`bg-gradient-to-r ${result.color} text-white rounded-2xl p-4 text-center`}>
                <p className="text-xl font-semibold">{result.strength}</p>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mt-6">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-4xl ${i < Math.floor(result.score / 20) ? 'opacity-100' : 'opacity-30'}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Encouraging Message */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 text-center">
          <p className="text-3xl text-neutral-800 mb-4">
            🌟 <strong>You're ready to start learning!</strong> 🌟
          </p>
          <p className="text-2xl text-neutral-600">
            Your AI teacher is all set up just for you. Let's make learning fun! 🚀
          </p>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <BigButton
            onClick={() => navigate('/subjects')}
            variant="primary"
            icon="🎯"
            className="text-3xl px-12 py-8"
          >
            Let's Start Learning!
          </BigButton>
        </div>

        <style>{`
          @keyframes bounce-in {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          .animate-bounce-in {
            animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
          
          .animate-slide-up {
            animation: slide-up 0.6s ease-out forwards;
            opacity: 0;
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
