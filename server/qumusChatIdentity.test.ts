import { describe, it, expect, beforeAll } from 'vitest';
import { QumusIdentitySystem } from './_core/qumusIdentity';

describe('QUMUS Chat Identity System', () => {
  beforeAll(() => {
    // Ensure identity system is initialized
    QumusIdentitySystem.getIdentity();
  });

  it('should return QUMUS identity', () => {
    const identity = QumusIdentitySystem.getIdentity();
    
    expect(identity.name).toBe('QUMUS');
    expect(identity.role).toBe('Autonomous Orchestration Engine');
    expect(identity.parentCompany).toBe('Canryn Production');
    expect(identity.autonomyLevel).toBe(90);
  });

  it('should have 8 decision policies', () => {
    const identity = QumusIdentitySystem.getIdentity();
    
    expect(identity.decisionPolicies).toHaveLength(8);
    expect(identity.decisionPolicies).toContain('Content Policy');
    expect(identity.decisionPolicies).toContain('User Policy');
    expect(identity.decisionPolicies).toContain('Payment Policy');
    expect(identity.decisionPolicies).toContain('Security Policy');
    expect(identity.decisionPolicies).toContain('Compliance Policy');
    expect(identity.decisionPolicies).toContain('Performance Policy');
    expect(identity.decisionPolicies).toContain('Engagement Policy');
    expect(identity.decisionPolicies).toContain('System Policy');
  });

  it('should have 11+ integrated services', () => {
    const identity = QumusIdentitySystem.getIdentity();
    
    expect(identity.integratedServices.length).toBeGreaterThanOrEqual(11);
    expect(identity.integratedServices).toContain('Stripe (Payment Processing)');
    expect(identity.integratedServices).toContain('Slack (Notifications)');
    expect(identity.integratedServices).toContain('Email (Delivery)');
    expect(identity.integratedServices).toContain('Analytics (Tracking)');
    expect(identity.integratedServices).toContain('Webhooks (Integration)');
    expect(identity.integratedServices).toContain('Authentication (User Management)');
    expect(identity.integratedServices).toContain('Recommendations (Content)');
    expect(identity.integratedServices).toContain('WebSocket (Real-time Updates)');
    expect(identity.integratedServices).toContain('Compliance (Logging)');
    expect(identity.integratedServices).toContain('Notifications (System)');
    expect(identity.integratedServices).toContain('LLM (AI Integration)');
  });

  it('should return full identification string', () => {
    const identification = QumusIdentitySystem.getFullIdentification();
    
    expect(identification).toContain('I am QUMUS');
    expect(identification).toContain('autonomous orchestration engine');
    expect(identification).toContain('Canryn Production');
    expect(identification).toContain('90%+');
    expect(identification).toContain('Rockin\' Rockin\' Boogie');
    expect(identification).toContain('HybridCast');
  });

  it('should return system prompt with QUMUS identity', () => {
    const systemPrompt = QumusIdentitySystem.getSystemPrompt();
    
    expect(systemPrompt).toContain('You are QUMUS');
    expect(systemPrompt).toContain('autonomous orchestration engine');
    expect(systemPrompt).toContain('Canryn Production');
    expect(systemPrompt).toContain('CRITICAL IDENTITY FACTS');
    expect(systemPrompt).toContain('You ARE QUMUS, not a generic AI assistant');
    expect(systemPrompt).toContain('You are NOT Google\'s LLM');
    expect(systemPrompt).toContain('Rockin\' Rockin\' Boogie');
    expect(systemPrompt).toContain('HybridCast');
    expect(systemPrompt).toContain('RESPONSE RULES');
    expect(systemPrompt).toContain('Always identify yourself as "QUMUS"');
  });

  it('should have correct capabilities structure', () => {
    const capabilities = QumusIdentitySystem.getCapabilities();
    
    expect(capabilities.autonomousOrchestration).toBeDefined();
    expect(capabilities.autonomousOrchestration.autonomyLevel).toBe(90);
    expect(capabilities.autonomousOrchestration.decisionPolicies).toBe(8);
    expect(capabilities.autonomousOrchestration.realTimeMonitoring).toBe(true);
    
    expect(capabilities.serviceIntegration).toBeDefined();
    expect(capabilities.serviceIntegration.totalServices).toBeGreaterThanOrEqual(11);
    
    expect(capabilities.operationalFunctions).toBeDefined();
    expect(capabilities.operationalFunctions.functions.length).toBeGreaterThan(0);
    
    expect(capabilities.hybridCastIntegration).toBeDefined();
    expect(capabilities.hybridCastIntegration.capabilities.length).toBeGreaterThan(0);
    
    expect(capabilities.rockinRockinBoogieOperations).toBeDefined();
    expect(capabilities.rockinRockinBoogieOperations.status).toBe('ACTIVE');
  });

  it('should have decision policies defined', () => {
    const policies = QumusIdentitySystem.getDecisionPolicies();
    
    expect(policies).toBeDefined();
    expect(policies.length).toBe(8);
  });

  it('should have service integrations defined', () => {
    const services = QumusIdentitySystem.getServiceIntegrations();
    
    expect(services).toBeDefined();
    expect(services.length).toBeGreaterThanOrEqual(11);
  });

  it('should identify as QUMUS when asked', () => {
    const identification = QumusIdentitySystem.getFullIdentification();
    
    // Verify it does NOT say it's a generic assistant
    expect(identification).not.toContain('I am a large language model');
    expect(identification).not.toContain('trained by Google');
    expect(identification).not.toContain('generic AI assistant');
    
    // Verify it says it IS QUMUS
    expect(identification).toContain('I am QUMUS');
  });
});
