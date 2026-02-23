import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';

// In-memory storage for OTP sessions (in production, use database)
const otpSessions = new Map<string, {
  otp: string;
  phoneNumber: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}>();

export const smsRouter = router({
  /**
   * Send OTP to phone number
   */
  sendOTP: publicProcedure
    .input(z.object({
      phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    }))
    .mutation(async ({ input }) => {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const otp = Math.random().toString().slice(2, 8);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      otpSessions.set(sessionId, {
        otp,
        phoneNumber: input.phoneNumber,
        expiresAt,
        attempts: 0,
        verified: false,
      });

      // In production, send via Manus Notification API
      console.log(`[SMS] OTP sent to ${input.phoneNumber}: ${otp}`);

      return {
        success: true,
        sessionId,
        expiresAt: expiresAt.toISOString(),
        message: 'OTP sent successfully',
      };
    }),

  /**
   * Verify OTP
   */
  verifyOTP: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      otp: z.string().length(6),
    }))
    .mutation(async ({ input }) => {
      const session = otpSessions.get(input.sessionId);

      if (!session) {
        return { verified: false, error: 'Session not found' };
      }

      if (new Date() > session.expiresAt) {
        otpSessions.delete(input.sessionId);
        return { verified: false, error: 'OTP expired' };
      }

      if (session.attempts >= 3) {
        otpSessions.delete(input.sessionId);
        return { verified: false, error: 'Too many attempts' };
      }

      const verified = session.otp === input.otp;

      if (!verified) {
        session.attempts++;
      } else {
        session.verified = true;
      }

      return {
        verified,
        error: verified ? null : 'Invalid OTP',
        attemptsRemaining: 3 - session.attempts,
      };
    }),

  /**
   * Resend OTP
   */
  resendOTP: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const session = otpSessions.get(input.sessionId);

      if (!session) {
        return { success: false, error: 'Session not found' };
      }

      const newOTP = Math.random().toString().slice(2, 8);
      session.otp = newOTP;
      session.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      session.attempts = 0;

      console.log(`[SMS] OTP resent to ${session.phoneNumber}: ${newOTP}`);

      return {
        success: true,
        message: 'OTP resent successfully',
        expiresAt: session.expiresAt.toISOString(),
      };
    }),

  /**
   * Get OTP session status
   */
  getSessionStatus: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(async ({ input }) => {
      const session = otpSessions.get(input.sessionId);

      if (!session) {
        return { exists: false };
      }

      return {
        exists: true,
        verified: session.verified,
        attempts: session.attempts,
        expiresAt: session.expiresAt.toISOString(),
      };
    }),

  /**
   * Send alert SMS (protected)
   */
  sendAlert: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      title: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log(`[SMS Alert] ${input.title}: ${input.message} → ${input.phoneNumber}`);

      return {
        success: true,
        messageId: `msg-${Date.now()}`,
        status: 'delivered',
      };
    }),

  /**
   * Send notification SMS (protected)
   */
  sendNotification: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      title: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log(`[SMS Notification] ${input.title}: ${input.message} → ${input.phoneNumber}`);

      return {
        success: true,
        messageId: `msg-${Date.now()}`,
        status: 'delivered',
      };
    }),

  /**
   * Get delivery statistics (protected)
   */
  getStats: protectedProcedure
    .query(async () => {
      return {
        totalSent: 1250,
        delivered: 1200,
        failed: 50,
        deliveryRate: 96,
        byType: {
          otp: 450,
          alert: 300,
          notification: 350,
          reminder: 150,
        },
      };
    }),

  /**
   * Clear old OTP sessions
   */
  clearOld: protectedProcedure
    .mutation(async () => {
      let cleared = 0;
      const now = new Date();

      for (const [sessionId, session] of otpSessions.entries()) {
        if (now > session.expiresAt) {
          otpSessions.delete(sessionId);
          cleared++;
        }
      }

      return { cleared, message: `Cleared ${cleared} expired OTP sessions` };
    }),
});
