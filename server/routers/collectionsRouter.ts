import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const collectionsRouter = router({
  /**
   * Get all collections for the current user
   */
  getCollections: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Mock collections
      const mockCollections = [
        {
          id: "coll-1",
          name: "Cinematic Masterpieces",
          description: "My best cinematic videos",
          videoCount: 12,
          thumbnail: "",
          createdAt: new Date(Date.now() - 86400000 * 30),
          updatedAt: new Date(Date.now() - 86400000),
          isPublic: true,
          likes: 234,
        },
        {
          id: "coll-2",
          name: "Motion Graphics Experiments",
          description: "Testing new motion graphics techniques",
          videoCount: 8,
          thumbnail: "",
          createdAt: new Date(Date.now() - 86400000 * 20),
          updatedAt: new Date(Date.now() - 86400000 * 2),
          isPublic: false,
          likes: 0,
        },
        {
          id: "coll-3",
          name: "Watch Later",
          description: "Videos to watch later",
          videoCount: 24,
          thumbnail: "",
          createdAt: new Date(Date.now() - 86400000 * 60),
          updatedAt: new Date(Date.now() - 3600000),
          isPublic: false,
          likes: 0,
        },
      ];

      return {
        collections: mockCollections.slice(input.offset, input.offset + input.limit),
        total: mockCollections.length,
      };
    }),

  /**
   * Create a new collection
   */
  createCollection: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, create in database
      return {
        id: `coll-${Date.now()}`,
        name: input.name,
        description: input.description,
        videoCount: 0,
        isPublic: input.isPublic,
        createdAt: new Date(),
      };
    }),

  /**
   * Add video to collection
   */
  addVideoToCollection: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        videoId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, add to database
      return {
        success: true,
        collectionId: input.collectionId,
        videoId: input.videoId,
      };
    }),

  /**
   * Remove video from collection
   */
  removeVideoFromCollection: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        videoId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, remove from database
      return {
        success: true,
        collectionId: input.collectionId,
        videoId: input.videoId,
      };
    }),

  /**
   * Get videos in a collection
   */
  getCollectionVideos: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Mock videos in collection
      const mockVideos = [
        {
          videoId: "video-1",
          title: "Cinematic Sunset",
          duration: 45,
          thumbnail: "",
          addedAt: new Date(Date.now() - 86400000 * 5),
        },
        {
          videoId: "video-2",
          title: "Urban Exploration",
          duration: 60,
          thumbnail: "",
          addedAt: new Date(Date.now() - 86400000 * 10),
        },
      ];

      return {
        videos: mockVideos.slice(input.offset, input.offset + input.limit),
        total: mockVideos.length,
      };
    }),

  /**
   * Delete collection
   */
  deleteCollection: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, delete from database
      return {
        success: true,
        collectionId: input.collectionId,
      };
    }),

  /**
   * Update collection details
   */
  updateCollection: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, update in database
      return {
        success: true,
        collectionId: input.collectionId,
        updates: input,
      };
    }),

  /**
   * Duplicate collection
   */
  duplicateCollection: protectedProcedure
    .input(
      z.object({
        collectionId: z.string(),
        newName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, duplicate in database
      return {
        success: true,
        newCollectionId: `coll-${Date.now()}`,
        name: input.newName || "Copy of Collection",
      };
    }),
});
