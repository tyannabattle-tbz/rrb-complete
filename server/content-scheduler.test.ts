import { describe, it, expect } from "vitest";
import { getContentScheduler } from "./services/contentSchedulerService";

describe("Content Scheduler Service", () => {
  const scheduler = getContentScheduler();

  describe("Channels", () => {
    it("should have exactly 7 channels", () => {
      const channels = scheduler.getChannels();
      expect(channels).toHaveLength(7);
    });

    it("should include all required channel names", () => {
      const channels = scheduler.getChannels();
      const names = channels.map(ch => ch.name);
      expect(names).toContain("RRB Main Radio");
      expect(names).toContain("Blues Channel");
      expect(names).toContain("Jazz Channel");
      expect(names).toContain("Soul Channel");
      expect(names).toContain("Gospel Channel");
      expect(names).toContain("Funk Channel");
      expect(names).toContain("King Richard's 70s Rock");
    });

    it("should have unique channel IDs", () => {
      const channels = scheduler.getChannels();
      const ids = channels.map(ch => ch.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("each channel should have required fields", () => {
      const channels = scheduler.getChannels();
      for (const ch of channels) {
        expect(ch).toHaveProperty("id");
        expect(ch).toHaveProperty("name");
        expect(ch).toHaveProperty("type");
        expect(ch).toHaveProperty("status");
        expect(ch).toHaveProperty("currentContent");
        expect(ch).toHaveProperty("listeners");
        expect(typeof ch.listeners).toBe("number");
        expect(ch.listeners).toBeGreaterThan(0);
      }
    });

    it("all channels should be active", () => {
      const channels = scheduler.getChannels();
      for (const ch of channels) {
        expect(ch.status).toBe("active");
      }
    });
  });

  describe("Schedule", () => {
    it("should return a non-empty schedule", () => {
      const schedule = scheduler.getScheduleSlots();
      expect(schedule.length).toBeGreaterThan(0);
    });

    it("should have 62 schedule slots", () => {
      const schedule = scheduler.getScheduleSlots();
      expect(schedule).toHaveLength(62);
    });

    it("each slot should have required fields", () => {
      const schedule = scheduler.getScheduleSlots();
      for (const slot of schedule) {
        expect(slot).toHaveProperty("id");
        expect(slot).toHaveProperty("channelId");
        expect(slot).toHaveProperty("title");
        expect(slot).toHaveProperty("startTime");
        expect(slot).toHaveProperty("endTime");
        expect(slot).toHaveProperty("contentType");
        expect(slot).toHaveProperty("isActive");
      }
    });

    it("should cover all 7 channels", () => {
      const schedule = scheduler.getScheduleSlots();
      const channelIds = new Set(schedule.map(s => s.channelId));
      expect(channelIds.size).toBe(7);
    });
  });

  describe("Status", () => {
    it("should report scheduler status", () => {
      const status = scheduler.getStatus();
      // isRunning depends on whether start() was called; just check the field exists
      expect(typeof status.isRunning).toBe("boolean");
    });

    it("should report 7 active channels", () => {
      const status = scheduler.getStatus();
      expect(status.activeChannels).toBe(7);
    });

    it("should report 62 total slots", () => {
      const status = scheduler.getStatus();
      expect(status.totalSlots).toBe(62);
    });

    it("should report 90% autonomy level", () => {
      const status = scheduler.getStatus();
      expect(status.autonomyLevel).toBe(90);
    });

    it("should report non-negative uptime", () => {
      const status = scheduler.getStatus();
      expect(status.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Content Rotation", () => {
    it("should rotate content without errors", () => {
      expect(() => scheduler.rotateContent()).not.toThrow();
    });

    it("channels should have content after rotation", () => {
      scheduler.rotateContent();
      const channels = scheduler.getChannels();
      for (const ch of channels) {
        expect(ch.currentContent).toBeTruthy();
        expect(ch.currentContent.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Channel Lookup", () => {
    it("should find a channel by ID", () => {
      const channel = scheduler.getChannel("ch-001");
      expect(channel).toBeDefined();
      expect(channel?.name).toBe("RRB Main Radio");
    });

    it("should return undefined for unknown channel", () => {
      const channel = scheduler.getChannel("ch-999");
      expect(channel).toBeUndefined();
    });
  });

  describe("Total Listeners", () => {
    it("should return a positive total listener count", () => {
      const total = scheduler.getTotalListeners();
      expect(total).toBeGreaterThan(0);
    });
  });
});
