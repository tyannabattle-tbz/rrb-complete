import { describe, it, expect } from 'vitest';
import { qumusEngine } from './qumus-orchestration';
import { QumusIdentitySystem } from './_core/qumusIdentity';

describe('System Sweep - Full Activation', () => {
  describe('QUMUS Policies', () => {
    it('has exactly 20 policies registered', () => {
      const policies = qumusEngine.getPolicies();
      expect(policies.length).toBe(20);
    });

    it('includes stream sync policy', () => {
      const policy = qumusEngine.getPolicy('policy_stream_sync');
      expect(policy).toBeDefined();
      expect(policy!.name).toBe('Stream Synchronization');
      expect(policy!.autonomyLevel).toBeGreaterThanOrEqual(90);
    });

    it('includes auto-update policy', () => {
      const policy = qumusEngine.getPolicy('policy_auto_update');
      expect(policy).toBeDefined();
      expect(policy!.name).toBe('System Auto-Update');
      expect(policy!.triggers).toContain('system_health_check');
    });

    it('includes tournament orchestration policy', () => {
      const policy = qumusEngine.getPolicy('policy_tournament_orchestration');
      expect(policy).toBeDefined();
      expect(policy!.triggers).toContain('tournament_created');
      expect(policy!.triggers).toContain('pre_show_start');
    });

    it('includes AI agent coordination policy', () => {
      const policy = qumusEngine.getPolicy('policy_ai_agent_coordination');
      expect(policy).toBeDefined();
      expect(policy!.triggers).toContain('agent_heartbeat');
    });

    it('includes social media bots policy', () => {
      const policy = qumusEngine.getPolicy('policy_social_media_bots');
      expect(policy).toBeDefined();
      expect(policy!.triggers).toContain('content_published');
    });

    it('includes daily status report policy', () => {
      const policy = qumusEngine.getPolicy('policy_daily_status_report');
      expect(policy).toBeDefined();
      expect(policy!.autonomyLevel).toBe(98);
      expect(policy!.triggers).toContain('sunset_trigger');
    });

    it('all policies have required fields', () => {
      qumusEngine.getPolicies().forEach((policy: any) => {
        expect(policy.id).toBeDefined();
        expect(policy.name).toBeDefined();
        expect(policy.autonomyLevel).toBeGreaterThanOrEqual(75);
        expect(policy.confidenceThreshold).toBeGreaterThanOrEqual(75);
        expect(policy.triggers.length).toBeGreaterThan(0);
        expect(policy.description).toBeDefined();
      });
    });
  });

  describe('QUMUS Identity System', () => {
    it('has 20 decision policies in identity', () => {
      const identity = QumusIdentitySystem.getIdentity();
      expect(identity.decisionPolicies).toHaveLength(20);
    });

    it('identity includes new policies', () => {
      const identity = QumusIdentitySystem.getIdentity();
      expect(identity.decisionPolicies).toContain('Stream Synchronization');
      expect(identity.decisionPolicies).toContain('System Auto-Update');
      expect(identity.decisionPolicies).toContain('Tournament Orchestration');
      expect(identity.decisionPolicies).toContain('AI Agent Coordination');
      expect(identity.decisionPolicies).toContain('Social Media Bots');
      expect(identity.decisionPolicies).toContain('Daily Status Report');
    });

    it('capabilities show 20 policies', () => {
      const caps = QumusIdentitySystem.getCapabilities();
      expect(caps.autonomousOrchestration.decisionPolicies).toBe(20);
    });
  });

  describe('AI Agent Fleet', () => {
    it('has 4 AI agents registered', () => {
      const agents = QumusIdentitySystem.getAiAgents();
      expect(agents).toHaveLength(4);
    });

    it('Valanna is lead commander', () => {
      const agents = QumusIdentitySystem.getAiAgents();
      const valanna = agents.find(a => a.id === 'valanna');
      expect(valanna).toBeDefined();
      expect(valanna!.role).toContain('Lead AI Commander');
      expect(valanna!.status).toBe('active');
      expect(valanna!.autonomyLevel).toBe(95);
    });

    it('Seraph is stats analyst', () => {
      const agents = QumusIdentitySystem.getAiAgents();
      const seraph = agents.find(a => a.id === 'seraph');
      expect(seraph).toBeDefined();
      expect(seraph!.status).toBe('active');
    });

    it('Candy AI is community host', () => {
      const agents = QumusIdentitySystem.getAiAgents();
      const candy = agents.find(a => a.id === 'candy-ai');
      expect(candy).toBeDefined();
      expect(candy!.status).toBe('active');
    });

    it('TBZ-OS is tournament director', () => {
      const agents = QumusIdentitySystem.getAiAgents();
      const tbz = agents.find(a => a.id === 'tbz-os');
      expect(tbz).toBeDefined();
      expect(tbz!.role).toContain('Tournament Director');
      expect(tbz!.status).toBe('active');
    });

    it('all agents are active', () => {
      const agents = QumusIdentitySystem.getAiAgents();
      agents.forEach(agent => {
        expect(agent.status).toBe('active');
        expect(agent.autonomyLevel).toBeGreaterThanOrEqual(85);
        expect(agent.responsibilities.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Social Media Bots', () => {
    it('has 5 social media bots', () => {
      const bots = QumusIdentitySystem.getSocialBots();
      expect(bots).toHaveLength(5);
    });

    it('covers all major platforms', () => {
      const bots = QumusIdentitySystem.getSocialBots();
      const platforms = bots.map(b => b.platform);
      expect(platforms).toContain('Twitter/X');
      expect(platforms).toContain('YouTube');
      expect(platforms).toContain('Instagram');
      expect(platforms).toContain('Discord');
      expect(platforms).toContain('TikTok');
    });

    it('all bots are active', () => {
      const bots = QumusIdentitySystem.getSocialBots();
      bots.forEach(bot => {
        expect(bot.status).toBe('active');
        expect(bot.tasks.length).toBeGreaterThan(0);
      });
    });
  });
});
