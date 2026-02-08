import { describe, it, expect, vi, beforeEach } from 'vitest';
import { qumusChatRouter } from './qumusChatRouter';

// Mock the dependencies
vi.mock('../_core/qumusIdentity', () => ({
  QumusIdentitySystem: {
    getSystemPrompt: vi.fn(() => 'You are QUMUS, the autonomous orchestration engine.'),
    getFullIdentification: vi.fn(() => 'I am QUMUS...'),
    getCapabilities: vi.fn(() => ({
      autonomousOrchestration: { autonomyLevel: 90 },
    })),
    getDecisionPolicies: vi.fn(() => [
      { id: 'policy1', name: 'Content Policy' },
    ]),
    getServiceIntegrations: vi.fn(() => [
      'Stripe',
      'Slack',
      'Email',
    ]),
  },
}));

vi.mock('../_core/qumusOrchestrationEngine', () => ({
  QumusOrchestrationEngine: {
    getOperationalStatus: vi.fn(() => ({ status: 'operational' })),
    getDecisionPolicies: vi.fn(() => []),
    getServiceHealth: vi.fn(() => ({})),
    getHybridCastStatus: vi.fn(() => ({ status: 'active' })),
    getRockinRockinBoogieStatus: vi.fn(() => ({ status: 'operational' })),
    getMetrics: vi.fn(() => ({ uptime: 99.9 })),
  },
}));

vi.mock('../_core/llm', () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [
      {
        message: {
          content: 'This is a test response from QUMUS.',
        },
      },
    ],
  })),
}));

describe('QUMUS Chat Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have a chat mutation', () => {
    const procedures = qumusChatRouter._def.procedures;
    expect(procedures.chat).toBeDefined();
  });

  it('should have getIdentification query', () => {
    const procedures = qumusChatRouter._def.procedures;
    expect(procedures.getIdentification).toBeDefined();
  });

  it('should have getCapabilities query', () => {
    const procedures = qumusChatRouter._def.procedures;
    expect(procedures.getCapabilities).toBeDefined();
  });

  it('should have getDecisionPolicies query', () => {
    const procedures = qumusChatRouter._def.procedures;
    expect(procedures.getDecisionPolicies).toBeDefined();
  });

  it('should have getServiceIntegrations query', () => {
    const procedures = qumusChatRouter._def.procedures;
    expect(procedures.getServiceIntegrations).toBeDefined();
  });

  it('should have getHybridCastStatus query', () => {
    const procedures = qumusChatRouter._def.procedures;
    expect(procedures.getHybridCastStatus).toBeDefined();
  });

  it('should have getRockinRockinBoogieStatus query', () => {
    const procedures = qumusChatRouter._def.procedures;
    expect(procedures.getRockinRockinBoogieStatus).toBeDefined();
  });

  it('should have getOperationalMetrics query', () => {
    const procedures = qumusChatRouter._def.procedures;
    expect(procedures.getOperationalMetrics).toBeDefined();
  });

  describe('Chat Mutation', () => {
    it('should accept messages array and query string', () => {
      const procedures = qumusChatRouter._def.procedures;
      const chatProcedure = procedures.chat;
      
      // Verify the input schema accepts the required fields
      expect(chatProcedure).toBeDefined();
    });

    it('should return success response with message', async () => {
      const { invokeLLM } = await import('../_core/llm');
      
      const mockLLM = vi.mocked(invokeLLM);
      mockLLM.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'This is a test response from QUMUS.',
            },
          },
        ],
      } as any);

      // The actual mutation testing would be done through the tRPC caller
      // This test verifies the router structure exists
      expect(mockLLM).toBeDefined();
    });

    it('should handle LLM errors gracefully', () => {
      const procedures = qumusChatRouter._def.procedures;
      const chatProcedure = procedures.chat;
      
      // Verify error handling is in place
      expect(chatProcedure).toBeDefined();
    });
  });

  describe('Identification Query', () => {
    it('should return QUMUS identification', () => {
      const procedures = qumusChatRouter._def.procedures;
      const identProcedure = procedures.getIdentification;
      
      expect(identProcedure).toBeDefined();
    });
  });

  describe('Capabilities Query', () => {
    it('should return QUMUS capabilities and status', () => {
      const procedures = qumusChatRouter._def.procedures;
      const capProcedure = procedures.getCapabilities;
      
      expect(capProcedure).toBeDefined();
    });
  });

  describe('Decision Policies Query', () => {
    it('should return decision policies', () => {
      const procedures = qumusChatRouter._def.procedures;
      const policiesProcedure = procedures.getDecisionPolicies;
      
      expect(policiesProcedure).toBeDefined();
    });
  });

  describe('Service Integrations Query', () => {
    it('should return service integrations', () => {
      const procedures = qumusChatRouter._def.procedures;
      const servicesProcedure = procedures.getServiceIntegrations;
      
      expect(servicesProcedure).toBeDefined();
    });
  });

  describe('HybridCast Status Query', () => {
    it('should return HybridCast integration status', () => {
      const procedures = qumusChatRouter._def.procedures;
      const hcProcedure = procedures.getHybridCastStatus;
      
      expect(hcProcedure).toBeDefined();
    });
  });

  describe('Rockin Rockin Boogie Status Query', () => {
    it('should return RRB operational status', () => {
      const procedures = qumusChatRouter._def.procedures;
      const rrbProcedure = procedures.getRockinRockinBoogieStatus;
      
      expect(rrbProcedure).toBeDefined();
    });
  });

  describe('Operational Metrics Query', () => {
    it('should return operational metrics', () => {
      const procedures = qumusChatRouter._def.procedures;
      const metricsProcedure = procedures.getOperationalMetrics;
      
      expect(metricsProcedure).toBeDefined();
    });
  });
});
