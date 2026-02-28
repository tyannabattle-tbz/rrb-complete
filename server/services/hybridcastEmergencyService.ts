/**
 * HybridCast Emergency Broadcast Service
 * Offline-first emergency communication
 */

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: number[];
  createdAt: string;
  expiresAt: string;
}

class HybridcastEmergencyService {
  private alerts: Map<string, EmergencyAlert> = new Map();

  async createAlert(
    title: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    channels: number[]
  ): Promise<EmergencyAlert> {
    const id = `alert-${Date.now()}`;
    const alert: EmergencyAlert = {
      id,
      title,
      message,
      severity,
      channels,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    this.alerts.set(id, alert);
    return alert;
  }

  async getActiveAlerts(): Promise<EmergencyAlert[]> {
    const now = new Date();
    return Array.from(this.alerts.values()).filter(
      (alert) => new Date(alert.expiresAt) > now
    );
  }

  async broadcastAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    console.log(`[Emergency] Broadcasting: ${alert.title}`);
    return true;
  }
}

export const hybridcastEmergencyService = new HybridcastEmergencyService();
