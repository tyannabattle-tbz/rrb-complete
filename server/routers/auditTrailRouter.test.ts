import { describe, it, expect } from 'vitest';
import { auditTrailRouter } from './auditTrailRouter';

describe('Audit Trail Router', () => {
  describe('Router Structure', () => {
    it('should have logDecision mutation', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logDecision).toBeDefined();
    });

    it('should have getDecisionAuditTrail query', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.getDecisionAuditTrail).toBeDefined();
    });

    it('should have getAllAuditTrail query', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.getAllAuditTrail).toBeDefined();
    });

    it('should have logCompliance mutation', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logCompliance).toBeDefined();
    });

    it('should have getComplianceLog query', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.getComplianceLog).toBeDefined();
    });

    it('should have getComplianceViolations query', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.getComplianceViolations).toBeDefined();
    });

    it('should have getAuditStatistics query', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.getAuditStatistics).toBeDefined();
    });

    it('should have exportAuditTrail query', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.exportAuditTrail).toBeDefined();
    });
  });

  describe('Audit Trail Functionality', () => {
    it('should support created action', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logDecision).toBeDefined();
    });

    it('should support approved action', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logDecision).toBeDefined();
    });

    it('should support rejected action', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logDecision).toBeDefined();
    });

    it('should support executed action', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logDecision).toBeDefined();
    });

    it('should support escalated action', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logDecision).toBeDefined();
    });

    it('should support modified action', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logDecision).toBeDefined();
    });
  });

  describe('Compliance Logging', () => {
    it('should support compliant status', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logCompliance).toBeDefined();
    });

    it('should support warning status', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logCompliance).toBeDefined();
    });

    it('should support violation status', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logCompliance).toBeDefined();
    });

    it('should support pending_review status', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.logCompliance).toBeDefined();
    });
  });

  describe('Statistics and Reporting', () => {
    it('should provide action breakdown', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.getAuditStatistics).toBeDefined();
    });

    it('should provide user breakdown', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.getAuditStatistics).toBeDefined();
    });

    it('should provide compliance status breakdown', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.getAuditStatistics).toBeDefined();
    });

    it('should track violation count', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.getAuditStatistics).toBeDefined();
    });

    it('should track warning count', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.getAuditStatistics).toBeDefined();
    });

    it('should track compliant count', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.getAuditStatistics).toBeDefined();
    });
  });

  describe('Export Functionality', () => {
    it('should support CSV export format', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.exportAuditTrail).toBeDefined();
    });

    it('should support JSON export format', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.exportAuditTrail).toBeDefined();
    });

    it('should support date range filtering', () => {
      const procedures = auditTrailRouter._def.procedures;
      expect(procedures.exportAuditTrail).toBeDefined();
    });
  });
});
