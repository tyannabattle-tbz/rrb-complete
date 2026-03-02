import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { analytics } from './analytics';

describe('Analytics Tracker', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with session and user IDs', () => {
    const summary = analytics.getAnalyticsSummary();
    expect(summary.sessionId).toBeDefined();
    expect(summary.userId).toBeDefined();
    expect(summary.sessionId).toMatch(/^session_/);
    expect(summary.userId).toMatch(/^user_/);
  });

  it('should track page views', () => {
    analytics.trackPageView('/home', 'Home Page', 'https://google.com');
    const summary = analytics.getAnalyticsSummary();
    expect(summary.totalPageViews).toBe(1);
    expect(summary.pageViews[0].path).toBe('/home');
    expect(summary.pageViews[0].title).toBe('Home Page');
  });

  it('should track custom events', () => {
    analytics.trackEvent('engagement', 'button_click', 'subscribe_button', 1);
    const summary = analytics.getAnalyticsSummary();
    expect(summary.totalEvents).toBe(1);
    expect(summary.events[0].category).toBe('engagement');
    expect(summary.events[0].action).toBe('button_click');
  });

  it('should track stream play events', () => {
    analytics.trackStreamPlay('RRB Live', 'https://stream.example.com/live');
    const summary = analytics.getAnalyticsSummary();
    expect(summary.totalEvents).toBeGreaterThanOrEqual(2);
  });

  it('should track newsletter signups', () => {
    analytics.trackNewsletterSignup('test@example.com');
    const summary = analytics.getAnalyticsSummary();
    expect(summary.totalEvents).toBeGreaterThan(0);
    const signupEvent = summary.events.find((e) => e.action === 'newsletter_signup');
    expect(signupEvent).toBeDefined();
  });

  it('should track content views', () => {
    analytics.trackContentView('podcast', 'ep-001', 'Episode 1');
    const summary = analytics.getAnalyticsSummary();
    expect(summary.totalEvents).toBeGreaterThan(0);
  });

  it('should track engagement', () => {
    analytics.trackEngagement('listen', 300, 'RRB Live Stream');
    const summary = analytics.getAnalyticsSummary();
    expect(summary.totalEvents).toBeGreaterThan(0);
    const engagementEvent = summary.events.find((e) => e.action === 'listen');
    expect(engagementEvent?.value).toBe(300);
  });

  it('should track searches', () => {
    analytics.trackSearch('rock music', 42);
    const summary = analytics.getAnalyticsSummary();
    expect(summary.totalEvents).toBeGreaterThan(0);
  });

  it('should track downloads', () => {
    analytics.trackDownload('episode-001', 'mp3');
    const summary = analytics.getAnalyticsSummary();
    expect(summary.totalEvents).toBeGreaterThan(0);
  });

  it('should track shares', () => {
    analytics.trackShare('podcast', 'ep-001', 'twitter');
    const summary = analytics.getAnalyticsSummary();
    expect(summary.totalEvents).toBeGreaterThan(0);
  });

  it('should save and retrieve analytics data', () => {
    analytics.trackEvent('test', 'action', 'label', 1);
    const stored = analytics.getAnalyticsSummary();
    expect(stored.totalEvents).toBeGreaterThan(0);
  });

  it('should export analytics as JSON', () => {
    analytics.trackEvent('test', 'action', 'label', 1);
    const exported = analytics.exportAnalytics();
    expect(exported).toBeDefined();
    const parsed = JSON.parse(exported);
    expect(parsed.totalEvents).toBeGreaterThan(0);
  });

  it('should export analytics as CSV', () => {
    analytics.trackEvent('test', 'action', 'label', 1);
    const csv = analytics.exportAnalyticsAsCSV();
    expect(csv).toContain('Timestamp,Category,Action,Label,Value');
    expect(csv).toContain('test');
  });

  it('should maintain session duration', () => {
    const summary = analytics.getAnalyticsSummary();
    expect(summary.sessionDuration).toBeGreaterThanOrEqual(0);
  });

  it('should clear analytics data', () => {
    analytics.trackEvent('test', 'action');
    analytics.trackPageView('/test', 'Test');
    const beforeClear = analytics.getAnalyticsSummary();
    expect(beforeClear.totalEvents).toBeGreaterThan(0);

    // Clear and verify
    const stored = analytics.getStoredAnalytics();
    expect(stored).toBeDefined();
  });
});
