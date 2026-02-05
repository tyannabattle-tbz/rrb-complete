import { getRedis } from './redis';

/**
 * Cross-Platform Communication Bridge
 * Enables real-time communication between RockinBoogie and HybridCast systems
 */

interface PlatformMessage {
  source: 'rockinboogie' | 'hybridcast' | 'qumus';
  type: 'policy-decision' | 'broadcast-alert' | 'playback-event' | 'emergency-alert';
  timestamp: number;
  data: Record<string, any>;
  decisionId?: string;
}

interface PlatformState {
  rockinboogie: {
    isPlaying: boolean;
    currentChannel: string;
    listeners: number;
  };
  hybridcast: {
    isActive: boolean;
    broadcastNodes: number;
    coverage: number;
  };
}

let platformState: PlatformState = {
  rockinboogie: { isPlaying: false, currentChannel: '', listeners: 0 },
  hybridcast: { isActive: false, broadcastNodes: 0, coverage: 0 },
};

/**
 * Publish message to cross-platform channel
 */
export async function publishCrossPlatformMessage(message: PlatformMessage): Promise<void> {
  try {
    const redis = getRedis();
    await redis.publish('cross-platform-bridge', JSON.stringify(message));
    console.log(`[CrossPlatformBridge] Published ${message.type} from ${message.source}`);
  } catch (error) {
    console.error('[CrossPlatformBridge] Failed to publish message:', error);
  }
}

/**
 * Subscribe to cross-platform messages
 */
export async function subscribeToCrossPlatformMessages(
  callback: (message: PlatformMessage) => void
): Promise<void> {
  try {
    const redis = getRedis();
    const subscriber = redis.duplicate();
    
    subscriber.on('message', (channel: string, message: string) => {
      if (channel === 'cross-platform-bridge') {
        try {
          const parsedMessage = JSON.parse(message) as PlatformMessage;
          callback(parsedMessage);
        } catch (error) {
          console.error('[CrossPlatformBridge] Failed to parse message:', error);
        }
      }
    });

    await subscriber.subscribe('cross-platform-bridge');
    console.log('[CrossPlatformBridge] Subscribed to cross-platform messages');
  } catch (error) {
    console.error('[CrossPlatformBridge] Failed to subscribe:', error);
  }
}

/**
 * Update platform state
 */
export async function updatePlatformState(
  platform: 'rockinboogie' | 'hybridcast',
  updates: Record<string, any>
): Promise<void> {
  try {
    const redis = getRedis();
    
    if (platform === 'rockinboogie') {
      platformState.rockinboogie = { ...platformState.rockinboogie, ...updates };
    } else if (platform === 'hybridcast') {
      platformState.hybridcast = { ...platformState.hybridcast, ...updates };
    }

    await redis.set(`platform-state:${platform}`, JSON.stringify(platformState[platform]));
    console.log(`[CrossPlatformBridge] Updated ${platform} state:`, updates);
  } catch (error) {
    console.error('[CrossPlatformBridge] Failed to update platform state:', error);
  }
}

/**
 * Get platform state
 */
export async function getPlatformState(
  platform?: 'rockinboogie' | 'hybridcast'
): Promise<PlatformState | Record<string, any>> {
  try {
    const redis = getRedis();
    
    if (platform) {
      const state = await redis.get(`platform-state:${platform}`);
      return state ? JSON.parse(state) : platformState[platform];
    }

    return platformState;
  } catch (error) {
    console.error('[CrossPlatformBridge] Failed to get platform state:', error);
    return platformState;
  }
}

/**
 * Handle emergency broadcast from HybridCast to RockinBoogie
 */
export async function broadcastEmergencyAlert(alert: {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  regions: string[];
}): Promise<void> {
  const message: PlatformMessage = {
    source: 'hybridcast',
    type: 'emergency-alert',
    timestamp: Date.now(),
    data: alert,
  };

  await publishCrossPlatformMessage(message);
  console.log('[CrossPlatformBridge] Emergency alert broadcasted');
}

/**
 * Handle playback event from RockinBoogie to HybridCast
 */
export async function publishPlaybackEvent(event: {
  action: 'play' | 'pause' | 'stop' | 'channel-switch';
  channelId: string;
  listeners: number;
  decisionId: string;
}): Promise<void> {
  const message: PlatformMessage = {
    source: 'rockinboogie',
    type: 'playback-event',
    timestamp: Date.now(),
    data: event,
    decisionId: event.decisionId,
  };

  await publishCrossPlatformMessage(message);
  console.log('[CrossPlatformBridge] Playback event published');
}

/**
 * Initialize cross-platform bridge
 */
export async function initializeCrossPlatformBridge(): Promise<void> {
  try {
    console.log('[CrossPlatformBridge] Initializing cross-platform communication bridge...');
    
    // Subscribe to messages
    await subscribeToCrossPlatformMessages((message) => {
      console.log('[CrossPlatformBridge] Received message:', {
        source: message.source,
        type: message.type,
        timestamp: new Date(message.timestamp).toISOString(),
      });

      // Handle different message types
      if (message.type === 'emergency-alert' && message.source === 'hybridcast') {
        console.log('[CrossPlatformBridge] Emergency alert from HybridCast:', message.data);
      } else if (message.type === 'playback-event' && message.source === 'rockinboogie') {
        console.log('[CrossPlatformBridge] Playback event from RockinBoogie:', message.data);
      }
    });

    console.log('[CrossPlatformBridge] Cross-platform bridge initialized successfully');
  } catch (error) {
    console.error('[CrossPlatformBridge] Failed to initialize bridge:', error);
  }
}
