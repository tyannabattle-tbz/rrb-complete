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
import { qumusAutonomousEntityRouter } from "./routers/qumusAutonomousEntityRouter";
import { qumusAutonomousScalingRouter } from "./routers/qumusAutonomousScalingRouter";
import { qumusChatRouter } from "./routers/qumusChatRouter";
import { socialSharingRouter } from "./routers/socialSharingRouter";
import { userPreferenceSyncRouter } from "./routers/userPreferenceSyncRouter";
import { ecosystemRouter } from "./routers/ecosystem";
import { offlinePlaylistRouter } from "./routers/offlinePlaylistRouter";
import { agentNetworkRouter } from "./routers/agentNetworkRouter";
import { seamlessAgentConnectionRouter } from "./routers/seamlessAgentConnectionRouter";
import { videoProductionWorkflowRouter } from "./routers/videoProductionWorkflowRouter";
import { qumusOrchestrationRouter } from "./routers/qumusOrchestrationRouter";
import { ecosystemIntegrationRouter } from "./routers/ecosystemIntegrationRouter";
import { mapArsenalRouter } from "./mapArsenal";
import { qumusAutonomousFinalizationRouter } from "./qumusAutonomousFinalization";
import { autonomousTaskRouter } from "./routers/autonomousTaskRouter";
import { taskExecutionEngine } from "./services/taskExecutionEngine";
import { ecosystemExecutor } from "./services/ecosystemExecutor";

// Import new payment, admin, task, and file routers
import { paymentsRouter } from "./routers/payments";
import { adminPoliciesRouter } from "./routers/adminPolicies";
import { tasksRouter } from "./routers/tasks";
import { filesRouter } from "./routers/files";

// Import Qumus Full Stack Router (unified autonomous system)
import { qumusFullStackRouter } from "./routers/qumusFullStackRouter";

// Import RRB Unified Router
import { rrbUnifiedRouter } from "./routers/rrbUnifiedRouter";

export const appRouter = router({
  // System router
  system: systemRouter,

  // Audio router
  audio: audioRouter,

  // Qumus Orchestration (Central Brain)
  qumusOrchestration: qumusOrchestrationRouter,

  // Ecosystem Integration (State of Studio & Full Integration)
  ecosystemIntegration: ecosystemIntegrationRouter,

  // New Ecosystem Router (Broadcasts, Listeners, Donations, Metrics)
  ecosystem: ecosystemRouter,

  // Autonomous Task Management
  autonomousTask: autonomousTaskRouter,

  // Task Execution Engine
  taskExecution: router({
    submit: protectedProcedure
      .input(
        z.object({
          goal: z.string().min(1, "Goal is required"),
          priority: z.number().int().min(1).max(10).optional().default(5),
          steps: z.array(z.string()).optional(),
          constraints: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const taskId = await taskExecutionEngine.submitTask({
          goal: input.goal,
          priority: input.priority,
          steps: input.steps,
          constraints: input.constraints,
          userId: ctx.user!.id,
        });
        return { taskId, success: true };
      }),

    getStatus: publicProcedure
      .input(z.object({ taskId: z.string() }))
      .query(async ({ input }) => {
        return await taskExecutionEngine.getTaskStatus(input.taskId);
      }),

    getMetrics: publicProcedure.query(async () => {
      return await taskExecutionEngine.getSystemMetrics();
    }),
  }),

  // Ecosystem Command Execution
  ecosystemCommand: router({
    submit: protectedProcedure
      .input(
        z.object({
          target: z.enum(["rrb", "hybridcast", "canryn", "sweet_miracles"]),
          action: z.string().min(1, "Action is required"),
          params: z.record(z.any()).optional().default({}),
          priority: z.number().int().min(1).max(10).optional().default(5),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const commandId = await ecosystemExecutor.submitCommand({
          target: input.target,
          action: input.action,
          params: input.params,
          priority: input.priority,
          userId: ctx.user!.id,
        });
        return { commandId, success: true };
      }),

    getStatus: publicProcedure
      .input(z.object({ commandId: z.string() }))
      .query(async ({ input }) => {
        return await ecosystemExecutor.getCommandStatus(input.commandId);
      }),

    getEntityStatus: publicProcedure
      .input(z.object({ target: z.enum(["rrb", "hybridcast", "canryn", "sweet_miracles"]) }))
      .query(async ({ input }) => {
        return await ecosystemExecutor.getEntityStatus(input.target);
      }),

    getAllStatuses: publicProcedure.query(async () => {
      return await ecosystemExecutor.getAllEntityStatuses();
    }),
  }),

  // Auth procedures
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      console.log("[Auth.me] Query called", {
        hasUser: !!ctx.user,
        userId: ctx.user?.id,
        userName: ctx.user?.name,
        hostname: ctx.req.hostname,
        hasCookies: !!ctx.req.headers.cookie,
      });
      return ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      console.log("[Auth.logout] Clearing session cookie");
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

  // Radio Stations
  radioStations: radioStationsRouter,

  // Studio Streaming
  studioStreaming: studioStreamingRouter,

  // Command Execution
  commands: commandExecutionRouter,

  // QUMUS Command Router
  qumusCommand: qumusCommandRouter,

  // QUMUS Autonomous Entity Management
  qumusAutonomousEntity: qumusAutonomousEntityRouter,

  // QUMUS Autonomous Scaling & Self-Optimization
  qumusAutonomousScaling: qumusAutonomousScalingRouter,

  // QUMUS Chat Interface
  ai: router({
    qumusChat: qumusChatRouter,
  }),

  // Social Sharing Features
  socialSharing: socialSharingRouter,

  // User Preference Sync
  preferenceSync: userPreferenceSyncRouter,

  // Offline Playlist Management
  offlinePlaylist: offlinePlaylistRouter,

  // Agent Network - Inter-agent communication
  agentNetwork: agentNetworkRouter,

  // Seamless Agent Connection & Cross-Platform Communication
  seamlessAgentConnection: seamlessAgentConnectionRouter,

  // Video Production Workflow - Generation to RRB Radio Broadcast
  videoProductionWorkflow: videoProductionWorkflowRouter,

  // Map Arsenal - Military-grade tactical mapping
  mapArsenal: mapArsenalRouter,

  // Qumus Autonomous Finalization
  qumusFinalization: qumusAutonomousFinalizationRouter,

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

  // Payment Processing Router
  payments: paymentsRouter,

  // Admin Policies Monitoring Router
  adminPolicies: adminPoliciesRouter,

  // Task Execution Router
  tasks: tasksRouter,

  // File Management Router
  files: filesRouter,

  // Qumus Full Stack Router (Unified Autonomous System)
  qumusFullStack: qumusFullStackRouter,

  // RRB Unified Router (All RRB Systems Orchestrated)
  rrb: rrbUnifiedRouter,
});

export type AppRouter = typeof appRouter;
