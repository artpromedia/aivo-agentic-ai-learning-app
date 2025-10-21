/**
 * IEP Goal Card Component
 * Displays individual IEP goal with progress, status, and actions
 */

import React from 'react';
import type { IEPGoalData } from '../utils/mockData';

interface IEPGoalCardProps {
  goal: IEPGoalData;
  onUpdate?: (goalId: string, progress: number, notes: string) => void;
  showDetails?: boolean;
}

export const IEPGoalCard: React.FC<IEPGoalCardProps> = ({
  goal,
  showDetails = false,
}) => {
  const statusConfig = {
    'on-track': {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-700',
      icon: '✓',
    },
    'needs-support': {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-700',
      icon: '⚠',
    },
    'exceeded': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-700',
      icon: '★',
    },
    'discontinued': {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-700',
      icon: '×',
    },
  };

  const config = statusConfig[goal.status];

  const domainIcons = {
    reading: '📚',
    math: '🔢',
    speech: '🗣️',
    'social-emotional': '💭',
    'motor-skills': '✋',
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const daysUntilTarget = Math.ceil(
    (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={`${config.bg} border-2 ${config.border} rounded-xl p-6 transition-all hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-3xl">{domainIcons[goal.domain]}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-lg">{goal.description}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badge}`}>
                {config.icon} {goal.status.replace('-', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-600 capitalize">{goal.domain.replace('-', ' ')} Goal</p>
          </div>
        </div>
      </div>

      {/* Measurable Objective */}
      <div className="bg-white/50 rounded-lg p-4 mb-4">
        <p className="text-xs text-gray-500 mb-1 font-semibold">Measurable Objective:</p>
        <p className="text-sm text-gray-900">{goal.measurableObjective}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className={`text-lg font-bold ${config.text}`}>{goal.progress}%</span>
        </div>
        <div className="h-3 bg-white/70 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              goal.progress >= 90
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                : goal.progress >= 60
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500'
            }`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Activities</p>
          <p className="text-lg font-bold text-gray-900">
            {goal.activitiesCompleted}/{goal.totalActivities}
          </p>
        </div>
        <div className="bg-white/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Target Date</p>
          <p className="text-sm font-semibold text-gray-900">{formatDate(goal.targetDate)}</p>
        </div>
        <div className="bg-white/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Days Left</p>
          <p
            className={`text-lg font-bold ${
              daysUntilTarget < 30 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {daysUntilTarget}
          </p>
        </div>
      </div>

      {/* Last Activity */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
        <span>Last activity: {formatDate(goal.lastActivity)}</span>
        <span>{goal.evidence.length} evidence items</span>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          {/* Evidence */}
          {goal.evidence.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Evidence:</p>
              <ul className="space-y-1">
                {goal.evidence.map((item, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Teacher Notes */}
          {goal.teacherNotes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Teacher Notes:</p>
              <ul className="space-y-1">
                {goal.teacherNotes.map((note, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          Update Progress
        </button>
        <button className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          Add Evidence
        </button>
        <button className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          ⋯
        </button>
      </div>
    </div>
  );
};
