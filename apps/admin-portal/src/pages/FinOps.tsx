import React from 'react';

/**
 * FinOps Dashboard - Financial Operations
 * Cost optimization and financial monitoring
 */
export const FinOps: React.FC = () => {
  const costMetrics = {
    totalSpend: 125430,
    costPerStudent: 0.88,
    budget: 140000,
    aiInference: 45200,
    storage: 18900,
  };

  const costBreakdown = [
    { service: 'AI Model Inference (GPU)', cost: 45200, percentage: 36, trend: +12.1 },
    { service: 'Database (RDS)', cost: 28700, percentage: 23, trend: +3.5 },
    { service: 'Storage (S3)', cost: 18900, percentage: 15, trend: +4.2 },
    { service: 'Compute (EC2)', cost: 15800, percentage: 13, trend: -2.1 },
    { service: 'CDN (CloudFront)', cost: 9500, percentage: 8, trend: +1.5 },
    { service: 'Monitoring & Logs', cost: 6330, percentage: 5, trend: +0.8 },
  ];

  const optimizations = [
    { title: 'Unused GPU Instances', description: '3 GPU instances have been idle for 7+ days', savings: 2400, priority: 'high' },
    { title: 'Reserved Instance Purchase', description: 'Convert on-demand EC2 to reserved instances', savings: 4800, priority: 'high' },
    { title: 'Storage Lifecycle Policy', description: 'Move old assessment data to cold storage', savings: 1200, priority: 'medium' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">FinOps Dashboard</h1>
        <p className="text-gray-600 mt-1">Financial operations and cost optimization</p>
      </div>

      {/* Cost Overview */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Monthly Spend</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">${(costMetrics.totalSpend / 1000).toFixed(1)}K</div>
          <div className="text-sm text-orange-600 mt-1">+8.2% from last month</div>
          <div className="text-xs text-gray-500 mt-2">Budget: ${(costMetrics.budget / 1000).toFixed(0)}K</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Cost per Student</div>
          <div className="text-3xl font-bold text-green-600 mt-1">${costMetrics.costPerStudent}</div>
          <div className="text-sm text-green-600 mt-1">-3.5% (improved)</div>
          <div className="text-xs text-gray-500 mt-2">Target: &lt; $1.00</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">AI Inference Costs</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">${(costMetrics.aiInference / 1000).toFixed(1)}K</div>
          <div className="text-sm text-gray-600 mt-1">36% of total</div>
          <div className="text-xs text-orange-600 mt-2">+12.1% growth</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Storage Costs</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">${(costMetrics.storage / 1000).toFixed(1)}K</div>
          <div className="text-sm text-gray-600 mt-1">15% of total</div>
          <div className="text-xs text-gray-500 mt-2">+4.2% growth</div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown by Service</h2>
        <div className="space-y-3">
          {costBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-medium text-gray-900">{item.service}</span>
                  <span className="text-sm text-gray-600">${(item.cost / 1000).toFixed(1)}K/mo</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="text-sm font-medium text-gray-900">{item.percentage}%</div>
                <div className={`text-xs ${item.trend > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {item.trend > 0 ? '+' : ''}{item.trend}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Optimization Opportunities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Optimization Opportunities</h2>
        <div className="space-y-4">
          {optimizations.map((opt, index) => (
            <div key={index} className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{opt.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${opt.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {opt.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{opt.description}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold text-green-600">${(opt.savings / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-gray-600">potential savings/mo</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinOps;
