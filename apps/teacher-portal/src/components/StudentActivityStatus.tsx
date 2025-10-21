/**
 * Student Activity Status Component
 * Shows real-time activity with live accuracy meter
 */

import React from 'react';

interface StudentActivityStatusProps {
  student: {
    name: string;
    avatar: string;
    currentActivity?: {
      subject: string;
      activityName: string;
      startedAt: Date;
      accuracy: number;
      questionsCompleted: number;
      totalQuestions: number;
    };
  };
  onClick?: () => void;
}

export const StudentActivityStatus: React.FC<StudentActivityStatusProps> = ({
  student,
  onClick,
}) => {
  if (!student.currentActivity) {
    return null;
  }

  const { subject, activityName, startedAt, accuracy, questionsCompleted, totalQuestions } =
    student.currentActivity;

  const minutesActive = Math.floor((Date.now() - startedAt.getTime()) / 60000);
  const progress = Math.floor((questionsCompleted / totalQuestions) * 100);

  const subjectColors = {
    reading: 'bg-blue-500',
    math: 'bg-green-500',
    speech: 'bg-purple-500',
    'social-emotional': 'bg-pink-500',
  };

  const subjectColor = subjectColors[subject as keyof typeof subjectColors] || 'bg-gray-500';

  const accuracyColor =
    accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Avatar with pulse animation */}
      <div className="relative">
        <img
          src={student.avatar}
          alt={student.name}
          className="w-10 h-10 rounded-full"
        />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </div>

      {/* Student info and activity */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
          <span className={`px-2 py-0.5 text-xs font-medium text-white rounded ${subjectColor}`}>
            {subject}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{activityName}</p>
      </div>

      {/* Accuracy and progress */}
      <div className="text-right">
        <p className={`text-sm font-semibold ${accuracyColor}`}>{accuracy}%</p>
        <p className="text-xs text-gray-500">
          {questionsCompleted}/{totalQuestions} • {minutesActive}m
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-16">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${subjectColor} transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
