/**
 * Analytics Service
 * Tracks visitor flow, feature card clicks, and CTA conversions
 */

export interface AnalyticsEvent {
  eventType: string;
  eventName: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface PageMetrics {
  pageView: number;
  featureCardClicks: Record<string, number>;
  ctaClicks: number;
  quickStartProgress: number;
  donationClicks: number;
  sessionDuration: number;
  bounceRate: number;
}

class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private pageMetrics: PageMetrics = {
    pageView: 0,
    featureCardClicks: {},
    ctaClicks: 0,
    quickStartProgress: 0,
    donationClicks: 0,
    sessionDuration: 0,
    bounceRate: 0,
  };
  private sessionStartTime: number = Date.now();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize analytics tracking
   */
  private initializeTracking(): void {
    // Track page view
    this.trackEvent('page', 'page_view', {
      page: 'landing',
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });

    // Track unload to calculate session duration
    window.addEventListener('beforeunload', () => {
      this.pageMetrics.sessionDuration = Date.now() - this.sessionStartTime;
      this.sendAnalytics();
    });
  }

  /**
   * Track generic event
   */
  trackEvent(
    eventType: string,
    eventName: string,
    metadata?: Record<string, any>
  ): void {
    const event: AnalyticsEvent = {
      eventType,
      eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      metadata,
    };

    this.events.push(event);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }
  }

  /**
   * Track feature card click
   */
  trackFeatureCardClick(cardName: string): void {
    this.pageMetrics.featureCardClicks[cardName] =
      (this.pageMetrics.featureCardClicks[cardName] || 0) + 1;

    this.trackEvent('engagement', 'feature_card_click', {
      cardName,
      clickCount: this.pageMetrics.featureCardClicks[cardName],
    });
  }

  /**
   * Track CTA button click
   */
  trackCtaClick(ctaName: string): void {
    this.pageMetrics.ctaClicks += 1;

    this.trackEvent('conversion', 'cta_click', {
      ctaName,
      totalCtaClicks: this.pageMetrics.ctaClicks,
    });
  }

  /**
   * Track quick start progress
   */
  trackQuickStartProgress(stepId: string, completed: boolean): void {
    if (completed) {
      this.pageMetrics.quickStartProgress += 1;
    }

    this.trackEvent('engagement', 'quick_start_progress', {
      stepId,
      completed,
      progress: this.pageMetrics.quickStartProgress,
    });
  }

  /**
   * Track donation click
   */
  trackDonationClick(): void {
    this.pageMetrics.donationClicks += 1;

    this.trackEvent('conversion', 'donation_click', {
      totalDonationClicks: this.pageMetrics.donationClicks,
    });
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(percentage: number): void {
    this.trackEvent('engagement', 'scroll_depth', {
      percentage,
      timestamp: Date.now(),
    });
  }

  /**
   * Track testimonial view
   */
  trackTestimonialView(testimonialIndex: number): void {
    this.trackEvent('engagement', 'testimonial_view', {
      testimonialIndex,
      timestamp: Date.now(),
    });
  }

  /**
   * Get current page metrics
   */
  getPageMetrics(): PageMetrics {
    return {
      ...this.pageMetrics,
      sessionDuration: Date.now() - this.sessionStartTime,
    };
  }

  /**
   * Get all tracked events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Send analytics data to backend
   */
  private async sendAnalytics(): Promise<void> {
    try {
      const payload = {
        sessionId: this.sessionId,
        events: this.events,
        metrics: this.getPageMetrics(),
        timestamp: Date.now(),
      };

      // Send to analytics endpoint (would be implemented on backend)
      console.log('[Analytics] Sending data:', payload);

      // In production, this would send to your backend analytics service
      // await fetch('/api/analytics/track', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
    } catch (error) {
      console.error('[Analytics] Error sending analytics:', error);
    }
  }

  /**
   * Manual flush of analytics data
   */
  async flush(): Promise<void> {
    await this.sendAnalytics();
  }

  /**
   * Reset analytics for new session
   */
  reset(): void {
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.pageMetrics = {
      pageView: 0,
      featureCardClicks: {},
      ctaClicks: 0,
      quickStartProgress: 0,
      donationClicks: 0,
      sessionDuration: 0,
      bounceRate: 0,
    };
    this.sessionStartTime = Date.now();
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Export hook for React components
export function useAnalytics() {
  return {
    trackEvent: (type: string, name: string, metadata?: Record<string, any>) =>
      analyticsService.trackEvent(type, name, metadata),
    trackFeatureCardClick: (cardName: string) =>
      analyticsService.trackFeatureCardClick(cardName),
    trackCtaClick: (ctaName: string) =>
      analyticsService.trackCtaClick(ctaName),
    trackQuickStartProgress: (stepId: string, completed: boolean) =>
      analyticsService.trackQuickStartProgress(stepId, completed),
    trackDonationClick: () => analyticsService.trackDonationClick(),
    trackScrollDepth: (percentage: number) =>
      analyticsService.trackScrollDepth(percentage),
    trackTestimonialView: (index: number) =>
      analyticsService.trackTestimonialView(index),
    getMetrics: () => analyticsService.getPageMetrics(),
    getEvents: () => analyticsService.getEvents(),
    flush: () => analyticsService.flush(),
  };
}
