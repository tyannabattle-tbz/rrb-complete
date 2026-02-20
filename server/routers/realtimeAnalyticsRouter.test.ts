import { describe, it, expect } from "vitest";
import { realtimeAnalyticsRouter } from "./realtimeAnalyticsRouter";

describe("realtimeAnalyticsRouter", () => {
  describe("getLiveMetrics", () => {
    it("should return real-time listener metrics from all platforms", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getLiveMetrics();

      expect(result).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.totalListeners).toBe(274000);
      expect(result.activeListeners).toBe(12450);
      expect(result.platformBreakdown).toHaveLength(6);
    });

    it("should include all major platforms", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getLiveMetrics();

      const platforms = result.platformBreakdown.map((p: any) => p.platform);
      expect(platforms).toContain("Spotify");
      expect(platforms).toContain("Apple Podcasts");
      expect(platforms).toContain("YouTube");
      expect(platforms).toContain("TuneIn");
      expect(platforms).toContain("Amazon Music");
      expect(platforms).toContain("iHeartRadio");
    });

    it("should have correct listener counts per platform", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getLiveMetrics();

      const spotify = result.platformBreakdown.find((p: any) => p.platform === "Spotify");
      expect(spotify?.listeners).toBe(95000);
      expect(spotify?.monthlyListeners).toBe(45000);
      expect(spotify?.followers).toBe(28500);

      const youtube = result.platformBreakdown.find((p: any) => p.platform === "YouTube");
      expect(youtube?.listeners).toBe(92000);
      expect(youtube?.views).toBe(285000);
      expect(youtube?.subscribers).toBe(31500);
    });

    it("should include growth trends", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getLiveMetrics();

      expect(result.trends).toBeDefined();
      expect(result.trends.hourlyGrowth).toBe(2.3);
      expect(result.trends.dailyGrowth).toBe(18.5);
      expect(result.trends.weeklyGrowth).toBe(45.2);
      expect(result.trends.monthlyGrowth).toBe(125.8);
    });
  });

  describe("getGeographicDistribution", () => {
    it("should return geographic distribution of listeners", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getGeographicDistribution();

      expect(result).toBeDefined();
      expect(result.totalCountries).toBe(127);
      expect(result.topCountries).toHaveLength(10);
    });

    it("should include top countries with listener counts", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getGeographicDistribution();

      const usa = result.topCountries.find((c: any) => c.country === "United States");
      expect(usa?.listeners).toBe(98500);
      expect(usa?.percentage).toBe(35.9);

      const uk = result.topCountries.find((c: any) => c.country === "United Kingdom");
      expect(uk?.listeners).toBe(34200);
      expect(uk?.percentage).toBe(12.5);
    });

    it("should include regional breakdown", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getGeographicDistribution();

      expect(result.regions).toBeDefined();
      expect(result.regions["North America"]).toBe(127400);
      expect(result.regions["Europe"]).toBe(68100);
      expect(result.regions["Asia Pacific"]).toBe(42500);
    });

    it("should include heatmap data with coordinates", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getGeographicDistribution();

      expect(result.heatmapData).toBeDefined();
      expect(result.heatmapData.length).toBeGreaterThan(0);

      const sanFrancisco = result.heatmapData.find((h: any) => h.city === "San Francisco");
      expect(sanFrancisco?.lat).toBe(37.7749);
      expect(sanFrancisco?.lng).toBe(-122.4194);
      expect(sanFrancisco?.intensity).toBe(8500);
    });
  });

  describe("getDemographics", () => {
    it("should return demographic breakdown of listeners", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getDemographics();

      expect(result).toBeDefined();
      expect(result.ageGroups).toBeDefined();
      expect(result.gender).toBeDefined();
      expect(result.interests).toBeDefined();
    });

    it("should include age group distribution", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getDemographics();

      expect(result.ageGroups["25-34"].percentage).toBe(35);
      expect(result.ageGroups["18-24"].percentage).toBe(22);
      expect(result.ageGroups["35-44"].percentage).toBe(20);
    });

    it("should include gender distribution", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getDemographics();

      expect(result.gender["Male"].percentage).toBe(58);
      expect(result.gender["Female"].percentage).toBe(40);
      expect(result.gender["Other"].percentage).toBe(2);
    });

    it("should include top interests", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getDemographics();

      const musicInterest = result.interests.find((i: any) => i.interest === "Music");
      expect(musicInterest?.percentage).toBe(92);
      expect(musicInterest?.listeners).toBe(252000);
    });

    it("should include device types", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getDemographics();

      expect(result.deviceTypes).toBeDefined();
      expect(result.deviceTypes["Mobile"].percentage).toBe(62);
      expect(result.deviceTypes["Desktop"].percentage).toBe(25);
    });

    it("should include listening times", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getDemographics();

      expect(result.listeningTimes).toBeDefined();
      expect(result.listeningTimes["Evening (6pm-12am)"].percentage).toBe(35);
      expect(result.listeningTimes["Evening (6pm-12am)"].peakHour).toBe("8pm");
    });
  });

  describe("getTopTracks", () => {
    it("should return top tracks with play counts", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getTopTracks();

      expect(result).toBeDefined();
      expect(result.topTracks).toHaveLength(5);
      expect(result.topTracks[0].rank).toBe(1);
      expect(result.topTracks[0].plays).toBe(156000);
    });

    it("should include track details", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getTopTracks();

      const topTrack = result.topTracks[0];
      expect(topTrack.title).toBe("Rockin' Rockin' Boogie - Original");
      expect(topTrack.artist).toBe("Seabrun Candy Hunter & Little Richard");
      expect(topTrack.saves).toBe(28500);
      expect(topTrack.shares).toBe(12300);
    });

    it("should include platform distribution", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getTopTracks();

      const topTrack = result.topTracks[0];
      expect(topTrack.platforms).toContain("Spotify");
      expect(topTrack.platforms).toContain("Apple");
      expect(topTrack.platforms).toContain("YouTube");
    });

    it("should include new releases", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getTopTracks();

      expect(result.newReleases).toBeDefined();
      expect(result.newReleases.length).toBeGreaterThan(0);
      expect(result.newReleases[0].plays).toBeGreaterThan(0);
    });
  });

  describe("getCommercialMetrics", () => {
    it("should return commercial performance metrics", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getCommercialMetrics();

      expect(result).toBeDefined();
      expect(result.totalCommercials).toBe(31);
      expect(result.activeCommercials).toBe(28);
      expect(result.totalImpressions).toBe(2450000);
      expect(result.clickThroughRate).toBe(6.4);
    });

    it("should include top commercials", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getCommercialMetrics();

      expect(result.topCommercials).toHaveLength(3);
      const topCommercial = result.topCommercials[0];
      expect(topCommercial.impressions).toBe(450000);
      expect(topCommercial.clicks).toBe(28500);
      expect(topCommercial.revenue).toBeGreaterThan(0);
    });

    it("should include performance by day of week", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getCommercialMetrics();

      expect(result.performanceByDayOfWeek).toBeDefined();
      expect(result.performanceByDayOfWeek["Monday"]).toBeDefined();
      expect(result.performanceByDayOfWeek["Friday"].impressions).toBe(395000);
    });
  });

  describe("getEngagementTrends", () => {
    it("should return listener engagement trends", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getEngagementTrends();

      expect(result).toBeDefined();
      expect(result.follows).toBeDefined();
      expect(result.subscribes).toBeDefined();
      expect(result.shares).toBeDefined();
      expect(result.saves).toBeDefined();
    });

    it("should include daily, weekly, and monthly metrics", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getEngagementTrends();

      expect(result.follows.daily).toBe(450);
      expect(result.follows.weekly).toBe(3200);
      expect(result.follows.monthly).toBe(12800);
    });

    it("should include retention metrics", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getEngagementTrends();

      expect(result.retention.dayOne).toBe(78.5);
      expect(result.retention.daySeven).toBe(52.1);
      expect(result.retention.dayThirty).toBe(38.9);
    });

    it("should include listener growth history", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getEngagementTrends();

      expect(result.listenerGrowth).toBeDefined();
      expect(result.listenerGrowth.length).toBeGreaterThan(0);
      expect(result.listenerGrowth[0].listeners).toBe(274000);
    });
  });

  describe("getTrendAnalysis", () => {
    it("should return trend analysis for daily period", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getTrendAnalysis({ period: "daily", days: 7 });

      expect(result).toBeDefined();
      expect(result.period).toBe("daily");
      expect(result.trends).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it("should include trend summary statistics", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getTrendAnalysis({ period: "weekly" });

      expect(result.summary.averageListeners).toBeGreaterThan(0);
      expect(result.summary.peakListeners).toBeGreaterThan(result.summary.averageListeners);
      expect(result.summary.totalPlays).toBeGreaterThan(0);
      expect(result.summary.growthRate).toBeGreaterThan(0);
    });

    it("should support different periods", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);

      const daily = await caller.getTrendAnalysis({ period: "daily" });
      expect(daily.period).toBe("daily");

      const weekly = await caller.getTrendAnalysis({ period: "weekly" });
      expect(weekly.period).toBe("weekly");

      const monthly = await caller.getTrendAnalysis({ period: "monthly" });
      expect(monthly.period).toBe("monthly");
    });
  });

  describe("exportReport", () => {
    it("should export report in CSV format", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({ user: { id: "test-user" } } as any);

      const result = await caller.exportReport({ format: "csv" });

      expect(result.success).toBe(true);
      expect(result.format).toBe("csv");
      expect(result.filename).toContain(".csv");
      expect(result.url).toBeDefined();
      expect(result.expiresIn).toBe("7 days");
    });

    it("should export report in PDF format", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({ user: { id: "test-user" } } as any);

      const result = await caller.exportReport({ format: "pdf" });

      expect(result.success).toBe(true);
      expect(result.format).toBe("pdf");
      expect(result.filename).toContain(".pdf");
    });

    it("should export report in JSON format", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({ user: { id: "test-user" } } as any);

      const result = await caller.exportReport({ format: "json" });

      expect(result.success).toBe(true);
      expect(result.format).toBe("json");
      expect(result.filename).toContain(".json");
    });

    it("should require authentication", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);

      try {
        await caller.exportReport({ format: "csv" });
        expect.fail("Should have thrown unauthorized error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("getPlatformComparison", () => {
    it("should return platform comparison data", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getPlatformComparison();

      expect(result).toBeDefined();
      expect(result.comparison).toHaveLength(6);
    });

    it("should include all platforms in comparison", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getPlatformComparison();

      const platforms = result.comparison.map((p: any) => p.platform);
      expect(platforms).toContain("Spotify");
      expect(platforms).toContain("YouTube");
      expect(platforms).toContain("Apple Podcasts");
      expect(platforms).toContain("TuneIn");
      expect(platforms).toContain("Amazon Music");
      expect(platforms).toContain("iHeartRadio");
    });

    it("should include platform strengths and challenges", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getPlatformComparison();

      const spotify = result.comparison.find((p: any) => p.platform === "Spotify");
      expect(spotify?.strengths).toBeDefined();
      expect(spotify?.strengths.length).toBeGreaterThan(0);
      expect(spotify?.challenges).toBeDefined();
      expect(spotify?.challenges.length).toBeGreaterThan(0);
    });

    it("should include recommendations", async () => {
      const caller = realtimeAnalyticsRouter.createCaller({} as any);
      const result = await caller.getPlatformComparison();

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});
