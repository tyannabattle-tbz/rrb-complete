import { describe, it, expect, beforeAll } from "vitest";
import { getListenerAnalytics } from "./services/listenerAnalyticsService";
import { getContentScheduler } from "./services/contentSchedulerService";

describe("Listener Analytics Service", () => {
  let analytics: ReturnType<typeof getListenerAnalytics>;

  beforeAll(() => {
    // Ensure content scheduler is started first
    const scheduler = getContentScheduler();
    scheduler.start();
    analytics = getListenerAnalytics();
  });

  describe("Platform Overview", () => {
    it("should return platform overview with all required fields", () => {
      const overview = analytics.getPlatformOverview();
      expect(overview).toBeDefined();
      expect(overview.totalActiveListeners).toBeGreaterThan(0);
      expect(overview.totalChannels).toBe(7);
      expect(overview.activeChannels).toBeGreaterThan(0);
      expect(overview.peakListeners24h).toBeGreaterThan(0);
      expect(overview.avgEngagement).toBeGreaterThanOrEqual(0);
      expect(overview.avgEngagement).toBeLessThanOrEqual(100);
      expect(overview.avgSessionDuration).toBeGreaterThan(0);
      expect(overview.topChannel).toBeTruthy();
      expect(overview.topChannelListeners).toBeGreaterThan(0);
      expect(overview.autonomyLevel).toBe(90);
    });

    it("should have a valid top channel", () => {
      const overview = analytics.getPlatformOverview();
      expect(overview.topChannel).toBe("RRB Main Radio");
    });
  });

  describe("Channel Analytics", () => {
    it("should return analytics for all 7 channels", () => {
      const channelData = analytics.getChannelAnalytics();
      expect(channelData).toHaveLength(7);
    });

    it("should include hourly data for each channel", () => {
      const channelData = analytics.getChannelAnalytics();
      for (const ch of channelData) {
        expect(ch.hourlyData).toBeDefined();
        expect(ch.hourlyData.length).toBe(24);
        expect(ch.channelName).toBeTruthy();
        expect(ch.currentListeners).toBeGreaterThanOrEqual(0);
        expect(ch.engagement).toBeGreaterThanOrEqual(0);
        expect(ch.engagement).toBeLessThanOrEqual(100);
        expect(['up', 'down', 'stable']).toContain(ch.trend);
      }
    });

    it("should have valid content types", () => {
      const channelData = analytics.getChannelAnalytics();
      const validTypes = ['radio', 'podcast', 'streaming', 'emergency'];
      for (const ch of channelData) {
        expect(validTypes).toContain(ch.contentType);
      }
    });
  });

  describe("Engagement Events", () => {
    it("should return recent engagement events", () => {
      const events = analytics.getRecentEngagement(10);
      expect(events.length).toBeLessThanOrEqual(10);
      expect(events.length).toBeGreaterThan(0);
    });

    it("should have valid event types", () => {
      const events = analytics.getRecentEngagement(50);
      const validTypes = ['tune_in', 'tune_out', 'skip', 'like', 'share', 'save'];
      for (const event of events) {
        expect(validTypes).toContain(event.type);
        expect(event.id).toBeTruthy();
        expect(event.channelId).toBeTruthy();
        expect(event.timestamp).toBeGreaterThan(0);
      }
    });

    it("should record new engagement events", () => {
      const newEvent = analytics.recordEvent({
        type: 'tune_in',
        channelId: 'ch-001',
        contentTitle: 'Test Content',
      });
      expect(newEvent).toBeDefined();
      expect(newEvent.id).toBeTruthy();
      expect(newEvent.type).toBe('tune_in');
      expect(newEvent.channelId).toBe('ch-001');
      expect(newEvent.timestamp).toBeGreaterThan(0);
      // Verify it appears in recent events
      const recent = analytics.getRecentEngagement(5);
      expect(recent[0].id).toBe(newEvent.id);
    });

    it("should return engagement breakdown by channel", () => {
      const breakdown = analytics.getEngagementByChannel('ch-001');
      expect(breakdown.length).toBeGreaterThan(0);
      for (const item of breakdown) {
        expect(item.type).toBeTruthy();
        expect(item.count).toBeGreaterThan(0);
      }
    });
  });
});

describe("Content Scheduler - Drag & Drop Features", () => {
  let scheduler: ReturnType<typeof getContentScheduler>;

  beforeAll(() => {
    scheduler = getContentScheduler();
  });

  it("should move a slot to a new time", () => {
    const result = scheduler.moveSlot('slot-001', '07:00', '10:00');
    expect(result).toBeDefined();
    expect(result!.startTime).toBe('07:00');
    expect(result!.endTime).toBe('10:00');
    expect(result!.id).toBe('slot-001');
  });

  it("should move a slot to a new channel", () => {
    const result = scheduler.moveSlot('slot-002', '09:00', '12:00', 'ch-002');
    expect(result).toBeDefined();
    expect(result!.channelId).toBe('ch-002');
  });

  it("should return null for non-existent slot move", () => {
    const result = scheduler.moveSlot('nonexistent', '09:00', '12:00');
    expect(result).toBeNull();
  });

  it("should reorder slots by priority", () => {
    const slotIds = ['slot-005', 'slot-006', 'slot-007'];
    const result = scheduler.reorderSlots(slotIds);
    expect(result).toHaveLength(3);
    // First slot should have highest priority
    expect(result[0].priority).toBeGreaterThanOrEqual(result[1].priority);
    expect(result[1].priority).toBeGreaterThanOrEqual(result[2].priority);
  });
});
