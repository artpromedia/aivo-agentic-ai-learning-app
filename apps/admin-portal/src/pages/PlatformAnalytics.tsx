import { getUsageAnalytics } from '../utils/mockData';

export default function PlatformAnalytics() {
  const analytics = getUsageAnalytics();
  const latest = analytics[analytics.length - 1];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Platform Analytics</h1>
        <p className="text-neutral-600 mt-1">Usage analytics, performance metrics, and growth tracking</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Daily Active Users</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{latest.dailyActiveUsers.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-2">+{latest.newUsers} new today</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Monthly Active Users</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{latest.monthlyActiveUsers.toLocaleString()}</p>
          <p className="text-sm text-neutral-500 mt-2">{latest.retentionRate.toFixed(1)}% retention</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Avg Session Duration</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{latest.averageSessionDuration} min</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <p className="text-sm font-medium text-neutral-600">Activities Completed</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{latest.activitiesCompleted.toLocaleString()}</p>
        </div>
      </div>

      {/* Usage Trend Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900 mb-6">User Activity Trend (Last 30 Days)</h2>
        <div className="h-64 flex items-end justify-between gap-2 overflow-hidden">
          {analytics.slice(-30).map((day, index) => {
            const maxUsers = Math.max(...analytics.map(a => a.dailyActiveUsers));
            const height = (day.dailyActiveUsers / maxUsers) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center min-w-0">
                <div
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t hover:from-indigo-600 hover:to-indigo-500 transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${day.dailyActiveUsers} users`}
                />
                {index % 5 === 0 && (
                  <span className="text-xs text-neutral-500 mt-2">
                    {new Date(day.date).getDate()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Growth Metrics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <span className="text-neutral-700">User Acquisition Rate</span>
              <span className="text-lg font-bold text-green-600">+12.5%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <span className="text-neutral-700">District Expansion</span>
              <span className="text-lg font-bold text-blue-600">+8.3%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <span className="text-neutral-700">Revenue Growth</span>
              <span className="text-lg font-bold text-purple-600">+15.7%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <span className="text-neutral-700">Net Promoter Score</span>
              <span className="text-lg font-bold text-indigo-600">72</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Feature Adoption</h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-700">AI Speech Therapy</span>
                <span className="font-semibold text-neutral-900">94%</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: '94%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-700">IEP Management</span>
                <span className="font-semibold text-neutral-900">87%</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '87%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-700">Parent Portal</span>
                <span className="font-semibold text-neutral-900">76%</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '76%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-700">Analytics Dashboard</span>
                <span className="font-semibold text-neutral-900">68%</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '68%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
