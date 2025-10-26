/**
 * Shared state components for results pages
 */

export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div 
          className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"
          role="status"
          aria-label="Loading assessment results"
        />
        <p className="text-lg text-gray-600">Loading assessment results...</p>
      </div>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Results Not Found</h2>
        <p className="text-gray-600 mb-4">
          We couldn't load the assessment results. This might be because:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-6">
          <li>The assessment hasn't been completed yet</li>
          <li>The results are still being processed</li>
          <li>You don't have permission to view these results</li>
        </ul>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
