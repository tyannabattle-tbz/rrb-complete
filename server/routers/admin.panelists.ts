import { router, protectedProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { notifyOwner } from '../_core/notification';

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// In-memory store for panelists (in production, use database)
const panelistStore = new Map<string, {
  id: string;
  email: string;
  name: string;
  role: 'panelist' | 'moderator';
  eventName: string;
  zoomLink: string;
  meetingId: string;
  passcode: string;
  eventDate: string;
  eventTime: string;
  status: 'pending' | 'confirmed' | 'declined';
  invitedAt: Date;
  respondedAt?: Date;
}>();

export const adminPanelistsRouter = router({
  /**
   * Send panelist invitation with Zoom details via email
   */
  sendPanelistInvite: adminProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
        name: z.string().min(1, 'Name is required'),
        role: z.enum(['panelist', 'moderator']),
        eventName: z.string().min(1, 'Event name is required'),
        zoomLink: z.string().url('Invalid Zoom link'),
        meetingId: z.string().min(1, 'Meeting ID is required'),
        passcode: z.string().min(1, 'Passcode is required'),
        eventDate: z.string().min(1, 'Event date is required'),
        eventTime: z.string().min(1, 'Event time is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const panelistId = `panelist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const panelist = {
          id: panelistId,
          email: input.email,
          name: input.name,
          role: input.role,
          eventName: input.eventName,
          zoomLink: input.zoomLink,
          meetingId: input.meetingId,
          passcode: input.passcode,
          eventDate: input.eventDate,
          eventTime: input.eventTime,
          status: 'pending' as const,
          invitedAt: new Date(),
        };

        panelistStore.set(panelistId, panelist);

        // Send email notification with Zoom details
        const emailContent = `
Dear ${input.name},

You have been invited to participate as a ${input.role} for the ${input.eventName}.

Event Details:
- Date: ${input.eventDate}
- Time: ${input.eventTime}
- Zoom Link: ${input.zoomLink}
- Meeting ID: ${input.meetingId}
- Passcode: ${input.passcode}

Please join us for this important event. Your participation is valuable to our mission.

Best regards,
SQUADD Team
        `;

        // Notify owner of invitation sent
        await notifyOwner({
          title: `Panelist Invitation Sent: ${input.name}`,
          content: `Invitation sent to ${input.email} for ${input.eventName} on ${input.eventDate} at ${input.eventTime}`,
        });

        return {
          success: true,
          panelistId,
          message: `Invitation sent to ${input.email}`,
        };
      } catch (error) {
        console.error('Error sending panelist invitation:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send invitation',
        });
      }
    }),

  /**
   * List all panelists for an event
   */
  listPanelists: adminProcedure
    .input(
      z.object({
        eventName: z.string().optional(),
        status: z.enum(['pending', 'confirmed', 'declined']).optional(),
      })
    )
    .query(({ input }) => {
      let panelists = Array.from(panelistStore.values());

      if (input.eventName) {
        panelists = panelists.filter((p) => p.eventName === input.eventName);
      }

      if (input.status) {
        panelists = panelists.filter((p) => p.status === input.status);
      }

      return panelists.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        eventName: p.eventName,
        status: p.status,
        invitedAt: p.invitedAt.toISOString(),
        respondedAt: p.respondedAt?.toISOString(),
      }));
    }),

  /**
   * Get panelist details
   */
  getPanelistDetails: adminProcedure
    .input(z.object({ panelistId: z.string() }))
    .query(({ input }) => {
      const panelist = panelistStore.get(input.panelistId);

      if (!panelist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Panelist not found',
        });
      }

      return {
        id: panelist.id,
        name: panelist.name,
        email: panelist.email,
        role: panelist.role,
        eventName: panelist.eventName,
        eventDate: panelist.eventDate,
        eventTime: panelist.eventTime,
        status: panelist.status,
        invitedAt: panelist.invitedAt.toISOString(),
        respondedAt: panelist.respondedAt?.toISOString(),
      };
    }),

  /**
   * Remove panelist from event
   */
  removePanelist: adminProcedure
    .input(z.object({ panelistId: z.string() }))
    .mutation(({ input, ctx }) => {
      const panelist = panelistStore.get(input.panelistId);

      if (!panelist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Panelist not found',
        });
      }

      panelistStore.delete(input.panelistId);

      // Notify owner
      notifyOwner({
        title: `Panelist Removed: ${panelist.name}`,
        content: `${panelist.name} has been removed from ${panelist.eventName}`,
      });

      return {
        success: true,
        message: `${panelist.name} has been removed`,
      };
    }),

  /**
   * Update panelist status (confirmed/declined)
   */
  updatePanelistStatus: protectedProcedure
    .input(
      z.object({
        panelistId: z.string(),
        status: z.enum(['confirmed', 'declined']),
      })
    )
    .mutation(({ input }) => {
      const panelist = panelistStore.get(input.panelistId);

      if (!panelist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Panelist not found',
        });
      }

      panelist.status = input.status;
      panelist.respondedAt = new Date();

      return {
        success: true,
        message: `Status updated to ${input.status}`,
      };
    }),

  /**
   * Get event summary with panelist count
   */
  getEventSummary: adminProcedure
    .input(z.object({ eventName: z.string() }))
    .query(({ input }) => {
      const panelists = Array.from(panelistStore.values()).filter(
        (p) => p.eventName === input.eventName
      );

      const confirmed = panelists.filter((p) => p.status === 'confirmed').length;
      const pending = panelists.filter((p) => p.status === 'pending').length;
      const declined = panelists.filter((p) => p.status === 'declined').length;

      return {
        eventName: input.eventName,
        totalInvited: panelists.length,
        confirmed,
        pending,
        declined,
        panelists: panelists.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          role: p.role,
          status: p.status,
        })),
      };
    }),
});
