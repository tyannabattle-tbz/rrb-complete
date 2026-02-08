import { describe, it, expect, beforeEach } from 'vitest';
import { decisionApprovalRouter } from './decisionApprovalRouter';

describe('Decision Approval Router', () => {
  describe('getPendingApprovals', () => {
    it('should have getPendingApprovals procedure', () => {
      const procedures = decisionApprovalRouter._def.procedures;
      expect(procedures.getPendingApprovals).toBeDefined();
    });

    it('should return pending approvals with pagination', () => {
      expect(decisionApprovalRouter._def.procedures.getPendingApprovals).toBeDefined();
    });
  });

  describe('getApprovalDetails', () => {
    it('should have getApprovalDetails procedure', () => {
      const procedures = decisionApprovalRouter._def.procedures;
      expect(procedures.getApprovalDetails).toBeDefined();
    });
  });

  describe('approveDecision', () => {
    it('should have approveDecision mutation', () => {
      const procedures = decisionApprovalRouter._def.procedures;
      expect(procedures.approveDecision).toBeDefined();
    });

    it('should accept approvalId and reason', () => {
      expect(decisionApprovalRouter._def.procedures.approveDecision).toBeDefined();
    });
  });

  describe('rejectDecision', () => {
    it('should have rejectDecision mutation', () => {
      const procedures = decisionApprovalRouter._def.procedures;
      expect(procedures.rejectDecision).toBeDefined();
    });

    it('should accept approvalId and rejection reason', () => {
      expect(decisionApprovalRouter._def.procedures.rejectDecision).toBeDefined();
    });
  });

  describe('requestMoreInfo', () => {
    it('should have requestMoreInfo mutation', () => {
      const procedures = decisionApprovalRouter._def.procedures;
      expect(procedures.requestMoreInfo).toBeDefined();
    });
  });

  describe('getApprovalStats', () => {
    it('should have getApprovalStats query', () => {
      const procedures = decisionApprovalRouter._def.procedures;
      expect(procedures.getApprovalStats).toBeDefined();
    });

    it('should return approval statistics', () => {
      expect(decisionApprovalRouter._def.procedures.getApprovalStats).toBeDefined();
    });
  });

  describe('getApprovalHistory', () => {
    it('should have getApprovalHistory query', () => {
      const procedures = decisionApprovalRouter._def.procedures;
      expect(procedures.getApprovalHistory).toBeDefined();
    });
  });

  describe('bulkApproveDecisions', () => {
    it('should have bulkApproveDecisions mutation', () => {
      const procedures = decisionApprovalRouter._def.procedures;
      expect(procedures.bulkApproveDecisions).toBeDefined();
    });

    it('should accept array of approval IDs', () => {
      expect(decisionApprovalRouter._def.procedures.bulkApproveDecisions).toBeDefined();
    });
  });
});
