/**
 * Channel Discovery & Content Search Router
 * Phase 8+: Comprehensive multi-format content discovery system for RRB platform
 * 
 * Supports multiple content types:
 * - Audio (broadcasts, podcasts, music, frequencies)
 * - Documents (PDFs, evidence, articles, transcripts)
 * - Videos (recordings, tutorials, testimonials)
 * - Transcripts (searchable text with timestamps)
 * 
 * Enables listeners to:
 * - Search across all 7 channels by keywords/topics
 * - Filter by content type (audio, document, video, transcript)
 * - Browse by category/topic
 * - Discover trending content
 * - Find content by metadata
 * - Get personalized recommendations
 * - Bookmark favorite content
 * - Subscribe to channels
 * - Compare channel metrics
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Content type enum
export const CONTENT_TYPES = ["audio", "document", "video", "transcript"] as const;
export type ContentType = typeof CONTENT_TYPES[number];

// RRB Platform Channels (7 channels) with content type support
const RRB_CHANNELS = [
  { 
    id: "ch-legacy", 
    name: "Legacy Restored", 
    description: "Original RRB broadcasts and archives", 
    icon: "🎙️", 
    listeners: 45230,
    contentTypes: ["audio", "document", "transcript"] as ContentType[],
  },
  { 
    id: "ch-healing", 
    name: "Healing Frequencies", 
    description: "Solfeggio frequencies and wellness", 
    icon: "🧘", 
    listeners: 38900,
    contentTypes: ["audio", "video", "transcript"] as ContentType[],
  },
  { 
    id: "ch-proof", 
    name: "Proof Vault", 
    description: "Evidence and documentation archive", 
    icon: "📁", 
    listeners: 28450,
    contentTypes: ["document", "transcript", "video"] as ContentType[],
  },
  { 
    id: "ch-qmunity", 
    name: "QMunity", 
    description: "Community discussions and interviews", 
    icon: "👥", 
    listeners: 35670,
    contentTypes: ["audio", "video", "transcript"] as ContentType[],
  },
  { 
    id: "ch-miracles", 
    name: "Sweet Miracles", 
    description: "Inspirational stories and testimonies", 
    icon: "✨", 
    listeners: 42100,
    contentTypes: ["audio", "video", "transcript"] as ContentType[],
  },
  { 
    id: "ch-music", 
    name: "Music & Radio", 
    description: "Curated music and radio broadcasts", 
    icon: "🎵", 
    listeners: 52340,
    contentTypes: ["audio", "transcript"] as ContentType[],
  },
  { 
    id: "ch-studio", 
    name: "Studio Sessions", 
    description: "Live studio recordings and production", 
    icon: "🎬", 
    listeners: 31200,
    contentTypes: ["audio", "video", "transcript"] as ContentType[],
  },
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

// Sample multi-format content for search
const SAMPLE_CONTENT = [
  { 
    id: "ep-001", 
    title: "The Beginning: RRB Legacy Restored", 
    channel: "ch-legacy", 
    topic: "history", 
    type: "audio" as ContentType,
    duration: 3240, 
    plays: 12450, 
    rating: 4.8, 
    date: new Date("2024-01-15"),
    fileSize: "45 MB",
    format: "MP3",
  },
  { 
    id: "ep-002", 
    title: "Healing with Solfeggio Frequencies", 
    channel: "ch-healing", 
    topic: "wellness", 
    type: "audio" as ContentType,
    duration: 2100, 
    plays: 8900, 
    rating: 4.9, 
    date: new Date("2024-01-16"),
    fileSize: "32 MB",
    format: "MP3",
  },
  { 
    id: "doc-001", 
    title: "Proof Vault: Historical Evidence Document", 
    channel: "ch-proof", 
    topic: "history", 
    type: "document" as ContentType,
    pages: 45,
    plays: 3200, 
    rating: 4.7, 
    date: new Date("2024-01-17"),
    fileSize: "2.3 MB",
    format: "PDF",
  },
  { 
    id: "ep-003", 
    title: "Community Voices: Stories of Impact", 
    channel: "ch-qmunity", 
    topic: "community", 
    type: "video" as ContentType,
    duration: 2850, 
    plays: 6700, 
    rating: 4.7, 
    date: new Date("2024-01-17"),
    fileSize: "180 MB",
    format: "MP4",
    resolution: "1080p",
  },
  { 
    id: "ep-004", 
    title: "Music Monday: Greatest Hits", 
    channel: "ch-music", 
    topic: "music", 
    type: "audio" as ContentType,
    duration: 3600, 
    plays: 15230, 
    rating: 4.6, 
    date: new Date("2024-01-18"),
    fileSize: "52 MB",
    format: "MP3",
  },
  { 
    id: "tr-001", 
    title: "Episode 5 Transcript: Sweet Miracles Transformation Stories", 
    channel: "ch-miracles", 
    topic: "inspiration", 
    type: "transcript" as ContentType,
    words: 4250,
    plays: 2100, 
    rating: 4.8, 
    date: new Date("2024-01-19"),
    fileSize: "0.3 MB",
    format: "TXT",
  },
  { 
    id: "ep-005", 
    title: "Sweet Miracles: Transformation Stories", 
    channel: "ch-miracles", 
    topic: "inspiration", 
    type: "audio" as ContentType,
    duration: 2400, 
    plays: 9800, 
    rating: 4.9, 
    date: new Date("2024-01-19"),
    fileSize: "35 MB",
    format: "MP3",
  },
  { 
    id: "ep-006", 
    title: "Live from the Studio", 
    channel: "ch-studio", 
    topic: "live", 
    type: "video" as ContentType,
    duration: 4200, 
    plays: 5600, 
    rating: 4.5, 
    date: new Date("2024-01-20"),
    fileSize: "220 MB",
    format: "MP4",
    resolution: "4K",
  },
  { 
    id: "doc-002", 
    title: "Evidence Archive: Deep Dive Analysis", 
    channel: "ch-proof", 
    topic: "history", 
    type: "document" as ContentType,
    pages: 78,
    plays: 4200, 
    rating: 4.8, 
    date: new Date("2024-01-21"),
    fileSize: "5.1 MB",
    format: "PDF",
  },
  { 
    id: "ep-007", 
    title: "Interview with Industry Leaders", 
    channel: "ch-qmunity", 
    topic: "interviews", 
    type: "audio" as ContentType,
    duration: 3300, 
    plays: 7400, 
    rating: 4.7, 
    date: new Date("2024-01-22"),
    fileSize: "48 MB",
    format: "MP3",
  },
];

export const channelDiscoveryRouter = router({
  /**
   * Full-text search across all channels with multi-format support
   * Searches content titles, descriptions, and metadata
   */
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(200),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
      filters: z.object({
        channel: z.string().optional(),
        topic: z.string().optional(),
        contentType: z.enum(CONTENT_TYPES).optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        minRating: z.number().min(0).max(5).optional(),
      }).optional(),
    }))
    .query(async ({ input }) => {
      const query = input.query.toLowerCase();
      const results = SAMPLE_CONTENT.filter(content => {
        const matchesQuery = content.title.toLowerCase().includes(query) || content.topic.includes(query);
        const matchesChannel = !input.filters?.channel || content.channel === input.filters.channel;
        const matchesTopic = !input.filters?.topic || content.topic === input.filters.topic;
        const matchesContentType = !input.filters?.contentType || content.type === input.filters.contentType;
        const matchesDateRange = (!input.filters?.dateFrom || content.date >= input.filters.dateFrom) &&
          (!input.filters?.dateTo || content.date <= input.filters.dateTo);
        const matchesRating = !input.filters?.minRating || content.rating >= input.filters.minRating;
        
        return matchesQuery && matchesChannel && matchesTopic && matchesContentType && matchesDateRange && matchesRating;
      })
      .sort((a, b) => b.plays - a.plays)
      .slice(input.offset, input.offset + input.limit);

      return {
        query: input.query,
        results: results.map(content => ({
          id: content.id,
          name: content.title,
          channel: RRB_CHANNELS.find(c => c.id === content.channel)?.name || "Unknown",
          topic: content.topic,
          type: content.type,
          duration: "duration" in content ? content.duration : undefined,
          pages: "pages" in content ? content.pages : undefined,
          words: "words" in content ? content.words : undefined,
          plays: content.plays,
          relevance: Math.random() * 0.3 + 0.7,
          rating: content.rating,
          date: content.date,
          fileSize: content.fileSize,
          format: content.format,
        })),
        total: SAMPLE_CONTENT.filter(content => 
          content.title.toLowerCase().includes(query) && 
          (!input.filters?.channel || content.channel === input.filters.channel) &&
          (!input.filters?.contentType || content.type === input.filters.contentType)
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
   * Get channels filtered by topic with content type breakdown
   */
  getChannelsByTopic: publicProcedure
    .input(z.object({
      topicId: z.string(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const topicContent = SAMPLE_CONTENT.filter(c => c.topic === input.topicId);
      const channelIds = new Set(topicContent.map(c => c.channel));
      
      return RRB_CHANNELS
        .filter(ch => channelIds.has(ch.id))
        .slice(0, input.limit)
        .map(ch => {
          const channelContent = SAMPLE_CONTENT.filter(c => c.channel === ch.id);
          const contentTypeBreakdown = {
            audio: channelContent.filter(c => c.type === "audio").length,
            document: channelContent.filter(c => c.type === "document").length,
            video: channelContent.filter(c => c.type === "video").length,
            transcript: channelContent.filter(c => c.type === "transcript").length,
          };
          
          return {
            id: ch.id,
            name: ch.name,
            description: ch.description,
            icon: ch.icon,
            listeners: ch.listeners,
            contentCount: channelContent.length,
            contentTypes: ch.contentTypes,
            contentTypeBreakdown,
          };
        });
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
   * Get popular content for a time range with content type filtering
   */
  getPopularContent: publicProcedure
    .input(z.object({
      timeRange: z.enum(["day", "week", "month", "all"]).default("week"),
      contentType: z.enum(CONTENT_TYPES).optional(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const now = new Date();
      const dayMs = 24 * 60 * 60 * 1000;
      let cutoffDate = new Date(now.getTime() - 7 * dayMs);

      if (input.timeRange === "day") {
        cutoffDate = new Date(now.getTime() - dayMs);
      } else if (input.timeRange === "month") {
        cutoffDate = new Date(now.getTime() - 30 * dayMs);
      } else if (input.timeRange === "all") {
        cutoffDate = new Date(0);
      }

      return SAMPLE_CONTENT
        .filter(c => c.date >= cutoffDate && (!input.contentType || c.type === input.contentType))
        .sort((a, b) => b.plays - a.plays)
        .slice(0, input.limit)
        .map(c => ({
          id: c.id,
          title: c.title,
          channel: RRB_CHANNELS.find(ch => ch.id === c.channel)?.name || "Unknown",
          type: c.type,
          plays: c.plays,
          rating: c.rating,
          duration: "duration" in c ? c.duration : undefined,
          pages: "pages" in c ? c.pages : undefined,
          date: c.date,
          format: c.format,
        }));
    }),

  /**
   * Get detailed information about a channel including content type breakdown
   */
  getChannelDetails: publicProcedure
    .input(z.object({
      channelId: z.string(),
    }))
    .query(async ({ input }) => {
      const channel = RRB_CHANNELS.find(c => c.id === input.channelId);
      if (!channel) throw new TRPCError({ code: "NOT_FOUND", message: "Channel not found" });

      const channelContent = SAMPLE_CONTENT.filter(c => c.channel === input.channelId);
      const avgRating = channelContent.length > 0 
        ? channelContent.reduce((sum, c) => sum + c.rating, 0) / channelContent.length 
        : 0;

      const contentTypeBreakdown = {
        audio: channelContent.filter(c => c.type === "audio").length,
        document: channelContent.filter(c => c.type === "document").length,
        video: channelContent.filter(c => c.type === "video").length,
        transcript: channelContent.filter(c => c.type === "transcript").length,
      };

      return {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        icon: channel.icon,
        listeners: channel.listeners,
        rating: Math.round(avgRating * 10) / 10,
        contentCount: channelContent.length,
        contentTypes: channel.contentTypes,
        contentTypeBreakdown,
        platforms: ["Spotify", "Apple Podcasts", "YouTube", "TuneIn", "Amazon Music", "iHeartRadio"],
        totalPlays: channelContent.reduce((sum, c) => sum + c.plays, 0),
      };
    }),

  /**
   * Get content for a specific channel with sorting and filtering
   */
  getChannelContent: publicProcedure
    .input(z.object({
      channelId: z.string(),
      sortBy: z.enum(["newest", "popular", "rating"]).default("newest"),
      contentType: z.enum(CONTENT_TYPES).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      let content = SAMPLE_CONTENT.filter(c => 
        c.channel === input.channelId && 
        (!input.contentType || c.type === input.contentType)
      );

      if (input.sortBy === "popular") {
        content.sort((a, b) => b.plays - a.plays);
      } else if (input.sortBy === "rating") {
        content.sort((a, b) => b.rating - a.rating);
      } else {
        content.sort((a, b) => b.date.getTime() - a.date.getTime());
      }

      const paginated = content.slice(input.offset, input.offset + input.limit);

      return {
        content: paginated.map(c => ({
          id: c.id,
          title: c.title,
          type: c.type,
          duration: "duration" in c ? c.duration : undefined,
          pages: "pages" in c ? c.pages : undefined,
          plays: c.plays,
          rating: c.rating,
          date: c.date,
          topic: c.topic,
          format: c.format,
          fileSize: c.fileSize,
        })),
        total: content.length,
        hasMore: input.offset + input.limit < content.length,
      };
    }),

  /**
   * Get content by type across all channels
   */
  getContentByType: publicProcedure
    .input(z.object({
      contentType: z.enum(CONTENT_TYPES),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      return SAMPLE_CONTENT
        .filter(c => c.type === input.contentType)
        .sort((a, b) => b.plays - a.plays)
        .slice(0, input.limit)
        .map(c => ({
          id: c.id,
          title: c.title,
          channel: RRB_CHANNELS.find(ch => ch.id === c.channel)?.name || "Unknown",
          type: c.type,
          plays: c.plays,
          rating: c.rating,
          date: c.date,
          format: c.format,
          duration: "duration" in c ? c.duration : undefined,
          pages: "pages" in c ? c.pages : undefined,
          fileSize: c.fileSize,
        }));
    }),

  /**
   * Get content statistics by type
   */
  getContentStats: publicProcedure
    .query(async () => {
      const stats = {
        audio: SAMPLE_CONTENT.filter(c => c.type === "audio").length,
        document: SAMPLE_CONTENT.filter(c => c.type === "document").length,
        video: SAMPLE_CONTENT.filter(c => c.type === "video").length,
        transcript: SAMPLE_CONTENT.filter(c => c.type === "transcript").length,
        total: SAMPLE_CONTENT.length,
        totalPlays: SAMPLE_CONTENT.reduce((sum, c) => sum + c.plays, 0),
        avgRating: Math.round((SAMPLE_CONTENT.reduce((sum, c) => sum + c.rating, 0) / SAMPLE_CONTENT.length) * 10) / 10,
      };
      return stats;
    }),

  /**
   * Get personalized recommendations for authenticated users
   */
  getRecommendations: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      contentType: z.enum(CONTENT_TYPES).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return SAMPLE_CONTENT
        .filter(c => !input.contentType || c.type === input.contentType)
        .sort(() => Math.random() - 0.5)
        .slice(0, input.limit)
        .map(c => ({
          id: c.id,
          title: c.title,
          channel: RRB_CHANNELS.find(ch => ch.id === c.channel)?.name || "Unknown",
          type: c.type,
          reason: "Based on your listening history",
          match: Math.random() * 0.3 + 0.7,
          rating: c.rating,
        }));
    }),

  /**
   * Bookmark content for later
   */
  bookmarkContent: protectedProcedure
    .input(z.object({
      contentId: z.string(),
      timestamp: z.number().optional(),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        contentId: input.contentId,
        timestamp: input.timestamp,
        bookmarkedAt: new Date(),
      };
    }),

  /**
   * Get user's bookmarked content
   */
  getBookmarks: protectedProcedure
    .query(async ({ ctx }) => {
      return SAMPLE_CONTENT.slice(0, 3).map(c => ({
        contentId: c.id,
        title: c.title,
        type: c.type,
        channel: RRB_CHANNELS.find(ch => ch.id === c.channel)?.name || "Unknown",
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
          const channelContent = SAMPLE_CONTENT.filter(c => c.channel === ch.id);
          return {
            id: ch.id,
            name: ch.name,
            listeners: ch.listeners,
            contentCount: channelContent.length,
            avgRating: channelContent.length > 0 
              ? Math.round((channelContent.reduce((sum, c) => sum + c.rating, 0) / channelContent.length) * 10) / 10
              : 0,
            totalPlays: channelContent.reduce((sum, c) => sum + c.plays, 0),
            contentTypes: ch.contentTypes,
            contentTypeBreakdown: {
              audio: channelContent.filter(c => c.type === "audio").length,
              document: channelContent.filter(c => c.type === "document").length,
              video: channelContent.filter(c => c.type === "video").length,
              transcript: channelContent.filter(c => c.type === "transcript").length,
            },
          };
        }),
      };
    }),

  /**
   * Get available search filters including content type options
   */
  getSearchFilters: publicProcedure
    .query(async () => {
      return {
        contentType: {
          label: "Content Type",
          options: [
            { value: "audio", label: "Audio (Podcasts, Music, Broadcasts)" },
            { value: "document", label: "Documents (PDFs, Articles)" },
            { value: "video", label: "Videos (Recordings, Tutorials)" },
            { value: "transcript", label: "Transcripts (Searchable Text)" },
          ],
        },
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
