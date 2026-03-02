import { getDb } from "../db";
import { analyticsMetrics, policyDecisions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export async function listMetrics(userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(analyticsMetrics)
    .where(eq(analyticsMetrics.userId, userId));
}

export async function getMetrics(period: string, userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(analyticsMetrics)
    .where(
      eq(analyticsMetrics.userId, userId) &&
      eq(analyticsMetrics.period, period)
    )
    .then((rows: any[]) => rows[0]);
}

export async function createMetrics(
  userId: number,
  data: {
    period: string;
    qumusDecisions?: number;
    hybridCastBroadcasts?: number;
    rockinBoogieListeners?: number;
    avgEngagement?: number;
    systemUptime?: number;
  }
) {
  const db = await requireDb();
  return await db.insert(analyticsMetrics).values({
    userId,
    period: data.period,
    qumusDecisions: data.qumusDecisions || 0,
    hybridCastBroadcasts: data.hybridCastBroadcasts || 0,
    rockinBoogieListeners: data.rockinBoogieListeners || 0,
    avgEngagement: data.avgEngagement ? data.avgEngagement.toString() : "0",
    systemUptime: data.systemUptime ? data.systemUptime.toString() : "100",
  });
}

export async function updateMetrics(
  period: string,
  userId: number,
  data: Partial<{
    qumusDecisions: number;
    hybridCastBroadcasts: number;
    rockinBoogieListeners: number;
    avgEngagement: number;
    systemUptime: number;
  }>
) {
  const db = await requireDb();
  const updateData: any = { ...data };
  if (data.avgEngagement !== undefined) {
    updateData.avgEngagement = data.avgEngagement.toString();
  }
  if (data.systemUptime !== undefined) {
    updateData.systemUptime = data.systemUptime.toString();
  }
  return await db
    .update(analyticsMetrics)
    .set(updateData)
    .where(
      eq(analyticsMetrics.userId, userId) &&
      eq(analyticsMetrics.period, period)
    );
}

export async function listPolicyDecisions(userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(policyDecisions)
    .where(eq(policyDecisions.userId, userId));
}

export async function getPolicyDecision(policy: string, userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(policyDecisions)
    .where(
      eq(policyDecisions.userId, userId) &&
      eq(policyDecisions.policy, policy)
    )
    .then((rows: any[]) => rows[0]);
}

export async function createPolicyDecision(
  userId: number,
  data: {
    policy: string;
    count?: number;
    avgTime?: number;
    successRate?: number;
    metadata?: Record<string, any>;
  }
) {
  const db = await requireDb();
  return await db.insert(policyDecisions).values({
    userId,
    policy: data.policy,
    count: data.count || 0,
    avgTime: data.avgTime || 0,
    successRate: data.successRate ? data.successRate.toString() : "0",
    metadata: data.metadata,
  });
}

export async function updatePolicyDecision(
  policy: string,
  userId: number,
  data: Partial<{
    count: number;
    avgTime: number;
    successRate: number;
    metadata: Record<string, any>;
  }>
) {
  const db = await requireDb();
  const updateData: any = { ...data };
  if (data.successRate !== undefined) {
    updateData.successRate = data.successRate.toString();
  }
  return await db
    .update(policyDecisions)
    .set(updateData)
    .where(
      eq(policyDecisions.userId, userId) &&
      eq(policyDecisions.policy, policy)
    );
}

export async function getAggregateMetrics(userId: number) {
  const metrics = await listMetrics(userId);
  const policies = await listPolicyDecisions(userId);

  const totalQumusDecisions = metrics.reduce(
    (sum: number, m: any) => sum + (m.qumusDecisions || 0),
    0
  );
  const totalBroadcasts = metrics.reduce(
    (sum: number, m: any) => sum + (m.hybridCastBroadcasts || 0),
    0
  );
  const totalListeners = metrics.reduce(
    (sum: number, m: any) => sum + (m.rockinBoogieListeners || 0),
    0
  );
  const avgEngagement =
    metrics.length > 0
      ? (
          metrics.reduce((sum: number, m: any) => {
            const eng = typeof m.avgEngagement === "string"
              ? parseFloat(m.avgEngagement)
              : m.avgEngagement || 0;
            return sum + eng;
          }, 0) / metrics.length
        ).toFixed(2)
      : 0;

  const avgUptime =
    metrics.length > 0
      ? (
          metrics.reduce((sum: number, m: any) => {
            const uptime = typeof m.systemUptime === "string"
              ? parseFloat(m.systemUptime)
              : m.systemUptime || 100;
            return sum + uptime;
          }, 0) / metrics.length
        ).toFixed(2)
      : 100;

  const avgPolicySuccessRate =
    policies.length > 0
      ? (
          policies.reduce((sum: number, p: any) => {
            const rate = typeof p.successRate === "string"
              ? parseFloat(p.successRate)
              : p.successRate || 0;
            return sum + rate;
          }, 0) / policies.length
        ).toFixed(2)
      : 0;

  return {
    totalQumusDecisions,
    totalBroadcasts,
    totalListeners,
    avgEngagement,
    avgUptime,
    avgPolicySuccessRate,
    metricsCount: metrics.length,
    policiesCount: policies.length,
  };
}
