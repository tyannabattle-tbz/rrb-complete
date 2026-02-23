import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// In-memory session store (in production, use database)
const activeSessions = new Map<string, {
  userId: string;
  deviceId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  createdAt: number;
  lastActivityAt: number;
  expiresAt: number;
}>();

export const sessionsRouter = router({
  // Get all active sessions for current user
  getActiveSessions: protectedProcedure
    .query(({ ctx }) => {
      const userSessions = Array.from(activeSessions.values()).filter(
        session => session.userId === ctx.user.id
      );

      return userSessions.map(session => ({
        deviceId: session.deviceId,
        deviceName: session.deviceName,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
        isCurrentDevice: session.deviceId === ctx.req.headers['x-device-id'],
      }));
    }),

  // Register a new session
  registerSession: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
      deviceName: z.string(),
    }))
    .mutation(({ ctx, input }) => {
      const sessionId = `${ctx.user.id}-${input.deviceId}`;
      const userAgent = ctx.req.headers['user-agent'] || 'Unknown';
      const ipAddress = (ctx.req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                       ctx.req.socket.remoteAddress || 'Unknown';

      activeSessions.set(sessionId, {
        userId: ctx.user.id,
        deviceId: input.deviceId,
        deviceName: input.deviceName,
        userAgent,
        ipAddress,
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes
      });

      return { sessionId, registered: true };
    }),

  // Logout from a specific device
  logoutDevice: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
    }))
    .mutation(({ ctx, input }) => {
      const sessionId = `${ctx.user.id}-${input.deviceId}`;
      const session = activeSessions.get(sessionId);

      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot logout from another user\'s session',
        });
      }

      activeSessions.delete(sessionId);
      return { success: true };
    }),

  // Logout from all devices
  logoutAllDevices: protectedProcedure
    .mutation(({ ctx }) => {
      const userSessions = Array.from(activeSessions.entries()).filter(
        ([_, session]) => session.userId === ctx.user.id
      );

      userSessions.forEach(([sessionId]) => {
        activeSessions.delete(sessionId);
      });

      return { success: true, sessionsTerminated: userSessions.length };
    }),

  // Update last activity for session
  updateActivity: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
    }))
    .mutation(({ ctx, input }) => {
      const sessionId = `${ctx.user.id}-${input.deviceId}`;
      const session = activeSessions.get(sessionId);

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      session.lastActivityAt = Date.now();
      session.expiresAt = Date.now() + (15 * 60 * 1000); // Extend expiry
      activeSessions.set(sessionId, session);

      return { success: true };
    }),

  // Check if session is still valid
  validateSession: protectedProcedure
    .input(z.object({
      deviceId: z.string(),
    }))
    .query(({ ctx, input }) => {
      const sessionId = `${ctx.user.id}-${input.deviceId}`;
      const session = activeSessions.get(sessionId);

      if (!session) {
        return { valid: false, reason: 'Session not found' };
      }

      if (Date.now() > session.expiresAt) {
        activeSessions.delete(sessionId);
        return { valid: false, reason: 'Session expired' };
      }

      return { valid: true };
    }),
});
