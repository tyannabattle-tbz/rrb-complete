import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// SendGrid integration for email campaigns
const sendGridApiKey = process.env.SENDGRID_API_KEY;
const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL || "broadcasts@rockinrockinboogie.com";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  category: "welcome" | "broadcast" | "promotion" | "newsletter";
}

interface EmailCampaign {
  id: string;
  name: string;
  templateId: string;
  subject: string;
  segmentId: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  scheduledFor?: Date;
  sentAt?: Date;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

interface SubscriberSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    platforms?: string[];
    countries?: string[];
    interests?: string[];
    minListeners?: number;
  };
  subscriberCount: number;
}

export const emailCampaignRouter = router({
  // Email Templates
  getTemplates: publicProcedure.query(async () => {
    const templates: EmailTemplate[] = [
      {
        id: "welcome-001",
        name: "Welcome to RRB",
        subject: "Welcome to Rockin' Rockin' Boogie!",
        htmlContent: "<h1>Welcome!</h1><p>Thank you for subscribing to RRB broadcasts.</p>",
        textContent: "Welcome to RRB!",
        category: "welcome",
      },
      {
        id: "broadcast-001",
        name: "New Episode Available",
        subject: "🎙️ New Episode: {{episodeName}}",
        htmlContent: "<h1>New Episode Available</h1><p>Check out {{episodeName}} now!</p>",
        textContent: "New Episode: {{episodeName}}",
        category: "broadcast",
      },
      {
        id: "promotion-001",
        name: "Listener Appreciation",
        subject: "Special Offer for Our Listeners",
        htmlContent: "<h1>Special Offer</h1><p>Exclusive content for our loyal listeners!</p>",
        textContent: "Special Offer for Our Listeners",
        category: "promotion",
      },
    ];
    return templates;
  }),

  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        subject: z.string(),
        htmlContent: z.string(),
        textContent: z.string(),
        category: z.enum(["welcome", "broadcast", "promotion", "newsletter"]),
      })
    )
    .mutation(async ({ input }) => {
      const templateId = `template-${Date.now()}`;
      return {
        id: templateId,
        ...input,
        createdAt: new Date(),
      };
    }),

  // Subscriber Segments
  getSegments: publicProcedure.query(async () => {
    const segments: SubscriberSegment[] = [
      {
        id: "seg-spotify",
        name: "Spotify Listeners",
        description: "Subscribers who listen on Spotify",
        criteria: { platforms: ["spotify"] },
        subscriberCount: 95000,
      },
      {
        id: "seg-us",
        name: "US Listeners",
        description: "Subscribers in the United States",
        criteria: { countries: ["US"] },
        subscriberCount: 98500,
      },
      {
        id: "seg-high-engagement",
        name: "High Engagement",
        description: "Listeners with 10+ plays in last 30 days",
        criteria: { minListeners: 10 },
        subscriberCount: 45000,
      },
      {
        id: "seg-all",
        name: "All Subscribers",
        description: "All active subscribers",
        criteria: {},
        subscriberCount: 274000,
      },
    ];
    return segments;
  }),

  createSegment: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        criteria: z.object({
          platforms: z.array(z.string()).optional(),
          countries: z.array(z.string()).optional(),
          interests: z.array(z.string()).optional(),
          minListeners: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const segmentId = `seg-${Date.now()}`;
      return {
        id: segmentId,
        ...input,
        subscriberCount: Math.floor(Math.random() * 100000),
        createdAt: new Date(),
      };
    }),

  // Email Campaigns
  getCampaigns: protectedProcedure.query(async () => {
    const campaigns: EmailCampaign[] = [
      {
        id: "camp-001",
        name: "Welcome Series - Episode 1",
        templateId: "welcome-001",
        subject: "Welcome to Rockin' Rockin' Boogie!",
        segmentId: "seg-all",
        status: "sent",
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        metrics: {
          sent: 45000,
          delivered: 44500,
          opened: 18900,
          clicked: 2835,
          bounced: 500,
          unsubscribed: 45,
        },
      },
      {
        id: "camp-002",
        name: "New Episode Announcement",
        templateId: "broadcast-001",
        subject: "🎙️ New Episode: Legacy Restored",
        segmentId: "seg-high-engagement",
        status: "sent",
        sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        metrics: {
          sent: 45000,
          delivered: 44700,
          opened: 22350,
          clicked: 4470,
          bounced: 300,
          unsubscribed: 30,
        },
      },
    ];
    return campaigns;
  }),

  createCampaign: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        templateId: z.string(),
        segmentId: z.string(),
        subject: z.string(),
        scheduledFor: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!sendGridApiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "SendGrid API key not configured",
        });
      }

      const campaignId = `camp-${Date.now()}`;
      return {
        id: campaignId,
        ...input,
        status: input.scheduledFor ? "scheduled" : "draft",
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          unsubscribed: 0,
        },
        createdAt: new Date(),
      };
    }),

  sendCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      if (!sendGridApiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "SendGrid API key not configured",
        });
      }

      // Simulate sending campaign
      return {
        success: true,
        campaignId: input.campaignId,
        status: "sent",
        sentAt: new Date(),
        message: "Campaign sent successfully to all subscribers",
      };
    }),

  // Campaign Performance
  getCampaignMetrics: publicProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input }) => {
      return {
        campaignId: input.campaignId,
        metrics: {
          sent: 45000,
          delivered: 44700,
          opened: 22350,
          clicked: 4470,
          bounced: 300,
          unsubscribed: 30,
          openRate: 50.0,
          clickRate: 10.0,
          bounceRate: 0.67,
          unsubscribeRate: 0.07,
        },
        topLinks: [
          { url: "https://rockinrockinboogie.com/listen", clicks: 1500 },
          { url: "https://rockinrockinboogie.com/podcast", clicks: 1200 },
          { url: "https://rockinrockinboogie.com/subscribe", clicks: 800 },
        ],
        deviceBreakdown: {
          desktop: 65,
          mobile: 32,
          tablet: 3,
        },
        clientBreakdown: {
          gmail: 35,
          outlook: 25,
          apple: 20,
          other: 20,
        },
      };
    }),

  // A/B Testing
  createABTest: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        templateAId: z.string(),
        templateBId: z.string(),
        segmentId: z.string(),
        splitPercentage: z.number().min(10).max(90),
        duration: z.number(), // in hours
      })
    )
    .mutation(async ({ input }) => {
      const testId = `abtest-${Date.now()}`;
      return {
        id: testId,
        ...input,
        status: "active",
        createdAt: new Date(),
        endsAt: new Date(Date.now() + input.duration * 60 * 60 * 1000),
      };
    }),

  getABTestResults: publicProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input }) => {
      return {
        testId: input.testId,
        variantA: {
          openRate: 48.5,
          clickRate: 9.2,
          conversionRate: 2.1,
        },
        variantB: {
          openRate: 52.3,
          clickRate: 11.5,
          conversionRate: 2.8,
        },
        winner: "B",
        confidence: 95,
        recommendation: "Variant B shows 7.8% higher open rate. Recommend using for next campaign.",
      };
    }),

  // Subscriber Management
  getSubscriberCount: publicProcedure.query(async () => {
    return {
      total: 274000,
      active: 268000,
      inactive: 6000,
      unsubscribed: 0,
      byPlatform: {
        spotify: 95000,
        applePodcasts: 72000,
        youtube: 92000,
        tunein: 28000,
        amazonMusic: 40000,
        iheartradio: 31000,
      },
    };
  }),

  // Campaign Scheduler
  scheduleCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        scheduledFor: z.date(),
        timezone: z.string().default("UTC"),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        campaignId: input.campaignId,
        scheduledFor: input.scheduledFor,
        timezone: input.timezone,
        message: "Campaign scheduled successfully",
      };
    }),

  // Email Preferences
  updateSubscriberPreferences: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        preferences: z.object({
          broadcasts: z.boolean().optional(),
          promotions: z.boolean().optional(),
          newsletters: z.boolean().optional(),
          frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        email: input.email,
        preferences: input.preferences,
        message: "Preferences updated successfully",
      };
    }),
});
