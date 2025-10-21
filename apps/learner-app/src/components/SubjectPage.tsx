import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '@aivo/ui';
import type { Subject } from '../config/subjects';
import { BigButton } from '../components/BigButton';
import { ProgressRing } from '../components/ProgressRing';
import { WritingPad } from '../components/WritingPad';
import { DrawPad } from '../components/WritingPad';

interface Activity {
  id: string;
  name: string;
  icon: string;
  progress: number;
}

interface SubjectPageProps {
  subject: Subject;
  activities?: Activity[];
}

export function SubjectPage({ subject, activities = [] }: SubjectPageProps) {
  const navigate = useNavigate();
  const { themeConfig, theme } = useTheme();
  const [showWritingPad, setShowWritingPad] = useState(false);
  const [showDrawPad, setShowDrawPad] = useState(false);

  // Default activities if none provided
  const defaultActivities: Activity[] = [
    { id: '1', name: 'Activity 1', icon: '📝', progress: 0 },
    { id: '2', name: 'Activity 2', icon: '🎯', progress: 0 },
    { id: '3', name: 'Activity 3', icon: '⭐', progress: 0 },
    { id: '4', name: 'Activity 4', icon: '🏆', progress: 0 },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  const handleActivityClick = (activityId: string) => {
    // Navigate to the activity page
    navigate(`/learner/${theme.toLowerCase()}/subject/${subject.id}/activity/${activityId}`);
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: `linear-gradient(to bottom right, ${themeConfig.colors.background}, ${themeConfig.colors.primary}22)`,
      }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate('/subjects')}
          className="mb-4 flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          style={{ fontSize: themeConfig.fontSize.base }}
        >
          ← Back to Subjects
        </button>

        <div className="flex items-center gap-6">
          <div className="text-8xl">{subject.icon}</div>
          <div>
            <h1
              className="font-bold mb-2"
              style={{
                fontSize: `calc(${themeConfig.fontSize.heading} * 2)`,
                color: themeConfig.colors.text,
              }}
            >
              {subject.displayName}
            </h1>
            <p
              className="text-neutral-600"
              style={{ fontSize: `calc(${themeConfig.fontSize.base} * 1.2)` }}
            >
              {subject.description}
            </p>
            {subject.estimatedDuration && (
              <p className="mt-2 text-neutral-500">
                ⏱️ Recommended: {subject.estimatedDuration}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div
        className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4"
        style={{ gap: themeConfig.spacing.grid }}
      >
        {displayActivities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => handleActivityClick(activity.id)}
            className={`${subject.color} bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer border-2`}
          >
            <div className="text-6xl text-center mb-4">{activity.icon}</div>
            <h3 className="text-2xl font-bold text-center mb-4 text-neutral-900">
              {activity.name}
            </h3>
            <div className="flex justify-center">
              <ProgressRing progress={activity.progress} size={100} />
            </div>
          </button>
        ))}
      </div>

      {/* Tools Available */}
      {(subject.writingPadEnabled || subject.drawPadEnabled) && (
        <div className="max-w-6xl mx-auto mt-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            {subject.writingPadEnabled && (
              <button
                onClick={() => {
                  setShowWritingPad(!showWritingPad);
                  setShowDrawPad(false);
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  showWritingPad
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-blue-600 border-2 border-blue-300 hover:border-blue-500'
                }`}
              >
                <span className="text-2xl mr-2">✏️</span>
                {showWritingPad ? '✓ Writing Pad' : 'Open Writing Pad'}
              </button>
            )}
            {subject.drawPadEnabled && (
              <button
                onClick={() => {
                  setShowDrawPad(!showDrawPad);
                  setShowWritingPad(false);
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  showDrawPad
                    ? 'bg-pink-600 text-white shadow-lg scale-105'
                    : 'bg-white text-pink-600 border-2 border-pink-300 hover:border-pink-500'
                }`}
              >
                <span className="text-2xl mr-2">🎨</span>
                {showDrawPad ? '✓ Draw Pad' : 'Open Draw Pad'}
              </button>
            )}
          </div>

          {/* Writing Pad */}
          {showWritingPad && subject.writingPadEnabled && (
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-blue-600">
                ✏️ Writing Pad
              </h3>
              <WritingPad
                storageKey={`${subject.id}_writing`}
                height={400}
                theme={theme?.toUpperCase() as 'K5' | 'MS' | 'HS'}
                onSave={(imageData) => {
                  console.log('Saved writing:', imageData.substring(0, 50));
                }}
              />
            </div>
          )}

          {/* Draw Pad */}
          {showDrawPad && subject.drawPadEnabled && (
            <div className="bg-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-pink-600">
                🎨 Draw Pad
              </h3>
              <DrawPad
                storageKey={`${subject.id}_draw`}
                height={500}
                enableShapes={true}
                enableFill={true}
                enableBrushPatterns={true}
                onSave={(imageData) => {
                  console.log('Saved drawing:', imageData.substring(0, 50));
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Start Learning Button */}
      <div className="max-w-6xl mx-auto mt-12 flex justify-center">
        <BigButton
          onClick={() => handleActivityClick(displayActivities[0]?.id || '1')}
          variant="primary"
          icon="🎯"
        >
          Start Learning
        </BigButton>
      </div>
    </div>
  );
}
