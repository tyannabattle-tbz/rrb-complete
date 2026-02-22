/**
 * Domain Routing Middleware Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getDomainConfig,
  getAllDomainConfigs,
  getDomainConfigByPlatformId,
  getPlatformIdFromDomain,
} from './domainRouting';

describe('Domain Routing', () => {
  describe('Domain Configuration', () => {
    it('should have RRB public domain configured', () => {
      const config = getDomainConfigByPlatformId('rrb');
      expect(config).toBeDefined();
      expect(config?.interfaceType).toBe('public');
    });

    it('should have SQUADD broadcaster domain configured', () => {
      const config = getDomainConfigByPlatformId('squadd');
      expect(config).toBeDefined();
      expect(config?.interfaceType).toBe('broadcaster');
    });

    it('should have Solbones broadcaster domain configured', () => {
      const config = getDomainConfigByPlatformId('solbones');
      expect(config).toBeDefined();
      expect(config?.interfaceType).toBe('broadcaster');
    });
  });

  describe('Domain Lookup', () => {
    it('should get platform ID from domain', () => {
      const platformId = getPlatformIdFromDomain('rockinrockinboogie.manus.space');
      expect(platformId).toBe('rrb');
    });

    it('should get platform ID from SQUADD domain', () => {
      const platformId = getPlatformIdFromDomain('squadd.manus.space');
      expect(platformId).toBe('squadd');
    });

    it('should get platform ID from Solbones domain', () => {
      const platformId = getPlatformIdFromDomain('solbones.manus.space');
      expect(platformId).toBe('solbones');
    });
  });

  describe('Domain Configurations', () => {
    it('should return all domain configs', () => {
      const configs = getAllDomainConfigs();
      expect(configs.length).toBeGreaterThanOrEqual(3);
    });

    it('should have unique platform IDs', () => {
      const configs = getAllDomainConfigs();
      const platformIds = configs.map((c) => c.platformId);
      const uniqueIds = new Set(platformIds);
      expect(uniqueIds.size).toBe(platformIds.length);
    });

    it('should have unique domains', () => {
      const configs = getAllDomainConfigs();
      const domains = configs.map((c) => c.domain);
      const uniqueDomains = new Set(domains);
      expect(uniqueDomains.size).toBe(domains.length);
    });
  });

  describe('Interface Types', () => {
    it('should identify public interfaces', () => {
      const config = getDomainConfigByPlatformId('rrb');
      expect(config?.interfaceType).toBe('public');
    });

    it('should identify broadcaster interfaces', () => {
      const squadConfig = getDomainConfigByPlatformId('squadd');
      const solbonesConfig = getDomainConfigByPlatformId('solbones');
      expect(squadConfig?.interfaceType).toBe('broadcaster');
      expect(solbonesConfig?.interfaceType).toBe('broadcaster');
    });
  });
});
