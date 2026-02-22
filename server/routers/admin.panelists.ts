import { router, protectedProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { notifyOwner } from '../_core/notification';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import { sendPanelistInvitationEmail, sendStatusConfirmationEmail } from '../_core/emailService';

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

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
        const db = await getDb();
        
        // If database is available, store in database
        if (db) {
          const result = await db.execute(
            sql`INSERT INTO panelists (email, name, role, eventName, zoomLink, meetingId, passcode, eventDate, eventTime, status)
                VALUES (${input.email}, ${input.name}, ${input.role}, ${input.eventName}, ${input.zoomLink}, ${input.meetingId}, ${input.passcode}, ${input.eventDate}, ${input.eventTime}, 'pending')`
          );
          
          const panelistId = `panelist-${(result as any).insertId}`;

          // Send invitation email with Zoom details
          const emailResult = await sendPanelistInvitationEmail({
            panelistName: input.name,
            panelistEmail: input.email,
            role: input.role,
            eventName: input.eventName,
            eventDate: input.eventDate,
            eventTime: input.eventTime,
            zoomLink: input.zoomLink,
            meetingId: input.meetingId,
            passcode: input.passcode,
            confirmationLink: `${process.env.VITE_FRONTEND_URL || 'https://manusweb.manus.space'}/panelist/confirm/${panelistId}`,
          });

          // Notify owner of invitation sent
          await notifyOwner({
            title: `Panelist Invitation Sent: ${input.name}`,
            content: `Invitation sent to ${input.email} for ${input.eventName} on ${input.eventDate} at ${input.eventTime}. Email: ${emailResult.success ? 'Success' : 'Failed'}`,
          });

          return {
            success: true,
            panelistId,
            message: `Invitation sent to ${input.email}`,
          };
        }

        // Fallback: return success without database
        return {
          success: true,
          panelistId: `panelist-${Date.now()}`,
          message: `Invitation prepared for ${input.email}`,
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
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        
        if (!db) {
          return [];
        }

        let query = sql`SELECT id, name, email, role, eventName, status, invitedAt, respondedAt FROM panelists WHERE 1=1`;

        if (input.eventName) {
          query = sql`${query} AND eventName = ${input.eventName}`;
        }

        if (input.status) {
          query = sql`${query} AND status = ${input.status}`;
        }

        const panelists = await db.execute(query);

        return (panelists as any).map((p: any) => ({
          id: p.id.toString(),
          name: p.name,
          email: p.email,
          role: p.role,
          eventName: p.eventName,
          status: p.status,
          invitedAt: p.invitedAt?.toISOString?.() || new Date(p.invitedAt).toISOString(),
          respondedAt: p.respondedAt?.toISOString?.() || (p.respondedAt ? new Date(p.respondedAt).toISOString() : undefined),
        }));
      } catch (error) {
        console.error('Error listing panelists:', error);
        return [];
      }
    }),

  /**
   * Get panelist details
   */
  getPanelistDetails: adminProcedure
    .input(z.object({ panelistId: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        
        if (!db) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Panelist not found',
          });
        }

        const query = sql`SELECT * FROM panelists WHERE id = ${parseInt(input.panelistId.replace('panelist-', ''))}`;
        const result = await db.execute(query);
        const panelist = (result as any)[0];

        if (!panelist) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Panelist not found',
          });
        }

        return {
          id: panelist.id.toString(),
          name: panelist.name,
          email: panelist.email,
          role: panelist.role,
          eventName: panelist.eventName,
          eventDate: panelist.eventDate,
          eventTime: panelist.eventTime,
          status: panelist.status,
          invitedAt: panelist.invitedAt?.toISOString?.() || new Date(panelist.invitedAt).toISOString(),
          respondedAt: panelist.respondedAt?.toISOString?.() || (panelist.respondedAt ? new Date(panelist.respondedAt).toISOString() : undefined),
        };
      } catch (error) {
        console.error('Error getting panelist details:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get panelist details',
        });
      }
    }),

  /**
   * Remove panelist from event
   */
  removePanelist: adminProcedure
    .input(z.object({ panelistId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();

        if (!db) {
          return {
            success: true,
            message: 'Panelist removed',
          };
        }

        const panelistIdNum = parseInt(input.panelistId.replace('panelist-', ''));
        await db.execute(sql`DELETE FROM panelists WHERE id = ${panelistIdNum}`);

        // Notify owner
        await notifyOwner({
          title: 'Panelist Removed',
          content: `Panelist has been removed from the event`,
        });

        return {
          success: true,
          message: 'Panelist has been removed',
        };
      } catch (error) {
        console.error('Error removing panelist:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove panelist',
        });
      }
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
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();

        if (!db) {
          return {
            success: true,
            message: `Status updated to ${input.status}`,
          };
        }

        const panelistIdNum = parseInt(input.panelistId.replace('panelist-', ''));
        
        // Get panelist details for email
        const panelistQuery = sql`SELECT name, email, eventName FROM panelists WHERE id = ${panelistIdNum}`;
        const panelistResult = await db.execute(panelistQuery);
        const panelist = (panelistResult as any)[0];
        
        await db.execute(
          sql`UPDATE panelists SET status = ${input.status}, respondedAt = NOW() WHERE id = ${panelistIdNum}`
        );

        // Send confirmation email
        if (panelist) {
          await sendStatusConfirmationEmail({
            panelistName: panelist.name,
            panelistEmail: panelist.email,
            eventName: panelist.eventName,
            status: input.status,
          });
        }

        return {
          success: true,
          message: `Status updated to ${input.status}`,
        };
      } catch (error) {
        console.error('Error updating panelist status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update status',
        });
      }
    }),

  /**
   * Get event summary with panelist count
   */
  getEventSummary: adminProcedure
    .input(z.object({ eventName: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();

        if (!db) {
          return {
            eventName: input.eventName,
            totalInvited: 0,
            confirmed: 0,
            pending: 0,
            declined: 0,
            panelists: [],
          };
        }

        const query = sql`SELECT id, name, email, role, status FROM panelists WHERE eventName = ${input.eventName}`;
        const panelists = await db.execute(query);

        const panelistsArray = (panelists as any) || [];
        const confirmed = panelistsArray.filter((p: any) => p.status === 'confirmed').length;
        const pending = panelistsArray.filter((p: any) => p.status === 'pending').length;
        const declined = panelistsArray.filter((p: any) => p.status === 'declined').length;

        return {
          eventName: input.eventName,
          totalInvited: panelistsArray.length,
          confirmed,
          pending,
          declined,
          panelists: panelistsArray.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            email: p.email,
            role: p.role,
            status: p.status,
          })),
        };
      } catch (error) {
        console.error('Error getting event summary:', error);
        return {
          eventName: input.eventName,
          totalInvited: 0,
          confirmed: 0,
          pending: 0,
          declined: 0,
          panelists: [],
        };
      }
    }),
});
