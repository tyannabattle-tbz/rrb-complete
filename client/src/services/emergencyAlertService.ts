/**
 * Emergency Alert Service
 * Manages SOS and I'm OK features for community safety and wellness checks
 */

export type AlertStatus = 'idle' | 'pending' | 'sent' | 'acknowledged' | 'resolved';
export type AlertType = 'sos' | 'im_okay';

export interface EmergencyAlert {
  id: string;
  userId: string;
  userName: string;
  type: AlertType;
  status: AlertStatus;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  message?: string;
  responders: ResponderInfo[];
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface ResponderInfo {
  id: string;
  name: string;
  role: 'admin' | 'moderator' | 'responder';
  respondedAt: number;
  status: 'acknowledged' | 'responding' | 'resolved';
  notes?: string;
}

export interface AlertConfig {
  sosNotificationChannels: ('email' | 'sms' | 'push' | 'broadcast')[];
  imOkayAutoResolveMinutes: number;
  sosEscalationMinutes: number;
  enableLocationTracking: boolean;
  responderGroups: string[];
}

class EmergencyAlertService {
  private alerts: Map<string, EmergencyAlert>;
  private config: AlertConfig;
  private alertListeners: ((alert: EmergencyAlert) => void)[] = [];
  private escalationTimers: Map<string, NodeJS.Timeout>;

  constructor(config: Partial<AlertConfig> = {}) {
    this.alerts = new Map();
    this.escalationTimers = new Map();
    this.config = {
      sosNotificationChannels: config.sosNotificationChannels || ['push', 'broadcast', 'email'],
      imOkayAutoResolveMinutes: config.imOkayAutoResolveMinutes || 5,
      sosEscalationMinutes: config.sosEscalationMinutes || 15,
      enableLocationTracking: config.enableLocationTracking ?? true,
      responderGroups: config.responderGroups || ['admins', 'moderators', 'responders'],
    };
  }

  /**
   * Create and send SOS alert
   */
  async sendSOSAlert(userId: string, userName: string, message?: string): Promise<EmergencyAlert> {
    const alert: EmergencyAlert = {
      id: `sos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      type: 'sos',
      status: 'sent',
      timestamp: Date.now(),
      message,
      responders: [],
    };

    // Get location if enabled
    if (this.config.enableLocationTracking) {
      try {
        const location = await this.getLocation();
        alert.location = location;
      } catch (err) {
        console.warn('Location tracking failed:', err);
      }
    }

    this.alerts.set(alert.id, alert);

    // Notify responders
    await this.notifyResponders(alert);

    // Set escalation timer
    this.setEscalationTimer(alert.id);

    // Notify listeners
    this.notifyListeners(alert);

    return alert;
  }

  /**
   * Send I'm OK wellness check
   */
  async sendImOkayAlert(userId: string, userName: string): Promise<EmergencyAlert> {
    const alert: EmergencyAlert = {
      id: `imok-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      type: 'im_okay',
      status: 'sent',
      timestamp: Date.now(),
      responders: [],
    };

    this.alerts.set(alert.id, alert);

    // Auto-resolve I'm OK after configured time
    setTimeout(() => {
      this.resolveAlert(alert.id, 'system', 'Auto-resolved: Wellness check confirmed');
    }, this.config.imOkayAutoResolveMinutes * 60 * 1000);

    // Notify listeners
    this.notifyListeners(alert);

    return alert;
  }

  /**
   * Acknowledge alert as responder
   */
  acknowledgeAlert(alertId: string, responderId: string, responderName: string, role: 'admin' | 'moderator' | 'responder'): void {
    const alert = this.alerts.get(alertId);
    if (!alert) return;

    const responder: ResponderInfo = {
      id: responderId,
      name: responderName,
      role,
      respondedAt: Date.now(),
      status: 'acknowledged',
    };

    alert.responders.push(responder);
    alert.status = 'acknowledged';

    this.notifyListeners(alert);
  }

  /**
   * Update responder status
   */
  updateResponderStatus(alertId: string, responderId: string, status: 'acknowledged' | 'responding' | 'resolved', notes?: string): void {
    const alert = this.alerts.get(alertId);
    if (!alert) return;

    const responder = alert.responders.find(r => r.id === responderId);
    if (responder) {
      responder.status = status;
      if (notes) responder.notes = notes;
    }

    this.notifyListeners(alert);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string, resolvedBy: string, notes?: string): void {
    const alert = this.alerts.get(alertId);
    if (!alert) return;

    alert.status = 'resolved';
    alert.resolvedAt = Date.now();
    alert.resolvedBy = resolvedBy;

    // Clear escalation timer
    const timer = this.escalationTimers.get(alertId);
    if (timer) {
      clearTimeout(timer);
      this.escalationTimers.delete(alertId);
    }

    // Update last responder with resolution notes
    if (alert.responders.length > 0) {
      alert.responders[alert.responders.length - 1].notes = notes;
    }

    this.notifyListeners(alert);
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): EmergencyAlert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): EmergencyAlert[] {
    return Array.from(this.alerts.values()).filter(a => a.status !== 'resolved');
  }

  /**
   * Get SOS alerts only
   */
  getSOSAlerts(): EmergencyAlert[] {
    return Array.from(this.alerts.values()).filter(a => a.type === 'sos' && a.status !== 'resolved');
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 50): EmergencyAlert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get location using Geolocation API
   */
  private async getLocation(): Promise<{ latitude: number; longitude: number; address?: string }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Notify responders of alert
   */
  private async notifyResponders(alert: EmergencyAlert): Promise<void> {
    // Send notifications through configured channels
    for (const channel of this.config.sosNotificationChannels) {
      try {
        await this.sendNotification(channel, alert);
      } catch (err) {
        console.error(`Failed to notify via ${channel}:`, err);
      }
    }
  }

  /**
   * Send notification through specified channel
   */
  private async sendNotification(channel: 'email' | 'sms' | 'push' | 'broadcast', alert: EmergencyAlert): Promise<void> {
    const message = this.formatAlertMessage(alert);

    switch (channel) {
      case 'push':
        // Send push notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`RRB ${alert.type === 'sos' ? 'SOS' : 'I\'m OK'} Alert`, {
            body: message,
            tag: alert.id,
            requireInteraction: alert.type === 'sos',
          });
        }
        break;

      case 'broadcast':
        // Broadcast to all connected listeners
        console.log(`Broadcasting alert: ${message}`);
        break;

      case 'email':
        // Send email notification (would be handled by backend)
        console.log(`Email notification: ${message}`);
        break;

      case 'sms':
        // Send SMS notification (would be handled by backend)
        console.log(`SMS notification: ${message}`);
        break;
    }
  }

  /**
   * Set escalation timer for unacknowledged SOS
   */
  private setEscalationTimer(alertId: string): void {
    const timer = setTimeout(() => {
      const alert = this.alerts.get(alertId);
      if (alert && alert.status !== 'resolved' && alert.responders.length === 0) {
        // Escalate to higher priority
        console.warn(`SOS Alert ${alertId} escalated - no responders acknowledged`);
        this.notifyListeners(alert);
      }
    }, this.config.sosEscalationMinutes * 60 * 1000);

    this.escalationTimers.set(alertId, timer);
  }

  /**
   * Format alert message for notifications
   */
  private formatAlertMessage(alert: EmergencyAlert): string {
    const type = alert.type === 'sos' ? 'SOS ALERT' : 'I\'m OK Check-In';
    const location = alert.location ? ` at ${alert.location.address || `${alert.location.latitude}, ${alert.location.longitude}`}` : '';
    const message = alert.message ? ` - ${alert.message}` : '';
    return `${type} from ${alert.userName}${location}${message}`;
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Register listener for alert changes
   */
  onAlertChange(listener: (alert: EmergencyAlert) => void): () => void {
    this.alertListeners.push(listener);
    return () => {
      this.alertListeners = this.alertListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(alert: EmergencyAlert): void {
    this.alertListeners.forEach(listener => listener(alert));
  }

  /**
   * Clear all alerts (for testing/cleanup)
   */
  clearAll(): void {
    this.alerts.clear();
    this.escalationTimers.forEach(timer => clearTimeout(timer));
    this.escalationTimers.clear();
  }
}

// Export singleton instance
export const emergencyAlertService = new EmergencyAlertService({
  sosNotificationChannels: ['push', 'broadcast', 'email'],
  imOkayAutoResolveMinutes: 5,
  sosEscalationMinutes: 15,
  enableLocationTracking: true,
  responderGroups: ['admins', 'moderators', 'responders'],
});
