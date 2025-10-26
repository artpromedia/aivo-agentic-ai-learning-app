/**
 * Engagement Tracker
 * Monitors and visualizes learner engagement during assessment
 */
import { useState, useEffect } from 'react';
import { Clock, Eye, Heart, Zap, AlertTriangle } from 'lucide-react';

interface EngagementMetrics {
  focusLevel: 'high' | 'medium' | 'low';
  hesitationIndicators: number;
  avgResponseTime: number;
  consecutiveQuickResponses: number;
  consecutiveSlowResponses: number;
  skippedItems: number;
  hintsUsed: number;
}

interface EngagementTrackerProps {
  metrics: EngagementMetrics;
  currentQuestionTime: number; // seconds on current question
  showDetailedMetrics?: boolean;
}

export function EngagementTracker({
  metrics,
  currentQuestionTime,
  showDetailedMetrics = false
}: EngagementTrackerProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  
  // Pulse indicator when time gets too long
  useEffect(() => {
    if (currentQuestionTime > 60) {
      setIsPulsing(true);
    } else {
      setIsPulsing(false);
    }
  }, [currentQuestionTime]);
  
  // Calculate engagement score (0-100)
  const calculateEngagementScore = (): number => {
    let score = 100;
    
    // Deduct for low focus
    if (metrics.focusLevel === 'low') score -= 30;
    else if (metrics.focusLevel === 'medium') score -= 15;
    
    // Deduct for excessive hesitation
    if (metrics.hesitationIndicators > 5) score -= 10;
    
    // Deduct for very fast responses (may be guessing)
    if (metrics.consecutiveQuickResponses > 3) score -= 15;
    
    // Deduct for very slow responses (may be distracted)
    if (metrics.consecutiveSlowResponses > 2) score -= 10;
    
    // Deduct for skipped items
    score -= metrics.skippedItems * 5;
    
    // Bonus for appropriate hint use (shows metacognition)
    if (metrics.hintsUsed > 0 && metrics.hintsUsed <= 3) score += 5;
    
    return Math.max(0, Math.min(100, score));
  };
  
  const engagementScore = calculateEngagementScore();
  
  // Get engagement level
  const getEngagementLevel = (): { label: string; color: string; icon: typeof Heart } => {
    if (engagementScore >= 80) {
      return { label: 'Excellent', color: 'text-green-600', icon: Zap };
    } else if (engagementScore >= 60) {
      return { label: 'Good', color: 'text-blue-600', icon: Heart };
    } else if (engagementScore >= 40) {
      return { label: 'Fair', color: 'text-yellow-600', icon: Eye };
    } else {
      return { label: 'Low', color: 'text-red-600', icon: AlertTriangle };
    }
  };
  
  const { label, color, icon: Icon } = getEngagementLevel();
  
  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };
  
  // Compact view
  if (!showDetailedMetrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className={`text-sm font-medium ${color}`}>
            {label} Engagement
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 text-gray-400 ${isPulsing ? 'animate-pulse' : ''}`} />
          <span className="text-sm text-gray-600">
            {formatTime(currentQuestionTime)}
          </span>
        </div>
      </div>
    );
  }
  
  // Detailed view
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-6 h-6 ${color}`} />
          <div>
            <div className={`text-lg font-semibold ${color}`}>
              {label} Engagement
            </div>
            <div className="text-xs text-gray-500">
              Score: {engagementScore}/100
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
          isPulsing ? 'bg-yellow-100 animate-pulse' : 'bg-gray-100'
        }`}>
          <Clock className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {formatTime(currentQuestionTime)}
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              engagementScore >= 80 ? 'bg-green-500' :
              engagementScore >= 60 ? 'bg-blue-500' :
              engagementScore >= 40 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${engagementScore}%` }}
          />
        </div>
      </div>
      
      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Focus Level */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Focus Level</div>
          <div className={`text-sm font-semibold ${
            metrics.focusLevel === 'high' ? 'text-green-600' :
            metrics.focusLevel === 'medium' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {metrics.focusLevel.charAt(0).toUpperCase() + metrics.focusLevel.slice(1)}
          </div>
        </div>
        
        {/* Avg Response Time */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Avg Response</div>
          <div className="text-sm font-semibold text-gray-900">
            {formatTime(Math.round(metrics.avgResponseTime))}
          </div>
        </div>
        
        {/* Hesitation Count */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Hesitations</div>
          <div className={`text-sm font-semibold ${
            metrics.hesitationIndicators > 5 ? 'text-yellow-600' : 'text-gray-900'
          }`}>
            {metrics.hesitationIndicators}
          </div>
        </div>
        
        {/* Hints Used */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Hints Used</div>
          <div className={`text-sm font-semibold ${
            metrics.hintsUsed > 3 ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {metrics.hintsUsed}
          </div>
        </div>
      </div>
      
      {/* Warnings */}
      {(metrics.consecutiveQuickResponses > 3 || 
        metrics.consecutiveSlowResponses > 2 || 
        currentQuestionTime > 60) && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              {metrics.consecutiveQuickResponses > 3 && (
                <div>Several quick responses detected. Take your time!</div>
              )}
              {metrics.consecutiveSlowResponses > 2 && (
                <div>Taking longer than usual. Need a break?</div>
              )}
              {currentQuestionTime > 60 && (
                <div>You've been on this question for a while. It's okay to skip!</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Positive Feedback */}
      {engagementScore >= 80 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-800 font-medium">
              Great focus! You're doing awesome! 🌟
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
