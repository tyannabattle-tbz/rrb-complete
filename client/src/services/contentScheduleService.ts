/**
 * Content Schedule Service
 * Manages 24/7 content scheduling with QUMUS orchestration
 */

export type ContentType = 'podcast' | 'music' | 'commercial' | 'live_show' | 'meditation';

export interface ScheduledContent {
  id: string;
  title: string;
  type: ContentType;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  duration: number; // milliseconds
  url: string;
  description: string;
  frequency?: number; // Solfeggio frequency in Hz
  isLive: boolean;
  priority: 'low' | 'normal' | 'high';
}

export interface TimeSlot {
  hour: number;
  minute: number;
  content: ScheduledContent[];
}

export interface DailySchedule {
  date: string; // YYYY-MM-DD
  timeSlots: TimeSlot[];
  totalDuration: number;
}

export interface SchedulePolicy {
  id: string;
  name: string;
  description: string;
  contentMix: {
    podcasts: number; // percentage
    music: number;
    commercials: number;
    liveShows: number;
    meditation: number;
  };
  autoRotate: boolean;
  rotationIntervalMinutes: number;
}

class ContentScheduleService {
  private schedule: Map<string, DailySchedule>;
  private currentContent: ScheduledContent | null = null;
  private policies: Map<string, SchedulePolicy>;
  private scheduleListeners: ((content: ScheduledContent | null) => void)[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.schedule = new Map();
    this.policies = new Map();
    this.initializeDefaultPolicy();
  }

  /**
   * Initialize default scheduling policy
   */
  private initializeDefaultPolicy(): void {
    const defaultPolicy: SchedulePolicy = {
      id: 'default-24h',
      name: 'Default 24/7 Schedule',
      description: 'Balanced content mix for 24-hour broadcasting',
      contentMix: {
        podcasts: 30,
        music: 40,
        commercials: 10,
        liveShows: 15,
        meditation: 5,
      },
      autoRotate: true,
      rotationIntervalMinutes: 60,
    };
    this.policies.set('default-24h', defaultPolicy);
  }

  /**
   * Add scheduled content
   */
  addContent(content: ScheduledContent): void {
    const dateStr = new Date(content.startTime).toISOString().split('T')[0];
    const schedule = this.schedule.get(dateStr) || this.createEmptySchedule(dateStr);

    const hour = new Date(content.startTime).getHours();
    const minute = new Date(content.startTime).getMinutes();

    let timeSlot = schedule.timeSlots.find(ts => ts.hour === hour && ts.minute === minute);
    if (!timeSlot) {
      timeSlot = { hour, minute, content: [] };
      schedule.timeSlots.push(timeSlot);
      schedule.timeSlots.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    }

    timeSlot.content.push(content);
    schedule.totalDuration += content.duration;
    this.schedule.set(dateStr, schedule);
  }

  /**
   * Remove scheduled content
   */
  removeContent(contentId: string): void {
    for (const [dateStr, schedule] of this.schedule) {
      for (const timeSlot of schedule.timeSlots) {
        const index = timeSlot.content.findIndex(c => c.id === contentId);
        if (index !== -1) {
          const removed = timeSlot.content.splice(index, 1)[0];
          schedule.totalDuration -= removed.duration;
          if (timeSlot.content.length === 0) {
            const slotIndex = schedule.timeSlots.indexOf(timeSlot);
            schedule.timeSlots.splice(slotIndex, 1);
          }
          return;
        }
      }
    }
  }

  /**
   * Get schedule for a specific date
   */
  getScheduleForDate(dateStr: string): DailySchedule {
    return this.schedule.get(dateStr) || this.createEmptySchedule(dateStr);
  }

  /**
   * Get current playing content
   */
  getCurrentContent(): ScheduledContent | null {
    return this.currentContent;
  }

  /**
   * Get next content in queue
   */
  getNextContent(): ScheduledContent | null {
    const now = Date.now();
    const dateStr = new Date(now).toISOString().split('T')[0];
    const schedule = this.getScheduleForDate(dateStr);

    for (const timeSlot of schedule.timeSlots) {
      for (const content of timeSlot.content) {
        if (content.startTime > now) {
          return content;
        }
      }
    }

    return null;
  }

  /**
   * Start schedule playback
   */
  startSchedule(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateCurrentContent();

    // Update every 10 seconds
    this.updateInterval = setInterval(() => {
      this.updateCurrentContent();
    }, 10000);
  }

  /**
   * Stop schedule playback
   */
  stopSchedule(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.currentContent = null;
    this.notifyListeners(null);
  }

  /**
   * Update current content based on time
   */
  private updateCurrentContent(): void {
    const now = Date.now();
    const dateStr = new Date(now).toISOString().split('T')[0];
    const schedule = this.getScheduleForDate(dateStr);

    for (const timeSlot of schedule.timeSlots) {
      for (const content of timeSlot.content) {
        if (content.startTime <= now && content.endTime > now) {
          if (!this.currentContent || this.currentContent.id !== content.id) {
            this.currentContent = content;
            this.notifyListeners(content);
          }
          return;
        }
      }
    }

    // No content found for current time
    if (this.currentContent) {
      this.currentContent = null;
      this.notifyListeners(null);
    }
  }

  /**
   * Create a scheduling policy
   */
  createPolicy(policy: SchedulePolicy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * Get a scheduling policy
   */
  getPolicy(policyId: string): SchedulePolicy | undefined {
    return this.policies.get(policyId);
  }

  /**
   * Generate schedule from policy
   */
  generateScheduleFromPolicy(policyId: string, dateStr: string): DailySchedule {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return this.createEmptySchedule(dateStr);
    }

    const schedule = this.createEmptySchedule(dateStr);
    const contentTypes: ContentType[] = ['podcast', 'music', 'commercial', 'live_show', 'meditation'];
    const mix = policy.contentMix;

    // Distribute content across 24 hours based on policy mix
    let currentTime = new Date(`${dateStr}T00:00:00Z`).getTime();
    const dayEnd = currentTime + 24 * 60 * 60 * 1000;

    while (currentTime < dayEnd) {
      for (const contentType of contentTypes) {
        const percentage = mix[contentType as keyof typeof mix];
        if (percentage > 0) {
          const content: ScheduledContent = {
            id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} - ${new Date(currentTime).toLocaleTimeString()}`,
            type: contentType,
            startTime: currentTime,
            endTime: currentTime + 60 * 60 * 1000, // 1 hour slots
            duration: 60 * 60 * 1000,
            url: '',
            description: `Auto-generated ${contentType} content`,
            frequency: 432, // Default to 432Hz
            isLive: contentType === 'live_show',
            priority: contentType === 'live_show' ? 'high' : 'normal',
          };
          this.addContent(content);
          currentTime += 60 * 60 * 1000;
          break;
        }
      }
    }

    return schedule;
  }

  /**
   * Get all schedules
   */
  getAllSchedules(): DailySchedule[] {
    return Array.from(this.schedule.values());
  }

  /**
   * Register listener for content changes
   */
  onContentChange(listener: (content: ScheduledContent | null) => void): () => void {
    this.scheduleListeners.push(listener);
    return () => {
      this.scheduleListeners = this.scheduleListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify listeners of content changes
   */
  private notifyListeners(content: ScheduledContent | null): void {
    this.scheduleListeners.forEach(listener => listener(content));
  }

  /**
   * Create empty schedule for a date
   */
  private createEmptySchedule(dateStr: string): DailySchedule {
    return {
      date: dateStr,
      timeSlots: [],
      totalDuration: 0,
    };
  }

  /**
   * Clear all schedules
   */
  clearAll(): void {
    this.schedule.clear();
    this.stopSchedule();
  }
}

// Export singleton instance
export const contentScheduleService = new ContentScheduleService();
