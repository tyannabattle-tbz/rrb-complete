import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { executeAgentTask } from "./agentBackendService";
import { webhooksRouter } from "./routers/webhooks";
import { reportingRouter } from "./routers/reporting";
import { metricsRouter } from "./routers/metrics";
import { adminRouter } from "./routers/admin";
import { marketplaceRouter } from "./routers/marketplace";
import { finetuningRouter } from "./routers/finetuning";
import { performanceTestingRouter } from "./routers/performanceTesting";
import { productionInfrastructureRouter } from "./routers/productionInfrastructure";
import { operationsPlatformRouter } from "./routers/operationsPlatform";
import { infrastructurePlatformRouter } from "./routers/infrastructurePlatform";
import { finalOperationsRouter } from "./routers/finalOperations";
import { analyticsRouter } from "./routers/analytics";
import { collaborationRouter } from "./routers/collaboration";
import { billingRouter } from "./routers/billing";
import { anomalyDetectionRouter } from "./routers/anomalyDetection";
import { predictiveAlertsRouter } from "./routers/predictiveAlerts";
import { suppressionRulesRouter } from "./routers/suppressionRules";
import { agentInfrastructureRouter } from "./routers/agentInfrastructure";
import { agentVersioningRouter } from "./routers/agentVersioning";
import { agentProfilingRouter } from "./routers/agentProfiling";
import { agentCertificationRouter } from "./routers/agentCertification";
import { agentMarketplaceRouter } from "./routers/agentMarketplace";
import { orchestrationRouter } from "./routers/orchestration";
import { persistenceRouter } from "./routers/persistence";
import { stripeIntegrationRouter } from "./routers/stripeIntegration";
import { agentManagementRouter } from "./routers/agentManagement";
import { adminDashboardRouter } from "./routers/adminDashboard";
import { costOptimizationRouter } from "./routers/costOptimization";
import { integrationMarketplaceRouter } from "./routers/integrationMarketplace";
import { monitoringRouter } from "./routers/monitoring";
import { multiTenancyRouter } from "./routers/multiTenancy";
import { rateLimitingRouter } from "./routers/rateLimiting";
import { advancedSearchRouter } from "./routers/advancedSearch";
import { customDashboardsRouter } from "./routers/customDashboards";
import { automatedReportsRouter } from "./routers/automatedReports";
import { costTrackingRouter } from "./routers/costTracking";
import { analyticsDashboardRouter } from "./routers/analyticsDashboard";
import { templateMarketplaceRouter } from "./routers/templateMarketplace";
import { websocketRouter } from "./routers/websocket";
import { sessionTemplatesRouter } from "./routers/sessionTemplates";

export const appRouter = router({
  system: systemRouter,
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
        return db.getUserSessions(ctx.user.id);
      }),

    // Get a specific session
    getSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        const session = await db.getAgentSession(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND" });
        return session;
      }),

    // Update session configuration
    updateSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        systemPrompt: z.string().optional(),
        temperature: z.number().min(0).max(100).optional(),
        model: z.string().optional(),
        maxSteps: z.number().min(1).optional(),
        status: z.enum(["idle", "reasoning", "executing", "completed", "error"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.updateAgentSession(input.sessionId, {
          systemPrompt: input.systemPrompt,
          temperature: input.temperature,
          model: input.model,
          maxSteps: input.maxSteps,
          status: input.status,
        });
        return { success: true };
      }),

    // Rename a session
    renameSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        sessionName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const result = await db.updateAgentSession(input.sessionId, {
          sessionName: input.sessionName,
        });
        return { success: true };
      }),
  }),

  // Message Management
  messages: router({
    // Add a message to a session and trigger agent response
    addMessage: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Store the user message
        await db.addMessage(
          input.sessionId,
          input.role,
          input.content,
          input.metadata
        );

        // If this is a user message, generate an agent response
        if (input.role === "user") {
          try {
            // Get the session to retrieve configuration
            const session = await db.getAgentSession(input.sessionId);
            if (!session) throw new Error("Session not found");

            // Execute the agent to generate a response
            const agentResponse = await executeAgentTask({
              sessionId: input.sessionId,
              userMessage: input.content,
              systemPrompt: session.systemPrompt || undefined,
              temperature: session.temperature || undefined,
              model: session.model || undefined,
              maxSteps: session.maxSteps || undefined,
            });

            // Store the agent response
            if (agentResponse.success && agentResponse.agentResponse) {
              await db.addMessage(
                input.sessionId,
                "assistant",
                agentResponse.agentResponse,
                JSON.stringify({
                  reasoning: agentResponse.reasoning,
                  toolsUsed: agentResponse.toolsUsed,
                  status: agentResponse.status,
                })
              );
            }
          } catch (error) {
            console.error("[Agent] Failed to generate response:", error);
            // Store an error message
            await db.addMessage(
              input.sessionId,
              "assistant",
              "I encountered an error processing your request. Please try again.",
              JSON.stringify({ error: String(error) })
            );
          }
        }

        return { success: true };
      }),

    // Get messages from a session
    getMessages: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        limit: z.number().min(1).max(100).optional(),
      }))
      .query(async ({ input }) => {
        const messages = await db.getSessionMessages(input.sessionId, input.limit);
        return messages.reverse(); // Return in chronological order
      }),
  }),

  // Tool Execution Tracking
  tools: router({
    // Create a tool execution record
    createExecution: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        toolName: z.string(),
        parameters: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createToolExecution(
          input.sessionId,
          input.toolName,
          input.parameters
        );
        return { success: true };
      }),

    // Update tool execution with result
    updateExecution: protectedProcedure
      .input(z.object({
        executionId: z.number(),
        status: z.enum(["pending", "running", "completed", "failed"]).optional(),
        result: z.string().optional(),
        error: z.string().optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateToolExecution(input.executionId, {
          status: input.status,
          result: input.result,
          error: input.error,
          duration: input.duration,
        });
        return { success: true };
      }),

    // Get tool executions for a session
    getExecutions: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return db.getSessionToolExecutions(input.sessionId);
      }),
  }),

  // API Key Management
  apiKeys: router({
    // Save an API key (encrypted)
    saveKey: protectedProcedure
      .input(z.object({
        provider: z.string(),
        keyName: z.string(),
        encryptedKey: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        await db.saveApiKey(
          ctx.user.id,
          input.provider,
          input.keyName,
          input.encryptedKey
        );
        return { success: true };
      }),

    // Get API keys for the current user
    getKeys: protectedProcedure
      .input(z.object({ provider: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return db.getUserApiKeys(ctx.user.id, input.provider);
      }),

    // Delete an API key
    deleteKey: protectedProcedure
      .input(z.object({ keyId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteApiKey(input.keyId);
        return { success: true };
      }),
  }),

  // Task History
  tasks: router({
    // Create a new task
    createTask: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        taskDescription: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.createTask(input.sessionId, input.taskDescription);
        return { success: true };
      }),

    // Update task status
    updateTask: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
        outcome: z.string().optional(),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateTask(input.taskId, {
          status: input.status,
          outcome: input.outcome,
          duration: input.duration,
          completedAt: input.status === "completed" ? new Date() : undefined,
        });
        return { success: true };
      }),

    // Get tasks for a session
    getTasks: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return db.getSessionTasks(input.sessionId);
      }),
  }),

  // Persistent Memory
  memory: router({
    // Store a key-value pair
    store: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.storeMemory(input.sessionId, input.key, input.value);
        return { success: true };
      }),

    // Retrieve a value by key
    retrieve: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        key: z.string(),
      }))
      .query(async ({ input }) => {
        const value = await db.retrieveMemory(input.sessionId, input.key);
        return { value };
      }),

    // Get all memory for a session
    getAll: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return db.getSessionMemory(input.sessionId);
      }),

    // Delete a memory entry
    delete: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        key: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteMemory(input.sessionId, input.key);
        return { success: true };
      }),
   }),

  // Session Auto-Save & Version History
  sessionAutoSave: router({
    createSnapshot: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // Placeholder implementation
        return { success: true, versionNumber: 1 };
      }),
    getVersionHistory: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // Placeholder implementation
        return { success: true, versions: [] };
      }),
    restoreVersion: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        versionId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // Placeholder implementation
        return { success: true, message: "Restored from version" };
      }),
  }),

  // Advanced Filtering
  advancedFilters: router({
    saveFilterPreset: protectedProcedure
      .input(z.object({
        name: z.string(),
        filterConfig: z.record(z.string(), z.any()),
        isPublic: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // Placeholder implementation
        return { success: true, presetId: 1 };
      }),
    getFilterPresets: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // Placeholder implementation
        return { success: true, presets: [] };
      }),
    applyFilter: protectedProcedure
      .input(z.object({
        filterConfig: z.record(z.string(), z.any()),
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // Placeholder implementation
        return { success: true, results: [], count: 0 };
      }),
  }),

  // Real-Time Notifications
  notifications: router({
    getNotifications: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        isRead: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // Placeholder implementation
        return { success: true, notifications: [] };
      }),
    markAsRead: protectedProcedure
      .input(z.object({
        notificationId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // Placeholder implementation
        return { success: true };
      }),
    getPreferences: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // Placeholder implementation
        return {
          enablePushNotifications: true,
          enableSoundNotifications: true,
          soundVolume: 70,
        };
      }),
    updatePreferences: protectedProcedure
      .input(z.object({
        enablePushNotifications: z.boolean().optional(),
        enableSoundNotifications: z.boolean().optional(),
        soundVolume: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // Placeholder implementation
        return { success: true };
      }),
  }),

  // New Enterprise Features
  webhooks: webhooksRouter,
  reporting: reportingRouter,
  metrics: metricsRouter,
  admin: adminRouter,
  marketplace: marketplaceRouter,
  finetuning: finetuningRouter,
  performanceTesting: performanceTestingRouter,
  productionInfrastructure: productionInfrastructureRouter,
  operationsPlatform: operationsPlatformRouter,
  infrastructurePlatform: infrastructurePlatformRouter,
  finalOperations: finalOperationsRouter,
  
  // Advanced Features
  analytics: analyticsRouter,
  collaboration: collaborationRouter,
  billing: billingRouter,
  anomalyDetection: anomalyDetectionRouter,
  predictiveAlerts: predictiveAlertsRouter,
  suppressionRules: suppressionRulesRouter,
  agentInfrastructure: agentInfrastructureRouter,
  agentVersioning: agentVersioningRouter,
  agentProfiling: agentProfilingRouter,
  agentCertification: agentCertificationRouter,
  agentMarketplace: agentMarketplaceRouter,
  orchestration: orchestrationRouter,
    persistence: persistenceRouter,
    stripe: stripeIntegrationRouter,
    agentManagement: agentManagementRouter,
  adminDashboard: adminDashboardRouter,
  costOptimization: costOptimizationRouter,
  integrationMarketplace: integrationMarketplaceRouter,
  monitoring: monitoringRouter,
  multiTenancy: multiTenancyRouter,
  rateLimiting: rateLimitingRouter,
  advancedSearch: advancedSearchRouter,
  customDashboards: customDashboardsRouter,
  automatedReports: automatedReportsRouter,
  websocket: websocketRouter,
  templateMarketplace: templateMarketplaceRouter,
  analyticsDashboard: analyticsDashboardRouter,
});
export type AppRouter = typeof appRouter;
