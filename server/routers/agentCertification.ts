import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { agentCertifications, certificationAudits, securityScans } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const agentCertificationRouter = router({
  // Create certification request
  requestCertification: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(agentCertifications).values({
        agentId: input.agentId,
        certificationLevel: "bronze" as any,
        status: "pending" as any,
      } as any);

      return { success: true };
    }),

  // Get certification status
  getCertification: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const cert = await db.select().from(agentCertifications).where(eq(agentCertifications.agentId, input.agentId)).limit(1);

      return cert[0] || null;
    }),

  // Run security scan
  runSecurityScan: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        scanType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Simulate security scan
      const vulnerabilities = [
        { severity: "low", description: "Outdated dependency" },
        { severity: "medium", description: "Missing input validation" },
      ];

      const riskScore = vulnerabilities.length > 0 ? (vulnerabilities.length * 10).toString() : "0";

      await db.insert(securityScans).values({
        agentId: input.agentId,
        scanType: input.scanType,
        vulnerabilities: vulnerabilities as any,
        riskScore: riskScore as any,
        status: vulnerabilities.length > 2 ? ("failed" as any) : ("passed" as any),
      } as any);

      return { success: true, vulnerabilities };
    }),

  // Get security scan results
  getSecurityScans: protectedProcedure
    .input(z.object({ agentId: z.number(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const scans = await db
        .select()
        .from(securityScans)
        .where(eq(securityScans.agentId, input.agentId))
        .orderBy(desc(securityScans.scanDate))
        .limit(input.limit);

      return scans;
    }),

  // Update certification scores
  updateCertificationScores: protectedProcedure
    .input(
      z.object({
        certificationId: z.number(),
        securityScore: z.number(),
        performanceScore: z.number(),
        reliabilityScore: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const trustScore = (input.securityScore + input.performanceScore + input.reliabilityScore) / 3;

      // Determine certification level
      let level = "bronze";
      if (trustScore >= 90) level = "platinum";
      else if (trustScore >= 80) level = "gold";
      else if (trustScore >= 70) level = "silver";

      await db
        .update(agentCertifications)
        .set({
          securityScore: input.securityScore.toString() as any,
          performanceScore: input.performanceScore.toString() as any,
          reliabilityScore: input.reliabilityScore.toString() as any,
          trustScore: trustScore.toString() as any,
          certificationLevel: level as any,
          status: "certified" as any,
          certifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        })
        .where(eq(agentCertifications.id, input.certificationId));

      return { success: true, level, trustScore };
    }),

  // Record audit
  recordAudit: protectedProcedure
    .input(
      z.object({
        certificationId: z.number(),
        auditType: z.string(),
        findings: z.record(z.string(), z.any()),
        issues: z.array(z.string()).optional(),
        recommendations: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(certificationAudits).values({
        certificationId: input.certificationId,
        auditType: input.auditType,
        findings: input.findings,
        issues: input.issues || [],
        recommendations: input.recommendations || [],
        auditorId: ctx.user.id,
      } as any);

      return { success: true };
    }),

  // Get audit history
  getAuditHistory: protectedProcedure
    .input(z.object({ certificationId: z.number(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const audits = await db
        .select()
        .from(certificationAudits)
        .where(eq(certificationAudits.certificationId, input.certificationId))
        .orderBy(desc(certificationAudits.createdAt))
        .limit(input.limit);

      return audits;
    }),

  // Renew certification
  renewCertification: protectedProcedure
    .input(z.object({ certificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(agentCertifications)
        .set({
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          updatedAt: new Date(),
        })
        .where(eq(agentCertifications.id, input.certificationId));

      return { success: true };
    }),

  // Suspend certification
  suspendCertification: protectedProcedure
    .input(
      z.object({
        certificationId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(agentCertifications)
        .set({
          status: "suspended" as any,
          auditNotes: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(agentCertifications.id, input.certificationId));

      return { success: true };
    }),

  // Get certified agents
  getCertifiedAgents: protectedProcedure
    .input(
      z.object({
        level: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const conditions = [eq(agentCertifications.status, "certified" as any)];

      if (input.level) {
        conditions.push(eq(agentCertifications.certificationLevel, input.level as any));
      }

      const certs = await db
        .select()
        .from(agentCertifications)
        .where(and(...conditions))
        .orderBy(desc(agentCertifications.trustScore))
        .limit(input.limit);

      return certs;
    }),

  // Get certification statistics
  getCertificationStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const certs = await db.select().from(agentCertifications);

    const stats = {
      total: certs.length,
      certified: certs.filter((c: any) => c.status === "certified").length,
      pending: certs.filter((c: any) => c.status === "pending").length,
      suspended: certs.filter((c: any) => c.status === "suspended").length,
      byLevel: {
        bronze: certs.filter((c: any) => c.certificationLevel === "bronze").length,
        silver: certs.filter((c: any) => c.certificationLevel === "silver").length,
        gold: certs.filter((c: any) => c.certificationLevel === "gold").length,
        platinum: certs.filter((c: any) => c.certificationLevel === "platinum").length,
      },
    };

    return stats;
  }),
});
