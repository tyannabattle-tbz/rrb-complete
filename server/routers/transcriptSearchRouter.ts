/**
 * Transcript Search Router
 * Advanced full-text search within episode transcripts with timestamp jumping
 * 
 * Features:
 * - Full-text search across all transcripts
 * - Keyword highlighting in results
 * - Timestamp-based navigation
 * - Context snippets around matches
 * - Search history tracking
 * - Popular search terms
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

// Mock transcript data structure
interface TranscriptSegment {
  id: string;
  timestamp: number; // seconds
  speaker: string;
  text: string;
  episodeId: string;
}

interface SearchResult {
  episodeId: string;
  episodeTitle: string;
  channel: string;
  matchCount: number;
  segments: Array<{
    timestamp: number;
    speaker: string;
    text: string;
    highlightedText: string;
    contextBefore: string;
    contextAfter: string;
  }>;
}

// Mock transcript database
const mockTranscripts: TranscriptSegment[] = [
  {
    id: "seg-1",
    timestamp: 0,
    speaker: "Host",
    text: "Welcome to Legacy Restored, where we preserve the music and stories that shaped our community.",
    episodeId: "ep-001",
  },
  {
    id: "seg-2",
    timestamp: 15,
    speaker: "Host",
    text: "Today we're discussing the impact of Seabrun Candy Hunter's contributions to music history.",
    episodeId: "ep-001",
  },
  {
    id: "seg-3",
    timestamp: 45,
    speaker: "Guest",
    text: "Seabrun's work was revolutionary. He understood that music could heal communities and preserve culture.",
    episodeId: "ep-001",
  },
  {
    id: "seg-4",
    timestamp: 120,
    speaker: "Host",
    text: "The healing frequencies we broadcast today are based on research into Solfeggio frequencies and their effects on human consciousness.",
    episodeId: "ep-002",
  },
  {
    id: "seg-5",
    timestamp: 180,
    speaker: "Expert",
    text: "Healing frequencies like 528 Hz and 432 Hz have been shown to promote relaxation and emotional balance.",
    episodeId: "ep-002",
  },
  {
    id: "seg-6",
    timestamp: 240,
    speaker: "Host",
    text: "The Proof Vault contains evidence of these frequencies' effectiveness in clinical settings.",
    episodeId: "ep-003",
  },
  {
    id: "seg-7",
    timestamp: 300,
    speaker: "Researcher",
    text: "Our studies show that consistent exposure to healing frequencies can improve sleep quality and reduce anxiety.",
    episodeId: "ep-003",
  },
];

// Mock episodes mapping
const mockEpisodes = {
  "ep-001": {
    title: "Legacy Restored: Seabrun Candy Hunter's Impact",
    channel: "Legacy Restored",
    duration: 3600,
  },
  "ep-002": {
    title: "The Science of Healing Frequencies",
    channel: "Healing Frequencies",
    duration: 2400,
  },
  "ep-003": {
    title: "Evidence-Based Frequency Research",
    channel: "Proof Vault",
    duration: 1800,
  },
};

const highlightKeyword = (text: string, keyword: string): string => {
  const regex = new RegExp(`(${keyword})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
};

const getContextSnippet = (text: string, keyword: string, contextLength: number = 50): { before: string; after: string } => {
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerText.indexOf(lowerKeyword);

  if (index === -1) {
    return { before: "", after: "" };
  }

  const before = text.substring(Math.max(0, index - contextLength), index);
  const after = text.substring(index + keyword.length, Math.min(text.length, index + keyword.length + contextLength));

  return { before, after };
};

export const transcriptSearchRouter = router({
  /**
   * Search transcripts by keyword
   * Returns matching segments with context and timestamps
   */
  searchTranscripts: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        limit: z.number().min(1).max(100).default(20),
        episodeId: z.string().optional(),
        channel: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { query, limit, episodeId, channel } = input;
      const results: SearchResult[] = [];
      const matchedEpisodes = new Set<string>();

      // Filter transcripts based on search criteria
      let filteredTranscripts = mockTranscripts;
      if (episodeId) {
        filteredTranscripts = filteredTranscripts.filter((t) => t.episodeId === episodeId);
      }

      // Search for keyword matches
      const lowerQuery = query.toLowerCase();
      const matchedSegments = filteredTranscripts.filter((segment) =>
        segment.text.toLowerCase().includes(lowerQuery)
      );

      // Group by episode
      const groupedByEpisode = new Map<string, typeof matchedSegments>();
      matchedSegments.forEach((segment) => {
        if (!groupedByEpisode.has(segment.episodeId)) {
          groupedByEpisode.set(segment.episodeId, []);
        }
        groupedByEpisode.get(segment.episodeId)!.push(segment);
      });

      // Build results
      groupedByEpisode.forEach((segments, epId) => {
        const episodeInfo = mockEpisodes[epId as keyof typeof mockEpisodes];
        if (!episodeInfo) return;

        if (channel && episodeInfo.channel !== channel) return;

        const processedSegments = segments.slice(0, limit).map((segment) => {
          const context = getContextSnippet(segment.text, query);
          return {
            timestamp: segment.timestamp,
            speaker: segment.speaker,
            text: segment.text,
            highlightedText: highlightKeyword(segment.text, query),
            contextBefore: context.before,
            contextAfter: context.after,
          };
        });

        results.push({
          episodeId: epId,
          episodeTitle: episodeInfo.title,
          channel: episodeInfo.channel,
          matchCount: segments.length,
          segments: processedSegments,
        });
      });

      return {
        query,
        total: matchedSegments.length,
        results: results.slice(0, limit),
        timestamp: new Date(),
      };
    }),

  /**
   * Get transcript for a specific episode
   */
  getEpisodeTranscript: publicProcedure
    .input(
      z.object({
        episodeId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { episodeId } = input;
      const segments = mockTranscripts.filter((t) => t.episodeId === episodeId);
      const episodeInfo = mockEpisodes[episodeId as keyof typeof mockEpisodes];

      if (!episodeInfo) {
        return null;
      }

      return {
        episodeId,
        title: episodeInfo.title,
        channel: episodeInfo.channel,
        duration: episodeInfo.duration,
        segments: segments.map((seg) => ({
          id: seg.id,
          timestamp: seg.timestamp,
          speaker: seg.speaker,
          text: seg.text,
          formattedTime: `${Math.floor(seg.timestamp / 60)}:${String(seg.timestamp % 60).padStart(2, "0")}`,
        })),
      };
    }),

  /**
   * Get segment at specific timestamp
   */
  getSegmentAtTimestamp: publicProcedure
    .input(
      z.object({
        episodeId: z.string(),
        timestamp: z.number().min(0),
      })
    )
    .query(async ({ input }) => {
      const { episodeId, timestamp } = input;
      const segments = mockTranscripts.filter((t) => t.episodeId === episodeId);

      // Find segment closest to timestamp
      let closestSegment = segments[0];
      let minDiff = Math.abs(closestSegment.timestamp - timestamp);

      segments.forEach((seg) => {
        const diff = Math.abs(seg.timestamp - timestamp);
        if (diff < minDiff) {
          minDiff = diff;
          closestSegment = seg;
        }
      });

      return closestSegment || null;
    }),

  /**
   * Get search suggestions based on popular terms
   */
  getSearchSuggestions: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ input }) => {
      const { query, limit } = input;

      // Mock popular search terms
      const popularTerms = [
        "healing frequencies",
        "Seabrun Candy Hunter",
        "music preservation",
        "community impact",
        "legacy restored",
        "frequency research",
        "evidence based",
        "audio quality",
        "broadcast technology",
        "cultural preservation",
      ];

      if (!query) {
        return popularTerms.slice(0, limit);
      }

      const lowerQuery = query.toLowerCase();
      const suggestions = popularTerms.filter((term) => term.toLowerCase().includes(lowerQuery)).slice(0, limit);

      return suggestions;
    }),

  /**
   * Track search history (protected)
   */
  addSearchHistory: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        resultsCount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // In production, save to database
      console.log(`[Search History] User ${ctx.user.id}: "${input.query}" (${input.resultsCount} results)`);

      return {
        success: true,
        timestamp: new Date(),
      };
    }),

  /**
   * Get user's search history (protected)
   */
  getSearchHistory: protectedProcedure.query(async ({ ctx }) => {
    // In production, fetch from database
    return {
      userId: ctx.user.id,
      searches: [
        { query: "healing frequencies", count: 12, date: new Date(Date.now() - 86400000) },
        { query: "Seabrun Candy Hunter", count: 8, date: new Date(Date.now() - 172800000) },
        { query: "music preservation", count: 5, date: new Date(Date.now() - 259200000) },
      ],
    };
  }),

  /**
   * Get trending search terms
   */
  getTrendingSearches: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
        timeRange: z.enum(["day", "week", "month"]).default("week"),
      })
    )
    .query(async ({ input }) => {
      const { limit, timeRange } = input;

      // Mock trending data
      const trendingByRange = {
        day: [
          { term: "healing frequencies", searches: 342, growth: 15 },
          { term: "Seabrun legacy", searches: 289, growth: 12 },
          { term: "frequency research", searches: 156, growth: 8 },
        ],
        week: [
          { term: "healing frequencies", searches: 2341, growth: 23 },
          { term: "music preservation", searches: 1876, growth: 18 },
          { term: "community impact", searches: 1543, growth: 14 },
          { term: "broadcast technology", searches: 1234, growth: 11 },
        ],
        month: [
          { term: "Seabrun Candy Hunter", searches: 8934, growth: 34 },
          { term: "healing frequencies", searches: 7823, growth: 31 },
          { term: "music preservation", searches: 6543, growth: 28 },
          { term: "legacy restored", searches: 5432, growth: 24 },
        ],
      };

      return trendingByRange[timeRange].slice(0, limit);
    }),

  /**
   * Get advanced search filters
   */
  getSearchFilters: publicProcedure.query(async () => {
    return {
      channels: [
        { id: "legacy-restored", name: "Legacy Restored" },
        { id: "healing-frequencies", name: "Healing Frequencies" },
        { id: "proof-vault", name: "Proof Vault" },
        { id: "qmunity", name: "QMunity" },
        { id: "sweet-miracles", name: "Sweet Miracles" },
        { id: "music-radio", name: "Music & Radio" },
        { id: "studio-sessions", name: "Studio Sessions" },
      ],
      speakers: [
        { id: "host", name: "Host" },
        { id: "guest", name: "Guest" },
        { id: "expert", name: "Expert" },
        { id: "researcher", name: "Researcher" },
      ],
      dateRanges: [
        { id: "today", name: "Today" },
        { id: "week", name: "This Week" },
        { id: "month", name: "This Month" },
        { id: "all", name: "All Time" },
      ],
    };
  }),
});
