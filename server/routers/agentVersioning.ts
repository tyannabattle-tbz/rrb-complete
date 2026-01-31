import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { agentVersions, agentRollbacks, agentRegistry } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const agentVersioningRouter = router({
  // Create version snapshot
  createVersion: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        version: z.string(),
        versionTag: z.string().optional(),
        configuration: z.record(z.any()).optional(),
        changes: z.array(z.string()).optional(),
        isStable: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Get current agent state
      const agent = await db.select().from(agentRegistry).where(eq(agentRegistry.id, input.agentId)).limit(1);

      if (!agent[0]) throw new Error("Agent not found");

      await db.insert(agentVersions).values({
        agentId: input.agentId,
        version: input.version,
        versionTag: input.versionTag,
        snapshot: agent[0],
        configuration: input.configuration || {},
        changes: input.changes || [],
        createdBy: ctx.user.id,
        isStable: input.isStable || false,
      } as any);

      return { success: true, version: input.version };
    }),

  // Get version history
  getVersionHistory: protectedProcedure
    .input(z.object({ agentId: z.number(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const versions = await db
        .select()
        .from(agentVersions)
        .where(eq(agentVersions.agentId, input.agentId))
        .orderBy(desc(agentVersions.createdAt))
        .limit(input.limit);

      return versions;
    }),

  // Get specific version
  getVersion: protectedProcedure
    .input(z.object({ versionId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const version = await db.select().from(agentVersions).where(eq(agentVersions.id, input.versionId)).limit(1);

      return version[0] || null;
    }),

  // Compare two versions
  compareVersions: protectedProcedure
    .input(z.object({ version1Id: z.number(), version2Id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const v1 = await db.select().from(agentVersions).where(eq(agentVersions.id, input.version1Id)).limit(1);
      const v2 = await db.select().from(agentVersions).where(eq(agentVersions.id, input.version2Id)).limit(1);

      if (!v1[0] || !v2[0]) throw new Error("Version not found");

      return {
        version1: v1[0],
        version2: v2[0],
        changes: v2[0].changes || [],
      };
    }),

  // Rollback to version
  rollbackToVersion: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        targetVersionId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Get current version
      const currentVersions = await db
        .select()
        .from(agentVersions)
        .where(eq(agentVersions.agentId, input.agentId))
        .orderBy(desc(agentVersions.createdAt))
        .limit(1);

      const targetVersion = await db.select().from(agentVersions).where(eq(agentVersions.id, input.targetVersionId)).limit(1);

      if (!targetVersion[0]) throw new Error("Target version not found");

      // Record rollback
      await db.insert(agentRollbacks).values({
        agentId: input.agentId,
        fromVersion: currentVersions[0]?.version || "unknown",
        toVersion: targetVersion[0].version,
        reason: input.reason,
        performedBy: ctx.user.id,
        status: "completed" as any,
      } as any);

      // Update agent to target version state
      if (targetVersion[0].snapshot) {
        await db
          .update(agentRegistry)
          .set({
            configuration: targetVersion[0].configuration,
            updatedAt: new Date(),
          })
          .where(eq(agentRegistry.id, input.agentId));
      }

      return { success: true };
    }),

  // Get rollback history
  getRollbackHistory: protectedProcedure
    .input(z.object({ agentId: z.number(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const rollbacks = await db
        .select()
        .from(agentRollbacks)
        .where(eq(agentRollbacks.agentId, input.agentId))
        .orderBy(desc(agentRollbacks.createdAt))
        .limit(input.limit);

      return rollbacks;
    }),

  // Tag version as stable
  tagVersionAsStable: protectedProcedure
    .input(z.object({ versionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.update(agentVersions).set({ isStable: true }).where(eq(agentVersions.id, input.versionId));

      return { success: true };
    }),

  // Get stable versions
  getStableVersions: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const versions = await db
        .select()
        .from(agentVersions)
        .where(eq(agentVersions.agentId, input.agentId))
        .orderBy(desc(agentVersions.createdAt));

      return versions.filter((v: any) => v.isStable);
    }),

  // Get version statistics
  getVersionStats: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const versions = await db.select().from(agentVersions).where(eq(agentVersions.agentId, input.agentId));

      const rollbacks = await db.select().from(agentRollbacks).where(eq(agentRollbacks.agentId, input.agentId));

      return {
        totalVersions: versions.length,
        stableVersions: versions.filter((v: any) => v.isStable).length,
        totalRollbacks: rollbacks.length,
        lastVersion: versions[0]?.version || "unknown",
      };
    }),
});
