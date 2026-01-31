import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { teams, teamMembers, sessionShares, sessionAnnotations, activityLogs } from "../../drizzle/schema";
import { eq, and, or } from "drizzle-orm";

const activeUsers = new Map<number, Set<string>>();
const typingUsers = new Map<number, Set<string>>();

export const collaborationRouter = router({
  // Create a team
  createTeam: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      await db.insert(teams).values({
        name: input.name,
        description: input.description,
        ownerId: ctx.user.id,
      });
      
      return { success: true };
    }),

  // Get user teams
  getTeams: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const userTeams = await db
        .select()
        .from(teams)
        .where(eq(teams.ownerId, ctx.user.id));
      
      return userTeams;
    }),

  // Add team member
  addTeamMember: protectedProcedure
    .input(z.object({
      teamId: z.number(),
      userId: z.number(),
      role: z.enum(["viewer", "editor", "admin"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      await db.insert(teamMembers).values({
        teamId: input.teamId,
        userId: input.userId,
        role: input.role,
      });
      
      return { success: true };
    }),

  // Share session with user
  shareSession: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      userId: z.number(),
      permission: z.enum(["view", "edit", "admin"]),
      expiresAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      await db.insert(sessionShares).values({
        sessionId: input.sessionId,
        sharedBy: ctx.user.id,
        sharedWith: input.userId,
        permission: input.permission,
        expiresAt: input.expiresAt,
      });
      
      return { success: true };
    }),

  // Add annotation to session
  addAnnotation: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      messageId: z.number().optional(),
      comment: z.string().min(1),
      type: z.enum(["note", "flag", "question", "suggestion"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      await db.insert(sessionAnnotations).values({
        sessionId: input.sessionId,
        userId: ctx.user.id,
        messageId: input.messageId,
        comment: input.comment,
        type: input.type,
      });
      
      return { success: true };
    }),

  // Get session annotations
  getAnnotations: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const annotations = await db
        .select()
        .from(sessionAnnotations)
        .where(eq(sessionAnnotations.sessionId, input.sessionId));
      
      return annotations;
    }),

  // Log activity
  logActivity: protectedProcedure
    .input(z.object({
      action: z.string(),
      resourceType: z.string(),
      resourceId: z.number().optional(),
      sessionId: z.number().optional(),
      changes: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      await db.insert(activityLogs).values({
        userId: ctx.user.id,
        sessionId: input.sessionId || undefined,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        changes: input.changes,
        ipAddress: (ctx.req as any)?.ip || "unknown",
        userAgent: (ctx.req as any)?.headers?.["user-agent"],
      });
      
      return { success: true };
    }),

  // Get activity logs
  getActivityLogs: protectedProcedure
    .input(z.object({
      sessionId: z.number().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const logs = await db
        .select()
        .from(activityLogs)
        .where(
          input.sessionId
            ? and(eq(activityLogs.userId, ctx.user.id), eq(activityLogs.sessionId, input.sessionId))
            : eq(activityLogs.userId, ctx.user.id)
        )
        .limit(input.limit);
      return logs;
    }),
});

// Note: The closing brace and export were already added above
// Adding new procedures to the router object:

// Extend collaborationRouter with presence procedures
export const collaborationRouterWithPresence = {
  ...collaborationRouter,
  
  getActiveUsers: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const users = activeUsers.get(input.sessionId) || new Set();
      return Array.from(users);
    }),

  setUserActive: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      if (!activeUsers.has(input.sessionId)) {
        activeUsers.set(input.sessionId, new Set());
      }
      const users = activeUsers.get(input.sessionId)!;
      users.add(ctx.user.id.toString());
      setTimeout(() => {
        users.delete(ctx.user.id.toString());
        if (users.size === 0) {
          activeUsers.delete(input.sessionId);
        }
      }, 5 * 60 * 1000);
      return { success: true, activeCount: users.size };
    }),

  getTypingUsers: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const users = typingUsers.get(input.sessionId) || new Set();
      return Array.from(users);
    }),

  setTyping: protectedProcedure
    .input(z.object({ sessionId: z.number(), isTyping: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      if (!typingUsers.has(input.sessionId)) {
        typingUsers.set(input.sessionId, new Set());
      }
      const users = typingUsers.get(input.sessionId)!;
      if (input.isTyping) {
        users.add(ctx.user.id.toString());
        setTimeout(() => {
          users.delete(ctx.user.id.toString());
          if (users.size === 0) {
            typingUsers.delete(input.sessionId);
          }
        }, 3000);
      } else {
        users.delete(ctx.user.id.toString());
        if (users.size === 0) {
          typingUsers.delete(input.sessionId);
        }
      }
      return { success: true };
    }),
};
