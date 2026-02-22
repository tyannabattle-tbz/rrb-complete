/**
 * Platform Role Service
 * Manages role-based access control for multi-platform broadcast system
 * Uses in-memory role assignments with optional database persistence
 */

export type PlatformRole = 'viewer' | 'moderator' | 'broadcaster' | 'admin';

export interface UserPlatformRole {
  userId: number;
  platformId: string;
  role: PlatformRole;
}

class PlatformRoleService {
  // In-memory role store (can be replaced with database queries)
  private platformRoles: Map<string, UserPlatformRole> = new Map();

  // Pre-configured broadcasters for each platform
  private broadcasters: Map<string, Set<number>> = new Map([
    ['squadd', new Set()],
    ['solbones', new Set()],
  ]);

  constructor() {
    // Initialize with empty sets for known platforms
    this.broadcasters.set('squadd', new Set());
    this.broadcasters.set('solbones', new Set());
  }

  /**
   * Get user's role on a specific platform
   */
  async getUserRoleOnPlatform(
    userId: number,
    platformId: string
  ): Promise<PlatformRole> {
    const key = `${userId}:${platformId}`;
    const stored = this.platformRoles.get(key);

    if (stored) {
      return stored.role;
    }

    // Check if user is a broadcaster for this platform
    if (this.broadcasters.get(platformId)?.has(userId)) {
      return 'broadcaster';
    }

    // Default to viewer
    return 'viewer';
  }

  /**
   * Check if user is a broadcaster on a platform
   */
  async isBroadcaster(userId: number, platformId: string): Promise<boolean> {
    const role = await this.getUserRoleOnPlatform(userId, platformId);
    return role === 'broadcaster' || role === 'admin';
  }

  /**
   * Check if user is a moderator on a platform
   */
  async isModerator(userId: number, platformId: string): Promise<boolean> {
    const role = await this.getUserRoleOnPlatform(userId, platformId);
    return role === 'moderator' || role === 'admin';
  }

  /**
   * Check if user is an admin on a platform
   */
  async isAdmin(userId: number, platformId: string): Promise<boolean> {
    const role = await this.getUserRoleOnPlatform(userId, platformId);
    return role === 'admin';
  }

  /**
   * Assign a role to a user on a platform
   */
  async assignRoleToPlatform(
    userId: number,
    platformId: string,
    role: PlatformRole
  ): Promise<void> {
    const key = `${userId}:${platformId}`;

    this.platformRoles.set(key, {
      userId,
      platformId,
      role,
    });

    // Also update broadcaster set for quick lookup
    if (role === 'broadcaster' || role === 'admin') {
      if (!this.broadcasters.has(platformId)) {
        this.broadcasters.set(platformId, new Set());
      }
      this.broadcasters.get(platformId)!.add(userId);
    } else {
      // Remove from broadcaster set if role is not broadcaster/admin
      this.broadcasters.get(platformId)?.delete(userId);
    }

    console.log(`Assigned ${role} role to user ${userId} on platform ${platformId}`);
  }

  /**
   * Remove a user's role from a platform (revert to viewer)
   */
  async removeRoleFromPlatform(userId: number, platformId: string): Promise<void> {
    const key = `${userId}:${platformId}`;
    this.platformRoles.delete(key);
    this.broadcasters.get(platformId)?.delete(userId);

    console.log(`Removed role for user ${userId} on platform ${platformId}`);
  }

  /**
   * Get all broadcasters for a platform
   */
  async getPlatformBroadcasters(platformId: string): Promise<number[]> {
    return Array.from(this.broadcasters.get(platformId) || new Set());
  }

  /**
   * Check if user can access broadcaster interface
   */
  async canAccessBroadcasterInterface(
    userId: number,
    platformId: string
  ): Promise<boolean> {
    return this.isBroadcaster(userId, platformId);
  }

  /**
   * Check if user can access admin interface
   */
  async canAccessAdminInterface(userId: number, platformId: string): Promise<boolean> {
    return this.isAdmin(userId, platformId);
  }

  /**
   * Get all platforms where user is a broadcaster
   */
  async getUserBroadcasterPlatforms(userId: number): Promise<string[]> {
    const platforms: string[] = [];

    for (const [platformId, broadcasters] of this.broadcasters.entries()) {
      if (broadcasters.has(userId)) {
        platforms.push(platformId);
      }
    }

    return platforms;
  }

  /**
   * Verify user can perform broadcast action
   */
  async verifyBroadcastPermission(
    userId: number,
    platformId: string,
    action: 'start' | 'pause' | 'resume' | 'stop' | 'record' | 'configure'
  ): Promise<{ allowed: boolean; reason?: string }> {
    const isBroadcaster = await this.isBroadcaster(userId, platformId);

    if (!isBroadcaster) {
      return {
        allowed: false,
        reason: `User does not have broadcaster role on ${platformId}`,
      };
    }

    // All broadcast actions require broadcaster role
    return { allowed: true };
  }

  /**
   * Get role hierarchy level (for permission checks)
   */
  getRoleHierarchy(role: PlatformRole): number {
    const hierarchy: Record<PlatformRole, number> = {
      viewer: 0,
      moderator: 1,
      broadcaster: 2,
      admin: 3,
    };
    return hierarchy[role];
  }

  /**
   * Check if user has sufficient permissions
   */
  async hasPermission(
    userId: number,
    platformId: string,
    requiredRole: PlatformRole
  ): Promise<boolean> {
    const userRole = await this.getUserRoleOnPlatform(userId, platformId);
    return this.getRoleHierarchy(userRole) >= this.getRoleHierarchy(requiredRole);
  }
}

export const platformRoleService = new PlatformRoleService();
