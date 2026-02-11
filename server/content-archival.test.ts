/**
 * Content Archival Policy Tests — QUMUS 11th Policy
 * Tests for link monitoring, archival scanning, alert management, and scheduler
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Content Archival Policy', () => {
  // Reset modules before each test to get clean state
  beforeEach(() => {
    vi.resetModules();
  });

  describe('Service Initialization', () => {
    it('should initialize with default monitored links', async () => {
      const service = await import('./services/content-archival-policy');
      const links = service.getLinks();
      expect(links.length).toBeGreaterThanOrEqual(10);
    });

    it('should include BMI Songview in default links', async () => {
      const service = await import('./services/content-archival-policy');
      const links = service.getLinks();
      const bmiLink = links.find(l => l.url.includes('repertoire.bmi.com'));
      expect(bmiLink).toBeDefined();
      expect(bmiLink?.priority).toBe('critical');
      expect(bmiLink?.category).toBe('evidence');
    });

    it('should include Copyright Office in default links', async () => {
      const service = await import('./services/content-archival-policy');
      const links = service.getLinks();
      const copyrightLink = links.find(l => l.url.includes('copyright.gov'));
      expect(copyrightLink).toBeDefined();
      expect(copyrightLink?.priority).toBe('critical');
      expect(copyrightLink?.category).toBe('legal');
    });

    it('should include Discogs evidence link', async () => {
      const service = await import('./services/content-archival-policy');
      const links = service.getLinks();
      const discogsLink = links.find(l => l.url.includes('discogs.com/release'));
      expect(discogsLink).toBeDefined();
      expect(discogsLink?.priority).toBe('critical');
    });
  });

  describe('Link Management', () => {
    it('should add a new monitored link', async () => {
      const service = await import('./services/content-archival-policy');
      const initialCount = service.getLinks().length;
      
      const newLink = service.addLink({
        url: 'https://example.com/test-evidence',
        title: 'Test Evidence Link',
        category: 'evidence',
        priority: 'high',
        notes: 'Test link for archival',
      });
      
      expect(newLink.id).toBeDefined();
      expect(newLink.url).toBe('https://example.com/test-evidence');
      expect(newLink.status).toBe('unknown');
      expect(newLink.checkCount).toBe(0);
      expect(service.getLinks().length).toBe(initialCount + 1);
    });

    it('should reject duplicate URLs', async () => {
      const service = await import('./services/content-archival-policy');
      
      service.addLink({
        url: 'https://example.com/unique-test',
        title: 'Unique Test',
        category: 'reference',
        priority: 'low',
      });
      
      expect(() => service.addLink({
        url: 'https://example.com/unique-test',
        title: 'Duplicate',
        category: 'reference',
        priority: 'low',
      })).toThrow('Link already monitored');
    });

    it('should remove a monitored link', async () => {
      const service = await import('./services/content-archival-policy');
      
      const link = service.addLink({
        url: 'https://example.com/to-remove',
        title: 'To Remove',
        category: 'reference',
        priority: 'low',
      });
      
      const countBefore = service.getLinks().length;
      service.removeLink(link.id);
      expect(service.getLinks().length).toBe(countBefore - 1);
    });

    it('should throw when removing non-existent link', async () => {
      const service = await import('./services/content-archival-policy');
      expect(() => service.removeLink('nonexistent_id')).toThrow('Link not found');
    });

    it('should filter links by category', async () => {
      const service = await import('./services/content-archival-policy');
      const evidenceLinks = service.getLinks({ category: 'evidence' });
      evidenceLinks.forEach(l => expect(l.category).toBe('evidence'));
    });

    it('should filter links by priority', async () => {
      const service = await import('./services/content-archival-policy');
      const criticalLinks = service.getLinks({ priority: 'critical' });
      criticalLinks.forEach(l => expect(l.priority).toBe('critical'));
      expect(criticalLinks.length).toBeGreaterThan(0);
    });

    it('should get a link by ID', async () => {
      const service = await import('./services/content-archival-policy');
      const links = service.getLinks();
      const link = service.getLinkById(links[0].id);
      expect(link.id).toBe(links[0].id);
    });

    it('should throw when getting non-existent link by ID', async () => {
      const service = await import('./services/content-archival-policy');
      expect(() => service.getLinkById('nonexistent')).toThrow('Link not found');
    });
  });

  describe('Archival Summary', () => {
    it('should return a valid summary', async () => {
      const service = await import('./services/content-archival-policy');
      const summary = service.getArchivalSummary();
      
      expect(summary.totalLinks).toBeGreaterThan(0);
      expect(summary.healthScore).toBeGreaterThanOrEqual(0);
      expect(summary.healthScore).toBeLessThanOrEqual(100);
      expect(summary.healthGrade).toBeDefined();
      expect(summary.categoryBreakdown).toBeDefined();
      expect(typeof summary.linkRotRate).toBe('number');
    });

    it('should have correct category breakdown', async () => {
      const service = await import('./services/content-archival-policy');
      const summary = service.getArchivalSummary();
      
      const totalFromCategories = Object.values(summary.categoryBreakdown).reduce((a, b) => a + b, 0);
      expect(totalFromCategories).toBe(summary.totalLinks);
    });
  });

  describe('Alert Management', () => {
    it('should return empty alerts initially', async () => {
      const service = await import('./services/content-archival-policy');
      const alerts = service.getArchivalAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should throw when acknowledging non-existent alert', async () => {
      const service = await import('./services/content-archival-policy');
      expect(() => service.acknowledgeArchivalAlert('nonexistent')).toThrow('Alert not found');
    });

    it('should throw when resolving non-existent alert', async () => {
      const service = await import('./services/content-archival-policy');
      expect(() => service.resolveArchivalAlert('nonexistent')).toThrow('Alert not found');
    });
  });

  describe('Scan History', () => {
    it('should return empty scan history initially', async () => {
      const service = await import('./services/content-archival-policy');
      const history = service.getScanHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });
  });

  describe('Scheduler', () => {
    it('should return scheduler status', async () => {
      const service = await import('./services/content-archival-policy');
      const status = service.getSchedulerStatus();
      
      expect(typeof status.enabled).toBe('boolean');
      expect(typeof status.intervalMs).toBe('number');
      expect(typeof status.intervalHuman).toBe('string');
      expect(typeof status.totalChecks).toBe('number');
    });

    it('should reject intervals below minimum', async () => {
      const service = await import('./services/content-archival-policy');
      expect(() => service.startArchivalScheduler(1000)).toThrow('Minimum archival scan interval');
    });

    it('should reject update intervals below minimum', async () => {
      const service = await import('./services/content-archival-policy');
      expect(() => service.updateSchedulerInterval(1000)).toThrow('Minimum archival scan interval');
    });

    it('should stop scheduler', async () => {
      const service = await import('./services/content-archival-policy');
      service.stopArchivalScheduler();
      const status = service.getSchedulerStatus();
      expect(status.enabled).toBe(false);
    });
  });

  describe('Command Console Integration', () => {
    it('should handle archive status command', async () => {
      const service = await import('./services/content-archival-policy');
      const result = service.executeCommand('archive status');
      expect(result).toContain('Content Archival Status');
      expect(result).toContain('Links:');
      expect(result).toContain('Health:');
    });

    it('should handle archive scan command', async () => {
      const service = await import('./services/content-archival-policy');
      const result = service.executeCommand('archive scan');
      expect(result).toContain('scan initiated');
    });

    it('should handle archive wayback command', async () => {
      const service = await import('./services/content-archival-policy');
      const result = service.executeCommand('archive wayback');
      expect(result).toContain('Wayback Machine');
    });

    it('should handle archive linkrot command with no dead links', async () => {
      const service = await import('./services/content-archival-policy');
      const result = service.executeCommand('archive linkrot');
      // Initially no scans have run, so links are 'unknown' not 'dead'
      expect(result).toContain('No link rot detected');
    });

    it('should handle archive scheduler command', async () => {
      const service = await import('./services/content-archival-policy');
      const result = service.executeCommand('archive scheduler');
      expect(result).toContain('Archival Scheduler');
      expect(result).toContain('Interval:');
    });

    it('should show help for unknown archive subcommand', async () => {
      const service = await import('./services/content-archival-policy');
      const result = service.executeCommand('archive');
      expect(result).toContain('Content Archival Commands');
    });
  });
});
