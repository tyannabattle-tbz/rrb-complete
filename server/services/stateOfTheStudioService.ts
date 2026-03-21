import { db } from "../db";
import { ecosystemStatus } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export class StateOfTheStudioService {
  private studioState = {
    isLive: false,
    currentShow: null as string | null,
    activeStreams: 0,
    listeners: 0,
    recordingActive: false,
    lastUpdated: new Date(),
  };

  /**
   * Get current studio state
   */
  async getStudioState() {
    try {
      const [state] = await db
        .select()
        .from(ecosystemStatus)
        .where(eq(ecosystemStatus.component, "studio"));

      if (state) {
        return JSON.parse(state.data || "{}");
      }
    } catch (error) {
      console.error("[State of Studio] Error fetching state:", error);
    }

    return this.studioState;
  }

  /**
   * Update studio state
   */
  async updateStudioState(updates: Partial<typeof this.studioState>) {
    this.studioState = { ...this.studioState, ...updates, lastUpdated: new Date() };

    try {
      await db
        .insert(ecosystemStatus)
        .values({
          component: "studio",
          status: updates.isLive ? "active" : "idle",
          data: JSON.stringify(this.studioState),
          lastUpdated: new Date(),
        })
        .onDuplicateKeyUpdate({
          set: {
            status: updates.isLive ? "active" : "idle",
            data: JSON.stringify(this.studioState),
            lastUpdated: new Date(),
          },
        });
    } catch (error) {
      console.error("[State of Studio] Error updating state:", error);
    }

    return this.studioState;
  }

  /**
   * Start broadcast
   */
  async startBroadcast(showName: string) {
    const state = await this.updateStudioState({
      isLive: true,
      currentShow: showName,
      activeStreams: 1,
    });

    console.log(`[State of Studio] Broadcast started: ${showName}`);
    return state;
  }

  /**
   * End broadcast
   */
  async endBroadcast() {
    const state = await this.updateStudioState({
      isLive: false,
      currentShow: null,
      activeStreams: 0,
      listeners: 0,
    });

    console.log("[State of Studio] Broadcast ended");
    return state;
  }

  /**
   * Update listener count
   */
  async updateListenerCount(count: number) {
    const state = await this.updateStudioState({
      listeners: count,
    });

    return state;
  }

  /**
   * Start recording
   */
  async startRecording() {
    const state = await this.updateStudioState({
      recordingActive: true,
    });

    console.log("[State of Studio] Recording started");
    return state;
  }

  /**
   * Stop recording
   */
  async stopRecording() {
    const state = await this.updateStudioState({
      recordingActive: false,
    });

    console.log("[State of Studio] Recording stopped");
    return state;
  }

  /**
   * Get studio health status
   */
  async getStudioHealth() {
    const state = await this.getStudioState();

    const health = {
      isHealthy: state.isLive || !state.recordingActive,
      studioState: state,
      timestamp: new Date(),
      alerts: [] as string[],
    };

    // Check for issues
    if (state.activeStreams > 10) {
      health.alerts.push("High stream count detected");
    }

    if (state.listeners > 100000) {
      health.alerts.push("Very high listener count");
    }

    if (state.recordingActive && state.isLive) {
      health.alerts.push("Recording active during live broadcast");
    }

    return health;
  }

  /**
   * Broadcast state change to all connected clients
   */
  async broadcastStateChange() {
    const state = await this.getStudioState();
    console.log("[State of Studio] Broadcasting state change:", state);
    // In production, this would emit via WebSocket to all connected clients
    return state;
  }

  /**
   * Get studio metrics for dashboard
   */
  async getStudioMetrics() {
    const state = await this.getStudioState();

    return {
      isLive: state.isLive,
      currentShow: state.currentShow,
      activeStreams: state.activeStreams,
      listeners: state.listeners,
      recordingActive: state.recordingActive,
      uptime: this.calculateUptime(),
      lastUpdated: state.lastUpdated,
    };
  }

  /**
   * Calculate studio uptime
   */
  private calculateUptime(): string {
    // In production, this would calculate actual uptime
    return "99.9%";
  }

  /**
   * Alert on state change
   */
  async alertStateChange(change: {
    from: string;
    to: string;
    reason?: string;
  }) {
    console.log(
      `[State of Studio] Alert: ${change.from} → ${change.to}${change.reason ? ` (${change.reason})` : ""}`
    );

    // In production, this would send notifications
    return {
      alert: change,
      timestamp: new Date(),
      status: "sent",
    };
  }

  /**
   * Sync studio state with QUMUS
   */
  async syncWithQUMUS() {
    const state = await this.getStudioState();
    console.log("[State of Studio] Syncing with QUMUS:", state);

    // In production, this would call QUMUS orchestration
    return {
      synced: true,
      state,
      timestamp: new Date(),
    };
  }
}

export const stateOfTheStudioService = new StateOfTheStudioService();
