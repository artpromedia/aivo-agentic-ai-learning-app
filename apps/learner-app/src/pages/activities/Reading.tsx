import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigButton } from '../../components/BigButton';
import { ProgressRing } from '../../components/ProgressRing';
import { EncouragementBanner } from '../../components/EncouragementBanner';
import { ExitConfirmation } from '../../components/ExitConfirmation';

interface Word {
  text: string;
  definition: string;
}

const story = {
  title: "The Friendly Dragon 🐉",
  sentences: [
    "Once upon a time, there was a friendly dragon named Spark.",
    "Spark loved to fly high in the sky and breathe colorful fire.",
    "One day, Spark met a little girl named Luna.",
    "Luna was scared at first, but Spark smiled warmly.",
    "They became best friends and went on amazing adventures together!",
  ],
  words: [
    { text: "friendly", definition: "Nice and kind to others" },
    { text: "breathe", definition: "To let air in and out" },
    { text: "adventures", definition: "Exciting experiences" },
  ] as Word[],
};

const questions = [
  {
    question: "What is the dragon's name?",
    options: ["Luna", "Spark", "Fire", "Sky"],
    correct: 1,
  },
  {
    question: "What did Spark like to do?",
    options: ["Sleep", "Fly in the sky", "Swim", "Hide"],
    correct: 1,
  },
  {
    question: "How did Luna feel at first?",
    options: ["Happy", "Excited", "Scared", "Angry"],
    correct: 2,
  },
];

export function ReadingActivity() {
  const navigate = useNavigate();
  const [currentSentence, setCurrentSentence] = useState(0);
  const [isReading, setIsReading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const progress = isReading
    ? ((currentSentence + 1) / story.sentences.length) * 100
    : ((currentQuestion + 1) / questions.length) * 100;

  const handleReadNext = () => {
    if (currentSentence < story.sentences.length - 1) {
      setCurrentSentence(currentSentence + 1);
    } else {
      setIsReading(false);
    }
  };

  const handleReadPrevious = () => {
    if (currentSentence > 0) {
      setCurrentSentence(currentSentence - 1);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const isCorrect = optionIndex === questions[currentQuestion]?.correct;
    
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }
    
    setShowEncouragement(true);
    
    setTimeout(() => {
      setShowEncouragement(false);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Activity complete
        navigate('/subjects');
      }
    }, 1500);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(story.sentences[currentSentence]);
      utterance.rate = 0.8; // Slower for children
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-5xl font-bold text-neutral-900 flex items-center gap-4">
            📚 Reading Time
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
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ProgressRing progress={progress} size={60} strokeWidth={6} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {isReading ? (
          // Reading View
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-center text-purple-600 mb-8">
              {story.title}
            </h2>

            {/* Story Text */}
            <div className="mb-8 min-h-[200px] flex items-center justify-center">
              <p className="text-4xl leading-relaxed text-neutral-900 text-center">
                {story.sentences[currentSentence]}
              </p>
            </div>

            {/* Text-to-Speech Button */}
            <div className="flex justify-center mb-8">
              <BigButton
                onClick={handleSpeak}
                variant="secondary"
                icon={isSpeaking ? "⏸️" : "🔊"}
                disabled={isSpeaking}
              >
                {isSpeaking ? "Speaking..." : "Listen"}
              </BigButton>
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-4">
              <BigButton
                onClick={handleReadPrevious}
                variant="secondary"
                disabled={currentSentence === 0}
                icon="←"
              >
                Previous
              </BigButton>
              <BigButton
                onClick={handleReadNext}
                variant="primary"
                icon={currentSentence === story.sentences.length - 1 ? "✓" : "→"}
              >
                {currentSentence === story.sentences.length - 1 ? "Finish Reading" : "Next"}
              </BigButton>
            </div>
          </div>
        ) : (
          // Questions View
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-center text-purple-600 mb-8">
              Let's check what you remember! 🤔
            </h2>

            <p className="text-3xl text-neutral-900 mb-8 text-center font-semibold">
              {questions[currentQuestion]?.question}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {questions[currentQuestion]?.options.map((option, index) => (
                <BigButton
                  key={index}
                  onClick={() => handleAnswer(index)}
                  variant={index % 2 === 0 ? 'primary' : 'success'}
                  className="min-h-[100px] text-xl"
                >
                  {option}
                </BigButton>
              ))}
            </div>
          </div>
        )}
      </div>

      <EncouragementBanner show={showEncouragement} />
      <ExitConfirmation
        isOpen={showExitConfirmation}
        onConfirm={() => navigate('/subjects')}
        onCancel={() => setShowExitConfirmation(false)}
      />
    </div>
  );
}
