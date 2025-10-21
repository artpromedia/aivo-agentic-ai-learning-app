import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import { auditLog, getCurrentActor } from '@aivo/utils';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState(prev => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // Log to audit system
    auditLog.log({
      eventType: 'system.maintenance_started', // Using existing type as proxy
      category: 'system',
      severity: 'error',
      actor: getCurrentActor(),
      action: `Application error: ${error.message}`,
      metadata: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        componentStack: errorInfo.componentStack,
        errorCount: this.state.errorCount + 1,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      status: 'failure',
      errorMessage: error.message,
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorTracking(error, errorInfo);
    }
  }

  private sendToErrorTracking(error: Error, errorInfo: ErrorInfo) {
    // Send to Sentry, LogRocket, or custom service
    try {
      fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          errorInfo: {
            componentStack: errorInfo.componentStack,
          },
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch(err => console.error('Failed to send error report:', err));
    } catch (err) {
      console.error('Failed to send error report:', err);
    }
  }

  private reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private hardReset = () => {
    // Clear all local storage and reload
    if (window.confirm('This will clear all local data and reload the page. Continue?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.reset);
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorCount={this.state.errorCount}
          showDetails={this.props.showDetails ?? process.env.NODE_ENV === 'development'}
          onReset={this.reset}
          onHardReset={this.hardReset}
        />
      );
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  errorCount: number;
  showDetails: boolean;
  onReset: () => void;
  onHardReset: () => void;
}

const DefaultErrorFallback: React.FC<FallbackProps> = ({
  error,
  errorInfo,
  errorCount,
  showDetails,
  onReset,
  onHardReset,
}) => {
  const [showStack, setShowStack] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyError = () => {
    const errorText = `
Error: ${error.name}
Message: ${error.message}

Stack Trace:
${error.stack}

Component Stack:
${errorInfo.componentStack}

URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8" data-testid="error-boundary-fallback">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">💥</div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-neutral-600">
            We're sorry for the inconvenience. The error has been logged and we'll look into it.
          </p>
        </div>

        {/* Error Count Warning */}
        {errorCount > 1 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-900 mb-1">
                  Multiple errors detected ({errorCount})
                </p>
                <p className="text-sm text-red-800">
                  If problems persist, try the "Clear Data & Reload" option below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Details (Development) */}
        {showDetails && (
          <div className="mb-6">
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-red-900">
                  {error.name}: {error.message}
                </p>
                <button
                  onClick={handleCopyError}
                  className="px-3 py-1 bg-white border border-red-300 rounded text-xs hover:bg-red-50"
                  data-testid="copy-error"
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>

              <button
                onClick={() => setShowStack(!showStack)}
                className="text-sm text-red-700 underline"
                data-testid="toggle-stack"
              >
                {showStack ? 'Hide' : 'Show'} stack trace
              </button>

              {showStack && (
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-red-900 mb-1">Stack:</div>
                    <pre className="text-xs bg-white p-3 rounded border border-red-200 overflow-x-auto">
                      {error.stack}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-red-900 mb-1">Component Stack:</div>
                    <pre className="text-xs bg-white p-3 rounded border border-red-200 overflow-x-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onReset}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            data-testid="try-again"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 border-2 border-neutral-300 rounded-xl font-medium hover:bg-neutral-50 transition"
            data-testid="go-home"
          >
            Go to Home Page
          </button>

          <button
            onClick={onHardReset}
            className="w-full px-6 py-3 border-2 border-red-300 text-red-700 rounded-xl font-medium hover:bg-red-50 transition"
            data-testid="hard-reset"
          >
            Clear Data & Reload
          </button>
        </div>

        {/* Support */}
        <div className="mt-6 pt-6 border-t text-center text-sm text-neutral-600">
          <p>
            If this problem continues, please{' '}
            <a href="/support" className="text-blue-600 hover:underline">
              contact support
            </a>
            {' '}with the error details above.
          </p>
        </div>
      </div>
    </div>
  );
};

// Specialized error boundaries for specific contexts
export const LearnerErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold mb-4">Oops! Something broke</h2>
            <p className="text-neutral-600 mb-6">
              Don't worry, your progress is saved. Let's try starting over!
            </p>
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-lg hover:bg-blue-700 transition"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
