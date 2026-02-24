import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStreamingConfiguration,
  getStreamingEndpoints,
  getEndpointByFormat,
  getRecommendedEndpoint,
  getServerStatus,
  getActiveServers,
  getServerLoadPercentage,
  getFailoverServer,
  getInfrastructureHealth,
  getCDNConfiguration,
  getLoadBalancingConfiguration,
  getMonitoringConfiguration,
  getDisasterRecoveryConfiguration,
  getComplianceConfiguration,
  RRB_STREAMING_CONFIG,
} from './rrbStreamingInfrastructure';

describe('RRB Streaming Infrastructure', () => {
  describe('Configuration', () => {
    it('should have valid streaming configuration', () => {
      const config = getStreamingConfiguration();
      expect(config).toBeDefined();
      expect(config.domain).toBe('stream.rockinrockinboogie.com');
      expect(config.primaryServer).toBeDefined();
      expect(config.backupServers.length).toBeGreaterThan(0);
    });

    it('should have at least 4 streaming endpoints', () => {
      const endpoints = getStreamingEndpoints();
      expect(endpoints.length).toBeGreaterThanOrEqual(4);
    });

    it('should have endpoints for all major formats', () => {
      const endpoints = getStreamingEndpoints();
      const formats = endpoints.map(e => e.format);
      expect(formats).toContain('mp3');
      expect(formats).toContain('aac');
      expect(formats).toContain('hls');
      expect(formats).toContain('dash');
    });

    it('should have valid URLs for all endpoints', () => {
      const endpoints = getStreamingEndpoints();
      endpoints.forEach(endpoint => {
        expect(endpoint.url).toMatch(/^https:\/\//);
        expect(endpoint.url).toContain('stream.rockinrockinboogie.com');
      });
    });
  });

  describe('Endpoint Selection', () => {
    it('should get endpoint by format', () => {
      const mp3Endpoint = getEndpointByFormat('mp3');
      expect(mp3Endpoint).toBeDefined();
      expect(mp3Endpoint?.format).toBe('mp3');

      const hlsEndpoint = getEndpointByFormat('hls');
      expect(hlsEndpoint).toBeDefined();
      expect(hlsEndpoint?.format).toBe('hls');
    });

    it('should recommend HLS for HLS-capable clients', () => {
      const endpoint = getRecommendedEndpoint({ supportHLS: true });
      expect(endpoint.format).toBe('hls');
    });

    it('should recommend DASH for DASH-capable clients', () => {
      const endpoint = getRecommendedEndpoint({ supportDASH: true });
      expect(endpoint.format).toBe('dash');
    });

    it('should recommend MP3 for low bandwidth clients', () => {
      const endpoint = getRecommendedEndpoint({ bandwidth: 128 });
      expect(endpoint.format).toBe('mp3');
      expect(endpoint.bitrate).toBe(128);
    });

    it('should recommend AAC for default clients', () => {
      const endpoint = getRecommendedEndpoint({});
      expect(endpoint.format).toBe('aac');
    });
  });

  describe('Server Management', () => {
    it('should get primary server status', () => {
      const server = getServerStatus('rrb-primary-us-east');
      expect(server).toBeDefined();
      expect(server?.type).toBe('primary');
      expect(server?.region).toBe('us-east-1');
    });

    it('should get backup server status', () => {
      const server = getServerStatus('rrb-backup-us-west');
      expect(server).toBeDefined();
      expect(server?.type).toBe('backup');
    });

    it('should return undefined for invalid server ID', () => {
      const server = getServerStatus('invalid-server');
      expect(server).toBeUndefined();
    });

    it('should get active servers', () => {
      const servers = getActiveServers();
      expect(servers.length).toBeGreaterThan(0);
      servers.forEach(server => {
        expect(['active', 'standby']).toContain(server.status);
      });
    });

    it('should calculate server load percentage', () => {
      const loadPercentage = getServerLoadPercentage('rrb-primary-us-east');
      expect(loadPercentage).toBeGreaterThanOrEqual(0);
      expect(loadPercentage).toBeLessThanOrEqual(100);
    });
  });

  describe('Failover', () => {
    it('should have failover enabled', () => {
      const config = getStreamingConfiguration();
      expect(config.failoverEnabled).toBe(true);
    });

    it('should get failover server', () => {
      const failoverServer = getFailoverServer();
      expect(failoverServer).toBeDefined();
      expect(failoverServer?.type).toBe('backup');
    });
  });

  describe('Infrastructure Health', () => {
    it('should return infrastructure health status', () => {
      const health = getInfrastructureHealth();
      expect(health).toBeDefined();
      expect(['healthy', 'degraded', 'critical']).toContain(health.overallStatus);
    });

    it('should have valid health metrics', () => {
      const health = getInfrastructureHealth();
      expect(health.totalCapacity).toBeGreaterThan(0);
      expect(health.totalLoad).toBeGreaterThanOrEqual(0);
      expect(health.loadPercentage).toBeGreaterThanOrEqual(0);
      expect(health.loadPercentage).toBeLessThanOrEqual(100);
      expect(health.averageLatency).toBeGreaterThan(0);
    });

    it('should indicate failover readiness', () => {
      const health = getInfrastructureHealth();
      expect(typeof health.failoverReady).toBe('boolean');
    });
  });

  describe('CDN Configuration', () => {
    it('should have CDN enabled', () => {
      const cdnConfig = getCDNConfiguration();
      expect(cdnConfig.enabled).toBe(true);
    });

    it('should have valid CDN provider', () => {
      const cdnConfig = getCDNConfiguration();
      expect(cdnConfig.provider).toBe('CloudFlare');
    });

    it('should have regional CDN coverage', () => {
      const cdnConfig = getCDNConfiguration();
      expect(cdnConfig.regions.length).toBeGreaterThan(0);
      expect(cdnConfig.regions).toContain('us-east-1');
      expect(cdnConfig.regions).toContain('eu-west-1');
    });

    it('should have valid cache TTL', () => {
      const cdnConfig = getCDNConfiguration();
      expect(cdnConfig.ttl).toBeGreaterThan(0);
    });
  });

  describe('Load Balancing', () => {
    it('should have load balancing configured', () => {
      const lbConfig = getLoadBalancingConfiguration();
      expect(lbConfig).toBeDefined();
    });

    it('should use geographic load balancing strategy', () => {
      const config = getStreamingConfiguration();
      expect(config.loadBalancingStrategy).toBe('geographic');
    });

    it('should have session stickiness enabled', () => {
      const lbConfig = getLoadBalancingConfiguration();
      expect(lbConfig.sessionStickiness).toBe(true);
    });

    it('should have health check configuration', () => {
      const lbConfig = getLoadBalancingConfiguration();
      expect(lbConfig.healthCheckInterval).toBeGreaterThan(0);
      expect(lbConfig.healthCheckTimeout).toBeGreaterThan(0);
      expect(lbConfig.failoverThreshold).toBeGreaterThan(0);
    });
  });

  describe('Monitoring', () => {
    it('should have monitoring enabled', () => {
      const monConfig = getMonitoringConfiguration();
      expect(monConfig.enabled).toBe(true);
    });

    it('should have alert thresholds configured', () => {
      const monConfig = getMonitoringConfiguration();
      expect(monConfig.alertThresholds.cpuUsage).toBeGreaterThan(0);
      expect(monConfig.alertThresholds.memoryUsage).toBeGreaterThan(0);
      expect(monConfig.alertThresholds.uptime).toBeGreaterThan(0);
    });

    it('should have multiple alert channels', () => {
      const monConfig = getMonitoringConfiguration();
      expect(monConfig.alertChannels.length).toBeGreaterThan(0);
      expect(monConfig.alertChannels).toContain('email');
      expect(monConfig.alertChannels).toContain('slack');
    });
  });

  describe('Disaster Recovery', () => {
    it('should have disaster recovery enabled', () => {
      const drConfig = getDisasterRecoveryConfiguration();
      expect(drConfig.enabled).toBe(true);
    });

    it('should have RTO and RPO defined', () => {
      const drConfig = getDisasterRecoveryConfiguration();
      expect(drConfig.rtoMinutes).toBeGreaterThan(0);
      expect(drConfig.rpoMinutes).toBeGreaterThan(0);
      expect(drConfig.rtoMinutes).toBeGreaterThanOrEqual(drConfig.rpoMinutes);
    });

    it('should have backup locations', () => {
      const drConfig = getDisasterRecoveryConfiguration();
      expect(drConfig.backupLocations.length).toBeGreaterThan(1);
    });
  });

  describe('Compliance', () => {
    it('should have SSL/TLS configured', () => {
      const compConfig = getComplianceConfiguration();
      expect(compConfig.ssl.enabled).toBe(true);
      expect(compConfig.ssl.protocol).toBe('TLS 1.3');
    });

    it('should have encryption configured', () => {
      const compConfig = getComplianceConfiguration();
      expect(compConfig.encryption.dataInTransit).toContain('AES');
      expect(compConfig.encryption.dataAtRest).toContain('AES');
    });

    it('should have authentication enabled', () => {
      const compConfig = getComplianceConfiguration();
      expect(compConfig.authentication.enabled).toBe(true);
      expect(compConfig.authentication.mfa).toBe(true);
    });

    it('should have GDPR and CCPA compliance', () => {
      const compConfig = getComplianceConfiguration();
      expect(compConfig.compliance.gdpr).toBe(true);
      expect(compConfig.compliance.ccpa).toBe(true);
    });

    it('should have logging configured', () => {
      const compConfig = getComplianceConfiguration();
      expect(compConfig.logging.enabled).toBe(true);
      expect(compConfig.logging.retention).toBeGreaterThan(0);
    });
  });

  describe('Integration', () => {
    it('should have complete infrastructure setup', () => {
      const config = getStreamingConfiguration();
      const health = getInfrastructureHealth();
      const cdnConfig = getCDNConfiguration();
      const lbConfig = getLoadBalancingConfiguration();

      expect(config.primaryServer).toBeDefined();
      expect(config.backupServers.length).toBeGreaterThan(0);
      expect(health.overallStatus).toBeDefined();
      expect(cdnConfig.enabled).toBe(true);
      expect(lbConfig.strategy).toBeDefined();
    });

    it('should have redundancy across regions', () => {
      const servers = getActiveServers();
      const regions = new Set(servers.map(s => s.region));
      expect(regions.size).toBeGreaterThan(1);
    });

    it('should support multiple streaming formats', () => {
      const endpoints = getStreamingEndpoints();
      const formats = new Set(endpoints.map(e => e.format));
      expect(formats.size).toBeGreaterThanOrEqual(4);
    });
  });
});
