import { useTheme } from '@aivo/ui';

interface ProgressData {
  completedLessons: number;
  totalLessons: number;
  averageScore: number;
  timeSpent: number; // in minutes
  streak: number;
  badges: Array<{ name: string; icon: string; description: string }>;
  recentActivity: Array<{
    date: string;
    activity: string;
    score: number;
  }>;
}

interface ProgressTrackerProps {
  data: ProgressData;
}

export function ProgressTracker({ data }: ProgressTrackerProps) {
  const { themeConfig } = useTheme();

  const completionPercentage = (data.completedLessons / data.totalLessons) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div
          className="rounded-xl p-6 shadow-lg"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderWidth: '2px',
            borderColor: themeConfig.colors.border,
          }}
        >
          <div className="text-4xl mb-2">📚</div>
          <div className="text-3xl font-bold mb-1" style={{ color: themeConfig.colors.primary }}>
            {data.completedLessons}
          </div>
          <div className="text-sm" style={{ color: themeConfig.colors.text }}>
            Lessons Completed
          </div>
        </div>

        <div
          className="rounded-xl p-6 shadow-lg"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderWidth: '2px',
            borderColor: themeConfig.colors.border,
          }}
        >
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-3xl font-bold mb-1" style={{ color: themeConfig.colors.primary }}>
            {data.averageScore}%
          </div>
          <div className="text-sm" style={{ color: themeConfig.colors.text }}>
            Average Score
          </div>
        </div>

        <div
          className="rounded-xl p-6 shadow-lg"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderWidth: '2px',
            borderColor: themeConfig.colors.border,
          }}
        >
          <div className="text-4xl mb-2">⏱️</div>
          <div className="text-3xl font-bold mb-1" style={{ color: themeConfig.colors.primary }}>
            {data.timeSpent}
          </div>
          <div className="text-sm" style={{ color: themeConfig.colors.text }}>
            Minutes Learning
          </div>
        </div>

        <div
          className="rounded-xl p-6 shadow-lg"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderWidth: '2px',
            borderColor: themeConfig.colors.border,
          }}
        >
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-3xl font-bold mb-1" style={{ color: themeConfig.colors.primary }}>
            {data.streak}
          </div>
          <div className="text-sm" style={{ color: themeConfig.colors.text }}>
            Day Streak
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div
        className="rounded-2xl p-8 shadow-lg"
        style={{
          backgroundColor: themeConfig.colors.surface,
          borderWidth: '2px',
          borderColor: themeConfig.colors.border,
        }}
      >
        <h3 className="text-2xl font-bold mb-6" style={{ color: themeConfig.colors.primary }}>
          📊 Your Progress
        </h3>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Overall Completion</span>
            <span className="font-bold" style={{ color: themeConfig.colors.primary }}>
              {Math.round(completionPercentage)}%
            </span>
          </div>
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: themeConfig.colors.primary,
                width: `${completionPercentage}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{data.completedLessons} completed</span>
            <span>{data.totalLessons - data.completedLessons} remaining</span>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="mt-8">
          <h4 className="font-bold mb-4">This Week's Activity</h4>
          <div className="flex items-end justify-between gap-2 h-48">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
              const height = Math.random() * 100; // Simulated data
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg transition-all duration-500"
                      style={{
                        backgroundColor: themeConfig.colors.primary,
                        height: `${height}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges */}
      {data.badges.length > 0 && (
        <div
          className="rounded-2xl p-8 shadow-lg"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderWidth: '2px',
            borderColor: themeConfig.colors.border,
          }}
        >
          <h3 className="text-2xl font-bold mb-6" style={{ color: themeConfig.colors.primary }}>
            🏆 Badges Earned
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {data.badges.map((badge, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50"
              >
                <div className="text-5xl mb-2 text-center">{badge.icon}</div>
                <div className="font-bold text-center mb-1">{badge.name}</div>
                <div className="text-sm text-gray-600 text-center">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div
        className="rounded-2xl p-8 shadow-lg"
        style={{
          backgroundColor: themeConfig.colors.surface,
          borderWidth: '2px',
          borderColor: themeConfig.colors.border,
        }}
      >
        <h3 className="text-2xl font-bold mb-6" style={{ color: themeConfig.colors.primary }}>
          📅 Recent Activity
        </h3>
        <div className="space-y-3">
          {data.recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200"
            >
              <div>
                <div className="font-medium">{activity.activity}</div>
                <div className="text-sm text-gray-600">{activity.date}</div>
              </div>
              <div
                className="px-4 py-2 rounded-lg font-bold"
                style={{
                  backgroundColor:
                    activity.score >= 80
                      ? '#dcfce7'
                      : activity.score >= 60
                      ? '#fef9c3'
                      : '#fee2e2',
                  color:
                    activity.score >= 80
                      ? '#166534'
                      : activity.score >= 60
                      ? '#854d0e'
                      : '#991b1b',
                }}
              >
                {activity.score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Tips */}
      <div
        className="rounded-2xl p-8 shadow-lg"
        style={{
          backgroundColor: `${themeConfig.colors.primary}11`,
          borderWidth: '2px',
          borderColor: `${themeConfig.colors.primary}44`,
        }}
      >
        <h3 className="text-2xl font-bold mb-4" style={{ color: themeConfig.colors.primary }}>
          💡 Keep Going!
        </h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <div className="font-medium">Set a Goal</div>
              <div className="text-sm text-gray-600">
                Try to complete at least 2 lessons per day to maintain your streak!
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <div className="font-medium">Review Regularly</div>
              <div className="text-sm text-gray-600">
                Go back to previous lessons to reinforce what you've learned.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🌟</span>
            <div>
              <div className="font-medium">Challenge Yourself</div>
              <div className="text-sm text-gray-600">
                Try to improve your scores on practice exercises!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
