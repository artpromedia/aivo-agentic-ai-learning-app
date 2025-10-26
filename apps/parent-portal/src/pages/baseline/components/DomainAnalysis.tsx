/**
 * Domain Analysis Component
 * Shows detailed breakdown for a single domain
 */
import type { BaselineResults, Domain } from '../../../../../learner-app/src/types/baseline';

export function DomainAnalysis({
  domain,
  results,
  showTechnical,
}: {
  domain: Domain;
  results: BaselineResults;
  showTechnical: boolean;
}) {
  const gradeLevel = results.domainScores?.[domain];
  const theta = results.abilityEstimates?.[domain];
  const se = results.standardErrors?.[domain];
  const ci = results.confidenceIntervals?.[domain];

  // Early return if domain data not available
  if (!gradeLevel || theta === undefined || se === undefined) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for this domain.
      </div>
    );
  }

  const domainStrengths = results.strengths.filter((s: string) =>
    s.toLowerCase().includes(domain)
  );
  const domainGaps = results.gaps.filter((g: string) =>
    g.toLowerCase().includes(domain)
  );

  const subDomainData = getSubDomainScores(results, domain);

  return (
    <div className="space-y-6">
      {/* Grade Level Summary */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-purple-600 mb-2">
            {gradeLevel.toFixed(1)}
          </div>
          <div className="text-sm text-gray-700 font-medium">
            Grade Level Equivalent
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {ci && `(Range: ${ci.lower.toFixed(1)}–${ci.upper.toFixed(1)}, 95% confidence)`}
          </div>
        </div>

        <div className="flex-1 w-full">
          <GradeLevelBar
            current={gradeLevel}
            lower={ci?.lower ?? gradeLevel - 0.5}
            upper={ci?.upper ?? gradeLevel + 0.5}
            gradeBand={results.gradeBand}
          />
        </div>
      </div>

      {/* Technical IRT Metrics */}
      {showTechnical && (
        <div className="p-4 rounded-lg bg-gray-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ability Estimate (θ):</span>
            <span className="font-mono font-medium">{theta.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Standard Error (SE):</span>
            <span className="font-mono font-medium">{se.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Measurement Precision:</span>
            <span className="font-medium">
              {se < 0.3 ? '🎯 Excellent' : se < 0.5 ? '✓ Good' : '~ Fair'}
            </span>
          </div>
          <p className="text-xs text-gray-600 pt-2 border-t border-gray-300">
            The ability estimate (theta) places your child on the IRT scale, where 0 represents
            average ability. Standard error indicates measurement precision (smaller is better).
          </p>
        </div>
      )}

      {/* Sub-Domain Breakdown */}
      {subDomainData.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 text-gray-900">Skills Breakdown</h4>
          <div className="space-y-2">
            {subDomainData.map((subDomain, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-48 text-sm text-gray-700">{subDomain.name}</div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${(subDomain.score / 6) * 100}%` }}
                  />
                </div>
                <div className="w-16 text-sm font-medium text-gray-900 text-right">
                  Grade {subDomain.score.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Gaps */}
      <div className="grid md:grid-cols-2 gap-4">
        {domainStrengths.length > 0 && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <span>✨</span>
              <span>Strengths</span>
            </h4>
            <ul className="space-y-1">
              {domainStrengths.map((strength: string, idx: number) => (
                <li key={idx} className="text-sm text-green-800 pl-4 relative before:content-['•'] before:absolute before:left-0">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {domainGaps.length > 0 && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span>🎯</span>
              <span>Growth Areas</span>
            </h4>
            <ul className="space-y-1">
              {domainGaps.map((gap: string, idx: number) => (
                <li key={idx} className="text-sm text-blue-800 pl-4 relative before:content-['•'] before:absolute before:left-0">
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function GradeLevelBar({
  current,
  lower,
  upper,
  gradeBand,
}: {
  current: number;
  lower: number;
  upper: number;
  gradeBand: string;
}) {
  const bandMin = gradeBand === 'K-5' ? 0 : gradeBand === '6-8' ? 5 : 8;
  const bandMax = gradeBand === 'K-5' ? 6 : gradeBand === '6-8' ? 9 : 13;
  
  const currentPercent = ((current - bandMin) / (bandMax - bandMin)) * 100;
  const lowerPercent = ((lower - bandMin) / (bandMax - bandMin)) * 100;
  const upperPercent = ((upper - bandMin) / (bandMax - bandMin)) * 100;

  return (
    <div className="relative">
      <div className="h-8 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full overflow-hidden relative">
        {/* Confidence interval */}
        <div
          className="absolute h-full bg-purple-400/40"
          style={{
            left: `${Math.max(0, lowerPercent)}%`,
            width: `${Math.min(100, upperPercent) - Math.max(0, lowerPercent)}%`,
          }}
        />
        
        {/* Current position marker */}
        <div
          className="absolute top-0 w-1 h-full bg-purple-600 shadow-lg"
          style={{ left: `${currentPercent}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Grade {bandMin}</span>
        <span className="font-medium text-purple-600">Grade {current.toFixed(1)}</span>
        <span>Grade {bandMax}</span>
      </div>
    </div>
  );
}

function getSubDomainScores(results: BaselineResults, domain: string): Array<{ name: string; score: number }> {
  if (!results.subDomainScores) return [];
  
  // Filter sub-domains for this domain
  const subDomains = Object.entries(results.subDomainScores)
    .filter(([key]) => key.toLowerCase().includes(domain))
    .map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      score: value as number,
    }));
  
  return subDomains;
}
