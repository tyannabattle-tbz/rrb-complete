import { RRBEcosystemIntegration } from './rrbEcosystemIntegration';
import { RRBQumusIntegration } from './rrbQumusIntegration';
import { ContentScheduler } from './contentScheduler';
import { AutomationEngine } from './automationEngine';

/**
 * RRB Audio Scheduler
 * Manages real-time audio streaming and content scheduling for RRB Radio
 */

export interface RRBStreamingSession {
  id: string;
  startTime: number;
  endTime?: number;
  content: {
    type: 'radio' | 'podcast' | 'video' | 'commercial' | 'emergency';
    title: string;
    duration: number;
    url: string;
    metadata?: Record<string, any>;
  };
  status: 'queued' | 'playing' | 'paused' | 'completed' | 'failed';
  listeners: number;
  quality: string;
}

export interface RRBStreamingMetrics {
  totalSessions: number;
  activeSessions: number;
  totalListeners: number;
  averageSessionDuration: number;
  uptime: number;
  qualityScore: number;
}

export class RRBStreamingScheduler {
  private static sessions: Map<string, RRBStreamingSession> = new Map();
  private static queue: RRBStreamingSession[] = [];
  private static currentSession: RRBStreamingSession | null = null;
  private static metrics: RRBStreamingMetrics = {
    totalSessions: 0,
    activeSessions: 0,
    totalListeners: 0,
    averageSessionDuration: 0,
    uptime: 0,
    qualityScore: 100,
  };
  private static updateInterval: NodeJS.Timeout | null = null;
  private static listeners: Set<(session: RRBStreamingSession) => void> = new Set();

  /**
   * Initialize streaming scheduler
   */
  static async initialize() {
    console.log('[RRBStreamingScheduler] Initializing audio streaming scheduler...');

    // Start update interval
    this.startUpdateInterval();

    // Connect to content scheduler
    this.connectToContentScheduler();

    console.log('[RRBStreamingScheduler] Audio streaming scheduler initialized');
  }

  /**
   * Connect to content scheduler
   */
  private static connectToContentScheduler() {
    const scheduler = ContentScheduler.getInstance();

    // Subscribe to queue changes
    scheduler.onQueueChange(() => {
      this.updateStreamingQueue();
    });

    console.log('[RRBStreamingScheduler] Connected to content scheduler');
  }

  /**
   * Update streaming queue
   */
  private static async updateStreamingQueue() {
    const scheduler = ContentScheduler.getInstance();
    const nextContent = scheduler.getNextContent();

    if (nextContent) {
      const session: RRBStreamingSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startTime: Date.now(),
        content: {
          type: nextContent.type as any,
          title: nextContent.title,
          duration: nextContent.duration,
          url: nextContent.url,
          metadata: nextContent.metadata,
        },
        status: 'queued',
        listeners: 0,
        quality: 'excellent',
      };

      this.queue.push(session);
      this.notifyListeners(session);

      console.log(`[RRBStreamingScheduler] Queued: ${nextContent.title}`);
    }
  }

  /**
   * Start next session
   */
  static async startNextSession() {
    if (this.queue.length === 0) {
      console.log('[RRBStreamingScheduler] No content in queue');
      return;
    }

    // End current session
    if (this.currentSession) {
      this.currentSession.status = 'completed';
      this.currentSession.endTime = Date.now();
      this.sessions.set(this.currentSession.id, this.currentSession);
      this.updateMetrics();
    }

    // Start next session
    const nextSession = this.queue.shift()!;
    nextSession.status = 'playing';
    nextSession.startTime = Date.now();

    this.currentSession = nextSession;
    this.sessions.set(nextSession.id, nextSession);
    this.metrics.activeSessions = 1;

    this.notifyListeners(nextSession);

    console.log(`[RRBStreamingScheduler] Now playing: ${nextSession.content.title}`);

    // Schedule next session
    setTimeout(() => {
      this.startNextSession();
    }, nextSession.content.duration * 1000);
  }

  /**
   * Pause current session
   */
  static pauseSession() {
    if (this.currentSession) {
      this.currentSession.status = 'paused';
      console.log(`[RRBStreamingScheduler] Paused: ${this.currentSession.content.title}`);
    }
  }

  /**
   * Resume current session
   */
  static resumeSession() {
    if (this.currentSession) {
      this.currentSession.status = 'playing';
      console.log(`[RRBStreamingScheduler] Resumed: ${this.currentSession.content.title}`);
    }
  }

  /**
   * Skip to next session
   */
  static skipToNext() {
    if (this.currentSession) {
      this.currentSession.status = 'completed';
      this.currentSession.endTime = Date.now();
    }
    this.startNextSession();
  }

  /**
   * Insert emergency content
   */
  static async insertEmergency(emergencyContent: RRBStreamingSession) {
    // Pause current session
    if (this.currentSession) {
      this.currentSession.status = 'paused';
    }

    // Insert emergency at front of queue
    emergencyContent.status = 'queued';
    this.queue.unshift(emergencyContent);

    // Start emergency immediately
    this.startNextSession();

    console.log('[RRBStreamingScheduler] Emergency content inserted');
  }

  /**
   * Get current session
   */
  static getCurrentSession(): RRBStreamingSession | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  /**
   * Get queue
   */
  static getQueue(): RRBStreamingSession[] {
    return this.queue.map(s => ({ ...s }));
  }

  /**
   * Set listener count
   */
  static setListenerCount(count: number) {
    if (this.currentSession) {
      this.currentSession.listeners = count;
    }
    this.metrics.totalListeners = count;
  }

  /**
   * Update metrics
   */
  private static updateMetrics() {
    const sessions = Array.from(this.sessions.values());

    this.metrics.totalSessions = sessions.length;
    this.metrics.activeSessions = sessions.filter(s => s.status === 'playing').length;

    const completedSessions = sessions.filter(s => s.status === 'completed');
    if (completedSessions.length > 0) {
      const totalDuration = completedSessions.reduce((sum, s) => {
        const duration = (s.endTime || Date.now()) - s.startTime;
        return sum + duration;
      }, 0);
      this.metrics.averageSessionDuration = totalDuration / completedSessions.length;
    }

    // Calculate quality score based on uptime and listener satisfaction
    const uptime = (this.metrics.totalSessions - sessions.filter(s => s.status === 'failed').length) / this.metrics.totalSessions || 1;
    this.metrics.qualityScore = Math.round(uptime * 100);
  }

  /**
   * Start update interval
   */
  private static startUpdateInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateMetrics();
    }, 10000); // Update every 10 seconds

    console.log('[RRBStreamingScheduler] Update interval started');
  }

  /**
   * Get metrics
   */
  static getMetrics(): RRBStreamingMetrics {
    return { ...this.metrics };
  }

  /**
   * Subscribe to session changes
   */
  static subscribe(callback: (session: RRBStreamingSession) => void): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify listeners
   */
  private static notifyListeners(session: RRBStreamingSession) {
    this.listeners.forEach(callback => {
      try {
        callback(session);
      } catch (error) {
        console.error('[RRBStreamingScheduler] Error notifying listener:', error);
      }
    });
  }

  /**
   * Get status
   */
  static getStatus() {
    return {
      currentSession: this.currentSession,
      queueLength: this.queue.length,
      totalSessions: this.metrics.totalSessions,
      metrics: this.metrics,
    };
  }

  /**
   * Shutdown scheduler
   */
  static shutdown() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.sessions.clear();
    this.queue = [];
    this.currentSession = null;
    this.listeners.clear();

    console.log('[RRBStreamingScheduler] Audio streaming scheduler shutdown');
  }
}

/**
 * Initialize RRB audio streaming scheduler
 */
export async function initializeRRBStreamingScheduler() {
  await RRBStreamingScheduler.initialize();
  return RRBStreamingScheduler;
}
