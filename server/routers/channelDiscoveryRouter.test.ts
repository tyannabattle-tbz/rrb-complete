/**
 * Channel Discovery Router Tests
 * Comprehensive test suite for Phase 8 content discovery system
 */

import { describe, it, expect, beforeEach } from "vitest";
import { channelDiscoveryRouter } from "./channelDiscoveryRouter";

describe("channelDiscoveryRouter", () => {
  let caller: any;

  beforeEach(() => {
    // Create caller without authentication for public procedures
    caller = channelDiscoveryRouter.createCaller({});
  });

  describe("search", () => {
    it("should search for episodes by keyword", async () => {
      const results = await caller.search({ query: "healing" });
      
      expect(results).toBeDefined();
      expect(results).toHaveProperty("results");
      expect(results).toHaveProperty("total");
      expect(results).toHaveProperty("query");
      expect(results.query).toBe("healing");
    });

    it("should return search results with metadata", async () => {
      const results = await caller.search({ query: "music" });
      
      expect(results.results.length).toBeGreaterThan(0);
      results.results.forEach(episode => {
        expect(episode).toHaveProperty("id");
        expect(episode).toHaveProperty("name");
        expect(episode).toHaveProperty("channel");
        expect(episode).toHaveProperty("relevance");
        expect(episode.relevance).toBeGreaterThan(0);
        expect(episode.relevance).toBeLessThanOrEqual(1);
      });
    });

    it("should respect limit parameter", async () => {
      const results = await caller.search({ query: "channel", limit: 5 });
      
      expect(results.results.length).toBeLessThanOrEqual(5);
    });

    it("should support pagination with offset", async () => {
      const page1 = await caller.search({ query: "channel", limit: 3, offset: 0 });
      const page2 = await caller.search({ query: "channel", limit: 3, offset: 3 });
      
      expect(page1.results.length).toBeLessThanOrEqual(3);
      expect(page2.results.length).toBeLessThanOrEqual(3);
    });

    it("should filter by channel", async () => {
      const results = await caller.search({
        query: "music",
        filters: { channel: "ch-music" },
      });
      
      results.results.forEach(episode => {
        expect(episode.channel).toBe("Music & Radio");
      });
    });

    it("should filter by topic", async () => {
      const results = await caller.search({
        query: "content",
        filters: { topic: "music" },
      });
      
      expect(results.results.length).toBeGreaterThanOrEqual(0);
    });

    it("should filter by minimum rating", async () => {
      const results = await caller.search({
        query: "episode",
        filters: { minRating: 4.5 },
      });
      
      results.results.forEach(episode => {
        expect(episode.rating).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe("getTopics", () => {
    it("should return all available topics", async () => {
      const topics = await caller.getTopics();
      
      expect(topics).toBeDefined();
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBeGreaterThan(0);
    });

    it("should include required topic fields", async () => {
      const topics = await caller.getTopics();
      
      topics.forEach(topic => {
        expect(topic).toHaveProperty("id");
        expect(topic).toHaveProperty("name");
        expect(topic).toHaveProperty("icon");
        expect(topic).toHaveProperty("episodeCount");
        expect(topic.episodeCount).toBeGreaterThan(0);
      });
    });

    it("should include music topic", async () => {
      const topics = await caller.getTopics();
      const musicTopic = topics.find(t => t.id === "music");
      
      expect(musicTopic).toBeDefined();
      expect(musicTopic?.name).toBe("Music");
    });

    it("should include wellness topic", async () => {
      const topics = await caller.getTopics();
      const wellnessTopic = topics.find(t => t.id === "wellness");
      
      expect(wellnessTopic).toBeDefined();
      expect(wellnessTopic?.name).toBe("Wellness & Healing");
    });
  });

  describe("getChannelsByTopic", () => {
    it("should return channels for a topic", async () => {
      const channels = await caller.getChannelsByTopic({ topicId: "music" });
      
      expect(channels).toBeDefined();
      expect(Array.isArray(channels)).toBe(true);
      expect(channels.length).toBeGreaterThan(0);
    });

    it("should include channel metadata", async () => {
      const channels = await caller.getChannelsByTopic({ topicId: "wellness" });
      
      channels.forEach(channel => {
        expect(channel).toHaveProperty("id");
        expect(channel).toHaveProperty("name");
        expect(channel).toHaveProperty("description");
        expect(channel).toHaveProperty("icon");
        expect(channel).toHaveProperty("listeners");
        expect(channel).toHaveProperty("episodeCount");
      });
    });

    it("should respect limit parameter", async () => {
      const channels = await caller.getChannelsByTopic({ topicId: "music", limit: 2 });
      
      expect(channels.length).toBeLessThanOrEqual(2);
    });

    it("should include listener counts", async () => {
      const channels = await caller.getChannelsByTopic({ topicId: "music" });
      
      channels.forEach(channel => {
        expect(channel.listeners).toBeGreaterThan(0);
      });
    });
  });

  describe("getTrendingTopics", () => {
    it("should return trending topics", async () => {
      const trending = await caller.getTrendingTopics();
      
      expect(trending).toBeDefined();
      expect(Array.isArray(trending)).toBe(true);
      expect(trending.length).toBeGreaterThan(0);
    });

    it("should include trend metadata", async () => {
      const trending = await caller.getTrendingTopics();
      
      trending.forEach(item => {
        expect(item).toHaveProperty("topic");
        expect(item).toHaveProperty("trend");
        expect(item).toHaveProperty("mentions");
        expect(item).toHaveProperty("growth");
        expect(["↑", "↓"]).toContain(item.trend);
      });
    });

    it("should show growth percentages", async () => {
      const trending = await caller.getTrendingTopics();
      
      trending.forEach(item => {
        expect(typeof item.growth).toBe("number");
      });
    });
  });

  describe("getPopularEpisodes", () => {
    it("should return popular episodes for week", async () => {
      const episodes = await caller.getPopularEpisodes({ timeRange: "week" });
      
      expect(episodes).toBeDefined();
      expect(Array.isArray(episodes)).toBe(true);
      expect(episodes.length).toBeGreaterThan(0);
    });

    it("should include episode metadata", async () => {
      const episodes = await caller.getPopularEpisodes({ timeRange: "week" });
      
      episodes.forEach(episode => {
        expect(episode).toHaveProperty("id");
        expect(episode).toHaveProperty("title");
        expect(episode).toHaveProperty("channel");
        expect(episode).toHaveProperty("plays");
        expect(episode).toHaveProperty("rating");
        expect(episode).toHaveProperty("duration");
      });
    });

    it("should include episode ratings", async () => {
      const episodes = await caller.getPopularEpisodes({ timeRange: "week" });
      
      episodes.forEach(episode => {
        expect(episode.rating).toBeGreaterThan(0);
        expect(episode.rating).toBeLessThanOrEqual(5);
      });
    });

    it("should support different time ranges", async () => {
      const dayEpisodes = await caller.getPopularEpisodes({ timeRange: "day" });
      const weekEpisodes = await caller.getPopularEpisodes({ timeRange: "week" });
      const monthEpisodes = await caller.getPopularEpisodes({ timeRange: "month" });
      const allEpisodes = await caller.getPopularEpisodes({ timeRange: "all" });
      
      expect(dayEpisodes.length).toBeGreaterThan(0);
      expect(weekEpisodes.length).toBeGreaterThan(0);
      expect(monthEpisodes.length).toBeGreaterThan(0);
      expect(allEpisodes.length).toBeGreaterThan(0);
    });

    it("should respect limit parameter", async () => {
      const episodes = await caller.getPopularEpisodes({ timeRange: "week", limit: 5 });
      
      expect(episodes.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getChannelDetails", () => {
    it("should return channel details", async () => {
      const details = await caller.getChannelDetails({ channelId: "ch-legacy" });
      
      expect(details).toBeDefined();
      expect(details).toHaveProperty("id");
      expect(details).toHaveProperty("name");
      expect(details).toHaveProperty("description");
      expect(details).toHaveProperty("listeners");
      expect(details).toHaveProperty("rating");
      expect(details).toHaveProperty("episodeCount");
    });

    it("should include platform availability", async () => {
      const details = await caller.getChannelDetails({ channelId: "ch-healing" });
      
      expect(details).toHaveProperty("platforms");
      expect(Array.isArray(details.platforms)).toBe(true);
      expect(details.platforms.length).toBeGreaterThan(0);
      expect(details.platforms).toContain("Spotify");
    });

    it("should include channel rating", async () => {
      const details = await caller.getChannelDetails({ channelId: "ch-legacy" });
      
      expect(details.rating).toBeGreaterThan(0);
      expect(details.rating).toBeLessThanOrEqual(5);
    });

    it("should throw error for non-existent channel", async () => {
      try {
        await caller.getChannelDetails({ channelId: "non-existent" });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("getChannelEpisodes", () => {
    it("should return channel episodes", async () => {
      const result = await caller.getChannelEpisodes({ channelId: "ch-legacy" });
      
      expect(result).toHaveProperty("episodes");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("hasMore");
      expect(Array.isArray(result.episodes)).toBe(true);
      expect(result.episodes.length).toBeGreaterThan(0);
    });

    it("should support sorting by newest", async () => {
      const result = await caller.getChannelEpisodes({ 
        channelId: "ch-legacy", 
        sortBy: "newest" 
      });
      
      expect(result.episodes.length).toBeGreaterThan(0);
    });

    it("should support sorting by popular", async () => {
      const result = await caller.getChannelEpisodes({ 
        channelId: "ch-legacy", 
        sortBy: "popular" 
      });
      
      expect(result.episodes.length).toBeGreaterThan(0);
    });

    it("should support sorting by rating", async () => {
      const result = await caller.getChannelEpisodes({ 
        channelId: "ch-legacy", 
        sortBy: "rating" 
      });
      
      expect(result.episodes.length).toBeGreaterThan(0);
    });

    it("should include episode metadata", async () => {
      const result = await caller.getChannelEpisodes({ channelId: "ch-legacy" });
      
      result.episodes.forEach(episode => {
        expect(episode).toHaveProperty("id");
        expect(episode).toHaveProperty("title");
        expect(episode).toHaveProperty("duration");
        expect(episode).toHaveProperty("plays");
        expect(episode).toHaveProperty("rating");
      });
    });

    it("should support pagination", async () => {
      const result1 = await caller.getChannelEpisodes({ 
        channelId: "ch-legacy", 
        limit: 2, 
        offset: 0 
      });
      const result2 = await caller.getChannelEpisodes({ 
        channelId: "ch-legacy", 
        limit: 2, 
        offset: 2 
      });
      
      expect(result1.episodes.length).toBeLessThanOrEqual(2);
      expect(result2.episodes.length).toBeLessThanOrEqual(2);
    });
  });

  describe("getEpisodeTranscript", () => {
    it("should return episode transcript", async () => {
      const transcript = await caller.getEpisodeTranscript({ episodeId: "ep-001" });
      
      expect(transcript).toHaveProperty("episodeId");
      expect(transcript).toHaveProperty("title");
      expect(transcript).toHaveProperty("transcript");
      expect(transcript).toHaveProperty("timestamps");
    });

    it("should include timestamps", async () => {
      const transcript = await caller.getEpisodeTranscript({ episodeId: "ep-001" });
      
      expect(Array.isArray(transcript.timestamps)).toBe(true);
      expect(transcript.timestamps.length).toBeGreaterThan(0);
      transcript.timestamps.forEach(ts => {
        expect(ts).toHaveProperty("time");
        expect(ts).toHaveProperty("text");
      });
    });

    it("should support transcript search", async () => {
      const transcript = await caller.getEpisodeTranscript({ 
        episodeId: "ep-001", 
        searchTerm: "healing" 
      });
      
      expect(transcript).toHaveProperty("searchResults");
    });

    it("should throw error for non-existent episode", async () => {
      try {
        await caller.getEpisodeTranscript({ episodeId: "non-existent" });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("getTrendingTopics", () => {
    it("should return trending topics with growth data", async () => {
      const trending = await caller.getTrendingTopics();
      
      expect(trending.length).toBeGreaterThan(0);
      trending.forEach(item => {
        expect(item).toHaveProperty("topic");
        expect(item).toHaveProperty("trend");
        expect(item).toHaveProperty("mentions");
        expect(item).toHaveProperty("growth");
      });
    });
  });

  describe("getSearchFilters", () => {
    it("should return available search filters", async () => {
      const filters = await caller.getSearchFilters();
      
      expect(filters).toHaveProperty("dateRange");
      expect(filters).toHaveProperty("duration");
      expect(filters).toHaveProperty("language");
      expect(filters).toHaveProperty("platform");
      expect(filters).toHaveProperty("rating");
    });

    it("should include filter options", async () => {
      const filters = await caller.getSearchFilters();
      
      expect(filters.dateRange).toHaveProperty("options");
      expect(filters.duration).toHaveProperty("options");
      expect(filters.language).toHaveProperty("options");
      expect(filters.platform).toHaveProperty("options");
      expect(filters.rating).toHaveProperty("options");
    });

    it("should include platform options", async () => {
      const filters = await caller.getSearchFilters();
      
      expect(filters.platform.options).toContain("Spotify");
      expect(filters.platform.options).toContain("Apple Podcasts");
      expect(filters.platform.options).toContain("YouTube");
    });
  });

  describe("compareChannels", () => {
    it("should compare multiple channels", async () => {
      const comparison = await caller.compareChannels({ 
        channelIds: ["ch-music", "ch-healing"] 
      });
      
      expect(comparison).toHaveProperty("channels");
      expect(comparison.channels.length).toBe(2);
    });

    it("should include platform metrics", async () => {
      const comparison = await caller.compareChannels({ 
        channelIds: ["ch-music", "ch-healing"] 
      });
      
      comparison.channels.forEach(channel => {
        expect(channel).toHaveProperty("spotify");
        expect(channel).toHaveProperty("apple");
        expect(channel).toHaveProperty("youtube");
        expect(channel).toHaveProperty("tuneIn");
        expect(channel).toHaveProperty("amazon");
        expect(channel).toHaveProperty("iheartradio");
      });
    });

    it("should include listener and rating data", async () => {
      const comparison = await caller.compareChannels({ 
        channelIds: ["ch-music", "ch-healing"] 
      });
      
      comparison.channels.forEach(channel => {
        expect(channel).toHaveProperty("listeners");
        expect(channel).toHaveProperty("avgRating");
        expect(channel).toHaveProperty("totalPlays");
      });
    });
  });

  describe("Protected procedures", () => {
    it("should require authentication for bookmarkEpisode", async () => {
      const unauthenticatedCaller = channelDiscoveryRouter.createCaller({});
      
      try {
        await unauthenticatedCaller.bookmarkEpisode({ episodeId: "ep-001" });
        expect.fail("Should have thrown unauthorized error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should require authentication for getRecommendations", async () => {
      const unauthenticatedCaller = channelDiscoveryRouter.createCaller({});
      
      try {
        await unauthenticatedCaller.getRecommendations({ limit: 5 });
        expect.fail("Should have thrown unauthorized error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should allow authenticated users to bookmark episodes", async () => {
      const authenticatedCaller = channelDiscoveryRouter.createCaller({ 
        user: { id: "test-user" } 
      });
      
      const result = await authenticatedCaller.bookmarkEpisode({ episodeId: "ep-001" });
      
      expect(result.success).toBe(true);
      expect(result.episodeId).toBe("ep-001");
    });

    it("should allow authenticated users to get recommendations", async () => {
      const authenticatedCaller = channelDiscoveryRouter.createCaller({ 
        user: { id: "test-user" } 
      });
      
      const recommendations = await authenticatedCaller.getRecommendations({ limit: 5 });
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});
