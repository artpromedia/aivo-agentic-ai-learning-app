import React, { useMemo } from 'react';
import { Card, Button } from '@aivo/ui';
import { useLocalStorage } from '@aivo/utils';

interface GameBreakSession {
  id: string;
  gameType: string;
  startTime: string;
  endTime: string;
  duration: number; // seconds
  score: number;
  completed: boolean;
}

interface DailyUsageData {
  date: string; // YYYY-MM-DD format
  sessions: GameBreakSession[];
  totalBreaks: number;
  totalDuration: number; // seconds
  averageScore: number;
  focusStateBeforeBreaks: string[];
}

interface DailyUsageTrackerProps {
  learnerId: string;
  learnerName: string;
}

export const DailyUsageTracker: React.FC<DailyUsageTrackerProps> = ({
  learnerId,
  learnerName,
}) => {
  const [usageData, setUsageData] = useLocalStorage<DailyUsageData[]>(
    `usage_history_${learnerId}`,
    []
  );

  const today = new Date().toISOString().split('T')[0];
  
  const todayData = useMemo(() => {
    return usageData.find(d => d.date === today) || {
      date: today,
      sessions: [],
      totalBreaks: 0,
      totalDuration: 0,
      averageScore: 0,
      focusStateBeforeBreaks: [],
    };
  }, [usageData, today]);

  const last7Days = useMemo(() => {
    const days: Array<{ date: string; totalBreaks: number; totalDuration: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0] ?? '';
      const data = usageData.find(d => d.date === dateStr);
      days.push({
        date: dateStr,
        totalBreaks: data?.totalBreaks || 0,
        totalDuration: data?.totalDuration || 0,
      });
    }
    return days;
  }, [usageData]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getGameIcon = (gameType: string): string => {
    const icons: Record<string, string> = {
      reaction: '⚡',
      breathing: '🫁',
      memory: '🧠',
      pattern: '🔢',
      sorting: '🎯',
    };
    return icons[gameType] || '🎮';
  };

  const getGameName = (gameType: string): string => {
    const names: Record<string, string> = {
      reaction: 'Quick Reflex',
      breathing: 'Breathing Coach',
      memory: 'Memory Match',
      pattern: 'Pattern Finder',
      sorting: 'Quick Sort',
    };
    return names[gameType] || gameType;
  };

  const exportData = () => {
    const dataStr = JSON.stringify(usageData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${learnerName}_game_usage_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all usage history? This cannot be undone.')) {
      setUsageData([]);
    }
  };

  const maxBreaks = Math.max(...last7Days.map(d => d.totalBreaks), 1);

  return (
    <div className="space-y-6" data-testid="daily-usage-tracker">
      {/* Today's Summary */}
      <Card>
        <h3 className="text-xl font-bold mb-4">
          Today's Activity - {learnerName}
        </h3>
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Total Breaks</p>
            <p className="text-3xl font-bold text-blue-600" data-testid="today-breaks">
              {todayData.totalBreaks}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Total Time</p>
            <p className="text-3xl font-bold text-green-600" data-testid="today-duration">
              {Math.floor(todayData.totalDuration / 60)}m
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Avg Score</p>
            <p className="text-3xl font-bold text-purple-600" data-testid="today-score">
              {todayData.averageScore.toFixed(0)}
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Completion Rate</p>
            <p className="text-3xl font-bold text-orange-600" data-testid="today-completion">
              {todayData.sessions.length > 0
                ? Math.round((todayData.sessions.filter(s => s.completed).length / todayData.sessions.length) * 100)
                : 0}%
            </p>
          </div>
        </div>

        {/* Today's Sessions */}
        {todayData.sessions.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Recent Sessions</h4>
            <div className="space-y-2">
              {todayData.sessions.slice(-5).reverse().map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  data-testid={`session-${session.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getGameIcon(session.gameType)}</span>
                    <div>
                      <p className="font-medium">{getGameName(session.gameType)}</p>
                      <p className="text-sm text-neutral-600">
                        {new Date(session.startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {session.score}
                      <span className="text-sm text-neutral-600"> pts</span>
                    </p>
                    <p className="text-sm text-neutral-600">
                      {formatDuration(session.duration)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {todayData.sessions.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <p className="text-4xl mb-2">📊</p>
            <p>No game breaks yet today</p>
          </div>
        )}
      </Card>

      {/* 7-Day History */}
      <Card>
        <h3 className="text-xl font-bold mb-4">7-Day Activity</h3>
        
        <div className="space-y-3">
          {last7Days.map((day) => (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-20 text-sm text-neutral-600">
                {formatDate(day.date)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="h-8 bg-blue-500 rounded transition-all"
                    style={{ 
                      width: `${(day.totalBreaks / maxBreaks) * 100}%`,
                      minWidth: day.totalBreaks > 0 ? '32px' : '0',
                    }}
                    data-testid={`history-bar-${day.date}`}
                  />
                  <span className="text-sm font-medium">
                    {day.totalBreaks} {day.totalBreaks === 1 ? 'break' : 'breaks'}
                  </span>
                </div>
              </div>
              <div className="w-16 text-right text-sm text-neutral-600">
                {Math.floor(day.totalDuration / 60)}m
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Weekly Total</p>
              <p className="text-2xl font-bold">
                {last7Days.reduce((sum, d) => sum + d.totalBreaks, 0)} breaks
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Daily Average</p>
              <p className="text-2xl font-bold">
                {(last7Days.reduce((sum, d) => sum + d.totalBreaks, 0) / 7).toFixed(1)} breaks
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Time</p>
              <p className="text-2xl font-bold">
                {Math.floor(last7Days.reduce((sum, d) => sum + d.totalDuration, 0) / 60)}m
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <h3 className="text-xl font-bold mb-4">Data Management</h3>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={exportData}
            disabled={usageData.length === 0}
            data-testid="export-data-button"
          >
            📥 Export Data
          </Button>
          <Button
            variant="secondary"
            onClick={clearHistory}
            disabled={usageData.length === 0}
            data-testid="clear-history-button"
          >
            🗑️ Clear History
          </Button>
        </div>
      </Card>
    </div>
  );
};
