import { describe, it, expect } from 'vitest';
import { QumusCompleteEngine } from './qumus-complete-engine';
import { AgentNetworkingService, getAgentNetwork } from './services/agent-networking';
import { ContentSchedulerService, getContentScheduler } from './services/contentSchedulerService';

describe('State of the Studio — Ecosystem Bridge', () => {
  describe('QUMUS Engine Integration', () => {
    it('should return system health data', async () => {
      const health = await QumusCompleteEngine.getSystemHealth();
      expect(health).toBeDefined();
      expect(health.status).toBe('healthy');
      expect(health.totalDecisions).toBeGreaterThanOrEqual(0);
      expect(typeof health.autonomyPercentage).toBe('number');
    });

    it('should return all 8 active policies via getAllMetrics', async () => {
      const metrics = await QumusCompleteEngine.getAllMetrics();
      expect(metrics.length).toBe(8);
    });

    it('should return policy recommendations', async () => {
      const recs = await QumusCompleteEngine.getPolicyRecommendations();
      expect(Array.isArray(recs)).toBe(true);
    });
  });

  describe('Agent Networking Service', () => {
    let network: AgentNetworkingService;

    it('should have 6 agents registered', () => {
      network = getAgentNetwork();
      const topology = network.getNetworkTopology();
      expect(topology.agents.length).toBe(6);
    });

    it('should include all ecosystem entities', () => {
      network = getAgentNetwork();
      const topology = network.getNetworkTopology();
      const agentIds = topology.agents.map((a: any) => a.agentId);
      expect(agentIds).toContain('qumus');
      expect(agentIds).toContain('rrb');
      expect(agentIds).toContain('hybridcast');
      expect(agentIds).toContain('canryn');
      expect(agentIds).toContain('sweet-miracles');
      expect(agentIds).toContain('qmunity');
    });

    it('should have QUMUS as central brain with highest autonomy', () => {
      network = getAgentNetwork();
      const topology = network.getNetworkTopology();
      const qumus = topology.agents.find((a: any) => a.agentId === 'qumus');
      expect(qumus).toBeDefined();
      expect(qumus!.name).toBe('QUMUS Central Brain');
      expect(qumus!.autonomyLevel).toBeGreaterThanOrEqual(90);
    });

    it('should have mesh connections between agents', () => {
      network = getAgentNetwork();
      const topology = network.getNetworkTopology();
      expect(topology.connections.length).toBeGreaterThan(0);
    });

    it('should report connection health', () => {
      network = getAgentNetwork();
      const health = network.getConnectionHealth();
      expect(health.healthy).toBeGreaterThan(0);
      expect(health.degraded).toBeGreaterThanOrEqual(0);
      expect(health.failed).toBeGreaterThanOrEqual(0);
    });

    it('should report network status', () => {
      network = getAgentNetwork();
      const status = network.getStatus();
      expect(status.agents).toBe(6);
      expect(status.connections).toBeGreaterThan(0);
    });

    it('should support message retrieval', () => {
      network = getAgentNetwork();
      const messages = network.getRecentMessages(10);
      expect(Array.isArray(messages)).toBe(true);
    });

    it('should support cross-platform event retrieval', () => {
      network = getAgentNetwork();
      const events = network.getCrossPlatformEvents(10);
      expect(Array.isArray(events)).toBe(true);
    });

    it('should have agent names matching the ecosystem', () => {
      network = getAgentNetwork();
      const topology = network.getNetworkTopology();
      const names = topology.agents.map((a: any) => a.name);
      expect(names).toContain('QUMUS Central Brain');
      expect(names).toContain("Rockin' Rockin' Boogie");
      expect(names).toContain('HybridCast Emergency Broadcast');
      expect(names).toContain('Canryn Production');
      expect(names).toContain('Sweet Miracles');
      expect(names).toContain('QumUnity');
    });
  });

  describe('Content Scheduler — 7-Channel Network', () => {
    let scheduler: ContentSchedulerService;

    it('should have 7 channels defined', () => {
      scheduler = getContentScheduler();
      const channels = scheduler.getChannels();
      expect(channels.length).toBe(7);
    });

    it('should have stream URLs for all channels', () => {
      scheduler = getContentScheduler();
      const channels = scheduler.getChannels();
      channels.forEach((ch: any) => {
        expect(ch.streamUrl).toBeDefined();
        expect(ch.streamUrl.length).toBeGreaterThan(0);
      });
    });

    it('should have correct genre channels', () => {
      scheduler = getContentScheduler();
      const channels = scheduler.getChannels();
      const genres = channels.map((ch: any) => ch.genre);
      expect(genres).toContain('blues');
      expect(genres).toContain('jazz');
      expect(genres).toContain('soul');
      expect(genres).toContain('gospel');
      expect(genres).toContain('funk');
    });

    it('should have schedule slots', () => {
      scheduler = getContentScheduler();
      const schedule = scheduler.getScheduleSlots();
      expect(schedule.length).toBeGreaterThan(0);
    });

    it('should return scheduler status', () => {
      scheduler = getContentScheduler();
      const status = scheduler.getStatus();
      expect(status).toBeDefined();
      expect(typeof status.isRunning).toBe('boolean');
    });
  });

  describe('Legacy Bridge — Past, Protection, Presentation, Preservation', () => {
    it('should have all agents online for ecosystem continuity', () => {
      const network = getAgentNetwork();
      const topology = network.getNetworkTopology();
      const onlineAgents = topology.agents.filter((a: any) => a.status === 'online');
      expect(onlineAgents.length).toBe(6);
    });

    it('should maintain 90%+ network health', () => {
      const network = getAgentNetwork();
      const topology = network.getNetworkTopology();
      expect(topology.networkHealth).toBeGreaterThanOrEqual(90);
    });

    it('should maintain 85%+ autonomy rate', () => {
      const network = getAgentNetwork();
      const topology = network.getNetworkTopology();
      expect(topology.autonomyRate).toBeGreaterThanOrEqual(85);
    });
  });
});
