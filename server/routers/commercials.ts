/**
 * Commercials Router — AI-Generated Radio Commercials
 * 
 * Manages commercial generation, scheduling, and rotation
 * for the Canryn Production radio broadcast ecosystem.
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { getCommercialEngine } from "../services/commercial-engine";
import { storagePut } from "../storage";

export const commercialsRouter = router({
  // Get all commercials with optional filters
  getCommercials: publicProcedure
    .input(z.object({
      category: z.enum(['promo', 'psa', 'sponsor', 'event', 'station_id', 'jingle', 'fundraiser', 'community', 'client_ad']).optional(),
      brand: z.string().optional(),
    }).optional())
    .query(({ input }) => {
      const engine = getCommercialEngine();
      return engine.getCommercials(input?.category, input?.brand);
    }),

  // Get a single commercial by ID
  getCommercial: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const engine = getCommercialEngine();
      return engine.getCommercial(input.id);
    }),

  // Generate a new AI commercial script
  generate: protectedProcedure
    .input(z.object({
      category: z.enum(['promo', 'psa', 'sponsor', 'event', 'station_id', 'jingle', 'fundraiser', 'community', 'client_ad']),
      brand: z.string(),
      customPrompt: z.string().optional(),
      targetDuration: z.number().min(5).max(120).optional(),
    }))
    .mutation(async ({ input }) => {
      const engine = getCommercialEngine();
      const commercial = await engine.generateScript(
        input.category,
        input.brand,
        input.customPrompt,
        input.targetDuration,
      );
      return commercial;
    }),

  // Update a commercial (approve, edit script, change status, etc.)
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      script: z.string().optional(),
      status: z.enum(['draft', 'approved', 'active', 'archived', 'scheduled']).optional(),
      voiceDirection: z.string().optional(),
      musicDirection: z.string().optional(),
      audioUrl: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const engine = getCommercialEngine();
      const { id, ...updates } = input;
      const updated = engine.updateCommercial(id, updates);
      if (!updated) throw new Error('Commercial not found');
      return updated;
    }),

  // Delete a commercial
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const engine = getCommercialEngine();
      const success = engine.deleteCommercial(input.id);
      if (!success) throw new Error('Commercial not found');
      return { success: true };
    }),

  // Get the current rotation state
  getRotation: publicProcedure.query(() => {
    const engine = getCommercialEngine();
    return engine.getRotation();
  }),

  // Get the next commercial to play
  getNextCommercial: publicProcedure.query(() => {
    const engine = getCommercialEngine();
    return engine.getNextCommercial();
  }),

  // Mark a commercial as played (for analytics)
  markPlayed: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const engine = getCommercialEngine();
      engine.markPlayed(input.id);
      return { success: true };
    }),

  // Get commercial stats and analytics
  getStats: publicProcedure.query(() => {
    const engine = getCommercialEngine();
    return engine.getStats();
  }),

  // ─── Client Advertising Endpoints ─────────────────────────────────────

  // Generate a client advertisement
  generateClientAd: protectedProcedure
    .input(z.object({
      advertiserName: z.string().min(1),
      advertiserContact: z.string().min(1),
      businessDescription: z.string().min(10),
      package: z.enum(['basic_30', 'standard_60', 'premium_90', 'sponsorship', 'custom']),
      campaignStart: z.number().optional(),
      campaignEnd: z.number().optional(),
      customPrompt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const engine = getCommercialEngine();
      return engine.generateClientAd(input);
    }),

  // Get all client ads
  getClientAds: publicProcedure.query(() => {
    const engine = getCommercialEngine();
    return engine.getClientAds();
  }),

  // Get advertising packages info
  getAdvertisingPackages: publicProcedure.query(() => {
    const engine = getCommercialEngine();
    return engine.getAdvertisingPackages();
  }),

  // Upload audio file for a commercial
  uploadAudio: protectedProcedure
    .input(z.object({
      id: z.string(),
      audioBase64: z.string(),
      fileName: z.string(),
      mimeType: z.string().default('audio/mpeg'),
    }))
    .mutation(async ({ input }) => {
      const engine = getCommercialEngine();
      const commercial = engine.getCommercial(input.id);
      if (!commercial) throw new Error('Commercial not found');

      // Upload to S3
      const buffer = Buffer.from(input.audioBase64, 'base64');
      const suffix = Math.random().toString(36).slice(2, 8);
      const ext = input.fileName.split('.').pop() || 'mp3';
      const key = `commercials/${input.id}-${suffix}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);

      // Update the commercial with the new audio URL
      const updated = engine.updateCommercial(input.id, { audioUrl: url });
      return { success: true, audioUrl: url, commercial: updated };
    }),
});
