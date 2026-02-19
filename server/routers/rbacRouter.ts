import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Role-Based Access Control (RBAC) Router
 * Manages permissions for operators, broadcasters, moderators, and viewers
 */

// Define role permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "manage_operator",
    "manage_channels",
    "manage_broadcasts",
    "manage_members",
    "manage_streaming",
    "view_analytics",
    "manage_revenue",
    "manage_settings",
    "manage_compliance",
    "view_audit_logs",
  ],
  broadcaster: [
    "manage_broadcasts",
    "manage_channels",
    "manage_streaming",
    "view_analytics",
    "manage_chat",
    "go_live",
  ],
  moderator: [
    "manage_chat",
    "moderate_users",
    "manage_broadcasts",
    "view_analytics",
  ],
  viewer: [
    "watch_broadcasts",
    "chat",
    "like_content",
    "subscribe",
  ],
};

export const rbacRouter = router({
  // Get user's role in operator
  getUserRole: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Check if user is operator owner
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (operator && operator.userId === ctx.user.id) {
        return { role: "admin", permissions: ROLE_PERMISSIONS.admin };
      }

      // Check if user is a member
      const member = await db.query.operatorMembers.findFirst({
        where: (operatorMembers, { and, eq }) =>
          and(
            eq(operatorMembers.operatorId, input.operatorId),
            eq(operatorMembers.userId, ctx.user.id)
          ),
      });

      if (member) {
        return {
          role: member.role,
          permissions: ROLE_PERMISSIONS[member.role] || [],
        };
      }

      return { role: null, permissions: [] };
    }),

  // Check if user has permission
  hasPermission: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        permission: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if user is operator owner
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (operator && operator.userId === ctx.user.id) {
        return {
          hasPermission: ROLE_PERMISSIONS.admin.includes(input.permission),
        };
      }

      // Check if user is a member
      const member = await db.query.operatorMembers.findFirst({
        where: (operatorMembers, { and, eq }) =>
          and(
            eq(operatorMembers.operatorId, input.operatorId),
            eq(operatorMembers.userId, ctx.user.id)
          ),
      });

      if (member) {
        const permissions = ROLE_PERMISSIONS[member.role] || [];
        return { hasPermission: permissions.includes(input.permission) };
      }

      return { hasPermission: false };
    }),

  // Get all roles and their permissions
  getRoles: protectedProcedure.query(async () => {
    return Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
      role,
      permissions,
      permissionCount: permissions.length,
    }));
  }),

  // Update member role
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        memberId: z.number(),
        newRole: z.enum(["admin", "broadcaster", "moderator", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify operator ownership
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update roles",
        });
      }

      // Update member role
      await db
        .update(operatorMembers)
        .set({ role: input.newRole })
        .where(eq(operatorMembers.id, input.memberId));

      return { success: true };
    }),

  // Create custom role with permissions
  createCustomRole: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        roleName: z.string(),
        permissions: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify operator ownership
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to create roles",
        });
      }

      // Custom roles would be stored in a separate table
      // For now, return success
      return {
        success: true,
        role: input.roleName,
        permissions: input.permissions,
      };
    }),

  // Get member permissions
  getMemberPermissions: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        memberId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify operator ownership or admin role
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view member permissions",
        });
      }

      const member = await db.query.operatorMembers.findFirst({
        where: (operatorMembers, { eq }) =>
          eq(operatorMembers.id, input.memberId),
      });

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      return {
        memberId: member.id,
        role: member.role,
        permissions: ROLE_PERMISSIONS[member.role] || [],
        customPermissions: member.permissions,
      };
    }),

  // Revoke member access
  revokeMemberAccess: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        memberId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify operator ownership
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to revoke access",
        });
      }

      // Update member status to inactive
      await db
        .update(operatorMembers)
        .set({ status: "inactive" })
        .where(eq(operatorMembers.id, input.memberId));

      return { success: true };
    }),

  // Get audit log for role changes
  getRoleAuditLog: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify operator ownership
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view audit logs",
        });
      }

      const logs = await db.query.operatorAuditLog.findMany({
        where: (operatorAuditLog, { and, eq }) =>
          and(
            eq(operatorAuditLog.operatorId, input.operatorId),
            eq(operatorAuditLog.action, "role_change")
          ),
      });

      return logs;
    }),

  // Check broadcast permissions
  canBroadcast: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        channelId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get user's role
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator) {
        return { canBroadcast: false, reason: "Operator not found" };
      }

      // Owner can always broadcast
      if (operator.userId === ctx.user.id) {
        return { canBroadcast: true };
      }

      // Check member role
      const member = await db.query.operatorMembers.findFirst({
        where: (operatorMembers, { and, eq }) =>
          and(
            eq(operatorMembers.operatorId, input.operatorId),
            eq(operatorMembers.userId, ctx.user.id)
          ),
      });

      if (!member) {
        return { canBroadcast: false, reason: "Not a member of this operator" };
      }

      if (member.status !== "active") {
        return { canBroadcast: false, reason: "Member access revoked" };
      }

      const permissions = ROLE_PERMISSIONS[member.role] || [];
      const canBroadcast = permissions.includes("go_live");

      return {
        canBroadcast,
        reason: canBroadcast ? "Permission granted" : "Insufficient permissions",
      };
    }),

  // Check chat moderation permissions
  canModerateChat: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator) {
        return { canModerate: false };
      }

      if (operator.userId === ctx.user.id) {
        return { canModerate: true };
      }

      const member = await db.query.operatorMembers.findFirst({
        where: (operatorMembers, { and, eq }) =>
          and(
            eq(operatorMembers.operatorId, input.operatorId),
            eq(operatorMembers.userId, ctx.user.id)
          ),
      });

      if (!member || member.status !== "active") {
        return { canModerate: false };
      }

      const permissions = ROLE_PERMISSIONS[member.role] || [];
      return { canModerate: permissions.includes("manage_chat") };
    }),

  // Check analytics view permissions
  canViewAnalytics: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator) {
        return { canView: false };
      }

      if (operator.userId === ctx.user.id) {
        return { canView: true };
      }

      const member = await db.query.operatorMembers.findFirst({
        where: (operatorMembers, { and, eq }) =>
          and(
            eq(operatorMembers.operatorId, input.operatorId),
            eq(operatorMembers.userId, ctx.user.id)
          ),
      });

      if (!member || member.status !== "active") {
        return { canView: false };
      }

      const permissions = ROLE_PERMISSIONS[member.role] || [];
      return { canView: permissions.includes("view_analytics") };
    }),
});
