import { getDb } from "../db";
import { hybridCastNodes } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export async function listNodes(userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(hybridCastNodes)
    .where(eq(hybridCastNodes.userId, userId));
}

export async function getNode(id: number, userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(hybridCastNodes)
    .where(
      eq(hybridCastNodes.id, id) &&
      eq(hybridCastNodes.userId, userId)
    )
    .then((rows: any[]) => rows[0]);
}

export async function createNode(
  userId: number,
  data: {
    name: string;
    region: string;
    status?: "ready" | "broadcasting" | "offline";
    coverage?: number;
    endpoint?: string;
    metadata?: Record<string, any>;
  }
) {
  const db = await requireDb();
  return await db.insert(hybridCastNodes).values({
    userId,
    name: data.name,
    region: data.region,
    status: data.status || "ready",
    coverage: data.coverage ? data.coverage.toString() : "0",
    endpoint: data.endpoint,
    metadata: data.metadata,
    lastHealthCheck: new Date(),
  });
}

export async function updateNode(
  id: number,
  userId: number,
  data: Partial<{
    name: string;
    region: string;
    status: "ready" | "broadcasting" | "offline";
    coverage: number;
    endpoint: string;
    metadata: Record<string, any>;
    lastHealthCheck: Date;
  }>
) {
  const db = await requireDb();
  const updateData: any = { ...data };
  if (data.coverage !== undefined) {
    updateData.coverage = data.coverage.toString();
  }
  if (data.lastHealthCheck === undefined) {
    updateData.lastHealthCheck = new Date();
  }
  return await db
    .update(hybridCastNodes)
    .set(updateData)
    .where(
      eq(hybridCastNodes.id, id) &&
      eq(hybridCastNodes.userId, userId)
    );
}

export async function deleteNode(id: number, userId: number) {
  const db = await requireDb();
  return await db
    .delete(hybridCastNodes)
    .where(
      eq(hybridCastNodes.id, id) &&
      eq(hybridCastNodes.userId, userId)
    );
}

export async function getReadyNodes(userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(hybridCastNodes)
    .where(
      eq(hybridCastNodes.userId, userId) &&
      eq(hybridCastNodes.status, "ready")
    );
}

export async function getBroadcastingNodes(userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(hybridCastNodes)
    .where(
      eq(hybridCastNodes.userId, userId) &&
      eq(hybridCastNodes.status, "broadcasting")
    );
}

export async function updateNodeStatus(
  id: number,
  userId: number,
  status: "ready" | "broadcasting" | "offline"
) {
  return await updateNode(id, userId, {
    status,
    lastHealthCheck: new Date(),
  });
}

export async function getTotalCoverage(userId: number) {
  const nodes = await listNodes(userId);
  const totalCoverage = nodes.reduce((sum: number, node: any) => {
    const coverage = typeof node.coverage === "string" 
      ? parseFloat(node.coverage) 
      : node.coverage || 0;
    return sum + coverage;
  }, 0);
  return totalCoverage;
}
