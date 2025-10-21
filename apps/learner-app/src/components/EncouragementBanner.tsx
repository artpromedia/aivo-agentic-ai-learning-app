import { useState, useEffect } from 'react';

const encouragements = [
  "You're doing amazing! 🌟",
  "Great job! Keep it up! 💪",
  "You're a superstar! ⭐",
  "Fantastic work! 🎉",
  "You're so smart! 🧠",
  "Excellent progress! 🚀",
  "You're unstoppable! 💥",
  "Way to go, champ! 🏆",
];

interface EncouragementBannerProps {
  show?: boolean;
  message?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function EncouragementBanner({
  show = true,
  message,
  onClose,
  autoClose = true,
  duration = 3000
}: EncouragementBannerProps) {
  const [visible, setVisible] = useState(show);
  const displayMessage = message || encouragements[Math.floor(Math.random() * encouragements.length)];

  useEffect(() => {
    setVisible(show);
    
    if (show && autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full shadow-2xl">
        <p className="text-2xl font-bold text-center">{displayMessage}</p>
      </div>
    </div>
  );
}
