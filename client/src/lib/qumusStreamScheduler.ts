/**
 * QUMUS Autonomous Stream Scheduler
 * 
 * Manages 24/7 channel rotation across all Canryn Production subsidiaries.
 * QUMUS decides which channel plays based on time of day, day of week,
 * and audience engagement patterns. 90% autonomous, 10% human override.
 * 
 * Schedule Philosophy:
 * - Top of the Sol (6am-12pm): Upbeat, energizing (RRB Radio, Canryn Radio)
 * - Afternoon (12pm-5pm): Mixed/eclectic (HybridCast, Sweet Miracles)
 * - Evening (5pm-10pm): Smooth, relaxing (Sweet Miracles, Meditation)
 * - Night (10pm-6am): Ambient, healing (Meditation, Deep Space)
 * 
 * A Canryn Production — All Rights Reserved
 */
import type { AudioTrack } from '@/contexts/AudioContext';
import { CHANNEL_PRESETS, LIVE_STREAMS, getAllLiveStreams, type ChannelPreset } from './streamLibrary';

// ============================================================
// SCHEDULE CONFIGURATION
// ============================================================
export interface ScheduleBlock {
  id: string;
  label: string;
  startHour: number;  // 0-23
  endHour: number;    // 0-23
  channelIds: string[];
  description: string;
  priority: 'high' | 'normal' | 'low';
}

export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
  {
    id: 'top-of-the-sol',
    label: 'Top of the Sol',
    startHour: 6,
    endHour: 10,
    channelIds: ['ch-rrb-radio', 'ch-canryn-radio'],
    description: 'Upbeat soul, funk, and R&B to start the day — Seabrun Candy Hunter legacy',
    priority: 'high',
  },
  {
    id: 'late-sol',
    label: 'Late Sol Mix',
    startHour: 10,
    endHour: 12,
    channelIds: ['ch-canryn-radio', 'ch-hybridcast'],
    description: 'Eclectic mix transitioning from Top of the Sol energy to midday vibes',
    priority: 'normal',
  },
  {
    id: 'afternoon-blend',
    label: 'Afternoon Blend',
    startHour: 12,
    endHour: 15,
    channelIds: ['ch-hybridcast', 'ch-sweet-miracles'],
    description: 'Instrumental hip hop, indie, and lounge for the afternoon',
    priority: 'normal',
  },
  {
    id: 'drive-time',
    label: 'Drive Time',
    startHour: 15,
    endHour: 18,
    channelIds: ['ch-rrb-radio', 'ch-canryn-radio'],
    description: 'Peak listening — classic funk and eclectic favorites',
    priority: 'high',
  },
  {
    id: 'evening-lounge',
    label: 'Evening Lounge',
    startHour: 18,
    endHour: 21,
    channelIds: ['ch-sweet-miracles', 'ch-canryn-radio'],
    description: 'Smooth lounge, world music, and sophisticated evening vibes',
    priority: 'normal',
  },
  {
    id: 'night-healing',
    label: 'Night Healing',
    startHour: 21,
    endHour: 0,
    channelIds: ['ch-meditation', 'ch-sweet-miracles'],
    description: 'Ambient meditation and Drop Radio 432Hz streams for the night',
    priority: 'normal',
  },
  {
    id: 'deep-night',
    label: 'Deep Night Ambient',
    startHour: 0,
    endHour: 6,
    channelIds: ['ch-meditation'],
    description: 'Deep ambient drones and space music through the night',
    priority: 'low',
  },
];

// ============================================================
// SCHEDULER ENGINE
// ============================================================

/**
 * Get the current schedule block based on the current hour
 */
export function getCurrentScheduleBlock(schedule: ScheduleBlock[] = DEFAULT_SCHEDULE): ScheduleBlock {
  const hour = new Date().getHours();
  
  const block = schedule.find(b => {
    if (b.startHour < b.endHour) {
      return hour >= b.startHour && hour < b.endHour;
    }
    // Handle overnight blocks (e.g., 21-0)
    return hour >= b.startHour || hour < b.endHour;
  });
  
  return block || schedule[schedule.length - 1];
}

/**
 * Get the recommended channel for the current time
 */
export function getScheduledChannel(schedule: ScheduleBlock[] = DEFAULT_SCHEDULE): ChannelPreset | null {
  const block = getCurrentScheduleBlock(schedule);
  if (!block || block.channelIds.length === 0) return null;
  
  // Pick the primary channel (first in the list)
  const channelId = block.channelIds[0];
  return CHANNEL_PRESETS.find(c => c.id === channelId) || null;
}

/**
 * Get the recommended stream for the current time
 */
export function getScheduledStream(schedule: ScheduleBlock[] = DEFAULT_SCHEDULE): AudioTrack | null {
  const channel = getScheduledChannel(schedule);
  if (!channel || channel.streams.length === 0) return null;
  
  // Pick a stream — rotate based on the current minute to add variety
  const minute = new Date().getMinutes();
  const index = minute % channel.streams.length;
  return channel.streams[index];
}

/**
 * Get the next schedule block (what's coming up)
 */
export function getNextScheduleBlock(schedule: ScheduleBlock[] = DEFAULT_SCHEDULE): ScheduleBlock | null {
  const current = getCurrentScheduleBlock(schedule);
  const currentIndex = schedule.indexOf(current);
  const nextIndex = (currentIndex + 1) % schedule.length;
  return schedule[nextIndex];
}

/**
 * Get minutes remaining in the current block
 */
export function getMinutesRemaining(schedule: ScheduleBlock[] = DEFAULT_SCHEDULE): number {
  const block = getCurrentScheduleBlock(schedule);
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  let endHour = block.endHour;
  if (endHour === 0) endHour = 24;
  if (block.startHour > block.endHour && hour < block.endHour) {
    // We're in the early hours part of an overnight block
    endHour = block.endHour;
  }
  
  return Math.max(0, (endHour - hour) * 60 - minute);
}

/**
 * Get the full day schedule as a flat timeline
 */
export function getDaySchedule(schedule: ScheduleBlock[] = DEFAULT_SCHEDULE): Array<{
  block: ScheduleBlock;
  channel: ChannelPreset | null;
  isCurrent: boolean;
}> {
  const currentBlock = getCurrentScheduleBlock(schedule);
  
  return schedule.map(block => ({
    block,
    channel: CHANNEL_PRESETS.find(c => c.id === block.channelIds[0]) || null,
    isCurrent: block.id === currentBlock.id,
  }));
}

/**
 * Format hour for display (12-hour format)
 */
export function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

// ============================================================
// AUTO-PLAY MANAGER (client-side)
// ============================================================

/**
 * QumusAutoPlayer — manages automatic stream switching
 * Call start() to begin autonomous playback, stop() to hand back to manual control.
 */
export class QumusAutoPlayer {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private schedule: ScheduleBlock[];
  private currentBlockId: string | null = null;
  private onChannelSwitch: ((channel: ChannelPreset, block: ScheduleBlock) => void) | null = null;

  constructor(schedule: ScheduleBlock[] = DEFAULT_SCHEDULE) {
    this.schedule = schedule;
  }

  /**
   * Register a callback for when QUMUS autonomously switches channels
   */
  onSwitch(callback: (channel: ChannelPreset, block: ScheduleBlock) => void) {
    this.onChannelSwitch = callback;
    return this;
  }

  /**
   * Start autonomous scheduling — checks every 60 seconds for block changes
   */
  start(): { channel: ChannelPreset | null; block: ScheduleBlock } {
    const block = getCurrentScheduleBlock(this.schedule);
    const channel = getScheduledChannel(this.schedule);
    this.currentBlockId = block.id;

    // Check every 60 seconds if we need to switch
    this.intervalId = setInterval(() => {
      const newBlock = getCurrentScheduleBlock(this.schedule);
      if (newBlock.id !== this.currentBlockId) {
        this.currentBlockId = newBlock.id;
        const newChannel = getScheduledChannel(this.schedule);
        if (newChannel && this.onChannelSwitch) {
          this.onChannelSwitch(newChannel, newBlock);
        }
      }
    }, 60_000);

    return { channel, block };
  }

  /**
   * Stop autonomous scheduling
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentBlockId = null;
  }

  /**
   * Check if the auto-player is active
   */
  isActive(): boolean {
    return this.intervalId !== null;
  }

  /**
   * Update the schedule (e.g., from admin override)
   */
  updateSchedule(schedule: ScheduleBlock[]) {
    this.schedule = schedule;
  }
}
