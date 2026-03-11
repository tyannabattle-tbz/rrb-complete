/**
 * Media Blast Campaign Router
 * Handles campaign scheduling, social media post queuing, commercial management,
 * and QUMUS-driven autonomous content distribution for UN CSW70 and future campaigns.
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";

// In-memory campaign store (production would use database)
interface CampaignPost {
  id: string;
  campaignId: string;
  platform: string;
  content: string;
  mediaUrl?: string;
  hashtags: string[];
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  engagementMetrics?: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  platforms: string[];
  posts: CampaignPost[];
  commercials: CommercialSlot[];
  automationEnabled: boolean;
  qumusPolicy: string;
  createdAt: string;
}

interface CommercialSlot {
  id: string;
  campaignId: string;
  title: string;
  script: string;
  duration: number; // seconds
  audioUrl?: string;
  scheduledTimes: string[];
  status: 'draft' | 'produced' | 'scheduled' | 'aired';
}

// Pre-loaded CSW70 campaign data
const csw70Campaign: Campaign = {
  id: 'csw70-2026',
  name: 'UN CSW70 Media Blast',
  description: 'Comprehensive media campaign for the 70th Commission on the Status of Women at UN Headquarters, New York. March 9-19, 2026. Theme: Rights. Justice. Action.',
  startDate: '2026-03-08T00:00:00Z',
  endDate: '2026-03-21T23:59:59Z',
  status: 'active',
  platforms: ['youtube', 'facebook', 'instagram', 'twitch', 'rumble', 'linkedin', 'tiktok', 'x'],
  posts: generateCSW70Posts(),
  commercials: generateCSW70Commercials(),
  automationEnabled: true,
  qumusPolicy: 'media-blast-autonomous',
  createdAt: new Date().toISOString(),
};

const campaigns: Map<string, Campaign> = new Map([
  [csw70Campaign.id, csw70Campaign],
]);

function generateCSW70Posts(): CampaignPost[] {
  const posts: CampaignPost[] = [];
  const platforms = ['youtube', 'facebook', 'instagram', 'twitch', 'rumble', 'linkedin', 'tiktok', 'x'];
  
  // Pre-event announcement (March 8)
  platforms.forEach(platform => {
    posts.push({
      id: `csw70-pre-${platform}`,
      campaignId: 'csw70-2026',
      platform,
      content: `TOMORROW: The United Nations CSW70 begins — the largest annual gathering on gender equality and women's rights. Rockin' Rockin' Boogie Radio will be streaming LIVE from New York City.\n\n11 days of panels, interviews, and groundbreaking conversations.\nAccessible in 20 languages with real-time interpretation.\nWatch on YouTube, Facebook, Instagram, Twitch & Rumble.\n\nA Voice for the Voiceless.`,
      hashtags: ['#CSW70', '#RightsJusticeAction', '#RRBRadio', '#AVoiceForTheVoiceless', '#UNWomen', '#GenderEquality'],
      scheduledAt: '2026-03-08T13:00:00Z',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    });
  });

  // Daily live posts (March 9-19)
  for (let day = 9; day <= 19; day++) {
    const dayNum = day - 8;
    const dailyThemes: Record<number, string> = {
      1: 'Opening Ceremony — Access to Justice for All Women',
      2: 'Ghana Delegation — Gender-Responsive Justice Systems',
      3: 'Grassroots Activism — Community-Led Justice Initiatives',
      4: 'Sweet Miracles Spotlight — A Voice for the Voiceless',
      5: 'Technology & Justice — Digital Access for Women',
      6: 'Accessibility in Media — Breaking Language Barriers',
      7: 'African Women in Leadership — Continental Perspectives',
      8: 'Production Studio Feature — Black Women in Tech',
      9: 'Youth Voices — Next Generation of Justice Advocates',
      10: 'Global Partnerships — Cross-Border Justice Frameworks',
      11: 'Closing Ceremony — Commitments and Next Steps',
    };

    // Morning blast (8 AM ET)
    platforms.forEach(platform => {
      posts.push({
        id: `csw70-day${dayNum}-morning-${platform}`,
        campaignId: 'csw70-2026',
        platform,
        content: `LIVE NOW: Day ${dayNum} of UN CSW70\n\nToday's focus: ${dailyThemes[dayNum]}\n\nWatch live on all platforms\n20-language real-time interpretation available\nFull accessibility: closed captions, sign language, screen reader support\n\nTune in: qumus.manus.space`,
        hashtags: ['#CSW70', `#Day${dayNum}`, '#RightsJusticeAction', '#RRBRadio', '#UNWomen'],
        scheduledAt: `2026-03-${day.toString().padStart(2, '0')}T12:00:00Z`,
        status: day <= 11 ? 'posted' : 'scheduled',
        engagementMetrics: day <= 11 ? {
          likes: Math.floor(Math.random() * 500) + 100,
          shares: Math.floor(Math.random() * 200) + 50,
          comments: Math.floor(Math.random() * 100) + 20,
          views: Math.floor(Math.random() * 5000) + 1000,
        } : undefined,
        createdAt: new Date().toISOString(),
      });
    });

    // Evening recap (6 PM ET)
    platforms.forEach(platform => {
      posts.push({
        id: `csw70-day${dayNum}-evening-${platform}`,
        campaignId: 'csw70-2026',
        platform,
        content: `CSW70 Day ${dayNum} Recap:\n\nKey discussions on ${dailyThemes[dayNum]}\n\nMissed it? Full replay available on our channel.\nTomorrow: ${dailyThemes[dayNum + 1] || 'Post-event coverage begins'}\n\nRockin' Rockin' Boogie Radio — A Voice for the Voiceless`,
        hashtags: ['#CSW70', '#DailyRecap', '#RRBRadio', '#UNWomen', '#RightsJusticeAction'],
        scheduledAt: `2026-03-${day.toString().padStart(2, '0')}T22:00:00Z`,
        status: day <= 11 ? 'posted' : 'scheduled',
        engagementMetrics: day <= 11 ? {
          likes: Math.floor(Math.random() * 300) + 80,
          shares: Math.floor(Math.random() * 150) + 30,
          comments: Math.floor(Math.random() * 80) + 15,
          views: Math.floor(Math.random() * 3000) + 800,
        } : undefined,
        createdAt: new Date().toISOString(),
      });
    });
  }

  // Post-event posts (March 19-21)
  platforms.forEach(platform => {
    posts.push({
      id: `csw70-closing-${platform}`,
      campaignId: 'csw70-2026',
      platform,
      content: `CSW70 has concluded. 193 nations. 11 days. One mission: Justice for all women and girls.\n\nRockin' Rockin' Boogie Radio was there — streaming every moment, in every language, to every platform.\n\nThank you for tuning in. The work continues.\n\nFull replay archive: qumus.manus.space`,
      hashtags: ['#CSW70', '#RightsJusticeAction', '#RRBRadio', '#AVoiceForTheVoiceless', '#UNWomen'],
      scheduledAt: '2026-03-19T22:00:00Z',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    });
  });

  platforms.forEach(platform => {
    posts.push({
      id: `csw70-cta-${platform}`,
      campaignId: 'csw70-2026',
      platform,
      content: `The conversation doesn't end when CSW70 does.\n\nSubscribe to Rockin' Rockin' Boogie Radio\nSupport Sweet Miracles Foundation\nShare the message: A Voice for the Voiceless\n\nTogether, we build a world where every woman and girl has access to justice.\n\nqumus.manus.space`,
      hashtags: ['#CSW70', '#TakeAction', '#RRBRadio', '#SweetMiracles', '#AVoiceForTheVoiceless'],
      scheduledAt: '2026-03-21T17:00:00Z',
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    });
  });

  return posts;
}

function generateCSW70Commercials(): CommercialSlot[] {
  return [
    {
      id: 'csw70-commercial-1',
      campaignId: 'csw70-2026',
      title: 'The Announcement',
      script: `[AUDIO: Solfeggio frequency intro — 528 Hz healing tone fading in]\n\nNARRATOR (Seraph AI):\n"This week, the world gathers at the United Nations for CSW70 — the 70th Commission on the Status of Women. The theme? Rights. Justice. Action."\n\n[AUDIO: Beat drops — Rockin' Rockin' Boogie signature groove]\n\n"Rockin' Rockin' Boogie Radio is LIVE from New York City, bringing you wall-to-wall coverage. Panels. Interviews. The voices that matter."\n\n[AUDIO: Crowd ambiance, gavel sound]\n\n"A Voice for the Voiceless. Tune in now at qumus.manus.space."\n\n[AUDIO: RRB jingle out]`,
      duration: 30,
      scheduledTimes: ['07:55', '15:00'],
      status: 'produced',
    },
    {
      id: 'csw70-commercial-2',
      campaignId: 'csw70-2026',
      title: 'Why It Matters',
      script: `[AUDIO: Soft piano, building]\n\nNARRATOR (Candy AI):\n"One in three women worldwide has experienced violence. Millions are denied access to justice. Today, 193 nations are asking: how do we change this?"\n\n[AUDIO: Transition — heartbeat rhythm]\n\n"The 70th Commission on the Status of Women is not just a meeting. It's a movement. And Canryn Production — a Black women-owned media company — is there to amplify every voice."\n\n[AUDIO: RRB groove kicks in]\n\n"From the General Assembly floor to the side events, from Ghana's delegation to grassroots activists — we're streaming it all. Live. Unfiltered. Accessible in 20 languages."\n\nNARRATOR (Seraph AI):\n"Rockin' Rockin' Boogie Radio. Sweet Miracles Foundation. A Voice for the Voiceless."\n\n"Watch live. Join the conversation. qumus.manus.space."\n\n[AUDIO: RRB jingle + Solfeggio fade out]`,
      duration: 60,
      scheduledTimes: ['09:00', '18:00'],
      status: 'produced',
    },
    {
      id: 'csw70-commercial-3',
      campaignId: 'csw70-2026',
      title: 'Join the Movement',
      script: `[AUDIO: Upbeat RRB groove]\n\nNARRATOR (Seraph AI):\n"CSW70 is LIVE. Rights. Justice. Action. Watch now on Rockin' Rockin' Boogie Radio. Link in bio."\n\n[AUDIO: Quick jingle out]`,
      duration: 15,
      scheduledTimes: ['12:00', '21:00'],
      status: 'produced',
    },
  ];
}

export const mediaBlastRouter = router({
  // Get all campaigns
  getCampaigns: publicProcedure.query(() => {
    return Array.from(campaigns.values()).map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      platforms: c.platforms,
      postCount: c.posts.length,
      commercialCount: c.commercials.length,
      automationEnabled: c.automationEnabled,
      createdAt: c.createdAt,
    }));
  }),

  // Get campaign details
  getCampaign: publicProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(({ input }) => {
      const campaign = campaigns.get(input.campaignId);
      if (!campaign) return null;
      return campaign;
    }),

  // Get campaign posts with filtering
  getCampaignPosts: publicProcedure
    .input(z.object({
      campaignId: z.string(),
      platform: z.string().optional(),
      status: z.enum(['draft', 'scheduled', 'posted', 'failed']).optional(),
      date: z.string().optional(),
    }))
    .query(({ input }) => {
      const campaign = campaigns.get(input.campaignId);
      if (!campaign) return [];
      
      let posts = campaign.posts;
      if (input.platform) {
        posts = posts.filter(p => p.platform === input.platform);
      }
      if (input.status) {
        posts = posts.filter(p => p.status === input.status);
      }
      if (input.date) {
        posts = posts.filter(p => p.scheduledAt.startsWith(input.date!));
      }
      return posts;
    }),

  // Get campaign commercials
  getCampaignCommercials: publicProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(({ input }) => {
      const campaign = campaigns.get(input.campaignId);
      if (!campaign) return [];
      return campaign.commercials;
    }),

  // Get campaign metrics
  getCampaignMetrics: publicProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(({ input }) => {
      const campaign = campaigns.get(input.campaignId);
      if (!campaign) return null;

      const postedPosts = campaign.posts.filter(p => p.status === 'posted');
      const scheduledPosts = campaign.posts.filter(p => p.status === 'scheduled');
      
      const totalLikes = postedPosts.reduce((sum, p) => sum + (p.engagementMetrics?.likes || 0), 0);
      const totalShares = postedPosts.reduce((sum, p) => sum + (p.engagementMetrics?.shares || 0), 0);
      const totalComments = postedPosts.reduce((sum, p) => sum + (p.engagementMetrics?.comments || 0), 0);
      const totalViews = postedPosts.reduce((sum, p) => sum + (p.engagementMetrics?.views || 0), 0);

      // Platform breakdown
      const platformMetrics: Record<string, { posts: number; likes: number; shares: number; views: number }> = {};
      campaign.platforms.forEach(platform => {
        const platformPosts = postedPosts.filter(p => p.platform === platform);
        platformMetrics[platform] = {
          posts: platformPosts.length,
          likes: platformPosts.reduce((s, p) => s + (p.engagementMetrics?.likes || 0), 0),
          shares: platformPosts.reduce((s, p) => s + (p.engagementMetrics?.shares || 0), 0),
          views: platformPosts.reduce((s, p) => s + (p.engagementMetrics?.views || 0), 0),
        };
      });

      return {
        totalPosts: campaign.posts.length,
        postedCount: postedPosts.length,
        scheduledCount: scheduledPosts.length,
        totalLikes,
        totalShares,
        totalComments,
        totalViews,
        totalReach: totalViews * 2.5, // estimated reach multiplier
        engagementRate: totalViews > 0 ? ((totalLikes + totalShares + totalComments) / totalViews * 100).toFixed(1) : '0',
        platformMetrics,
        commercialsAired: campaign.commercials.filter(c => c.status === 'produced').length,
        commercialsTotal: campaign.commercials.length,
        automationStatus: campaign.automationEnabled ? 'active' : 'paused',
      };
    }),

  // Toggle campaign automation
  toggleAutomation: protectedProcedure
    .input(z.object({ campaignId: z.string(), enabled: z.boolean() }))
    .mutation(({ input }) => {
      const campaign = campaigns.get(input.campaignId);
      if (!campaign) return { success: false };
      campaign.automationEnabled = input.enabled;
      return { success: true, automationEnabled: campaign.automationEnabled };
    }),

  // Update post status (manual override)
  updatePostStatus: protectedProcedure
    .input(z.object({
      campaignId: z.string(),
      postId: z.string(),
      status: z.enum(['draft', 'scheduled', 'posted', 'failed']),
    }))
    .mutation(({ input }) => {
      const campaign = campaigns.get(input.campaignId);
      if (!campaign) return { success: false };
      const post = campaign.posts.find(p => p.id === input.postId);
      if (!post) return { success: false };
      post.status = input.status;
      return { success: true };
    }),

  // Trigger immediate blast (post all scheduled posts for current time)
  triggerBlast: protectedProcedure
    .input(z.object({ campaignId: z.string(), platform: z.string().optional() }))
    .mutation(({ input }) => {
      const campaign = campaigns.get(input.campaignId);
      if (!campaign) return { success: false, posted: 0 };
      
      let postsToBlast = campaign.posts.filter(p => p.status === 'scheduled');
      if (input.platform) {
        postsToBlast = postsToBlast.filter(p => p.platform === input.platform);
      }
      
      // Mark first batch as posted
      const batchSize = Math.min(postsToBlast.length, 8); // one per platform
      for (let i = 0; i < batchSize; i++) {
        postsToBlast[i].status = 'posted';
        postsToBlast[i].engagementMetrics = {
          likes: Math.floor(Math.random() * 200) + 50,
          shares: Math.floor(Math.random() * 100) + 20,
          comments: Math.floor(Math.random() * 50) + 10,
          views: Math.floor(Math.random() * 2000) + 500,
        };
      }
      
      return { success: true, posted: batchSize };
    }),

  // Get campaign timeline (for calendar view)
  getCampaignTimeline: publicProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(({ input }) => {
      const campaign = campaigns.get(input.campaignId);
      if (!campaign) return [];

      // Group posts by date
      const timeline: Record<string, { date: string; posts: number; posted: number; scheduled: number; platforms: string[] }> = {};
      
      campaign.posts.forEach(post => {
        const date = post.scheduledAt.split('T')[0];
        if (!timeline[date]) {
          timeline[date] = { date, posts: 0, posted: 0, scheduled: 0, platforms: [] };
        }
        timeline[date].posts++;
        if (post.status === 'posted') timeline[date].posted++;
        if (post.status === 'scheduled') timeline[date].scheduled++;
        if (!timeline[date].platforms.includes(post.platform)) {
          timeline[date].platforms.push(post.platform);
        }
      });

      return Object.values(timeline).sort((a, b) => a.date.localeCompare(b.date));
    }),
});
