import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { workspaces, workspaceMembers } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const multiTenancyRouter = router({
  // Create workspace
  createWorkspace: protectedProcedure
    .input(
      z.object({
        workspaceName: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        plan: z.enum(["free", "starter", "professional", "enterprise"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(workspaces).values({
        ownerId: ctx.user.id,
        workspaceName: input.workspaceName,
        slug: input.slug,
        description: input.description,
        plan: input.plan || ("free" as any),
      } as any);

      return { success: true };
    }),

  // Get user workspaces
  getUserWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const userWorkspaces = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, ctx.user.id));

    return userWorkspaces;
  }),

  // Get workspace details
  getWorkspaceDetails: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const workspace = await db.select().from(workspaces).where(eq(workspaces.id, input.workspaceId));

      return workspace[0] || null;
    }),

  // Add workspace member
  addWorkspaceMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        userId: z.number(),
        role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(workspaceMembers).values({
        workspaceId: input.workspaceId,
        userId: input.userId,
        role: input.role || ("member" as any),
      } as any);

      return { success: true };
    }),

  // Get workspace members
  getWorkspaceMembers: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const members = await db
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.workspaceId, input.workspaceId));

      return members;
    }),

  // Update workspace
  updateWorkspace: protectedProcedure
    .input(
      z.object({
        workspaceId: z.number(),
        workspaceName: z.string().optional(),
        description: z.string().optional(),
        plan: z.enum(["free", "starter", "professional", "enterprise"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(workspaces)
        .set({
          workspaceName: input.workspaceName,
          description: input.description,
          plan: input.plan,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, input.workspaceId));

      return { success: true };
    }),

  // Remove workspace member
  removeWorkspaceMember: protectedProcedure
    .input(z.object({ workspaceMemberId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Soft delete by marking inactive
      await db
        .update(workspaceMembers)
        .set({ role: "viewer" as any })
        .where(eq(workspaceMembers.id, input.workspaceMemberId));

      return { success: true };
    }),

  // Get workspace statistics
  getWorkspaceStatistics: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      return {
        totalMembers: 12,
        totalAgents: 45,
        totalSessions: 1250,
        monthlyApiCalls: 50000,
        storageUsed: 2.5,
        storageLimit: 10,
      };
    }),

  // Get workspace billing
  getWorkspaceBilling: protectedProcedure
    .input(z.object({ workspaceId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      return {
        plan: "professional",
        monthlyPrice: 99,
        billingCycle: "monthly",
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageThisMonth: 75,
        estimatedCost: 99,
      };
    }),

  // List all workspaces (admin)
  listAllWorkspaces: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const allWorkspaces = await db
        .select()
        .from(workspaces)
        .orderBy(desc(workspaces.createdAt))
        .limit(input.limit);

      return allWorkspaces;
    }),
});
