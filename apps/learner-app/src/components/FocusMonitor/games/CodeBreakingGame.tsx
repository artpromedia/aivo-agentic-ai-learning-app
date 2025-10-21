import { useState, useEffect } from 'react';
import { useTheme } from '@aivo/ui';

interface CodeBreakingGameProps {
  onComplete: (score: number) => void;
  duration?: number;
}

const WORDS = [
  'ALGORITHM', 'BINARY', 'CODE', 'DEBUG', 'EXECUTE',
  'FUNCTION', 'GRAPH', 'HASH', 'INDEX', 'JSON',
  'KERNEL', 'LOGIC', 'MATRIX', 'NODE', 'OBJECT',
  'PYTHON', 'QUERY', 'REACT', 'STACK', 'TOKEN',
];

export function CodeBreakingGame({ onComplete, duration = 120 }: CodeBreakingGameProps) {
  const { themeConfig } = useTheme();
  const [code, setCode] = useState({ encrypted: '', decrypted: '', key: 0 });
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameOver, setGameOver] = useState(false);

  const caesarCipher = (text: string, shift: number): string => {
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        return char;
      })
      .join('');
  };

  const generateCode = () => {
    const wordIndex = Math.floor(Math.random() * WORDS.length);
    const word = WORDS[wordIndex] || 'CODE';
    const shift = Math.floor(Math.random() * 25) + 1; // 1-25
    const encrypted = caesarCipher(word, shift);
    
    setCode({ encrypted, decrypted: word, key: shift });
    setAnswer('');
    setFeedback(null);
    setShowHint(false);
  };

  useEffect(() => {
    const wordIndex = Math.floor(Math.random() * WORDS.length);
    const word = WORDS[wordIndex] || 'CODE';
    const shift = Math.floor(Math.random() * 25) + 1;
    const encrypted = caesarCipher(word, shift);
    setCode({ encrypted, decrypted: word, key: shift });
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      onComplete(score * 25);
    }
  }, [timeLeft, gameOver, score, onComplete]);

  const handleSubmit = () => {
    if (answer.toUpperCase() === code.decrypted) {
      setScore(score + 1);
      setFeedback('correct');
      setTimeout(() => generateCode(), 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const useHint = () => {
    if (hints > 0) {
      setHints(hints - 1);
      setShowHint(true);
    }
  };

  if (gameOver) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🔐</div>
        <h3 className="text-3xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          Code Breaker!
        </h3>
        <p className="text-xl mb-2">
          Cracked: <strong>{score}</strong> codes
        </p>
        <p className="text-lg mb-6" style={{ opacity: 0.7 }}>
          Hints Used: {3 - hints}
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
          <div className="text-sm">Cracked</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {hints}
          </div>
          <div className="text-sm">Hints</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: themeConfig.colors.primary }}>
            {timeLeft}s
          </div>
          <div className="text-sm">Time</div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xl font-bold mb-4">Caesar Cipher Challenge</p>
        <p className="text-sm mb-6" style={{ opacity: 0.7 }}>
          Decode the encrypted message by shifting letters backward
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <div className="text-center mb-4">
          <div className="text-sm font-bold mb-2" style={{ color: themeConfig.colors.text, opacity: 0.6 }}>
            ENCRYPTED
          </div>
          <div className="flex justify-center gap-1">
            {code.encrypted.split('').map((char, index) => (
              <div
                key={index}
                className="w-10 h-12 md:w-12 md:h-14 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-lg"
                style={{
                  backgroundColor: themeConfig.colors.primary,
                  color: 'white',
                }}
              >
                {char}
              </div>
            ))}
          </div>
        </div>

        {showHint && (
          <div className="mt-6 p-4 rounded-lg bg-yellow-100 border-2 border-yellow-300">
            <p className="text-sm font-bold mb-1">💡 Hint:</p>
            <p className="text-sm">
              The first letter is: <strong className="text-xl">{code.decrypted[0]}</strong>
            </p>
            <p className="text-xs mt-2" style={{ opacity: 0.7 }}>
              (Caesar shift of {code.key} positions)
            </p>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.toUpperCase())}
          onKeyPress={(e) => e.key === 'Enter' && answer && handleSubmit()}
          placeholder="Type the decoded word"
          className="w-full p-4 text-2xl text-center rounded-xl border-4 focus:outline-none mb-4 uppercase tracking-wider"
          style={{
            borderColor: feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : themeConfig.colors.border,
            backgroundColor: feedback === 'correct' ? '#dcfce7' : feedback === 'wrong' ? '#fee2e2' : 'white',
          }}
          maxLength={code.decrypted.length}
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
            Decrypt
          </button>
          <button
            onClick={useHint}
            disabled={hints === 0 || showHint}
            className="px-6 py-3 rounded-xl font-bold border-2 transition hover:bg-yellow-50 disabled:opacity-30"
            style={{
              borderColor: '#eab308',
              color: '#ca8a04',
            }}
          >
            💡 Hint
          </button>
        </div>
      </div>

      {feedback === 'correct' && (
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-2">🎉</div>
          <p className="text-xl font-bold text-green-600">
            Code Cracked! The word was {code.decrypted}
          </p>
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="text-center text-2xl text-red-600 animate-shake">
          ❌ Keep trying!
        </div>
      )}
    </div>
  );
}
