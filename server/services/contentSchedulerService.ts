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
      // Top of the Sol Block (6 AM - 12 PM)
      { id: 'slot-001', channelId: 'ch-001', startTime: '06:00', endTime: '09:00', contentType: 'radio', title: 'Top of the Sol Drive Show', priority: 10, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-002', channelId: 'ch-001', startTime: '09:00', endTime: '12:00', contentType: 'radio', title: 'Mid-Top of the Sol Mix', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-003', channelId: 'ch-002', startTime: '06:00', endTime: '08:00', contentType: 'podcast', title: 'Top of the Sol News Digest', priority: 9, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-004', channelId: 'ch-002', startTime: '08:00', endTime: '12:00', contentType: 'podcast', title: 'Tech Talk Daily', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      // Afternoon Block (12 PM - 6 PM)
      { id: 'slot-005', channelId: 'ch-001', startTime: '12:00', endTime: '15:00', contentType: 'radio', title: 'Afternoon Vibes', priority: 7, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-006', channelId: 'ch-001', startTime: '15:00', endTime: '18:00', contentType: 'radio', title: 'Drive Time Classics', priority: 8, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      { id: 'slot-007', channelId: 'ch-002', startTime: '12:00', endTime: '18:00', contentType: 'podcast', title: 'Interview Hour', priority: 6, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
      // Evening Block (6 PM - 12 AM)
      { id: 'slot-008', channelId: 'ch-001', startTime: '18:00', endTime: '21:00', contentType: 'radio', title: 'Evening Jazz & Soul', priority: 7, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-009', channelId: 'ch-001', startTime: '21:00', endTime: '23:59', contentType: 'radio', title: 'Late Night Grooves', priority: 5, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-010', channelId: 'ch-003', startTime: '18:00', endTime: '23:59', contentType: 'audiobook', title: 'Classic Literature Hour', priority: 6, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      // Overnight Block (12 AM - 6 AM)
      { id: 'slot-011', channelId: 'ch-001', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'Overnight Chill Mix', priority: 3, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-012', channelId: 'ch-007', startTime: '00:00', endTime: '06:00', contentType: 'radio', title: 'Drop Radio Overnight', priority: 4, daysOfWeek: [0,1,2,3,4,5,6], isActive: true, createdAt: Date.now() },
      // Weekend Specials
      { id: 'slot-013', channelId: 'ch-001', startTime: '08:00', endTime: '12:00', contentType: 'radio', title: 'Weekend Brunch Mix', priority: 8, daysOfWeek: [0,6], isActive: true, createdAt: Date.now() },
      { id: 'slot-014', channelId: 'ch-005', startTime: '10:00', endTime: '16:00', contentType: 'radio', title: 'Indie Discovery Saturday', priority: 7, daysOfWeek: [6], isActive: true, createdAt: Date.now() },
      { id: 'slot-015', channelId: 'ch-006', startTime: '14:00', endTime: '17:00', contentType: 'radio', title: 'Community Spotlight', priority: 8, daysOfWeek: [0], isActive: true, createdAt: Date.now() },
      // Commercial Slots
      { id: 'slot-016', channelId: 'ch-001', startTime: '07:30', endTime: '07:35', contentType: 'commercial', title: 'Top of the Sol Sponsor Break', priority: 10, daysOfWeek: [1,2,3,4,5], isActive: true, createdAt: Date.now() },
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
