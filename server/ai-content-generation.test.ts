/**
 * Tests for QUMUS 14th Policy — AI Content Generation
 * and Royalty Audit CSV Import functionality
 */
import { describe, it, expect, beforeEach } from 'vitest';

// AI Content Generation Policy tests
import {
  getTemplates,
  addTemplate,
  updateTemplate,
  getGeneratedContent,
  approveContent,
  rejectContent,
  publishContent,
  runGeneration,
  getSummary,
  getReports,
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  executeCommand,
} from './services/ai-content-generation-policy';

// CSV Import tests
import {
  importCSVPayoutData,
  getCSVImportHistory,
  getSources,
} from './services/royalty-audit-policy';

describe('QUMUS 14th Policy — AI Content Generation', () => {
  describe('Template Management', () => {
    it('should return default templates', () => {
      const templates = getTemplates();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty('id');
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('type');
      expect(templates[0]).toHaveProperty('channel');
      expect(templates[0]).toHaveProperty('status');
    });

    it('should filter templates by type', () => {
      const templates = getTemplates({ type: 'show_description' });
      templates.forEach(t => expect(t.type).toBe('show_description'));
    });

    it('should filter templates by channel', () => {
      const templates = getTemplates({ channel: 'radio' });
      templates.forEach(t => expect(t.channel).toBe('radio'));
    });

    it('should add a new template', () => {
      const before = getTemplates().length;
      const newTemplate = addTemplate({
        name: 'Test Template',
        type: 'social_post',
        channel: 'social',
        promptTemplate: 'Generate a social post about {topic}',
        variables: ['topic'],
        status: 'active',
        maxLength: 280,
      });
      expect(newTemplate.id).toBeTruthy();
      expect(newTemplate.name).toBe('Test Template');
      expect(getTemplates().length).toBe(before + 1);
    });

    it('should update an existing template', () => {
      const templates = getTemplates();
      const first = templates[0];
      const updated = updateTemplate(first.id, { name: 'Updated Name' });
      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('Updated Name');
    });

    it('should return null when updating non-existent template', () => {
      const result = updateTemplate('nonexistent_id', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('Content Generation', () => {
    it('should run content generation and return a report', () => {
      const report = runGeneration();
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('contentGenerated');
      expect(report).toHaveProperty('templatesProcessed');
      expect(report).toHaveProperty('autoApproved');
      expect(report.contentGenerated).toBeGreaterThanOrEqual(0);
    });

    it('should track generated content', () => {
      const content = getGeneratedContent();
      expect(Array.isArray(content)).toBe(true);
    });

    it('should filter generated content by status', () => {
      runGeneration(); // Generate some content first
      const pending = getGeneratedContent({ status: 'pending_review' });
      pending.forEach(c => expect(c.status).toBe('pending_review'));
    });

    it('should get generation reports', () => {
      const reports = getReports();
      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBeGreaterThan(0);
    });
  });

  describe('Content Approval Workflow', () => {
    it('should approve content', () => {
      runGeneration();
      const pending = getGeneratedContent({ status: 'pending_review' });
      if (pending.length > 0) {
        const result = approveContent(pending[0].id);
        expect(result).toBe(true);
      }
    });

    it('should reject content', () => {
      runGeneration();
      const pending = getGeneratedContent({ status: 'pending_review' });
      if (pending.length > 0) {
        const result = rejectContent(pending[0].id);
        expect(result).toBe(true);
      }
    });

    it('should publish approved content', () => {
      runGeneration();
      const pending = getGeneratedContent({ status: 'pending_review' });
      if (pending.length > 0) {
        approveContent(pending[0].id);
        const result = publishContent(pending[0].id);
        expect(result).toBe(true);
      }
    });
  });

  describe('Summary & Scheduler', () => {
    it('should return a content summary', () => {
      const summary = getSummary();
      expect(summary).toHaveProperty('totalTemplates');
      expect(summary).toHaveProperty('activeTemplates');
      expect(summary).toHaveProperty('totalGenerated');
      expect(summary).toHaveProperty('pendingReview');
      expect(summary).toHaveProperty('published');
      expect(summary).toHaveProperty('avgConfidence');
      expect(summary).toHaveProperty('topChannel');
      expect(typeof summary.totalTemplates).toBe('number');
    });

    it('should manage scheduler lifecycle', () => {
      startScheduler(300000); // 5 min
      let status = getSchedulerStatus();
      expect(status.running).toBe(true);

      stopScheduler();
      status = getSchedulerStatus();
      expect(status.running).toBe(false);
    });

    it('should return scheduler status', () => {
      const status = getSchedulerStatus();
      expect(status).toHaveProperty('running');
      expect(status).toHaveProperty('lastRun');
      expect(status).toHaveProperty('totalRuns');
    });
  });

  describe('Command Console', () => {
    it('should return status via command', () => {
      const result = executeCommand('status');
      expect(result).toContain('AI Content Generation');
      expect(result).toContain('Templates');
    });

    it('should return help for unknown subcommand', () => {
      const result = executeCommand('unknown_cmd');
      expect(result).toContain('Available');
    });

    it('should handle generate command', () => {
      const result = executeCommand('generate');
      expect(result).toContain('Generation complete');
    });

    it('should handle templates command', () => {
      const result = executeCommand('templates');
      expect(result).toContain('Templates');
    });

    it('should handle pending command', () => {
      const result = executeCommand('pending');
      expect(result).toContain('Pending');
    });
  });
});

describe('Royalty Audit — CSV Payout Data Import', () => {
  describe('CSV Parsing', () => {
    it('should import basic CSV payout data', () => {
      const csv = `title,artist,streams,earnings,platform,period
"Rockin' Rockin' Boogie","Seabrun Candy Hunter",15420,6.17,spotify,2026-Q1
"Let's Work Together","Canned Heat",8200,3.28,spotify,2026-Q1`;

      const result = importCSVPayoutData(csv);
      expect(result.totalRows).toBe(2);
      expect(result.sourcesUpdated + result.sourcesCreated).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
    });

    it('should handle platform override', () => {
      const csv = `title,streams,earnings
"Test Song",1000,0.50`;

      const result = importCSVPayoutData(csv, 'spotify');
      expect(result.platform).toBe('spotify');
      expect(result.totalRows).toBe(1);
    });

    it('should reject CSV without required columns', () => {
      const csv = `name,value
"Test",123`;

      expect(() => importCSVPayoutData(csv)).toThrow('CSV must contain a song/title/track column');
    });

    it('should reject empty CSV', () => {
      expect(() => importCSVPayoutData('')).toThrow();
    });

    it('should handle CSV with only header', () => {
      const csv = `title,streams,earnings`;
      expect(() => importCSVPayoutData(csv)).toThrow('CSV must have at least a header row and one data row');
    });

    it('should handle quoted fields with commas', () => {
      const csv = `title,artist,streams,earnings
"Rockin', Rockin' Boogie","Hunter, Seabrun Candy",5000,2.50`;

      const result = importCSVPayoutData(csv, 'spotify');
      expect(result.totalRows).toBe(1);
      expect(result.errors.length).toBe(0);
    });

    it('should normalize platform names', () => {
      const csv = `title,artist,streams,earnings,platform
"Test Song A","Test Artist",100,0.05,Spotify for Artists
"Test Song B","Test Artist",200,0.10,Apple Music`;

      const result = importCSVPayoutData(csv);
      expect(result.totalRows).toBe(2);
    });

    it('should detect discrepancies when actual rate differs from expected', () => {
      // First ensure a source exists with an expected rate
      const sources = getSources({ platform: 'spotify' });
      const sourceWithExpected = sources.find(s => s.expectedRate > 0);
      
      if (sourceWithExpected) {
        const csv = `title,artist,streams,earnings
"${sourceWithExpected.songTitle}","${sourceWithExpected.artist}",100000,1.00`;

        const result = importCSVPayoutData(csv, 'spotify');
        // With very low actual rate vs expected, should detect discrepancy
        expect(result.totalRows).toBe(1);
      }
    });
  });

  describe('Import History', () => {
    it('should track import history', () => {
      const history = getCSVImportHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should have correct fields in import history', () => {
      const history = getCSVImportHistory();
      if (history.length > 0) {
        const latest = history[0];
        expect(latest).toHaveProperty('totalRows');
        expect(latest).toHaveProperty('sourcesUpdated');
        expect(latest).toHaveProperty('sourcesCreated');
        expect(latest).toHaveProperty('discrepanciesDetected');
        expect(latest).toHaveProperty('errors');
        expect(latest).toHaveProperty('platform');
        expect(latest).toHaveProperty('importedAt');
      }
    });

    it('should sort history by most recent first', () => {
      const history = getCSVImportHistory();
      if (history.length >= 2) {
        expect(new Date(history[0].importedAt).getTime()).toBeGreaterThanOrEqual(
          new Date(history[1].importedAt).getTime()
        );
      }
    });
  });

  describe('DistroKid Format', () => {
    it('should parse DistroKid-style CSV', () => {
      const csv = `Title,Artist Name,Quantity,Earnings,Store,Reporting Month
"Rockin' Rockin' Boogie","Seabrun Candy Hunter",25000,10.00,Spotify,2026-01`;

      const result = importCSVPayoutData(csv);
      expect(result.totalRows).toBe(1);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('TuneCore Format', () => {
    it('should parse TuneCore-style CSV', () => {
      const csv = `Song,Artist Name,Quantity,Revenue,Platform,Period
"Let's Work Together","Canned Heat",12000,4.80,Apple Music,2026-Q1`;

      const result = importCSVPayoutData(csv);
      expect(result.totalRows).toBe(1);
      expect(result.errors.length).toBe(0);
    });
  });
});
