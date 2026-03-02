// Google Analytics Integration for RRB
// This module handles all analytics tracking for visitor engagement

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp?: number;
}

interface PageView {
  path: string;
  title: string;
  referrer?: string;
  timestamp?: number;
}

class AnalyticsTracker {
  private trackingId: string = 'G-RRBJAELON'; // RRB Tracking ID
  private sessionId: string = '';
  private userId: string = '';
  private events: AnalyticsEvent[] = [];
  private pageViews: PageView[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.initializeGoogleAnalytics();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string {
    let userId = localStorage.getItem('rrb_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('rrb_user_id', userId);
    }
    return userId;
  }

  private initializeGoogleAnalytics(): void {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', this.trackingId, {
      'user_id': this.userId,
      'session_id': this.sessionId,
    });

    (window as any).gtag = gtag;
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title: string, referrer?: string): void {
    const pageView: PageView = {
      path,
      title,
      referrer,
      timestamp: Date.now(),
    };

    this.pageViews.push(pageView);

    // Send to Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        'page_path': path,
        'page_title': title,
        'referrer': referrer,
      });
    }

    // Store locally
    this.saveAnalyticsData();
  }

  /**
   * Track custom event
   */
  trackEvent(category: string, action: string, label?: string, value?: number): void {
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
    };

    this.events.push(event);

    // Send to Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', action, {
        'event_category': category,
        'event_label': label,
        'value': value,
      });
    }

    // Store locally
    this.saveAnalyticsData();
  }

  /**
   * Track stream play event
   */
  trackStreamPlay(streamName: string, streamUrl: string): void {
    this.trackEvent('stream', 'play', streamName);
    this.trackEvent('engagement', 'audio_start', streamUrl);
  }

  /**
   * Track stream pause event
   */
  trackStreamPause(streamName: string, duration: number): void {
    this.trackEvent('stream', 'pause', streamName, duration);
  }

  /**
   * Track newsletter signup
   */
  trackNewsletterSignup(email: string): void {
    this.trackEvent('conversion', 'newsletter_signup', email);
  }

  /**
   * Track content view
   */
  trackContentView(contentType: string, contentId: string, contentTitle: string): void {
    this.trackEvent('content', 'view', `${contentType}:${contentId}`, 1);
  }

  /**
   * Track user engagement
   */
  trackEngagement(engagementType: string, duration: number, details?: string): void {
    this.trackEvent('engagement', engagementType, details, duration);
  }

  /**
   * Track search
   */
  trackSearch(searchTerm: string, resultsCount: number): void {
    this.trackEvent('search', 'search', searchTerm, resultsCount);
  }

  /**
   * Track download
   */
  trackDownload(fileName: string, fileType: string): void {
    this.trackEvent('download', 'file_download', `${fileName}.${fileType}`);
  }

  /**
   * Track share
   */
  trackShare(contentType: string, contentId: string, platform: string): void {
    this.trackEvent('social', 'share', `${contentType}:${platform}`, 1);
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      totalEvents: this.events.length,
      totalPageViews: this.pageViews.length,
      events: this.events,
      pageViews: this.pageViews,
      sessionDuration: Date.now() - parseInt(this.sessionId.split('_')[1]),
    };
  }

  /**
   * Save analytics data to localStorage
   */
  private saveAnalyticsData(): void {
    const analyticsData = {
      sessionId: this.sessionId,
      userId: this.userId,
      events: this.events,
      pageViews: this.pageViews,
      lastUpdated: Date.now(),
    };

    localStorage.setItem('rrb_analytics', JSON.stringify(analyticsData));
  }

  /**
   * Get stored analytics data
   */
  static getStoredAnalytics() {
    const data = localStorage.getItem('rrb_analytics');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Clear analytics data
   */
  static clearAnalytics(): void {
    localStorage.removeItem('rrb_analytics');
  }

  /**
   * Export analytics data
   */
  exportAnalytics(): string {
    const summary = this.getAnalyticsSummary();
    return JSON.stringify(summary, null, 2);
  }

  /**
   * Export analytics as CSV
   */
  exportAnalyticsAsCSV(): string {
    let csv = 'Timestamp,Category,Action,Label,Value\n';

    this.events.forEach((event) => {
      csv += `${event.timestamp},${event.category},${event.action},"${event.label || ''}",${event.value || ''}\n`;
    });

    return csv;
  }
}

// Create singleton instance
export const analytics = new AnalyticsTracker();

// Export for use in components
export default analytics;

// Type definitions for window.dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
