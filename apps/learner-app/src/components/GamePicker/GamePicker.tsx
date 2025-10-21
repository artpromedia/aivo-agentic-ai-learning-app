import React, { useEffect, useState } from 'react';
import { Button, Card } from '@aivo/ui';

export type GameType = 'reaction' | 'breathing' | 'memory' | 'pattern' | 'sorting';

export interface MiniGame {
  id: GameType;
  name: string;
  description: string;
  icon: string;
  duration: string; // e.g., "2-3 min"
  benefits: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'attention' | 'relaxation' | 'cognitive' | 'motor';
}

const GAME_CATALOG: Record<GameType, MiniGame> = {
  reaction: {
    id: 'reaction',
    name: 'Quick Reflex',
    description: 'Tap as soon as the screen turns green. Tests reaction time and attention.',
    icon: '⚡',
    duration: '2-3 min',
    benefits: ['Improves attention', 'Quick decision making', 'Hand-eye coordination'],
    difficulty: 'easy',
    category: 'attention',
  },
  breathing: {
    id: 'breathing',
    name: 'Breathing Coach',
    description: 'Follow the breathing pattern to calm your mind and reset focus.',
    icon: '🫁',
    duration: '3-5 min',
    benefits: ['Reduces stress', 'Improves focus', 'Calms emotions'],
    difficulty: 'easy',
    category: 'relaxation',
  },
  memory: {
    id: 'memory',
    name: 'Memory Match',
    description: 'Flip cards to find matching pairs. Builds working memory.',
    icon: '🧠',
    duration: '3-4 min',
    benefits: ['Strengthens memory', 'Pattern recognition', 'Concentration'],
    difficulty: 'medium',
    category: 'cognitive',
  },
  pattern: {
    id: 'pattern',
    name: 'Pattern Finder',
    description: 'Identify the pattern in the sequence and predict what comes next.',
    icon: '🔢',
    duration: '3-4 min',
    benefits: ['Logical thinking', 'Problem solving', 'Attention to detail'],
    difficulty: 'medium',
    category: 'cognitive',
  },
  sorting: {
    id: 'sorting',
    name: 'Quick Sort',
    description: 'Sort items by color, size, or category as fast as you can.',
    icon: '🎯',
    duration: '2-3 min',
    benefits: ['Processing speed', 'Categorization', 'Motor skills'],
    difficulty: 'easy',
    category: 'motor',
  },
};

interface GamePickerProps {
  focusState: 'focused' | 'wandering' | 'distracted';
  theme: 'K5' | 'MS' | 'HS';
  previousGames: GameType[];
  onGameSelected: (gameId: GameType) => void;
  onCancel: () => void;
}

export const GamePicker: React.FC<GamePickerProps> = ({
  focusState,
  theme,
  previousGames,
  onGameSelected,
  onCancel,
}) => {
  const [suggestions, setSuggestions] = useState<MiniGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  // AI-powered game selection algorithm
  useEffect(() => {
    const generateSuggestions = () => {
      let pool: MiniGame[] = Object.values(GAME_CATALOG);

      // Filter based on focus state
      if (focusState === 'distracted') {
        // Prioritize relaxation and attention games
        pool = pool.filter(g => g.category === 'relaxation' || g.category === 'attention');
      } else if (focusState === 'wandering') {
        // Mix of cognitive and attention games
        pool = pool.filter(g => g.category === 'cognitive' || g.category === 'attention');
      }

      // Adjust difficulty based on theme
      if (theme === 'K5') {
        pool = pool.filter(g => g.difficulty === 'easy');
      } else if (theme === 'HS') {
        pool = pool.filter(g => g.difficulty !== 'easy');
      }

      // Avoid recently played games
      pool = pool.filter(g => !previousGames.slice(-3).includes(g.id));

      // Shuffle and pick 2-3 games
      const shuffled = pool.sort(() => Math.random() - 0.5);
      const count = Math.random() < 0.5 ? 2 : 3;
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));

      // If breathing isn't already included and state is distracted, force include it
      if (focusState === 'distracted' && !selected.find(g => g.id === 'breathing')) {
        selected[selected.length - 1] = GAME_CATALOG.breathing;
      }

      setSuggestions(selected);
    };

    generateSuggestions();
  }, [focusState, theme, previousGames]);

  const handleSelect = (gameId: GameType) => {
    setSelectedGame(gameId);
    // Small delay for visual feedback
    setTimeout(() => {
      onGameSelected(gameId);
    }, 200);
  };

  return (
    <div className="space-y-6" data-testid="game-picker">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          Pick Your Game Break
        </h2>
        <p className="text-neutral-600">
          Your AI coach suggests these games to help you reset and refocus.
        </p>
      </div>

      {/* Game Cards */}
      <div className={`grid gap-4 ${suggestions.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {suggestions.map((game) => (
          <div
            key={game.id}
            className={`cursor-pointer transition-all ${
              selectedGame === game.id ? 'scale-105' : ''
            }`}
            onClick={() => handleSelect(game.id)}
            data-testid={`game-card-${game.id}`}
          >
            <Card
              hover
              className={selectedGame === game.id ? 'ring-4 ring-blue-500' : ''}
            >
            <div className="flex items-start gap-4">
              <div className="text-5xl flex-shrink-0">
                {game.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">
                  {game.name}
                </h3>
                <p className="text-sm text-neutral-600 mb-3">
                  {game.description}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    ⏱️ {game.duration}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    game.difficulty === 'easy' 
                      ? 'bg-green-100 text-green-700'
                      : game.difficulty === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>

                {/* Benefits */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-700">Benefits:</p>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    {game.benefits.slice(0, 2).map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-600">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(game.id);
                  }}
                  data-testid={`play-${game.id}`}
                >
                  Play {game.name}
                </Button>
              </div>
            </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Why These Games? */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold mb-2">Why these games?</h4>
            <p className="text-sm text-neutral-700">
              {focusState === 'distracted' 
                ? "You seem very distracted. These games will help calm your mind and restore focus through relaxation and attention exercises."
                : focusState === 'wandering'
                ? "Your attention is drifting. These games will re-engage your brain with fun cognitive challenges."
                : "Great focus! These games will give you a mental break while keeping you engaged."}
            </p>
          </div>
        </div>
      </Card>

      {/* Cancel Option */}
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          data-testid="cancel-game-picker"
        >
          Not now, back to learning
        </Button>
      </div>
    </div>
  );
};
