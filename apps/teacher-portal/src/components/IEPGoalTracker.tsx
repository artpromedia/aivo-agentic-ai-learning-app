/**
 * IEP Goal Tracker Component
 * Visual timeline showing IEP goal progress across multiple goals
 */

import React from 'react';
import type { IEPGoalData } from '../utils/mockData';

interface IEPGoalTrackerProps {
  goals: IEPGoalData[];
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
  compact?: boolean;
}

export const IEPGoalTracker: React.FC<IEPGoalTrackerProps> = ({
  goals,
  compact = false,
}) => {
  const statusCounts = {
    'on-track': goals.filter((g) => g.status === 'on-track').length,
    'needs-support': goals.filter((g) => g.status === 'needs-support').length,
    'exceeded': goals.filter((g) => g.status === 'exceeded').length,
    'discontinued': goals.filter((g) => g.status === 'discontinued').length,
  };

  const averageProgress =
    goals.length > 0
      ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
      : 0;

  const domainGroups = goals.reduce((acc, goal) => {
    if (!acc[goal.domain]) {
      acc[goal.domain] = [];
    }
    acc[goal.domain]!.push(goal);
    return acc;
  }, {} as Record<string, IEPGoalData[]>);

  const domainIcons = {
    reading: '📚',
    math: '🔢',
    speech: '🗣️',
    'social-emotional': '💭',
    'motor-skills': '✋',
  };

  const statusColors = {
    'on-track': 'bg-green-500',
    'needs-support': 'bg-yellow-500',
    'exceeded': 'bg-blue-500',
    'discontinued': 'bg-gray-400',
  };

  if (compact) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">IEP Goals Progress</h3>
          <span className="text-2xl font-bold text-indigo-600">{averageProgress}%</span>
        </div>

        {/* Progress Bars by Domain */}
        <div className="space-y-3">
          {Object.entries(domainGroups).map(([domain, domainGoals]) => {
            const domainProgress = Math.round(
              domainGoals.reduce((sum, g) => sum + g.progress, 0) / domainGoals.length
            );
            return (
              <div key={domain}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1 text-gray-700">
                    <span>{domainIcons[domain as keyof typeof domainIcons]}</span>
                    <span className="capitalize">{domain.replace('-', ' ')}</span>
                  </span>
                  <span className="font-semibold text-gray-900">{domainProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      domainProgress >= 80
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : domainProgress >= 60
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`}
                    style={{ width: `${domainProgress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
              <span className="text-xs text-gray-600">
                {count} {status.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">IEP Goals Timeline</h2>
          <p className="text-sm text-gray-600 mt-1">
            {goals.length} active goals • {averageProgress}% average progress
          </p>
        </div>
        <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="week">This Week</option>
          <option value="month" selected>
            This Month
          </option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Overall Progress */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-2xl font-bold text-indigo-600">{averageProgress}%</span>
        </div>
        <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${averageProgress}%` }}
          />
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-600">On Track</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{statusCounts['on-track']}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs text-gray-600">Needs Support</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{statusCounts['needs-support']}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-xs text-gray-600">Exceeded</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{statusCounts.exceeded}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span className="text-xs text-gray-600">Discontinued</span>
          </div>
          <p className="text-2xl font-bold text-gray-700">{statusCounts.discontinued}</p>
        </div>
      </div>

      {/* Goals by Domain */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 mb-3">Progress by Domain</h3>
        {Object.entries(domainGroups).map(([domain, domainGoals]) => {
          const domainProgress = Math.round(
            domainGoals.reduce((sum, g) => sum + g.progress, 0) / domainGoals.length
          );
          return (
            <div key={domain} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{domainIcons[domain as keyof typeof domainIcons]}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {domain.replace('-', ' ')}
                    </h4>
                    <p className="text-xs text-gray-600">{domainGoals.length} goals</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">{domainProgress}%</span>
              </div>

              {/* Domain Progress Bar */}
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full transition-all duration-500 ${
                    domainProgress >= 80
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : domainProgress >= 60
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`}
                  style={{ width: `${domainProgress}%` }}
                />
              </div>

              {/* Individual Goals */}
              <div className="space-y-2">
                {domainGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded transition-colors"
                  >
                    <span className="text-gray-700 flex-1 truncate">{goal.description}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${statusColors[goal.status]}`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-900 w-10 text-right">
                        {goal.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
        <button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          Generate Progress Report
        </button>
        <button className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg font-medium text-gray-700 transition-colors">
          Export Data
        </button>
      </div>
    </div>
  );
};
