/**
 * Sweet Miracles Campaigns Router
 * Campaign management, progress tracking, donor leaderboard, and fundraising analytics
 */
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";

interface Campaign {
  id: number;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  status: 'active' | 'completed' | 'paused' | 'draft';
  category: string;
  startDate: string;
  endDate: string | null;
  imageUrl?: string;
  milestones: { amount: number; label: string; reached: boolean }[];
  recentDonations: { name: string; amount: number; date: string; message?: string }[];
  createdBy: string;
}

// In-memory campaigns store (production would use DB)
const campaigns: Campaign[] = [
  {
    id: 1,
    title: "A Voice for the Voiceless",
    description: "Core mission fund supporting community access to broadcast tools, emergency communication, and media production capabilities. Every dollar helps preserve and continue the legacy.",
    goalAmount: 50000,
    raisedAmount: 12450,
    donorCount: 47,
    status: 'active',
    category: 'Core Mission',
    startDate: '2025-11-01',
    endDate: null,
    milestones: [
      { amount: 5000, label: 'Equipment Fund', reached: true },
      { amount: 10000, label: 'Studio Upgrade', reached: true },
      { amount: 25000, label: 'Community Broadcast Kit', reached: false },
      { amount: 50000, label: 'Full Production Suite', reached: false },
    ],
    recentDonations: [
      { name: 'Community Supporter', amount: 100, date: '2026-02-09', message: 'Keep the legacy alive!' },
      { name: 'Anonymous', amount: 250, date: '2026-02-08' },
      { name: 'Music Lover', amount: 50, date: '2026-02-07', message: 'For the music' },
      { name: 'Legacy Builder', amount: 500, date: '2026-02-05', message: 'Generational wealth starts here' },
    ],
    createdBy: 'Sweet Miracles',
  },
  {
    id: 2,
    title: "Emergency Broadcast Equipment",
    description: "Fund mesh networking hardware, LoRa radios, and satellite uplinks for HybridCast emergency broadcast capability. Ensuring communities can communicate during crises.",
    goalAmount: 25000,
    raisedAmount: 8750,
    donorCount: 23,
    status: 'active',
    category: 'Emergency Preparedness',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    milestones: [
      { amount: 5000, label: 'LoRa Gateway Kit', reached: true },
      { amount: 10000, label: 'Mesh Node Network', reached: false },
      { amount: 25000, label: 'Satellite Uplink', reached: false },
    ],
    recentDonations: [
      { name: 'First Responder', amount: 200, date: '2026-02-08', message: 'Communication saves lives' },
      { name: 'Tech Supporter', amount: 1000, date: '2026-02-03' },
    ],
    createdBy: 'HybridCast',
  },
  {
    id: 3,
    title: "Legacy Restored — Archive Digitization",
    description: "Digitize and preserve decades of Rockin' Rockin' Boogie recordings, photographs, and historical documents. Protecting the legacy for future generations.",
    goalAmount: 15000,
    raisedAmount: 15000,
    donorCount: 62,
    status: 'completed',
    category: 'Preservation',
    startDate: '2025-06-01',
    endDate: '2025-12-31',
    milestones: [
      { amount: 5000, label: 'Audio Digitization', reached: true },
      { amount: 10000, label: 'Photo Archive', reached: true },
      { amount: 15000, label: 'Document Preservation', reached: true },
    ],
    recentDonations: [
      { name: 'History Keeper', amount: 100, date: '2025-12-20' },
    ],
    createdBy: 'Canryn Production',
  },
  {
    id: 4,
    title: "Healing Frequencies Studio",
    description: "Build a dedicated healing frequencies recording studio for 432Hz and Solfeggio frequency content production. Making wellness accessible to all.",
    goalAmount: 35000,
    raisedAmount: 4200,
    donorCount: 18,
    status: 'active',
    category: 'Wellness',
    startDate: '2026-01-15',
    endDate: null,
    milestones: [
      { amount: 5000, label: 'Acoustic Treatment', reached: false },
      { amount: 15000, label: 'Recording Equipment', reached: false },
      { amount: 25000, label: 'Tuning Systems', reached: false },
      { amount: 35000, label: 'Full Studio Build', reached: false },
    ],
    recentDonations: [
      { name: 'Wellness Advocate', amount: 75, date: '2026-02-06', message: 'Healing through sound' },
      { name: 'Meditation Teacher', amount: 200, date: '2026-02-01' },
    ],
    createdBy: 'Canryn Production',
  },
  {
    id: 5,
    title: "Community Youth Program",
    description: "Launch a music production and broadcasting training program for underserved youth. Teaching the next generation to produce, broadcast, and share their stories.",
    goalAmount: 20000,
    raisedAmount: 6800,
    donorCount: 31,
    status: 'active',
    category: 'Education',
    startDate: '2026-02-01',
    endDate: '2026-08-31',
    milestones: [
      { amount: 5000, label: 'Curriculum Development', reached: true },
      { amount: 10000, label: 'Equipment for Students', reached: false },
      { amount: 20000, label: 'Full Program Launch', reached: false },
    ],
    recentDonations: [
      { name: 'Educator', amount: 150, date: '2026-02-09', message: 'Invest in the future' },
      { name: 'Youth Advocate', amount: 300, date: '2026-02-04' },
    ],
    createdBy: 'Sweet Miracles',
  },
];

let nextCampaignId = 6;

export const sweetMiraclesCampaignsRouter = router({
  // List all campaigns (public)
  list: publicProcedure
    .input(z.object({
      status: z.enum(['active', 'completed', 'paused', 'draft', 'all']).optional(),
      category: z.string().optional(),
    }).optional())
    .query(({ input }) => {
      let filtered = [...campaigns];
      if (input?.status && input.status !== 'all') {
        filtered = filtered.filter(c => c.status === input.status);
      }
      if (input?.category) {
        filtered = filtered.filter(c => c.category.toLowerCase().includes(input.category!.toLowerCase()));
      }
      return filtered.map(c => ({
        ...c,
        progressPercent: Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100)),
        daysRemaining: c.endDate ? Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000)) : null,
      }));
    }),

  // Get single campaign details
  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => {
      const campaign = campaigns.find(c => c.id === input.id);
      if (!campaign) return null;
      return {
        ...campaign,
        progressPercent: Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100)),
        daysRemaining: campaign.endDate ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / 86400000)) : null,
      };
    }),

  // Create new campaign
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      goalAmount: z.number().min(100),
      category: z.string(),
      endDate: z.string().optional(),
    }))
    .mutation(({ input, ctx }) => {
      const campaign: Campaign = {
        id: nextCampaignId++,
        title: input.title,
        description: input.description,
        goalAmount: input.goalAmount,
        raisedAmount: 0,
        donorCount: 0,
        status: 'active',
        category: input.category,
        startDate: new Date().toISOString().split('T')[0],
        endDate: input.endDate || null,
        milestones: [],
        recentDonations: [],
        createdBy: ctx.user.name || 'Admin',
      };
      campaigns.push(campaign);
      return { success: true, campaign };
    }),

  // Get fundraising overview stats
  getOverview: publicProcedure.query(() => {
    const active = campaigns.filter(c => c.status === 'active');
    const completed = campaigns.filter(c => c.status === 'completed');
    const totalRaised = campaigns.reduce((s, c) => s + c.raisedAmount, 0);
    const totalGoal = active.reduce((s, c) => s + c.goalAmount, 0);
    const totalDonors = campaigns.reduce((s, c) => s + c.donorCount, 0);

    return {
      totalRaised,
      totalGoal,
      totalDonors,
      activeCampaigns: active.length,
      completedCampaigns: completed.length,
      overallProgress: totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0,
      categories: [...new Set(campaigns.map(c => c.category))],
      topCampaign: active.sort((a, b) => b.raisedAmount - a.raisedAmount)[0]?.title || 'N/A',
      recentActivity: campaigns
        .flatMap(c => c.recentDonations.map(d => ({ ...d, campaign: c.title })))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10),
    };
  }),

  // Get donor leaderboard
  getLeaderboard: publicProcedure.query(() => {
    // Aggregate from all campaigns
    const donorMap = new Map<string, { name: string; totalDonated: number; campaigns: number; lastDonation: string }>();
    for (const campaign of campaigns) {
      for (const donation of campaign.recentDonations) {
        const existing = donorMap.get(donation.name);
        if (existing) {
          existing.totalDonated += donation.amount;
          existing.campaigns += 1;
          if (donation.date > existing.lastDonation) existing.lastDonation = donation.date;
        } else {
          donorMap.set(donation.name, {
            name: donation.name,
            totalDonated: donation.amount,
            campaigns: 1,
            lastDonation: donation.date,
          });
        }
      }
    }
    return Array.from(donorMap.values())
      .sort((a, b) => b.totalDonated - a.totalDonated)
      .slice(0, 20)
      .map((d, i) => ({ ...d, rank: i + 1 }));
  }),

  // Update campaign status
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['active', 'completed', 'paused', 'draft']),
    }))
    .mutation(({ input }) => {
      const campaign = campaigns.find(c => c.id === input.id);
      if (!campaign) return { success: false, error: 'Campaign not found' };
      campaign.status = input.status;
      return { success: true };
    }),

  // Simulate a donation (for demo purposes)
  simulateDonation: protectedProcedure
    .input(z.object({
      campaignId: z.number(),
      amount: z.number().min(1),
      donorName: z.string().optional(),
      message: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const campaign = campaigns.find(c => c.id === input.campaignId);
      if (!campaign) return { success: false, error: 'Campaign not found' };
      campaign.raisedAmount += input.amount;
      campaign.donorCount += 1;
      campaign.recentDonations.unshift({
        name: input.donorName || 'Anonymous',
        amount: input.amount,
        date: new Date().toISOString().split('T')[0],
        message: input.message,
      });
      if (campaign.recentDonations.length > 20) campaign.recentDonations.length = 20;
      // Check milestones
      for (const m of campaign.milestones) {
        if (!m.reached && campaign.raisedAmount >= m.amount) m.reached = true;
      }
      // Check if campaign completed
      if (campaign.raisedAmount >= campaign.goalAmount) campaign.status = 'completed';
      return { success: true, newTotal: campaign.raisedAmount, progress: Math.round((campaign.raisedAmount / campaign.goalAmount) * 100) };
    }),
});
