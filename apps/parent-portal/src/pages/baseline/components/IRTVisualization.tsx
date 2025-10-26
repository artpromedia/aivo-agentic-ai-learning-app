/**
 * IRT Visualization Component
 * Technical view of IRT ability estimates with confidence intervals
 */
import type { BaselineResults, Domain } from '../../../../../learner-app/src/types/baseline';

export function IRTVisualization({ results }: { results: BaselineResults }) {
  const domains: Domain[] = ['reading', 'math', 'science', 'sel'];
  
  const chartData = domains.map(domain => ({
    domain: domain.charAt(0).toUpperCase() + domain.slice(1),
    theta: results.abilityEstimates[domain],
    se: results.standardErrors[domain],
    lowerCI: results.confidenceIntervals[domain].lower,
    upperCI: results.confidenceIntervals[domain].upper,
  }));

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-gray-100">
        <h4 className="font-semibold mb-2 text-gray-900">Understanding the IRT Scale</h4>
        <p className="text-sm text-gray-600 mb-2">
          Item Response Theory (IRT) measures ability on a standardized scale (theta, θ) where:
        </p>
        <ul className="text-sm text-gray-600 space-y-1 ml-4">
          <li>• <strong>θ = 0:</strong> Average ability for the grade band</li>
          <li>• <strong>θ &gt; 0:</strong> Above average (each +1 ≈ one grade level ahead)</li>
          <li>• <strong>θ &lt; 0:</strong> Below average (each -1 ≈ one grade level behind)</li>
          <li>• <strong>SE (Standard Error):</strong> Measurement precision (lower is more reliable)</li>
        </ul>
      </div>

      {/* Visual Chart */}
      <div className="space-y-4">
        {chartData.map((data, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{data.domain}</span>
              <span className="text-sm font-mono font-medium text-gray-700">
                θ = {data.theta.toFixed(2)}
              </span>
            </div>
            
            {/* IRT Scale Visualization */}
            <div className="relative h-8 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full">
              {/* Zero reference line */}
              <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gray-400" />
              
              {/* Confidence interval */}
              <div
                className="absolute h-full bg-purple-400/40 rounded-full"
                style={{
                  left: `${((data.lowerCI + 3) / 6) * 100}%`,
                  width: `${((data.upperCI - data.lowerCI) / 6) * 100}%`,
                }}
              />
              
              {/* Point estimate */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full border-2 border-white shadow-lg"
                style={{
                  left: `${((data.theta + 3) / 6) * 100}%`,
                }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-3</span>
              <span className="font-medium text-gray-700">0 (Average)</span>
              <span>+3</span>
            </div>
            
            <div className="mt-2 text-xs text-gray-600">
              95% CI: [{data.lowerCI.toFixed(2)}, {data.upperCI.toFixed(2)}] | SE = {data.se.toFixed(3)}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {chartData.map((data, idx) => (
          <div key={idx} className="p-4 rounded-lg border bg-white text-center">
            <div className="font-medium mb-2 text-gray-900">{data.domain}</div>
            <div className="text-2xl font-bold mb-1 text-purple-600">θ = {data.theta.toFixed(2)}</div>
            <div className="text-xs text-gray-600">
              SE = {data.se.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.se < 0.3 ? '🎯 Excellent precision' : data.se < 0.5 ? '✓ Good precision' : '~ Fair precision'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
