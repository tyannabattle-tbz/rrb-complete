import { describe, it, expect } from 'vitest';
import {
  getMembers,
  getMember,
  getChannelMetrics,
  getEngagementSummary,
  generateReport,
  getEvents,
  recordEvent,
  executeCommand,
  getSchedulerStatus,
} from './services/community-engagement-policy';
import * as royaltyService from './services/royalty-audit-policy';

describe('Community Engagement Policy — Service Layer', () => {
  describe('getMembers', () => {
    it('returns default community members', () => {
      const members = getMembers();
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBeGreaterThan(0);
    });

    it('each member has required fields', () => {
      const members = getMembers();
      for (const m of members) {
        expect(m).toHaveProperty('id');
        expect(m).toHaveProperty('name');
        expect(m).toHaveProperty('tier');
        expect(m).toHaveProperty('channelActivity');
        expect(m).toHaveProperty('engagementScore');
      }
    });

    it('can filter members by tier', () => {
      const members = getMembers({ tier: 'active' });
      for (const m of members) {
        expect(m.tier).toBe('active');
      }
    });
  });

  describe('getMember', () => {
    it('returns a member by ID', () => {
      const members = getMembers();
      if (members.length > 0) {
        const member = getMember(members[0].id);
        expect(member).toBeDefined();
        expect(member!.id).toBe(members[0].id);
      }
    });

    it('returns undefined for non-existent member', () => {
      const member = getMember('non-existent-id');
      expect(member).toBeUndefined();
    });
  });

  describe('getChannelMetrics', () => {
    it('returns channel metrics array', () => {
      const metrics = getChannelMetrics();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('each metric has required fields', () => {
      const metrics = getChannelMetrics();
      for (const m of metrics) {
        expect(m).toHaveProperty('channel');
        expect(m).toHaveProperty('totalEvents');
        expect(m).toHaveProperty('averageScore');
        expect(m).toHaveProperty('trend');
      }
    });

    it('engagement rates are between 0 and 100', () => {
      const metrics = getChannelMetrics();
      for (const m of metrics) {
        expect(m.averageScore).toBeGreaterThanOrEqual(0);
        expect(m.averageScore).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('getEngagementSummary', () => {
    it('returns a complete engagement summary', () => {
      const summary = getEngagementSummary();
      expect(summary).toHaveProperty('totalMembers');
      expect(summary).toHaveProperty('activeMembers');
      expect(summary).toHaveProperty('averageEngagementScore');
      expect(summary).toHaveProperty('healthScore');
      expect(summary).toHaveProperty('healthGrade');
      expect(summary).toHaveProperty('totalEvents');
      expect(summary).toHaveProperty('totalDonations');
      expect(summary).toHaveProperty('overallTrend');
      expect(summary).toHaveProperty('channelBreakdown');
      expect(summary).toHaveProperty('topChannels');
    });

    it('health score is between 0 and 100', () => {
      const summary = getEngagementSummary();
      expect(summary.healthScore).toBeGreaterThanOrEqual(0);
      expect(summary.healthScore).toBeLessThanOrEqual(100);
    });

    it('health grade is a valid letter grade', () => {
      const summary = getEngagementSummary();
      expect(['A+', 'A', 'B+', 'B', 'C', 'D', 'F']).toContain(summary.healthGrade);
    });

    it('totalMembers is a non-negative number', () => {
      const summary = getEngagementSummary();
      expect(summary.totalMembers).toBeGreaterThanOrEqual(0);
    });

    it('channelBreakdown has expected channels', () => {
      const summary = getEngagementSummary();
      expect(summary.channelBreakdown).toHaveProperty('radio');
      expect(summary.channelBreakdown).toHaveProperty('podcast');
      expect(summary.channelBreakdown).toHaveProperty('forum');
      expect(summary.channelBreakdown).toHaveProperty('donation');
    });
  });

  describe('generateReport', () => {
    it('returns a community report with all required fields', () => {
      const report = generateReport();
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('generatedAt');
      expect(report).toHaveProperty('healthScore');
      expect(report).toHaveProperty('healthGrade');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('totalMembers');
      expect(report).toHaveProperty('activeMembers');
      expect(report).toHaveProperty('engagementRate');
    });

    it('report has valid health score', () => {
      const report = generateReport();
      expect(report.healthScore).toBeGreaterThanOrEqual(0);
      expect(report.healthScore).toBeLessThanOrEqual(100);
    });

    it('report includes recommendations', () => {
      const report = generateReport();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('recordEvent and getEvents', () => {
    it('can record an engagement event', () => {
      const event = recordEvent({
        type: 'interaction',
        channel: 'radio',
        memberId: 'test-member',
        description: 'Test interaction',
        timestamp: Date.now(),
      });
      expect(event).toHaveProperty('id');
      expect(event.type).toBe('interaction');
    });

    it('getEvents returns recorded events', () => {
      const events = getEvents();
      expect(Array.isArray(events)).toBe(true);
    });

    it('getEvents can filter by channel', () => {
      recordEvent({
        type: 'interaction',
        channel: 'podcast',
        memberId: 'test-member-2',
        description: 'Podcast listen',
        timestamp: Date.now(),
      });
      const events = getEvents({ channel: 'podcast' });
      for (const e of events) {
        expect(e.channel).toBe('podcast');
      }
    });
  });

  describe('executeCommand', () => {
    it('handles "community status" command', () => {
      const result = executeCommand('community status');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles "community campaigns" command', () => {
      const result = executeCommand('community campaigns');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles "community channels" command', () => {
      const result = executeCommand('community channels');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles "community score" command', () => {
      const result = executeCommand('community score');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles unknown community commands gracefully', () => {
      const result = executeCommand('community unknown');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getSchedulerStatus', () => {
    it('returns scheduler status with required fields', () => {
      const status = getSchedulerStatus();
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('intervalMs');
      expect(status).toHaveProperty('intervalHuman');
      expect(typeof status.enabled).toBe('boolean');
    });
  });
});

describe('MusicBrainz Integration — Royalty Audit', () => {
  it('royalty audit service exports executeCommand', () => {
    expect(typeof royaltyService.executeCommand).toBe('function');
  });

  it('royalty audit handles musicbrainz command', () => {
    const result = royaltyService.executeCommand('royalty musicbrainz');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('royalty audit handles mb-scan command', () => {
    const result = royaltyService.executeCommand('royalty mb-scan');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('getMusicBrainzCrossReferences returns cross-reference data if exported', () => {
    if (typeof (royaltyService as any).getMusicBrainzCrossReferences === 'function') {
      const refs = (royaltyService as any).getMusicBrainzCrossReferences();
      expect(refs).toBeDefined();
      expect(Array.isArray(refs)).toBe(true);
    }
  });

  it('royalty audit getAuditSummary includes health info', () => {
    const summary = royaltyService.getAuditSummary();
    expect(summary).toBeDefined();
    expect(summary).toHaveProperty('totalSources');
    expect(summary).toHaveProperty('healthScore');
  });
});
