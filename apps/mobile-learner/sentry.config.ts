// @ts-ignore - Package will be installed
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: __DEV__ ? 'development' : 'production',
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000, // 30 seconds
  
  // Attach screenshots and view hierarchy for error reports
  attachScreenshot: true,
  attachViewHierarchy: true,
  
  // Integration options
  integrations: [
    new Sentry.ReactNativeTracing({
      tracingOrigins: ['localhost', /^\//],
      routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
    }),
  ],
  
  // Before sending events
  beforeSend(event, hint) {
    // Don't send events in development
    if (__DEV__) {
      console.log('[Sentry] Event (not sent in dev):', event);
      return null;
    }
    
    // Filter out sensitive data
    if (event.request?.data) {
      // Remove passwords, tokens, etc.
      const data = event.request.data as any;
      if (data.password) delete data.password;
      if (data.token) delete data.token;
      if (data.accessToken) delete data.accessToken;
    }
    
    return event;
  },
  
  // Before capturing breadcrumbs
  beforeBreadcrumb(breadcrumb, hint) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
      return null;
    }
    
    return breadcrumb;
  },
  
  // Error sampling
  sampleRate: 1.0, // Send 100% of errors
  
  // Enable native crash reporting
  enableNative: true,
  enableNativeNagger: false, // Don't show native setup warnings
  
  // Auto instrumentation
  enableAutoPerformanceTracing: true,
  enableWatchdogTerminationTracking: true,
  
  // Debug options (only in development)
  debug: __DEV__,
});

// Add global error handler
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  // Log to Sentry
  Sentry.captureException(error, {
    level: isFatal ? 'fatal' : 'error',
    tags: {
      isFatal: isFatal.toString(),
    },
  });
  
  // Call original handler
  if (originalHandler) {
    originalHandler(error, isFatal);
  }
});

export default Sentry;
