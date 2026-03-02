import { getDb } from "../db";
import type { RockinBoogieContent, InsertRockinBoogieContent } from "../../drizzle/schema";
import { rockinBoogieContent, contentListenerHistory } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export async function listContent(userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(rockinBoogieContent)
    .where(eq(rockinBoogieContent.userId, userId));
}

export async function getContent(id: number, userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(rockinBoogieContent)
    .where(
      and(
        eq(rockinBoogieContent.id, id),
        eq(rockinBoogieContent.userId, userId)
      )
    )
    .then((rows: any[]) => rows[0]);
}

export async function createContent(
  userId: number,
  data: {
    title: string;
    type: "radio" | "podcast" | "audiobook";
    description?: string;
    status?: "active" | "scheduled" | "archived";
    listeners?: number;
    duration?: string;
    schedule?: string;
    rating?: number;
    contentUrl?: string;
    thumbnailUrl?: string;
    metadata?: Record<string, any>;
  }
) {
  const db = await requireDb();
  const result = await db.insert(rockinBoogieContent).values({
    userId,
    title: data.title,
    type: data.type,
    description: data.description,
    status: data.status || "active",
    listeners: data.listeners || 0,
    duration: data.duration,
    schedule: data.schedule,
    rating: data.rating ? data.rating.toString() : "0",
    contentUrl: data.contentUrl,
    thumbnailUrl: data.thumbnailUrl,
    metadata: data.metadata,
  });

  return result;
}

export async function updateContent(
  id: number,
  userId: number,
  data: Partial<{
    title: string;
    description: string;
    status: "active" | "scheduled" | "archived";
    listeners: number;
    duration: string;
    schedule: string;
    rating: number;
    contentUrl: string;
    thumbnailUrl: string;
    metadata: Record<string, any>;
  }>
) {
  const db = await requireDb();
  const updateData: any = { ...data };
  if (data.rating !== undefined) {
    updateData.rating = data.rating.toString();
  }
  return await db
    .update(rockinBoogieContent)
    .set(updateData)
    .where(
      and(
        eq(rockinBoogieContent.id, id),
        eq(rockinBoogieContent.userId, userId)
      )
    );
}

export async function deleteContent(id: number, userId: number) {
  const db = await requireDb();
  return await db
    .delete(rockinBoogieContent)
    .where(
      and(
        eq(rockinBoogieContent.id, id),
        eq(rockinBoogieContent.userId, userId)
      )
    );
}

export async function getContentMetrics(id: number, userId: number) {
  const db = await requireDb();
  const content = await getContent(id, userId);
  if (!content) return null;

  const history = await db
    .select()
    .from(contentListenerHistory)
    .where(eq(contentListenerHistory.contentId, id))
    .orderBy((t: any) => t.timestamp);

  return {
    ...content,
    history,
  };
}

export async function recordListenerUpdate(
  contentId: number,
  listenerCount: number,
  engagementScore: number
) {
  const db = await requireDb();
  return await db.insert(contentListenerHistory).values({
    contentId,
    listenerCount,
    engagementScore: engagementScore.toString(),
  });
}

export async function getActiveContent(userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(rockinBoogieContent)
    .where(
      and(
        eq(rockinBoogieContent.userId, userId),
        eq(rockinBoogieContent.status, "active")
      )
    );
}

export async function getTotalListeners(userId: number) {
  const contents = await listContent(userId);
  return contents.reduce((sum: number, c: any) => sum + (c.listeners || 0), 0);
}
