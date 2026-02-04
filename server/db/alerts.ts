import { getDb } from "../db";
import { emergencyAlerts, alertDeliveryLog } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export async function listAlerts(userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(emergencyAlerts)
    .where(eq(emergencyAlerts.userId, userId));
}

export async function getAlert(id: number, userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(emergencyAlerts)
    .where(
      and(
        eq(emergencyAlerts.id, id),
        eq(emergencyAlerts.userId, userId)
      )
    )
    .then((rows: any[]) => rows[0]);
}

export async function createAlert(
  userId: number,
  data: {
    title: string;
    message: string;
    severity: "critical" | "high" | "medium" | "low";
    regions: string[];
    status?: "draft" | "scheduled" | "active" | "completed";
    recipients?: number;
    deliveryRate?: number;
    scheduledFor?: Date;
  }
) {
  const db = await requireDb();
  return await db.insert(emergencyAlerts).values({
    userId,
    title: data.title,
    message: data.message,
    severity: data.severity,
    broadcastChannelIds: JSON.stringify(data.regions || []),
    status: data.status || "draft",
    recipients: data.recipients || 0,
    deliveryRate: data.deliveryRate ? data.deliveryRate.toString() : "0",
    scheduledFor: data.scheduledFor,
  });
}

export async function updateAlert(
  id: number,
  userId: number,
  data: Partial<{
    title: string;
    message: string;
    severity: "critical" | "high" | "medium" | "low";
    regions: string[];
    status: "draft" | "scheduled" | "active" | "completed";
    recipients: number;
    deliveryRate: number;
    scheduledFor: Date;
    completedAt: Date;
  }>
) {
  const db = await requireDb();
  const updateData: any = { ...data };
  if (data.regions) {
    updateData.regions = JSON.stringify(data.regions);
  }
  if (data.deliveryRate !== undefined) {
    updateData.deliveryRate = data.deliveryRate.toString();
  }
  return await db
    .update(emergencyAlerts)
    .set(updateData)
    .where(
      and(
        eq(emergencyAlerts.id, id),
        eq(emergencyAlerts.userId, userId)
      )
    );
}

export async function deleteAlert(id: number, userId: number) {
  const db = await requireDb();
  return await db
    .delete(emergencyAlerts)
    .where(
      and(
        eq(emergencyAlerts.id, id),
        eq(emergencyAlerts.userId, userId)
      )
    );
}

export async function getActiveAlerts(userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(emergencyAlerts)
    .where(
      and(
        eq(emergencyAlerts.userId, userId),
        eq(emergencyAlerts.status, "active")
      )
    );
}

export async function recordDelivery(
  alertId: number,
  nodeId: number | null,
  region: string,
  status: "pending" | "delivered" | "failed",
  recipientsReached: number,
  error?: string
) {
  const db = await requireDb();
  return await db.insert(alertDeliveryLog).values({
    alertId,
    nodeId,
    region,
    status,
    recipientsReached,
    error,
    deliveredAt: status === "delivered" ? new Date() : null,
  });
}

export async function getDeliveryLog(alertId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(alertDeliveryLog)
    .where(eq(alertDeliveryLog.alertId, alertId));
}

export async function getAlertMetrics(id: number, userId: number) {
  const db = await requireDb();
  const alert = await getAlert(id, userId);
  if (!alert) return null;

  const deliveryLog = await getDeliveryLog(id);
  const totalDelivered = deliveryLog.filter(
    (log: any) => log.status === "delivered"
  ).length;
  const totalFailed = deliveryLog.filter(
    (log: any) => log.status === "failed"
  ).length;

  return {
    ...alert,
    deliveryLog,
    totalDelivered,
    totalFailed,
    successRate: deliveryLog.length > 0 
      ? ((totalDelivered / deliveryLog.length) * 100).toFixed(2)
      : 0,
  };
}
