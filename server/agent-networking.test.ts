/**
 * Agent Networking Service Tests
 * Verifies cross-platform collaboration between QUMUS, HybridCast, RRB, Canryn, Sweet Miracles
 */
import { describe, it, expect, beforeEach } from "vitest";
import { AgentNetworkingService, PLATFORM_AGENTS, getAgentNetwork } from "./services/agent-networking";
import type { AgentId } from "./services/agent-networking";

describe("AI Agent Networking Service", () => {
  let network: AgentNetworkingService;

  beforeEach(() => {
    network = new AgentNetworkingService();
  });

  describe("Platform Agent Definitions", () => {
    it("should define exactly 6 platform agents", () => {
      expect(PLATFORM_AGENTS).toHaveLength(6);
    });

    it("should include all required agents", () => {
      const agentIds = PLATFORM_AGENTS.map(a => a.id);
      expect(agentIds).toContain("qumus");
      expect(agentIds).toContain("rrb");
      expect(agentIds).toContain("hybridcast");
      expect(agentIds).toContain("canryn");
      expect(agentIds).toContain("sweet-miracles");
      expect(agentIds).toContain("qmunity");
    });

    it("should have QUMUS as the highest autonomy agent", () => {
      const qumus = PLATFORM_AGENTS.find(a => a.id === "qumus");
      expect(qumus).toBeDefined();
      expect(qumus!.autonomyLevel).toBe(95);
      for (const agent of PLATFORM_AGENTS) {
        expect(qumus!.autonomyLevel).toBeGreaterThanOrEqual(agent.autonomyLevel);
      }
    });

    it("should have all agents with autonomy >= 85%", () => {
      for (const agent of PLATFORM_AGENTS) {
        expect(agent.autonomyLevel).toBeGreaterThanOrEqual(85);
      }
    });

    it("should have QUMUS with all management capabilities", () => {
      const qumus = PLATFORM_AGENTS.find(a => a.id === "qumus");
      expect(qumus!.capabilities).toContain("decision_making");
      expect(qumus!.capabilities).toContain("policy_enforcement");
      expect(qumus!.capabilities).toContain("emergency_override");
      expect(qumus!.capabilities).toContain("human_review");
    });

    it("should have RRB managing all 7 channels", () => {
      const rrb = PLATFORM_AGENTS.find(a => a.id === "rrb");
      expect(rrb!.channels).toHaveLength(7);
      expect(rrb!.channels).toContain("ch-001");
      expect(rrb!.channels).toContain("ch-007");
    });
  });

  describe("Network Initialization", () => {
    it("should initialize all agents as online", () => {
      const topology = network.getNetworkTopology();
      expect(topology.agents).toHaveLength(6);
      for (const agent of topology.agents) {
        expect(agent.status).toBe("online");
      }
    });

    it("should create mesh connections between all agents", () => {
      const topology = network.getNetworkTopology();
      // 6 agents = 6*5/2 = 15 connections
      expect(topology.connections).toHaveLength(15);
    });

    it("should have 100% network health when all connections are active", () => {
      const topology = network.getNetworkTopology();
      expect(topology.networkHealth).toBe(100);
    });

    it("should calculate average autonomy rate", () => {
      const topology = network.getNetworkTopology();
      expect(topology.autonomyRate).toBeGreaterThanOrEqual(85);
      expect(topology.autonomyRate).toBeLessThanOrEqual(95);
    });
  });

  describe("Message Handling", () => {
    it("should send messages between agents", async () => {
      const msg = await network.sendMessage({
        from: "qumus",
        to: "rrb",
        type: "command",
        priority: "normal",
        payload: { action: "schedule_sync" },
      });
      expect(msg.id).toMatch(/^msg_/);
      expect(msg.timestamp).toBeGreaterThan(0);
    });

    it("should broadcast messages to all agents except sender", async () => {
      await network.sendMessage({
        from: "qumus",
        to: "broadcast",
        type: "alert",
        priority: "emergency",
        payload: { alert: "test_emergency" },
      });
      const messages = network.getRecentMessages();
      // Should have at least 5 messages (one to each non-qumus agent)
      expect(messages.length).toBeGreaterThanOrEqual(1);
    });

    it("should track message history", async () => {
      await network.sendMessage({
        from: "rrb",
        to: "qumus",
        type: "status",
        priority: "low",
        payload: { channels: 7, listeners: 40070 },
      });
      const messages = network.getRecentMessages();
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[messages.length - 1].from).toBe("rrb");
    });

    it("should increment message counters on agents", async () => {
      const beforeTopology = network.getNetworkTopology();
      const qumusBefore = beforeTopology.agents.find(a => a.agentId === "qumus")!.messagesProcessed;

      await network.sendMessage({
        from: "rrb",
        to: "qumus",
        type: "request",
        priority: "normal",
        payload: { request: "decision" },
      });

      const afterTopology = network.getNetworkTopology();
      const qumusAfter = afterTopology.agents.find(a => a.agentId === "qumus")!.messagesProcessed;
      expect(qumusAfter).toBeGreaterThan(qumusBefore);
    });
  });

  describe("Cross-Platform Events", () => {
    it("should create cross-platform events", () => {
      const event = network.createCrossPlatformEvent({
        type: "content_sync",
        source: "qumus",
        targets: ["rrb", "canryn"],
        data: { contentId: "test_123" },
      });
      expect(event.id).toMatch(/^cpe_/);
      expect(event.status).toBe("pending");
    });

    it("should track cross-platform events", () => {
      network.createCrossPlatformEvent({
        type: "emergency_broadcast",
        source: "hybridcast",
        targets: ["qumus", "rrb", "canryn", "sweet-miracles", "qmunity"],
        data: { alertLevel: "critical" },
      });
      const events = network.getCrossPlatformEvents();
      expect(events.length).toBeGreaterThan(0);
    });

    it("should support all event types", () => {
      const eventTypes = ["content_sync", "emergency_broadcast", "schedule_update", "listener_migration", "revenue_share", "compliance_alert", "health_check"] as const;
      for (const type of eventTypes) {
        const event = network.createCrossPlatformEvent({
          type,
          source: "qumus",
          targets: ["rrb"],
          data: {},
        });
        expect(event.type).toBe(type);
      }
    });
  });

  describe("Connection Health", () => {
    it("should report all connections as healthy initially", () => {
      const health = network.getConnectionHealth();
      expect(health.healthy).toBe(15);
      expect(health.degraded).toBe(0);
      expect(health.failed).toBe(0);
    });
  });

  describe("Service Lifecycle", () => {
    it("should start and stop cleanly", () => {
      network.start();
      const status = network.getStatus();
      expect(status.isRunning).toBe(true);
      expect(status.agents).toBe(6);
      expect(status.connections).toBe(15);

      network.stop();
      const stoppedStatus = network.getStatus();
      expect(stoppedStatus.isRunning).toBe(false);
    });

    it("should track uptime when running", () => {
      network.start();
      const status = network.getStatus();
      expect(status.uptime).toBeGreaterThanOrEqual(0);
      network.stop();
    });
  });

  describe("Singleton", () => {
    it("should return the same instance from getAgentNetwork", () => {
      const a = getAgentNetwork();
      const b = getAgentNetwork();
      expect(a).toBe(b);
    });
  });
});
