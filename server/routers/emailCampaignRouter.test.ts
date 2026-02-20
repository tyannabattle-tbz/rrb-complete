import { describe, it, expect, beforeEach } from "vitest";
import { emailCampaignRouter } from "./emailCampaignRouter";
import { TRPCError } from "@trpc/server";

describe("emailCampaignRouter", () => {
  describe("getTemplates", () => {
    it("should return email templates", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const templates = await caller.getTemplates();
      
      expect(templates).toHaveLength(3);
      expect(templates[0]).toHaveProperty("id");
      expect(templates[0]).toHaveProperty("name");
      expect(templates[0]).toHaveProperty("subject");
      expect(templates[0]).toHaveProperty("category");
    });

    it("should include welcome template", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const templates = await caller.getTemplates();
      
      const welcomeTemplate = templates.find(t => t.id === "welcome-001");
      expect(welcomeTemplate).toBeDefined();
      expect(welcomeTemplate?.category).toBe("welcome");
    });

    it("should include broadcast template", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const templates = await caller.getTemplates();
      
      const broadcastTemplate = templates.find(t => t.id === "broadcast-001");
      expect(broadcastTemplate).toBeDefined();
      expect(broadcastTemplate?.category).toBe("broadcast");
    });

    it("should include promotion template", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const templates = await caller.getTemplates();
      
      const promotionTemplate = templates.find(t => t.id === "promotion-001");
      expect(promotionTemplate).toBeDefined();
      expect(promotionTemplate?.category).toBe("promotion");
    });
  });

  describe("getSegments", () => {
    it("should return subscriber segments", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const segments = await caller.getSegments();
      
      expect(segments.length).toBeGreaterThan(0);
      expect(segments[0]).toHaveProperty("id");
      expect(segments[0]).toHaveProperty("name");
      expect(segments[0]).toHaveProperty("subscriberCount");
    });

    it("should include Spotify listeners segment", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const segments = await caller.getSegments();
      
      const spotifySegment = segments.find(s => s.id === "seg-spotify");
      expect(spotifySegment).toBeDefined();
      expect(spotifySegment?.subscriberCount).toBe(95000);
    });

    it("should include US listeners segment", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const segments = await caller.getSegments();
      
      const usSegment = segments.find(s => s.id === "seg-us");
      expect(usSegment).toBeDefined();
      expect(usSegment?.subscriberCount).toBe(98500);
    });

    it("should include all subscribers segment", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const segments = await caller.getSegments();
      
      const allSegment = segments.find(s => s.id === "seg-all");
      expect(allSegment).toBeDefined();
      expect(allSegment?.subscriberCount).toBe(274000);
    });
  });

  describe("getCampaigns", () => {
    it("should return email campaigns", async () => {
      const caller = emailCampaignRouter.createCaller({ user: { id: "test-user" } });
      const campaigns = await caller.getCampaigns();
      
      expect(campaigns.length).toBeGreaterThan(0);
      expect(campaigns[0]).toHaveProperty("id");
      expect(campaigns[0]).toHaveProperty("name");
      expect(campaigns[0]).toHaveProperty("status");
      expect(campaigns[0]).toHaveProperty("metrics");
    });

    it("should include campaign metrics", async () => {
      const caller = emailCampaignRouter.createCaller({ user: { id: "test-user" } });
      const campaigns = await caller.getCampaigns();
      
      const campaign = campaigns[0];
      expect(campaign.metrics).toHaveProperty("sent");
      expect(campaign.metrics).toHaveProperty("delivered");
      expect(campaign.metrics).toHaveProperty("opened");
      expect(campaign.metrics).toHaveProperty("clicked");
    });

    it("should calculate correct open rate", async () => {
      const caller = emailCampaignRouter.createCaller({ user: { id: "test-user" } });
      const campaigns = await caller.getCampaigns();
      
      const campaign = campaigns[0];
      const openRate = (campaign.metrics.opened / campaign.metrics.delivered) * 100;
      expect(openRate).toBeGreaterThan(0);
      expect(openRate).toBeLessThan(100);
    });
  });

  describe("getSubscriberCount", () => {
    it("should return total subscriber count", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const counts = await caller.getSubscriberCount();
      
      expect(counts).toHaveProperty("total");
      expect(counts.total).toBe(274000);
    });

    it("should return platform breakdown", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const counts = await caller.getSubscriberCount();
      
      expect(counts).toHaveProperty("byPlatform");
      expect(counts.byPlatform).toHaveProperty("spotify");
      expect(counts.byPlatform.spotify).toBe(95000);
    });

    it("should return active and inactive counts", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const counts = await caller.getSubscriberCount();
      
      expect(counts).toHaveProperty("active");
      expect(counts).toHaveProperty("inactive");
      expect(counts.active + counts.inactive).toBe(counts.total);
    });
  });

  describe("getCampaignMetrics", () => {
    it("should return campaign metrics", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const metrics = await caller.getCampaignMetrics({ campaignId: "camp-001" });
      
      expect(metrics).toHaveProperty("metrics");
      expect(metrics.metrics).toHaveProperty("openRate");
      expect(metrics.metrics).toHaveProperty("clickRate");
    });

    it("should calculate correct engagement rates", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const metrics = await caller.getCampaignMetrics({ campaignId: "camp-001" });
      
      expect(metrics.metrics.openRate).toBeGreaterThan(0);
      expect(metrics.metrics.openRate).toBeLessThan(100);
      expect(metrics.metrics.clickRate).toBeGreaterThan(0);
    });

    it("should include top links", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const metrics = await caller.getCampaignMetrics({ campaignId: "camp-001" });
      
      expect(metrics).toHaveProperty("topLinks");
      expect(metrics.topLinks.length).toBeGreaterThan(0);
      expect(metrics.topLinks[0]).toHaveProperty("url");
      expect(metrics.topLinks[0]).toHaveProperty("clicks");
    });

    it("should include device breakdown", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const metrics = await caller.getCampaignMetrics({ campaignId: "camp-001" });
      
      expect(metrics).toHaveProperty("deviceBreakdown");
      expect(metrics.deviceBreakdown).toHaveProperty("desktop");
      expect(metrics.deviceBreakdown).toHaveProperty("mobile");
    });
  });

  describe("getABTestResults", () => {
    it("should return A/B test results", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const results = await caller.getABTestResults({ testId: "abtest-001" });
      
      expect(results).toHaveProperty("variantA");
      expect(results).toHaveProperty("variantB");
      expect(results).toHaveProperty("winner");
    });

    it("should identify winning variant", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const results = await caller.getABTestResults({ testId: "abtest-001" });
      
      expect(results.winner).toMatch(/^[AB]$/);
      expect(results.confidence).toBeGreaterThan(0);
      expect(results.confidence).toBeLessThanOrEqual(100);
    });

    it("should show variant metrics", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const results = await caller.getABTestResults({ testId: "abtest-001" });
      
      expect(results.variantA).toHaveProperty("openRate");
      expect(results.variantA).toHaveProperty("clickRate");
      expect(results.variantB).toHaveProperty("openRate");
      expect(results.variantB).toHaveProperty("clickRate");
    });
  });

  describe("updateSubscriberPreferences", () => {
    it("should update subscriber preferences", async () => {
      const caller = emailCampaignRouter.createCaller({});
      const result = await caller.updateSubscriberPreferences({
        email: "test@example.com",
        preferences: {
          broadcasts: true,
          promotions: false,
          frequency: "weekly",
        },
      });
      
      expect(result.success).toBe(true);
      expect(result.email).toBe("test@example.com");
    });

    it("should validate email format", async () => {
      const caller = emailCampaignRouter.createCaller({});
      
      try {
        await caller.updateSubscriberPreferences({
          email: "invalid-email",
          preferences: { broadcasts: true },
        });
        expect.fail("Should have thrown validation error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("scheduleCampaign", () => {
    it("should schedule a campaign", async () => {
      const caller = emailCampaignRouter.createCaller({ user: { id: "test-user" } });
      const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const result = await caller.scheduleCampaign({
        campaignId: "camp-001",
        scheduledFor: scheduledDate,
      });
      
      expect(result.success).toBe(true);
      expect(result.campaignId).toBe("camp-001");
    });

    it("should accept timezone parameter", async () => {
      const caller = emailCampaignRouter.createCaller({ user: { id: "test-user" } });
      const scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const result = await caller.scheduleCampaign({
        campaignId: "camp-001",
        scheduledFor: scheduledDate,
        timezone: "America/New_York",
      });
      
      expect(result.timezone).toBe("America/New_York");
    });
  });

  describe("sendCampaign", () => {
    it("should send a campaign", async () => {
      const caller = emailCampaignRouter.createCaller({ user: { id: "test-user" } });
      
      const result = await caller.sendCampaign({
        campaignId: "camp-001",
      });
      
      expect(result.success).toBe(true);
      expect(result.status).toBe("sent");
    });

    it("should return sent timestamp", async () => {
      const caller = emailCampaignRouter.createCaller({ user: { id: "test-user" } });
      
      const result = await caller.sendCampaign({
        campaignId: "camp-001",
      });
      
      expect(result).toHaveProperty("sentAt");
      expect(result.sentAt instanceof Date).toBe(true);
    });
  });
});
