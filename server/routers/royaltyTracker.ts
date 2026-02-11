import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  royaltyProjects,
  royaltyCollaborators,
  royaltyPayments,
  royaltyDistributions,
  royaltyStatements,
  users,
} from "../../drizzle/schema";
import { eq, and, desc, sql, sum } from "drizzle-orm";

export const royaltyTrackerRouter = router({
  // ===== PROJECTS =====

  listProjects: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const userId = ctx.user.id;

    const created = await db
      .select()
      .from(royaltyProjects)
      .where(eq(royaltyProjects.createdBy, userId))
      .orderBy(desc(royaltyProjects.updatedAt));

    const collabRows = await db
      .select({ project: royaltyProjects, collaborator: royaltyCollaborators })
      .from(royaltyCollaborators)
      .innerJoin(royaltyProjects, eq(royaltyCollaborators.projectId, royaltyProjects.id))
      .where(eq(royaltyCollaborators.userId, userId))
      .orderBy(desc(royaltyProjects.updatedAt));

    const allProjects = [...created];
    for (const p of collabRows.map((r) => r.project)) {
      if (!allProjects.find((x) => x.id === p.id)) allProjects.push(p);
    }
    return allProjects;
  }),

  getProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [project] = await db.select().from(royaltyProjects).where(eq(royaltyProjects.id, input.projectId));
      if (!project) return null;

      const collaborators = await db
        .select({ collaborator: royaltyCollaborators, userName: users.name })
        .from(royaltyCollaborators)
        .leftJoin(users, eq(royaltyCollaborators.userId, users.id))
        .where(eq(royaltyCollaborators.projectId, input.projectId))
        .orderBy(desc(royaltyCollaborators.splitPercentage));

      return {
        ...project,
        collaborators: collaborators.map((c) => ({ ...c.collaborator, registeredName: c.userName })),
      };
    }),

  createProject: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        projectType: z.enum(["single", "album", "ep", "compilation", "soundtrack", "podcast", "commercial", "other"]).default("single"),
        releaseDate: z.string().optional(),
        isrcCode: z.string().max(20).optional(),
        upcCode: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(royaltyProjects).values({
        title: input.title,
        description: input.description || null,
        projectType: input.projectType,
        releaseDate: input.releaseDate || null,
        isrcCode: input.isrcCode || null,
        upcCode: input.upcCode || null,
        createdBy: ctx.user.id,
        status: "draft",
      });

      const projectId = result.insertId;

      await db.insert(royaltyCollaborators).values({
        projectId,
        userId: ctx.user.id,
        artistName: ctx.user.name || "Project Owner",
        role: "artist",
        splitPercentage: "100.00",
        email: ctx.user.email || null,
        isRegistered: true,
        inviteStatus: "accepted",
      });

      return { id: projectId };
    }),

  updateProject: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        projectType: z.enum(["single", "album", "ep", "compilation", "soundtrack", "podcast", "commercial", "other"]).optional(),
        releaseDate: z.string().optional(),
        isrcCode: z.string().max(20).optional(),
        upcCode: z.string().max(20).optional(),
        status: z.enum(["draft", "active", "completed", "archived"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { projectId, ...updates } = input;
      const [project] = await db.select().from(royaltyProjects)
        .where(and(eq(royaltyProjects.id, projectId), eq(royaltyProjects.createdBy, ctx.user.id)));
      if (!project) throw new Error("Project not found or access denied");

      const cleanUpdates: Record<string, any> = {};
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) cleanUpdates[k] = v;
      }
      if (Object.keys(cleanUpdates).length > 0) {
        await db.update(royaltyProjects).set(cleanUpdates).where(eq(royaltyProjects.id, projectId));
      }
      return { success: true };
    }),

  // ===== COLLABORATORS =====

  addCollaborator: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        artistName: z.string().min(1).max(255),
        role: z.enum(["artist", "producer", "songwriter", "engineer", "featured", "session_musician", "other"]).default("artist"),
        splitPercentage: z.number().min(0).max(100),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [project] = await db.select().from(royaltyProjects)
        .where(and(eq(royaltyProjects.id, input.projectId), eq(royaltyProjects.createdBy, ctx.user.id)));
      if (!project) throw new Error("Project not found or access denied");

      const existingSplits = await db
        .select({ total: sum(royaltyCollaborators.splitPercentage) })
        .from(royaltyCollaborators)
        .where(eq(royaltyCollaborators.projectId, input.projectId));

      const currentTotal = parseFloat(existingSplits[0]?.total || "0");
      if (currentTotal + input.splitPercentage > 100) {
        throw new Error(`Total splits would be ${(currentTotal + input.splitPercentage).toFixed(2)}%. Maximum is 100%.`);
      }

      let matchedUserId: number | null = null;
      if (input.email) {
        const [matchedUser] = await db.select().from(users).where(eq(users.email, input.email));
        if (matchedUser) matchedUserId = matchedUser.id;
      }

      const [result] = await db.insert(royaltyCollaborators).values({
        projectId: input.projectId,
        userId: matchedUserId,
        artistName: input.artistName,
        role: input.role,
        splitPercentage: input.splitPercentage.toFixed(2),
        email: input.email || null,
        isRegistered: !!matchedUserId,
        inviteStatus: matchedUserId ? "accepted" : "pending",
      });

      return { id: result.insertId };
    }),

  updateCollaborator: protectedProcedure
    .input(
      z.object({
        collaboratorId: z.number(),
        splitPercentage: z.number().min(0).max(100).optional(),
        role: z.enum(["artist", "producer", "songwriter", "engineer", "featured", "session_musician", "other"]).optional(),
        artistName: z.string().min(1).max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { collaboratorId, ...updates } = input;
      const [collab] = await db.select().from(royaltyCollaborators).where(eq(royaltyCollaborators.id, collaboratorId));
      if (!collab) throw new Error("Collaborator not found");

      const [project] = await db.select().from(royaltyProjects)
        .where(and(eq(royaltyProjects.id, collab.projectId), eq(royaltyProjects.createdBy, ctx.user.id)));
      if (!project) throw new Error("Access denied");

      const cleanUpdates: Record<string, any> = {};
      if (updates.splitPercentage !== undefined) cleanUpdates.splitPercentage = updates.splitPercentage.toFixed(2);
      if (updates.role) cleanUpdates.role = updates.role;
      if (updates.artistName) cleanUpdates.artistName = updates.artistName;

      if (Object.keys(cleanUpdates).length > 0) {
        await db.update(royaltyCollaborators).set(cleanUpdates).where(eq(royaltyCollaborators.id, collaboratorId));
      }
      return { success: true };
    }),

  removeCollaborator: protectedProcedure
    .input(z.object({ collaboratorId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [collab] = await db.select().from(royaltyCollaborators).where(eq(royaltyCollaborators.id, input.collaboratorId));
      if (!collab) throw new Error("Collaborator not found");

      const [project] = await db.select().from(royaltyProjects)
        .where(and(eq(royaltyProjects.id, collab.projectId), eq(royaltyProjects.createdBy, ctx.user.id)));
      if (!project) throw new Error("Access denied");

      await db.delete(royaltyCollaborators).where(eq(royaltyCollaborators.id, input.collaboratorId));
      return { success: true };
    }),

  // ===== PAYMENTS =====

  recordPayment: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        source: z.string().min(1).max(255),
        sourceType: z.enum(["streaming", "download", "sync_license", "performance", "mechanical", "merch", "other"]).default("streaming"),
        grossAmount: z.number().min(0),
        netAmount: z.number().min(0),
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
        statementRef: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [project] = await db.select().from(royaltyProjects)
        .where(and(eq(royaltyProjects.id, input.projectId), eq(royaltyProjects.createdBy, ctx.user.id)));
      if (!project) throw new Error("Project not found or access denied");

      const [paymentResult] = await db.insert(royaltyPayments).values({
        projectId: input.projectId,
        source: input.source,
        sourceType: input.sourceType,
        grossAmount: input.grossAmount.toFixed(2),
        netAmount: input.netAmount.toFixed(2),
        periodStart: input.periodStart || null,
        periodEnd: input.periodEnd || null,
        statementRef: input.statementRef || null,
        notes: input.notes || null,
        recordedBy: ctx.user.id,
      });

      const paymentId = paymentResult.insertId;

      const collaborators = await db.select().from(royaltyCollaborators)
        .where(eq(royaltyCollaborators.projectId, input.projectId));

      for (const collab of collaborators) {
        const splitPct = parseFloat(collab.splitPercentage);
        const amount = (input.netAmount * splitPct) / 100;
        await db.insert(royaltyDistributions).values({
          paymentId,
          collaboratorId: collab.id,
          amount: amount.toFixed(2),
          splitPercentage: collab.splitPercentage,
          status: "calculated",
        });
      }

      await db.update(royaltyProjects)
        .set({ totalRevenue: sql`${royaltyProjects.totalRevenue} + ${input.netAmount.toFixed(2)}` })
        .where(eq(royaltyProjects.id, input.projectId));

      return { paymentId, distributionsCreated: collaborators.length };
    }),

  listPayments: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return db.select().from(royaltyPayments)
        .where(eq(royaltyPayments.projectId, input.projectId))
        .orderBy(desc(royaltyPayments.createdAt));
    }),

  // ===== MY ROYALTIES (Artist View) =====

  getMyEarnings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const userId = ctx.user.id;

    const myCollabs = await db
      .select({
        collaborator: royaltyCollaborators,
        projectTitle: royaltyProjects.title,
        projectType: royaltyProjects.projectType,
        projectStatus: royaltyProjects.status,
      })
      .from(royaltyCollaborators)
      .innerJoin(royaltyProjects, eq(royaltyCollaborators.projectId, royaltyProjects.id))
      .where(eq(royaltyCollaborators.userId, userId));

    const earnings = [];
    for (const collab of myCollabs) {
      const [totals] = await db
        .select({
          totalEarned: sum(royaltyDistributions.amount),
          totalPaid: sql<string>`COALESCE(SUM(CASE WHEN ${royaltyDistributions.status} = 'paid' THEN ${royaltyDistributions.amount} ELSE 0 END), 0)`,
          totalPending: sql<string>`COALESCE(SUM(CASE WHEN ${royaltyDistributions.status} != 'paid' THEN ${royaltyDistributions.amount} ELSE 0 END), 0)`,
        })
        .from(royaltyDistributions)
        .where(eq(royaltyDistributions.collaboratorId, collab.collaborator.id));

      earnings.push({
        projectTitle: collab.projectTitle,
        projectType: collab.projectType,
        projectStatus: collab.projectStatus,
        role: collab.collaborator.role,
        splitPercentage: collab.collaborator.splitPercentage,
        totalEarned: totals?.totalEarned || "0.00",
        totalPaid: totals?.totalPaid || "0.00",
        totalPending: totals?.totalPending || "0.00",
        collaboratorId: collab.collaborator.id,
        projectId: collab.collaborator.projectId,
      });
    }

    const grandTotal = earnings.reduce((s, e) => s + parseFloat(e.totalEarned || "0"), 0);
    const grandPaid = earnings.reduce((s, e) => s + parseFloat(e.totalPaid || "0"), 0);
    const grandPending = earnings.reduce((s, e) => s + parseFloat(e.totalPending || "0"), 0);

    return {
      earnings,
      summary: {
        totalProjects: earnings.length,
        grandTotal: grandTotal.toFixed(2),
        grandPaid: grandPaid.toFixed(2),
        grandPending: grandPending.toFixed(2),
      },
    };
  }),

  getDistributions: protectedProcedure
    .input(z.object({ collaboratorId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return db
        .select({
          distribution: royaltyDistributions,
          paymentSource: royaltyPayments.source,
          paymentSourceType: royaltyPayments.sourceType,
          paymentGross: royaltyPayments.grossAmount,
          paymentNet: royaltyPayments.netAmount,
          paymentDate: royaltyPayments.createdAt,
        })
        .from(royaltyDistributions)
        .innerJoin(royaltyPayments, eq(royaltyDistributions.paymentId, royaltyPayments.id))
        .where(eq(royaltyDistributions.collaboratorId, input.collaboratorId))
        .orderBy(desc(royaltyPayments.createdAt));
    }),

  markDistributionPaid: protectedProcedure
    .input(z.object({ distributionId: z.number(), transactionRef: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(royaltyDistributions)
        .set({ status: "paid", paidAt: sql`NOW()`, transactionRef: input.transactionRef || null })
        .where(eq(royaltyDistributions.id, input.distributionId));
      return { success: true };
    }),

  // ===== STATEMENTS =====

  generateStatement: protectedProcedure
    .input(z.object({
      collaboratorId: z.number(),
      projectId: z.number(),
      periodStart: z.string(),
      periodEnd: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [totals] = await db
        .select({
          totalEarned: sum(royaltyDistributions.amount),
          totalPaid: sql<string>`COALESCE(SUM(CASE WHEN ${royaltyDistributions.status} = 'paid' THEN ${royaltyDistributions.amount} ELSE 0 END), 0)`,
        })
        .from(royaltyDistributions)
        .innerJoin(royaltyPayments, eq(royaltyDistributions.paymentId, royaltyPayments.id))
        .where(and(
          eq(royaltyDistributions.collaboratorId, input.collaboratorId),
          eq(royaltyPayments.projectId, input.projectId)
        ));

      const totalEarnings = parseFloat(totals?.totalEarned || "0");
      const totalPaid = parseFloat(totals?.totalPaid || "0");
      const balance = totalEarnings - totalPaid;

      const [result] = await db.insert(royaltyStatements).values({
        collaboratorId: input.collaboratorId,
        projectId: input.projectId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        totalEarnings: totalEarnings.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        balance: balance.toFixed(2),
        status: "issued",
      });

      return { statementId: result.insertId, totalEarnings, totalPaid, balance };
    }),

  listStatements: protectedProcedure
    .input(z.object({ collaboratorId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return db
        .select({ statement: royaltyStatements, projectTitle: royaltyProjects.title })
        .from(royaltyStatements)
        .innerJoin(royaltyProjects, eq(royaltyStatements.projectId, royaltyProjects.id))
        .where(eq(royaltyStatements.collaboratorId, input.collaboratorId))
        .orderBy(desc(royaltyStatements.generatedAt));
    }),
});
