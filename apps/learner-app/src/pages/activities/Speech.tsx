import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigButton } from '../../components/BigButton';
import { ProgressRing } from '../../components/ProgressRing';
import { EncouragementBanner } from '../../components/EncouragementBanner';
import { ExitConfirmation } from '../../components/ExitConfirmation';

interface SpeechPrompt {
  text: string;
  word: string;
  example: string;
}

const prompts: SpeechPrompt[] = [
  {
    text: "Say the word: HELLO",
    word: "hello",
    example: "Say it like: HEH-low",
  },
  {
    text: "Say the word: THANK YOU",
    word: "thank you",
    example: "Say it like: THANK yoo",
  },
  {
    text: "Say the word: PLEASE",
    word: "please",
    example: "Say it like: PLEEZ",
  },
  {
    text: "Tell me your favorite color",
    word: "color",
    example: "My favorite color is...",
  },
];

export function SpeechActivity() {
  const navigate = useNavigate();
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<number | null>(null);

  const prompt = prompts[currentPrompt];
  const progress = ((currentPrompt + 1) / prompts.length) * 100;

  if (!prompt) return null;

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Simulate recording timer
    recordingInterval.current = window.setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 5) {
          handleStopRecording();
          return 5;
        }
        return prev + 0.1;
      });
    }, 100);

    // In a real app, start actual recording here
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Web Speech API would be used here
      console.log('Starting speech recognition...');
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
    
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
  };

  const handlePlayExample = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(prompt.word);
      utterance.rate = 0.7; // Slower for children
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    setShowEncouragement(true);
    setHasRecorded(false);
    
    setTimeout(() => {
      setShowEncouragement(false);
      if (currentPrompt < prompts.length - 1) {
        setCurrentPrompt(currentPrompt + 1);
      } else {
        // Activity complete
        navigate('/subjects');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-5xl font-bold text-neutral-900 flex items-center gap-4">
            🗣️ Speech Practice
          </h1>
          <button
            onClick={() => setShowExitConfirmation(true)}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-3xl shadow-lg transform hover:scale-110 transition-all duration-200"
            aria-label="Exit activity"
          >
            🚪
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-6 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ProgressRing progress={progress} size={60} strokeWidth={6} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-12 shadow-2xl">
          {/* Prompt */}
          <h2 className="text-5xl font-bold text-center text-purple-600 mb-8">
            {prompt.text}
          </h2>

          {/* Example */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 text-center">
            <p className="text-2xl text-neutral-700 mb-4">{prompt.example}</p>
            <BigButton
              onClick={handlePlayExample}
              variant="secondary"
              icon="🔊"
            >
              Hear Example
            </BigButton>
          </div>

          {/* Recording Area */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-12 mb-8 flex flex-col items-center">
            {/* Microphone Visual */}
            <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 animate-pulse-ring' 
                : 'bg-gradient-to-br from-purple-400 to-pink-400'
            }`}>
              <span className="text-8xl">🎤</span>
            </div>

            {/* Recording Timer */}
            {isRecording && (
              <div className="text-4xl font-bold text-red-600 mb-6 animate-pulse">
                {recordingTime.toFixed(1)}s
              </div>
            )}

            {/* Waveform Visual (Simulated) */}
            {isRecording && (
              <div className="flex gap-2 mb-6">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-purple-500 rounded-full animate-wave"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      height: `${Math.random() * 40 + 20}px`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Recording Button */}
            {!isRecording && !hasRecorded && (
              <BigButton
                onClick={handleStartRecording}
                variant="primary"
                icon="🎙️"
                className="text-2xl"
              >
                Start Recording
              </BigButton>
            )}

            {isRecording && (
              <BigButton
                onClick={handleStopRecording}
                variant="warning"
                icon="⏹️"
                className="text-2xl"
              >
                Stop Recording
              </BigButton>
            )}

            {hasRecorded && !isRecording && (
              <div className="flex flex-col gap-4">
                <BigButton
                  onClick={handleStartRecording}
                  variant="secondary"
                  icon="🔄"
                >
                  Record Again
                </BigButton>
                <BigButton
                  onClick={handleNext}
                  variant="success"
                  icon="✓"
                >
                  Great! Next One
                </BigButton>
              </div>
            )}
          </div>

          {/* Encouragement */}
          <div className="text-center">
            <p className="text-2xl text-purple-600">
              Take your time and speak clearly! You're doing great! 🌟
            </p>
          </div>
        </div>
      </div>

      <EncouragementBanner show={showEncouragement} />
      <ExitConfirmation
        isOpen={showExitConfirmation}
        onConfirm={() => navigate('/subjects')}
        onCancel={() => setShowExitConfirmation(false)}
      />

      <style>{`
        @keyframes pulse-ring {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            box-shadow: 0 0 0 30px rgba(239, 68, 68, 0);
          }
        }
        
        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1.5);
          }
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 1.5s ease-out infinite;
        }
        
        .animate-wave {
          animation: wave 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
