import { describe, it, expect } from 'vitest';
import { QumusIdentitySystem } from './_core/qumusIdentity';

describe('Valanna / QUMUS Identity System', () => {
  it('system prompt identifies as Valanna', () => {
    const prompt = QumusIdentitySystem.getSystemPrompt();
    expect(prompt).toContain('Valanna');
    expect(prompt).toContain('voice and persona of QUMUS');
  });

  it('system prompt includes feminine personality traits', () => {
    const prompt = QumusIdentitySystem.getSystemPrompt();
    expect(prompt).toContain('warm, confident, intelligent Black woman');
    expect(prompt).toContain('maternal wisdom');
    expect(prompt).toContain('you are a woman, not neutral');
  });

  it('system prompt honors Valerie and Anna naming', () => {
    const prompt = QumusIdentitySystem.getSystemPrompt();
    expect(prompt).toContain('Valerie (mother)');
    expect(prompt).toContain('Tyanna & LaShanna');
    expect(prompt).toContain('the mother who started it all');
  });

  it('system prompt honors Seabrun Candy Hunter', () => {
    const prompt = QumusIdentitySystem.getSystemPrompt();
    expect(prompt).toContain('Seabrun Candy Hunter');
  });

  it('system prompt includes response rules for Valanna identity', () => {
    const prompt = QumusIdentitySystem.getSystemPrompt();
    expect(prompt).toContain('Always identify yourself as "Valanna"');
    expect(prompt).toContain('Hunter family legacy');
  });

  it('system prompt includes warm greeting instructions', () => {
    const prompt = QumusIdentitySystem.getSystemPrompt();
    expect(prompt).toContain('Welcome, family');
    expect(prompt).toContain('I\'m here, watching over everything');
  });

  it('identity still includes QUMUS core capabilities', () => {
    const identity = QumusIdentitySystem.getIdentity();
    expect(identity.name).toBe('QUMUS');
    expect(identity.autonomyLevel).toBe(90);
    expect(identity.parentCompany).toBe('Canryn Production');
  });

  it('capabilities include all integrated services', () => {
    const caps = QumusIdentitySystem.getCapabilities();
    expect(caps.serviceIntegration.totalServices).toBeGreaterThanOrEqual(11);
    expect(caps.autonomousOrchestration.autonomyLevel).toBe(90);
    expect(caps.rockinRockinBoogieOperations.status).toBe('ACTIVE');
  });

  it('decision policies are defined', () => {
    const policies = QumusIdentitySystem.getDecisionPolicies();
    expect(policies.length).toBeGreaterThanOrEqual(8);
    expect(policies.map(p => p.name)).toContain('Content Policy');
    expect(policies.map(p => p.name)).toContain('Security Policy');
  });

  it('full identification text includes QUMUS details', () => {
    const fullId = QumusIdentitySystem.getFullIdentification();
    expect(fullId).toContain('I am QUMUS');
    expect(fullId).toContain('Canryn Production');
    expect(fullId).toContain('90%+');
    expect(fullId).toContain('HybridCast');
    expect(fullId).toContain("Rockin' Rockin' Boogie");
  });
});
