/**
 * Commercial MP3 Router — tRPC procedures for uploading and managing commercial audio files
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { getCommercialMP3Uploader } from "../services/commercial-mp3-uploader";

export const commercialMP3Router = router({
  // Get commercial CDN URL (public)
  getCDNUrl: publicProcedure
    .input(z.object({
      commercialId: z.string(),
    }))
    .query(({ input }) => {
      const uploader = getCommercialMP3Uploader();
      const url = uploader.getCDNUrl(input.commercialId);
      return { url };
    }),

  // Get presigned URL for temporary access (public)
  getPresignedUrl: publicProcedure
    .input(z.object({
      commercialId: z.string(),
      expiresIn: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const uploader = getCommercialMP3Uploader();
      const url = await uploader.getPresignedUrl(input.commercialId, input.expiresIn);
      return { url };
    }),

  // Get commercial details (public)
  getCommercial: publicProcedure
    .input(z.object({
      commercialId: z.string(),
    }))
    .query(({ input }) => {
      const uploader = getCommercialMP3Uploader();
      const commercial = uploader.getCommercial(input.commercialId);
      return commercial;
    }),

  // Get all commercials (protected)
  getAllCommercials: protectedProcedure.query(() => {
    const uploader = getCommercialMP3Uploader();
    return uploader.getAllCommercials();
  }),

  // Get batch details (protected)
  getBatch: protectedProcedure
    .input(z.object({
      batchId: z.string(),
    }))
    .query(({ input }) => {
      const uploader = getCommercialMP3Uploader();
      return uploader.getBatch(input.batchId);
    }),

  // Get all batches (protected)
  getAllBatches: protectedProcedure.query(() => {
    const uploader = getCommercialMP3Uploader();
    return uploader.getAllBatches();
  }),

  // Get statistics (protected)
  getStatistics: protectedProcedure.query(() => {
    const uploader = getCommercialMP3Uploader();
    return uploader.getStatistics();
  }),

  // Delete commercial (protected)
  deleteCommercial: protectedProcedure
    .input(z.object({
      commercialId: z.string(),
    }))
    .mutation(({ input }) => {
      const uploader = getCommercialMP3Uploader();
      const success = uploader.deleteCommercial(input.commercialId);
      return { success };
    }),

  // Export all data (protected)
  exportData: protectedProcedure.query(() => {
    const uploader = getCommercialMP3Uploader();
    return uploader.exportData();
  }),
});
