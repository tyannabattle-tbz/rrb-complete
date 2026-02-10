/**
 * QUMUS Content Scheduler Service
 * 24/7 automated content rotation across 7 channels
 * Manages time-slot scheduling, content queues, and emergency overrides
 * 
 * Channels:
 *  1. RRB Main Radio — Flagship station
 *  2. Blues Channel — Blues classics and new artists
 *  3. Jazz Channel — Jazz standards and contemporary
 *  4. Soul Channel — Soul, R&B, and Motown
 *  5. Gospel Channel — Gospel and praise music
 *  6. Funk Channel — Funk, boogie, and dance
 *  7. King Richard's 70s Rock — Classic 70s rock
 */

export interface ScheduleSlot {
  id: string;
  channelId: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  contentType: 'radio' | 'podcast' | 'audiobook' | 'commercial' | 'emergency' | 'meditation' | 'talk' | 'community';
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
  genre?: string;
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
      { id: 'ch-001', name: 'RRB Main Radio', type: 'radio', status: 'active', currentContent: 'Top of the Sol Drive Show', listeners: 12450, genre: 'mixed' },
      { id: 'ch-002', name: 'Blues Channel', type: 'radio', status: 'active', currentContent: 'Delta Blues Hour', listeners: 4820, genre: 'blues' },
      { id: 'ch-003', name: 'Jazz Channel', type: 'radio', status: 'active', currentContent: 'Smooth Jazz Morning', listeners: 5200, genre: 'jazz' },
      { id: 'ch-004', name: 'Soul Channel', type: 'radio', status: 'active', currentContent: 'Classic Soul Revue', listeners: 6100, genre: 'soul' },
      { id: 'ch-005', name: 'Gospel Channel', type: 'radio', status: 'active', currentContent: 'Morning Praise Hour', listeners: 3800, genre: 'gospel' },
      { id: 'ch-006', name: 'Funk Channel', type: 'radio', status: 'active', currentContent: 'Funky Grooves Mix', listeners: 4200, genre: 'funk' },
      { id: 'ch-007', name: "King Richard's 70s Rock", type: 'radio', status: 'active', currentContent: 'Classic Rock Block', listeners: 3500, genre: 'rock' },
    ];
    defaultChannels.forEach(ch => this.channels.set(ch.id, ch));
  }

  private initializeDefaultSchedule(): void {
    const defaultSlots: ScheduleSlot[] = [
      // ═══════════════════════════════════════════════════════════
      // CH-001: RRB Main Radio — 24/7 Flagship Coverage
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-001', channelId: 'ch-001', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'Overnight Chill Mix — Smooth Jazz & Lo-Fi', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-002', channelId: 'ch-001', startTime: '06:00', endTime: '09:00', contentType: 'radio', title: 'Top of the Sol Drive Show', priority: 10, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-003', channelId: 'ch-001', startTime: '09:00', endTime: '12:00', contentType: 'radio', title: 'Mid-Morning Mix — R&B Classics', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-004', channelId: 'ch-001', startTime: '12:00', endTime: '15:00', contentType: 'radio', title: 'Afternoon Vibes — Soul & Funk', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-005', channelId: 'ch-001', startTime: '15:00', endTime: '18:00', contentType: 'radio', title: 'Drive Time Classics — Boogie Revival', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-006', channelId: 'ch-001', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Evening Jazz & Soul Sessions', priority: 7, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-007', channelId: 'ch-001', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Late Night Grooves — Deep Cuts', priority: 5, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-008', channelId: 'ch-001', startTime: '08:00', endTime: '12:00', contentType: 'radio', title: 'Weekend Brunch Mix — Gospel & Soul', priority: 8, daysOfWeek: [0,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-009', channelId: 'ch-001', startTime: '12:00', endTime: '18:00', contentType: 'radio', title: 'Saturday Soul Train Block', priority: 7, daysOfWeek: [6], isActive: true, createdAt: Date.now() },
      { id: 'slot-010', channelId: 'ch-001', startTime: '12:00', endTime: '18:00', contentType: 'radio', title: 'Sunday Praise & Worship Hour', priority: 7, daysOfWeek: [0], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-002: Blues Channel — 24/7 Blues Programming
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-011', channelId: 'ch-002', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'Midnight Blues — Slow Burn Classics', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-012', channelId: 'ch-002', startTime: '06:00', endTime: '09:00', contentType: 'radio', title: 'Delta Blues Morning', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-013', channelId: 'ch-002', startTime: '09:00', endTime: '12:00', contentType: 'radio', title: 'Chicago Blues Hour', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-014', channelId: 'ch-002', startTime: '12:00', endTime: '15:00', contentType: 'radio', title: 'Electric Blues Afternoon', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-015', channelId: 'ch-002', startTime: '15:00', endTime: '18:00', contentType: 'radio', title: 'Blues Guitar Masters', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-016', channelId: 'ch-002', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Juke Joint Sessions', priority: 8, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-017', channelId: 'ch-002', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Late Night Blues Jam', priority: 5, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-018', channelId: 'ch-002', startTime: '10:00', endTime: '16:00', contentType: 'radio', title: 'Saturday Blues Festival', priority: 9, daysOfWeek: [6], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-003: Jazz Channel — 24/7 Jazz Programming
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-019', channelId: 'ch-003', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'Cool Jazz After Hours', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-020', channelId: 'ch-003', startTime: '06:00', endTime: '09:00', contentType: 'radio', title: 'Smooth Jazz Morning', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-021', channelId: 'ch-003', startTime: '09:00', endTime: '12:00', contentType: 'radio', title: 'Bebop & Beyond', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-022', channelId: 'ch-003', startTime: '12:00', endTime: '15:00', contentType: 'radio', title: 'Jazz Standards Hour', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-023', channelId: 'ch-003', startTime: '15:00', endTime: '18:00', contentType: 'radio', title: 'Contemporary Jazz Fusion', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-024', channelId: 'ch-003', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Jazz Club Live Sessions', priority: 8, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-025', channelId: 'ch-003', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Late Night Jazz Lounge', priority: 5, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-026', channelId: 'ch-003', startTime: '14:00', endTime: '18:00', contentType: 'radio', title: 'Sunday Jazz Brunch', priority: 9, daysOfWeek: [0], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-004: Soul Channel — 24/7 Soul & R&B Programming
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-027', channelId: 'ch-004', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'Quiet Storm — Late Night Soul', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-028', channelId: 'ch-004', startTime: '06:00', endTime: '09:00', contentType: 'radio', title: 'Classic Soul Revue', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-029', channelId: 'ch-004', startTime: '09:00', endTime: '12:00', contentType: 'radio', title: 'Motown Magic Hour', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-030', channelId: 'ch-004', startTime: '12:00', endTime: '15:00', contentType: 'radio', title: 'Neo-Soul Afternoon', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-031', channelId: 'ch-004', startTime: '15:00', endTime: '18:00', contentType: 'radio', title: 'R&B Slow Jams', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-032', channelId: 'ch-004', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Soul Food Sessions', priority: 8, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-033', channelId: 'ch-004', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Midnight Soul Train', priority: 5, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-034', channelId: 'ch-004', startTime: '10:00', endTime: '16:00', contentType: 'radio', title: 'Saturday Soul Train Marathon', priority: 9, daysOfWeek: [6], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-005: Gospel Channel — 24/7 Gospel & Praise Programming
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-035', channelId: 'ch-005', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'Night Watch — Devotional Music', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-036', channelId: 'ch-005', startTime: '06:00', endTime: '09:00', contentType: 'radio', title: 'Morning Praise Hour', priority: 9, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-037', channelId: 'ch-005', startTime: '09:00', endTime: '12:00', contentType: 'radio', title: 'Traditional Gospel Classics', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-038', channelId: 'ch-005', startTime: '12:00', endTime: '15:00', contentType: 'radio', title: 'Contemporary Gospel Mix', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-039', channelId: 'ch-005', startTime: '15:00', endTime: '18:00', contentType: 'radio', title: 'Gospel Choir Hour', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-040', channelId: 'ch-005', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Evening Worship Sessions', priority: 8, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-041', channelId: 'ch-005', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Hymns & Meditation', priority: 4, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-042', channelId: 'ch-005', startTime: '09:00', endTime: '14:00', contentType: 'radio', title: 'Sunday Service Broadcast', priority: 10, daysOfWeek: [0], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-006: Funk Channel — 24/7 Funk & Boogie Programming
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-043', channelId: 'ch-006', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'After Midnight Funk', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-044', channelId: 'ch-006', startTime: '06:00', endTime: '09:00', contentType: 'radio', title: 'Funky Morning Wake-Up', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-045', channelId: 'ch-006', startTime: '09:00', endTime: '12:00', contentType: 'radio', title: 'Parliament-Funkadelic Hour', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-046', channelId: 'ch-006', startTime: '12:00', endTime: '15:00', contentType: 'radio', title: 'Boogie Afternoon — Dance Floor Classics', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-047', channelId: 'ch-006', startTime: '15:00', endTime: '18:00', contentType: 'radio', title: 'Funk Bass Masters', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-048', channelId: 'ch-006', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Funky Grooves Mix', priority: 8, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-049', channelId: 'ch-006', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Late Night Boogie Party', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-050', channelId: 'ch-006', startTime: '20:00', endTime: '02:00', contentType: 'radio', title: 'Friday Night Funk Party', priority: 10, daysOfWeek: [5], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // CH-007: King Richard's 70s Rock — 24/7 Classic Rock
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-051', channelId: 'ch-007', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'Deep Cuts — Album Tracks', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-052', channelId: 'ch-007', startTime: '06:00', endTime: '09:00', contentType: 'radio', title: 'Classic Rock Morning', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-053', channelId: 'ch-007', startTime: '09:00', endTime: '12:00', contentType: 'radio', title: 'Arena Rock Anthems', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-054', channelId: 'ch-007', startTime: '12:00', endTime: '15:00', contentType: 'radio', title: 'Southern Rock Hour', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-055', channelId: 'ch-007', startTime: '15:00', endTime: '18:00', contentType: 'radio', title: 'Guitar Gods — Hendrix, Page, Clapton', priority: 8, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-056', channelId: 'ch-007', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Classic Rock Block', priority: 8, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-057', channelId: 'ch-007', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Vinyl Sessions — Full Albums', priority: 5, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-058', channelId: 'ch-007', startTime: '12:00', endTime: '18:00', contentType: 'radio', title: 'Saturday Rock Marathon', priority: 9, daysOfWeek: [6], isActive: true, createdAt: Date.now() },

      // ═══════════════════════════════════════════════════════════
      // Commercial Breaks — Across All Channels
      // ═══════════════════════════════════════════════════════════
      { id: 'slot-059', channelId: 'ch-001', startTime: '07:30', endTime: '07:35', contentType: 'commercial', title: 'Morning Sponsor Break', priority: 10, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-060', channelId: 'ch-001', startTime: '12:30', endTime: '12:35', contentType: 'commercial', title: 'Midday Sponsor Break', priority: 9, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-061', channelId: 'ch-001', startTime: '17:30', endTime: '17:35', contentType: 'commercial', title: 'Drive Time Sponsor Break', priority: 9, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-062', channelId: 'ch-002', startTime: '09:00', endTime: '09:05', contentType: 'commercial', title: 'Blues Channel Sponsor', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
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

    // Initial content rotation
    const initial = this.rotateContent();
    console.log(`[ContentScheduler] Initial rotation: ${initial.rotated} channels updated`);

    // Auto-rotate every 5 minutes (300,000ms)
    this.rotationInterval = setInterval(() => {
      if (!this.isRunning) return;
      const result = this.rotateContent();
      if (result.rotated > 0) {
        console.log(`[ContentScheduler] Auto-rotation: ${result.rotated} channels updated [${result.channels.join(', ')}]`);
      }
      // Update simulated listener counts
      this.updateListenerCounts();
    }, 300_000);
    console.log(`[ContentScheduler] Auto-rotation timer started (every 5 minutes)`);
  }

  private updateListenerCounts(): void {
    const hour = new Date().getHours();
    // Simulate realistic listener patterns: peak during morning/evening, low overnight
    const baseMultiplier = hour >= 6 && hour <= 9 ? 1.5 : hour >= 17 && hour <= 21 ? 1.8 : hour >= 0 && hour <= 5 ? 0.3 : 1.0;
    for (const [id, channel] of this.channels) {
      if (channel.status === 'active') {
        const baseListeners: Record<string, number> = {
          'ch-001': 12000, // RRB Main — highest
          'ch-002': 4500,  // Blues
          'ch-003': 5000,  // Jazz
          'ch-004': 6000,  // Soul
          'ch-005': 3500,  // Gospel
          'ch-006': 4000,  // Funk
          'ch-007': 3200,  // 70s Rock
        };
        const base = baseListeners[id] || 2000;
        channel.listeners = Math.floor(base * baseMultiplier * (0.8 + Math.random() * 0.4));
        this.channels.set(id, channel);
      }
    }
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

  getTotalListeners(): number {
    let total = 0;
    for (const channel of this.channels.values()) {
      total += channel.listeners;
    }
    return total;
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
