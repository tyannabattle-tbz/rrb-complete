/**
 * AI Commercial Generation Engine
 * 
 * Generates radio commercials for the Canryn Production ecosystem:
 * - LLM-powered script writing for all brands/subsidiaries
 * - Commercial scheduling into radio broadcast rotation
 * - QUMUS autonomous commercial management
 * - Categories: promo, PSA, sponsor, event, station-id, jingle
 * 
 * Audio is generated client-side via Web Speech API (SpeechSynthesis)
 * and can be uploaded to S3 for persistent storage.
 * 
 * A Canryn Production — All Rights Reserved
 */

import { invokeLLM } from "../_core/llm";

// ─── Types ──────────────────────────────────────────────────────────────────

export type CommercialCategory = 
  | 'promo'        // Brand promotion spots
  | 'psa'          // Public service announcements (Sweet Miracles)
  | 'sponsor'      // Sponsor messages
  | 'event'        // Event announcements
  | 'station_id'   // Station identification ("You're listening to RRB Radio...")
  | 'jingle'       // Short musical jingles / bumpers
  | 'fundraiser'   // Sweet Miracles fundraising appeals
  | 'community';   // Community announcements

export type CommercialStatus = 'draft' | 'approved' | 'active' | 'archived' | 'scheduled';

export interface CommercialScript {
  id: string;
  title: string;
  category: CommercialCategory;
  brand: string;           // Which brand/subsidiary this is for
  script: string;          // The actual commercial script text
  duration: number;        // Estimated duration in seconds (based on word count)
  voiceDirection: string;  // Voice style notes (warm, energetic, calm, etc.)
  musicDirection: string;  // Background music notes
  status: CommercialStatus;
  createdAt: number;
  updatedAt: number;
  scheduledSlots: ScheduleSlot[];
  playCount: number;
  audioUrl?: string;       // S3 URL if audio has been generated and uploaded
  generatedBy: 'ai' | 'human';
}

export interface ScheduleSlot {
  id: string;
  dayOfWeek: number[];     // 0=Sun, 1=Mon, ... 6=Sat
  hourStart: number;       // 0-23
  hourEnd: number;         // 0-23
  frequency: number;       // Times per hour
  priority: number;        // 1-10, higher = more likely to play
}

export interface CommercialRotation {
  currentCommercial: CommercialScript | null;
  nextCommercial: CommercialScript | null;
  lastPlayedAt: number;
  totalPlaysToday: number;
  rotationActive: boolean;
}

// ─── Brand Definitions ──────────────────────────────────────────────────────

const BRANDS = {
  'canryn_production': {
    name: 'Canryn Production',
    tagline: 'Where Legacy Meets Innovation',
    description: 'A minority-owned media production company preserving musical legacy through technology.',
    tone: 'professional, warm, innovative',
  },
  'rrb_radio': {
    name: "Rockin' Rockin' Boogie Radio",
    tagline: 'The Sound of a Legacy Restored',
    description: 'Internet radio station broadcasting funk, soul, R&B, and the legacy of Seabrun Candy Hunter.',
    tone: 'energetic, soulful, nostalgic',
  },
  'sweet_miracles': {
    name: 'Sweet Miracles Foundation',
    tagline: 'Voice for the Voiceless',
    description: '501(c)(3) nonprofit empowering communities through crisis communication and support.',
    tone: 'compassionate, urgent, hopeful',
  },
  'hybridcast': {
    name: 'HybridCast Emergency Broadcast',
    tagline: 'When Every Second Counts',
    description: 'Emergency broadcast PWA with offline-first mesh networking for disaster response.',
    tone: 'authoritative, reassuring, clear',
  },
  'solbones': {
    name: 'Solbones 4+3+2',
    tagline: 'Sacred Math, Solfeggio Frequencies',
    description: 'Dice game based on sacred mathematics and Solfeggio healing frequencies.',
    tone: 'playful, mystical, inviting',
  },
  'qmunity': {
    name: 'QMunity',
    tagline: 'Community Powered by QUMUS',
    description: 'Community platform connecting listeners, supporters, and creators.',
    tone: 'friendly, inclusive, community-focused',
  },
};

// ─── Script Templates ───────────────────────────────────────────────────────

const CATEGORY_PROMPTS: Record<CommercialCategory, string> = {
  promo: `Write a radio promotional spot. It should be engaging, highlight key features, and end with a clear call to action. Include a memorable tagline.`,
  psa: `Write a public service announcement for radio. It should be informative, compassionate, and include a call to action for community support. This is for the Sweet Miracles Foundation "Voice for the Voiceless" mission.`,
  sponsor: `Write a sponsor acknowledgment spot for radio. It should be professional, grateful, and briefly mention the sponsor's contribution to the community.`,
  event: `Write an event announcement for radio. It should create excitement, include key details (what, when, where), and encourage attendance or participation.`,
  station_id: `Write a short station identification for radio. It should be memorable, include the station name, and capture the station's personality. Keep it under 15 seconds when read aloud.`,
  jingle: `Write lyrics/text for a short radio jingle or bumper. It should be catchy, rhythmic, and capture the brand essence. Keep it very short — 5-10 seconds when read aloud.`,
  fundraiser: `Write a fundraising appeal for radio. It should be heartfelt, explain the mission, share impact, and provide clear donation instructions. This is for the Sweet Miracles Foundation.`,
  community: `Write a community announcement for radio. It should be warm, informative, and encourage community participation and connection.`,
};

// ─── Commercial Engine ──────────────────────────────────────────────────────

class CommercialEngine {
  private commercials: CommercialScript[] = [];
  private rotation: CommercialRotation = {
    currentCommercial: null,
    nextCommercial: null,
    lastPlayedAt: 0,
    totalPlaysToday: 0,
    rotationActive: true,
  };
  private isRunning = false;
  private rotationInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Seed with default station IDs and promos on startup
    this.seedDefaultCommercials();
  }

  // ─── Script Generation ──────────────────────────────────────────────────

  async generateScript(
    category: CommercialCategory,
    brand: string,
    customPrompt?: string,
    targetDuration?: number,
  ): Promise<CommercialScript> {
    const brandInfo = BRANDS[brand as keyof typeof BRANDS] || BRANDS['canryn_production'];
    const durationTarget = targetDuration || (category === 'station_id' ? 10 : category === 'jingle' ? 8 : 30);
    const wordCount = Math.round(durationTarget * 2.5); // ~150 words per minute

    const systemPrompt = `You are a professional radio commercial copywriter for ${brandInfo.name}. 
Brand tagline: "${brandInfo.tagline}"
Brand description: ${brandInfo.description}
Tone: ${brandInfo.tone}

${CATEGORY_PROMPTS[category]}

RULES:
- Write ONLY the script text that will be read aloud. No stage directions, no brackets, no annotations.
- Target approximately ${wordCount} words (${durationTarget} seconds at normal reading pace).
- Use natural, conversational language suitable for radio.
- Include the brand name naturally within the script.
- End with a clear call to action or memorable closing.
- Do NOT include music cues, sound effects notes, or production directions.`;

    const userPrompt = customPrompt 
      ? `Generate a ${category} commercial with this direction: ${customPrompt}`
      : `Generate a ${category} commercial for ${brandInfo.name}. Make it compelling and authentic.`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const script = response.choices[0]?.message?.content || `You're listening to ${brandInfo.name}. ${brandInfo.tagline}.`;
      const estimatedDuration = Math.round((script.split(/\s+/).length / 150) * 60);

      const commercial: CommercialScript = {
        id: `commercial_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        title: `${brandInfo.name} ${category.replace('_', ' ')} — ${new Date().toLocaleDateString()}`,
        category,
        brand,
        script: script.trim(),
        duration: estimatedDuration || durationTarget,
        voiceDirection: brandInfo.tone,
        musicDirection: this.getMusicDirection(category, brand),
        status: 'draft',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        scheduledSlots: [],
        playCount: 0,
        generatedBy: 'ai',
      };

      this.commercials.push(commercial);
      return commercial;
    } catch (error) {
      // Fallback to template-based generation
      return this.generateFallbackScript(category, brand, durationTarget);
    }
  }

  private getMusicDirection(category: CommercialCategory, brand: string): string {
    const directions: Record<string, string> = {
      'promo_rrb_radio': 'Funky bass groove, 70s soul feel, warm and energetic',
      'promo_canryn_production': 'Modern cinematic, inspiring orchestral undertones',
      'psa_sweet_miracles': 'Gentle piano, hopeful strings, compassionate mood',
      'station_id_rrb_radio': 'Funky horn stab, quick groove, signature sound',
      'jingle_rrb_radio': 'Catchy funk riff, claps, "Rockin Rockin Boogie" hook',
      'event_canryn_production': 'Upbeat, building energy, celebratory',
      'fundraiser_sweet_miracles': 'Warm acoustic guitar, heartfelt, building to hopeful',
      'community_qmunity': 'Friendly, light percussion, community feel',
    };
    return directions[`${category}_${brand}`] || 'Appropriate background music matching brand tone';
  }

  private generateFallbackScript(
    category: CommercialCategory,
    brand: string,
    duration: number,
  ): CommercialScript {
    const brandInfo = BRANDS[brand as keyof typeof BRANDS] || BRANDS['canryn_production'];
    
    const templates: Record<CommercialCategory, string> = {
      promo: `${brandInfo.name} — ${brandInfo.tagline}. ${brandInfo.description} Visit us online and discover what makes us different. ${brandInfo.name} — where community comes first.`,
      psa: `This is a public service announcement from the Sweet Miracles Foundation. We believe everyone deserves a voice. If you or someone you know needs support, reach out to Sweet Miracles — Voice for the Voiceless. Together, we can make a difference.`,
      sponsor: `This program is brought to you by ${brandInfo.name}. ${brandInfo.tagline}. Thank you for supporting community media.`,
      event: `Mark your calendars! ${brandInfo.name} presents a special community event. Join us for an unforgettable experience. Visit our website for details. ${brandInfo.name} — ${brandInfo.tagline}.`,
      station_id: `You're listening to Rockin' Rockin' Boogie Radio — The Sound of a Legacy Restored. Powered by Canryn Production.`,
      jingle: `Rockin' Rockin' Boogie! The sound that moves you. RRB Radio!`,
      fundraiser: `Sweet Miracles Foundation needs your support. Every dollar helps us be a Voice for the Voiceless. Donate today and help us empower communities in crisis. Sweet Miracles — because every voice matters.`,
      community: `This is a community announcement from ${brandInfo.name}. We're building something special together. Join our community and be part of the movement. ${brandInfo.tagline}.`,
    };

    const script = templates[category];
    return {
      id: `commercial_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      title: `${brandInfo.name} ${category.replace('_', ' ')} — Default`,
      category,
      brand,
      script,
      duration: Math.round((script.split(/\s+/).length / 150) * 60) || duration,
      voiceDirection: brandInfo.tone,
      musicDirection: this.getMusicDirection(category, brand),
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      scheduledSlots: this.getDefaultSchedule(category),
      playCount: 0,
      generatedBy: 'ai',
    };
  }

  private getDefaultSchedule(category: CommercialCategory): ScheduleSlot[] {
    const allDays = [0, 1, 2, 3, 4, 5, 6];
    switch (category) {
      case 'station_id':
        return [{ id: `slot_${Date.now()}`, dayOfWeek: allDays, hourStart: 0, hourEnd: 23, frequency: 4, priority: 10 }];
      case 'psa':
      case 'fundraiser':
        return [{ id: `slot_${Date.now()}`, dayOfWeek: allDays, hourStart: 6, hourEnd: 22, frequency: 2, priority: 7 }];
      case 'promo':
        return [{ id: `slot_${Date.now()}`, dayOfWeek: allDays, hourStart: 6, hourEnd: 23, frequency: 3, priority: 8 }];
      case 'event':
        return [{ id: `slot_${Date.now()}`, dayOfWeek: allDays, hourStart: 8, hourEnd: 20, frequency: 2, priority: 6 }];
      default:
        return [{ id: `slot_${Date.now()}`, dayOfWeek: allDays, hourStart: 6, hourEnd: 22, frequency: 1, priority: 5 }];
    }
  }

  // ─── Seed Default Commercials ─────────────────────────────────────────────

  private seedDefaultCommercials() {
    // Station IDs — play most frequently
    this.commercials.push({
      id: 'commercial_default_station_id_1',
      title: "RRB Radio Station ID — Primary",
      category: 'station_id',
      brand: 'rrb_radio',
      script: "You're listening to Rockin' Rockin' Boogie Radio — The Sound of a Legacy Restored. Broadcasting the funk, soul, and R&B that defined an era. Seabrun Candy Hunter's legacy lives on. Powered by Canryn Production and the QUMUS autonomous platform. RRB Radio — where the groove never stops.",
      duration: 15,
      voiceDirection: 'warm, energetic, soulful',
      musicDirection: 'Funky bass groove with horn stabs, 70s soul feel',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      scheduledSlots: this.getDefaultSchedule('station_id'),
      playCount: 0,
      generatedBy: 'ai',
    });

    this.commercials.push({
      id: 'commercial_default_station_id_2',
      title: "RRB Radio Station ID — Short",
      category: 'station_id',
      brand: 'rrb_radio',
      script: "RRB Radio. Rockin' Rockin' Boogie. The legacy continues.",
      duration: 5,
      voiceDirection: 'punchy, confident',
      musicDirection: 'Quick funk stab, signature sound',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      scheduledSlots: this.getDefaultSchedule('station_id'),
      playCount: 0,
      generatedBy: 'ai',
    });

    // Sweet Miracles PSA
    this.commercials.push({
      id: 'commercial_default_psa_1',
      title: "Sweet Miracles — Voice for the Voiceless PSA",
      category: 'psa',
      brand: 'sweet_miracles',
      script: "The Sweet Miracles Foundation believes every voice matters. As a Voice for the Voiceless, we empower communities in crisis through emergency communication, wellness support, and direct action. When disaster strikes, Sweet Miracles is there — with HybridCast emergency broadcasting, community wellness check-ins, and resources that reach those who need them most. You can make a difference. Visit Sweet Miracles dot org to learn how you can help. Sweet Miracles Foundation — because no one should face a crisis alone.",
      duration: 30,
      voiceDirection: 'compassionate, warm, building to hopeful',
      musicDirection: 'Gentle piano intro, building strings, hopeful resolution',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      scheduledSlots: this.getDefaultSchedule('psa'),
      playCount: 0,
      generatedBy: 'ai',
    });

    // Canryn Production Promo
    this.commercials.push({
      id: 'commercial_default_promo_1',
      title: "Canryn Production — Where Legacy Meets Innovation",
      category: 'promo',
      brand: 'canryn_production',
      script: "Canryn Production — Where Legacy Meets Innovation. From the recording studio to the broadcast tower, from sacred mathematics to autonomous intelligence, Canryn Production is building the future of media. A minority-owned production company preserving musical history while pushing the boundaries of what's possible. Explore our ecosystem — RRB Radio, Sweet Miracles Foundation, HybridCast Emergency Broadcasting, and more. All powered by QUMUS autonomous orchestration. Canryn Production — creating tomorrow's legacy today.",
      duration: 30,
      voiceDirection: 'professional, inspiring, modern',
      musicDirection: 'Cinematic build, modern production, inspiring crescendo',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      scheduledSlots: this.getDefaultSchedule('promo'),
      playCount: 0,
      generatedBy: 'ai',
    });

    // Solbones Game Promo
    this.commercials.push({
      id: 'commercial_default_promo_2',
      title: "Solbones 4+3+2 — Sacred Math Dice Game",
      category: 'promo',
      brand: 'solbones',
      script: "Ready to roll? Solbones four plus three plus two — the sacred math dice game that combines Solfeggio healing frequencies with multiplayer competition. Play solo, challenge up to nine friends, or test your luck against QUMUS AI opponents. Every roll resonates with ancient frequencies. Every game is a journey. Solbones — available now on the Canryn Production platform. Roll the sacred dice.",
      duration: 25,
      voiceDirection: 'playful, mystical, inviting',
      musicDirection: 'Solfeggio tones, playful percussion, building excitement',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      scheduledSlots: this.getDefaultSchedule('promo'),
      playCount: 0,
      generatedBy: 'ai',
    });

    // Sweet Miracles Fundraiser
    this.commercials.push({
      id: 'commercial_default_fundraiser_1',
      title: "Sweet Miracles — Donate Today",
      category: 'fundraiser',
      brand: 'sweet_miracles',
      script: "Every voice deserves to be heard. The Sweet Miracles Foundation is on a mission to be a Voice for the Voiceless — providing emergency communication tools, community wellness programs, and crisis support to those who need it most. Your donation makes a real difference. Just ten dollars provides emergency communication access for a family in crisis. Twenty-five dollars funds a community wellness check-in session. Visit our website to donate today. Sweet Miracles Foundation — together, we amplify every voice.",
      duration: 30,
      voiceDirection: 'heartfelt, urgent but warm, hopeful ending',
      musicDirection: 'Acoustic guitar, gentle strings building to hopeful resolution',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      scheduledSlots: this.getDefaultSchedule('fundraiser'),
      playCount: 0,
      generatedBy: 'ai',
    });

    // HybridCast Community Announcement
    this.commercials.push({
      id: 'commercial_default_community_1',
      title: "HybridCast — Emergency Preparedness",
      category: 'community',
      brand: 'hybridcast',
      script: "Are you prepared? HybridCast Emergency Broadcast keeps you connected when it matters most. With offline-first mesh networking, your device becomes part of a resilient communication network — even without internet or cell service. Download the HybridCast app today and join the emergency preparedness network. When every second counts, HybridCast delivers. A Canryn Production service, powered by QUMUS.",
      duration: 25,
      voiceDirection: 'authoritative, reassuring, clear call to action',
      musicDirection: 'Urgent but not alarming, building confidence, resolute ending',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      scheduledSlots: this.getDefaultSchedule('community'),
      playCount: 0,
      generatedBy: 'ai',
    });

    console.log(`[Commercial Engine] Seeded ${this.commercials.length} default commercials`);
  }

  // ─── Rotation Logic ───────────────────────────────────────────────────────

  startRotation() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Check rotation every 30 seconds
    this.rotationInterval = setInterval(() => {
      this.advanceRotation();
    }, 30_000);

    this.advanceRotation(); // Initial advance
    console.log('[Commercial Engine] Rotation started — commercials will air on schedule');
  }

  stopRotation() {
    this.isRunning = false;
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
    console.log('[Commercial Engine] Rotation stopped');
  }

  private advanceRotation() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Find eligible commercials for this time slot
    const eligible = this.commercials.filter(c => {
      if (c.status !== 'active') return false;
      return c.scheduledSlots.some(slot =>
        slot.dayOfWeek.includes(dayOfWeek) &&
        hour >= slot.hourStart &&
        hour <= slot.hourEnd
      );
    });

    if (eligible.length === 0) return;

    // Weighted random selection based on priority
    const weighted = eligible.flatMap(c => {
      const maxPriority = Math.max(
        ...c.scheduledSlots
          .filter(s => s.dayOfWeek.includes(dayOfWeek) && hour >= s.hourStart && hour <= s.hourEnd)
          .map(s => s.priority)
      );
      return Array(maxPriority).fill(c);
    });

    const selected = weighted[Math.floor(Math.random() * weighted.length)];
    if (selected) {
      this.rotation.currentCommercial = selected;
      this.rotation.lastPlayedAt = Date.now();
      this.rotation.totalPlaysToday++;
      selected.playCount++;
      selected.updatedAt = Date.now();

      // Pre-select next commercial
      const remaining = eligible.filter(c => c.id !== selected.id);
      this.rotation.nextCommercial = remaining.length > 0
        ? remaining[Math.floor(Math.random() * remaining.length)]
        : selected;
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  getCommercials(category?: CommercialCategory, brand?: string): CommercialScript[] {
    let result = [...this.commercials];
    if (category) result = result.filter(c => c.category === category);
    if (brand) result = result.filter(c => c.brand === brand);
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getCommercial(id: string): CommercialScript | null {
    return this.commercials.find(c => c.id === id) || null;
  }

  updateCommercial(id: string, updates: Partial<CommercialScript>): CommercialScript | null {
    const idx = this.commercials.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.commercials[idx] = { ...this.commercials[idx], ...updates, updatedAt: Date.now() };
    return this.commercials[idx];
  }

  deleteCommercial(id: string): boolean {
    const idx = this.commercials.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.commercials.splice(idx, 1);
    return true;
  }

  getRotation(): CommercialRotation {
    return { ...this.rotation };
  }

  getNextCommercial(): CommercialScript | null {
    this.advanceRotation();
    return this.rotation.currentCommercial;
  }

  markPlayed(id: string): void {
    const commercial = this.commercials.find(c => c.id === id);
    if (commercial) {
      commercial.playCount++;
      commercial.updatedAt = Date.now();
      this.rotation.lastPlayedAt = Date.now();
      this.rotation.totalPlaysToday++;
    }
  }

  getStats() {
    const active = this.commercials.filter(c => c.status === 'active');
    const byCategory = Object.fromEntries(
      (['promo', 'psa', 'sponsor', 'event', 'station_id', 'jingle', 'fundraiser', 'community'] as CommercialCategory[])
        .map(cat => [cat, this.commercials.filter(c => c.category === cat).length])
    );
    const byBrand = Object.fromEntries(
      Object.keys(BRANDS).map(b => [b, this.commercials.filter(c => c.brand === b).length])
    );
    return {
      totalCommercials: this.commercials.length,
      activeCommercials: active.length,
      totalPlaysToday: this.rotation.totalPlaysToday,
      totalPlaysAllTime: this.commercials.reduce((sum, c) => sum + c.playCount, 0),
      rotationActive: this.isRunning,
      byCategory,
      byBrand,
      availableBrands: Object.entries(BRANDS).map(([id, info]) => ({ id, name: info.name, tagline: info.tagline })),
      availableCategories: ['promo', 'psa', 'sponsor', 'event', 'station_id', 'jingle', 'fundraiser', 'community'],
    };
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

let engine: CommercialEngine | null = null;

export function getCommercialEngine(): CommercialEngine {
  if (!engine) {
    engine = new CommercialEngine();
  }
  return engine;
}

export function startCommercialEngine(): void {
  const e = getCommercialEngine();
  e.startRotation();
}
