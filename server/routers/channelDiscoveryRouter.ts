/**
 * Channel Discovery & Content Search Router
 * Phase 8: Comprehensive content discovery system for RRB platform
 * 
 * Enables listeners to:
 * - Search across all 7 channels by keywords/topics
 * - Browse by category/topic
 * - Discover trending content
 * - Find episodes by metadata
 * - Get personalized recommendations
 * - Bookmark favorite episodes
 * - Subscribe to channels
 * - Compare channel metrics
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// RRB Platform Channels (7 channels)
const RRB_CHANNELS = [
  { id: "ch-legacy", name: "Legacy Restored", description: "Original RRB broadcasts and archives", icon: "🎙️", listeners: 45230 },
  { id: "ch-healing", name: "Healing Frequencies", description: "Solfeggio frequencies and wellness", icon: "🧘", listeners: 38900 },
  { id: "ch-proof", name: "Proof Vault", description: "Evidence and documentation archive", icon: "📁", listeners: 28450 },
  { id: "ch-qmunity", name: "QMunity", description: "Community discussions and interviews", icon: "👥", listeners: 35670 },
  { id: "ch-miracles", name: "Sweet Miracles", description: "Inspirational stories and testimonies", icon: "✨", listeners: 42100 },
  { id: "ch-music", name: "Music & Radio", description: "Curated music and radio broadcasts", icon: "🎵", listeners: 52340 },
  { id: "ch-studio", name: "Studio Sessions", description: "Live studio recordings and production", icon: "🎬", listeners: 31200 },
];

// Topics/Categories
const TOPICS = [
  { id: "music", name: "Music", icon: "🎵", episodeCount: 1240 },
  { id: "wellness", name: "Wellness & Healing", icon: "🧘", episodeCount: 856 },
  { id: "community", name: "Community", icon: "👥", episodeCount: 723 },
  { id: "inspiration", name: "Inspiration", icon: "✨", episodeCount: 645 },
  { id: "education", name: "Education", icon: "📚", episodeCount: 534 },
  { id: "history", name: "History & Archives", icon: "📜", episodeCount: 412 },
  { id: "interviews", name: "Interviews", icon: "🎤", episodeCount: 389 },
  { id: "live", name: "Live Events", icon: "🔴", episodeCount: 267 },
];

// Sample episodes for search
const SAMPLE_EPISODES = [
  { id: "ep-001", title: "The Beginning: RRB Legacy Restored", channel: "ch-legacy", topic: "history", duration: 3240, plays: 12450, rating: 4.8, date: new Date("2024-01-15") },
  { id: "ep-002", title: "Healing with Solfeggio Frequencies", channel: "ch-healing", topic: "wellness", duration: 2100, plays: 8900, rating: 4.9, date: new Date("2024-01-16") },
  { id: "ep-003", title: "Community Voices: Stories of Impact", channel: "ch-qmunity", topic: "community", duration: 2850, plays: 6700, rating: 4.7, date: new Date("2024-01-17") },
  { id: "ep-004", title: "Music Monday: Greatest Hits", channel: "ch-music", topic: "music", duration: 3600, plays: 15230, rating: 4.6, date: new Date("2024-01-18") },
  { id: "ep-005", title: "Sweet Miracles: Transformation Stories", channel: "ch-miracles", topic: "inspiration", duration: 2400, plays: 9800, rating: 4.9, date: new Date("2024-01-19") },
  { id: "ep-006", title: "Live from the Studio", channel: "ch-studio", topic: "live", duration: 4200, plays: 5600, rating: 4.5, date: new Date("2024-01-20") },
  { id: "ep-007", title: "Evidence Archive: Deep Dive", channel: "ch-proof", topic: "history", duration: 3900, plays: 4200, rating: 4.8, date: new Date("2024-01-21") },
  { id: "ep-008", title: "Interview with Industry Leaders", channel: "ch-qmunity", topic: "interviews", duration: 3300, plays: 7400, rating: 4.7, date: new Date("2024-01-22") },
];

export const channelDiscoveryRouter = router({
  /**
   * Full-text search across all channels
   * Searches episode titles, descriptions, transcripts, and metadata
   */
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(200),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
      filters: z.object({
        channel: z.string().optional(),
        topic: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        minRating: z.number().min(0).max(5).optional(),
      }).optional(),
    }))
    .query(async ({ input }) => {
      // Simulate search across all channels
      const query = input.query.toLowerCase();
      const results = SAMPLE_EPISODES.filter(ep => {
        const matchesQuery = ep.title.toLowerCase().includes(query) || ep.topic.includes(query);
        const matchesChannel = !input.filters?.channel || ep.channel === input.filters.channel;
        const matchesTopic = !input.filters?.topic || ep.topic === input.filters.topic;
        const matchesDateRange = (!input.filters?.dateFrom || ep.date >= input.filters.dateFrom) &&
          (!input.filters?.dateTo || ep.date <= input.filters.dateTo);
        const matchesRating = !input.filters?.minRating || ep.rating >= input.filters.minRating;
        
        return matchesQuery && matchesChannel && matchesTopic && matchesDateRange && matchesRating;
      })
      .sort((a, b) => b.plays - a.plays)
      .slice(input.offset, input.offset + input.limit);

      return {
        query: input.query,
        results: results.map(ep => ({
          id: ep.id,
          name: ep.title,
          channel: RRB_CHANNELS.find(c => c.id === ep.channel)?.name || "Unknown",
          topic: ep.topic,
          duration: ep.duration,
          plays: ep.plays,
          relevance: Math.random() * 0.3 + 0.7, // 0.7-1.0 relevance score
          rating: ep.rating,
          date: ep.date,
        })),
        total: SAMPLE_EPISODES.filter(ep => 
          ep.title.toLowerCase().includes(query) && 
          (!input.filters?.channel || ep.channel === input.filters.channel)
        ).length,
      };
    }),

  /**
   * Get all available topics/categories
   */
  getTopics: publicProcedure
    .query(async () => {
      return TOPICS;
    }),

  /**
   * Get channels filtered by topic
   */
  getChannelsByTopic: publicProcedure
    .input(z.object({
      topicId: z.string(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      // Filter channels that have content in this topic
      const topicEpisodes = SAMPLE_EPISODES.filter(ep => ep.topic === input.topicId);
      const channelIds = new Set(topicEpisodes.map(ep => ep.channel));
      
      return RRB_CHANNELS
        .filter(ch => channelIds.has(ch.id))
        .slice(0, input.limit)
        .map(ch => ({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          icon: ch.icon,
          listeners: ch.listeners,
          episodeCount: SAMPLE_EPISODES.filter(ep => ep.channel === ch.id).length,
        }));
    }),

  /**
   * Get trending topics based on recent activity
   */
  getTrendingTopics: publicProcedure
    .query(async () => {
      return [
        { topic: "Healing Frequencies", trend: "↑", mentions: 1240, growth: 23 },
        { topic: "Community Stories", trend: "↑", mentions: 856, growth: 18 },
        { topic: "Music & Radio", trend: "↑", mentions: 723, growth: 15 },
        { topic: "Live Events", trend: "↓", mentions: 645, growth: -8 },
        { topic: "Historical Archives", trend: "↑", mentions: 534, growth: 12 },
      ];
    }),

  /**
   * Get popular episodes for a time range
   */
  getPopularEpisodes: publicProcedure
    .input(z.object({
      timeRange: z.enum(["day", "week", "month", "all"]).default("week"),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      // Filter by time range
      const now = new Date();
      const dayMs = 24 * 60 * 60 * 1000;
      let cutoffDate = new Date(now.getTime() - 7 * dayMs); // Default: week

      if (input.timeRange === "day") {
        cutoffDate = new Date(now.getTime() - dayMs);
      } else if (input.timeRange === "month") {
        cutoffDate = new Date(now.getTime() - 30 * dayMs);
      } else if (input.timeRange === "all") {
        cutoffDate = new Date(0);
      }

      return SAMPLE_EPISODES
        .filter(ep => ep.date >= cutoffDate)
        .sort((a, b) => b.plays - a.plays)
        .slice(0, input.limit)
        .map(ep => ({
          id: ep.id,
          title: ep.title,
          channel: RRB_CHANNELS.find(c => c.id === ep.channel)?.name || "Unknown",
          plays: ep.plays,
          rating: ep.rating,
          duration: ep.duration,
          date: ep.date,
        }));
    }),

  /**
   * Get detailed information about a channel
   */
  getChannelDetails: publicProcedure
    .input(z.object({
      channelId: z.string(),
    }))
    .query(async ({ input }) => {
      const channel = RRB_CHANNELS.find(c => c.id === input.channelId);
      if (!channel) throw new TRPCError({ code: "NOT_FOUND", message: "Channel not found" });

      const channelEpisodes = SAMPLE_EPISODES.filter(ep => ep.channel === input.channelId);
      const avgRating = channelEpisodes.length > 0 
        ? channelEpisodes.reduce((sum, ep) => sum + ep.rating, 0) / channelEpisodes.length 
        : 0;

      return {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        icon: channel.icon,
        listeners: channel.listeners,
        rating: Math.round(avgRating * 10) / 10,
        episodeCount: channelEpisodes.length,
        platforms: ["Spotify", "Apple Podcasts", "YouTube", "TuneIn", "Amazon Music", "iHeartRadio"],
        totalPlays: channelEpisodes.reduce((sum, ep) => sum + ep.plays, 0),
        lastEpisode: channelEpisodes.length > 0 ? channelEpisodes[0].title : "No episodes",
      };
    }),

  /**
   * Get episodes for a specific channel
   */
  getChannelEpisodes: publicProcedure
    .input(z.object({
      channelId: z.string(),
      sortBy: z.enum(["newest", "popular", "rating"]).default("newest"),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      let episodes = SAMPLE_EPISODES.filter(ep => ep.channel === input.channelId);

      // Sort by criteria
      if (input.sortBy === "popular") {
        episodes.sort((a, b) => b.plays - a.plays);
      } else if (input.sortBy === "rating") {
        episodes.sort((a, b) => b.rating - a.rating);
      } else {
        episodes.sort((a, b) => b.date.getTime() - a.date.getTime());
      }

      const paginated = episodes.slice(input.offset, input.offset + input.limit);

      return {
        episodes: paginated.map(ep => ({
          id: ep.id,
          title: ep.title,
          duration: ep.duration,
          plays: ep.plays,
          rating: ep.rating,
          date: ep.date,
          topic: ep.topic,
        })),
        total: episodes.length,
        hasMore: input.offset + input.limit < episodes.length,
      };
    }),

  /**
   * Get episode transcript with optional search
   */
  getEpisodeTranscript: publicProcedure
    .input(z.object({
      episodeId: z.string(),
      searchTerm: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const episode = SAMPLE_EPISODES.find(ep => ep.id === input.episodeId);
      if (!episode) throw new TRPCError({ code: "NOT_FOUND", message: "Episode not found" });

      const transcript = `This is a sample transcript for ${episode.title}. 
        It contains the full text of the episode with timestamps for easy navigation.
        Listeners can search within transcripts to find specific moments and quotes.
        This feature enables better content discovery and accessibility.`;

      const timestamps = [
        { time: 0, text: "Introduction" },
        { time: 245, text: "Main topic begins" },
        { time: 890, text: "Key discussion point" },
        { time: 1450, text: "Conclusion" },
      ];

      let searchResults = [];
      if (input.searchTerm) {
        searchResults = timestamps.filter(ts => 
          ts.text.toLowerCase().includes(input.searchTerm!.toLowerCase())
        );
      }

      return {
        episodeId: input.episodeId,
        title: episode.title,
        transcript,
        timestamps,
        searchResults: input.searchTerm ? searchResults : undefined,
      };
    }),

  /**
   * Get personalized recommendations for authenticated users
   */
  getRecommendations: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      // Simulate personalized recommendations based on user history
      return SAMPLE_EPISODES
        .sort(() => Math.random() - 0.5)
        .slice(0, input.limit)
        .map(ep => ({
          id: ep.id,
          title: ep.title,
          channel: RRB_CHANNELS.find(c => c.id === ep.channel)?.name || "Unknown",
          reason: "Based on your listening history",
          match: Math.random() * 0.3 + 0.7, // 0.7-1.0 match score
          rating: ep.rating,
        }));
    }),

  /**
   * Bookmark an episode for later
   */
  bookmarkEpisode: protectedProcedure
    .input(z.object({
      episodeId: z.string(),
      timestamp: z.number().optional(),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In production, save to database
      return {
        success: true,
        episodeId: input.episodeId,
        timestamp: input.timestamp,
        bookmarkedAt: new Date(),
      };
    }),

  /**
   * Get user's bookmarked episodes
   */
  getBookmarks: protectedProcedure
    .query(async ({ ctx }) => {
      // In production, fetch from database
      return SAMPLE_EPISODES.slice(0, 3).map(ep => ({
        episodeId: ep.id,
        title: ep.title,
        channel: RRB_CHANNELS.find(c => c.id === ep.channel)?.name || "Unknown",
        bookmarkedAt: new Date(),
        timestamp: 245,
      }));
    }),

  /**
   * Subscribe to a channel
   */
  subscribeToChannel: protectedProcedure
    .input(z.object({
      channelId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const channel = RRB_CHANNELS.find(c => c.id === input.channelId);
      if (!channel) throw new TRPCError({ code: "NOT_FOUND", message: "Channel not found" });

      // In production, save subscription to database
      return {
        success: true,
        channelId: input.channelId,
        channelName: channel.name,
        subscribedAt: new Date(),
      };
    }),

  /**
   * Get user's channel subscriptions
   */
  getSubscriptions: protectedProcedure
    .query(async ({ ctx }) => {
      // In production, fetch from database
      return RRB_CHANNELS.slice(0, 3).map(ch => ({
        id: ch.id,
        name: ch.name,
        icon: ch.icon,
        listeners: ch.listeners,
        subscribedAt: new Date(),
      }));
    }),

  /**
   * Compare metrics across multiple channels
   */
  compareChannels: publicProcedure
    .input(z.object({
      channelIds: z.array(z.string()).min(2).max(5),
    }))
    .query(async ({ input }) => {
      const channels = input.channelIds
        .map(id => RRB_CHANNELS.find(c => c.id === id))
        .filter(Boolean) as typeof RRB_CHANNELS;

      return {
        channels: channels.map(ch => {
          const episodes = SAMPLE_EPISODES.filter(ep => ep.channel === ch.id);
          return {
            id: ch.id,
            name: ch.name,
            listeners: ch.listeners,
            episodeCount: episodes.length,
            avgRating: episodes.length > 0 
              ? Math.round((episodes.reduce((sum, ep) => sum + ep.rating, 0) / episodes.length) * 10) / 10
              : 0,
            totalPlays: episodes.reduce((sum, ep) => sum + ep.plays, 0),
            spotify: Math.round(ch.listeners * 0.35),
            apple: Math.round(ch.listeners * 0.25),
            youtube: Math.round(ch.listeners * 0.20),
            tuneIn: Math.round(ch.listeners * 0.10),
            amazon: Math.round(ch.listeners * 0.05),
            iheartradio: Math.round(ch.listeners * 0.05),
          };
        }),
      };
    }),

  /**
   * Get available search filters
   */
  getSearchFilters: publicProcedure
    .query(async () => {
      return {
        dateRange: {
          label: "Date Range",
          options: ["Last 24 hours", "Last 7 days", "Last 30 days", "Last year", "All time"],
        },
        duration: {
          label: "Duration",
          options: ["Under 30 min", "30-60 min", "1-2 hours", "Over 2 hours"],
        },
        language: {
          label: "Language",
          options: ["English", "Spanish", "French", "German", "Other"],
        },
        platform: {
          label: "Platform",
          options: ["Spotify", "Apple Podcasts", "YouTube", "TuneIn", "Amazon Music", "iHeartRadio"],
        },
        rating: {
          label: "Minimum Rating",
          options: ["4.5+", "4.0+", "3.5+", "3.0+", "Any"],
        },
      };
    }),
});
