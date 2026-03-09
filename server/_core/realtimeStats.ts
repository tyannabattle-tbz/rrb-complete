/**
 * Centralized Real-Time Stats Service
 * 
 * Single source of truth for all listener, channel, and platform metrics.
 * All routers and pages should pull from here instead of hardcoding numbers.
 */
import { getDb } from "../db";
import { sql } from "drizzle-orm";

function extractRows(result: any): any[] {
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0];
  }
  return Array.isArray(result) ? result : [];
}

export interface ChannelStats {
  id: number;
  name: string;
  genre: string;
  frequency: number;
  currentListeners: number;
  totalListeners: number;
  status: string;
  streamUrl: string | null;
}

export interface PlatformStats {
  activeListeners: number;
  totalListenersAllTime: number;
  activeChannels: number;
  totalChannels: number;
  peakListenersToday: number;
  avgSessionDurationSeconds: number;
  hourlyEvents: number;
  dailyEvents: number;
  uniqueSessions: number;
  topChannels: { channelId: number; channelName: string; listeners: number }[];
  deviceBreakdown: { device: string; count: number }[];
  regionBreakdown: { region: string; count: number }[];
  channels: ChannelStats[];
}

/**
 * Get comprehensive platform stats from real database tables.
 * This is the ONLY function that should be used for listener/channel metrics.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const db = await getDb();
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  const oneDayAgo = now - 86400000;

  // Get all active channels with current listeners
  const channelRows = extractRows(
    await db.execute(
      sql`SELECT id, name, genre, frequency, currentListeners, totalListeners, status, streamUrl 
          FROM radio_channels WHERE status = 'active' ORDER BY currentListeners DESC`
    )
  );

  const channels: ChannelStats[] = channelRows.map((r: any) => ({
    id: r.id,
    name: r.name,
    genre: r.genre || 'General',
    frequency: r.frequency || 432,
    currentListeners: Number(r.currentListeners) || 0,
    totalListeners: Number(r.totalListeners) || 0,
    status: r.status,
    streamUrl: r.streamUrl || null,
  }));

  const activeListeners = channels.reduce((sum, ch) => sum + ch.currentListeners, 0);
  const totalListenersAllTime = channels.reduce((sum, ch) => sum + ch.totalListeners, 0);
  const activeChannels = channels.filter(ch => ch.status === 'active').length;

  // Hourly analytics from listener_analytics
  const hourlyRows = extractRows(
    await db.execute(
      sql`SELECT COUNT(*) as cnt FROM listener_analytics WHERE created_at >= ${oneHourAgo}`
    )
  );
  const hourlyEvents = Number(hourlyRows[0]?.cnt) || 0;

  // Daily analytics
  const dailyRows = extractRows(
    await db.execute(
      sql`SELECT COUNT(*) as cnt FROM listener_analytics WHERE created_at >= ${oneDayAgo}`
    )
  );
  const dailyEvents = Number(dailyRows[0]?.cnt) || 0;

  // Unique sessions (unique channel_id + hour combinations today)
  const sessionRows = extractRows(
    await db.execute(
      sql`SELECT COALESCE(SUM(listener_count), 0) as total FROM listener_analytics WHERE created_at >= ${oneDayAgo}`
    )
  );
  const uniqueSessions = Number(sessionRows[0]?.total) || 0;

  // Peak listeners today
  const peakRows = extractRows(
    await db.execute(
      sql`SELECT COALESCE(MAX(peak_listeners), 0) as peak FROM listener_analytics WHERE created_at >= ${oneDayAgo}`
    )
  );
  const peakListenersToday = Number(peakRows[0]?.peak) || 0;

  // Avg session duration
  const avgRows = extractRows(
    await db.execute(
      sql`SELECT COALESCE(AVG(session_duration_seconds), 0) as avg_dur FROM listener_analytics WHERE created_at >= ${oneDayAgo}`
    )
  );
  const avgSessionDurationSeconds = Math.round(Number(avgRows[0]?.avg_dur) || 0);

  // Top channels by listener count today
  const topChannelRows = extractRows(
    await db.execute(
      sql`SELECT channel_id as channelId, channel_name as channelName, SUM(listener_count) as listeners 
          FROM listener_analytics WHERE created_at >= ${oneDayAgo} 
          GROUP BY channel_id, channel_name ORDER BY listeners DESC LIMIT 7`
    )
  );
  const topChannels = topChannelRows.map((r: any) => ({
    channelId: Number(r.channelId),
    channelName: r.channelName,
    listeners: Number(r.listeners) || 0,
  }));

  // Device breakdown
  const deviceRows = extractRows(
    await db.execute(
      sql`SELECT device_type as device, COUNT(*) as cnt FROM listener_analytics 
          WHERE created_at >= ${oneDayAgo} GROUP BY device_type ORDER BY cnt DESC`
    )
  );
  const deviceBreakdown = deviceRows.map((r: any) => ({
    device: r.device || 'unknown',
    count: Number(r.cnt) || 0,
  }));

  // Region breakdown
  const regionRows = extractRows(
    await db.execute(
      sql`SELECT geo_region as region, COUNT(*) as cnt FROM listener_analytics 
          WHERE created_at >= ${oneDayAgo} GROUP BY geo_region ORDER BY cnt DESC`
    )
  );
  const regionBreakdown = regionRows.map((r: any) => ({
    region: r.region || 'Unknown',
    count: Number(r.cnt) || 0,
  }));

  return {
    activeListeners,
    totalListenersAllTime,
    activeChannels,
    totalChannels: channels.length,
    peakListenersToday,
    avgSessionDurationSeconds,
    hourlyEvents,
    dailyEvents,
    uniqueSessions,
    topChannels,
    deviceBreakdown,
    regionBreakdown,
    channels,
  };
}

/**
 * Record a listener event (tune-in, tune-out, heartbeat)
 */
export async function recordListenerEvent(params: {
  channelId: number;
  channelName: string;
  listenerCount?: number;
  geoRegion?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'smart_speaker' | 'other';
  sessionDurationSeconds?: number;
}) {
  const db = await getDb();
  const now = Date.now();
  const date = new Date(now);
  
  await db.execute(
    sql`INSERT INTO listener_analytics (channel_id, channel_name, listener_count, peak_listeners, geo_region, device_type, session_duration_seconds, timestamp, hour_of_day, day_of_week, created_at)
        VALUES (${params.channelId}, ${params.channelName}, ${params.listenerCount || 1}, ${params.listenerCount || 1}, ${params.geoRegion || 'Unknown'}, ${params.deviceType || 'other'}, ${params.sessionDurationSeconds || 0}, ${now}, ${date.getHours()}, ${date.getDay()}, ${now})`
  );

  // Increment current listeners on the channel
  await db.execute(
    sql`UPDATE radio_channels SET currentListeners = currentListeners + 1, totalListeners = totalListeners + 1 WHERE id = ${params.channelId}`
  );
}

/**
 * Decrement listener count when someone tunes out
 */
export async function decrementListener(channelId: number) {
  const db = await getDb();
  await db.execute(
    sql`UPDATE radio_channels SET currentListeners = GREATEST(0, currentListeners - 1) WHERE id = ${channelId}`
  );
}
