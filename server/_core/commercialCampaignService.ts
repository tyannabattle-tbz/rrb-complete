/**
 * Commercial Campaign Service
 * Manages UN NGO CSW70 campaign launch commercials for March 17, 2026
 * Generates AI DJ-voiced commercial scripts and manages rotation across 50 channels
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';
import { invokeLLM } from './llm';

// ─── Campaign Commercial Library ───────────────────────────────────────────
// 12 unique commercials for the UN NGO CSW70 campaign launch
// Each commercial has a script, duration, target audience, and DJ voice assignment

export interface CampaignCommercial {
  id: string;
  title: string;
  category: 'promo' | 'psa' | 'testimonial' | 'countdown' | 'bumper' | 'sponsor';
  djVoice: 'valanna' | 'seraph' | 'candy';
  script: string;
  duration: number; // seconds
  priority: number; // 1-10, higher = more frequent
  targetChannelGenres: string[]; // which channel genres to target
  callToAction: string;
  isActive: boolean;
}

export const UN_CAMPAIGN_COMMERCIALS: CampaignCommercial[] = [
  // ─── HERO SPOT (60s) ───
  {
    id: 'un-hero-60',
    title: 'From Selma to the United Nations',
    category: 'promo',
    djVoice: 'candy',
    script: `From the red clay roads of Selma, Alabama... to the halls of the United Nations in New York City. On March 17th, 2026, Canryn Production and Sweet Miracles present the SQUADD Goals — Sisters Questing Unapologetically After Divine Destiny — at the UN NGO CSW70, in partnership with Ghana. Seven women. Seven missions. Agriculture. Law advocacy. Disability rights. Elder protection. Environmental justice. Families of murder victims. And the technology that connects them all. This is not just a presentation. This is a movement. From Selma to Ghana to the World — no voice will ever be silenced again. Visit SQUADD Goals at manuweb.sbs to join the movement. Canryn Production. A Voice for the Voiceless.`,
    duration: 60,
    priority: 10,
    targetChannelGenres: ['Gospel', 'Soul', 'Jazz', 'R&B', 'Talk', 'Community', 'Hip-Hop'],
    callToAction: 'Visit manuweb.sbs/squadd',
    isActive: true,
  },
  // ─── COUNTDOWN SPOT (30s) ───
  {
    id: 'un-countdown-30',
    title: '8 Days Until the UN — Countdown',
    category: 'countdown',
    djVoice: 'valanna',
    script: `The countdown is on. In just days, the SQUADD Coalition takes the stage at the United Nations NGO CSW70 — in partnership with Ghana. March 17th, 2026. Seven sisters. One mission. From elder protection to environmental justice, from agriculture to law advocacy — this is where Selma meets the world stage. Sweet Miracles and Canryn Production are bringing the fight to the biggest platform on earth. Are you ready? Visit manuweb.sbs for details. The world is watching.`,
    duration: 30,
    priority: 9,
    targetChannelGenres: ['Gospel', 'Soul', 'Jazz', 'R&B', 'Talk', 'Community', 'Hip-Hop', 'Funk', 'Rock'],
    callToAction: 'Visit manuweb.sbs',
    isActive: true,
  },
  // ─── SQUADD GOALS EXPLAINER (45s) ───
  {
    id: 'un-squadd-explainer-45',
    title: 'What Are SQUADD Goals?',
    category: 'psa',
    djVoice: 'seraph',
    script: `You've heard the name. Now understand the mission. SQUADD Goals — Sisters Questing Unapologetically After Divine Destiny. It's not just an acronym. It's a framework for change. Seven women, each an expert in their field — agriculture, law, disability rights, elder protection, environmental justice, families of murder victims, and technology. Together, they form an unstoppable coalition. On March 17th, they present at the United Nations NGO CSW70 in partnership with Ghana. Built by Canryn Production. Powered by Sweet Miracles. This is what happens when grit meets purpose. Learn more at manuweb.sbs slash squadd.`,
    duration: 45,
    priority: 8,
    targetChannelGenres: ['Gospel', 'Soul', 'Jazz', 'R&B', 'Talk', 'Community', 'Hip-Hop', 'Healing', 'Meditation'],
    callToAction: 'Visit manuweb.sbs/squadd',
    isActive: true,
  },
  // ─── GHANA PARTNERSHIP (30s) ───
  {
    id: 'un-ghana-30',
    title: 'Ghana Partnership — Connecting the Diaspora',
    category: 'promo',
    djVoice: 'candy',
    script: `From the motherland to the movement. Canryn Production is proud to announce our partnership with Ghana for the UN NGO CSW70 parallel event on March 17th. Connecting the African diaspora through technology, advocacy, and a shared vision for justice. Building a global blueprint for elder protection, environmental stewardship, and community sovereignty. From Selma to Accra to the United Nations. This is bigger than any one of us. This is legacy. Visit manuweb.sbs.`,
    duration: 30,
    priority: 8,
    targetChannelGenres: ['Gospel', 'Soul', 'Jazz', 'R&B', 'Afrobeat', 'World', 'Reggae', 'Community'],
    callToAction: 'Visit manuweb.sbs',
    isActive: true,
  },
  // ─── SWEET MIRACLES PSA (30s) ───
  {
    id: 'un-sweet-miracles-30',
    title: 'Sweet Miracles — Changing Lives',
    category: 'psa',
    djVoice: 'valanna',
    script: `Sweet Miracles. A 501(c)(3) nonprofit founded on one belief — that every person deserves to be heard. From tracking donations in real-time to providing direct aid to families in crisis, Sweet Miracles is the heart of the Canryn Production ecosystem. On March 17th, we take this mission to the United Nations. Elder protection. Disability advocacy. Families of murder victims. Real help. Real impact. Real miracles. Support Sweet Miracles at manuweb.sbs. Because every voice matters.`,
    duration: 30,
    priority: 7,
    targetChannelGenres: ['Gospel', 'Soul', 'Jazz', 'R&B', 'Talk', 'Community', 'Healing', 'Meditation'],
    callToAction: 'Support at manuweb.sbs',
    isActive: true,
  },
  // ─── ELDER PROTECTION SPOTLIGHT (30s) ───
  {
    id: 'un-elder-protection-30',
    title: 'Elder Protection — No More Silence',
    category: 'psa',
    djVoice: 'candy',
    script: `They raised us. They built our communities. They deserve protection. Elder abuse is a crisis that too many families face in silence. On March 17th at the United Nations, the SQUADD Coalition is putting elder protection on the world stage. Canryn Production and Sweet Miracles are building the technology to track, report, and prevent elder abuse — because our elders are not disposable. They are our legacy. Join the fight at manuweb.sbs. Protect our elders. Protect our future.`,
    duration: 30,
    priority: 8,
    targetChannelGenres: ['Gospel', 'Soul', 'Jazz', 'R&B', 'Talk', 'Community', 'Blues'],
    callToAction: 'Visit manuweb.sbs',
    isActive: true,
  },
  // ─── RRB RADIO BUMPER (15s) ───
  {
    id: 'un-rrb-bumper-15',
    title: 'RRB Radio — 50 Channels, One Mission',
    category: 'bumper',
    djVoice: 'seraph',
    script: `You're listening to Rockin' Rockin' Boogie Radio — 50 channels strong. Powered by QUMUS. Built by Canryn Production. March 17th — we take it to the United Nations. Stay tuned.`,
    duration: 15,
    priority: 10,
    targetChannelGenres: ['Gospel', 'Soul', 'Jazz', 'R&B', 'Hip-Hop', 'Funk', 'Rock', 'Blues', 'Afrobeat', 'World', 'Reggae', 'Electronic', 'Lo-Fi', 'Classical', 'Healing', 'Meditation', 'Community', 'Talk'],
    callToAction: 'Stay tuned to RRB Radio',
    isActive: true,
  },
  // ─── HYBRIDCAST EMERGENCY (20s) ───
  {
    id: 'un-hybridcast-20',
    title: 'HybridCast — When Every Second Counts',
    category: 'promo',
    djVoice: 'seraph',
    script: `When disaster strikes, communities need a voice. HybridCast — the emergency broadcast system built by Canryn Production — works offline, on mesh networks, when everything else fails. On March 17th, we present this technology at the United Nations. Because emergency preparedness is not a luxury. It's a right. Learn more at manuweb.sbs.`,
    duration: 20,
    priority: 6,
    targetChannelGenres: ['Talk', 'Community', 'Gospel', 'Soul', 'Jazz'],
    callToAction: 'Visit manuweb.sbs',
    isActive: true,
  },
  // ─── VOICE FOR THE VOICELESS (30s) ───
  {
    id: 'un-voiceless-30',
    title: 'A Voice for the Voiceless',
    category: 'testimonial',
    djVoice: 'valanna',
    script: `LaShanna Hunter — a mother, an advocate, a force of nature. She built Sweet Miracles to give a voice to those who had none. She created Canryn Production to amplify that voice to the world. And on March 17th, 2026, she takes that voice to the United Nations — in partnership with Ghana — to present the SQUADD Goals. Agriculture. Law. Disability. Elder protection. Environment. Justice. Technology. Seven pillars. One mission. A voice for the voiceless. Join us at manuweb.sbs.`,
    duration: 30,
    priority: 9,
    targetChannelGenres: ['Gospel', 'Soul', 'Jazz', 'R&B', 'Talk', 'Community', 'Hip-Hop', 'Blues'],
    callToAction: 'Join at manuweb.sbs',
    isActive: true,
  },
  // ─── SELMA TO UN BRIDGE (20s) ───
  {
    id: 'un-selma-bridge-20',
    title: 'Selma to the UN — The Bridge',
    category: 'bumper',
    djVoice: 'candy',
    script: `Selma taught us to march. Ghana showed us our roots. And on March 17th, the United Nations will hear our voice. The SQUADD Coalition. Canryn Production. Sweet Miracles. From the bridge in Selma to the world stage. We are unstoppable. manuweb.sbs.`,
    duration: 20,
    priority: 9,
    targetChannelGenres: ['Gospel', 'Soul', 'Jazz', 'R&B', 'Hip-Hop', 'Funk', 'Rock', 'Blues', 'Community', 'Talk'],
    callToAction: 'Visit manuweb.sbs',
    isActive: true,
  },
  // ─── TECHNOLOGY SHOWCASE (30s) ───
  {
    id: 'un-tech-showcase-30',
    title: 'The Ecosystem — Technology Meets Purpose',
    category: 'promo',
    djVoice: 'seraph',
    script: `Fifty radio channels. Emergency broadcast mesh networks. Autonomous AI orchestration. Real-time donation tracking. Listener analytics across the globe. This is not Silicon Valley. This is Canryn Production — a Black, women-owned technology company from Alabama. On March 17th, we present this ecosystem at the United Nations NGO CSW70. QUMUS runs the brain. HybridCast protects communities. Sweet Miracles heals them. And RRB Radio gives them a voice. The future is already here. manuweb.sbs.`,
    duration: 30,
    priority: 7,
    targetChannelGenres: ['Electronic', 'Lo-Fi', 'Hip-Hop', 'Jazz', 'Talk', 'Community'],
    callToAction: 'Visit manuweb.sbs',
    isActive: true,
  },
  // ─── CALL TO ACTION CLOSER (15s) ───
  {
    id: 'un-cta-closer-15',
    title: 'March 17th — Be There',
    category: 'bumper',
    djVoice: 'valanna',
    script: `March 17th, 2026. The United Nations. SQUADD Goals. In partnership with Ghana. Canryn Production and Sweet Miracles. Be part of history. manuweb.sbs. A voice for the voiceless.`,
    duration: 15,
    priority: 10,
    targetChannelGenres: ['Gospel', 'Soul', 'Jazz', 'R&B', 'Hip-Hop', 'Funk', 'Rock', 'Blues', 'Afrobeat', 'World', 'Reggae', 'Electronic', 'Lo-Fi', 'Classical', 'Healing', 'Meditation', 'Community', 'Talk'],
    callToAction: 'Visit manuweb.sbs',
    isActive: true,
  },
];

// ─── Commercial Rotation Engine ────────────────────────────────────────────

export class CommercialRotationEngine {
  private lastPlayedMap: Map<string, number> = new Map();
  private playCountMap: Map<string, number> = new Map();

  /**
   * Get the next commercial to play based on priority, genre targeting, and rotation rules
   */
  getNextCommercial(channelGenre: string): CampaignCommercial | null {
    const now = Date.now();
    const eligible = UN_CAMPAIGN_COMMERCIALS.filter(c => {
      if (!c.isActive) return false;
      // Check genre targeting
      if (c.targetChannelGenres.length > 0 && !c.targetChannelGenres.includes(channelGenre)) return false;
      // Check cooldown (minimum 10 minutes between same commercial)
      const lastPlayed = this.lastPlayedMap.get(c.id) || 0;
      if (now - lastPlayed < 10 * 60 * 1000) return false;
      return true;
    });

    if (eligible.length === 0) return null;

    // Weighted random selection based on priority
    const totalWeight = eligible.reduce((sum, c) => sum + c.priority, 0);
    let random = Math.random() * totalWeight;
    for (const commercial of eligible) {
      random -= commercial.priority;
      if (random <= 0) {
        this.lastPlayedMap.set(commercial.id, now);
        this.playCountMap.set(commercial.id, (this.playCountMap.get(commercial.id) || 0) + 1);
        return commercial;
      }
    }

    return eligible[0];
  }

  /**
   * Get rotation stats
   */
  getRotationStats() {
    return {
      totalCommercials: UN_CAMPAIGN_COMMERCIALS.length,
      activeCommercials: UN_CAMPAIGN_COMMERCIALS.filter(c => c.isActive).length,
      totalPlays: Array.from(this.playCountMap.values()).reduce((sum, c) => sum + c, 0),
      playsByCommercial: Object.fromEntries(this.playCountMap),
      campaignName: 'UN NGO CSW70 — SQUADD Goals Launch',
      launchDate: 'March 17, 2026',
      partner: 'Ghana',
    };
  }

  /**
   * Get all commercials with play stats
   */
  getAllCommercials() {
    return UN_CAMPAIGN_COMMERCIALS.map(c => ({
      ...c,
      plays: this.playCountMap.get(c.id) || 0,
      lastPlayed: this.lastPlayedMap.get(c.id) || null,
    }));
  }
}

// Singleton instance
export const commercialEngine = new CommercialRotationEngine();

// ─── AI DJ Commercial Intro Generator ──────────────────────────────────────

export async function generateCommercialIntro(
  commercial: CampaignCommercial,
  djPersonality: 'valanna' | 'seraph' | 'candy'
): Promise<string> {
  const djStyles: Record<string, string> = {
    valanna: 'warm, maternal, gospel-inspired, community-focused. Speak like a wise church mother who knows the power of collective action.',
    seraph: 'strategic, analytical, confident. Speak like a military intelligence officer who sees the bigger picture and respects the mission.',
    candy: 'proud patriarch energy, old-school wisdom, family-first. Speak like a grandfather who built everything from nothing and wants to see the legacy continue.',
  };

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are ${djPersonality}, an AI DJ on RRB Radio (Rockin' Rockin' Boogie). Your style is ${djStyles[djPersonality]}. Generate a SHORT 1-2 sentence DJ intro to lead into a commercial break. Keep it natural, human-sounding, and energetic. Do NOT use hashtags or emojis. Maximum 30 words.`
        },
        {
          role: 'user',
          content: `Introduce this commercial: "${commercial.title}" — ${commercial.callToAction}. The commercial is about the UN NGO CSW70 campaign launch on March 17th, 2026, in partnership with Ghana.`
        }
      ],
    });
    return response.choices?.[0]?.message?.content || getDefaultIntro(djPersonality, commercial);
  } catch {
    return getDefaultIntro(djPersonality, commercial);
  }
}

function getDefaultIntro(dj: string, commercial: CampaignCommercial): string {
  const intros: Record<string, string[]> = {
    valanna: [
      `Family, listen close — this one's important.`,
      `Now here's something that matters to all of us.`,
      `Pay attention, beloved — this is history in the making.`,
    ],
    seraph: [
      `Attention on deck — mission critical update incoming.`,
      `Strategic update from Canryn Production headquarters.`,
      `Intel report — the UN campaign is live.`,
    ],
    candy: [
      `Now this right here — this is what legacy looks like.`,
      `Let me tell you something about family and purpose.`,
      `My family built this. And now the world's gonna see it.`,
    ],
  };
  const djIntros = intros[dj] || intros.valanna;
  return djIntros[Math.floor(Math.random() * djIntros.length)];
}

// ─── Seed Commercials to Database ──────────────────────────────────────────

export async function seedCommercialsToDb() {
  const db = await getDb();
  
  // Check if commercials already exist
  const existing = await db.execute(sql`SELECT COUNT(*) as cnt FROM commercials`);
  const rows = Array.isArray(existing[0]) ? existing[0] : existing;
  const count = (rows as any)[0]?.cnt || 0;
  
  if (count > 0) {
    console.log(`[CommercialCampaign] ${count} commercials already exist, skipping seed`);
    return count;
  }

  // Get a valid break_id or create one
  const breaks = await db.execute(sql`SELECT id FROM commercial_breaks LIMIT 1`);
  const breakRows = Array.isArray(breaks[0]) ? breaks[0] : breaks;
  let breakId = (breakRows as any)[0]?.id;

  if (!breakId) {
    // Get a valid schedule_id
    const schedules = await db.execute(sql`SELECT id FROM broadcast_schedules LIMIT 1`);
    const scheduleRows = Array.isArray(schedules[0]) ? schedules[0] : schedules;
    const scheduleId = (scheduleRows as any)[0]?.id || 1;

    await db.execute(sql`INSERT INTO commercial_breaks (schedule_id, position, duration, type) VALUES (${scheduleId}, 0, 30, 'mid_roll')`);
    const newBreaks = await db.execute(sql`SELECT id FROM commercial_breaks ORDER BY id DESC LIMIT 1`);
    const newBreakRows = Array.isArray(newBreaks[0]) ? newBreaks[0] : newBreaks;
    breakId = (newBreakRows as any)[0]?.id;
  }

  // Insert all campaign commercials
  for (const commercial of UN_CAMPAIGN_COMMERCIALS) {
    await db.execute(sql`
      INSERT INTO commercials (break_id, advertiser, title, file_url, duration, is_active, impressions, clicks)
      VALUES (
        ${breakId},
        ${'Canryn Production / Sweet Miracles'},
        ${commercial.title},
        ${`/api/commercial/${commercial.id}`},
        ${commercial.duration},
        ${commercial.isActive ? 1 : 0},
        ${0},
        ${0}
      )
    `);
  }

  console.log(`[CommercialCampaign] Seeded ${UN_CAMPAIGN_COMMERCIALS.length} UN campaign commercials`);
  return UN_CAMPAIGN_COMMERCIALS.length;
}
