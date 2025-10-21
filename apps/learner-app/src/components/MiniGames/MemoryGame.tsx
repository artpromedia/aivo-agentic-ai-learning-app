import React, { useEffect, useMemo, useState, useCallback } from 'react';

interface MemoryGameProps {
  onComplete: (score: number) => void;
  duration: number; // seconds
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ 
  onComplete, 
  duration,
  difficulty = 'easy',
}) => {
  // Difficulty settings
  const gridSize = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 12 : 16;
  
  const symbols = useMemo(() => {
    return difficulty === 'easy' 
      ? ['🍎', '🍌', '🍊']
      : difficulty === 'medium'
      ? ['🍎', '🍌', '🍊', '🍇', '🍓', '🍉']
      : ['🍎', '🍌', '🍊', '🍇', '🍓', '🍉', '🥝', '🍒'];
  }, [difficulty]);

  // Generate shuffled deck
  const deck = useMemo(() => {
    const pairs = [...symbols, ...symbols];
    return pairs.sort(() => Math.random() - 0.5);
  }, [symbols]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<boolean[]>(Array(gridSize).fill(false));
  const [moves, setMoves] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isChecking, setIsChecking] = useState(false);

  const calculateScore = useCallback(() => {
    const matchedPairs = matched.filter(Boolean).length / 2;
    const totalPairs = gridSize / 2;
    const percentComplete = (matchedPairs / totalPairs) * 100;
    
    // Bonus for efficiency (fewer moves)
    const efficiency = Math.max(0, 100 - moves * 5);
    
    const finalScore = Math.round((percentComplete + efficiency) / 2);
    onComplete(Math.min(100, finalScore));
  }, [matched, gridSize, moves, onComplete]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          calculateScore();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateScore]);

  // Check for win condition
  useEffect(() => {
    if (matched.every(Boolean) && matched.length > 0) {
      calculateScore();
    }
  }, [matched, calculateScore]);

  const handleCardClick = (index: number) => {
    if (isChecking || matched[index] || flipped.includes(index) || flipped.length === 2) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      setIsChecking(true);

      const [first, second] = newFlipped;
      const isMatch = first !== undefined && second !== undefined && deck[first] === deck[second];

      setTimeout(() => {
        if (isMatch && first !== undefined && second !== undefined) {
          const newMatched = [...matched];
          newMatched[first] = true;
          newMatched[second] = true;
          setMatched(newMatched);
        }
        setFlipped([]);
        setIsChecking(false);
      }, 800);
    }
  };

  const cols = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 4;

  return (
    <div className="space-y-4" data-testid="memory-game">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">
          ⏱️ Time: {timeRemaining}s
        </div>
        <div className="text-sm text-neutral-600">
          Moves: {moves}
        </div>
        <div className="text-sm font-medium">
          Pairs: {matched.filter(Boolean).length / 2} / {gridSize / 2}
        </div>
      </div>

      {/* Game Grid */}
      <div 
        className={`grid gap-3 max-w-lg mx-auto`}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {deck.map((symbol, index) => {
          const isFlipped = flipped.includes(index);
          const isMatched = matched[index];
          const show = isFlipped || isMatched;

          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              disabled={isMatched || isChecking}
              className={`
                aspect-square rounded-xl text-3xl font-bold
                transition-all duration-300 transform
                ${show ? 'bg-white' : 'bg-blue-500'}
                ${isMatched ? 'bg-green-200 scale-95' : ''}
                ${!isMatched && !show ? 'hover:scale-105 cursor-pointer' : ''}
                ${isMatched ? 'cursor-not-allowed' : ''}
              `}
              data-testid={`card-${index}`}
            >
              {show ? symbol : '?'}
            </button>
          );
        })}
      </div>

      {/* Completion */}
      {matched.every(Boolean) && (
        <div className="text-center p-4 bg-green-50 rounded-xl">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-lg font-semibold">Perfect! All pairs matched!</p>
          <p className="text-sm text-neutral-600">Completed in {moves} moves</p>
        </div>
      )}
    </div>
  );
};
