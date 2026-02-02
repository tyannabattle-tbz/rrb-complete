import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { messages, agentSessions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const chatHistoryRouter = router({
  // Clear all messages for a session
  clearSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify user owns this session
        const session = await db
          .select()
          .from(agentSessions)
          .where(eq(agentSessions.id, input.sessionId))
          .limit(1);

        if (!session.length || session[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Delete all messages for this session
        await db
          .delete(messages)
          .where(eq(messages.sessionId, input.sessionId));

        return { success: true, message: "Session cleared" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to clear session",
        });
      }
    }),

  // Clear all sessions and messages for user
  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all user sessions
      const userSessions = await db
        .select()
        .from(agentSessions)
        .where(eq(agentSessions.userId, ctx.user.id));

      // Delete all messages for all sessions
      for (const session of userSessions) {
        await db
          .delete(messages)
          .where(eq(messages.sessionId, session.id));
      }

      // Delete all sessions
      await db
        .delete(agentSessions)
        .where(eq(agentSessions.userId, ctx.user.id));

      return {
        success: true,
        message: `Cleared ${userSessions.length} sessions`,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to clear all history",
      });
    }
  }),

  // Archive session instead of deleting
  archiveSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify user owns this session
        const session = await db
          .select()
          .from(agentSessions)
          .where(eq(agentSessions.id, input.sessionId))
          .limit(1);

        if (!session.length || session[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Update session status to archived (if status field exists)
        // For now, we'll just mark it as completed
        await db
          .update(agentSessions)
          .set({ status: "completed" })
          .where(eq(agentSessions.id, input.sessionId));

        return { success: true, message: "Session archived" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to archive session",
        });
      }
    }),

  // Hide session (soft delete)
  hideSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify user owns this session
        const session = await db
          .select()
          .from(agentSessions)
          .where(eq(agentSessions.id, input.sessionId))
          .limit(1);

        if (!session.length || session[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // In production, add a 'hidden' or 'archived' field to track this
        // For now, we'll update the session name to indicate it's hidden
        await db
          .update(agentSessions)
          .set({ sessionName: `[HIDDEN] ${session[0].sessionName}` })
          .where(eq(agentSessions.id, input.sessionId));

        return { success: true, message: "Session hidden" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to hide session",
        });
      }
    }),

  // Get session count
  getSessionCount: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const sessions = await db
        .select()
        .from(agentSessions)
        .where(eq(agentSessions.userId, ctx.user.id));

      return { count: sessions.length };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get session count",
      });
    }
  }),
});
