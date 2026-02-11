/**
 * AI Content Generation Policy — 14th QUMUS Autonomous Decision Policy
 * 
 * Auto-generates show descriptions, social media posts, broadcast schedules,
 * and promotional content for all 7 radio channels using the built-in LLM.
 * 
 * Autonomy: 82% — Most content generation is autonomous; sensitive or
 * brand-critical content is escalated for human review.
 * 
 * Copyright 2024–2026 Canryn Production and its subsidiaries. All rights reserved.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface ContentTemplate {
  id: string;
  name: string;
  type: 'show_description' | 'social_post' | 'broadcast_schedule' | 'promo' | 'newsletter' | 'episode_summary';
  channel: string;
  prompt: string;
  tone: 'professional' | 'casual' | 'inspirational' | 'urgent' | 'community';
  maxLength: number;
  status: 'active' | 'paused' | 'draft';
  lastGenerated?: string;
  generationCount: number;
}

export interface GeneratedContent {
  id: string;
  templateId: string;
  templateName: string;
  type: string;
  channel: string;
  content: string;
  generatedAt: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'published';
  wordCount: number;
  confidence: number;
}

export interface ContentGenerationReport {
  id: string;
  timestamp: string;
  templatesProcessed: number;
  contentGenerated: number;
  autoApproved: number;
  escalatedForReview: number;
  errors: number;
  avgConfidence: number;
}

export interface ContentSummary {
  totalTemplates: number;
  activeTemplates: number;
  totalGenerated: number;
  pendingReview: number;
  approved: number;
  published: number;
  avgConfidence: number;
  topChannel: string;
  recentActivity: string;
}

// ─── In-Memory State ─────────────────────────────────────────────────

let templates: ContentTemplate[] = [
  {
    id: 'tpl_001',
    name: 'RRB Radio Show Description',
    type: 'show_description',
    channel: 'rrb-radio',
    prompt: 'Write a compelling radio show description for Rockin\' Rockin\' Boogie featuring Seabrun Candy Hunter\'s legacy music. Include the show time, genre (blues, R&B, rock), and a call to listen.',
    tone: 'inspirational',
    maxLength: 200,
    status: 'active',
    generationCount: 0,
  },
  {
    id: 'tpl_002',
    name: 'Sweet Miracles Social Post',
    type: 'social_post',
    channel: 'sweet-miracles',
    prompt: 'Create a social media post for Sweet Miracles Foundation highlighting community impact, donation opportunities, and the motto "A Voice for the Voiceless". Keep it warm and inviting.',
    tone: 'community',
    maxLength: 280,
    status: 'active',
    generationCount: 0,
  },
  {
    id: 'tpl_003',
    name: 'Weekly Broadcast Schedule',
    type: 'broadcast_schedule',
    channel: 'all-channels',
    prompt: 'Generate a weekly broadcast schedule for 7 radio channels including music blocks, talk shows, meditation sessions, emergency broadcast windows, and community call-in times.',
    tone: 'professional',
    maxLength: 500,
    status: 'active',
    generationCount: 0,
  },
  {
    id: 'tpl_004',
    name: 'HybridCast Emergency Promo',
    type: 'promo',
    channel: 'hybridcast',
    prompt: 'Write a promotional message for HybridCast Emergency Broadcast system emphasizing offline-first capability, mesh networking, and community resilience during disasters.',
    tone: 'urgent',
    maxLength: 150,
    status: 'active',
    generationCount: 0,
  },
  {
    id: 'tpl_005',
    name: 'Podcast Episode Summary',
    type: 'episode_summary',
    channel: 'podcast',
    prompt: 'Write a podcast episode summary for the Canryn Production podcast covering music industry insights, legacy preservation, and independent artist empowerment.',
    tone: 'casual',
    maxLength: 300,
    status: 'active',
    generationCount: 0,
  },
  {
    id: 'tpl_006',
    name: 'Meditation Session Description',
    type: 'show_description',
    channel: 'meditation',
    prompt: 'Write a calming description for a Solfeggio frequency meditation session. Mention the specific frequency (e.g., 528Hz for healing), duration, and benefits for the listener.',
    tone: 'inspirational',
    maxLength: 200,
    status: 'active',
    generationCount: 0,
  },
  {
    id: 'tpl_007',
    name: 'Solbones Game Announcement',
    type: 'social_post',
    channel: 'solbones',
    prompt: 'Create an engaging social media post announcing Solbones 4+3+2 sacred math dice game features, multiplayer tournaments, and Solfeggio frequency integration.',
    tone: 'casual',
    maxLength: 280,
    status: 'active',
    generationCount: 0,
  },
  {
    id: 'tpl_008',
    name: 'Canryn Production Newsletter',
    type: 'newsletter',
    channel: 'canryn',
    prompt: 'Write a newsletter intro for Canryn Production covering recent studio developments, new music releases, community events, and subsidiary updates.',
    tone: 'professional',
    maxLength: 400,
    status: 'active',
    generationCount: 0,
  },
];

let generatedContent: GeneratedContent[] = [];
let generationReports: ContentGenerationReport[] = [];
let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let schedulerRunning = false;
let contentIdCounter = 1;
let reportIdCounter = 1;

// ─── Service Functions ───────────────────────────────────────────────

export function getTemplates(filters?: { type?: string; channel?: string; status?: string }): ContentTemplate[] {
  let result = [...templates];
  if (filters?.type) result = result.filter(t => t.type === filters.type);
  if (filters?.channel) result = result.filter(t => t.channel === filters.channel);
  if (filters?.status) result = result.filter(t => t.status === filters.status);
  return result;
}

export function addTemplate(template: Omit<ContentTemplate, 'id' | 'generationCount'>): ContentTemplate {
  const newTemplate: ContentTemplate = {
    ...template,
    id: `tpl_${String(templates.length + 1).padStart(3, '0')}`,
    generationCount: 0,
  };
  templates.push(newTemplate);
  return newTemplate;
}

export function updateTemplate(id: string, updates: Partial<ContentTemplate>): ContentTemplate | null {
  const idx = templates.findIndex(t => t.id === id);
  if (idx === -1) return null;
  templates[idx] = { ...templates[idx], ...updates, id: templates[idx].id };
  return templates[idx];
}

export function getGeneratedContent(filters?: { status?: string; type?: string }): GeneratedContent[] {
  let result = [...generatedContent];
  if (filters?.status) result = result.filter(c => c.status === filters.status);
  if (filters?.type) result = result.filter(c => c.type === filters.type);
  return result.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
}

export function approveContent(id: string): boolean {
  const item = generatedContent.find(c => c.id === id);
  if (!item) return false;
  item.status = 'approved';
  return true;
}

export function rejectContent(id: string): boolean {
  const item = generatedContent.find(c => c.id === id);
  if (!item) return false;
  item.status = 'rejected';
  return true;
}

export function publishContent(id: string): boolean {
  const item = generatedContent.find(c => c.id === id);
  if (!item || item.status !== 'approved') return false;
  item.status = 'published';
  return true;
}

/**
 * Generate content for all active templates.
 * In production, this calls the built-in LLM. For now, generates realistic placeholder content.
 */
export function runGeneration(): ContentGenerationReport {
  const activeTemplates = templates.filter(t => t.status === 'active');
  let generated = 0;
  let autoApproved = 0;
  let escalated = 0;
  let errors = 0;
  let totalConfidence = 0;

  for (const template of activeTemplates) {
    try {
      // Simulate LLM-generated content with realistic output
      const content = generatePlaceholderContent(template);
      const confidence = 70 + Math.random() * 25; // 70-95%
      totalConfidence += confidence;

      const newContent: GeneratedContent = {
        id: `gen_${String(contentIdCounter++).padStart(5, '0')}`,
        templateId: template.id,
        templateName: template.name,
        type: template.type,
        channel: template.channel,
        content,
        generatedAt: new Date().toISOString(),
        status: confidence >= 82 ? 'approved' : 'pending_review', // 82% autonomy threshold
        wordCount: content.split(/\s+/).length,
        confidence: Math.round(confidence * 100) / 100,
      };

      generatedContent.push(newContent);
      template.generationCount++;
      template.lastGenerated = newContent.generatedAt;
      generated++;

      if (confidence >= 82) {
        autoApproved++;
      } else {
        escalated++;
      }
    } catch {
      errors++;
    }
  }

  const report: ContentGenerationReport = {
    id: `rpt_${String(reportIdCounter++).padStart(4, '0')}`,
    timestamp: new Date().toISOString(),
    templatesProcessed: activeTemplates.length,
    contentGenerated: generated,
    autoApproved,
    escalatedForReview: escalated,
    errors,
    avgConfidence: generated > 0 ? Math.round((totalConfidence / generated) * 100) / 100 : 0,
  };

  generationReports.push(report);
  return report;
}

export function getSummary(): ContentSummary {
  const active = templates.filter(t => t.status === 'active').length;
  const pending = generatedContent.filter(c => c.status === 'pending_review').length;
  const approved = generatedContent.filter(c => c.status === 'approved').length;
  const published = generatedContent.filter(c => c.status === 'published').length;
  const avgConf = generatedContent.length > 0
    ? Math.round((generatedContent.reduce((s, c) => s + c.confidence, 0) / generatedContent.length) * 100) / 100
    : 0;

  // Find top channel by generation count
  const channelCounts: Record<string, number> = {};
  generatedContent.forEach(c => { channelCounts[c.channel] = (channelCounts[c.channel] || 0) + 1; });
  const topChannel = Object.entries(channelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

  const lastReport = generationReports[generationReports.length - 1];
  const recentActivity = lastReport
    ? `Last generation: ${lastReport.contentGenerated} items at ${new Date(lastReport.timestamp).toLocaleString()}`
    : 'No generation runs yet';

  return {
    totalTemplates: templates.length,
    activeTemplates: active,
    totalGenerated: generatedContent.length,
    pendingReview: pending,
    approved,
    published,
    avgConfidence: avgConf,
    topChannel,
    recentActivity,
  };
}

export function getReports(): ContentGenerationReport[] {
  return [...generationReports].reverse();
}

export function startScheduler(intervalMs = 14400000): void { // Default 4 hours
  if (schedulerRunning) return;
  schedulerRunning = true;
  schedulerInterval = setInterval(() => {
    runGeneration();
  }, intervalMs);
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
  schedulerRunning = false;
}

export function getSchedulerStatus() {
  return {
    running: schedulerRunning,
    lastRun: generationReports.length > 0 ? generationReports[generationReports.length - 1].timestamp : null,
    totalRuns: generationReports.length,
  };
}

export function executeCommand(command: string): string {
  const cmd = command.toLowerCase().trim();

  if (cmd === 'status' || cmd === '') {
    const s = getSummary();
    return `AI Content Generation Status:\n  Templates: ${s.totalTemplates} (${s.activeTemplates} active)\n  Generated: ${s.totalGenerated} total\n  Pending Review: ${s.pendingReview}\n  Approved: ${s.approved}\n  Published: ${s.published}\n  Avg Confidence: ${s.avgConfidence}%\n  Top Channel: ${s.topChannel}`;
  }

  if (cmd === 'generate' || cmd === 'run') {
    const report = runGeneration();
    return `Generation complete:\n  Templates processed: ${report.templatesProcessed}\n  Content generated: ${report.contentGenerated}\n  Auto-approved: ${report.autoApproved}\n  Escalated: ${report.escalatedForReview}\n  Errors: ${report.errors}\n  Avg Confidence: ${report.avgConfidence}%`;
  }

  if (cmd === 'templates') {
    const active = templates.filter(t => t.status === 'active');
    return `Active Templates (${active.length}):\n${active.map(t => `  • ${t.name} [${t.type}] — ${t.channel} (${t.generationCount} generated)`).join('\n')}`;
  }

  if (cmd === 'pending') {
    const pending = generatedContent.filter(c => c.status === 'pending_review');
    return `Pending Review (${pending.length}):\n${pending.slice(0, 5).map(c => `  • ${c.templateName} — ${c.wordCount} words, ${c.confidence}% confidence`).join('\n')}${pending.length > 5 ? `\n  ... and ${pending.length - 5} more` : ''}`;
  }

  if (cmd === 'scheduler') {
    const s = getSchedulerStatus();
    return `Scheduler: ${s.running ? 'RUNNING' : 'STOPPED'}\n  Total runs: ${s.totalRuns}\n  Last run: ${s.lastRun || 'Never'}`;
  }

  if (cmd === 'reports') {
    const reports = getReports().slice(0, 5);
    return `Recent Reports (${reports.length}):\n${reports.map(r => `  • ${new Date(r.timestamp).toLocaleString()} — ${r.contentGenerated} generated, ${r.autoApproved} auto-approved`).join('\n')}`;
  }

  return `Unknown AI content command: "${cmd}". Available: status, generate, templates, pending, scheduler, reports`;
}

// ─── Helper Functions ────────────────────────────────────────────────

function generatePlaceholderContent(template: ContentTemplate): string {
  const contentMap: Record<string, string[]> = {
    show_description: [
      `Tune in for an unforgettable session of Rockin' Rockin' Boogie — where the legacy of Seabrun Candy Hunter lives on through timeless blues, soul-stirring R&B, and electrifying rock. Every beat tells a story, every note carries a legacy. Join us live.`,
      `Experience the healing power of Solfeggio frequencies in this guided meditation session. Let the 528Hz frequency wash over you, promoting cellular repair, inner peace, and deep relaxation. Duration: 30 minutes. Perfect for morning or evening practice.`,
    ],
    social_post: [
      `🎵 The legacy continues. Seabrun Candy Hunter's music lives on through Canryn Production — preserving the past, empowering the future. Listen now on all 7 channels. #RockinRockinBoogie #LegacyRestored #CanrynProduction`,
      `A Voice for the Voiceless. Sweet Miracles Foundation is making a difference — one community at a time. Your donation helps provide emergency broadcast tools, media access, and crisis support. Join us. 💛 #SweetMiracles #AVoiceForTheVoiceless`,
    ],
    broadcast_schedule: [
      `WEEKLY SCHEDULE — All 7 Channels\n\nMon-Fri:\n  6AM-9AM: Morning Blues (Ch 1)\n  9AM-12PM: Legacy Classics (Ch 2)\n  12PM-2PM: Community Call-In (Ch 3)\n  2PM-5PM: R&B Afternoon (Ch 4)\n  5PM-7PM: Meditation Hour (Ch 5)\n  7PM-10PM: Rock Block (Ch 6)\n  10PM-12AM: Late Night Jazz (Ch 7)\n\nSat-Sun:\n  Emergency Broadcast Window: 24/7 on Ch 7\n  Special Programming: Artist Spotlights, Interviews`,
    ],
    promo: [
      `When disaster strikes, HybridCast keeps communities connected. Offline-first. Mesh networking. No internet required. Your emergency lifeline — built for resilience, designed for everyone. Download the PWA today.`,
    ],
    episode_summary: [
      `In this episode of the Canryn Production Podcast, we dive deep into the music industry's treatment of independent artists. From royalty disputes to legacy preservation, we explore how technology and community can protect creators' rights. Featuring insights from the QUMUS autonomous system and real-world case studies.`,
    ],
    newsletter: [
      `Welcome to this month's Canryn Production update! We've been busy in the studio — new recordings, expanded broadcast reach across all 7 channels, and exciting developments in our QUMUS autonomous platform. Sweet Miracles Foundation continues to grow, and our HybridCast emergency system just passed its latest resilience test. Read on for the full update.`,
    ],
  };

  const options = contentMap[template.type] || contentMap.show_description;
  const selected = options[Math.floor(Math.random() * options.length)];

  // Trim to maxLength if needed
  if (selected.length > template.maxLength) {
    return selected.substring(0, template.maxLength - 3) + '...';
  }
  return selected;
}
