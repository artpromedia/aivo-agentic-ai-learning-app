import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '@aivo/ui';
import { getSubject } from '../config/subjects';
import { WritingPad } from '../components/WritingPad';
import { DrawPad } from '../components/WritingPad';
import { VideoLesson } from '../components/lesson/VideoLesson';
import { PracticeExercises } from '../components/lesson/PracticeExercises';
import { LearningGame } from '../components/lesson/LearningGame';
import { ProgressTracker } from '../components/lesson/ProgressTracker';
import { FocusMonitor } from '../components/FocusMonitor/FocusMonitor';
import { GameBreakModal } from '../components/FocusMonitor/GameBreakModal';

export function ActivityPage() {
  const { theme: themeParam, subjectId, activityId } = useParams<{
    theme: string;
    subjectId: string;
    activityId: string;
  }>();
  const navigate = useNavigate();
  const { themeConfig } = useTheme();
  const [completed, setCompleted] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'practice' | 'game' | 'progress'>('video');
  const [showGameBreak, setShowGameBreak] = useState(false);
  const [breaksUsedToday, setBreaksUsedToday] = useState(0);

  const theme = (themeParam?.toUpperCase() as 'K5' | 'MS' | 'HS') || 'K5';
  const subject = getSubject(theme, subjectId || '');

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Activity Not Found</h2>
          <button
            className="px-6 py-3 rounded-xl bg-neutral-900 text-white"
            onClick={() => navigate(`/learner/${themeParam}/subject/${subjectId}`)}
          >
            Back to Subject
          </button>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    setCompleted(true);
    // TODO: Save completion to backend/localStorage
    setTimeout(() => {
      navigate(`/learner/${themeParam}/subject/${subjectId}`);
    }, 2000);
  };

  // Sample content data
  const lessonContent = {
    video: {
      title: activityId?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Lesson',
      captions: [
        { time: 0, text: 'Welcome to this lesson!' },
        { time: 30, text: 'Today we will learn important concepts.' },
        { time: 60, text: 'Pay attention to the key ideas.' },
        { time: 120, text: 'Let\'s see some examples.' },
        { time: 180, text: 'Practice makes perfect!' },
      ],
    },
    practice: [
      {
        id: 'q1',
        type: 'multiple-choice' as const,
        question: 'What is the main topic of this lesson?',
        options: ['Counting', 'Addition', 'Subtraction', 'Multiplication'],
        correctAnswer: 'Counting',
        explanation: 'This lesson focuses on counting fundamentals.',
        hint: 'Think about what we learned in the video.',
      },
      {
        id: 'q2',
        type: 'true-false' as const,
        question: 'Practice is important for learning.',
        correctAnswer: 'True',
        explanation: 'Practice helps reinforce concepts and build skills.',
      },
      {
        id: 'q3',
        type: 'fill-blank' as const,
        question: 'The sum of 2 + 2 equals ____',
        correctAnswer: '4',
        explanation: '2 + 2 = 4. Addition combines numbers together.',
        hint: 'Try adding 2 and 2 together.',
      },
    ],
    game: {
      type: 'matching' as const,
      title: 'Match the Concepts',
      items: [
        { id: '1', content: 'Addition', matchId: '5' },
        { id: '2', content: 'Subtraction', matchId: '6' },
        { id: '3', content: 'Multiplication', matchId: '7' },
        { id: '4', content: 'Division', matchId: '8' },
        { id: '5', content: 'Combining numbers', matchId: '1' },
        { id: '6', content: 'Taking away', matchId: '2' },
        { id: '7', content: 'Repeated addition', matchId: '3' },
        { id: '8', content: 'Splitting into groups', matchId: '4' },
      ],
    },
    progress: {
      completedLessons: 12,
      totalLessons: 24,
      averageScore: 85,
      timeSpent: 320,
      streak: 7,
      badges: [
        { name: 'Quick Learner', icon: '⚡', description: 'Completed 5 lessons' },
        { name: 'Perfect Score', icon: '💯', description: 'Got 100% on a quiz' },
        { name: 'Consistent', icon: '🔥', description: '7 day streak' },
      ],
      recentActivity: [
        { date: 'Today', activity: 'Completed Addition Basics', score: 90 },
        { date: 'Yesterday', activity: 'Practiced Counting', score: 100 },
        { date: '2 days ago', activity: 'Number Recognition', score: 75 },
      ],
    },
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: `linear-gradient(to bottom right, ${themeConfig.colors.background}, ${themeConfig.colors.primary}22)`,
      }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          className="px-4 py-2 rounded-lg border-2 mb-4 transition hover:bg-white"
          style={{
            borderColor: themeConfig.colors.border,
            color: themeConfig.colors.text,
          }}
          onClick={() => navigate(`/learner/${themeParam}/subject/${subjectId}`)}
        >
          ← Back to {subject.displayName}
        </button>

        <div
          className="rounded-2xl p-6 shadow-lg"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderWidth: '2px',
            borderColor: themeConfig.colors.border,
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="text-6xl"
              style={{ fontSize: themeConfig.iconSize.subject }}
            >
              {subject.icon}
            </div>
            <div className="flex-1">
              <h1
                className="font-bold mb-2"
                style={{
                  fontSize: themeConfig.fontSize.heading,
                  color: themeConfig.colors.text,
                }}
              >
                {activityId?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h1>
              <p
                style={{
                  fontSize: themeConfig.fontSize.base,
                  color: themeConfig.colors.text,
                  opacity: 0.8,
                }}
              >
                Interactive lesson from {subject.displayName}
              </p>
            </div>
            {completed && (
              <div className="text-6xl animate-bounce">
                ✅
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Focus Monitor */}
        <FocusMonitor
          learnerId="demo-learner"
          subjectId={subjectId || ''}
          theme={theme}
          onGameBreakSuggested={() => setShowGameBreak(true)}
          maxBreaksPerDay={3}
          breaksUsedToday={breaksUsedToday}
          allowManualBreaks={true}
        />

        {/* Introduction Card */}
        <div
          className="rounded-2xl p-8 shadow-lg"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderWidth: '2px',
            borderColor: themeConfig.colors.border,
          }}
        >
          <h2
            className="font-bold mb-4"
            style={{
              fontSize: `calc(${themeConfig.fontSize.heading} * 1.2)`,
              color: themeConfig.colors.primary,
            }}
          >
            📚 Lesson Overview
          </h2>
          <div
            className="space-y-4"
            style={{
              fontSize: themeConfig.fontSize.base,
              color: themeConfig.colors.text,
            }}
          >
            <p>
              Welcome to this interactive lesson! You'll learn through engaging activities
              designed just for your grade level.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-semibold text-blue-900">Learning Goals</div>
                <div className="text-sm text-blue-700 mt-1">
                  Master key concepts through practice
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="font-semibold text-green-900">Time Estimate</div>
                <div className="text-sm text-green-700 mt-1">
                  15-20 minutes
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="text-3xl mb-2">⭐</div>
                <div className="font-semibold text-purple-900">Earn Points</div>
                <div className="text-sm text-purple-700 mt-1">
                  Complete to earn 50 points
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Content Card */}
        <div
          className="rounded-2xl p-8 shadow-lg"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderWidth: '2px',
            borderColor: themeConfig.colors.border,
          }}
        >
          <h2
            className="font-bold mb-6"
            style={{
              fontSize: `calc(${themeConfig.fontSize.heading} * 1.2)`,
              color: themeConfig.colors.primary,
            }}
          >
            🎓 Let's Learn!
          </h2>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-6 py-3 rounded-xl font-medium transition transform hover:scale-105 ${
                activeTab === 'video' ? 'shadow-lg' : 'opacity-70'
              }`}
              style={{
                backgroundColor: activeTab === 'video' ? themeConfig.colors.primary : themeConfig.colors.surface,
                color: activeTab === 'video' ? 'white' : themeConfig.colors.text,
                border: `2px solid ${activeTab === 'video' ? themeConfig.colors.primary : themeConfig.colors.border}`,
              }}
            >
              📹 Video Lesson
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-6 py-3 rounded-xl font-medium transition transform hover:scale-105 ${
                activeTab === 'practice' ? 'shadow-lg' : 'opacity-70'
              }`}
              style={{
                backgroundColor: activeTab === 'practice' ? themeConfig.colors.primary : themeConfig.colors.surface,
                color: activeTab === 'practice' ? 'white' : themeConfig.colors.text,
                border: `2px solid ${activeTab === 'practice' ? themeConfig.colors.primary : themeConfig.colors.border}`,
              }}
            >
              ✍️ Practice
            </button>
            <button
              onClick={() => setActiveTab('game')}
              className={`px-6 py-3 rounded-xl font-medium transition transform hover:scale-105 ${
                activeTab === 'game' ? 'shadow-lg' : 'opacity-70'
              }`}
              style={{
                backgroundColor: activeTab === 'game' ? themeConfig.colors.primary : themeConfig.colors.surface,
                color: activeTab === 'game' ? 'white' : themeConfig.colors.text,
                border: `2px solid ${activeTab === 'game' ? themeConfig.colors.primary : themeConfig.colors.border}`,
              }}
            >
              🎮 Game
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-6 py-3 rounded-xl font-medium transition transform hover:scale-105 ${
                activeTab === 'progress' ? 'shadow-lg' : 'opacity-70'
              }`}
              style={{
                backgroundColor: activeTab === 'progress' ? themeConfig.colors.primary : themeConfig.colors.surface,
                color: activeTab === 'progress' ? 'white' : themeConfig.colors.text,
                border: `2px solid ${activeTab === 'progress' ? themeConfig.colors.primary : themeConfig.colors.border}`,
              }}
            >
              📊 Progress
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Tab Content */}
            {activeTab === 'video' && (
              <VideoLesson
                title={lessonContent.video.title}
                captions={lessonContent.video.captions}
                onComplete={() => {
                  // Auto-switch to practice after video
                  setActiveTab('practice');
                }}
              />
            )}

            {activeTab === 'practice' && (
              <PracticeExercises
                questions={lessonContent.practice}
                onComplete={(score) => {
                  alert(`Great job! You scored ${score} out of ${lessonContent.practice.length}!`);
                  setActiveTab('game');
                }}
                onAnswerSubmit={(correct: boolean) => {
                  // Update focus metrics
                  if (window && (window as unknown as { updateFocusMetrics?: { recordAnswer: (correct: boolean) => void } }).updateFocusMetrics) {
                    (window as unknown as { updateFocusMetrics: { recordAnswer: (correct: boolean) => void } }).updateFocusMetrics.recordAnswer(correct);
                  }
                }}
              />
            )}

            {activeTab === 'game' && (
              <LearningGame
                type={lessonContent.game.type}
                title={lessonContent.game.title}
                items={lessonContent.game.items}
                onComplete={(score) => {
                  alert(`Awesome! You earned ${score} points!`);
                }}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressTracker data={lessonContent.progress} />
            )}

            {/* Notes Section */}
            <div className="mt-6">
              <button
                className="px-6 py-3 rounded-xl font-medium mb-4 transition"
                style={{
                  backgroundColor: showNotes ? themeConfig.colors.primary : themeConfig.colors.surface,
                  color: showNotes ? 'white' : themeConfig.colors.text,
                  border: `2px solid ${themeConfig.colors.border}`,
                }}
                onClick={() => setShowNotes(!showNotes)}
              >
                {showNotes ? '📝 Hide' : '📝 Show'} Notes
              </button>

              {showNotes && (
                <div>
                  {subject.writingPadEnabled ? (
                    <WritingPad
                      storageKey={`activity_${theme}_${subjectId}_${activityId}`}
                      height={300}
                      theme={theme}
                    />
                  ) : subject.drawPadEnabled ? (
                    <DrawPad
                      storageKey={`activity_${theme}_${subjectId}_${activityId}`}
                      height={400}
                    />
                  ) : (
                    <WritingPad
                      storageKey={`activity_${theme}_${subjectId}_${activityId}`}
                      height={300}
                      theme={theme}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completion Button */}
        <div className="flex justify-center gap-4">
          {!completed ? (
            <>
              <button
                className="px-8 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  backgroundColor: themeConfig.colors.primary,
                  color: 'white',
                }}
                onClick={handleComplete}
              >
                ✅ Mark as Complete
              </button>
              <button
                className="px-8 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105 active:scale-95 border-2"
                style={{
                  backgroundColor: 'white',
                  color: themeConfig.colors.text,
                  borderColor: themeConfig.colors.border,
                }}
                onClick={() => navigate(`/learner/${themeParam}/subject/${subjectId}`)}
              >
                Save & Exit
              </button>
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: themeConfig.colors.primary }}
              >
                Great Job!
              </h3>
              <p className="text-gray-600 mb-4">
                You've completed this activity. Returning to subject...
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 rounded-xl border-2 border-green-300">
                <span className="text-2xl">⭐</span>
                <span className="font-bold text-green-800">+50 Points Earned!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Break Modal */}
      <GameBreakModal
        isOpen={showGameBreak}
        onClose={() => setShowGameBreak(false)}
        onBreakComplete={(_score: number) => {
          setBreaksUsedToday(breaksUsedToday + 1);
          setShowGameBreak(false);
        }}
        theme={theme}
      />
    </div>
  );
}
