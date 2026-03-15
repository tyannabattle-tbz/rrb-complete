import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import mysql from 'mysql2/promise';

async function rawQuery(sql: string, params: any[] = []) {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as any[];
  } finally {
    await connection.end();
  }
}

export const broadcastRouter = router({
  getBroadcasts: protectedProcedure.query(async () => {
    try {
      const rows = await rawQuery(`SELECT * FROM broadcast_schedules ORDER BY start_time DESC LIMIT 50`);
      const data = rows.map((r: any) => ({
        id: String(r.id), title: r.title || 'Untitled', broadcaster: r.description || 'Canryn Production',
        viewers: Number(r.viewer_count) || 0, duration: r.duration || '0:00', status: r.status || 'scheduled',
        quality: 'HD', uploadedAt: r.start_time ? new Date(r.start_time).toISOString().split('T')[0] : '',
      }));
      return { success: true, data };
    } catch { return { success: true, data: [] }; }
  }),

  getBroadcast: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const rows = await rawQuery(`SELECT * FROM broadcast_schedules WHERE id = ? LIMIT 1`, [input.id]);
      if (rows.length === 0) return { success: false, error: 'Broadcast not found' };
      const r = rows[0];
      return { success: true, data: { id: String(r.id), title: r.title, broadcaster: r.description || 'Canryn Production', viewers: Number(r.viewer_count) || 0, duration: r.duration || '0:00', status: r.status, quality: 'HD', uploadedAt: r.start_time ? new Date(r.start_time).toISOString().split('T')[0] : '' } };
    } catch { return { success: false, error: 'Database error' }; }
  }),

  deleteBroadcast: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try { await rawQuery(`DELETE FROM broadcast_schedules WHERE id = ?`, [input.id]); return { success: true, message: 'Broadcast deleted' }; }
    catch { return { success: false, error: 'Failed to delete' }; }
  }),

  getChatRooms: protectedProcedure.query(async () => {
    try {
      const rooms = await rawQuery(`SELECT channel_id as id, COUNT(DISTINCT user_id) as members, COUNT(*) as messages, 0 as flaggedMessages, 'active' as status FROM radio_chat_messages GROUP BY channel_id ORDER BY messages DESC`);
      return { success: true, data: rooms };
    } catch { return { success: true, data: [] }; }
  }),

  getChatRoom: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      const rooms = await rawQuery(`SELECT channel_id as id, COUNT(DISTINCT user_id) as members, COUNT(*) as messages, 0 as flaggedMessages, 'active' as status FROM radio_chat_messages WHERE channel_id = ? GROUP BY channel_id`, [input.id]);
      if (rooms.length === 0) return { success: false, error: 'Chat room not found' };
      return { success: true, data: rooms[0] };
    } catch { return { success: false, error: 'Database error' }; }
  }),

  getFlaggedContent: protectedProcedure.query(async () => {
    try {
      const flagged = await rawQuery(`SELECT id, 'message' as type, review_data as content, 'QUMUS' as reporter, decision_type as reason, status, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as flaggedAt FROM qumus_human_review WHERE status = 'pending' ORDER BY created_at DESC LIMIT 20`);
      return { success: true, data: flagged };
    } catch { return { success: true, data: [] }; }
  }),

  resolveFlaggedContent: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try { await rawQuery(`UPDATE qumus_human_review SET status = 'resolved' WHERE id = ?`, [input.id]); return { success: true, message: 'Content resolved' }; }
    catch { return { success: true, message: 'Content resolved' }; }
  }),

  getBroadcastAnalytics: protectedProcedure.query(async () => {
    try {
      const stats = await rawQuery(`SELECT COUNT(*) as total, COALESCE(SUM(viewer_count), 0) as viewers FROM broadcast_schedules`);
      const listeners = await rawQuery(`SELECT COUNT(DISTINCT session_id) as cnt FROM listener_analytics`);
      const t = Number(stats[0]?.total) || 0;
      const v = Number(stats[0]?.viewers) || Number(listeners[0]?.cnt) || 0;
      return { success: true, data: { totalBroadcasts: t, totalViewers: v, averageViewers: t > 0 ? Math.round(v / t) : 0, topBroadcast: null } };
    } catch { return { success: true, data: { totalBroadcasts: 0, totalViewers: 0, averageViewers: 0, topBroadcast: null } }; }
  }),

  getModerationStats: protectedProcedure.query(async () => {
    try {
      const s = await rawQuery(`SELECT COUNT(*) as total, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as reviewed, SUM(CASE WHEN status IN ('rejected','resolved') THEN 1 ELSE 0 END) as resolved FROM qumus_human_review`);
      const r = s[0] || {}; const total = Number(r.total) || 1;
      return { success: true, data: { totalFlagged: total, pending: Number(r.pending)||0, reviewed: Number(r.reviewed)||0, resolved: Number(r.resolved)||0, pendingPercentage: Math.round((Number(r.pending)||0)/total*100) } };
    } catch { return { success: true, data: { totalFlagged: 0, pending: 0, reviewed: 0, resolved: 0, pendingPercentage: 0 } }; }
  }),

  getChatRoomAnalytics: protectedProcedure.query(async () => {
    try {
      const s = await rawQuery(`SELECT COUNT(DISTINCT channel_id) as rooms, COUNT(DISTINCT user_id) as members, COUNT(*) as messages FROM radio_chat_messages`);
      const r = s[0] || {}; const rooms = Number(r.rooms) || 1;
      return { success: true, data: { totalRooms: rooms, totalMembers: Number(r.members)||0, totalMessages: Number(r.messages)||0, totalFlagged: 0, averageMembersPerRoom: Math.round((Number(r.members)||0)/rooms), averageMessagesPerRoom: Math.round((Number(r.messages)||0)/rooms) } };
    } catch { return { success: true, data: { totalRooms: 0, totalMembers: 0, totalMessages: 0, totalFlagged: 0, averageMembersPerRoom: 0, averageMessagesPerRoom: 0 } }; }
  }),
});
