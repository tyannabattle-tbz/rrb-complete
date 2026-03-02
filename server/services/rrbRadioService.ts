/**
 * RRB Radio Service
 * Complete radio station management with Qumus orchestration
 * Handles channels, broadcasts, listeners, and 24/7 scheduling
 */

import { localLLMService } from './localLLMService';
import { localStorageService } from './localStorageService';

export interface RadioChannel {
  id: number;
  name: string;
  slug: string;
  frequency: number;
  streamUrl: string;
  bitrate: number;
  currentListeners: number;
  status: 'active' | 'maintenance' | 'offline';
}

export interface RadioShow {
  id: number;
  channelId: number;
  title: string;
  host: string;
  duration: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  startTime: string;
  genre: string;
}

export interface BroadcastEpisode {
  id: number;
  showId: number;
  channelId: number;
  title: string;
  audioUrl: string;
  duration: number;
  playCount: number;
  broadcastDate: string;
  isLive: boolean;
}

export interface RadioListener {
  id: number;
  userId?: number;
  username: string;
  email: string;
  favoriteChannelId?: number;
  totalListeningHours: number;
  isSubscribed: boolean;
}

export interface BroadcastScheduleItem {
  id: number;
  channelId: number;
  episodeId: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: 'scheduled' | 'broadcasting' | 'completed' | 'failed';
  priority: number;
  qumusDecisionId?: string;
}

class RRBRadioService {
  private channels: Map<number, RadioChannel> = new Map();
  private shows: Map<number, RadioShow> = new Map();
  private episodes: Map<number, BroadcastEpisode> = new Map();
  private listeners: Map<number, RadioListener> = new Map();
  private scheduleQueue: BroadcastScheduleItem[] = [];
  private activeStreams: Map<number, { startTime: Date; listenerCount: number }> = new Map();

  constructor() {
    this.initializeDefaultChannels();
  }

  /**
   * Initialize default RRB channels
   */
  private initializeDefaultChannels(): void {
    // Main RRB Station
    this.channels.set(1, {
      id: 1,
      name: 'Rockin\' Rockin\' Boogie Main',
      slug: 'rrb-main',
      frequency: 432, // Hz (healing frequency)
      streamUrl: 'http://localhost:8080/stream/rrb-main',
      bitrate: 128,
      currentListeners: 0,
      status: 'active',
    });

    // Healing Frequencies Channel
    this.channels.set(2, {
      id: 2,
      name: 'Healing Frequencies',
      slug: 'healing-frequencies',
      frequency: 528, // Love frequency
      streamUrl: 'http://localhost:8080/stream/healing',
      bitrate: 192,
      currentListeners: 0,
      status: 'active',
    });

    // Emergency Broadcast Channel
    this.channels.set(3, {
      id: 3,
      name: 'Emergency Broadcast',
      slug: 'emergency',
      frequency: 432,
      streamUrl: 'http://localhost:8080/stream/emergency',
      bitrate: 128,
      currentListeners: 0,
      status: 'active',
    });
  }

  /**
   * Create a new radio channel
   */
  async createChannel(
    name: string,
    slug: string,
    frequency: number,
    streamUrl: string
  ): Promise<RadioChannel> {
    const id = Math.max(...this.channels.keys(), 0) + 1;

    const channel: RadioChannel = {
      id,
      name,
      slug,
      frequency,
      streamUrl,
      bitrate: 128,
      currentListeners: 0,
      status: 'active',
    };

    this.channels.set(id, channel);
    return channel;
  }

  /**
   * Get channel by ID
   */
  async getChannel(channelId: number): Promise<RadioChannel | null> {
    return this.channels.get(channelId) || null;
  }

  /**
   * Get all channels
   */
  async getAllChannels(): Promise<RadioChannel[]> {
    return Array.from(this.channels.values());
  }

  /**
   * Create a radio show
   */
  async createShow(
    channelId: number,
    title: string,
    host: string,
    duration: number,
    frequency: 'daily' | 'weekly' | 'monthly',
    startTime: string,
    genre: string
  ): Promise<RadioShow> {
    const id = Math.max(...this.shows.keys(), 0) + 1;

    const show: RadioShow = {
      id,
      channelId,
      title,
      host,
      duration,
      frequency,
      startTime,
      genre,
    };

    this.shows.set(id, show);
    return show;
  }

  /**
   * Get shows for a channel
   */
  async getChannelShows(channelId: number): Promise<RadioShow[]> {
    return Array.from(this.shows.values()).filter((show) => show.channelId === channelId);
  }

  /**
   * Create a broadcast episode
   */
  async createEpisode(
    showId: number,
    channelId: number,
    title: string,
    audioUrl: string,
    duration: number,
    broadcastDate: string
  ): Promise<BroadcastEpisode> {
    const id = Math.max(...this.episodes.keys(), 0) + 1;

    const episode: BroadcastEpisode = {
      id,
      showId,
      channelId,
      title,
      audioUrl,
      duration,
      playCount: 0,
      broadcastDate,
      isLive: false,
    };

    this.episodes.set(id, episode);
    return episode;
  }

  /**
   * Get episodes for a show
   */
  async getShowEpisodes(showId: number): Promise<BroadcastEpisode[]> {
    return Array.from(this.episodes.values()).filter((ep) => ep.showId === showId);
  }

  /**
   * Register a listener
   */
  async registerListener(
    username: string,
    email: string,
    favoriteChannelId?: number
  ): Promise<RadioListener> {
    const id = Math.max(...this.listeners.keys(), 0) + 1;

    const listener: RadioListener = {
      id,
      username,
      email,
      favoriteChannelId,
      totalListeningHours: 0,
      isSubscribed: false,
    };

    this.listeners.set(id, listener);
    return listener;
  }

  /**
   * Get listener by ID
   */
  async getListener(listenerId: number): Promise<RadioListener | null> {
    return this.listeners.get(listenerId) || null;
  }

  /**
   * Record listener activity
   */
  async recordListeningSession(
    listenerId: number,
    episodeId: number,
    secondsListened: number
  ): Promise<void> {
    const listener = this.listeners.get(listenerId);
    if (listener) {
      listener.totalListeningHours += secondsListened / 3600;
    }

    const episode = this.episodes.get(episodeId);
    if (episode) {
      episode.playCount++;
    }
  }

  /**
   * Schedule broadcast episode using Qumus
   */
  async scheduleEpisode(
    channelId: number,
    episodeId: number,
    scheduledStartTime: string,
    priority: number = 5
  ): Promise<BroadcastScheduleItem> {
    const id = this.scheduleQueue.length + 1;

    // Use LLM to make scheduling decision
    const decision = await localLLMService.invoke({
      messages: [
        {
          role: 'system',
          content:
            'You are a radio scheduling AI. Determine if this episode should be scheduled.',
        },
        {
          role: 'user',
          content: `Schedule episode ${episodeId} on channel ${channelId} at ${scheduledStartTime} with priority ${priority}. Respond with: APPROVE or DENY`,
        },
      ],
    });

    const isApproved = decision.content.includes('APPROVE');

    const scheduleItem: BroadcastScheduleItem = {
      id,
      channelId,
      episodeId,
      scheduledStartTime,
      scheduledEndTime: new Date(
        new Date(scheduledStartTime).getTime() +
          (this.episodes.get(episodeId)?.duration || 3600) * 1000
      ).toISOString(),
      status: isApproved ? 'scheduled' : 'failed',
      priority,
      qumusDecisionId: decision.source === 'ollama' ? `qumus-${Date.now()}` : undefined,
    };

    this.scheduleQueue.push(scheduleItem);
    return scheduleItem;
  }

  /**
   * Get broadcast schedule
   */
  async getBroadcastSchedule(channelId?: number): Promise<BroadcastScheduleItem[]> {
    if (channelId) {
      return this.scheduleQueue.filter((item) => item.channelId === channelId);
    }
    return this.scheduleQueue;
  }

  /**
   * Start broadcasting an episode
   */
  async startBroadcast(scheduleId: number): Promise<boolean> {
    const schedule = this.scheduleQueue.find((item) => item.id === scheduleId);

    if (!schedule) {
      return false;
    }

    schedule.status = 'broadcasting';

    const channel = this.channels.get(schedule.channelId);
    if (channel) {
      this.activeStreams.set(schedule.channelId, {
        startTime: new Date(),
        listenerCount: 0,
      });
    }

    return true;
  }

  /**
   * End broadcast
   */
  async endBroadcast(scheduleId: number): Promise<boolean> {
    const schedule = this.scheduleQueue.find((item) => item.id === scheduleId);

    if (!schedule) {
      return false;
    }

    schedule.status = 'completed';
    this.activeStreams.delete(schedule.channelId);

    return true;
  }

  /**
   * Get active broadcasts
   */
  async getActiveBroadcasts(): Promise<BroadcastScheduleItem[]> {
    return this.scheduleQueue.filter((item) => item.status === 'broadcasting');
  }

  /**
   * Update listener count for a channel
   */
  async updateListenerCount(channelId: number, count: number): Promise<void> {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.currentListeners = count;
    }
  }

  /**
   * Get channel statistics
   */
  async getChannelStats(channelId: number): Promise<{
    channelId: number;
    name: string;
    currentListeners: number;
    totalEpisodes: number;
    totalPlayCount: number;
    averageListeningHours: number;
  }> {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    const episodes = Array.from(this.episodes.values()).filter(
      (ep) => ep.channelId === channelId
    );
    const totalPlayCount = episodes.reduce((sum, ep) => sum + ep.playCount, 0);
    const avgListeningHours =
      episodes.length > 0 ? totalPlayCount * (episodes[0].duration / 3600) / episodes.length : 0;

    return {
      channelId,
      name: channel.name,
      currentListeners: channel.currentListeners,
      totalEpisodes: episodes.length,
      totalPlayCount,
      averageListeningHours: avgListeningHours,
    };
  }

  /**
   * Generate 24/7 schedule using Qumus
   */
  async generateAutoSchedule(channelId: number, daysAhead: number = 7): Promise<number> {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }

    const shows = Array.from(this.shows.values()).filter((show) => show.channelId === channelId);

    if (shows.length === 0) {
      throw new Error('No shows configured for this channel');
    }

    // Use LLM to generate optimal schedule
    const schedulePrompt = `Generate a 24/7 broadcast schedule for "${channel.name}" for the next ${daysAhead} days.
    Available shows: ${shows.map((s) => `${s.title} (${s.duration}min, ${s.frequency})`).join(', ')}
    
    Provide a JSON array of scheduled times in HH:MM format, filling all 24 hours with content.`;

    const decision = await localLLMService.invoke({
      messages: [
        {
          role: 'system',
          content: 'You are a radio scheduling expert. Create optimal broadcast schedules.',
        },
        {
          role: 'user',
          content: schedulePrompt,
        },
      ],
    });

    // Parse and create schedule items
    let scheduledCount = 0;
    const now = new Date();

    for (let day = 0; day < daysAhead; day++) {
      for (const show of shows) {
        const scheduledDate = new Date(now);
        scheduledDate.setDate(scheduledDate.getDate() + day);
        const [hours, minutes] = show.startTime.split(':').map(Number);
        scheduledDate.setHours(hours, minutes, 0, 0);

        // Find or create episode for this show
        const episodes = Array.from(this.episodes.values()).filter(
          (ep) => ep.showId === show.id
        );
        if (episodes.length > 0) {
          const episode = episodes[Math.floor(Math.random() * episodes.length)];
          await this.scheduleEpisode(channelId, episode.id, scheduledDate.toISOString(), 5);
          scheduledCount++;
        }
      }
    }

    return scheduledCount;
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<{
    totalChannels: number;
    activeChannels: number;
    totalListeners: number;
    activeBroadcasts: number;
    scheduledEpisodes: number;
    uptime: string;
  }> {
    const activeChannels = Array.from(this.channels.values()).filter(
      (c) => c.status === 'active'
    ).length;
    const totalListeners = Array.from(this.listeners.values()).length;
    const activeBroadcasts = this.scheduleQueue.filter((s) => s.status === 'broadcasting').length;
    const scheduledEpisodes = this.scheduleQueue.filter((s) => s.status === 'scheduled').length;

    return {
      totalChannels: this.channels.size,
      activeChannels,
      totalListeners,
      activeBroadcasts,
      scheduledEpisodes,
      uptime: 'Running',
    };
  }
}

export const rrbRadioService = new RRBRadioService();
