import { getDb } from "../db";
import { radioStations, radioChannels } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

// Radio Stations (Canryn Production Infrastructure)

export async function listRadioStations(userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(radioStations)
    .where(eq(radioStations.userId, userId));
}

export async function getRadioStation(id: number, userId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(radioStations)
    .where(
      eq(radioStations.id, id) &&
      eq(radioStations.userId, userId)
    )
    .then((rows: any[]) => rows[0]);
}

export async function createRadioStation(
  userId: number,
  data: {
    name: string;
    operatorName?: string;
    description?: string;
    status?: "active" | "inactive" | "maintenance";
  }
) {
  const db = await requireDb();
  return await db.insert(radioStations).values({
    userId,
    name: data.name,
    operatorName: data.operatorName || "Canryn Production",
    description: data.description,
    status: data.status || "active",
    totalListeners: 0,
  });
}

export async function updateRadioStation(
  id: number,
  userId: number,
  data: Partial<{
    name: string;
    operatorName: string;
    description: string;
    status: "active" | "inactive" | "maintenance";
    totalListeners: number;
  }>
) {
  const db = await requireDb();
  return await db
    .update(radioStations)
    .set(data)
    .where(
      eq(radioStations.id, id) &&
      eq(radioStations.userId, userId)
    );
}

export async function deleteRadioStation(id: number, userId: number) {
  const db = await requireDb();
  return await db
    .delete(radioStations)
    .where(
      eq(radioStations.id, id) &&
      eq(radioStations.userId, userId)
    );
}

// Radio Channels (Individual channels within stations)

export async function listRadioChannels(stationId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(radioChannels)
    .where(eq(radioChannels.stationId, stationId));
}

export async function getRadioChannel(id: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(radioChannels)
    .where(eq(radioChannels.id, id))
    .then((rows: any[]) => rows[0]);
}

export async function createRadioChannel(
  stationId: number,
  data: {
    name: string;
    frequency?: string;
    genre?: string;
    status?: "active" | "scheduled" | "offline";
    streamUrl?: string;
  }
) {
  const db = await requireDb();
  return await db.insert(radioChannels).values({
    stationId,
    name: data.name,
    frequency: data.frequency,
    genre: data.genre,
    status: data.status || "active",
    currentListeners: 0,
    totalListeners: 0,
    streamUrl: data.streamUrl,
  });
}

export async function updateRadioChannel(
  id: number,
  data: Partial<{
    name: string;
    frequency: string;
    genre: string;
    status: "active" | "scheduled" | "offline";
    currentListeners: number;
    totalListeners: number;
    streamUrl: string;
  }>
) {
  const db = await requireDb();
  return await db
    .update(radioChannels)
    .set(data)
    .where(eq(radioChannels.id, id));
}

export async function deleteRadioChannel(id: number) {
  const db = await requireDb();
  return await db
    .delete(radioChannels)
    .where(eq(radioChannels.id, id));
}

export async function getActiveChannels(stationId: number) {
  const db = await requireDb();
  return await db
    .select()
    .from(radioChannels)
    .where(
      eq(radioChannels.stationId, stationId) &&
      eq(radioChannels.status, "active")
    );
}

export async function getTotalStationListeners(stationId: number) {
  const channels = await listRadioChannels(stationId);
  return channels.reduce((sum: number, ch: any) => sum + (ch.currentListeners || 0), 0);
}
