import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigButton } from '../components/BigButton';

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
  category: 'reading' | 'math' | 'speech' | 'special';
}

const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'First Steps',
    icon: '👣',
    description: 'Completed your first activity!',
    earned: true,
    earnedDate: 'Today',
    category: 'special',
  },
  {
    id: '2',
    name: 'Reading Star',
    icon: '⭐',
    description: 'Read 5 stories',
    earned: true,
    earnedDate: 'Yesterday',
    category: 'reading',
  },
  {
    id: '3',
    name: 'Math Wizard',
    icon: '🧙',
    description: 'Solved 10 math problems',
    earned: true,
    earnedDate: '2 days ago',
    category: 'math',
  },
  {
    id: '4',
    name: 'Speech Champion',
    icon: '🏆',
    description: 'Practiced speaking 5 times',
    earned: false,
    category: 'speech',
  },
  {
    id: '5',
    name: 'Bookworm',
    icon: '📚',
    description: 'Read 20 stories',
    earned: false,
    category: 'reading',
  },
  {
    id: '6',
    name: 'Number Master',
    icon: '🔢',
    description: 'Solved 50 math problems',
    earned: false,
    category: 'math',
  },
  {
    id: '7',
    name: 'Super Speaker',
    icon: '🎤',
    description: 'Practiced speaking 20 times',
    earned: false,
    category: 'speech',
  },
  {
    id: '8',
    name: 'Streak Keeper',
    icon: '🔥',
    description: 'Learn 7 days in a row',
    earned: false,
    category: 'special',
  },
  {
    id: '9',
    name: 'Perfect Score',
    icon: '💯',
    description: 'Get 100% on any activity',
    earned: false,
    category: 'special',
  },
];

const categories = [
  { id: 'all', name: 'All', icon: '🌟' },
  { id: 'reading', name: 'Reading', icon: '📚' },
  { id: 'math', name: 'Math', icon: '🔢' },
  { id: 'speech', name: 'Speech', icon: '🗣️' },
  { id: 'special', name: 'Special', icon: '✨' },
];

export function Rewards() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredBadges = selectedCategory === 'all'
    ? mockBadges
    : mockBadges.filter(badge => badge.category === selectedCategory);

  const earnedCount = mockBadges.filter(b => b.earned).length;
  const totalCount = mockBadges.length;
  const progress = (earnedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-6xl font-bold text-neutral-900 mb-2 flex items-center gap-4">
              🏆 My Rewards
            </h1>
            <p className="text-2xl text-purple-600">
              You've earned {earnedCount} out of {totalCount} badges!
            </p>
          </div>
          <button
            onClick={() => navigate('/subjects')}
            className="w-20 h-20 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-4xl shadow-lg transform hover:scale-110 transition-all duration-200"
            aria-label="Back to subjects"
          >
            ←
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="h-8 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-3xl font-bold text-purple-600">
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-8 py-4 rounded-2xl text-2xl font-semibold transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 shadow'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredBadges.map((badge, index) => (
            <div
              key={badge.id}
              className={`rounded-3xl p-8 shadow-xl transition-all duration-300 transform hover:scale-105 ${
                badge.earned
                  ? 'bg-white animate-slide-up'
                  : 'bg-neutral-200 opacity-60'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Badge Icon */}
              <div className={`text-8xl text-center mb-4 ${
                badge.earned ? 'animate-bounce-slow' : 'grayscale'
              }`}>
                {badge.icon}
              </div>

              {/* Badge Name */}
              <h3 className="text-2xl font-bold text-center text-neutral-900 mb-2">
                {badge.name}
              </h3>

              {/* Description */}
              <p className="text-lg text-center text-neutral-600 mb-4">
                {badge.description}
              </p>

              {/* Status */}
              {badge.earned ? (
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-xl p-3 text-center">
                  <p className="text-green-700 font-semibold">
                    ✓ Earned {badge.earnedDate}
                  </p>
                </div>
              ) : (
                <div className="bg-neutral-100 border-2 border-neutral-300 rounded-xl p-3 text-center">
                  <p className="text-neutral-500 font-semibold">
                    🔒 Keep learning!
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Encouragement */}
        {earnedCount > 0 && (
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-3xl p-8 shadow-2xl text-center mb-8">
            <p className="text-4xl font-bold text-white mb-2">
              🎉 You're Amazing! 🎉
            </p>
            <p className="text-2xl text-white">
              Keep learning to unlock more badges!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          <BigButton
            onClick={() => navigate('/subjects')}
            variant="primary"
            icon="📚"
            className="text-2xl"
          >
            Keep Learning
          </BigButton>
          <BigButton
            onClick={() => {
              // Copy achievement summary to clipboard
              const text = `🎉 Check out my progress on Aivo Learning!\n\n` +
                          `I'm learning and earning rewards! 🏆`;
              navigator.clipboard.writeText(text).then(() => {
                alert('✅ Message copied to clipboard! Paste and share it with your friends and family!');
              }).catch(() => {
                alert('📤 Share your progress:\n\n' + text);
              });
            }}
            variant="secondary"
            icon="📤"
            className="text-2xl"
          >
            Share Progress
          </BigButton>
        </div>

        <style>{`
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
