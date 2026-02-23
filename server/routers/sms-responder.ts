import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { sendSMS, sendOTPSMS, sendEmergencyAlertSMS, getDeliveryStats } from '../services/smsDeliveryService';
import {
  registerResponder,
  getResponder,
  getActiveResponders,
  createSOSAlert,
  getSOSAlert,
  getActiveSOSAlerts,
  assignResponderToAlert,
  acknowledgeSOSAlert,
  resolveSOSAlert,
  getResponderStats,
  getSOSAlertStats,
  updateResponderStatus,
} from '../services/responderNetworkService';

/**
 * SMS and Responder Router
 * Handles SMS delivery, responder management, and SOS alerts
 */

export const smsResponderRouter = router({
  // ============================================
  // SMS Delivery Procedures
  // ============================================

  sendSMS: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
        message: z.string().min(1).max(1000),
        messageType: z.enum(['otp', 'alert', 'notification', 'reminder']),
        language: z.string().default('en'),
        priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can send SMS
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can send SMS');
      }

      const result = await sendSMS({
        phoneNumber: input.phoneNumber,
        message: input.message,
        messageType: input.messageType,
        language: input.language,
        priority: input.priority,
      });

      return result;
    }),

  sendOTP: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
        otp: z.string().length(6),
        language: z.string().default('en'),
      })
    )
    .mutation(async ({ input }) => {
      return await sendOTPSMS(input.phoneNumber, input.otp, input.language);
    }),

  sendEmergencyAlert: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
        alertTitle: z.string().min(1).max(100),
        alertMessage: z.string().min(1).max(500),
        language: z.string().default('en'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins and coordinators can send emergency alerts
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'coordinator') {
        throw new Error('Only admins and coordinators can send emergency alerts');
      }

      return await sendEmergencyAlertSMS(input.phoneNumber, input.alertTitle, input.alertMessage, input.language);
    }),

  getDeliveryStats: protectedProcedure.query(async ({ ctx }) => {
    // Only admins can view delivery stats
    if (ctx.user.role !== 'admin') {
      throw new Error('Only admins can view delivery statistics');
    }

    return getDeliveryStats();
  }),

  // ============================================
  // Responder Management Procedures
  // ============================================

  registerResponder: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        role: z.enum(['coordinator', 'operator', 'medical', 'security', 'volunteer']),
        phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
        email: z.string().email(),
        certifications: z.array(z.string()).default([]),
        languages: z.array(z.string()).default(['en']),
        maxConcurrentCalls: z.number().min(1).max(10).default(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can register responders
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can register responders');
      }

      const responder = registerResponder({
        ...input,
        status: 'active',
        availability: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '17:00' }],
          saturday: [],
          sunday: [],
        },
        currentCallCount: 0,
        responseTime: 60,
        successRate: 100,
      });

      return responder;
    }),

  getResponder: protectedProcedure
    .input(z.object({ responderId: z.string() }))
    .query(({ input, ctx }) => {
      // Only admins and coordinators can view responder details
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'coordinator') {
        throw new Error('Only admins and coordinators can view responder details');
      }

      return getResponder(input.responderId);
    }),

  getActiveResponders: protectedProcedure.query(({ ctx }) => {
    // Only admins and coordinators can view active responders
    if (ctx.user.role !== 'admin' && ctx.user.role !== 'coordinator') {
      throw new Error('Only admins and coordinators can view responders');
    }

    return getActiveResponders();
  }),

  getResponderStats: protectedProcedure.query(({ ctx }) => {
    // Only admins can view responder statistics
    if (ctx.user.role !== 'admin') {
      throw new Error('Only admins can view responder statistics');
    }

    return getResponderStats();
  }),

  updateResponderStatus: protectedProcedure
    .input(
      z.object({
        responderId: z.string(),
        status: z.enum(['active', 'inactive', 'on-duty', 'off-duty']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can update responder status
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can update responder status');
      }

      const success = updateResponderStatus(input.responderId, input.status);

      if (!success) {
        throw new Error('Responder not found');
      }

      return { success: true, message: 'Responder status updated' };
    }),

  // ============================================
  // SOS Alert Procedures
  // ============================================

  createSOSAlert: protectedProcedure
    .input(
      z.object({
        callerId: z.string(),
        callerName: z.string(),
        callerPhone: z.string(),
        alertType: z.enum(['medical', 'security', 'mental-health', 'other']),
        description: z.string().min(1).max(1000),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        location: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
            address: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only operators and above can create SOS alerts
      if (ctx.user.role === 'user') {
        throw new Error('Only operators and above can create SOS alerts');
      }

      const alert = createSOSAlert({
        callerId: input.callerId,
        callerName: input.callerName,
        callerPhone: input.callerPhone,
        alertType: input.alertType,
        description: input.description,
        severity: input.severity,
        location: input.location,
      });

      return alert;
    }),

  getSOSAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .query(({ input, ctx }) => {
      // Only admins and coordinators can view SOS alerts
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'coordinator') {
        throw new Error('Only admins and coordinators can view SOS alerts');
      }

      return getSOSAlert(input.alertId);
    }),

  getActiveSOSAlerts: protectedProcedure.query(({ ctx }) => {
    // Only admins and coordinators can view active SOS alerts
    if (ctx.user.role !== 'admin' && ctx.user.role !== 'coordinator') {
      throw new Error('Only admins and coordinators can view SOS alerts');
    }

    return getActiveSOSAlerts();
  }),

  assignResponderToAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
        responderId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only coordinators and admins can assign responders
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'coordinator') {
        throw new Error('Only coordinators and admins can assign responders');
      }

      const success = assignResponderToAlert(input.alertId, input.responderId);

      if (!success) {
        throw new Error('Alert or responder not found');
      }

      return { success: true, message: 'Responder assigned to alert' };
    }),

  acknowledgeSOSAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
        responderId: z.string(),
        note: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only responders can acknowledge alerts
      if (ctx.user.role === 'user') {
        throw new Error('Only responders can acknowledge alerts');
      }

      const success = acknowledgeSOSAlert(input.alertId, input.responderId, input.note);

      if (!success) {
        throw new Error('Alert not found');
      }

      return { success: true, message: 'Alert acknowledged' };
    }),

  resolveSOSAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
        responderId: z.string(),
        resolution: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only responders can resolve alerts
      if (ctx.user.role === 'user') {
        throw new Error('Only responders can resolve alerts');
      }

      const success = resolveSOSAlert(input.alertId, input.responderId, input.resolution);

      if (!success) {
        throw new Error('Alert not found');
      }

      return { success: true, message: 'Alert resolved' };
    }),

  getSOSAlertStats: protectedProcedure.query(({ ctx }) => {
    // Only admins can view SOS alert statistics
    if (ctx.user.role !== 'admin') {
      throw new Error('Only admins can view SOS alert statistics');
    }

    return getSOSAlertStats();
  }),
});
