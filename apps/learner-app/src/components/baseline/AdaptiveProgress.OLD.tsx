/**
 * Adaptive Progress Indicator
 * Shows real-time progress through adaptive assessment with IRT metrics
 */
import { useState, useEffect } from 'react';
import type { Domain, BaselineSession } from '../../types/baseline';

interface AdaptiveProgressProps {
  session: BaselineSession;
  currentDomain: Domain;
  showDetailedMetrics?: boolean;
}

export function AdaptiveProgress({ 
  session, 
  currentDomain,
  showDetailedMetrics = false 
}: AdaptiveProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  const progress = (session.itemsAnswered / session.totalItems) * 100;
  const currentTheta = session.currentAbilityEstimates[currentDomain] || 0;
  const currentSE = session.standardErrors[currentDomain] || 1.0;
  
  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);
  
  // Convert theta to human-readable level
  const getAbilityLevel = (theta: number): { label: string; color: string } => {
    if (theta < -1.5) return { label: 'Emerging', color: 'bg-yellow-500' };
    if (theta < -0.5) return { label: 'Developing', color: 'bg-blue-500' };
    if (theta < 0.5) return { label: 'Proficient', color: 'bg-green-500' };
    if (theta < 1.5) return { label: 'Advanced', color: 'bg-purple-500' };
    return { label: 'Mastery', color: 'bg-pink-500' };
  };
  
  const abilityLevel = getAbilityLevel(currentTheta);
  
  // SE indicator - lower is better
  const precisionLevel = currentSE < 0.3 ? 'High' : currentSE < 0.5 ? 'Medium' : 'Low';
  const precisionColor = currentSE < 0.3 ? 'text-green-600' : currentSE < 0.5 ? 'text-yellow-600' : 'text-orange-600';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Assessment Progress
          </h3>
          <p className="text-sm text-gray-600">
            Domain: <span className="font-medium capitalize">{currentDomain}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {session.itemsAnswered}/{session.totalItems}
          </div>
          <div className="text-xs text-gray-500">Questions</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${abilityLevel.color} transition-all duration-500 ease-out`}
            style={{ width: `${animatedProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>{Math.round(progress)}%</span>
          <span>100%</span>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className={`text-xs font-medium ${abilityLevel.color.replace('bg-', 'text-')} mb-1`}>
            Current Level
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {abilityLevel.label}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs font-medium text-gray-600 mb-1">
            Accuracy
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {session.responses.length > 0
              ? `${Math.round((session.responses.filter(r => r.correct).length / session.responses.length) * 100)}%`
              : '--'}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs font-medium text-gray-600 mb-1">
            Time Elapsed
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {Math.round(session.totalTimeMs / 60000)}m
          </div>
        </div>
      </div>
      
      {/* Detailed Metrics (optional) */}
      {showDetailedMetrics && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Assessment Metrics
          </h4>
          
          <div className="space-y-2">
            {/* Ability Estimate (Theta) */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Ability Estimate (θ)</span>
              <span className="text-xs font-mono text-gray-900">
                {currentTheta.toFixed(2)}
              </span>
            </div>
            
            {/* Standard Error */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Measurement Precision</span>
              <span className={`text-xs font-medium ${precisionColor}`}>
                {precisionLevel} (SE: {currentSE.toFixed(3)})
              </span>
            </div>
            
            {/* Domains Completed */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Domains Completed</span>
              <span className="text-xs text-gray-900">
                {session.domainsCompleted.length}/5
              </span>
            </div>
            
            {/* Engagement */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Avg. Time/Question</span>
              <span className="text-xs text-gray-900">
                {session.responses.length > 0
                  ? `${Math.round(session.totalTimeMs / session.responses.length / 1000)}s`
                  : '--'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Domain Badges */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-600">Domains:</span>
          {['reading', 'math', 'science', 'writing', 'sel', 'speech'].map((domain) => {
            const isCompleted = session.domainsCompleted.includes(domain as Domain);
            const isCurrent = domain === currentDomain;
            
            return (
              <span
                key={domain}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${isCompleted ? 'bg-green-100 text-green-800' :
                    isCurrent ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500' :
                    'bg-gray-100 text-gray-600'
                  }`}
              >
                {isCompleted && <span className="mr-1">✓</span>}
                {isCurrent && <span className="mr-1">→</span>}
                <span className="capitalize">{domain}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
