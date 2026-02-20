/**
 * Chunked Main Router
 * Splits router imports into 5 chunks to reduce TypeScript compilation load
 * Each chunk is independently compiled, then combined at the top level
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Import router chunks
import { chunk1Router } from "./routerChunks/chunk1";
import { chunk2Router } from "./routerChunks/chunk2";
import { chunk3Router } from "./routerChunks/chunk3";
import { chunk4Router } from "./routerChunks/chunk4";
import { chunk5Router } from "./routerChunks/chunk5";

// Import QUMUS router
import { qumusRouter } from "./routers/qumus";

// Import iTunes Podcasts router
import { itunesPodcastsRouter } from "./routers/itunesPodcasts";

// Import new routers
import { chatStreamingRouter } from "./routers/chatStreamingRouter";
import { locationSharingRouter } from "./routers/locationSharingRouter";
import { sitemapRouter } from "./routers/sitemapRouter";
import { integrationCredentialsRouter } from "./routers/integrationCredentialsRouter";
import { fileAnalysisRouter } from "./routers/fileAnalysisRouter";
import { dashboardRouter } from "./routers/dashboardRouter";
import { broadcastRouter } from "./routers/broadcastRouter";
import { broadcastChatRouter } from "./routers/broadcastChatRouter";
import { broadcastRecordingRouter } from "./routers/broadcastRecordingRouter";
import { hybridcastRouter } from "./routers/hybridcastRouter";
import { hybridcastSyncRouter } from "./routers/hybridcastSyncRouter";
import { solbonesRouter } from "./routers/solbonesRouter";
import { clientPortalRouter } from "./routers/clientPortalRouter";
import { reviewRouter } from "./routers/reviewRouter";
import { meditationRouter } from "./routers/meditation";
import { podcastPlaybackRouter } from "./routers/podcastPlayback";
import { radioStationsRouter } from "./routers/radioStations";
import { studioStreamingRouter } from "./routers/studioStreaming";
import { commandExecutionRouter } from "./routers/commandExecutionRouter";
import { qumusCommandRouter } from "./routers/qumusCommandRouter";
import { audioRouter } from "./routers/audioRouter";
import { qumusAutonomousEntityRouter } from "./routers/qumusAutonomousEntityRouter";
import { rssFeedRouter } from "./routers/rssFeedRouter";
import { socialMediaRouter } from "./routers/socialMediaRouter";
import { qumusAutonomousScalingRouter } from "./routers/qumusAutonomousScalingRouter";
import { qumusChatRouter } from "./routers/qumusChatRouter";
import { qumusIdentityRouter } from "./routers/qumusIdentityRouter";
import { socialSharingRouter } from "./routers/socialSharingRouter";
import { userPreferenceSyncRouter } from "./routers/userPreferenceSyncRouter";
import { offlinePlaylistRouter } from "./routers/offlinePlaylistRouter";
import { agentNetworkRouter } from "./routers/agentNetworkRouter";
import { seamlessAgentConnectionRouter } from "./routers/seamlessAgentConnectionRouter";
import { videoProductionWorkflowRouter } from "./routers/videoProductionWorkflowRouter";
import { qumusOrchestrationRouter } from "./routers/qumusOrchestrationRouter";
import { mapArsenalRouter } from "./mapArsenal";
import { qumusAutonomousFinalizationRouter } from "./qumusAutonomousFinalization";

// QUMUS Advanced Intelligence (cross-policy correlation, anomaly detection, self-assessment)
import { qumusIntelligenceRouter } from "./routers/qumusIntelligenceRouter";

// AI Compare Responses (live LLM-powered multi-system comparison)
import { aiCompareRouter } from "./routers/aiCompareRouter";

// Royalty Tracker for collaborating artists
import { royaltyTrackerRouter } from "./routers/royaltyTracker";
import { royaltyPayoutsRouter } from "./routers/royaltyPayouts";

// QUMUS Code Maintenance Policy (9th autonomous decision policy)
import { codeMaintenanceRouter } from "./routers/codeMaintenanceRouter";

// QUMUS Performance Monitoring Policy (10th autonomous decision policy)
import { performanceMonitoringRouter } from "./routers/performanceMonitoringRouter";

// QUMUS Content Archival Policy (11th autonomous decision policy)
import { contentArchivalRouter } from "./routers/contentArchivalRouter";

// QUMUS Royalty Audit Policy (12th autonomous decision policy)
import { royaltyAuditRouter } from "./routers/royaltyAuditRouter";
import { communityEngagementRouter } from "./routers/communityEngagementRouter";
import { aiContentGenerationRouter } from "./routers/aiContentGenerationRouter";

// Business Operations routers
import { bookkeepingRouter } from "./routers/businessBookkeeping";
import { hrRouter } from "./routers/businessHR";
import { accountingRouter } from "./routers/businessAccounting";
import { legalRouter } from "./routers/businessLegal";

// Radio Directory Listing
import { radioDirectoryRouter } from "./routers/radioDirectory";

// Phase 4-7: Visibility & Engagement Strategy Routers
import { radioDirectoryRouter as phase4RadioDirectoryRouter } from "./routers/radioDirectoryRouter";
import { contentCalendarRouter } from "./routers/contentCalendarRouter";
import { analyticsRouter } from "./routers/analyticsRouter";
import { communityRouter } from "./routers/communityRouter";
import { podcastFeedsRouter } from "./routers/podcastFeedsRouter";
import { realtimeAnalyticsRouter } from "./routers/realtimeAnalyticsRouter";
import { emailCampaignRouter } from "./routers/emailCampaignRouter";
import { channelDiscoveryRouter } from "./routers/channelDiscoveryRouter";
import { transcriptSearchRouter } from "./routers/transcriptSearchRouter";

// AI Business Assistants (5 autonomous bots)
import { aiBusinessAssistantsRouter } from "./routers/aiBusinessAssistants";

// AI Commercial Generation & Radio Integration
import { commercialsRouter } from "./routers/commercials";
import { broadcastSchedulerRouter } from "./routers/broadcastSchedulerRouter";
import { streamingRouter } from "./routers/streamingRouter";
import { emergencyBroadcastRouter } from "./routers/emergencyBroadcastRouter";
import { commercialMP3Router } from "./routers/commercialMP3Router";

// Radio Content API (serves tracks/playlists from database)
import { radioContentRouter } from "./routers/radioContentRouter";

// Video Autopilot (YouTube + Spoke Feeds + Open Source Channels)
import { videoAutopilotRouter } from "./routers/videoAutopilotRouter";
// Content Scheduler (24/7 automated content rotation)
import { contentSchedulerRouter } from "./routers/contentSchedulerRouter";
// Push Notifications (emergency broadcast system)
import { pushNotificationRouter } from "./routers/pushNotificationRouter";
// Listener Analytics (real-time channel metrics)
import { listenerAnalyticsRouter } from "./routers/listenerAnalyticsRouter";

// Payment Integrations
import { stripeIntegrationRouter } from "./routers/stripeIntegration";
import { paypalIntegrationRouter } from "./routers/paypalIntegration";

// RRB (Rockin Rockin Boogie) integrated routers
import { stripePaymentsRouter as rrbStripePaymentsRouter } from "./routers/rrb/stripePayments";
import { emergencyBroadcastRouter as rrbEmergencyBroadcastRouter } from "./routers/rrb/emergencyBroadcast";
import { qumusOrchestrationRouter as rrbQumusOrchestrationRouter } from "./routers/rrb/qumusOrchestration";
import { qumusCompleteRouter as rrbQumusCompleteRouter } from "./routers/rrb/qumusComplete";
import { broadcastRouter as rrbBroadcastRouter } from "./routers/rrb/broadcast";
import { entertainmentRouter as rrbEntertainmentRouter } from "./routers/rrb/entertainment";
import { adminDashboardRouter as rrbEcosystemRouter } from "./ecosystem/admin-dashboard";
import { contentRecommendationRouter, rrbRadioRouter } from "./routers/missingRouterStubs";

import { listenerNotificationsRouter } from './routers/listenerNotificationsRouter';
import { webrtcCallInRouter } from './routers/webrtcCallInRouter';
import { videoPodcastRouter } from './routers/videoPodcastRouter';
import { moderationRouter } from './routers/moderationRouter';
import { notificationPreferencesRouter } from './routers/notificationPreferencesRouter';

export const appRouter = router({
  // System router
  system: systemRouter,

  // Audio router
  audio: audioRouter,

  // Sitemap router for SEO
  sitemap: sitemapRouter,

  // Integration Credentials Manager
  integrationCredentials: integrationCredentialsRouter,

  // Qumus Orchestration (Central Brain)
  qumusOrchestration: qumusOrchestrationRouter,
  listenerNotifications: listenerNotificationsRouter,

  // Auth procedures
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Merge all router chunks
  ...chunk1Router._def.procedures,
  ...chunk2Router._def.procedures,
  ...chunk3Router._def.procedures,
  ...chunk4Router._def.procedures,
  ...chunk5Router._def.procedures,

  // iTunes Podcasts
  itunesPodcasts: itunesPodcastsRouter,

  // Chat Streaming
  chatStreaming: chatStreamingRouter,

  // Location Sharing
  locationSharing: locationSharingRouter,

  // File Analysis
  fileAnalysis: fileAnalysisRouter,

  // Dashboard
  dashboard: dashboardRouter,

  // Broadcast Management
  broadcast: broadcastRouter,

  // Broadcast Chat (Real-time messages)
  broadcastChat: broadcastChatRouter,

  // Broadcast Recording Archive (VOD)
  broadcastRecording: broadcastRecordingRouter,

  // HybridCast Streaming
  hybridcast: hybridcastRouter,

  // HybridCast Data Sync
  hybridcastSync: hybridcastSyncRouter,

  // Solbones Frequency Dice Game
  solbones: solbonesRouter,

  // Client Portal
  clientPortal: clientPortalRouter,

  // Reviews & Ratings
  reviews: reviewRouter,

  // Meditation Hub
  meditation: meditationRouter,

  // Podcast Playback
  podcastPlayback: podcastPlaybackRouter,

  // Video Autopilot (YouTube + Spoke Feeds + Open Source)
  videoAutopilot: videoAutopilotRouter,

  // Radio Stations
  radioStations: radioStationsRouter,

  // Studio Streaming
  studioStreaming: studioStreamingRouter,

  // Command Execution
  commands: commandExecutionRouter,

  // QUMUS Command Router
  qumusCommand: qumusCommandRouter,

  // QUMUS Autonomous Entity Management
  qumusAutonomousEntity: qumusAutonomousEntityRouter,

  // QUMUS Autonomous Scaling & Self-Optimization
  qumusAutonomousScaling: qumusAutonomousScalingRouter,

  // QUMUS Chat Interface & Identity
  ai: router({
    qumusChat: qumusChatRouter,
    qumusIdentity: qumusIdentityRouter,
  }),

  // RSS Feed Distribution
  rssFeed: rssFeedRouter,

  // Social Media Integration
  socialMedia: socialMediaRouter,

  // Social Sharing Features
  socialSharing: socialSharingRouter,

  // User Preference Sync
  preferenceSync: userPreferenceSyncRouter,

  // Offline Playlist Management
  offlinePlaylist: offlinePlaylistRouter,

  // Agent Network - Inter-agent communication
  agentNetwork: agentNetworkRouter,

  // Seamless Agent Connection & Cross-Platform Communication
  seamlessAgentConnection: seamlessAgentConnectionRouter,

  // Video Production Workflow - Generation to RRB Radio Broadcast
  videoProductionWorkflow: videoProductionWorkflowRouter,

  // Map Arsenal - Military-grade tactical mapping
  mapArsenal: mapArsenalRouter,

  // Qumus Autonomous Finalization
  qumusFinalization: qumusAutonomousFinalizationRouter,

  // QUMUS Advanced Intelligence (v11.0)
  qumusIntelligence: qumusIntelligenceRouter,

  // AI Compare Responses (live LLM multi-system comparison)
  aiCompare: aiCompareRouter,

  // Royalty Tracker (artist collaboration earnings)
  royalties: royaltyTrackerRouter,

  // Royalty Payouts (Stripe Connect transfers to artists)
  royaltyPayouts: royaltyPayoutsRouter,

  // Radio Content API (public tracks, playlists, schedules)
  radioContent: radioContentRouter,

  // ===== Payment Integrations =====
  // Stripe Integration (donations for Sweet Miracles Foundation)
  stripe: stripeIntegrationRouter,

  // PayPal Integration (merchandise, services for 501c3 nonprofit)
  paypal: paypalIntegrationRouter,

  // ===== RRB (Rockin Rockin Boogie) Integrated Routers =====
  // RRB Stripe Payments (donations, subscriptions)
  rrbPayments: rrbStripePaymentsRouter,

  // RRB Emergency Broadcast (crisis communication)
  rrbEmergency: rrbEmergencyBroadcastRouter,

  // RRB QUMUS Orchestration (autonomous decision-making)
  rrbQumusOrchestration: rrbQumusOrchestrationRouter,

  // RRB QUMUS Complete (8 policies, human review)
  rrbQumusComplete: rrbQumusCompleteRouter,
  // Alias for dashboard compatibility
  qumusComplete: rrbQumusCompleteRouter,

  // RRB Broadcast (scheduling, streaming, content generation)
  rrbBroadcast: rrbBroadcastRouter,

  // RRB Entertainment (media studio, audio streaming, recommendations)
  rrbEntertainment: rrbEntertainmentRouter,

  // RRB Unified Ecosystem Admin Dashboard
  rrbEcosystem: rrbEcosystemRouter,
  ecosystem: rrbEcosystemRouter,

  // Content Recommendation (AI-powered)
  contentRecommendation: contentRecommendationRouter,

  // RRB Radio (broadcast monitoring)
  rrbRadio: rrbRadioRouter,

  // Content Scheduler (24/7 QUMUS automated rotation)
  contentScheduler: contentSchedulerRouter,

  // Push Notifications (emergency broadcast system)
  pushNotifications: pushNotificationRouter,

  // Listener Analytics (real-time channel metrics)
  listenerAnalytics: listenerAnalyticsRouter,

  // ===== Business Operations (Offline-First) =====
  // Bookkeeping (Chart of Accounts, Journal Entries, General Ledger)
  bookkeeping: bookkeepingRouter,

  // Human Resources (Employees, Departments, Payroll, Time Tracking)
  hr: hrRouter,

  // Accounting (Invoices AR/AP, Payments, Reconciliation)
  accounting: accountingRouter,

  // Contracts & Legal (Contracts, IP, Compliance)
  legal: legalRouter,

  // Radio Directory Listing & Discovery
  radioDirectory: radioDirectoryRouter,

  // AI Business Assistants (5 autonomous bots)
  aiBusinessAssistants: aiBusinessAssistantsRouter,

  // AI Commercial Generation & Radio Broadcast Integration
  commercials: commercialsRouter,

  // QUMUS Code Maintenance (9th policy — broken images, dead links, asset health)
  codeMaintenance: codeMaintenanceRouter,

  // QUMUS Performance Monitoring (10th policy — page load, API latency, memory, uptime)
  performanceMonitoring: performanceMonitoringRouter,

  // QUMUS Content Archival (11th policy — link monitoring, Wayback archival, link rot detection)
  contentArchival: contentArchivalRouter,

  // QUMUS Royalty Audit (12th policy — BMI cross-reference, streaming payout discrepancy detection)
  royaltyAudit: royaltyAuditRouter,
  communityEngagement: communityEngagementRouter,
  aiContentGeneration: aiContentGenerationRouter,

  // ===== Phase 4-7: Radio Platform Visibility & Engagement Strategy =====
  // Phase 4: Radio Directory Listings (TuneIn, Radio Garden, iHeartRadio, Audacy, Shoutcast, Icecast)
  radioDirectoryPhase4: phase4RadioDirectoryRouter,

  // Phase 5: Content Calendar & Promotion (Google Calendar, SendGrid)
  contentCalendar: contentCalendarRouter,

  // Phase 6: Listener Analytics Dashboard (Google Analytics 4, Mixpanel)
  analytics: analyticsRouter,

  // Phase 7: Community & Engagement (Discord, Telegram, VIP Tiers, Referrals)
  community: communityRouter,

  // Podcast Feeds & Multi-Platform Distribution (Spotify, Apple, YouTube, TuneIn, Amazon, iHeartRadio)
  podcastFeeds: podcastFeedsRouter,

  // Phase 5: Real-Time Analytics with Live Listener Data (Spotify, Apple, YouTube, TuneIn, Amazon, iHeartRadio)
  realtimeAnalytics: realtimeAnalyticsRouter,

  // Phase 6: Email Campaign Automation & Promotion (SendGrid integration)
  emailCampaign: emailCampaignRouter,

  // Phase 8: Channel Discovery & Content Search System
  channelDiscovery: channelDiscoveryRouter,
  broadcastScheduler: broadcastSchedulerRouter,

  // Phase 8+: Transcript Search with Timestamp Jumping
  transcriptSearch: transcriptSearchRouter,

  // Phase 9: Streaming Infrastructure for 24/7 Playback
  streaming: streamingRouter,

  // Phase 9+: Emergency Broadcast Scheduling
  emergencyBroadcast: emergencyBroadcastRouter,

  // Phase 9+: Commercial MP3 Upload & Management
  commercialMP3: commercialMP3Router,
  webrtcCallIn: webrtcCallInRouter,
  videoPodcast: videoPodcastRouter,

  // Agent Session Management
  agent: router({
    // Create a new agent session
    createSession: protectedProcedure
      .input(z.object({
        sessionName: z.string().min(1),
        systemPrompt: z.string().optional(),
        temperature: z.number().min(0).max(100).optional(),
        model: z.string().optional(),
        maxSteps: z.number().min(1).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const result = await db.createAgentSession(
          ctx.user.id,
          input.sessionName,
          {
            systemPrompt: input.systemPrompt,
            temperature: input.temperature,
            model: input.model,
            maxSteps: input.maxSteps,
          }
        );
        
        return { success: true, id: result };
      }),

    // Get all sessions for the current user
    getSessions: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return db.getAgentSessionsByUserId(ctx.user.id);
      }),

    // Get session by ID
    getSession: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const session = await db.getAgentSessionById(input);
        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return session;
      }),

    // Delete session
    deleteSession: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const session = await db.getAgentSessionById(input);
        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await db.deleteAgentSession(input);
        return { success: true };
      }),
  }),
  moderation: moderationRouter,
  notificationPreferences: notificationPreferencesRouter,
});

export type AppRouter = typeof appRouter;
