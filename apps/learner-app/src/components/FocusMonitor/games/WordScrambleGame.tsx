import { useState, useEffect } from 'react';
import { useTheme } from '@aivo/ui';

interface WordScrambleGameProps {
  onComplete: (score: number) => void;
  duration?: number;
}

export function WordScrambleGame({ onComplete, duration = 90 }: WordScrambleGameProps) {
  const { themeConfig } = useTheme();
  const [currentWord, setCurrentWord] = useState<{ word: string; scrambled: string; hint: string }>({ word: '', scrambled: '', hint: '' });
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameOver, setGameOver] = useState(false);

  const words = [
    { word: 'SCIENCE', hint: 'Study of the natural world' },
    { word: 'GRAVITY', hint: 'Force that pulls things down' },
    { word: 'ENERGY', hint: 'Power to do work' },
    { word: 'PLANET', hint: 'Earth is one of these' },
    { word: 'CLIMATE', hint: 'Weather patterns over time' },
    { word: 'MOLECULE', hint: 'Tiny particle of matter' },
    { word: 'OXYGEN', hint: 'Gas we breathe' },
    { word: 'PHOTON', hint: 'Particle of light' },
    { word: 'ALGEBRA', hint: 'Math with variables' },
    { word: 'GEOMETRY', hint: 'Study of shapes' },
  ];

  const scrambleWord = (word: string): string => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  const generateNewWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    const wordObj = words[randomIndex];
    if (!wordObj) return;
    
    let scrambled = scrambleWord(wordObj.word);
    // Make sure it's actually scrambled
    while (scrambled === wordObj.word && wordObj.word.length > 3) {
      scrambled = scrambleWord(wordObj.word);
    }
    setCurrentWord({ word: wordObj.word, hint: wordObj.hint, scrambled });
    setAnswer('');
    setFeedback(null);
  };

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * words.length);
    const wordObj = words[randomIndex];
    if (!wordObj) return;
    
    let scrambled = scrambleWord(wordObj.word);
    while (scrambled === wordObj.word && wordObj.word.length > 3) {
      scrambled = scrambleWord(wordObj.word);
    }
    setCurrentWord({ word: wordObj.word, hint: wordObj.hint, scrambled });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      onComplete(score * 15);
    }
  }, [timeLeft, gameOver, score, onComplete]);

  const handleSubmit = () => {
    if (answer.toUpperCase() === currentWord.word) {
      setScore(score + 1);
      setFeedback('correct');
      setTimeout(() => generateNewWord(), 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleSkip = () => {
    setSkipped(skipped + 1);
    generateNewWord();
  };

  if (gameOver) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🧩</div>
        <h3 className="text-3xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          Word Master!
        </h3>
        <p className="text-xl mb-2">
          Unscrambled: <strong>{score}</strong> words
        </p>
        <p className="text-lg mb-6" style={{ opacity: 0.7 }}>
          Skipped: {skipped}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {score}
          </div>
          <div className="text-sm">Solved</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {timeLeft}s
          </div>
          <div className="text-sm">Time</div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xl font-bold mb-2">Unscramble the word!</p>
        <p className="text-sm mb-6" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
          Hint: {currentWord.hint}
        </p>
        <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="flex justify-center gap-2 mb-4">
            {currentWord.scrambled.split('').map((letter, index) => (
              <div
                key={index}
                className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl font-bold rounded-lg bg-white border-2"
                style={{ borderColor: themeConfig.colors.primary }}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && answer && handleSubmit()}
          placeholder="Type your answer"
          className="w-full p-4 text-2xl text-center rounded-xl border-4 focus:outline-none mb-4 uppercase"
          style={{
            borderColor: feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : themeConfig.colors.border,
            backgroundColor: feedback === 'correct' ? '#dcfce7' : feedback === 'wrong' ? '#fee2e2' : 'white',
          }}
          maxLength={currentWord.word.length}
          autoFocus
        />
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!answer}
            className="flex-1 py-3 rounded-xl font-bold transition transform hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: themeConfig.colors.primary,
              color: 'white',
            }}
          >
            Submit
          </button>
          <button
            onClick={handleSkip}
            className="px-6 py-3 rounded-xl font-bold border-2 transition hover:bg-gray-50"
            style={{
              borderColor: themeConfig.colors.border,
              color: themeConfig.colors.text,
            }}
          >
            Skip
          </button>
        </div>
      </div>

      {feedback === 'correct' && (
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-2">🎉</div>
          <p className="text-xl font-bold text-green-600">
            Correct! The word is {currentWord.word}
          </p>
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="text-center text-2xl text-red-600 animate-shake">
          ❌ Not quite, try again!
        </div>
      )}
    </div>
  );
}
