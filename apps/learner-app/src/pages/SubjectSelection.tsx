import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@aivo/ui';
import type { LearnerTheme } from '@aivo/types';
import { BigButton } from '../components/BigButton';
import { SubjectCard } from '../components/SubjectCard';
import { ExitConfirmation } from '../components/ExitConfirmation';
import { getSubjectsForTheme } from '../config/subjects';

export function SubjectSelection() {
  const navigate = useNavigate();
  const { themeConfig, theme } = useTheme();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Get subjects for the current theme
  const learnerTheme = (theme || 'MS').toUpperCase() as LearnerTheme;
  const subjects = getSubjectsForTheme(learnerTheme);

  // Mock progress data (in a real app, this would come from the backend)
  const getSubjectProgress = (subjectId: string) => {
    const progressData: Record<string, { progress: number; starsEarned: number }> = {
      math: { progress: 65, starsEarned: 24 },
      science: { progress: 45, starsEarned: 18 },
      reading: { progress: 80, starsEarned: 27 },
      // Add more as needed
    };
    return progressData[subjectId] || { progress: 0, starsEarned: 0 };
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        background: `linear-gradient(to bottom right, ${themeConfig.colors.background}, ${themeConfig.colors.primary}22, ${themeConfig.colors.secondary}22)`,
      }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 
              className="font-bold mb-2"
              style={{
                fontSize: `calc(${themeConfig.fontSize.heading} * 2)`,
                color: themeConfig.colors.text,
              }}
            >
              What do you want to learn today? 🎓
            </h1>
            <p 
              style={{
                fontSize: `calc(${themeConfig.fontSize.base} * 1.2)`,
                color: themeConfig.colors.primary,
              }}
            >
              Choose a subject to get started!
            </p>
          </div>
          <div className="flex gap-4 items-center">
            {/* Homework Helper Button */}
            <button
              onClick={() => navigate('/homework-helper')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl flex items-center gap-3 px-6 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all text-white font-bold"
              style={{
                fontSize: themeConfig.fontSize.base,
                transitionDuration: `${themeConfig.animations.duration}ms`,
              }}
              aria-label="Homework Helper"
            >
              <span style={{ fontSize: `calc(${themeConfig.iconSize.navigation} * 1.2)` }}>📝</span>
              <span>Homework Helper</span>
            </button>
            
            {/* Exit Button */}
            <button
              onClick={handleExit}
              className="bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all"
              style={{
                width: themeConfig.iconSize.subject,
                height: themeConfig.iconSize.subject,
                fontSize: `calc(${themeConfig.iconSize.subject} * 0.5)`,
                transitionDuration: `${themeConfig.animations.duration}ms`,
              }}
              aria-label="Exit"
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Subject Cards */}
      <div 
        className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        style={{
          gap: themeConfig.spacing.grid,
        }}
      >
        {subjects.map((subject) => {
          const progressData = getSubjectProgress(subject.id);
          return (
            <SubjectCard
              key={subject.id}
              subject={subject}
              progress={progressData.progress}
              starsEarned={progressData.starsEarned}
              totalStars={30}
            />
          );
        })}
      </div>

      {/* Rewards Button */}
      <div className="max-w-6xl mx-auto mt-12 flex justify-center">
        <BigButton
          onClick={() => navigate('/rewards')}
          variant="warning"
          icon="🏆"
        >
          See My Rewards
        </BigButton>
      </div>

      {/* Exit Confirmation */}
      <ExitConfirmation
        isOpen={showExitConfirm}
        onConfirm={confirmExit}
        onCancel={() => setShowExitConfirm(false)}
      />

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
