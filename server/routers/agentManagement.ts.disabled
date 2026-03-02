import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { agentSessions } from "../../drizzle/schema";

export const agentManagementRouter = router({
  // Rename agent/session
  renameAgent: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      newName: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        
        // Verify ownership
        const session = await (database as any).query.agentSessions.findFirst({
          where: eq(agentSessions.id, input.sessionId),
        }) as any;
        
        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to rename this agent" });
        }
        
        // Update session name
        await database.update(agentSessions)
          .set({ sessionName: input.newName })
          .where(eq(agentSessions.id, input.sessionId));
        
        return { success: true, newName: input.newName };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Get agent details
  getAgent: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        
        const session = await (database as any).query.agentSessions.findFirst({
          where: eq(agentSessions.id, input.sessionId),
        }) as any;
        
        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return session;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Update agent configuration
  updateAgentConfig: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      config: z.object({
        systemPrompt: z.string().optional(),
        temperature: z.number().min(0).max(100).optional(),
        model: z.string().optional(),
        maxSteps: z.number().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        
        // Verify ownership
        const session = await (database as any).query.agentSessions.findFirst({
          where: eq(agentSessions.id, input.sessionId),
        }) as any;
        
        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        // Update configuration
        const updates: any = {};
        if (input.config.systemPrompt) updates.systemPrompt = input.config.systemPrompt;
        if (input.config.temperature !== undefined) updates.temperature = input.config.temperature;
        if (input.config.model) updates.model = input.config.model;
        if (input.config.maxSteps !== undefined) updates.maxSteps = input.config.maxSteps;
        
        await database.update(agentSessions)
          .set(updates)
          .where(eq(agentSessions.id, input.sessionId));
        
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Delete agent/session
  deleteAgent: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        
        // Verify ownership
        const session = await (database as any).query.agentSessions.findFirst({
          where: eq(agentSessions.id, input.sessionId),
        }) as any;
        
        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        // Delete session (cascades to messages and tool executions)
        await database.delete(agentSessions)
          .where(eq(agentSessions.id, input.sessionId));
        
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // List all agents for user
  listAgents: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        
        const agents = await (database as any).query.agentSessions.findMany({
          where: eq(agentSessions.userId, ctx.user.id),
          limit: input.limit,
          offset: input.offset,
          orderBy: (fields: any) => [fields.createdAt],
        }) as any[];
        
        return agents;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),
});
