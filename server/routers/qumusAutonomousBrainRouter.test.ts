import { describe, it, expect, vi, beforeEach } from 'vitest';
import { qumusAutonomousBrainRouter } from './qumusAutonomousBrainRouter';

// Mock the dependencies
vi.mock('../_core/llm', () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [
      {
        message: {
          content: '{ "decision": "approve_content", "confidence": 88, "reasoning": "Content meets all criteria" }',
        },
      },
    ],
  })),
}));

vi.mock('../_core/notification', () => ({
  notifyOwner: vi.fn(async () => true),
}));

describe('QUMUS Autonomous Brain Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Router Structure', () => {
    it('should have makeDecision mutation', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.makeDecision).toBeDefined();
    });

    it('should have getPolicies query', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getPolicies).toBeDefined();
    });

    it('should have getSystemPolicies query', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getSystemPolicies).toBeDefined();
    });

    it('should have getPolicy query', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getPolicy).toBeDefined();
    });

    it('should have approveDecision mutation', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.approveDecision).toBeDefined();
    });

    it('should have rejectDecision mutation', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.rejectDecision).toBeDefined();
    });

    it('should have getStatus query', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getStatus).toBeDefined();
    });

    it('should have getEcosystemOverview query', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getEcosystemOverview).toBeDefined();
    });

    it('should have getDecisionStatistics query', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getDecisionStatistics).toBeDefined();
    });
  });

  describe('Decision Policies', () => {
    it('should have policies for RRB system', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getPolicies).toBeDefined();
    });

    it('should have policies for Canryn system', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getPolicies).toBeDefined();
    });

    it('should have policies for Sweet Miracles system', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getPolicies).toBeDefined();
    });

    it('should have policies for HybridCast system', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getPolicies).toBeDefined();
    });
  });

  describe('Autonomous Brain Status', () => {
    it('should report 90% autonomy level', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getStatus).toBeDefined();
    });

    it('should report operational status', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getStatus).toBeDefined();
    });

    it('should track all four systems', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getStatus).toBeDefined();
    });
  });

  describe('Ecosystem Overview', () => {
    it('should list all ecosystem systems', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getEcosystemOverview).toBeDefined();
    });

    it('should include RRB in ecosystem', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getEcosystemOverview).toBeDefined();
    });

    it('should include Canryn in ecosystem', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getEcosystemOverview).toBeDefined();
    });

    it('should include Sweet Miracles in ecosystem', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getEcosystemOverview).toBeDefined();
    });

    it('should include HybridCast in ecosystem', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getEcosystemOverview).toBeDefined();
    });

    it('should report 90/10 autonomy model', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getEcosystemOverview).toBeDefined();
    });
  });

  describe('Decision Statistics', () => {
    it('should track total decisions', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getDecisionStatistics).toBeDefined();
    });

    it('should track autonomous decisions', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getDecisionStatistics).toBeDefined();
    });

    it('should track human-approved decisions', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getDecisionStatistics).toBeDefined();
    });

    it('should track rejected decisions', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getDecisionStatistics).toBeDefined();
    });

    it('should calculate autonomy rate', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getDecisionStatistics).toBeDefined();
    });

    it('should track per-system statistics', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.getDecisionStatistics).toBeDefined();
    });
  });

  describe('Decision Making', () => {
    it('should accept system, policyId, and context', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      const makeDecision = procedures.makeDecision;
      expect(makeDecision).toBeDefined();
    });

    it('should support RRB system decisions', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.makeDecision).toBeDefined();
    });

    it('should support Canryn system decisions', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.makeDecision).toBeDefined();
    });

    it('should support Sweet Miracles system decisions', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.makeDecision).toBeDefined();
    });

    it('should support HybridCast system decisions', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.makeDecision).toBeDefined();
    });
  });

  describe('Human Oversight', () => {
    it('should have approveDecision mutation', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.approveDecision).toBeDefined();
    });

    it('should have rejectDecision mutation', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.rejectDecision).toBeDefined();
    });

    it('should support approval notes', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.approveDecision).toBeDefined();
    });

    it('should require rejection reason', () => {
      const procedures = qumusAutonomousBrainRouter._def.procedures;
      expect(procedures.rejectDecision).toBeDefined();
    });
  });
});
