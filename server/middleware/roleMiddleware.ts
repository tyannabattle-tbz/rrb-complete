/**
 * Role-Based Access Control Middleware
 * Protects broadcast operations based on platform roles
 */

import { TRPCError } from '@trpc/server';
import { platformRoleService } from '../services/platformRoleService';

export async function requireBroadcasterRole(
  userId: number,
  platformId: string
): Promise<void> {
  const isBroadcaster = await platformRoleService.isBroadcaster(userId, platformId);

  if (!isBroadcaster) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You do not have broadcaster permissions on ${platformId}. Contact an administrator to request access.`,
    });
  }
}

export async function requireModeratorRole(
  userId: number,
  platformId: string
): Promise<void> {
  const isModerator = await platformRoleService.isModerator(userId, platformId);

  if (!isModerator) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You do not have moderator permissions on ${platformId}. Contact an administrator to request access.`,
    });
  }
}

export async function requireAdminRole(
  userId: number,
  platformId: string
): Promise<void> {
  const isAdmin = await platformRoleService.isAdmin(userId, platformId);

  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You do not have admin permissions on ${platformId}. Contact an administrator to request access.`,
    });
  }
}

export async function verifyBroadcastAction(
  userId: number,
  platformId: string,
  action: 'start' | 'pause' | 'resume' | 'stop' | 'record' | 'configure'
): Promise<void> {
  const result = await platformRoleService.verifyBroadcastPermission(
    userId,
    platformId,
    action
  );

  if (!result.allowed) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: result.reason || 'You do not have permission to perform this action',
    });
  }
}

export async function requireRole(
  userId: number,
  platformId: string,
  requiredRole: 'viewer' | 'moderator' | 'broadcaster' | 'admin'
): Promise<void> {
  const hasPermission = await platformRoleService.hasPermission(
    userId,
    platformId,
    requiredRole
  );

  if (!hasPermission) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `This action requires ${requiredRole} role or higher on ${platformId}`,
    });
  }
}
