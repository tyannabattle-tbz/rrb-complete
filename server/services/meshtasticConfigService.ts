/**
 * Meshtastic Device Configuration Service
 * Handles WebBluetooth pairing, configuration, and mesh network management
 */

export interface MeshtasticDevice {
  id: string;
  name: string;
  address: string;
  isConnected: boolean;
  signalStrength: number;
  nodeId: number;
  hwModel: string;
  firmwareVersion: string;
}

export interface MeshNetwork {
  nodeId: number;
  region: string;
  channelIndex: number;
  hopLimit: number;
  wantAck: boolean;
}

export class MeshtasticConfigService {
  private devices: Map<string, MeshtasticDevice> = new Map();
  private meshNetwork: MeshNetwork = {
    nodeId: 0,
    region: 'US',
    channelIndex: 0,
    hopLimit: 3,
    wantAck: true,
  };

  /**
   * Scan for available Meshtastic devices via WebBluetooth
   */
  async scanDevices(): Promise<MeshtasticDevice[]> {
    try {
      if (!('bluetooth' in navigator)) {
        throw new Error('WebBluetooth not supported on this device');
      }

      // Simulate device scanning
      const mockDevices: MeshtasticDevice[] = [
        {
          id: 'mesh-001',
          name: 'Meshtastic-RRB-1',
          address: 'AA:BB:CC:DD:EE:01',
          isConnected: false,
          signalStrength: -85,
          nodeId: 1001,
          hwModel: 'TBEAM',
          firmwareVersion: '2.2.0',
        },
        {
          id: 'mesh-002',
          name: 'Meshtastic-RRB-2',
          address: 'AA:BB:CC:DD:EE:02',
          isConnected: false,
          signalStrength: -92,
          nodeId: 1002,
          hwModel: 'HELTEC',
          firmwareVersion: '2.2.0',
        },
      ];

      mockDevices.forEach(device => {
        this.devices.set(device.id, device);
      });

      return Array.from(this.devices.values());
    } catch (error) {
      console.error('Error scanning Meshtastic devices:', error);
      return [];
    }
  }

  /**
   * Connect to a specific Meshtastic device
   */
  async connectDevice(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    try {
      // Simulate WebBluetooth connection
      device.isConnected = true;
      device.signalStrength = -65; // Improve signal when connected
      this.devices.set(deviceId, device);
      return true;
    } catch (error) {
      console.error(`Error connecting to device ${deviceId}:`, error);
      return false;
    }
  }

  /**
   * Disconnect from a Meshtastic device
   */
  async disconnectDevice(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    device.isConnected = false;
    this.devices.set(deviceId, device);
    return true;
  }

  /**
   * Configure mesh network parameters
   */
  async configureMeshNetwork(config: Partial<MeshNetwork>): Promise<MeshNetwork> {
    this.meshNetwork = { ...this.meshNetwork, ...config };
    return this.meshNetwork;
  }

  /**
   * Get current mesh network configuration
   */
  getMeshNetwork(): MeshNetwork {
    return this.meshNetwork;
  }

  /**
   * Get all connected devices
   */
  getConnectedDevices(): MeshtasticDevice[] {
    return Array.from(this.devices.values()).filter(d => d.isConnected);
  }

  /**
   * Send message through mesh network
   */
  async sendMeshMessage(deviceId: string, message: string, toNode: number): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device || !device.isConnected) {
      throw new Error(`Device ${deviceId} not connected`);
    }

    try {
      // Simulate sending message through mesh
      console.log(`[Mesh] Sending message from ${device.nodeId} to ${toNode}: ${message}`);
      return true;
    } catch (error) {
      console.error('Error sending mesh message:', error);
      return false;
    }
  }

  /**
   * Receive messages from mesh network
   */
  async receiveMeshMessages(deviceId: string): Promise<Array<{ from: number; text: string; timestamp: number }>> {
    const device = this.devices.get(deviceId);
    if (!device || !device.isConnected) {
      throw new Error(`Device ${deviceId} not connected`);
    }

    // Simulate receiving messages
    return [
      { from: 1002, text: 'Emergency broadcast received', timestamp: Date.now() },
      { from: 1003, text: 'SOS alert from nearby node', timestamp: Date.now() - 5000 },
    ];
  }

  /**
   * Get device signal strength
   */
  getSignalStrength(deviceId: string): number {
    const device = this.devices.get(deviceId);
    return device?.signalStrength ?? -100;
  }

  /**
   * Get all paired devices
   */
  getAllDevices(): MeshtasticDevice[] {
    return Array.from(this.devices.values());
  }
}

export const meshtasticConfig = new MeshtasticConfigService();
