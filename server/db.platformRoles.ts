/**
 * Database Service for Platform Roles
 * Handles persistent storage and retrieval of platform role assignments
 */

import { getDb } from './db';
import { platformRoles, roleAuditLogs, users } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export type PlatformRole = 'viewer' | 'moderator' | 'broadcaster' | 'admin';

/**
 * Get user's role on a specific platform
 */
export async function getUserRoleOnPlatform(
  userId: number,
  platformId: string
): Promise<PlatformRole> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db
    .select({ role: platformRoles.role })
    .from(platformRoles)
    .where(
      and(
        eq(platformRoles.userId, userId),
        eq(platformRoles.platformId, platformId)
      )
    )
    .limit(1);

  return result[0]?.role || 'viewer';
}

/**
 * Assign a role to a user on a platform
 */
export async function assignRoleToPlatform(
  userId: number,
  platformId: string,
  role: PlatformRole,
  grantedBy: number,
  reason?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get old role for audit log
  const oldRole = await getUserRoleOnPlatform(userId, platformId);

  // Check if role already exists
  const existing = await db
    .select()
    .from(platformRoles)
    .where(
      and(
        eq(platformRoles.userId, userId),
        eq(platformRoles.platformId, platformId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing role
    await db
      .update(platformRoles)
      .set({ role, updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(platformRoles.userId, userId),
          eq(platformRoles.platformId, platformId)
        )
      );
  } else {
    // Insert new role
    await db.insert(platformRoles).values({
      userId,
      platformId,
      role,
      grantedBy,
    });
  }

  // Log the change
  if (oldRole !== role) {
    await db.insert(roleAuditLogs).values({
      userId,
      platformId,
      oldRole: oldRole === 'viewer' ? null : oldRole,
      newRole: role,
      changedBy: grantedBy,
      reason,
    });
  }
}

/**
 * Remove a user's role from a platform (revert to viewer)
 */
export async function removeRoleFromPlatform(
  userId: number,
  platformId: string,
  removedBy: number,
  reason?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const oldRole = await getUserRoleOnPlatform(userId, platformId);

  await db
    .delete(platformRoles)
    .where(
      and(
        eq(platformRoles.userId, userId),
        eq(platformRoles.platformId, platformId)
      )
    );

  // Log the removal
  await db.insert(roleAuditLogs).values({
    userId,
    platformId,
    oldRole,
    newRole: 'viewer',
    changedBy: removedBy,
    reason,
  });
}

/**
 * Get all broadcasters for a platform
 */
export async function getPlatformBroadcasters(platformId: string): Promise<number[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const broadcasters = await db
    .select({ userId: platformRoles.userId })
    .from(platformRoles)
    .where(eq(platformRoles.platformId, platformId));

  return broadcasters.map((b) => b.userId);
}

/**
 * Get all platforms where user is a broadcaster
 */
export async function getUserBroadcasterPlatforms(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const platforms = await db
    .select({ platformId: platformRoles.platformId })
    .from(platformRoles)
    .where(eq(platformRoles.userId, userId));

  return platforms.map((p) => p.platformId);
}

/**
 * Check if user is a broadcaster on a platform
 */
export async function isBroadcaster(userId: number, platformId: string): Promise<boolean> {
  const role = await getUserRoleOnPlatform(userId, platformId);
  return role === 'broadcaster' || role === 'admin';
}

/**
 * Check if user is a moderator on a platform
 */
export async function isModerator(userId: number, platformId: string): Promise<boolean> {
  const role = await getUserRoleOnPlatform(userId, platformId);
  return role === 'moderator' || role === 'admin';
}

/**
 * Check if user is an admin on a platform
 */
export async function isAdmin(userId: number, platformId: string): Promise<boolean> {
  const role = await getUserRoleOnPlatform(userId, platformId);
  return role === 'admin';
}

/**
 * Get role audit history for a user on a platform
 */
export async function getRoleAuditHistory(
  userId: number,
  platformId: string,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db
    .select({
      id: roleAuditLogs.id,
      oldRole: roleAuditLogs.oldRole,
      newRole: roleAuditLogs.newRole,
      changedBy: roleAuditLogs.changedBy,
      reason: roleAuditLogs.reason,
      createdAt: roleAuditLogs.createdAt,
    })
    .from(roleAuditLogs)
    .where(
      and(
        eq(roleAuditLogs.userId, userId),
        eq(roleAuditLogs.platformId, platformId)
      )
    )
    .orderBy((t) => t.createdAt)
    .limit(limit);
}

/**
 * Get all role assignments for a platform
 */
export async function getPlatformRoleAssignments(platformId: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db
    .select({
      id: platformRoles.id,
      userId: platformRoles.userId,
      userName: users.name,
      userEmail: users.email,
      role: platformRoles.role,
      grantedAt: platformRoles.grantedAt,
      updatedAt: platformRoles.updatedAt,
    })
    .from(platformRoles)
    .innerJoin(users, eq(platformRoles.userId, users.id))
    .where(eq(platformRoles.platformId, platformId))
    .orderBy((t) => t.grantedAt);
}
