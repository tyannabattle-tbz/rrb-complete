import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { agentSessions, messages, toolExecutions, clonedSessions } from "../../drizzle/schema";

export const agentCloningRouter = router({
  // Clone an agent session
  cloneAgent: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      newName: z.string().min(1).max(255),
      includeMessages: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        // Get original session
        const originalSession = await (database as any).query.agentSessions.findFirst({
          where: eq(agentSessions.id, input.sessionId),
        }) as any;

        if (!originalSession || originalSession.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to clone this agent" });
        }

        // Create cloned session
        const result = await database.insert(agentSessions).values({
          userId: ctx.user.id,
          sessionName: input.newName,
          systemPrompt: originalSession.systemPrompt,
          temperature: originalSession.temperature,
          model: originalSession.model,
          maxSteps: originalSession.maxSteps,
          status: "idle",
        });

        const clonedSessionId = (result as any).insertId;

        // Clone messages if requested
        if (input.includeMessages) {
          const originalMessages = await (database as any).query.messages.findMany({
            where: eq(messages.sessionId, input.sessionId),
          }) as any[];

          for (const msg of originalMessages) {
            await database.insert(messages).values({
              sessionId: clonedSessionId,
              role: msg.role,
              content: msg.content,
              metadata: msg.metadata,
            });
          }
        }

        // Record cloning relationship
        await database.insert(clonedSessions).values({
          originalSessionId: input.sessionId,
          clonedSessionId,
          clonedBy: ctx.user.id,
        });

        return {
          success: true,
          clonedSessionId,
          sessionName: input.newName,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Get clone history
  getCloneHistory: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
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

        // Get all clones of this session
        const clones = await (database as any).query.clonedSessions.findMany({
          where: eq(clonedSessions.originalSessionId, input.sessionId),
        }) as any[];

        return clones;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Get original session
  getOriginalSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        // Find original session
        const cloneRecord = await (database as any).query.clonedSessions.findFirst({
          where: eq(clonedSessions.clonedSessionId, input.sessionId),
        }) as any;

        if (!cloneRecord) {
          return null;
        }

        // Get original session
        const originalSession = await (database as any).query.agentSessions.findFirst({
          where: eq(agentSessions.id, cloneRecord.originalSessionId),
        }) as any;

        return originalSession;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Batch clone multiple agents
  batchCloneAgents: protectedProcedure
    .input(z.object({
      sessionIds: z.array(z.number()),
      nameSuffix: z.string().default("(Clone)"),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        const results = [];

        for (const sessionId of input.sessionIds) {
          const originalSession = await (database as any).query.agentSessions.findFirst({
            where: eq(agentSessions.id, sessionId),
          }) as any;

          if (!originalSession || originalSession.userId !== ctx.user.id) {
            continue;
          }

          const newName = `${originalSession.sessionName} ${input.nameSuffix}`;
          const result = await database.insert(agentSessions).values({
            userId: ctx.user.id,
            sessionName: newName,
            systemPrompt: originalSession.systemPrompt,
            temperature: originalSession.temperature,
            model: originalSession.model,
            maxSteps: originalSession.maxSteps,
            status: "idle",
          });

          const clonedSessionId = (result as any).insertId;

          await database.insert(clonedSessions).values({
            originalSessionId: sessionId,
            clonedSessionId,
            clonedBy: ctx.user.id,
          });

          results.push({
            originalSessionId: sessionId,
            clonedSessionId,
            sessionName: newName,
          });
        }

        return { success: true, cloned: results.length, results };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),
});
