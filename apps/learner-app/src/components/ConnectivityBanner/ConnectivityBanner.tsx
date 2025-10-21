import React, { useState } from 'react';
import { useOfflineStatus, type QueuedAction } from '@aivo/utils';

export const ConnectivityBanner: React.FC = () => {
  const { status, isOffline, isSlow, queueStatus, retryFailed } = useOfflineStatus();
  const [showDetails, setShowDetails] = useState(false);

  if (status === 'online' && queueStatus.pending === 0) {
    return null; // Don't show banner when everything is fine
  }

  const getBannerStyle = () => {
    switch (status) {
      case 'offline':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'slow':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'online':
        return 'bg-blue-100 border-blue-300 text-blue-900';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'offline':
        return '📡';
      case 'slow':
        return '🐌';
      case 'online':
        return '🔄';
    }
  };

  const getMessage = () => {
    if (isOffline) {
      return 'You are offline. Your work is being saved locally.';
    }
    if (isSlow) {
      return 'Slow connection detected. Some features may be delayed.';
    }
    if (queueStatus.pending > 0) {
      return `Syncing ${queueStatus.pending} pending action${queueStatus.pending !== 1 ? 's' : ''}...`;
    }
    return 'Connected';
  };

  return (
    <div
      className={`sticky top-0 z-50 border-b ${getBannerStyle()}`}
      role="status"
      aria-live="polite"
      data-testid="connectivity-banner"
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden="true">
              {getIcon()}
            </span>
            <div>
              <p className="text-sm font-medium">{getMessage()}</p>
              {queueStatus.failed > 0 && (
                <p className="text-xs mt-1">
                  {queueStatus.failed} action{queueStatus.failed !== 1 ? 's' : ''} failed to sync
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {queueStatus.pending > 0 && (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                <span className="text-xs font-medium">
                  {queueStatus.pending}
                </span>
              </div>
            )}

            {queueStatus.failed > 0 && (
              <button
                className="px-3 py-1 text-sm bg-white/30 hover:bg-white/50 rounded-lg font-medium transition-colors"
                onClick={retryFailed}
                data-testid="retry-failed"
              >
                Retry Failed
              </button>
            )}

            {(queueStatus.pending > 0 || queueStatus.failed > 0) && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs underline"
                data-testid="toggle-queue-details"
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </button>
            )}
          </div>
        </div>

        {/* Queue Details */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-current/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Total in queue:</span>
                <span className="font-semibold">{queueStatus.total}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Pending:</span>
                <span className="font-semibold">{queueStatus.pending}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Processing:</span>
                <span className="font-semibold">{queueStatus.processing}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Failed:</span>
                <span className="font-semibold text-red-700">{queueStatus.failed}</span>
              </div>
            </div>

            {queueStatus.actions.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto">
                <div className="space-y-1">
                  {queueStatus.actions.slice(0, 5).map((action: QueuedAction) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between text-xs bg-white/20 rounded px-2 py-1"
                    >
                      <span className="font-mono truncate flex-1">
                        {action.type}
                      </span>
                      <span className={`
                        ml-2 px-2 py-0.5 rounded text-xs font-medium
                        ${action.status === 'completed' ? 'bg-green-200 text-green-900' :
                          action.status === 'failed' ? 'bg-red-200 text-red-900' :
                          action.status === 'processing' ? 'bg-blue-200 text-blue-900' :
                          'bg-yellow-200 text-yellow-900'}
                      `}>
                        {action.status}
                      </span>
                    </div>
                  ))}
                  {queueStatus.actions.length > 5 && (
                    <div className="text-xs text-center text-current/70 py-1">
                      +{queueStatus.actions.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
