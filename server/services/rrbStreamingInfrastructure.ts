/**
 * RRB Custom Streaming Infrastructure Service
 * Manages custom RRB streaming domain and infrastructure
 */

export interface StreamingServer {
  id: string;
  domain: string;
  type: 'primary' | 'backup' | 'regional';
  region: string;
  status: 'active' | 'standby' | 'maintenance';
  capacity: number; // concurrent streams
  currentLoad: number;
  uptime: number; // percentage
  latency: number; // milliseconds
  bandwidth: number; // Mbps
}

export interface StreamingEndpoint {
  id: string;
  name: string;
  url: string;
  format: 'mp3' | 'aac' | 'hls' | 'dash';
  bitrate: number; // kbps
  server: string;
  status: 'active' | 'inactive';
  listeners: number;
}

export interface StreamingConfiguration {
  domain: string;
  primaryServer: StreamingServer;
  backupServers: StreamingServer[];
  endpoints: StreamingEndpoint[];
  failoverEnabled: boolean;
  loadBalancingStrategy: 'round-robin' | 'least-loaded' | 'geographic';
  cdnEnabled: boolean;
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
}

// RRB Custom Streaming Infrastructure Configuration
export const RRB_STREAMING_CONFIG: StreamingConfiguration = {
  domain: 'stream.rockinrockinboogie.com',
  primaryServer: {
    id: 'rrb-primary-us-east',
    domain: 'primary.stream.rockinrockinboogie.com',
    type: 'primary',
    region: 'us-east-1',
    status: 'active',
    capacity: 10000,
    currentLoad: 0,
    uptime: 99.99,
    latency: 45,
    bandwidth: 1000, // 1 Gbps
  },
  backupServers: [
    {
      id: 'rrb-backup-us-west',
      domain: 'backup1.stream.rockinrockinboogie.com',
      type: 'backup',
      region: 'us-west-2',
      status: 'standby',
      capacity: 5000,
      currentLoad: 0,
      uptime: 99.95,
      latency: 65,
      bandwidth: 500,
    },
    {
      id: 'rrb-regional-eu',
      domain: 'eu.stream.rockinrockinboogie.com',
      type: 'regional',
      region: 'eu-west-1',
      status: 'standby',
      capacity: 3000,
      currentLoad: 0,
      uptime: 99.90,
      latency: 120,
      bandwidth: 250,
    },
  ],
  endpoints: [
    {
      id: 'rrb-mp3-128',
      name: 'RRB Main Stream (MP3 128kbps)',
      url: 'https://stream.rockinrockinboogie.com/live/main-128.mp3',
      format: 'mp3',
      bitrate: 128,
      server: 'rrb-primary-us-east',
      status: 'active',
      listeners: 0,
    },
    {
      id: 'rrb-aac-256',
      name: 'RRB Premium Stream (AAC 256kbps)',
      url: 'https://stream.rockinrockinboogie.com/live/premium-256.aac',
      format: 'aac',
      bitrate: 256,
      server: 'rrb-primary-us-east',
      status: 'active',
      listeners: 0,
    },
    {
      id: 'rrb-hls-adaptive',
      name: 'RRB Adaptive Stream (HLS)',
      url: 'https://stream.rockinrockinboogie.com/live/adaptive.m3u8',
      format: 'hls',
      bitrate: 0, // adaptive
      server: 'rrb-primary-us-east',
      status: 'active',
      listeners: 0,
    },
    {
      id: 'rrb-dash-adaptive',
      name: 'RRB Adaptive Stream (DASH)',
      url: 'https://stream.rockinrockinboogie.com/live/adaptive.mpd',
      format: 'dash',
      bitrate: 0, // adaptive
      server: 'rrb-primary-us-east',
      status: 'active',
      listeners: 0,
    },
  ],
  failoverEnabled: true,
  loadBalancingStrategy: 'geographic',
  cdnEnabled: true,
  cacheStrategy: 'moderate',
};

/**
 * Get streaming configuration
 */
export function getStreamingConfiguration(): StreamingConfiguration {
  return RRB_STREAMING_CONFIG;
}

/**
 * Get all streaming endpoints
 */
export function getStreamingEndpoints(): StreamingEndpoint[] {
  return RRB_STREAMING_CONFIG.endpoints;
}

/**
 * Get endpoint by format
 */
export function getEndpointByFormat(format: 'mp3' | 'aac' | 'hls' | 'dash'): StreamingEndpoint | undefined {
  return RRB_STREAMING_CONFIG.endpoints.find(ep => ep.format === format);
}

/**
 * Get recommended endpoint based on client capabilities
 */
export function getRecommendedEndpoint(clientCapabilities: {
  supportHLS?: boolean;
  supportDASH?: boolean;
  preferredBitrate?: number;
  bandwidth?: number;
}): StreamingEndpoint {
  // Prefer adaptive streaming if supported
  if (clientCapabilities.supportHLS) {
    return RRB_STREAMING_CONFIG.endpoints.find(ep => ep.format === 'hls')!;
  }
  if (clientCapabilities.supportDASH) {
    return RRB_STREAMING_CONFIG.endpoints.find(ep => ep.format === 'dash')!;
  }

  // Fall back to progressive download
  if (clientCapabilities.bandwidth && clientCapabilities.bandwidth < 256) {
    return RRB_STREAMING_CONFIG.endpoints.find(ep => ep.format === 'mp3' && ep.bitrate === 128)!;
  }

  // Default to AAC 256kbps
  return RRB_STREAMING_CONFIG.endpoints.find(ep => ep.format === 'aac')!;
}

/**
 * Get server status
 */
export function getServerStatus(serverId: string): StreamingServer | undefined {
  if (RRB_STREAMING_CONFIG.primaryServer.id === serverId) {
    return RRB_STREAMING_CONFIG.primaryServer;
  }
  return RRB_STREAMING_CONFIG.backupServers.find(s => s.id === serverId);
}

/**
 * Get active servers
 */
export function getActiveServers(): StreamingServer[] {
  const servers = [RRB_STREAMING_CONFIG.primaryServer, ...RRB_STREAMING_CONFIG.backupServers];
  return servers.filter(s => s.status === 'active' || s.status === 'standby');
}

/**
 * Calculate server load percentage
 */
export function getServerLoadPercentage(serverId: string): number {
  const server = getServerStatus(serverId);
  if (!server) return 0;
  return (server.currentLoad / server.capacity) * 100;
}

/**
 * Get failover server
 */
export function getFailoverServer(): StreamingServer | undefined {
  if (!RRB_STREAMING_CONFIG.failoverEnabled) return undefined;

  // Return first available backup server
  return RRB_STREAMING_CONFIG.backupServers.find(s => s.status === 'active' || s.status === 'standby');
}

/**
 * Get infrastructure health
 */
export function getInfrastructureHealth(): {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  primaryServerStatus: 'healthy' | 'degraded' | 'offline';
  backupServersStatus: 'healthy' | 'degraded' | 'offline';
  averageLatency: number;
  totalCapacity: number;
  totalLoad: number;
  loadPercentage: number;
  failoverReady: boolean;
} {
  const allServers = [RRB_STREAMING_CONFIG.primaryServer, ...RRB_STREAMING_CONFIG.backupServers];
  
  const totalCapacity = allServers.reduce((sum, s) => sum + s.capacity, 0);
  const totalLoad = allServers.reduce((sum, s) => sum + s.currentLoad, 0);
  const averageLatency = allServers.reduce((sum, s) => sum + s.latency, 0) / allServers.length;
  const loadPercentage = (totalLoad / totalCapacity) * 100;

  const primaryStatus = RRB_STREAMING_CONFIG.primaryServer.uptime >= 99.5 ? 'healthy' : 'degraded';
  const backupStatus = RRB_STREAMING_CONFIG.backupServers.every(s => s.uptime >= 99)
    ? 'healthy'
    : 'degraded';

  let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (primaryStatus === 'degraded' || loadPercentage > 80) {
    overallStatus = 'degraded';
  }
  if (primaryStatus === 'offline' || loadPercentage > 95) {
    overallStatus = 'critical';
  }

  return {
    overallStatus,
    primaryServerStatus: primaryStatus,
    backupServersStatus: backupStatus,
    averageLatency,
    totalCapacity,
    totalLoad,
    loadPercentage,
    failoverReady: RRB_STREAMING_CONFIG.failoverEnabled && backupStatus === 'healthy',
  };
}

/**
 * Get CDN configuration
 */
export function getCDNConfiguration() {
  return {
    enabled: RRB_STREAMING_CONFIG.cdnEnabled,
    provider: 'CloudFlare',
    regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
    cacheStrategy: RRB_STREAMING_CONFIG.cacheStrategy,
    ttl: RRB_STREAMING_CONFIG.cacheStrategy === 'aggressive' ? 3600 : 1800,
  };
}

/**
 * Get load balancing configuration
 */
export function getLoadBalancingConfiguration() {
  return {
    strategy: RRB_STREAMING_CONFIG.loadBalancingStrategy,
    healthCheckInterval: 30, // seconds
    healthCheckTimeout: 5, // seconds
    failoverThreshold: 3, // consecutive failures
    sessionStickiness: true,
    sessionTimeout: 1800, // seconds
  };
}

/**
 * Get monitoring and alerting configuration
 */
export function getMonitoringConfiguration() {
  return {
    enabled: true,
    alertThresholds: {
      cpuUsage: 80,
      memoryUsage: 85,
      diskUsage: 90,
      networkLatency: 200, // milliseconds
      errorRate: 5, // percentage
      uptime: 99.5, // percentage
    },
    alertChannels: [
      'email',
      'slack',
      'sms',
      'dashboard',
    ],
    metricsCollectionInterval: 60, // seconds
    logRetention: 30, // days
  };
}

/**
 * Get disaster recovery configuration
 */
export function getDisasterRecoveryConfiguration() {
  return {
    enabled: true,
    rtoMinutes: 15, // Recovery Time Objective
    rpoMinutes: 5, // Recovery Point Objective
    backupFrequency: 'hourly',
    backupLocations: ['us-east-1', 'us-west-2', 'eu-west-1'],
    testFrequency: 'monthly',
    lastTestDate: new Date().toISOString(),
  };
}

/**
 * Get compliance and security configuration
 */
export function getComplianceConfiguration() {
  return {
    ssl: {
      enabled: true,
      protocol: 'TLS 1.3',
      certificateProvider: 'Let\'s Encrypt',
      autoRenewal: true,
    },
    encryption: {
      dataInTransit: 'AES-256-GCM',
      dataAtRest: 'AES-256',
    },
    authentication: {
      enabled: true,
      methods: ['OAuth 2.0', 'API Key'],
      mfa: true,
    },
    logging: {
      enabled: true,
      level: 'INFO',
      retention: 90, // days
    },
    compliance: {
      gdpr: true,
      ccpa: true,
      hipaa: false,
      pci_dss: false,
    },
  };
}
