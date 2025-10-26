/**
 * Analytics Service
 * Tracks user events and enrollment metrics
 */

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

class AnalyticsService {
  private isProduction = import.meta.env.PROD;
  private debugMode = import.meta.env.DEV;

  /**
   * Log an event
   */
  logEvent(eventName: string, properties?: EventProperties) {
    if (this.debugMode) {
      console.log(`📊 Analytics Event: ${eventName}`, properties);
    }

    // In production, send to analytics service (e.g., Google Analytics, Mixpanel, etc.)
    if (this.isProduction) {
      // TODO: Integrate with actual analytics service
      // Example: gtag('event', eventName, properties);
    }

    // Store in localStorage for debugging
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      });
      // Keep only last 100 events
      if (events.length > 100) events.shift();
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }

  /**
   * Track enrollment completion
   */
  trackEnrollmentComplete(data: {
    hasIEP: boolean;
    diagnosesCount: number;
    accommodationsCount: number;
    gradeLevel: string;
    accessibilityFeaturesEnabled: number;
  }) {
    this.logEvent('enrollment_completed', {
      has_iep: data.hasIEP,
      diagnoses_count: data.diagnosesCount,
      accommodations_count: data.accommodationsCount,
      grade_level: data.gradeLevel,
      accessibility_features: data.accessibilityFeaturesEnabled,
    });
  }

  /**
   * Track enrollment step progress
   */
  trackEnrollmentStep(stepNumber: number, stepName: string) {
    this.logEvent('enrollment_step_viewed', {
      step_number: stepNumber,
      step_name: stepName,
    });
  }

  /**
   * Track enrollment abandonment
   */
  trackEnrollmentAbandoned(stepNumber: number, stepName: string) {
    this.logEvent('enrollment_abandoned', {
      step_number: stepNumber,
      step_name: stepName,
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsed(featureName: string, properties?: EventProperties) {
    this.logEvent('feature_used', {
      feature_name: featureName,
      ...properties,
    });
  }

  /**
   * Track errors
   */
  trackError(errorMessage: string, context?: EventProperties) {
    this.logEvent('error_occurred', {
      error_message: errorMessage,
      ...context,
    });
  }

  /**
   * Get all tracked events (for debugging)
   */
  getTrackedEvents() {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear tracked events
   */
  clearEvents() {
    localStorage.removeItem('analytics_events');
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
