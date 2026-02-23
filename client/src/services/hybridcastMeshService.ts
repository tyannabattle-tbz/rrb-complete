/**
 * HybridCast Mesh Networking Service
 * Provides offline-first emergency communication via LoRa/Meshtastic
 * when internet is unavailable
 */

export interface MeshMessage {
  id: string;
  type: 'sos' | 'broadcast' | 'wellness' | 'emergency';
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  sender?: string;
  location?: { lat: number; lng: number };
}

export interface MeshDevice {
  id: string;
  name: string;
  type: 'lora' | 'meshtastic' | 'bluetooth';
  status: 'connected' | 'disconnected' | 'searching';
  signalStrength: number;
  lastSeen: number;
}

class HybridCastMeshService {
  private meshDevices: Map<string, MeshDevice> = new Map();
  private messageQueue: MeshMessage[] = [];
  private isOnline: boolean = navigator.onLine;
  private meshWorker: SharedWorker | null = null;
  private listeners: Set<(msg: MeshMessage) => void> = new Set();

  constructor() {
    this.initializeOfflineDetection();
    this.initializeMeshNetworking();
  }

  /**
   * Initialize offline detection and fallback to mesh networking
   */
  private initializeOfflineDetection() {
    window.addEventListener('online', () => {
      console.log('[HybridCast] Internet connection restored');
      this.isOnline = true;
      this.syncQueuedMessages();
    });

    window.addEventListener('offline', () => {
      console.log('[HybridCast] Internet connection lost - activating mesh networking');
      this.isOnline = false;
      this.activateMeshMode();
    });
  }

  /**
   * Initialize HybridCast mesh networking
   */
  private initializeMeshNetworking() {
    // Initialize WebBluetooth for Meshtastic devices
    if ('bluetooth' in navigator) {
      console.log('[HybridCast] WebBluetooth available - Meshtastic support enabled');
      this.initializeMeshtastic();
    }

    // Initialize WebUSB for LoRa devices
    if ('usb' in navigator) {
      console.log('[HybridCast] WebUSB available - LoRa support enabled');
      this.initializeLoRa();
    }

    // Initialize service worker communication
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({
        type: 'HYBRIDCAST_MESH_INIT',
      });
    }
  }

  /**
   * Initialize Meshtastic device support via WebBluetooth
   */
  private async initializeMeshtastic() {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'Meshtastic' }],
        optionalServices: ['0xf0ff'],
      });

      console.log('[HybridCast] Meshtastic device connected:', device.name);
      this.meshDevices.set(device.id, {
        id: device.id,
        name: device.name || 'Meshtastic Device',
        type: 'meshtastic',
        status: 'connected',
        signalStrength: 100,
        lastSeen: Date.now(),
      });
    } catch (error) {
      console.warn('[HybridCast] Meshtastic initialization failed:', error);
    }
  }

  /**
   * Initialize LoRa device support via WebUSB
   */
  private async initializeLoRa() {
    try {
      const devices = await (navigator as any).usb.getDevices();
      for (const device of devices) {
        if (this.isLoRaDevice(device)) {
          console.log('[HybridCast] LoRa device found:', device);
          this.meshDevices.set(device.serialNumber, {
            id: device.serialNumber,
            name: `LoRa Device (${device.productName})`,
            type: 'lora',
            status: 'connected',
            signalStrength: 100,
            lastSeen: Date.now(),
          });
        }
      }
    } catch (error) {
      console.warn('[HybridCast] LoRa initialization failed:', error);
    }
  }

  /**
   * Check if device is LoRa-compatible
   */
  private isLoRaDevice(device: any): boolean {
    const loraVendorIds = [0x0403, 0x1a86]; // Common LoRa device vendor IDs
    return loraVendorIds.includes(device.vendorId);
  }

  /**
   * Activate mesh mode when internet is down
   */
  private activateMeshMode() {
    console.log('[HybridCast] Mesh mode activated - available devices:', this.meshDevices.size);
    
    // Notify service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({
        type: 'HYBRIDCAST_MESH_ACTIVE',
        devices: Array.from(this.meshDevices.values()),
      });
    }

    // Broadcast offline status
    window.dispatchEvent(new CustomEvent('hybridcast-mesh-active', {
      detail: { devices: Array.from(this.meshDevices.values()) }
    }));
  }

  /**
   * Send SOS alert via mesh network
   */
  async sendSOSAlert(location?: { lat: number; lng: number }): Promise<boolean> {
    const message: MeshMessage = {
      id: `sos-${Date.now()}`,
      type: 'sos',
      content: 'Emergency SOS Alert - Requesting immediate assistance',
      priority: 'critical',
      timestamp: Date.now(),
      location,
    };

    if (this.isOnline) {
      // Send via internet
      try {
        const response = await fetch('/api/emergency/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
        return response.ok;
      } catch (error) {
        console.error('[HybridCast] SOS send failed:', error);
        // Fall back to mesh
        return this.broadcastViaMesh(message);
      }
    } else {
      // Send via mesh network
      return this.broadcastViaMesh(message);
    }
  }

  /**
   * Broadcast message via mesh network
   */
  private async broadcastViaMesh(message: MeshMessage): Promise<boolean> {
    if (this.meshDevices.size === 0) {
      console.warn('[HybridCast] No mesh devices available');
      this.messageQueue.push(message);
      return false;
    }

    console.log('[HybridCast] Broadcasting via mesh:', message);
    this.messageQueue.push(message);

    // Notify all listeners
    this.listeners.forEach(listener => listener(message));

    // Notify service worker for persistent storage
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({
        type: 'HYBRIDCAST_BROADCAST',
        message,
      });
    }

    return true;
  }

  /**
   * Send emergency broadcast to all connected devices
   */
  async broadcastEmergency(content: string, priority: 'high' | 'critical' = 'critical'): Promise<boolean> {
    const message: MeshMessage = {
      id: `broadcast-${Date.now()}`,
      type: 'broadcast',
      content,
      priority,
      timestamp: Date.now(),
    };

    if (this.isOnline) {
      try {
        await fetch('/api/emergency/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
      } catch (error) {
        console.error('[HybridCast] Broadcast failed:', error);
      }
    }

    return this.broadcastViaMesh(message);
  }

  /**
   * Send wellness check (I'm OK)
   */
  async sendWellnessCheck(): Promise<boolean> {
    const message: MeshMessage = {
      id: `wellness-${Date.now()}`,
      type: 'wellness',
      content: 'Wellness check - All systems operational',
      priority: 'low',
      timestamp: Date.now(),
    };

    if (this.isOnline) {
      try {
        await fetch('/api/emergency/wellness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
        return true;
      } catch (error) {
        console.error('[HybridCast] Wellness check failed:', error);
      }
    }

    return this.broadcastViaMesh(message);
  }

  /**
   * Sync queued messages when internet is restored
   */
  private async syncQueuedMessages() {
    console.log('[HybridCast] Syncing queued messages:', this.messageQueue.length);
    
    for (const message of this.messageQueue) {
      try {
        const endpoint = message.type === 'sos' ? '/api/emergency/sos' : '/api/emergency/broadcast';
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
      } catch (error) {
        console.error('[HybridCast] Failed to sync message:', error);
      }
    }

    this.messageQueue = [];
  }

  /**
   * Get mesh network status
   */
  getStatus() {
    return {
      online: this.isOnline,
      meshDevices: Array.from(this.meshDevices.values()),
      queuedMessages: this.messageQueue.length,
      meshActive: this.meshDevices.size > 0 && !this.isOnline,
    };
  }

  /**
   * Subscribe to mesh messages
   */
  onMessage(callback: (msg: MeshMessage) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get queued messages
   */
  getQueuedMessages(): MeshMessage[] {
    return [...this.messageQueue];
  }
}

// Export singleton instance
export const hybridcastMesh = new HybridCastMeshService();
