/**
 * Platform Role Service Tests
 * Tests for role-based access control
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { platformRoleService } from './platformRoleService';

describe('PlatformRoleService', () => {
  beforeEach(() => {
    // Reset service state before each test
    platformRoleService['platformRoles'].clear();
  });

  describe('Role Assignment', () => {
    it('should assign broadcaster role to user', async () => {
      await platformRoleService.assignRoleToPlatform(1, 'squadd', 'broadcaster');
      const role = await platformRoleService.getUserRoleOnPlatform(1, 'squadd');
      expect(role).toBe('broadcaster');
    });

    it('should assign moderator role to user', async () => {
      await platformRoleService.assignRoleToPlatform(1, 'squadd', 'moderator');
      const role = await platformRoleService.getUserRoleOnPlatform(1, 'squadd');
      expect(role).toBe('moderator');
    });

    it('should assign admin role to user', async () => {
      await platformRoleService.assignRoleToPlatform(1, 'squadd', 'admin');
      const role = await platformRoleService.getUserRoleOnPlatform(1, 'squadd');
      expect(role).toBe('admin');
    });

    it('should default to viewer role', async () => {
      const role = await platformRoleService.getUserRoleOnPlatform(999, 'squadd');
      expect(role).toBe('viewer');
    });
  });

  describe('Role Checks', () => {
    beforeEach(async () => {
      await platformRoleService.assignRoleToPlatform(1, 'squadd', 'broadcaster');
      await platformRoleService.assignRoleToPlatform(2, 'squadd', 'moderator');
      await platformRoleService.assignRoleToPlatform(3, 'squadd', 'admin');
    });

    it('should identify broadcaster', async () => {
      const isBroadcaster = await platformRoleService.isBroadcaster(1, 'squadd');
      expect(isBroadcaster).toBe(true);
    });

    it('should identify moderator', async () => {
      const isModerator = await platformRoleService.isModerator(2, 'squadd');
      expect(isModerator).toBe(true);
    });

    it('should identify admin', async () => {
      const isAdmin = await platformRoleService.isAdmin(3, 'squadd');
      expect(isAdmin).toBe(true);
    });

    it('should recognize admin as broadcaster', async () => {
      const isBroadcaster = await platformRoleService.isBroadcaster(3, 'squadd');
      expect(isBroadcaster).toBe(true);
    });

    it('should recognize admin as moderator', async () => {
      const isModerator = await platformRoleService.isModerator(3, 'squadd');
      expect(isModerator).toBe(true);
    });

    it('should not recognize viewer as broadcaster', async () => {
      const isBroadcaster = await platformRoleService.isBroadcaster(999, 'squadd');
      expect(isBroadcaster).toBe(false);
    });
  });

  describe('Broadcast Permissions', () => {
    beforeEach(async () => {
      await platformRoleService.assignRoleToPlatform(1, 'squadd', 'broadcaster');
      await platformRoleService.assignRoleToPlatform(2, 'squadd', 'viewer');
    });

    it('should allow broadcaster to start broadcast', async () => {
      const result = await platformRoleService.verifyBroadcastPermission(
        1,
        'squadd',
        'start'
      );
      expect(result.allowed).toBe(true);
    });

    it('should deny viewer from starting broadcast', async () => {
      const result = await platformRoleService.verifyBroadcastPermission(
        2,
        'squadd',
        'start'
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should allow broadcaster to pause broadcast', async () => {
      const result = await platformRoleService.verifyBroadcastPermission(
        1,
        'squadd',
        'pause'
      );
      expect(result.allowed).toBe(true);
    });

    it('should allow broadcaster to record', async () => {
      const result = await platformRoleService.verifyBroadcastPermission(
        1,
        'squadd',
        'record'
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe('Platform Broadcasters', () => {
    beforeEach(async () => {
      await platformRoleService.assignRoleToPlatform(1, 'squadd', 'broadcaster');
      await platformRoleService.assignRoleToPlatform(2, 'squadd', 'broadcaster');
      await platformRoleService.assignRoleToPlatform(3, 'solbones', 'broadcaster');
    });

    it('should get all broadcasters for platform', async () => {
      const broadcasters = await platformRoleService.getPlatformBroadcasters('squadd');
      expect(broadcasters).toContain(1);
      expect(broadcasters).toContain(2);
      expect(broadcasters).not.toContain(3);
    });

    it('should get user broadcaster platforms', async () => {
      const platforms = await platformRoleService.getUserBroadcasterPlatforms(1);
      expect(platforms).toContain('squadd');
      expect(platforms).not.toContain('solbones');
    });
  });

  describe('Role Hierarchy', () => {
    it('should have correct hierarchy levels', () => {
      expect(platformRoleService.getRoleHierarchy('viewer')).toBe(0);
      expect(platformRoleService.getRoleHierarchy('moderator')).toBe(1);
      expect(platformRoleService.getRoleHierarchy('broadcaster')).toBe(2);
      expect(platformRoleService.getRoleHierarchy('admin')).toBe(3);
    });

    it('should compare roles correctly', async () => {
      await platformRoleService.assignRoleToPlatform(1, 'squadd', 'moderator');

      const hasModeratorPermission = await platformRoleService.hasPermission(
        1,
        'squadd',
        'moderator'
      );
      expect(hasModeratorPermission).toBe(true);

      const hasBroadcasterPermission = await platformRoleService.hasPermission(
        1,
        'squadd',
        'broadcaster'
      );
      expect(hasBroadcasterPermission).toBe(false);
    });
  });

  describe('Role Removal', () => {
    it('should remove user role from platform', async () => {
      await platformRoleService.assignRoleToPlatform(1, 'squadd', 'broadcaster');
      let role = await platformRoleService.getUserRoleOnPlatform(1, 'squadd');
      expect(role).toBe('broadcaster');

      await platformRoleService.removeRoleFromPlatform(1, 'squadd');
      role = await platformRoleService.getUserRoleOnPlatform(1, 'squadd');
      expect(role).toBe('viewer');
    });
  });

  describe('Interface Access', () => {
    beforeEach(async () => {
      await platformRoleService.assignRoleToPlatform(1, 'squadd', 'broadcaster');
      await platformRoleService.assignRoleToPlatform(2, 'squadd', 'viewer');
    });

    it('should allow broadcaster to access broadcaster interface', async () => {
      const canAccess = await platformRoleService.canAccessBroadcasterInterface(
        1,
        'squadd'
      );
      expect(canAccess).toBe(true);
    });

    it('should deny viewer from accessing broadcaster interface', async () => {
      const canAccess = await platformRoleService.canAccessBroadcasterInterface(
        2,
        'squadd'
      );
      expect(canAccess).toBe(false);
    });

    it('should allow admin to access admin interface', async () => {
      await platformRoleService.assignRoleToPlatform(3, 'squadd', 'admin');
      const canAccess = await platformRoleService.canAccessAdminInterface(3, 'squadd');
      expect(canAccess).toBe(true);
    });

    it('should deny broadcaster from accessing admin interface', async () => {
      const canAccess = await platformRoleService.canAccessAdminInterface(1, 'squadd');
      expect(canAccess).toBe(false);
    });
  });

  describe('Multiple Platforms', () => {
    it('should manage roles independently per platform', async () => {
      await platformRoleService.assignRoleToPlatform(1, 'squadd', 'broadcaster');
      await platformRoleService.assignRoleToPlatform(1, 'solbones', 'viewer');

      const squadRole = await platformRoleService.getUserRoleOnPlatform(1, 'squadd');
      const solbonesRole = await platformRoleService.getUserRoleOnPlatform(1, 'solbones');

      expect(squadRole).toBe('broadcaster');
      expect(solbonesRole).toBe('viewer');
    });
  });
});
