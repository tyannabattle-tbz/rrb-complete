/**
 * QUMUS Complete Integration Tests
 * 
 * Tests for WebSocket manager, admin dashboard backend, and analytics engine
 */

import { describe, it, expect, beforeEach } from "vitest";
import { websocketManager, WebSocketEventType } from "./qumus/websocketManager";
import { analyticsEngine } from "./qumus/decisionAnalytics";

describe("QUMUS Complete Integration", () => {
  beforeEach(() => {
    // Reset state before each test
    websocketManager.shutdown();
  });

  describe("WebSocket Manager", () => {
    it("should register and unregister clients", () => {
      const client = websocketManager.registerClient("client-1", 1);

      expect(client.id).toBe("client-1");
      expect(client.userId).toBe(1);
      expect(client.isConnected).toBe(true);

      websocketManager.unregisterClient("client-1");
      expect(websocketManager.getClient("client-1")).toBeUndefined();
    });

    it("should manage subscriptions", () => {
      websocketManager.registerClient("client-1", 1);

      const subscribed = websocketManager.subscribe("client-1", WebSocketEventType.DECISION_MADE);
      expect(subscribed).toBe(true);

      const client = websocketManager.getClient("client-1");
      expect(client?.subscriptions.has(WebSocketEventType.DECISION_MADE)).toBe(true);

      const unsubscribed = websocketManager.unsubscribe("client-1", WebSocketEventType.DECISION_MADE);
      expect(unsubscribed).toBe(true);
      expect(client?.subscriptions.has(WebSocketEventType.DECISION_MADE)).toBe(false);
    });

    it("should broadcast events to subscribed clients", () => {
      websocketManager.registerClient("client-1", 1);
      websocketManager.registerClient("client-2", 2);

      websocketManager.subscribe("client-1", WebSocketEventType.DECISION_MADE);
      websocketManager.subscribe("client-2", WebSocketEventType.LISTENER_UPDATE);

      let decisionEvent = false;
      let listenerEvent = false;

      websocketManager.on(`client:client-1`, (event) => {
        if (event.type === WebSocketEventType.DECISION_MADE) {
          decisionEvent = true;
        }
      });

      websocketManager.on(`client:client-2`, (event) => {
        if (event.type === WebSocketEventType.LISTENER_UPDATE) {
          listenerEvent = true;
        }
      });

      websocketManager.broadcastDecisionMade("dec-1", "policy-1", "high", ["platform-1"]);
      websocketManager.broadcastListenerUpdate("platform-1", 1000, 50);

      expect(decisionEvent).toBe(true);
      expect(listenerEvent).toBe(true);
    });

    it("should track event history", () => {
      websocketManager.broadcastDecisionMade("dec-1", "policy-1", "high", ["platform-1"]);
      websocketManager.broadcastListenerUpdate("platform-1", 1000, 50);

      const history = websocketManager.getEventHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);

      const decisionEvents = websocketManager.getEventHistory(WebSocketEventType.DECISION_MADE);
      expect(decisionEvents.length).toBeGreaterThanOrEqual(1);
    });

    it("should get statistics", () => {
      websocketManager.registerClient("client-1", 1);
      websocketManager.registerClient("client-2", 2);

      websocketManager.subscribe("client-1", WebSocketEventType.DECISION_MADE);
      websocketManager.subscribe("client-1", WebSocketEventType.LISTENER_UPDATE);
      websocketManager.subscribe("client-2", WebSocketEventType.DECISION_MADE);

      const stats = websocketManager.getStatistics();

      expect(stats.totalClients).toBe(2);
      expect(stats.connectedClients).toBe(2);
      expect(stats.subscriptions[WebSocketEventType.DECISION_MADE]).toBe(2);
      expect(stats.subscriptions[WebSocketEventType.LISTENER_UPDATE]).toBe(1);
    });

    it("should handle heartbeat updates", async () => {
      websocketManager.registerClient("client-1", 1);

      const client = websocketManager.getClient("client-1");
      const initialHeartbeat = client?.lastHeartbeat.getTime() || 0;

      await new Promise((resolve) => setTimeout(resolve, 10));
      
      websocketManager.updateHeartbeat("client-1");
      const updatedClient = websocketManager.getClient("client-1");
      const updatedHeartbeat = updatedClient?.lastHeartbeat.getTime() || 0;
      
      expect(updatedHeartbeat).toBeGreaterThanOrEqual(initialHeartbeat);
    });
  });

  describe("Decision Analytics Engine", () => {
    it("should predict decision outcomes", () => {
      const prediction = analyticsEngine.predictDecisionOutcome("emergency_broadcast", {
        urgency: "high",
        affectedPlatforms: ["platform-1", "platform-2"],
        historicalSuccessRate: 95,
      });

      expect(prediction.prediction).toBeDefined();
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThanOrEqual(100);
      expect(prediction.factors).toBeDefined();
    });

    it("should record decision outcomes", () => {
      analyticsEngine.recordDecisionOutcome(
        "dec-1",
        "emergency_broadcast",
        "success",
        "success",
        95,
        { urgency: 10 }
      );

      const history = analyticsEngine.getDecisionOutcomeHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history.some((h) => h.decisionId === "dec-1")).toBe(true);
    });

    it("should calculate policy effectiveness scores", () => {
      const score = analyticsEngine.getPolicyEffectivenessScore("emergency_broadcast");

      expect(score).toBeDefined();
      expect(score?.effectiveness).toBeGreaterThan(0);
      expect(score?.effectiveness).toBeLessThanOrEqual(100);
      expect(score?.successRate).toBeGreaterThanOrEqual(0);
      expect(score?.avgAutonomy).toBeGreaterThanOrEqual(0);
    });

    it("should get all policy effectiveness scores", () => {
      const scores = analyticsEngine.getAllPolicyEffectivenessScores();

      expect(scores.length).toBeGreaterThan(0);
      expect(scores.every((s) => s.policyId)).toBe(true);
      expect(scores.every((s) => s.effectiveness >= 0)).toBe(true);
    });

    it("should detect anomalies", () => {
      const anomaly = analyticsEngine.detectAnomalies("dec-1", "content_scheduling", {
        urgency: "low",
      }, "failure");

      expect(anomaly.decisionId).toBe("dec-1");
      expect(anomaly.anomalyScore).toBeGreaterThanOrEqual(0);
      expect(anomaly.anomalyScore).toBeLessThanOrEqual(100);
      expect(anomaly.severity).toBeDefined();
    });

    it("should generate policy recommendations", () => {
      const recommendations = analyticsEngine.generatePolicyRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
      if (recommendations.length > 0) {
        expect(recommendations[0].policyId).toBeDefined();
        expect(recommendations[0].recommendation).toBeDefined();
        expect(recommendations[0].expectedImprovement).toBeGreaterThanOrEqual(0);
        expect(recommendations[0].confidence).toBeGreaterThanOrEqual(0);
      }
    });

    it("should calculate prediction accuracy", () => {
      analyticsEngine.recordDecisionOutcome(
        "dec-1",
        "emergency_broadcast",
        "success",
        "success",
        95,
        {}
      );

      analyticsEngine.recordDecisionOutcome(
        "dec-2",
        "content_scheduling",
        "failure",
        "success",
        80,
        {}
      );

      const accuracy = analyticsEngine.calculatePredictionAccuracy();

      expect(accuracy).toBeGreaterThanOrEqual(0);
      expect(accuracy).toBeLessThanOrEqual(100);
    });

    it("should get policy comparison metrics", () => {
      const comparison = analyticsEngine.getPolicyComparison();

      expect(comparison.bestPerforming).toBeDefined();
      expect(comparison.worstPerforming).toBeDefined();
      expect(comparison.average).toBeDefined();
      expect(comparison.average.effectiveness).toBeGreaterThanOrEqual(0);
      expect(comparison.improvingCount).toBeGreaterThanOrEqual(0);
      expect(comparison.decliningCount).toBeGreaterThanOrEqual(0);
    });

    it("should get analytics summary", () => {
      const summary = analyticsEngine.getAnalyticsSummary();

      expect(summary.totalDecisions).toBeGreaterThanOrEqual(0);
      expect(summary.predictionAccuracy).toBeGreaterThanOrEqual(0);
      expect(summary.policyCount).toBeGreaterThan(0);
      expect(Array.isArray(summary.policies)).toBe(true);
      expect(Array.isArray(summary.recommendations)).toBe(true);
      expect(summary.comparison).toBeDefined();
    });

    it("should export analytics data as JSON", () => {
      const exported = analyticsEngine.exportAnalyticsData();

      expect(typeof exported).toBe("string");
      const parsed = JSON.parse(exported);
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.summary).toBeDefined();
      expect(parsed.decisionHistory).toBeDefined();
    });
  });

  describe("End-to-End Integration", () => {
    it("should integrate WebSocket and analytics", () => {
      // Setup WebSocket
      websocketManager.registerClient("client-1", 1);
      websocketManager.subscribe("client-1", WebSocketEventType.DECISION_MADE);

      // Make prediction
      const prediction = analyticsEngine.predictDecisionOutcome("emergency_broadcast", {
        urgency: "high",
      });

      // Record outcome
      analyticsEngine.recordDecisionOutcome(
        "dec-1",
        "emergency_broadcast",
        prediction.prediction as "success" | "failure" | "partial",
        prediction.prediction as "success" | "failure" | "partial",
        prediction.confidence,
        prediction.factors
      );

      // Broadcast event
      websocketManager.broadcastDecisionMade("dec-1", "emergency_broadcast", "high", [
        "platform-1",
      ]);

      // Verify
      const history = websocketManager.getEventHistory(WebSocketEventType.DECISION_MADE);
      expect(history.length).toBeGreaterThan(0);

      const outcomeHistory = analyticsEngine.getDecisionOutcomeHistory();
      expect(outcomeHistory.length).toBeGreaterThan(0);
    });

    it("should handle complete decision workflow with analytics", () => {
      // 1. Register client
      websocketManager.registerClient("admin-1", 1);
      websocketManager.subscribe("admin-1", WebSocketEventType.DECISION_MADE);
      websocketManager.subscribe("admin-1", WebSocketEventType.PROPAGATION_COMPLETE);

      // 2. Predict decision
      const prediction = analyticsEngine.predictDecisionOutcome("content_scheduling", {
        urgency: "medium",
        affectedPlatforms: ["content_manager", "analytics"],
      });

      // 3. Record outcome
      analyticsEngine.recordDecisionOutcome(
        "dec-workflow",
        "content_scheduling",
        "success",
        prediction.prediction as "success" | "failure" | "partial",
        prediction.confidence,
        prediction.factors
      );

      // 4. Broadcast events
      websocketManager.broadcastDecisionMade("dec-workflow", "content_scheduling", "medium", [
        "content_manager",
        "analytics",
      ]);

      websocketManager.broadcastPropagationComplete("dec-workflow", 2, 2, 0);

      // 5. Get analytics
      const summary = analyticsEngine.getAnalyticsSummary();

      // 6. Verify
      expect(summary.totalDecisions).toBeGreaterThan(0);
      expect(websocketManager.getEventHistory().length).toBeGreaterThan(0);
    });
  });
});
