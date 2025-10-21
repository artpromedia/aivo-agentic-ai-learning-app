import { useState, useEffect } from 'react';
import { useTheme } from '@aivo/ui';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchGameProps {
  onComplete: (score: number) => void;
  duration?: number;
}

export function MemoryMatchGame({ onComplete, duration = 60 }: MemoryMatchGameProps) {
  const { themeConfig } = useTheme();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameOver, setGameOver] = useState(false);

  const emojis = ['🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍒', '🍑'];

  // Initialize game
  useEffect(() => {
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      onComplete(matches * 10);
    }
  }, [timeLeft, gameOver, matches, onComplete]);

  // Check for match
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (first === undefined || second === undefined) return;
      
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match!
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatches(matches + 1);
          setFlippedCards([]);

          // Check if game won
          if (matches + 1 === emojis.length) {
            setTimeout(() => {
              setGameOver(true);
              onComplete((matches + 1) * 10 + timeLeft);
            }, 500);
          }
        }, 800);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards, matches, timeLeft, onComplete, emojis.length]);

  const handleCardClick = (id: number) => {
    if (gameOver || flippedCards.length >= 2) return;
    
    const card = cards[id];
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev =>
      prev.map(c => (c.id === id ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards([...flippedCards, id]);
    
    if (flippedCards.length === 1) {
      setMoves(moves + 1);
    }
  };

  if (gameOver) {
    const score = matches * 10 + (matches === emojis.length ? timeLeft : 0);
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">
          {matches === emojis.length ? '🎉' : '⏰'}
        </div>
        <h3 className="text-3xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          {matches === emojis.length ? 'You Won!' : 'Time\'s Up!'}
        </h3>
        <p className="text-xl mb-2">
          Matches: <strong>{matches}</strong> / {emojis.length}
        </p>
        <p className="text-xl mb-6">
          Score: <strong>{score}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {matches}/{emojis.length}
          </div>
          <div className="text-sm">Matches</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {moves}
          </div>
          <div className="text-sm">Moves</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {timeLeft}s
          </div>
          <div className="text-sm">Time</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className="aspect-square rounded-xl transition-all transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: card.isFlipped || card.isMatched ? '#fff' : themeConfig.colors.primary,
              border: `3px solid ${themeConfig.colors.border}`,
              opacity: card.isMatched ? 0.5 : 1,
            }}
          >
            <div className="text-4xl">
              {card.isFlipped || card.isMatched ? card.emoji : '?'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
