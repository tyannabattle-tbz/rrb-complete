import { getDb } from "./db";
import { sql } from "drizzle-orm";

/**
 * RRB Channel Management Database Helpers
 * Handles 40+ channel streaming with fallback logic
 */

export interface RRBChannel {
  id: number;
  name: string;
  description?: string;
  category: string;
  genre?: string;
  artwork?: string;
  isActive: number;
  priority: number;
  listeners: number;
  createdAt: string;
  updatedAt: string;
}

export interface StreamSource {
  id: number;
  channelId: number;
  url: string;
  sourceType: 'soma' | 'icecast' | 'shoutcast' | 'generic' | 'custom';
  priority: number;
  bitrate?: number;
  format?: string;
  isActive: number;
  lastHealthCheck?: string;
  healthStatus: 'healthy' | 'degraded' | 'offline' | 'unknown';
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Frequency {
  id: number;
  frequency: number;
  name: string;
  description?: string;
  solfeggio?: string;
  benefits?: string;
  color?: string;
  isDefault: number;
  isActive: number;
  createdAt: string;
}

// ============ CHANNEL OPERATIONS ============

export async function getAllChannels(): Promise<RRBChannel[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.execute(
    sql`SELECT * FROM rrb_channels WHERE isActive = 1 ORDER BY priority ASC, name ASC`
  );
  return result[0] as RRBChannel[];
}

export async function getChannelById(channelId: number): Promise<RRBChannel | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.execute(
    sql`SELECT * FROM rrb_channels WHERE id = ${channelId}`
  );
  const rows = result[0] as RRBChannel[];
  return rows.length > 0 ? rows[0] : null;
}

export async function searchChannels(query: string): Promise<RRBChannel[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const searchTerm = `%${query}%`;
  const result = await db.execute(
    sql`SELECT * FROM rrb_channels 
        WHERE (name LIKE ${searchTerm} OR description LIKE ${searchTerm} OR genre LIKE ${searchTerm})
        AND isActive = 1
        ORDER BY priority ASC`
  );
  return result[0] as RRBChannel[];
}

export async function getChannelsByCategory(category: string): Promise<RRBChannel[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.execute(
    sql`SELECT * FROM rrb_channels WHERE category = ${category} AND isActive = 1 ORDER BY priority ASC`
  );
  return result[0] as RRBChannel[];
}

export async function createChannel(
  name: string,
  category: string,
  description?: string,
  genre?: string,
  artwork?: string,
  priority: number = 100
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.execute(
    sql`INSERT INTO rrb_channels (name, category, description, genre, artwork, priority, isActive)
        VALUES (${name}, ${category}, ${description || null}, ${genre || null}, ${artwork || null}, ${priority}, 1)`
  );
  return (result[0] as any).insertId;
}

export async function updateChannel(
  channelId: number,
  updates: Partial<RRBChannel>
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    setClauses.push("name = ?");
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    setClauses.push("description = ?");
    values.push(updates.description);
  }
  if (updates.genre !== undefined) {
    setClauses.push("genre = ?");
    values.push(updates.genre);
  }
  if (updates.artwork !== undefined) {
    setClauses.push("artwork = ?");
    values.push(updates.artwork);
  }
  if (updates.priority !== undefined) {
    setClauses.push("priority = ?");
    values.push(updates.priority);
  }
  if (updates.isActive !== undefined) {
    setClauses.push("isActive = ?");
    values.push(updates.isActive);
  }

  if (setClauses.length === 0) return false;

  values.push(channelId);
  const query = `UPDATE rrb_channels SET ${setClauses.join(", ")} WHERE id = ?`;
  
  await db.execute(sql.raw(query, values));
  return true;
}

// ============ STREAM SOURCE OPERATIONS ============

export async function getStreamSourcesForChannel(channelId: number): Promise<StreamSource[]> {
  const result = await db.execute(
    sql`SELECT * FROM rrb_stream_sources 
        WHERE channelId = ${channelId} AND isActive = 1
        ORDER BY priority ASC`
  );
  return result[0] as StreamSource[];
}

export async function getHealthyStreamSource(channelId: number): Promise<StreamSource | null> {
  const result = await db.execute(
    sql`SELECT * FROM rrb_stream_sources 
        WHERE channelId = ${channelId} AND isActive = 1 AND healthStatus = 'healthy'
        ORDER BY priority ASC
        LIMIT 1`
  );
  const rows = result[0] as StreamSource[];
  return rows.length > 0 ? rows[0] : null;
}

export async function getFallbackStreamSource(channelId: number): Promise<StreamSource | null> {
  const result = await db.execute(
    sql`SELECT * FROM rrb_stream_sources 
        WHERE channelId = ${channelId} AND isActive = 1
        ORDER BY CASE 
          WHEN healthStatus = 'healthy' THEN 1
          WHEN healthStatus = 'degraded' THEN 2
          WHEN healthStatus = 'offline' THEN 3
          ELSE 4
        END ASC,
        failureCount ASC,
        priority ASC
        LIMIT 1`
  );
  const rows = result[0] as StreamSource[];
  return rows.length > 0 ? rows[0] : null;
}

export async function addStreamSource(
  channelId: number,
  url: string,
  sourceType: string,
  priority: number = 100,
  bitrate?: number,
  format?: string
): Promise<number> {
  const result = await db.execute(
    sql`INSERT INTO rrb_stream_sources (channelId, url, sourceType, priority, bitrate, format, isActive)
        VALUES (${channelId}, ${url}, ${sourceType}, ${priority}, ${bitrate || null}, ${format || null}, 1)`
  );
  return (result[0] as any).insertId;
}

export async function updateStreamHealth(
  sourceId: number,
  healthStatus: 'healthy' | 'degraded' | 'offline' | 'unknown',
  failureCount?: number
): Promise<boolean> {
  const setClauses = ["healthStatus = ?", "lastHealthCheck = NOW()"];
  const values: any[] = [healthStatus];

  if (failureCount !== undefined) {
    setClauses.push("failureCount = ?");
    values.push(failureCount);
  }

  values.push(sourceId);
  const query = `UPDATE rrb_stream_sources SET ${setClauses.join(", ")} WHERE id = ?`;
  
  await db.execute(sql.raw(query, values));
  return true;
}

// ============ FREQUENCY OPERATIONS ============

export async function getAllFrequencies(): Promise<Frequency[]> {
  const result = await db.execute(
    sql`SELECT * FROM rrb_frequencies WHERE isActive = 1 ORDER BY frequency ASC`
  );
  return result[0] as Frequency[];
}

export async function getDefaultFrequency(): Promise<Frequency | null> {
  const result = await db.execute(
    sql`SELECT * FROM rrb_frequencies WHERE isDefault = 1 AND isActive = 1 LIMIT 1`
  );
  const rows = result[0] as Frequency[];
  return rows.length > 0 ? rows[0] : null;
}

export async function getFrequencyById(frequencyId: number): Promise<Frequency | null> {
  const result = await db.execute(
    sql`SELECT * FROM rrb_frequencies WHERE id = ${frequencyId}`
  );
  const rows = result[0] as Frequency[];
  return rows.length > 0 ? rows[0] : null;
}

// ============ LISTENING HISTORY ============

export async function recordListeningSession(
  userId: number | null,
  channelId: number,
  frequencyId: number | null,
  deviceType?: string,
  userAgent?: string
): Promise<number> {
  const result = await db.execute(
    sql`INSERT INTO rrb_listening_history (userId, channelId, frequencyId, sessionStartTime, deviceType, userAgent)
        VALUES (${userId || null}, ${channelId}, ${frequencyId || null}, NOW(), ${deviceType || null}, ${userAgent || null})`
  );
  return (result[0] as any).insertId;
}

export async function endListeningSession(sessionId: number): Promise<boolean> {
  const result = await db.execute(
    sql`UPDATE rrb_listening_history 
        SET sessionEndTime = NOW(), 
            durationSeconds = TIMESTAMPDIFF(SECOND, sessionStartTime, NOW())
        WHERE id = ${sessionId}`
  );
  return (result[0] as any).affectedRows > 0;
}

export async function getUserListeningHistory(
  userId: number,
  limit: number = 50
): Promise<any[]> {
  const result = await db.execute(
    sql`SELECT h.*, c.name as channelName, f.frequency, f.name as frequencyName
        FROM rrb_listening_history h
        LEFT JOIN rrb_channels c ON h.channelId = c.id
        LEFT JOIN rrb_frequencies f ON h.frequencyId = f.id
        WHERE h.userId = ${userId}
        ORDER BY h.createdAt DESC
        LIMIT ${limit}`
  );
  return result[0] as any[];
}

// ============ CHANNEL STATS ============

export async function getChannelStats(channelId: number, days: number = 7): Promise<any[]> {
  const result = await db.execute(
    sql`SELECT * FROM rrb_channel_stats 
        WHERE channelId = ${channelId} AND date >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
        ORDER BY date DESC`
  );
  return result[0] as any[];
}

export async function updateChannelStats(
  channelId: number,
  totalListeners: number,
  peakListeners: number,
  averageSessionDuration: number,
  totalStreamTime: number,
  uptime: number
): Promise<boolean> {
  const result = await db.execute(
    sql`INSERT INTO rrb_channel_stats (channelId, date, totalListeners, peakListeners, averageSessionDuration, totalStreamTime, uptime)
        VALUES (${channelId}, CURDATE(), ${totalListeners}, ${peakListeners}, ${averageSessionDuration}, ${totalStreamTime}, ${uptime})
        ON DUPLICATE KEY UPDATE
        totalListeners = ${totalListeners},
        peakListeners = GREATEST(peakListeners, ${peakListeners}),
        averageSessionDuration = ${averageSessionDuration},
        totalStreamTime = ${totalStreamTime},
        uptime = ${uptime}`
  );
  return (result[0] as any).affectedRows > 0;
}

// ============ HEALTH CHECK ============

export async function checkStreamHealth(sourceId: number): Promise<boolean> {
  try {
    const source = await db.execute(
      sql`SELECT url FROM rrb_stream_sources WHERE id = ${sourceId}`
    );
    const rows = source[0] as any[];
    if (rows.length === 0) return false;

    const { url } = rows[0];
    const response = await fetch(url, { method: 'HEAD', timeout: 5000 }).catch(() => null);
    
    const isHealthy = response && response.ok;
    const status = isHealthy ? 'healthy' : 'offline';
    
    await updateStreamHealth(sourceId, status, isHealthy ? 0 : undefined);
    return isHealthy;
  } catch (error) {
    await updateStreamHealth(sourceId, 'offline');
    return false;
  }
}

export async function checkAllChannelHealth(): Promise<void> {
  const sources = await db.execute(
    sql`SELECT id FROM rrb_stream_sources WHERE isActive = 1`
  );
  
  const rows = sources[0] as any[];
  for (const { id } of rows) {
    await checkStreamHealth(id);
  }
}
