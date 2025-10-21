import { useState } from 'react';
import { useTheme } from '@aivo/ui';
import { SimonSaysGame } from './games/SimonSaysGame';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { BreathingExercise } from './games/BreathingExercise';
import { ShapeSorterGame } from './games/ShapeSorterGame';
import { CountingGame } from './games/CountingGame';
import { WordScrambleGame } from './games/WordScrambleGame';
import { MathSpeedGame } from './games/MathSpeedGame';
import { ReactionTimeGame } from './games/ReactionTimeGame';
import { LogicPuzzleGame } from './games/LogicPuzzleGame';
import { CodeBreakingGame } from './games/CodeBreakingGame';

interface GameBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBreakComplete: (score: number) => void;
  theme: 'K5' | 'MS' | 'HS';
}

type GameType = 
  | 'simon' 
  | 'memory' 
  | 'breathing'
  | 'shape-sorter'
  | 'counting'
  | 'word-scramble'
  | 'math-speed'
  | 'reaction-time'
  | 'logic-puzzle'
  | 'code-breaking';

interface Game {
  id: GameType;
  name: string;
  icon: string;
  description: string;
  color: string;
  ageGroups: ('K5' | 'MS' | 'HS')[];
}

export function GameBreakModal({ isOpen, onClose, onBreakComplete, theme }: GameBreakModalProps) {
  const { themeConfig } = useTheme();
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  const ALL_GAMES: Game[] = [
    // K5 Games (Ages 5-10)
    {
      id: 'shape-sorter',
      name: 'Shape Sorter',
      icon: '⭐',
      description: 'Match shapes and colors!',
      color: '#f59e0b',
      ageGroups: ['K5'],
    },
    {
      id: 'counting',
      name: 'Counting Fun',
      icon: '🔢',
      description: 'Count the items you see!',
      color: '#14b8a6',
      ageGroups: ['K5'],
    },
    {
      id: 'breathing',
      name: 'Calm Breathing',
      icon: '🧘',
      description: 'Relax with breathing exercises',
      color: '#10b981',
      ageGroups: ['K5', 'MS', 'HS'],
    },
    // MS Games (Ages 11-14)
    {
      id: 'simon',
      name: 'Simon Says',
      icon: '🎮',
      description: 'Test your memory with color patterns',
      color: '#3b82f6',
      ageGroups: ['K5', 'MS'],
    },
    {
      id: 'memory',
      name: 'Memory Match',
      icon: '🃏',
      description: 'Find matching pairs of cards',
      color: '#8b5cf6',
      ageGroups: ['K5', 'MS'],
    },
    {
      id: 'word-scramble',
      name: 'Word Scramble',
      icon: '🧩',
      description: 'Unscramble science words!',
      color: '#ec4899',
      ageGroups: ['MS'],
    },
    {
      id: 'math-speed',
      name: 'Math Sprint',
      icon: '🧮',
      description: 'Solve problems quickly!',
      color: '#06b6d4',
      ageGroups: ['MS', 'HS'],
    },
    // HS Games (Ages 15-18)
    {
      id: 'reaction-time',
      name: 'Reaction Test',
      icon: '⚡',
      description: 'Test your reflexes!',
      color: '#eab308',
      ageGroups: ['MS', 'HS'],
    },
    {
      id: 'logic-puzzle',
      name: 'Logic Puzzle',
      icon: '🧠',
      description: 'Find the pattern!',
      color: '#6366f1',
      ageGroups: ['HS'],
    },
    {
      id: 'code-breaking',
      name: 'Code Breaker',
      icon: '🔐',
      description: 'Decrypt Caesar ciphers!',
      color: '#8b5cf6',
      ageGroups: ['HS'],
    },
  ];

  // Filter games by age group
  const games = ALL_GAMES.filter(game => game.ageGroups.includes(theme));

  if (!isOpen) return null;

  const handleGameComplete = (gameScore: number) => {
    setTimeout(() => {
      onBreakComplete(gameScore);
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setSelectedGame(null);
    onClose();
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    switch (selectedGame) {
      case 'simon':
        return <SimonSaysGame onComplete={handleGameComplete} duration={60} />;
      case 'memory':
        return <MemoryMatchGame onComplete={handleGameComplete} duration={90} />;
      case 'breathing':
        return <BreathingExercise onComplete={handleGameComplete} duration={60} />;
      case 'shape-sorter':
        return <ShapeSorterGame onComplete={handleGameComplete} duration={60} />;
      case 'counting':
        return <CountingGame onComplete={handleGameComplete} duration={60} />;
      case 'word-scramble':
        return <WordScrambleGame onComplete={handleGameComplete} duration={90} />;
      case 'math-speed':
        return <MathSpeedGame onComplete={handleGameComplete} duration={90} />;
      case 'reaction-time':
        return <ReactionTimeGame onComplete={handleGameComplete} rounds={5} />;
      case 'logic-puzzle':
        return <LogicPuzzleGame onComplete={handleGameComplete} duration={120} />;
      case 'code-breaking':
        return <CodeBreakingGame onComplete={handleGameComplete} duration={120} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: themeConfig.colors.surface,
        }}
      >
        {/* Header */}
        <div
          className="p-6 border-b-2"
          style={{ borderColor: themeConfig.colors.border }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: themeConfig.colors.primary }}>
                🎯 Game Break
              </h2>
              <p className="text-sm" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
                Take a quick break to refresh your focus!
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-3xl hover:scale-110 transition transform"
              style={{ color: themeConfig.colors.text }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedGame ? (
            <div className="space-y-4">
              <p className="text-center mb-6" style={{ color: themeConfig.colors.text }}>
                Choose a quick game to help reset your attention:
              </p>
              <div className="grid gap-4">
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game.id)}
                    className="p-6 rounded-2xl border-2 text-left transition transform hover:scale-105 hover:shadow-lg"
                    style={{
                      borderColor: themeConfig.colors.border,
                      backgroundColor: 'white',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${game.color}22` }}
                      >
                        {game.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1" style={{ color: themeConfig.colors.text }}>
                          {game.name}
                        </h3>
                        <p className="text-sm" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
                          {game.description}
                        </p>
                      </div>
                      <div className="text-2xl" style={{ color: game.color }}>
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {renderGame()}

              <div className="mt-6 text-center">
                <button
                  onClick={() => setSelectedGame(null)}
                  className="px-6 py-2 rounded-lg border-2 transition hover:bg-gray-50"
                  style={{
                    borderColor: themeConfig.colors.border,
                    color: themeConfig.colors.text,
                  }}
                >
                  ← Choose Different Game
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t-2 text-center text-sm"
          style={{
            borderColor: themeConfig.colors.border,
            color: themeConfig.colors.text,
            opacity: 0.7,
          }}
        >
          Take your time - you'll return to your lesson when you're ready
        </div>
      </div>
    </div>
  );
}
