import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubject } from '../config/subjects';
import { WritingPad } from '../components/WritingPad';
import { useTheme } from '@aivo/ui';

interface Unit {
  id: string;
  number: number;
  name: string;
  description: string;
  progress: number; // 0-100
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  lessonsTotal: number;
  lessonsCompleted: number;
}

export const SubjectDetailPage: React.FC = () => {
  const { theme: themeParam, subjectId } = useParams<{ theme: string; subjectId: string }>();
  const navigate = useNavigate();
  const { themeConfig } = useTheme();
  const [showWritingPad, setShowWritingPad] = useState(false);
  
  // Get theme configuration
  const theme = (themeParam?.toUpperCase() as 'K5' | 'MS' | 'HS') || 'K5';
  const subject = getSubject(theme, subjectId || '');
  
  if (!subject) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Subject Not Found</h2>
        <button
          className="px-6 py-3 rounded-xl bg-neutral-900 text-white"
          onClick={() => navigate('/learner/portal')}
        >
          Back to Subjects
        </button>
      </div>
    );
  }

  // Generate units based on theme
  const units: Unit[] = theme === 'K5' 
    ? [
        {
          id: 'unit1',
          number: 1,
          name: 'Explore',
          description: 'Introduction and discovery',
          progress: 85,
          status: 'in-progress',
          lessonsTotal: 10,
          lessonsCompleted: 8,
        },
        {
          id: 'unit2',
          number: 2,
          name: 'Practice',
          description: 'Build skills through activities',
          progress: 40,
          status: 'available',
          lessonsTotal: 12,
          lessonsCompleted: 5,
        },
        {
          id: 'unit3',
          number: 3,
          name: 'Show & Tell',
          description: 'Demonstrate what you learned',
          progress: 0,
          status: 'locked',
          lessonsTotal: 8,
          lessonsCompleted: 0,
        },
      ]
    : theme === 'MS'
    ? [
        {
          id: 'unit1',
          number: 1,
          name: 'Concepts',
          description: 'Core ideas and foundations',
          progress: 75,
          status: 'in-progress',
          lessonsTotal: 15,
          lessonsCompleted: 11,
        },
        {
          id: 'unit2',
          number: 2,
          name: 'Practice',
          description: 'Apply concepts to problems',
          progress: 30,
          status: 'available',
          lessonsTotal: 18,
          lessonsCompleted: 5,
        },
        {
          id: 'unit3',
          number: 3,
          name: 'Projects',
          description: 'Hands-on applications',
          progress: 0,
          status: 'locked',
          lessonsTotal: 10,
          lessonsCompleted: 0,
        },
      ]
    : [
        {
          id: 'unit1',
          number: 1,
          name: 'Foundations',
          description: 'Essential concepts and skills',
          progress: 90,
          status: 'completed',
          lessonsTotal: 20,
          lessonsCompleted: 20,
        },
        {
          id: 'unit2',
          number: 2,
          name: 'Skills Development',
          description: 'Advanced techniques and methods',
          progress: 60,
          status: 'in-progress',
          lessonsTotal: 22,
          lessonsCompleted: 13,
        },
        {
          id: 'unit3',
          number: 3,
          name: 'Applications',
          description: 'Real-world problem solving',
          progress: 25,
          status: 'available',
          lessonsTotal: 18,
          lessonsCompleted: 4,
        },
        {
          id: 'unit4',
          number: 4,
          name: 'Exam Preparation',
          description: 'Review and assessment practice',
          progress: 0,
          status: 'locked',
          lessonsTotal: 15,
          lessonsCompleted: 0,
        },
      ];

  return (
    <div 
      className="min-h-screen p-6"
      style={{
        backgroundColor: themeConfig.colors.background,
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
          onClick={() => navigate('/learner/portal')}
          data-testid="back-button"
        >
          ← Back to Subjects
        </button>

        <div 
          className="rounded-2xl p-6 shadow-lg"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderWidth: '2px',
            borderColor: themeConfig.colors.border,
          }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="text-6xl flex-shrink-0"
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
                {subject.displayName}
              </h1>
              <p 
                className="mb-4"
                style={{ 
                  fontSize: themeConfig.fontSize.base,
                  color: themeConfig.colors.text,
                  opacity: 0.8,
                }}
              >
                {subject.description}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 rounded-full" style={{
                  backgroundColor: themeConfig.colors.primary,
                  color: 'white',
                }}>
                  {theme}
                </span>
                {subject.estimatedDuration && (
                  <span style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
                    ⏱️ {subject.estimatedDuration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Units */}
      <div className="max-w-6xl mx-auto space-y-4">
        <h2 
          className="text-2xl font-bold mb-4"
          style={{ color: themeConfig.colors.text }}
        >
          Units
        </h2>

        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            themeConfig={themeConfig}
          />
        ))}
      </div>

      {/* Writing Pad Section */}
      {(subject.writingPadEnabled || subject.drawPadEnabled) && (
        <div className="max-w-6xl mx-auto mt-8">
          <button
            className="px-6 py-3 rounded-xl font-medium mb-4 transition"
            style={{
              backgroundColor: themeConfig.colors.primary,
              color: 'white',
            }}
            onClick={() => setShowWritingPad(!showWritingPad)}
            data-testid="toggle-writing-pad"
          >
            {showWritingPad ? '📝 Hide' : '📝 Show'} Writing Pad
          </button>

          {showWritingPad && (
            <div 
              className="rounded-2xl p-6 shadow-lg"
              style={{
                backgroundColor: themeConfig.colors.surface,
                borderWidth: '2px',
                borderColor: themeConfig.colors.border,
              }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: themeConfig.colors.text }}>
                Work Space - Auto-saves to your device
              </h3>
              <WritingPad
                storageKey={`pad_${theme}_${subjectId}`}
                height={theme === 'K5' ? 400 : theme === 'MS' ? 350 : 300}
                theme={theme}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Unit Card Component
const UnitCard: React.FC<{
  unit: Unit;
  themeConfig: ReturnType<typeof useTheme>['themeConfig'];
}> = ({ unit, themeConfig }) => {
  const navigate = useNavigate();
  const { theme: currentTheme } = useTheme();
  const { subjectId } = useParams<{ theme: string; subjectId: string }>();
  
  const statusConfig = {
    locked: { icon: '🔒', color: '#9CA3AF', label: 'Locked' },
    available: { icon: '⭐', color: themeConfig.colors.primary, label: 'Available' },
    'in-progress': { icon: '🚀', color: '#10B981', label: 'In Progress' },
    completed: { icon: '✅', color: '#10B981', label: 'Completed' },
  };

  const status = statusConfig[unit.status];

  const handleUnitClick = () => {
    if (unit.status === 'locked') return;
    
    // Navigate to the first activity/lesson in this unit
    // For now, we'll use the unit ID as the activity ID
    navigate(`/learner/${currentTheme.toLowerCase()}/subject/${subjectId}/activity/unit${unit.number}-lesson1`);
  };

  return (
    <div
      className={`rounded-2xl p-6 shadow-md transition-all duration-200 ${
        unit.status !== 'locked' 
          ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' 
          : 'cursor-not-allowed'
      }`}
      style={{
        backgroundColor: themeConfig.colors.surface,
        borderWidth: '2px',
        borderColor: unit.status === 'locked' ? '#E5E7EB' : themeConfig.colors.border,
        opacity: unit.status === 'locked' ? 0.6 : 1,
      }}
      onClick={() => unit.status !== 'locked' && handleUnitClick()}
      data-testid={`unit-${unit.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="text-4xl"
            style={{ fontSize: themeConfig.iconSize.navigation }}
          >
            {status.icon}
          </div>
          <div>
            <h3 
              className="font-bold"
              style={{ 
                fontSize: themeConfig.fontSize.heading,
                color: themeConfig.colors.text,
              }}
            >
              Unit {unit.number}: {unit.name}
            </h3>
            <p 
              className="text-sm mt-1"
              style={{ 
                color: themeConfig.colors.text,
                opacity: 0.7,
              }}
            >
              {unit.description}
            </p>
          </div>
        </div>
        
        <span 
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: status.color + '20',
            color: status.color,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Progress Bar */}
      {unit.status !== 'locked' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: themeConfig.colors.text }}>
              {unit.lessonsCompleted} of {unit.lessonsTotal} lessons
            </span>
            <span className="text-sm font-bold" style={{ color: themeConfig.colors.text }}>
              {unit.progress}%
            </span>
          </div>
          <div 
            className="w-full rounded-full h-2"
            style={{ backgroundColor: themeConfig.colors.border }}
          >
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${unit.progress}%`,
                backgroundColor: themeConfig.colors.primary,
              }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      {unit.status !== 'locked' && (
        <button
          className="mt-4 px-6 py-3 rounded-xl font-medium transition w-full sm:w-auto hover:opacity-90 active:scale-95"
          style={{
            backgroundColor: themeConfig.colors.primary,
            color: 'white',
          }}
          onClick={handleUnitClick}
          data-testid={`unit-${unit.id}-button`}
        >
          {unit.status === 'completed' ? '🔄 Review Unit' : '▶️ Continue Learning'}
        </button>
      )}
    </div>
  );
};
