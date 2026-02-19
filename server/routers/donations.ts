import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

export const donationsRouter = router({
  // Get donation info
  getDonationInfo: publicProcedure.query(async () => {
    return {
      organizationName: 'Rockin\' Rockin\' Boogie - 501(c)(3)',
      ein: '12-3456789',
      mission: 'Preserving the legacy of Seabrun Candy Hunter and supporting music education',
      totalDonationsReceived: 125430.50,
      donorCount: 342,
      impactStatement: 'Your donation helps us preserve music history and support emerging artists',
      purposes: [
        { id: 'legacy_recovery', label: 'Legacy Recovery & Archival', description: 'Digitizing and preserving historical documents and recordings' },
        { id: 'operations', label: 'Operations & Broadcasting', description: 'Supporting podcast production and live broadcasting' },
        { id: 'education', label: 'Music Education', description: 'Funding music education programs and scholarships' },
        { id: 'general', label: 'General Support', description: 'Supporting all aspects of our mission' },
      ],
    };
  }),

  // Create donation intent
  createDonationIntent: publicProcedure
    .input(
      z.object({
        amount: z.number().min(1).max(100000),
        currency: z.string().default('USD'),
        purpose: z.enum(['legacy_recovery', 'operations', 'education', 'general']),
        donorName: z.string().optional(),
        donorEmail: z.string().email().optional(),
        message: z.string().optional(),
        isAnonymous: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      // In production, this would create a Stripe PaymentIntent
      return {
        id: Math.random().toString(36).substr(2, 9),
        amount: input.amount,
        currency: input.currency,
        purpose: input.purpose,
        status: 'pending',
        clientSecret: 'pi_' + Math.random().toString(36).substr(2, 20),
        createdAt: new Date(),
      };
    }),

  // Get donation history
  getDonationHistory: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        id: '1',
        amount: 50.0,
        currency: 'USD',
        purpose: 'legacy_recovery',
        status: 'completed',
        donorName: ctx.user.name,
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: '2',
        amount: 100.0,
        currency: 'USD',
        purpose: 'operations',
        status: 'completed',
        donorName: ctx.user.name,
        createdAt: new Date(Date.now() - 172800000),
      },
    ];
  }),

  // Get donation stats
  getDonationStats: publicProcedure.query(async () => {
    return {
      totalDonations: 125430.50,
      totalDonors: 342,
      averageDonation: 366.87,
      monthlyRecurring: 8500.0,
      topPurpose: 'legacy_recovery',
      donationsByPurpose: {
        legacy_recovery: 65000,
        operations: 40000,
        education: 15000,
        general: 5430.50,
      },
      recentDonations: [
        { amount: 500, purpose: 'legacy_recovery', date: new Date(Date.now() - 3600000) },
        { amount: 250, purpose: 'operations', date: new Date(Date.now() - 7200000) },
        { amount: 100, purpose: 'education', date: new Date(Date.now() - 10800000) },
      ],
    };
  }),

  // Send thank you email
  sendThankYouEmail: publicProcedure
    .input(
      z.object({
        donorEmail: z.string().email(),
        amount: z.number(),
        purpose: z.string(),
        transactionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // In production, this would send an actual email
      return {
        success: true,
        message: `Thank you email sent to ${input.donorEmail}`,
      };
    }),

  // Get tax deduction info
  getTaxDeductionInfo: publicProcedure.query(async () => {
    return {
      ein: '12-3456789',
      organizationName: 'Rockin\' Rockin\' Boogie',
      status: '501(c)(3) Nonprofit Organization',
      taxDeductible: true,
      deductibilityStatement: 'Contributions are tax-deductible to the extent permitted by law. No goods or services were provided in exchange for this contribution.',
      receiptFormat: 'Email receipt will be sent immediately after donation',
      annualReport: 'https://example.com/annual-report-2025.pdf',
    };
  }),
});
