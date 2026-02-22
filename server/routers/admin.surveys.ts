/**
 * Post-Event Feedback & Survey Router
 * Collect panelist feedback and event analytics
 */

import { router, adminProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

/**
 * Survey question schema
 */
export const surveyQuestionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['nps', 'rating', 'text', 'multiple-choice', 'checkbox']),
  question: z.string(),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(),
  order: z.number(),
});

/**
 * Survey schema
 */
export const surveySchema = z.object({
  id: z.string().optional(),
  eventId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(surveyQuestionSchema),
  sendAfter: z.number().default(24), // hours after event
  expiresAfter: z.number().default(7), // days
  status: z.enum(['draft', 'active', 'closed']).default('draft'),
  createdAt: z.date().optional(),
});

/**
 * Survey response schema
 */
export const surveyResponseSchema = z.object({
  id: z.string().optional(),
  surveyId: z.string(),
  panelistId: z.string(),
  responses: z.record(z.any()),
  npsScore: z.number().min(0).max(10).optional(),
  submittedAt: z.date().optional(),
});

export const adminSurveysRouter = router({
  /**
   * Create survey
   */
  createSurvey: adminProcedure
    .input(surveySchema)
    .mutation(async ({ input, ctx }) => {
      const surveyId = `survey-${Date.now()}`;

      return {
        id: surveyId,
        ...input,
        createdAt: new Date(),
        createdBy: ctx.user.id,
      };
    }),

  /**
   * Get surveys for event
   */
  getEventSurveys: adminProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock data
      return [
        {
          id: 'survey-1',
          eventId: input.eventId,
          title: 'UN WCS Event Feedback',
          description: 'Help us improve future broadcasts',
          status: 'active',
          questionCount: 8,
          responseCount: 12,
          createdAt: new Date(),
        },
      ];
    }),

  /**
   * Get survey details
   */
  getSurveyDetails: adminProcedure
    .input(z.object({ surveyId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock data
      return {
        id: input.surveyId,
        title: 'UN WCS Event Feedback',
        description: 'Help us improve future broadcasts',
        questions: [
          {
            id: 'q1',
            type: 'nps',
            question: 'How likely are you to recommend this event to a colleague?',
            required: true,
            order: 1,
          },
          {
            id: 'q2',
            type: 'rating',
            question: 'How would you rate the overall quality of the broadcast?',
            required: true,
            options: ['Excellent', 'Good', 'Fair', 'Poor'],
            order: 2,
          },
          {
            id: 'q3',
            type: 'text',
            question: 'What could we have done better?',
            required: false,
            order: 3,
          },
        ],
        status: 'active',
        createdAt: new Date(),
      };
    }),

  /**
   * Submit survey response
   */
  submitSurveyResponse: protectedProcedure
    .input(surveyResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const responseId = `response-${Date.now()}`;

      return {
        id: responseId,
        ...input,
        submittedAt: new Date(),
        panelistId: ctx.user.id,
      };
    }),

  /**
   * Get survey responses
   */
  getSurveyResponses: adminProcedure
    .input(z.object({ surveyId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock data
      return [
        {
          id: 'response-1',
          panelistId: 'p1',
          panelistName: 'Dr. Jane Smith',
          npsScore: 9,
          submittedAt: new Date(),
        },
        {
          id: 'response-2',
          panelistId: 'p2',
          panelistName: 'Prof. John Doe',
          npsScore: 8,
          submittedAt: new Date(),
        },
        {
          id: 'response-3',
          panelistId: 'p3',
          panelistName: 'Sarah Johnson',
          npsScore: 7,
          submittedAt: new Date(),
        },
      ];
    }),

  /**
   * Get survey analytics
   */
  getSurveyAnalytics: adminProcedure
    .input(z.object({ surveyId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock analytics
      return {
        surveyId: input.surveyId,
        totalResponses: 15,
        responseRate: 75,
        npsScore: 8.2,
        promoters: 12,
        passives: 2,
        detractors: 1,
        averageRating: 4.3,
        completionTime: 180, // seconds
      };
    }),

  /**
   * Get NPS breakdown
   */
  getNPSBreakdown: adminProcedure
    .input(z.object({ surveyId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock NPS breakdown
      return {
        surveyId: input.surveyId,
        npsScore: 73,
        promoters: {
          count: 12,
          percentage: 80,
          feedback: ['Great event!', 'Very informative', 'Well organized'],
        },
        passives: {
          count: 2,
          percentage: 13,
          feedback: ['Good but could be better', 'Interesting topics'],
        },
        detractors: {
          count: 1,
          percentage: 7,
          feedback: ['Technical issues with audio'],
        },
      };
    }),

  /**
   * Get response trends
   */
  getResponseTrends: adminProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock trends
      return [
        { day: 1, responses: 5, npsScore: 8.0 },
        { day: 2, responses: 7, npsScore: 8.1 },
        { day: 3, responses: 3, npsScore: 8.3 },
      ];
    }),

  /**
   * Export survey results
   */
  exportSurveyResults: adminProcedure
    .input(z.object({
      surveyId: z.string(),
      format: z.enum(['csv', 'json', 'pdf']),
    }))
    .query(async ({ input, ctx }) => {
      return {
        surveyId: input.surveyId,
        format: input.format,
        url: `/exports/survey-${input.surveyId}.${input.format}`,
        generatedAt: new Date(),
      };
    }),

  /**
   * Get survey template
   */
  getSurveyTemplate: adminProcedure
    .input(z.object({ templateName: z.string() }))
    .query(async ({ input, ctx }) => {
      const templates: Record<string, any> = {
        'standard-event': {
          title: 'Event Feedback Survey',
          questions: [
            {
              type: 'nps',
              question: 'How likely are you to recommend this event?',
              order: 1,
            },
            {
              type: 'rating',
              question: 'Overall event quality',
              options: ['Excellent', 'Good', 'Fair', 'Poor'],
              order: 2,
            },
            {
              type: 'text',
              question: 'What could we improve?',
              order: 3,
            },
          ],
        },
        'broadcast-quality': {
          title: 'Broadcast Quality Feedback',
          questions: [
            {
              type: 'rating',
              question: 'Audio quality',
              options: ['Excellent', 'Good', 'Fair', 'Poor'],
              order: 1,
            },
            {
              type: 'rating',
              question: 'Video quality',
              options: ['Excellent', 'Good', 'Fair', 'Poor'],
              order: 2,
            },
            {
              type: 'text',
              question: 'Technical issues encountered',
              order: 3,
            },
          ],
        },
      };

      return templates[input.templateName] || templates['standard-event'];
    }),

  /**
   * Create automated survey
   */
  createAutomatedSurvey: adminProcedure
    .input(z.object({
      eventId: z.string(),
      templateName: z.string(),
      sendAfter: z.number().default(24),
    }))
    .mutation(async ({ input, ctx }) => {
      const surveyId = `survey-${Date.now()}`;

      return {
        id: surveyId,
        eventId: input.eventId,
        template: input.templateName,
        status: 'scheduled',
        scheduledFor: new Date(Date.now() + input.sendAfter * 60 * 60 * 1000),
        createdAt: new Date(),
        createdBy: ctx.user.id,
      };
    }),

  /**
   * Get panelist survey status
   */
  getPanelistSurveyStatus: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock data
      return {
        eventId: input.eventId,
        surveys: [
          {
            id: 'survey-1',
            title: 'Event Feedback',
            status: 'completed',
            completedAt: new Date(),
          },
        ],
        pendingSurveys: 0,
      };
    }),

  /**
   * Send survey reminder
   */
  sendSurveyReminder: adminProcedure
    .input(z.object({
      surveyId: z.string(),
      targetSegment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        surveyId: input.surveyId,
        remindersSent: 8,
        sentAt: new Date(),
        sentBy: ctx.user.id,
      };
    }),

  /**
   * Close survey
   */
  closeSurvey: adminProcedure
    .input(z.object({ surveyId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return {
        surveyId: input.surveyId,
        status: 'closed',
        closedAt: new Date(),
        totalResponses: 15,
      };
    }),

  /**
   * Get feedback themes
   */
  getFeedbackThemes: adminProcedure
    .input(z.object({ surveyId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock themes extracted from text responses
      return [
        { theme: 'Audio quality', mentions: 8, sentiment: 'positive' },
        { theme: 'Content relevance', mentions: 6, sentiment: 'positive' },
        { theme: 'Technical issues', mentions: 3, sentiment: 'negative' },
        { theme: 'Duration', mentions: 2, sentiment: 'neutral' },
      ];
    }),
});

export default adminSurveysRouter;
