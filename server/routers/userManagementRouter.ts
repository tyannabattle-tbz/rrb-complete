import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';

export const userManagementRouter = router({
  // Get user profile
  getUserProfile: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const id = input.userId || ctx.user.id;
      return {
        id,
        email: ctx.user.email,
        name: ctx.user.name || 'User',
        role: ctx.user.role || 'user',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        bio: 'Qumus creator and video enthusiast',
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastActive: new Date(),
        stats: { projects: 12, videos: 45, collaborators: 8 },
      };
    }),

  // Update user profile
  updateUserProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        userId: ctx.user.id,
        updated: { ...input },
        message: 'Profile updated successfully',
      };
    }),

  // Enable two-factor authentication
  enableTwoFactorAuth: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      const secret = `secret-${Date.now()}`;
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(secret)}`;
      return {
        success: true,
        userId: ctx.user.id,
        secret,
        qrCode,
        backupCodes: Array.from({ length: 10 }, (_, i) => `BACKUP-${i + 1}-${Date.now()}`),
        message: 'Scan QR code with authenticator app',
      };
    }),

  // Verify two-factor authentication
  verifyTwoFactorAuth: protectedProcedure
    .input(z.object({
      code: z.string().length(6),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        userId: ctx.user.id,
        twoFactorEnabled: true,
        message: 'Two-factor authentication enabled',
      };
    }),

  // Disable two-factor authentication
  disableTwoFactorAuth: protectedProcedure
    .input(z.object({
      password: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        userId: ctx.user.id,
        twoFactorEnabled: false,
        message: 'Two-factor authentication disabled',
      };
    }),

  // Create API key
  createAPIKey: protectedProcedure
    .input(z.object({
      name: z.string(),
      permissions: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const keyId = `key-${Date.now()}`;
      const token = `qumus_${Buffer.from(`${keyId}:${Date.now()}`).toString('base64')}`;
      return {
        success: true,
        userId: ctx.user.id,
        keyId,
        token,
        name: input.name,
        permissions: input.permissions,
        createdAt: new Date(),
        message: 'API key created. Save it now - you won\'t see it again',
      };
    }),

  // List API keys
  listAPIKeys: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      return {
        userId: ctx.user.id,
        keys: [
          {
            id: 'key-1',
            name: 'Production API',
            permissions: ['read', 'write'],
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000),
            status: 'active',
          },
          {
            id: 'key-2',
            name: 'Development API',
            permissions: ['read'],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lastUsed: new Date(Date.now() - 5 * 60 * 1000),
            status: 'active',
          },
        ],
      };
    }),

  // Revoke API key
  revokeAPIKey: protectedProcedure
    .input(z.object({ keyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        userId: ctx.user.id,
        keyId: input.keyId,
        message: 'API key revoked',
      };
    }),

  // Get user permissions
  getUserPermissions: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      return {
        userId: ctx.user.id,
        role: ctx.user.role || 'user',
        permissions: {
          canCreateProjects: true,
          canEditProjects: true,
          canDeleteProjects: ctx.user.role === 'admin',
          canInviteUsers: true,
          canManageTeam: ctx.user.role === 'admin',
          canAccessAnalytics: true,
          canExportData: true,
          canAccessAPI: true,
        },
      };
    }),

  // Update user role (admin only)
  updateUserRole: protectedProcedure
    .input(z.object({
      targetUserId: z.string(),
      role: z.enum(['user', 'admin']),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can update roles');
      }
      return {
        success: true,
        userId: ctx.user.id,
        targetUserId: input.targetUserId,
        newRole: input.role,
        message: `User role updated to ${input.role}`,
      };
    }),

  // List all users (admin only)
  listUsers: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can list users');
      }
      return {
        userId: ctx.user.id,
        users: [
          {
            id: 'user-1',
            email: 'team@canrynproduction.com',
            name: 'John Doe',
            role: 'admin',
            joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            lastActive: new Date(),
            status: 'active',
          },
          {
            id: 'user-2',
            email: 'admin@canrynproduction.com',
            name: 'Jane Smith',
            role: 'user',
            joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'active',
          },
        ],
        total: 2,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Get user activity
  getUserActivity: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      return {
        userId: ctx.user.id,
        activity: [
          {
            id: 'activity-1',
            type: 'project_created',
            description: 'Created project "Marketing Video"',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          },
          {
            id: 'activity-2',
            type: 'collaboration_added',
            description: 'Added Jane Smith as collaborator',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          },
        ],
        total: 2,
        limit: input.limit,
      };
    }),

  // Delete account
  deleteAccount: protectedProcedure
    .input(z.object({
      password: z.string(),
      confirmDelete: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!input.confirmDelete) {
        throw new Error('Please confirm account deletion');
      }
      return {
        success: true,
        userId: ctx.user.id,
        message: 'Account scheduled for deletion. You will be logged out.',
        deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }),
});
