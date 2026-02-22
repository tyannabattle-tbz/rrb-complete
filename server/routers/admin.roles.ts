/**
 * Admin Role Management Router
 * tRPC procedures for managing platform roles
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  assignRoleToPlatform,
  removeRoleFromPlatform,
  getPlatformRoleAssignments,
  getRoleAuditHistory,
  isBroadcaster,
  isAdmin,
} from '../db.platformRoles';

export const adminRolesRouter = router({
  /**
   * Assign a role to a user on a platform
   */
  assignRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        platformId: z.string(),
        role: z.enum(['viewer', 'moderator', 'broadcaster', 'admin']),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can assign roles
      const isAdminUser = await isAdmin(ctx.user.id, input.platformId);
      if (!isAdminUser) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can assign roles',
        });
      }

      await assignRoleToPlatform(
        input.userId,
        input.platformId,
        input.role,
        ctx.user.id,
        input.reason
      );

      return {
        success: true,
        message: `Assigned ${input.role} role to user ${input.userId} on ${input.platformId}`,
      };
    }),

  /**
   * Remove a user's role from a platform
   */
  removeRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        platformId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can remove roles
      const isAdminUser = await isAdmin(ctx.user.id, input.platformId);
      if (!isAdminUser) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can remove roles',
        });
      }

      await removeRoleFromPlatform(
        input.userId,
        input.platformId,
        ctx.user.id,
        input.reason
      );

      return {
        success: true,
        message: `Removed role for user ${input.userId} on ${input.platformId}`,
      };
    }),

  /**
   * Get all role assignments for a platform
   */
  getPlatformRoles: protectedProcedure
    .input(z.object({ platformId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Only admins can view role assignments
      const isAdminUser = await isAdmin(ctx.user.id, input.platformId);
      if (!isAdminUser) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view role assignments',
        });
      }

      const assignments = await getPlatformRoleAssignments(input.platformId);
      return assignments;
    }),

  /**
   * Get role audit history
   */
  getAuditHistory: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        platformId: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only admins can view audit history
      const isAdminUser = await isAdmin(ctx.user.id, input.platformId);
      if (!isAdminUser) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view audit history',
        });
      }

      const history = await getRoleAuditHistory(
        input.userId,
        input.platformId,
        input.limit
      );
      return history;
    }),

  /**
   * Bulk assign roles
   */
  bulkAssignRoles: protectedProcedure
    .input(
      z.object({
        platformId: z.string(),
        assignments: z.array(
          z.object({
            userId: z.number(),
            role: z.enum(['viewer', 'moderator', 'broadcaster', 'admin']),
          })
        ),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can bulk assign roles
      const isAdminUser = await isAdmin(ctx.user.id, input.platformId);
      if (!isAdminUser) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can bulk assign roles',
        });
      }

      const results = [];
      for (const assignment of input.assignments) {
        try {
          await assignRoleToPlatform(
            assignment.userId,
            input.platformId,
            assignment.role,
            ctx.user.id,
            input.reason
          );
          results.push({
            userId: assignment.userId,
            success: true,
          });
        } catch (error) {
          results.push({
            userId: assignment.userId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return {
        success: true,
        results,
        message: `Bulk role assignment completed: ${results.filter((r) => r.success).length}/${results.length} successful`,
      };
    }),

  /**
   * Get role statistics for a platform
   */
  getRoleStats: protectedProcedure
    .input(z.object({ platformId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Only admins can view stats
      const isAdminUser = await isAdmin(ctx.user.id, input.platformId);
      if (!isAdminUser) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view role statistics',
        });
      }

      const assignments = await getPlatformRoleAssignments(input.platformId);

      const stats = {
        total: assignments.length,
        admins: assignments.filter((a) => a.role === 'admin').length,
        broadcasters: assignments.filter((a) => a.role === 'broadcaster').length,
        moderators: assignments.filter((a) => a.role === 'moderator').length,
        viewers: assignments.filter((a) => a.role === 'viewer').length,
      };

      return stats;
    }),
});
