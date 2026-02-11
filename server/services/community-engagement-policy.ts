/**
 * QUMUS Community Engagement Policy — 13th Autonomous Decision Policy
 * Tracks listener interactions, forum activity, donation patterns, and community health.
 * Optimizes outreach, detects engagement drops, and recommends community actions.
 * 91% autonomy — auto-processes engagement metrics, escalates community concerns
 */

import { QumusCompleteEngine } from '../qumus-complete-engine';

// ============ Types ============

export type EngagementChannel = 'radio' | 'podcast' | 'forum' | 'donation' | 'solbones' | 'meditation' | 'social' | 'hybridcast' | 'merchandise';
export type EngagementTrend = 'rising' | 'stable' | 'declining' | 'critical';
export type MemberTier = 'new' | 'active' | 'engaged' | 'champion' | 'ambassador';

export interface CommunityMember {
  id: string;
  name: string;
  tier: MemberTier;
  joinedAt: number;
  lastActiveAt: number;
  engagementScore: number; // 0-100
  totalInteractions: number;
  donationTotal: number;
  channelActivity: Partial<Record<EngagementChannel, number>>;
  badges: string[];
  streak: number; // consecutive active days
}

export interface EngagementEvent {
  id: string;
  memberId: string;
  channel: EngagementChannel;
  action: string;
  timestamp: number;
  value: number; // engagement weight
  metadata?: Record<string, string>;
}

export interface EngagementMetric {
  channel: EngagementChannel;
  totalEvents: number;
  uniqueMembers: number;
  averageScore: number;
  trend: EngagementTrend;
  peakHour: number;
  topActions: { action: string; count: number }[];
}

export interface CommunityReport {
  id: string;
  generatedAt: number;
  period: string;
  totalMembers: number;
  activeMembers: number;
  newMembers: number;
  churned: number;
  totalEvents: number;
  engagementRate: number;
  donationTotal: number;
  topChannels: { channel: EngagementChannel; score: number }[];
  recommendations: string[];
  healthScore: number;
  healthGrade: string;
}

export interface EngagementSummary {
  totalMembers: number;
  activeMembers: number;
  newMembersThisWeek: number;
  averageEngagementScore: number;
  totalEvents: number;
  totalDonations: number;
  channelBreakdown: Record<EngagementChannel, number>;
  overallTrend: EngagementTrend;
  healthScore: number;
  healthGrade: string;
  topChannels: { channel: EngagementChannel; score: number }[];
  recentReports: number;
  schedulerActive: boolean;
}

export interface EngagementSchedulerStatus {
  enabled: boolean;
  intervalMs: number;
  intervalHuman: string;
  lastCheck: number | null;
  totalChecks: number;
  nextCheckEstimate: number;
}

// ============ In-Memory Store ============

const communityMembers: CommunityMember[] = [];
const engagementEvents: EngagementEvent[] = [];
const communityReports: CommunityReport[] = [];
let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let schedulerEnabled = false;
let schedulerIntervalMs = 4 * 60 * 60 * 1000; // 4 hours default
let totalScheduledChecks = 0;
let lastScheduledCheck: number | null = null;

// ============ Helpers ============

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function formatInterval(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function calculateGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

function determineTrend(events: EngagementEvent[], channel?: EngagementChannel): EngagementTrend {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const filtered = channel ? events.filter(e => e.channel === channel) : events;
  const thisWeek = filtered.filter(e => e.timestamp > now - week).length;
  const lastWeek = filtered.filter(e => e.timestamp > now - 2 * week && e.timestamp <= now - week).length;
  
  if (lastWeek === 0) return thisWeek > 0 ? 'rising' : 'stable';
  const ratio = thisWeek / lastWeek;
  if (ratio >= 1.2) return 'rising';
  if (ratio >= 0.8) return 'stable';
  if (ratio >= 0.5) return 'declining';
  return 'critical';
}

function determineMemberTier(member: CommunityMember): MemberTier {
  if (member.engagementScore >= 90 && member.totalInteractions >= 100) return 'ambassador';
  if (member.engagementScore >= 75 && member.totalInteractions >= 50) return 'champion';
  if (member.engagementScore >= 50 && member.totalInteractions >= 20) return 'engaged';
  if (member.totalInteractions >= 5) return 'active';
  return 'new';
}

// ============ Default Seed Data ============

const DEFAULT_MEMBERS: Omit<CommunityMember, 'id'>[] = [
  { name: 'Legacy Listener Alpha', tier: 'champion', joinedAt: Date.now() - 90 * 86400000, lastActiveAt: Date.now() - 3600000, engagementScore: 82, totalInteractions: 67, donationTotal: 50, channelActivity: { radio: 30, podcast: 20, forum: 10, donation: 7 }, badges: ['Early Adopter', 'Radio Fan', 'Donor'], streak: 14 },
  { name: 'Solbones Player Beta', tier: 'engaged', joinedAt: Date.now() - 60 * 86400000, lastActiveAt: Date.now() - 7200000, engagementScore: 65, totalInteractions: 34, donationTotal: 0, channelActivity: { solbones: 20, meditation: 8, radio: 6 }, badges: ['Game Master', 'Frequency Seeker'], streak: 7 },
  { name: 'Meditation Seeker Gamma', tier: 'active', joinedAt: Date.now() - 30 * 86400000, lastActiveAt: Date.now() - 86400000, engagementScore: 45, totalInteractions: 12, donationTotal: 25, channelActivity: { meditation: 8, donation: 2, radio: 2 }, badges: ['Healer'], streak: 3 },
  { name: 'Community Builder Delta', tier: 'ambassador', joinedAt: Date.now() - 120 * 86400000, lastActiveAt: Date.now() - 1800000, engagementScore: 95, totalInteractions: 150, donationTotal: 200, channelActivity: { forum: 50, radio: 40, podcast: 30, donation: 15, social: 15 }, badges: ['Ambassador', 'Top Donor', 'Community Leader', 'Early Adopter'], streak: 30 },
  { name: 'Emergency Responder Epsilon', tier: 'engaged', joinedAt: Date.now() - 45 * 86400000, lastActiveAt: Date.now() - 43200000, engagementScore: 58, totalInteractions: 22, donationTotal: 10, channelActivity: { hybridcast: 12, radio: 6, forum: 4 }, badges: ['First Responder'], streak: 5 },
  { name: 'Merch Supporter Zeta', tier: 'active', joinedAt: Date.now() - 20 * 86400000, lastActiveAt: Date.now() - 172800000, engagementScore: 38, totalInteractions: 8, donationTotal: 75, channelActivity: { merchandise: 4, donation: 3, radio: 1 }, badges: ['Supporter'], streak: 1 },
  { name: 'New Listener Eta', tier: 'new', joinedAt: Date.now() - 3 * 86400000, lastActiveAt: Date.now() - 3600000, engagementScore: 15, totalInteractions: 3, donationTotal: 0, channelActivity: { radio: 2, podcast: 1 }, badges: [], streak: 2 },
  { name: 'Podcast Enthusiast Theta', tier: 'engaged', joinedAt: Date.now() - 75 * 86400000, lastActiveAt: Date.now() - 14400000, engagementScore: 72, totalInteractions: 45, donationTotal: 30, channelActivity: { podcast: 25, radio: 10, forum: 8, donation: 2 }, badges: ['Podcast Fan', 'Donor'], streak: 10 },
];

const DEFAULT_EVENTS: Omit<EngagementEvent, 'id'>[] = [
  { memberId: '', channel: 'radio', action: 'listen', timestamp: Date.now() - 3600000, value: 1 },
  { memberId: '', channel: 'radio', action: 'listen', timestamp: Date.now() - 7200000, value: 1 },
  { memberId: '', channel: 'podcast', action: 'subscribe', timestamp: Date.now() - 86400000, value: 3 },
  { memberId: '', channel: 'forum', action: 'post', timestamp: Date.now() - 43200000, value: 2 },
  { memberId: '', channel: 'donation', action: 'donate', timestamp: Date.now() - 172800000, value: 5, metadata: { amount: '25' } },
  { memberId: '', channel: 'solbones', action: 'play_game', timestamp: Date.now() - 14400000, value: 2 },
  { memberId: '', channel: 'meditation', action: 'session_complete', timestamp: Date.now() - 28800000, value: 2 },
  { memberId: '', channel: 'hybridcast', action: 'drill_participate', timestamp: Date.now() - 259200000, value: 3 },
  { memberId: '', channel: 'social', action: 'share', timestamp: Date.now() - 21600000, value: 2 },
  { memberId: '', channel: 'merchandise', action: 'purchase', timestamp: Date.now() - 345600000, value: 4, metadata: { item: 'RRB T-Shirt' } },
  { memberId: '', channel: 'radio', action: 'request_song', timestamp: Date.now() - 10800000, value: 2 },
  { memberId: '', channel: 'podcast', action: 'listen_episode', timestamp: Date.now() - 50400000, value: 1 },
  { memberId: '', channel: 'forum', action: 'reply', timestamp: Date.now() - 36000000, value: 1 },
  { memberId: '', channel: 'donation', action: 'recurring_setup', timestamp: Date.now() - 604800000, value: 10, metadata: { amount: '10', frequency: 'monthly' } },
  { memberId: '', channel: 'radio', action: 'channel_switch', timestamp: Date.now() - 5400000, value: 1 },
];

// ============ Initialization ============

function initialize(): void {
  if (communityMembers.length > 0) return;
  
  DEFAULT_MEMBERS.forEach(m => {
    communityMembers.push({ ...m, id: generateId('member') });
  });
  
  // Assign events to random members
  DEFAULT_EVENTS.forEach(e => {
    const member = communityMembers[Math.floor(Math.random() * communityMembers.length)];
    engagementEvents.push({ ...e, id: generateId('event'), memberId: member.id });
  });
  
  console.log(`[QUMUS CommunityEngagement] Initialized ${communityMembers.length} members, ${engagementEvents.length} events`);
}

initialize();

// ============ Core Functions ============

export function getMembers(filter?: { tier?: MemberTier; channel?: EngagementChannel }): CommunityMember[] {
  let result = [...communityMembers];
  if (filter?.tier) result = result.filter(m => m.tier === filter.tier);
  if (filter?.channel) result = result.filter(m => (m.channelActivity[filter.channel!] || 0) > 0);
  return result.sort((a, b) => b.engagementScore - a.engagementScore);
}

export function getMember(memberId: string): CommunityMember | undefined {
  return communityMembers.find(m => m.id === memberId);
}

export function recordEvent(event: Omit<EngagementEvent, 'id'>): EngagementEvent {
  const newEvent: EngagementEvent = { ...event, id: generateId('event') };
  engagementEvents.push(newEvent);
  
  // Update member stats
  const member = communityMembers.find(m => m.id === event.memberId);
  if (member) {
    member.totalInteractions++;
    member.lastActiveAt = event.timestamp;
    member.channelActivity[event.channel] = (member.channelActivity[event.channel] || 0) + 1;
    if (event.channel === 'donation' && event.metadata?.amount) {
      member.donationTotal += parseFloat(event.metadata.amount);
    }
    // Recalculate engagement score
    const daysSinceJoin = Math.max(1, (Date.now() - member.joinedAt) / 86400000);
    const interactionRate = member.totalInteractions / daysSinceJoin;
    member.engagementScore = Math.min(100, Math.round(interactionRate * 20 + member.streak * 2 + (member.donationTotal > 0 ? 10 : 0)));
    member.tier = determineMemberTier(member);
  }
  
  return newEvent;
}

export function getEvents(filter?: { channel?: EngagementChannel; memberId?: string; limit?: number }): EngagementEvent[] {
  let result = [...engagementEvents];
  if (filter?.channel) result = result.filter(e => e.channel === filter.channel);
  if (filter?.memberId) result = result.filter(e => e.memberId === filter.memberId);
  result.sort((a, b) => b.timestamp - a.timestamp);
  if (filter?.limit) result = result.slice(0, filter.limit);
  return result;
}

export function getChannelMetrics(): EngagementMetric[] {
  const channels: EngagementChannel[] = ['radio', 'podcast', 'forum', 'donation', 'solbones', 'meditation', 'social', 'hybridcast', 'merchandise'];
  
  return channels.map(channel => {
    const channelEvents = engagementEvents.filter(e => e.channel === channel);
    const uniqueMembers = new Set(channelEvents.map(e => e.memberId)).size;
    const scores = communityMembers
      .filter(m => (m.channelActivity[channel] || 0) > 0)
      .map(m => m.engagementScore);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    
    // Calculate peak hour
    const hourCounts = new Array(24).fill(0);
    channelEvents.forEach(e => { hourCounts[new Date(e.timestamp).getHours()]++; });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    
    // Top actions
    const actionCounts: Record<string, number> = {};
    channelEvents.forEach(e => { actionCounts[e.action] = (actionCounts[e.action] || 0) + 1; });
    const topActions = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([action, count]) => ({ action, count }));
    
    return {
      channel,
      totalEvents: channelEvents.length,
      uniqueMembers,
      averageScore,
      trend: determineTrend(engagementEvents, channel),
      peakHour,
      topActions,
    };
  });
}

// ============ Report Generation ============

export function generateReport(): CommunityReport {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  
  const activeMembers = communityMembers.filter(m => m.lastActiveAt > now - week).length;
  const newMembers = communityMembers.filter(m => m.joinedAt > now - week).length;
  const churned = communityMembers.filter(m => m.lastActiveAt < now - 30 * 86400000).length;
  const totalEvents = engagementEvents.filter(e => e.timestamp > now - week).length;
  const engagementRate = communityMembers.length > 0 ? Math.round((activeMembers / communityMembers.length) * 100) : 0;
  const donationTotal = communityMembers.reduce((sum, m) => sum + m.donationTotal, 0);
  
  const channelScores: { channel: EngagementChannel; score: number }[] = getChannelMetrics()
    .map(m => ({ channel: m.channel, score: m.averageScore }))
    .sort((a, b) => b.score - a.score);
  
  const recommendations: string[] = [];
  
  if (engagementRate < 50) recommendations.push('Engagement rate below 50% — consider outreach campaign or community event');
  if (churned > communityMembers.length * 0.2) recommendations.push(`${churned} members inactive for 30+ days — launch re-engagement campaign`);
  if (newMembers === 0) recommendations.push('No new members this week — increase visibility through social media and cross-promotion');
  
  const lowChannels = channelScores.filter(c => c.score < 30);
  if (lowChannels.length > 0) recommendations.push(`Low engagement on: ${lowChannels.map(c => c.channel).join(', ')} — consider content refresh or promotion`);
  
  if (donationTotal < 100) recommendations.push('Donation total below target — highlight Sweet Miracles mission in upcoming broadcasts');
  
  const overallTrend = determineTrend(engagementEvents);
  if (overallTrend === 'declining') recommendations.push('Overall engagement declining — schedule community call or special broadcast event');
  if (overallTrend === 'critical') recommendations.push('CRITICAL: Engagement in freefall — immediate intervention needed');
  
  if (recommendations.length === 0) recommendations.push('Community health is strong — maintain current engagement strategies');
  
  const healthScore = Math.min(100, Math.round(
    engagementRate * 0.3 +
    (100 - (churned / Math.max(1, communityMembers.length)) * 100) * 0.2 +
    (newMembers > 0 ? 20 : 0) +
    (channelScores.slice(0, 3).reduce((s, c) => s + c.score, 0) / 3) * 0.3
  ));
  
  const report: CommunityReport = {
    id: generateId('report'),
    generatedAt: now,
    period: `${new Date(now - week).toISOString().split('T')[0]} to ${new Date(now).toISOString().split('T')[0]}`,
    totalMembers: communityMembers.length,
    activeMembers,
    newMembers,
    churned,
    totalEvents,
    engagementRate,
    donationTotal,
    topChannels: channelScores.slice(0, 5),
    recommendations,
    healthScore,
    healthGrade: calculateGrade(healthScore),
  };
  
  communityReports.push(report);
  return report;
}

// ============ Summary ============

export function getEngagementSummary(): EngagementSummary {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  
  const activeMembers = communityMembers.filter(m => m.lastActiveAt > now - week).length;
  const newMembersThisWeek = communityMembers.filter(m => m.joinedAt > now - week).length;
  const avgScore = communityMembers.length > 0
    ? Math.round(communityMembers.reduce((s, m) => s + m.engagementScore, 0) / communityMembers.length)
    : 0;
  const totalDonations = communityMembers.reduce((s, m) => s + m.donationTotal, 0);
  
  const channelBreakdown: Record<EngagementChannel, number> = {
    radio: 0, podcast: 0, forum: 0, donation: 0, solbones: 0,
    meditation: 0, social: 0, hybridcast: 0, merchandise: 0,
  };
  engagementEvents.forEach(e => { channelBreakdown[e.channel]++; });
  
  const channelScores = getChannelMetrics()
    .map(m => ({ channel: m.channel, score: m.averageScore }))
    .sort((a, b) => b.score - a.score);
  
  const overallTrend = determineTrend(engagementEvents);
  const healthScore = Math.min(100, Math.round(
    (activeMembers / Math.max(1, communityMembers.length)) * 50 +
    avgScore * 0.3 +
    (newMembersThisWeek > 0 ? 10 : 0) +
    (totalDonations > 0 ? 10 : 0)
  ));
  
  return {
    totalMembers: communityMembers.length,
    activeMembers,
    newMembersThisWeek,
    averageEngagementScore: avgScore,
    totalEvents: engagementEvents.length,
    totalDonations,
    channelBreakdown,
    overallTrend,
    healthScore,
    healthGrade: calculateGrade(healthScore),
    topChannels: channelScores.slice(0, 5),
    recentReports: communityReports.length,
    schedulerActive: schedulerEnabled,
  };
}

// ============ Scheduler ============

export function startEngagementScheduler(intervalMs?: number): EngagementSchedulerStatus {
  if (intervalMs !== undefined && intervalMs < 300000) {
    throw new Error('Minimum engagement scan interval is 5 minutes (300000ms)');
  }
  if (intervalMs) schedulerIntervalMs = intervalMs;
  
  stopEngagementScheduler();
  schedulerEnabled = true;
  
  schedulerTimer = setInterval(() => {
    try {
      generateReport();
      totalScheduledChecks++;
      lastScheduledCheck = Date.now();
      console.log(`[QUMUS CommunityEngagement] Scheduled report generated (check #${totalScheduledChecks})`);
    } catch (e) {
      console.error('[QUMUS CommunityEngagement] Scheduled report failed:', e);
    }
  }, schedulerIntervalMs);
  
  console.log(`[QUMUS CommunityEngagement] Scheduler started — interval: ${formatInterval(schedulerIntervalMs)}`);
  return getSchedulerStatus();
}

export function stopEngagementScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  schedulerEnabled = false;
  console.log('[QUMUS CommunityEngagement] Scheduler stopped');
}

export function getSchedulerStatus(): EngagementSchedulerStatus {
  return {
    enabled: schedulerEnabled,
    intervalMs: schedulerIntervalMs,
    intervalHuman: formatInterval(schedulerIntervalMs),
    lastCheck: lastScheduledCheck,
    totalChecks: totalScheduledChecks,
    nextCheckEstimate: schedulerEnabled ? Date.now() + schedulerIntervalMs : 0,
  };
}

// ============ QUMUS Event Processing ============

export async function processEngagementEvent(
  type: 'engagement_drop' | 'new_champion' | 'churn_risk' | 'donation_spike' | 'community_milestone',
  data: { details?: string; confidence: number }
): Promise<{ decisionId: string; action: string; confidence: number }> {
  const engine = QumusCompleteEngine.getInstance();
  
  const result = await engine.processDecision({
    policyId: 'policy_community_engagement',
    input: { type, ...data },
    confidence: data.confidence,
  });
  
  return {
    decisionId: result.decisionId,
    action: result.result,
    confidence: result.confidence,
  };
}

// ============ Command Console Integration ============

export function executeCommand(command: string): string {
  const parts = command.trim().toLowerCase().split(/\s+/);
  const subCommand = parts[1] || '';
  
  switch (subCommand) {
    case 'status': {
      const summary = getEngagementSummary();
      return `👥 Community Engagement Status:\n` +
        `  Members: ${summary.totalMembers} total (${summary.activeMembers} active this week)\n` +
        `  New This Week: ${summary.newMembersThisWeek}\n` +
        `  Avg Engagement: ${summary.averageEngagementScore}/100\n` +
        `  Trend: ${summary.overallTrend.toUpperCase()}\n` +
        `  Health: ${summary.healthScore}/100 (${summary.healthGrade})\n` +
        `  Total Donations: $${summary.totalDonations.toFixed(2)}\n` +
        `  Events: ${summary.totalEvents} total`;
    }
    
    case 'report':
      generateReport();
      return '📊 Community engagement report generated. View it in the dashboard.';
    
    case 'members': {
      const members = getMembers();
      if (members.length === 0) return '👥 No community members tracked yet.';
      return `👥 Community Members (${members.length}):\n` +
        members.slice(0, 10).map(m =>
          `  ${m.tier === 'ambassador' ? '🌟' : m.tier === 'champion' ? '🏆' : m.tier === 'engaged' ? '💪' : m.tier === 'active' ? '✅' : '🆕'} ${m.name} — Score: ${m.engagementScore}, Tier: ${m.tier}, Streak: ${m.streak}d`
        ).join('\n') +
        (members.length > 10 ? `\n  ... and ${members.length - 10} more` : '');
    }
    
    case 'channels': {
      const metrics = getChannelMetrics();
      return `📡 Channel Engagement:\n` +
        metrics.map(m =>
          `  ${m.channel}: ${m.totalEvents} events, ${m.uniqueMembers} members, trend: ${m.trend}`
        ).join('\n');
    }
    
    case 'scheduler': {
      const status = getSchedulerStatus();
      return `⏰ Engagement Scheduler: ${status.enabled ? 'ACTIVE' : 'STOPPED'}\n` +
        `  Interval: ${status.intervalHuman}\n` +
        `  Total Reports: ${status.totalChecks}\n` +
        `  Last Report: ${status.lastCheck ? new Date(status.lastCheck).toISOString() : 'Never'}`;
    }
    
    default:
      return '👥 Community Engagement Commands:\n' +
        '  community status — Engagement summary\n' +
        '  community report — Generate engagement report\n' +
        '  community members — List community members\n' +
        '  community channels — Channel engagement metrics\n' +
        '  community scheduler — Scheduler status';
  }
}
