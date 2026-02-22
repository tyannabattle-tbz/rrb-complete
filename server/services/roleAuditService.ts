/**
 * Role Audit Service
 * Logs all role changes and provides audit trail
 */

import { getDb } from '../db';
import { roleAuditLogs } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface AuditLogEntry {
  id: number;
  userId: number;
  platformId: string;
  oldRole: string | null;
  newRole: string;
  changedBy: number;
  reason: string | null;
  createdAt: string;
}

/**
 * Log a role change
 */
export async function logRoleChange(
  userId: number,
  platformId: string,
  oldRole: string | null,
  newRole: string,
  changedBy: number,
  reason?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.insert(roleAuditLogs).values({
    userId,
    platformId,
    oldRole: oldRole as any,
    newRole: newRole as any,
    changedBy,
    reason,
  });

  console.log(
    `[Role Audit] User ${userId} on ${platformId}: ${oldRole || 'none'} → ${newRole} (by user ${changedBy})`
  );
}

/**
 * Get audit history for a user on a platform
 */
export async function getAuditHistory(
  userId: number,
  platformId: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const logs = await db
    .select()
    .from(roleAuditLogs)
    .where(
      and(
        eq(roleAuditLogs.userId, userId),
        eq(roleAuditLogs.platformId, platformId)
      )
    )
    .orderBy(desc(roleAuditLogs.createdAt))
    .limit(limit);

  return logs as AuditLogEntry[];
}

/**
 * Get audit history for a platform
 */
export async function getPlatformAuditHistory(
  platformId: string,
  limit: number = 500
): Promise<AuditLogEntry[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const logs = await db
    .select()
    .from(roleAuditLogs)
    .where(eq(roleAuditLogs.platformId, platformId))
    .orderBy(desc(roleAuditLogs.createdAt))
    .limit(limit);

  return logs as AuditLogEntry[];
}

/**
 * Get audit history for a user (all platforms)
 */
export async function getUserAuditHistory(
  userId: number,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const logs = await db
    .select()
    .from(roleAuditLogs)
    .where(eq(roleAuditLogs.userId, userId))
    .orderBy(desc(roleAuditLogs.createdAt))
    .limit(limit);

  return logs as AuditLogEntry[];
}

/**
 * Get audit history for a specific admin
 */
export async function getAdminAuditHistory(
  adminId: number,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const logs = await db
    .select()
    .from(roleAuditLogs)
    .where(eq(roleAuditLogs.changedBy, adminId))
    .orderBy(desc(roleAuditLogs.createdAt))
    .limit(limit);

  return logs as AuditLogEntry[];
}

/**
 * Get recent role changes
 */
export async function getRecentRoleChanges(
  platformId: string,
  hours: number = 24
): Promise<AuditLogEntry[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const logs = await db
    .select()
    .from(roleAuditLogs)
    .where(
      and(
        eq(roleAuditLogs.platformId, platformId),
        // createdAt > cutoffTime would be ideal but requires raw SQL
      )
    )
    .orderBy(desc(roleAuditLogs.createdAt))
    .limit(500);

  return (logs as AuditLogEntry[]).filter((log) => new Date(log.createdAt) > new Date(cutoffTime));
}

/**
 * Generate audit report
 */
export async function generateAuditReport(
  platformId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalChanges: number;
  byRole: Record<string, number>;
  byAdmin: Record<number, number>;
  timeline: Array<{ date: string; count: number }>;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const logs = await db
    .select()
    .from(roleAuditLogs)
    .where(eq(roleAuditLogs.platformId, platformId));

  const filtered = (logs as AuditLogEntry[]).filter(
    (log) =>
      new Date(log.createdAt) >= startDate && new Date(log.createdAt) <= endDate
  );

  const byRole: Record<string, number> = {};
  const byAdmin: Record<number, number> = {};
  const timeline: Record<string, number> = {};

  for (const log of filtered) {
    // Count by new role
    byRole[log.newRole] = (byRole[log.newRole] || 0) + 1;

    // Count by admin
    byAdmin[log.changedBy] = (byAdmin[log.changedBy] || 0) + 1;

    // Count by date
    const date = new Date(log.createdAt).toISOString().split('T')[0];
    timeline[date] = (timeline[date] || 0) + 1;
  }

  return {
    totalChanges: filtered.length,
    byRole,
    byAdmin,
    timeline: Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

/**
 * Export audit logs as CSV
 */
export async function exportAuditLogsAsCSV(
  platformId: string,
  startDate: Date,
  endDate: Date
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const logs = await db
    .select()
    .from(roleAuditLogs)
    .where(eq(roleAuditLogs.platformId, platformId));

  const filtered = (logs as AuditLogEntry[]).filter(
    (log) =>
      new Date(log.createdAt) >= startDate && new Date(log.createdAt) <= endDate
  );

  const headers = ['User ID', 'Platform', 'Old Role', 'New Role', 'Changed By', 'Reason', 'Date'];
  const rows = filtered.map((log) => [
    log.userId,
    log.platformId,
    log.oldRole || 'none',
    log.newRole,
    log.changedBy,
    log.reason || '',
    log.createdAt,
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

  return csv;
}
