/**
 * Chunked Main Router
 * Splits router imports into 5 chunks to reduce TypeScript compilation load
 * Each chunk is independently compiled, then combined at the top level
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Import router chunks
import { chunk1Router } from "./routerChunks/chunk1";
import { chunk2Router } from "./routerChunks/chunk2";
import { chunk3Router } from "./routerChunks/chunk3";
import { chunk4Router } from "./routerChunks/chunk4";
import { chunk5Router } from "./routerChunks/chunk5";

// Import QUMUS router
import { qumusRouter } from "./routers/qumus";

// Import iTunes Podcasts router
import { itunesPodcastsRouter } from "./routers/itunesPodcasts";

// Import new routers
import { chatStreamingRouter } from "./routers/chatStreamingRouter";
import { locationSharingRouter } from "./routers/locationSharingRouter";
import { fileAnalysisRouter } from "./routers/fileAnalysisRouter";
import { dashboardRouter } from "./routers/dashboardRouter";
import { broadcastRouter } from "./routers/broadcastRouter";
import { hybridcastRouter } from "./routers/hybridcastRouter";
import { hybridcastSyncRouter } from "./routers/hybridcastSyncRouter";
import { solbonesRouter } from "./routers/solbonesRouter";
import { clientPortalRouter } from "./routers/clientPortalRouter";
import { reviewRouter } from "./routers/reviewRouter";
import { meditationRouter } from "./routers/meditation";
import { podcastPlaybackRouter } from "./routers/podcastPlayback";
import { radioStationsRouter } from "./routers/radioStations";
import { studioStreamingRouter } from "./routers/studioStreaming";
import { commandExecutionRouter } from "./routers/commandExecutionRouter";
import { qumusCommandRouter } from "./routers/qumusCommandRouter";
import { audioRouter } from "./routers/audioRouter";
import { governmentOpenSourceRouter } from "./routers/governmentOpenSourceRouter";
import { integrationRouter } from "./routers/integrationRouter";
import { radioStationsDataRouter } from "./routers/radioStationsData";
import { podcastsDataRouter } from "./routers/podcastsData";
import { musicDataRouter } from "./routers/musicData";

export const appRouter = router({
  // System router
  system: systemRouter,
  // Integration router
  integration: integrationRouter,

  // Audio router
  audio: audioRouter,

  // Government-level open source router
  government: governmentOpenSourceRouter,

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

  // Merge all router chunks
  ...chunk1Router._def.procedures,
  ...chunk2Router._def.procedures,
  ...chunk3Router._def.procedures,
  ...chunk4Router._def.procedures,
  ...chunk5Router._def.procedures,

  // iTunes Podcasts
  itunesPodcasts: itunesPodcastsRouter,

  // Chat Streaming
  chatStreaming: chatStreamingRouter,

  // Location Sharing
  locationSharing: locationSharingRouter,

  // File Analysis
  fileAnalysis: fileAnalysisRouter,

  // Dashboard
  dashboard: dashboardRouter,

  // Broadcast Management
  broadcast: broadcastRouter,

  // HybridCast Streaming
  hybridcast: hybridcastRouter,

  // HybridCast Data Sync
  hybridcastSync: hybridcastSyncRouter,

  // Solbones Frequency Dice Game
  solbones: solbonesRouter,

  // Client Portal
  clientPortal: clientPortalRouter,

  // Reviews & Ratings
  reviews: reviewRouter,

  // Meditation Hub
  meditation: meditationRouter,

  // Podcast Playback
  podcastPlayback: podcastPlaybackRouter,

  // RRB Data Routers
  radioStationsData: radioStationsDataRouter,
  podcastsData: podcastsDataRouter,
  musicData: musicDataRouter,

  // Radio Stations
  radioStations: radioStationsRouter,

  // Studio Streaming
  studioStreaming: studioStreamingRouter,

  // Command Execution
  commands: commandExecutionRouter,

  // QUMUS Command Router
  qumusCommand: qumusCommandRouter,

  // Agent Session Management
  agent: router({
    // Create a new agent session
    createSession: protectedProcedure
      .input(z.object({
        sessionName: z.string().min(1),
        systemPrompt: z.string().optional(),
        temperature: z.number().min(0).max(100).optional(),
        model: z.string().optional(),
        maxSteps: z.number().min(1).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const result = await db.createAgentSession(
          ctx.user.id,
          input.sessionName,
          {
            systemPrompt: input.systemPrompt,
            temperature: input.temperature,
            model: input.model,
            maxSteps: input.maxSteps,
          }
        );
        
        return { success: true, id: result };
      }),

    // Get all sessions for the current user
    getSessions: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return db.getAgentSessionsByUserId(ctx.user.id);
      }),

    // Get session by ID
    getSession: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const session = await db.getAgentSessionById(input);
        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return session;
      }),

    // Delete session
    deleteSession: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const session = await db.getAgentSessionById(input);
        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await db.deleteAgentSession(input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
