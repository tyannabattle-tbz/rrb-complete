/**
 * QUMUS Content Scheduler Service
 * 24/7 automated content rotation across all channels
 * Manages time-slot scheduling, content queues, and emergency overrides
 */

export interface ScheduleSlot {
  id: string;
  channelId: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  contentType: 'radio' | 'podcast' | 'audiobook' | 'commercial' | 'emergency';
  title: string;
  priority: number; // 1-10
  daysOfWeek: number[]; // 0=Sun, 6=Sat
  isActive: boolean;
  createdAt: number;
}

export interface Channel {
  id: string;
  name: string;
  type: 'radio' | 'podcast' | 'streaming' | 'emergency';
  status: 'active' | 'inactive' | 'maintenance';
  currentContent: string | null;
  listeners: number;
}

export interface SchedulerStatus {
  isRunning: boolean;
  activeChannels: number;
  totalSlots: number;
  autonomyLevel: number;
  uptime: number;
  lastRotation: number;
  nextRotation: number;
}

export class ContentSchedulerService {
  private channels: Map<string, Channel> = new Map();
  private scheduleSlots: Map<string, ScheduleSlot> = new Map();
  private isRunning: boolean = false;
  private startTime: number = 0;
  private lastRotation: number = 0;
  private autonomyLevel: number = 90;
  private rotationInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initializeDefaultChannels();
    this.initializeDefaultSchedule();
  }

  private initializeDefaultChannels(): void {
    const defaultChannels: Channel[] = [
      { id: 'ch-001', name: 'RRB Main Radio', type: 'radio', status: 'active', currentContent: 'Top of the Sol Drive Show', listeners: 12450 },
      { id: 'ch-002', name: 'Podcast Network', type: 'podcast', status: 'active', currentContent: 'Tech Talk Daily', listeners: 8920 },
      { id: 'ch-003', name: 'Audiobook Stream', type: 'streaming', status: 'active', currentContent: 'Classic Literature Hour', listeners: 3200 },
      { id: 'ch-004', name: 'Emergency Broadcast', type: 'emergency', status: 'active', currentContent: null, listeners: 0 },
      { id: 'ch-005', name: 'Music Discovery', type: 'streaming', status: 'active', currentContent: 'Indie Spotlight', listeners: 5600 },
      { id: 'ch-006', name: 'Community Voice', type: 'radio', status: 'active', currentContent: 'Local Stories', listeners: 2100 },
      { id: 'ch-007', name: 'Drop Radio', type: 'streaming', status: 'active', currentContent: '432Hz Meditation', listeners: 1800 },
    ];
    defaultChannels.forEach(ch => this.channels.set(ch.id, ch));
  }

  private initializeDefaultSchedule(): void {
    const defaultSlots: ScheduleSlot[] = [
      // ═══════════════════════════════════════════════════════════
      // CH-001: RRB Main Radio — 24/7 Coverage
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-001', channelId: 'ch-001', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'Overnight Chill Mix — Smooth Jazz & Lo-Fi', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-002', channelId: 'ch-001', startTime: '06:00', endTime: '09:00', contentType: 'radio', title: 'Top of the Sol Drive Show', priority: 10, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-003', channelId: 'ch-001', startTime: '09:00', endTime: '12:00', contentType: 'radio', title: 'Mid-Top of the Sol Mix — R&B Classics', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-004', channelId: 'ch-001', startTime: '12:00', endTime: '15:00', contentType: 'radio', title: 'Afternoon Vibes — Soul & Funk', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-005', channelId: 'ch-001', startTime: '15:00', endTime: '18:00', contentType: 'radio', title: 'Drive Time Classics — Boogie Revival', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-006', channelId: 'ch-001', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Evening Jazz & Soul Sessions', priority: 7, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-007', channelId: 'ch-001', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Late Night Grooves — Deep Cuts', priority: 5, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-008', channelId: 'ch-001', startTime: '08:00', endTime: '12:00', contentType: 'radio', title: 'Weekend Brunch Mix — Gospel & Soul', priority: 8, daysOfWeek: [0,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-009', channelId: 'ch-001', startTime: '12:00', endTime: '18:00', contentType: 'radio', title: 'Saturday Soul Train Block', priority: 7, daysOfWeek: [6], isActive: true, createdAt: Date.now() },
      { id: 'slot-010', channelId: 'ch-001', startTime: '12:00', endTime: '18:00', contentType: 'radio', title: 'Sunday Praise & Worship Hour', priority: 7, daysOfWeek: [0], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-002: Podcast Network — Full Day Programming
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-011', channelId: 'ch-002', startTime: '00:00', endTime: '06:00', contentType: 'podcast', title: 'Replay — Best of the Week', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-012', channelId: 'ch-002', startTime: '06:00', endTime: '08:00', contentType: 'podcast', title: 'Top of the Sol News Digest', priority: 9, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-013', channelId: 'ch-002', startTime: '08:00', endTime: '10:00', contentType: 'podcast', title: 'Tech Talk Daily', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-014', channelId: 'ch-002', startTime: '10:00', endTime: '12:00', contentType: 'podcast', title: 'The Legacy Chronicles — Music History', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-015', channelId: 'ch-002', startTime: '12:00', endTime: '14:00', contentType: 'podcast', title: 'Interview Hour — Industry Legends', priority: 6, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-016', channelId: 'ch-002', startTime: '14:00', endTime: '16:00', contentType: 'podcast', title: 'Creative Corner — Artist Spotlights', priority: 6, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-017', channelId: 'ch-002', startTime: '16:00', endTime: '18:00', contentType: 'podcast', title: 'Community Voices — Listener Stories', priority: 5, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-018', channelId: 'ch-002', startTime: '18:00', endTime: '21:00', contentType: 'podcast', title: 'Evening Deep Dives — Long Form', priority: 7, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-019', channelId: 'ch-002', startTime: '21:00', endTime: '23:59', contentType: 'podcast', title: 'Night Owl Conversations', priority: 4, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-003: Audiobook Stream — Full Day Coverage
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-020', channelId: 'ch-003', startTime: '00:00', endTime: '06:00', contentType: 'audiobook', title: 'Sleep Stories — Ambient Narration', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-021', channelId: 'ch-003', startTime: '06:00', endTime: '10:00', contentType: 'audiobook', title: 'Top of the Sol Reads — Motivational', priority: 7, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-022', channelId: 'ch-003', startTime: '10:00', endTime: '14:00', contentType: 'audiobook', title: 'Classic Literature Hour — African American Authors', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-023', channelId: 'ch-003', startTime: '14:00', endTime: '18:00', contentType: 'audiobook', title: 'Youth Scroll — Young Readers Series', priority: 7, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-024', channelId: 'ch-003', startTime: '18:00', endTime: '23:59', contentType: 'audiobook', title: 'Evening Chapters — Fiction & Biography', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-004: Emergency Broadcast — 24/7 Standby
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-025', channelId: 'ch-004', startTime: '00:00', endTime: '06:00', contentType: 'emergency', title: 'HybridCast Emergency Standby — Overnight', priority: 10, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-026', channelId: 'ch-004', startTime: '06:00', endTime: '12:00', contentType: 'emergency', title: 'HybridCast Emergency Standby — Top of the Sol', priority: 10, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-027', channelId: 'ch-004', startTime: '12:00', endTime: '18:00', contentType: 'emergency', title: 'HybridCast Emergency Standby — Afternoon', priority: 10, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-028', channelId: 'ch-004', startTime: '18:00', endTime: '23:59', contentType: 'emergency', title: 'HybridCast Emergency Standby — Evening', priority: 10, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-005: Music Discovery — Full Day Coverage
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-029', channelId: 'ch-005', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'Discovery After Dark — Underground Gems', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-030', channelId: 'ch-005', startTime: '06:00', endTime: '10:00', contentType: 'radio', title: 'Fresh Finds — New Releases', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-031', channelId: 'ch-005', startTime: '10:00', endTime: '14:00', contentType: 'radio', title: 'Indie Spotlight — Emerging Artists', priority: 7, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-032', channelId: 'ch-005', startTime: '14:00', endTime: '18:00', contentType: 'radio', title: 'Genre Crossroads — Fusion Sessions', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-033', channelId: 'ch-005', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Curated Collections — Staff Picks', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-034', channelId: 'ch-005', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Late Discovery — Experimental Sounds', priority: 4, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-035', channelId: 'ch-005', startTime: '10:00', endTime: '16:00', contentType: 'radio', title: 'Indie Discovery Saturday Marathon', priority: 8, daysOfWeek: [6], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-006: Community Voice — Full Day Coverage
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-036', channelId: 'ch-006', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'Community Replay — Best Moments', priority: 2, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-037', channelId: 'ch-006', startTime: '06:00', endTime: '09:00', contentType: 'radio', title: 'Top of the Sol Community Check-In', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-038', channelId: 'ch-006', startTime: '09:00', endTime: '12:00', contentType: 'radio', title: 'Local Stories — Neighborhood Voices', priority: 6, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-039', channelId: 'ch-006', startTime: '12:00', endTime: '15:00', contentType: 'radio', title: 'Youth Voices — Next Generation', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-040', channelId: 'ch-006', startTime: '15:00', endTime: '18:00', contentType: 'radio', title: 'Community Calendar — Events & Announcements', priority: 6, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-041', channelId: 'ch-006', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Evening Town Hall — Open Mic', priority: 7, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-042', channelId: 'ch-006', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Night Community — Listener Call-Ins', priority: 4, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-043', channelId: 'ch-006', startTime: '14:00', endTime: '17:00', contentType: 'radio', title: 'Sunday Community Spotlight', priority: 8, daysOfWeek: [0], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-007: Drop Radio 432Hz — Full Day Coverage
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-044', channelId: 'ch-007', startTime: '00:00', endTime: '03:00', contentType: 'radio', title: 'Deep Sleep — 432Hz Delta Waves', priority: 4, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-045', channelId: 'ch-007', startTime: '03:00', endTime: '06:00', contentType: 'radio', title: 'Pre-Dawn — 528Hz Healing Frequencies', priority: 4, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-046', channelId: 'ch-007', startTime: '06:00', endTime: '09:00', contentType: 'radio', title: 'Top of the Sol Rise — 396Hz Liberation', priority: 7, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-047', channelId: 'ch-007', startTime: '09:00', endTime: '12:00', contentType: 'radio', title: 'Focus Flow — 417Hz Change Frequency', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-048', channelId: 'ch-007', startTime: '12:00', endTime: '15:00', contentType: 'radio', title: 'Midday Meditation — 639Hz Connection', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-049', channelId: 'ch-007', startTime: '15:00', endTime: '18:00', contentType: 'radio', title: 'Afternoon Harmony — 741Hz Expression', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-050', channelId: 'ch-007', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Evening Calm — 852Hz Intuition', priority: 7, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-051', channelId: 'ch-007', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Night Peace — 963Hz Crown Activation', priority: 5, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // Commercial Breaks — Across Channels
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-052', channelId: 'ch-001', startTime: '07:30', endTime: '07:35', contentType: 'commercial', title: 'Top of the Sol Sponsor Break', priority: 10, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-053', channelId: 'ch-001', startTime: '12:30', endTime: '12:35', contentType: 'commercial', title: 'Midday Sponsor Break', priority: 9, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-054', channelId: 'ch-001', startTime: '17:30', endTime: '17:35', contentType: 'commercial', title: 'Drive Time Sponsor Break', priority: 9, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-055', channelId: 'ch-002', startTime: '09:00', endTime: '09:05', contentType: 'commercial', title: 'Podcast Network Sponsor', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-056', channelId: 'ch-002', startTime: '15:00', endTime: '15:05', contentType: 'commercial', title: 'Afternoon Podcast Sponsor', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-057', channelId: 'ch-005', startTime: '11:00', endTime: '11:05', contentType: 'commercial', title: 'Discovery Channel Sponsor', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-058', channelId: 'ch-006', startTime: '10:00', endTime: '10:05', contentType: 'commercial', title: 'Community Voice Sponsor', priority: 6, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-059', channelId: 'ch-001', startTime: '10:00', endTime: '10:05', contentType: 'commercial', title: 'Weekend Brunch Sponsor', priority: 8, daysOfWeek: [0,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-060', channelId: 'ch-005', startTime: '13:00', endTime: '13:05', contentType: 'commercial', title: 'Saturday Discovery Sponsor', priority: 7, daysOfWeek: [6], isActive: true, createdAt: Date.now() },
      { id: 'slot-061', channelId: 'ch-006', startTime: '15:30', endTime: '15:35', contentType: 'commercial', title: 'Sunday Spotlight Sponsor', priority: 7, daysOfWeek: [0], isActive: true, createdAt: Date.now() },
      { id: 'slot-062', channelId: 'ch-003', startTime: '16:00', endTime: '16:05', contentType: 'commercial', title: 'Audiobook Stream Sponsor', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
    ];
    defaultSlots.forEach(slot => this.scheduleSlots.set(slot.id, slot));
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = Date.now();
    this.lastRotation = Date.now();
    console.log(`[ContentScheduler] Initializing 24/7 content scheduler...`);
    console.log(`[ContentScheduler] Active with ${this.channels.size} channels, ${this.scheduleSlots.size} schedule slots`);
    console.log(`[ContentScheduler] Autonomy level: ${this.autonomyLevel}%`);
  }

  stop(): void {
    this.isRunning = false;
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
    console.log('[ContentScheduler] Shut down');
  }

  getStatus(): SchedulerStatus {
    const activeChannels = Array.from(this.channels.values()).filter(ch => ch.status === 'active').length;
    return {
      isRunning: this.isRunning,
      activeChannels,
      totalSlots: this.scheduleSlots.size,
      autonomyLevel: this.autonomyLevel,
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
      lastRotation: this.lastRotation,
      nextRotation: this.lastRotation + 300000,
    };
  }

  getChannels(): Channel[] {
    return Array.from(this.channels.values());
  }

  getChannel(id: string): Channel | undefined {
    return this.channels.get(id);
  }

  getScheduleSlots(): ScheduleSlot[] {
    return Array.from(this.scheduleSlots.values());
  }

  getSlotsByChannel(channelId: string): ScheduleSlot[] {
    return Array.from(this.scheduleSlots.values()).filter(s => s.channelId === channelId);
  }

  getCurrentSlots(): ScheduleSlot[] {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = now.getDay();
    return Array.from(this.scheduleSlots.values()).filter(slot =>
      slot.isActive &&
      slot.daysOfWeek.includes(currentDay) &&
      slot.startTime <= currentTime &&
      slot.endTime > currentTime
    );
  }

  addSlot(slot: Omit<ScheduleSlot, 'id' | 'createdAt'>): ScheduleSlot {
    const newSlot: ScheduleSlot = {
      ...slot,
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };
    this.scheduleSlots.set(newSlot.id, newSlot);
    return newSlot;
  }

  updateSlot(id: string, updates: Partial<ScheduleSlot>): ScheduleSlot | null {
    const slot = this.scheduleSlots.get(id);
    if (!slot) return null;
    const updated = { ...slot, ...updates, id: slot.id };
    this.scheduleSlots.set(id, updated);
    return updated;
  }

  deleteSlot(id: string): boolean {
    return this.scheduleSlots.delete(id);
  }

  triggerEmergencyOverride(channelId: string, message: string): boolean {
    const channel = this.channels.get(channelId);
    if (!channel) return false;
    channel.currentContent = `[EMERGENCY] ${message}`;
    channel.status = 'active';
    this.channels.set(channelId, channel);
    this.lastRotation = Date.now();
    return true;
  }

  rotateContent(): { rotated: number; channels: string[] } {
    const currentSlots = this.getCurrentSlots();
    let rotated = 0;
    const rotatedChannels: string[] = [];

    for (const slot of currentSlots) {
      const channel = this.channels.get(slot.channelId);
      if (channel && channel.currentContent !== slot.title) {
        channel.currentContent = slot.title;
        this.channels.set(slot.channelId, channel);
        rotated++;
        rotatedChannels.push(channel.name);
      }
    }

    this.lastRotation = Date.now();
    return { rotated, channels: rotatedChannels };
  }

  setAutonomyLevel(level: number): void {
    this.autonomyLevel = Math.max(0, Math.min(100, level));
  }

  moveSlot(slotId: string, newStartTime: string, newEndTime: string, newChannelId?: string): ScheduleSlot | null {
    const slot = this.scheduleSlots.get(slotId);
    if (!slot) return null;
    const updated: ScheduleSlot = {
      ...slot,
      startTime: newStartTime,
      endTime: newEndTime,
      channelId: newChannelId || slot.channelId,
    };
    this.scheduleSlots.set(slotId, updated);
    return updated;
  }

  reorderSlots(slotIds: string[]): ScheduleSlot[] {
    // Reassign priorities based on new order (highest first)
    const maxPriority = slotIds.length;
    const updated: ScheduleSlot[] = [];
    slotIds.forEach((id, index) => {
      const slot = this.scheduleSlots.get(id);
      if (slot) {
        slot.priority = Math.max(1, Math.min(10, maxPriority - index));
        this.scheduleSlots.set(id, slot);
        updated.push(slot);
      }
    });
    return updated;
  }
}

// Singleton instance
let schedulerInstance: ContentSchedulerService | null = null;

export function getContentScheduler(): ContentSchedulerService {
  if (!schedulerInstance) {
    schedulerInstance = new ContentSchedulerService();
  }
  return schedulerInstance;
}
