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

export const commercialsRouter = router({
  // Get all commercials with optional filters
  getCommercials: publicProcedure
    .input(z.object({
      category: z.enum(['promo', 'psa', 'sponsor', 'event', 'station_id', 'jingle', 'fundraiser', 'community']).optional(),
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
      category: z.enum(['promo', 'psa', 'sponsor', 'event', 'station_id', 'jingle', 'fundraiser', 'community']),
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
});
