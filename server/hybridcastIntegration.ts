import { AutomationEngine } from './automationEngine';
import { notifyOwner } from './notification';

/**
 * HybridCast Emergency Override Integration
 * Allows HybridCast emergency broadcasts to interrupt scheduled content
 */

export interface EmergencyBroadcast {
  id: string;
  title: string;
  content: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  duration: number; // seconds
  fileUrl?: string;
  startTime: number;
  endTime: number;
  affectedRegions?: string[];
  createdAt: number;
}

export class HybridCastIntegration {
  private static activeEmergencies: Map<string, EmergencyBroadcast> = new Map();
  private static emergencyQueue: EmergencyBroadcast[] = [];
  private static listeners: Set<(emergency: EmergencyBroadcast) => void> = new Set();

  /**
   * Register emergency broadcast from HybridCast
   */
  static async registerEmergencyBroadcast(emergency: EmergencyBroadcast) {
    console.log(`[HybridCastIntegration] Emergency broadcast registered: ${emergency.title}`);

    // Add to active emergencies
    this.activeEmergencies.set(emergency.id, emergency);
    this.emergencyQueue.push(emergency);

    // Sort by priority
    this.emergencyQueue.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Interrupt current content
    await this.interruptScheduledContent(emergency);

    // Notify listeners
    this.notifyListeners(emergency);

    // Send notification
    await notifyOwner({
      title: `Emergency Broadcast: ${emergency.title}`,
      content: `Priority: ${emergency.priority} | Duration: ${emergency.duration}s | Regions: ${emergency.affectedRegions?.join(', ') || 'All'}`,
    });
  }

  /**
   * Interrupt scheduled content
   */
  private static async interruptScheduledContent(emergency: EmergencyBroadcast) {
    const engine = AutomationEngine.getInstance();

    // Clear current queue
    engine.clearQueue();

    // Add emergency broadcast to front of queue
    engine.addToQueue({
      id: emergency.id,
      title: emergency.title,
      duration: emergency.duration,
      fileUrl: emergency.fileUrl || '',
      type: 'emergency',
      priority: emergency.priority,
      queuedAt: Date.now(),
    });

    console.log(`[HybridCastIntegration] Interrupted scheduled content for emergency: ${emergency.id}`);
  }

  /**
   * Resume scheduled content after emergency
   */
  static async resumeScheduledContent(emergencyId: string) {
    console.log(`[HybridCastIntegration] Resuming scheduled content after emergency: ${emergencyId}`);

    // Remove from active emergencies
    this.activeEmergencies.delete(emergencyId);

    // Remove from queue
    this.emergencyQueue = this.emergencyQueue.filter(e => e.id !== emergencyId);

    // Resume automation engine
    const engine = AutomationEngine.getInstance();
    engine.clearQueue();

    // Notify listeners
    this.notifyListeners(null);

    await notifyOwner({
      title: 'Emergency Broadcast Complete',
      content: `Emergency ${emergencyId} has ended. Resuming scheduled content.`,
    });
  }

  /**
   * Get active emergencies
   */
  static getActiveEmergencies(): EmergencyBroadcast[] {
    return Array.from(this.activeEmergencies.values());
  }

  /**
   * Get emergency queue
   */
  static getEmergencyQueue(): EmergencyBroadcast[] {
    return [...this.emergencyQueue];
  }

  /**
   * Check if emergency is active
   */
  static isEmergencyActive(): boolean {
    return this.activeEmergencies.size > 0;
  }

  /**
   * Get highest priority emergency
   */
  static getHighestPriorityEmergency(): EmergencyBroadcast | null {
    return this.emergencyQueue.length > 0 ? this.emergencyQueue[0] : null;
  }

  /**
   * Subscribe to emergency updates
   */
  static subscribe(callback: (emergency: EmergencyBroadcast | null) => void): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners
   */
  private static notifyListeners(emergency: EmergencyBroadcast | null) {
    this.listeners.forEach(callback => {
      try {
        callback(emergency);
      } catch (error) {
        console.error('[HybridCastIntegration] Error notifying listener:', error);
      }
    });
  }

  /**
   * Get emergency status
   */
  static getStatus() {
    return {
      activeEmergencies: this.activeEmergencies.size,
      queueLength: this.emergencyQueue.length,
      highestPriority: this.getHighestPriorityEmergency(),
      isActive: this.isEmergencyActive(),
    };
  }

  /**
   * Simulate emergency broadcast (for testing)
   */
  static async simulateEmergency(title: string, priority: 'critical' | 'high' | 'medium' | 'low' = 'high') {
    const emergency: EmergencyBroadcast = {
      id: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content: `This is a test ${priority} priority emergency broadcast.`,
      priority,
      duration: 60,
      startTime: Date.now(),
      endTime: Date.now() + 60000,
      createdAt: Date.now(),
    };

    await this.registerEmergencyBroadcast(emergency);
    return emergency;
  }

  /**
   * Clear all emergencies
   */
  static clearAllEmergencies() {
    console.log('[HybridCastIntegration] Clearing all emergencies');
    this.activeEmergencies.clear();
    this.emergencyQueue = [];
    this.notifyListeners(null);
  }

  /**
   * Get emergency statistics
   */
  static getStatistics() {
    const emergencies = Array.from(this.activeEmergencies.values());

    return {
      totalActive: emergencies.length,
      critical: emergencies.filter(e => e.priority === 'critical').length,
      high: emergencies.filter(e => e.priority === 'high').length,
      medium: emergencies.filter(e => e.priority === 'medium').length,
      low: emergencies.filter(e => e.priority === 'low').length,
      totalDuration: emergencies.reduce((sum, e) => sum + e.duration, 0),
      affectedRegions: Array.from(
        new Set(emergencies.flatMap(e => e.affectedRegions || []))
      ),
    };
  }
}

/**
 * Initialize HybridCast integration
 */
export async function initializeHybridCastIntegration() {
  console.log('[HybridCastIntegration] Initialized');

  // Subscribe to emergency updates for logging
  HybridCastIntegration.subscribe((emergency) => {
    if (emergency) {
      console.log(`[HybridCastIntegration] Emergency active: ${emergency.title} (${emergency.priority})`);
    } else {
      console.log('[HybridCastIntegration] All emergencies cleared');
    }
  });

  return HybridCastIntegration;
}
