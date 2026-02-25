import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const searchRouter = router({
  searchVideos: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(200),
        style: z.string().optional(),
        minDuration: z.number().optional(),
        maxDuration: z.number().optional(),
        resolution: z.enum(["720p", "1080p", "4k"]).optional(),
        sortBy: z.enum(["relevance", "trending", "newest", "mostViewed"]).optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      // Mock search results - in production, integrate with Meilisearch or Algolia
      const mockVideos = [
        {
          id: "1",
          title: "Beautiful Sunset Cinematic",
          description: "A stunning cinematic video of a sunset",
          style: "cinematic",
          duration: 10,
          resolution: "1080p" as const,
          views: 1250,
          likes: 89,
          creatorId: "user1",
          creatorName: "Alex Creator",
          thumbnail: "/videos/thumb-1.jpg",
          url: "/videos/video-1.mp4",
          createdAt: new Date(),
        },
        {
          id: "2",
          title: "Abstract Motion Graphics",
          description: "Mesmerizing abstract motion graphics",
          style: "motion-graphics",
          duration: 15,
          resolution: "4k" as const,
          views: 2100,
          likes: 156,
          creatorId: "user2",
          creatorName: "Jordan Visuals",
          thumbnail: "/videos/thumb-2.jpg",
          url: "/videos/video-2.mp4",
          createdAt: new Date(),
        },
      ];

      // Filter based on query and criteria
      const filtered = mockVideos.filter((video) => {
        const matchesQuery =
          video.title.toLowerCase().includes(input.query.toLowerCase()) ||
          video.description.toLowerCase().includes(input.query.toLowerCase());

        const matchesStyle = !input.style || video.style === input.style;
        const matchesDuration =
          (!input.minDuration || video.duration >= input.minDuration) &&
          (!input.maxDuration || video.duration <= input.maxDuration);
        const matchesResolution = !input.resolution || video.resolution === input.resolution;

        return matchesQuery && matchesStyle && matchesDuration && matchesResolution;
      });

      // Sort results
      const sorted = filtered.sort((a, b) => {
        switch (input.sortBy) {
          case "trending":
            return b.views - a.views;
          case "newest":
            return b.createdAt.getTime() - a.createdAt.getTime();
          case "mostViewed":
            return b.views - a.views;
          case "relevance":
          default:
            return 0;
        }
      });

      return {
        results: sorted.slice(input.offset, input.offset + input.limit),
        total: sorted.length,
        hasMore: input.offset + input.limit < sorted.length,
      };
    }),

  getTrendingVideos: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        timeframe: z.enum(["day", "week", "month"]).default("week"),
      })
    )
    .query(async ({ input }) => {
      // Mock trending videos
      return {
        videos: [
          {
            id: "trending-1",
            title: "Top Trending Video",
            style: "cinematic",
            views: 50000,
            likes: 5000,
            creatorName: "Top Creator",
            thumbnail: "/videos/thumb-trending-1.jpg",
          },
        ],
        timeframe: input.timeframe,
      };
    }),

  getRecommendedVideos: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      // Mock recommended videos based on user preferences
      return {
        videos: [
          {
            id: "rec-1",
            title: "Recommended for You",
            style: "animated",
            views: 5000,
            likes: 450,
            creatorName: "Recommended Creator",
            thumbnail: "/videos/thumb-rec-1.jpg",
          },
        ],
      };
    }),
});
