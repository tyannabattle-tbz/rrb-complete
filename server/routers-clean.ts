/**
 * QUMUS Autonomous Platform - Clean Router
 * Only includes working features: Podcast, Meditation, Studio, HybridCast, QUMUS
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Import QUMUS core features
import { qumusRouter } from "./routers/qumus";
import { podcastPlaybackRouter } from "./routers/podcastPlayback";
import { meditationRouter } from "./routers/meditation";
import { studioStreamingRouter } from "./routers/studioStreaming";
import { hybridCastRouter } from "./routers/hybridCastRouter";
import { rockinBoogieRouter } from "./routers/rockinBoogie";

export const appRouter = router({
  // System router
  system: systemRouter,

  // Auth procedures
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // QUMUS Autonomous Orchestration Engine
  qumus: qumusRouter,

  // Podcast Feature - Multi-channel audio streaming with autonomous distribution
  podcast: podcastPlaybackRouter,
  rockinBoogie: rockinBoogieRouter,

  // Meditation Feature - Guided sessions with autonomous recommendations
  meditation: meditationRouter,

  // Studio Feature - Professional broadcast with HybridCast integration
  studio: studioStreamingRouter,

  // HybridCast - Off-grid mesh network support
  hybridCast: hybridCastRouter,
});

export type AppRouter = typeof appRouter;
