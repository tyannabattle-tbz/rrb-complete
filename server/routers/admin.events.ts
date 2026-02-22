/**
 * Multi-Event Management Router
 * Handles event templates, bulk operations, and centralized calendar management
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';

/**
 * Event template schema
 */
export const eventTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Event name required'),
  description: z.string().optional(),
  eventType: z.enum(['broadcast', 'webinar', 'panel', 'workshop', 'conference']),
  duration: z.number().min(15).max(480), // minutes
  defaultZoomSettings: z.object({
    waitingRoom: z.boolean().default(true),
    recordMeeting: z.boolean().default(true),
    allowParticipantVideo: z.boolean().default(true),
    muteParticipantsUponEntry: z.boolean().default(false),
  }).optional(),
  defaultEmailTemplate: z.string().optional(),
  defaultReminderTimes: z.array(z.number()).default([24 * 60, 60]), // minutes before event
  tags: z.array(z.string()).optional(),
  createdBy: z.string(),
  createdAt: z.date().optional(),
});

/**
 * Event schema
 */
export const eventSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  eventDate: z.date(),
  duration: z.number(),
  templateId: z.string().optional(),
  zoomLink: z.string().url(),
  meetingId: z.string(),
  passcode: z.string(),
  status: z.enum(['draft', 'scheduled', 'live', 'completed', 'cancelled']).default('draft'),
  panelists: z.array(z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['moderator', 'speaker', 'panelist']),
  })).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Bulk import schema
 */
export const bulkImportSchema = z.object({
  eventId: z.string(),
  csvData: z.string(),
  emailTemplate: z.string().optional(),
});

export const adminEventsRouter = router({
  /**
   * Create event template
   */
  createTemplate: adminProcedure
    .input(eventTemplateSchema)
    .mutation(async ({ input, ctx }) => {
      const templateId = `template-${Date.now()}`;
      
      return {
        id: templateId,
        ...input,
        createdAt: new Date(),
        createdBy: ctx.user.id,
      };
    }),

  /**
   * Get all event templates
   */
  getTemplates: adminProcedure.query(async ({ ctx }) => {
    // Mock data - replace with database query
    return [
      {
        id: 'template-broadcast',
        name: 'Standard Broadcast',
        description: 'Default broadcast template',
        eventType: 'broadcast',
        duration: 120,
        defaultReminderTimes: [24 * 60, 60],
        createdBy: ctx.user.id,
        createdAt: new Date(),
      },
      {
        id: 'template-panel',
        name: 'Panel Discussion',
        description: 'Panel discussion template',
        eventType: 'panel',
        duration: 90,
        defaultReminderTimes: [24 * 60, 60, 15],
        createdBy: ctx.user.id,
        createdAt: new Date(),
      },
    ];
  }),

  /**
   * Create event from template
   */
  createEventFromTemplate: adminProcedure
    .input(z.object({
      templateId: z.string(),
      eventName: z.string(),
      eventDate: z.date(),
      zoomLink: z.string().url(),
      meetingId: z.string(),
      passcode: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const eventId = `event-${Date.now()}`;

      return {
        id: eventId,
        name: input.eventName,
        eventDate: input.eventDate,
        zoomLink: input.zoomLink,
        meetingId: input.meetingId,
        passcode: input.passcode,
        templateId: input.templateId,
        status: 'scheduled',
        createdAt: new Date(),
        createdBy: ctx.user.id,
      };
    }),

  /**
   * Bulk import panelists from CSV
   */
  bulkImportPanelists: adminProcedure
    .input(bulkImportSchema)
    .mutation(async ({ input, ctx }) => {
      const lines = input.csvData.trim().split('\n');
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      
      const panelists = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const panelist: any = {};

        headers.forEach((header, index) => {
          panelist[header] = values[index];
        });

        return {
          id: `panelist-${Date.now()}-${Math.random()}`,
          email: panelist.email,
          name: panelist.name,
          role: panelist.role || 'panelist',
        };
      });

      return {
        eventId: input.eventId,
        importedCount: panelists.length,
        panelists,
        timestamp: new Date(),
      };
    }),

  /**
   * Get all events (calendar view)
   */
  getAllEvents: adminProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      status: z.enum(['draft', 'scheduled', 'live', 'completed', 'cancelled']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Mock data - replace with database query
      return [
        {
          id: 'event-1',
          name: 'UN WCS Parallel Event',
          eventDate: new Date('2026-03-17T09:00:00Z'),
          duration: 120,
          status: 'scheduled',
          panelistCount: 5,
          confirmedCount: 4,
        },
        {
          id: 'event-2',
          name: 'Community Broadcast',
          eventDate: new Date('2026-03-20T14:00:00Z'),
          duration: 90,
          status: 'scheduled',
          panelistCount: 8,
          confirmedCount: 6,
        },
      ];
    }),

  /**
   * Get event details
   */
  getEventDetails: adminProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock data - replace with database query
      return {
        id: input.eventId,
        name: 'UN WCS Parallel Event',
        description: 'United Nations World Commission on Sustainable Development',
        eventDate: new Date('2026-03-17T09:00:00Z'),
        duration: 120,
        zoomLink: 'https://zoom.us/j/87926681025',
        meetingId: '879 2681 6025',
        passcode: 'SQUADD2026',
        status: 'scheduled',
        templateId: 'template-broadcast',
        panelists: [
          { id: 'p1', name: 'Dr. Jane Smith', email: 'jane@example.com', role: 'moderator' },
          { id: 'p2', name: 'Prof. John Doe', email: 'john@example.com', role: 'speaker' },
        ],
        createdAt: new Date('2026-02-22'),
        updatedAt: new Date('2026-02-22'),
      };
    }),

  /**
   * Update event
   */
  updateEvent: adminProcedure
    .input(z.object({
      eventId: z.string(),
      data: eventSchema.partial(),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        ...input.data,
        id: input.eventId,
        updatedAt: new Date(),
      };
    }),

  /**
   * Cancel event
   */
  cancelEvent: adminProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return {
        eventId: input.eventId,
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: ctx.user.id,
      };
    }),

  /**
   * Get event statistics
   */
  getEventStats: adminProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock data
      return {
        eventId: input.eventId,
        totalPanelists: 20,
        confirmedPanelists: 15,
        declinedPanelists: 2,
        pendingPanelists: 3,
        confirmationRate: 75,
        emailOpenRate: 70,
        checklistCompletionRate: 65,
        predictedAttendance: 75,
      };
    }),

  /**
   * Export event data
   */
  exportEventData: adminProcedure
    .input(z.object({
      eventId: z.string(),
      format: z.enum(['csv', 'json', 'pdf']),
    }))
    .query(async ({ input, ctx }) => {
      const data = {
        eventId: input.eventId,
        exportedAt: new Date().toISOString(),
        format: input.format,
        url: `/exports/event-${input.eventId}-${Date.now()}.${input.format}`,
      };

      return data;
    }),

  /**
   * Duplicate event
   */
  duplicateEvent: adminProcedure
    .input(z.object({
      eventId: z.string(),
      newEventDate: z.date(),
      newEventName: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const newEventId = `event-${Date.now()}`;

      return {
        id: newEventId,
        name: input.newEventName || `Copy of Event ${input.eventId}`,
        eventDate: input.newEventDate,
        status: 'draft',
        createdAt: new Date(),
        createdBy: ctx.user.id,
        message: 'Event duplicated successfully. Update details and publish when ready.',
      };
    }),

  /**
   * Get event calendar
   */
  getEventCalendar: adminProcedure
    .input(z.object({
      year: z.number(),
      month: z.number().min(1).max(12),
    }))
    .query(async ({ input, ctx }) => {
      const daysInMonth = new Date(input.year, input.month, 0).getDate();
      const events: any[] = [];

      // Mock data
      for (let day = 1; day <= daysInMonth; day++) {
        if (Math.random() > 0.8) {
          events.push({
            date: new Date(input.year, input.month - 1, day),
            eventCount: Math.floor(Math.random() * 3) + 1,
          });
        }
      }

      return {
        year: input.year,
        month: input.month,
        daysInMonth,
        events,
      };
    }),

  /**
   * Get upcoming events
   */
  getUpcomingEvents: adminProcedure
    .input(z.object({
      limit: z.number().default(10),
      daysAhead: z.number().default(30),
    }))
    .query(async ({ input, ctx }) => {
      // Mock data
      return [
        {
          id: 'event-1',
          name: 'UN WCS Parallel Event',
          eventDate: new Date('2026-03-17T09:00:00Z'),
          status: 'scheduled',
          panelistCount: 5,
          confirmedCount: 4,
          daysUntilEvent: 23,
        },
        {
          id: 'event-2',
          name: 'Community Broadcast',
          eventDate: new Date('2026-03-20T14:00:00Z'),
          status: 'scheduled',
          panelistCount: 8,
          confirmedCount: 6,
          daysUntilEvent: 26,
        },
      ];
    }),

  /**
   * Create event series
   */
  createEventSeries: adminProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      templateId: z.string(),
      startDate: z.date(),
      frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
      occurrences: z.number().min(1).max(52),
      zoomLink: z.string().url(),
      meetingId: z.string(),
      passcode: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const seriesId = `series-${Date.now()}`;
      const events = [];

      for (let i = 0; i < input.occurrences; i++) {
        const eventDate = new Date(input.startDate);
        
        switch (input.frequency) {
          case 'daily':
            eventDate.setDate(eventDate.getDate() + i);
            break;
          case 'weekly':
            eventDate.setDate(eventDate.getDate() + i * 7);
            break;
          case 'biweekly':
            eventDate.setDate(eventDate.getDate() + i * 14);
            break;
          case 'monthly':
            eventDate.setMonth(eventDate.getMonth() + i);
            break;
        }

        events.push({
          id: `event-${seriesId}-${i}`,
          name: `${input.name} #${i + 1}`,
          eventDate,
          zoomLink: input.zoomLink,
          meetingId: input.meetingId,
          passcode: input.passcode,
        });
      }

      return {
        seriesId,
        name: input.name,
        frequency: input.frequency,
        occurrences: input.occurrences,
        events,
        createdAt: new Date(),
      };
    }),
});

export default adminEventsRouter;
