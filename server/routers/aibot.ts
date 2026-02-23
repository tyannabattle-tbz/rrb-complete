import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { db } from '../db';
import { callRecords, callerProfiles } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * AI Bot Assistant Router
 * Handles call screening, FAQ, and caller profiles
 */

export const aiBotRouter = router({
  /**
   * Screen incoming call
   */
  screenCall: protectedProcedure
    .input(
      z.object({
        callerId: z.string(),
        callerName: z.string(),
        phoneNumber: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if caller is known
      const existingProfile = await db
        .select()
        .from(callerProfiles)
        .where(eq(callerProfiles.id, input.callerId))
        .limit(1);

      const isKnownCaller = existingProfile.length > 0;
      let profile = existingProfile[0];

      // Create new profile if not found
      if (!profile) {
        const newProfile = {
          id: input.callerId,
          name: input.callerName,
          phoneNumber: input.phoneNumber,
          totalCalls: 0,
          riskLevel: 'low' as const,
          createdAt: new Date(),
        };

        await db.insert(callerProfiles).values(newProfile);
        profile = newProfile as any;
      }

      // Assess risk level
      const riskLevel = assessRiskLevel(profile);

      // Generate recommendations
      const recommendedAction = riskLevel === 'high' ? 'decline' : !isKnownCaller ? 'screen' : 'connect';

      return {
        callerId: input.callerId,
        callerName: input.callerName,
        isKnownCaller,
        riskLevel,
        recommendedAction,
        context: generateCallerContext(profile),
        suggestedQuestions: generateSuggestedQuestions(profile),
      };
    }),

  /**
   * Answer FAQ question
   */
  answerFAQ: protectedProcedure
    .input(z.object({ question: z.string() }))
    .query(async () => {
      const faqDatabase = getFAQDatabase();
      const lowerQuestion = input.question.toLowerCase();

      for (const faq of faqDatabase) {
        if (
          faq.question.toLowerCase().includes(lowerQuestion) ||
          faq.keywords.some(kw => lowerQuestion.includes(kw))
        ) {
          return {
            answer: faq.answer,
            faqId: faq.id,
            category: faq.category,
          };
        }
      }

      return null;
    }),

  /**
   * Record call completion
   */
  recordCallCompletion: protectedProcedure
    .input(
      z.object({
        callerId: z.string(),
        duration: z.number(),
        topic: z.string(),
        sentiment: z.enum(['positive', 'neutral', 'negative']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Record call
      const callRecord = await db
        .insert(callRecords)
        .values({
          id: `call-${Date.now()}`,
          callerId: input.callerId,
          duration: input.duration,
          topic: input.topic,
          sentiment: input.sentiment,
          notes: input.notes,
          createdAt: new Date(),
        })
        .returning();

      // Update caller profile
      const profile = await db
        .select()
        .from(callerProfiles)
        .where(eq(callerProfiles.id, input.callerId))
        .limit(1);

      if (profile.length > 0) {
        const currentProfile = profile[0];
        const newTotalCalls = (currentProfile.totalCalls || 0) + 1;

        await db
          .update(callerProfiles)
          .set({
            totalCalls: newTotalCalls,
            lastCall: new Date(),
          })
          .where(eq(callerProfiles.id, input.callerId));
      }

      return callRecord[0];
    }),

  /**
   * Get caller profile
   */
  getCallerProfile: protectedProcedure
    .input(z.object({ callerId: z.string() }))
    .query(async ({ input }) => {
      const profile = await db
        .select()
        .from(callerProfiles)
        .where(eq(callerProfiles.id, input.callerId))
        .limit(1);

      if (!profile.length) return null;

      const calls = await db
        .select()
        .from(callRecords)
        .where(eq(callRecords.callerId, input.callerId))
        .orderBy(desc(callRecords.createdAt));

      return {
        ...profile[0],
        callHistory: calls,
      };
    }),

  /**
   * Add note to caller profile
   */
  addCallerNote: protectedProcedure
    .input(
      z.object({
        callerId: z.string(),
        note: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Update profile with note (implementation depends on schema)
      return { success: true };
    }),

  /**
   * Get FAQ database
   */
  getFAQDatabase: protectedProcedure.query(async () => {
    return getFAQDatabase();
  }),

  /**
   * Search FAQ by category
   */
  searchFAQByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const faqDatabase = getFAQDatabase();
      return faqDatabase.filter(item => item.category.toLowerCase() === input.category.toLowerCase());
    }),
});

/**
 * Assess risk level based on call history
 */
function assessRiskLevel(profile: any): 'low' | 'medium' | 'high' {
  if (profile.totalCalls === 0) return 'low';
  return profile.riskLevel || 'low';
}

/**
 * Generate caller context
 */
function generateCallerContext(profile: any): string {
  if (profile.totalCalls === 0) {
    return 'First-time caller';
  }

  const lastCall = profile.lastCall ? new Date(profile.lastCall).toLocaleDateString() : 'Unknown';
  return `Returning caller (${profile.totalCalls} calls). Last call: ${lastCall}`;
}

/**
 * Generate suggested questions
 */
function generateSuggestedQuestions(profile: any): string[] {
  if (profile.totalCalls === 0) {
    return [
      'What brings you to RRB today?',
      'How did you hear about us?',
      'What\'s your connection to the legacy?',
    ];
  }

  return [
    'Following up on your previous interest?',
    'Any updates since your last call?',
    'What would you like to share with our listeners today?',
  ];
}

/**
 * Get FAQ database
 */
function getFAQDatabase() {
  return [
    {
      id: 'faq-1',
      question: 'What is Rockin\' Rockin\' Boogie?',
      answer: 'Rockin\' Rockin\' Boogie is a legacy restoration platform celebrating the life and music of Seabrun Candy Hunter and Little Richard.',
      keywords: ['rockin', 'boogie', 'about', 'what', 'legacy'],
      category: 'General',
    },
    {
      id: 'faq-2',
      question: 'How do I participate in the community?',
      answer: 'You can join our community by visiting the Community section, participating in discussions, sharing memories, and attending live events.',
      keywords: ['community', 'join', 'participate', 'member', 'register'],
      category: 'Community',
    },
    {
      id: 'faq-3',
      question: 'Can I call in to the live show?',
      answer: 'Yes! You can call in during live broadcasts. Dial +1-800-RRB-LIVE to connect.',
      keywords: ['call', 'live', 'phone', 'dial', 'broadcast'],
      category: 'Broadcasting',
    },
    {
      id: 'faq-4',
      question: 'How do I access the music library?',
      answer: 'Visit the Music & Radio section to stream our curated collection of classic and contemporary music.',
      keywords: ['music', 'library', 'stream', 'radio', 'listen'],
      category: 'Music',
    },
    {
      id: 'faq-5',
      question: 'What is the Proof Vault?',
      answer: 'The Proof Vault is our digital archive preserving historical documents, photos, and evidence related to the RRB legacy.',
      keywords: ['vault', 'proof', 'archive', 'documents', 'history'],
      category: 'Archive',
    },
    {
      id: 'faq-6',
      question: 'How can I support the foundation?',
      answer: 'You can support RRB through donations, volunteering, or participating in fundraising events.',
      keywords: ['support', 'donate', 'foundation', 'help', 'contribute'],
      category: 'Support',
    },
  ];
}
