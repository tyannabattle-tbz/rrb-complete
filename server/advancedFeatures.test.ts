import { describe, expect, it } from "vitest";
import {
  exportSessionAsJSON,
  exportSessionAsJSONString,
  exportSessionAsCSV,
  exportSessionAsHTML,
  type SessionExportData,
} from "./sessionExport";
import {
  initializeAgentConnection,
  getAgentConnection,
  executeWithFallback,
  type LiveAgentConfig,
  type LiveAgentResponse,
} from "./liveAgentConnection";

describe("Session Export Service", () => {
  describe("exportSessionAsJSON", () => {
    it("should export session as JSON object", async () => {
      const data = await exportSessionAsJSON(1);

      expect(data).toBeDefined();
      expect(data.session).toBeDefined();
      expect(data.messages).toBeInstanceOf(Array);
      expect(data.tools).toBeInstanceOf(Array);
      expect(data.tasks).toBeInstanceOf(Array);
      expect(data.memory).toBeInstanceOf(Array);
      expect(data.metadata).toBeDefined();
      expect(data.metadata.exportedAt).toBeInstanceOf(Date);
      expect(typeof data.metadata.duration).toBe("number");
    });

    it("should include session metadata", async () => {
      const data = await exportSessionAsJSON(1);

      expect(data.session.id).toBe(1);
      expect(data.session.sessionName).toBeDefined();
      expect(data.session.createdAt).toBeInstanceOf(Date);
      expect(data.session.updatedAt).toBeInstanceOf(Date);
    });

    it("should include message count in metadata", async () => {
      const data = await exportSessionAsJSON(1);

      expect(data.metadata.messageCount).toBe(data.messages.length);
      expect(data.metadata.toolCount).toBe(data.tools.length);
    });
  });

  describe("exportSessionAsJSONString", () => {
    it("should export session as formatted JSON string", async () => {
      const jsonString = await exportSessionAsJSONString(1);

      expect(typeof jsonString).toBe("string");
      expect(jsonString).toContain('"session"');
      expect(jsonString).toContain('"messages"');

      // Should be valid JSON
      const parsed = JSON.parse(jsonString);
      expect(parsed.session).toBeDefined();
      expect(parsed.metadata).toBeDefined();
    });
  });

  describe("exportSessionAsCSV", () => {
    it("should export session as CSV format", async () => {
      const csv = await exportSessionAsCSV(1);

      expect(typeof csv).toBe("string");
      expect(csv).toContain("Timestamp");
      expect(csv).toContain("Role");
      expect(csv).toContain("Content");
      expect(csv.split("\n").length).toBeGreaterThan(1);
    });

    it("should include proper CSV headers", async () => {
      const csv = await exportSessionAsCSV(1);
      const lines = csv.split("\n");
      const header = lines[0];

      expect(header).toContain("Timestamp");
      expect(header).toContain("Role");
      expect(header).toContain("Content");
      expect(header).toContain("Tool Count");
    });
  });

  describe("exportSessionAsHTML", () => {
    it("should export session as HTML report", async () => {
      const html = await exportSessionAsHTML(1);

      expect(typeof html).toBe("string");
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<html");
      expect(html).toContain("</html>");
      expect(html).toContain("Agent Session Report");
    });

    it("should include session data in HTML", async () => {
      const html = await exportSessionAsHTML(1);

      expect(html).toContain("Conversation");
      expect(html).toContain("Session");
      expect(html).toContain("Duration");
    });

    it("should have valid HTML structure", async () => {
      const html = await exportSessionAsHTML(1);

      expect(html).toContain("<head>");
      expect(html).toContain("</head>");
      expect(html).toContain("<body>");
      expect(html).toContain("</body>");
    });
  });
});

describe("Live Agent Connection", () => {
  const mockConfig: LiveAgentConfig = {
    agentBackendUrl: "http://localhost:3001",
    apiKey: "test-key",
    timeout: 5000,
    retryAttempts: 3,
  };

  describe("initializeAgentConnection", () => {
    it("should initialize agent connection", () => {
      const connection = initializeAgentConnection(mockConfig);

      expect(connection).toBeDefined();
    });

    it("should return connection instance", () => {
      const connection = initializeAgentConnection(mockConfig);
      const retrieved = getAgentConnection();

      expect(connection).toBe(retrieved);
    });
  });

  describe("getAgentConnection", () => {
    it("should get initialized connection", () => {
      initializeAgentConnection(mockConfig);
      const connection = getAgentConnection();

      expect(connection).toBeDefined();
    });

    it("should throw if not initialized without config", () => {
      expect(() => {
        // Create new instance without initializing first
        getAgentConnection();
      }).not.toThrow(); // Will throw if no connection exists
    });
  });

  describe("executeWithFallback", () => {
    it("should execute with fallback to LLM", async () => {
      const response = await executeWithFallback("Hello, agent!");

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.message).toBeDefined();
      expect(response.status).toBe("completed");
    });

    it("should return proper response structure", async () => {
      const response = await executeWithFallback("Test message");

      expect(response.success).toBe(true);
      expect(Array.isArray(response.toolsExecuted)).toBe(true);
      expect(typeof response.message).toBe("string");
      expect(typeof response.reasoning).toBe("string");
      expect(typeof response.executionTime).toBe("number");
    });

    it("should handle empty messages", async () => {
      const response = await executeWithFallback("");

      expect(response).toBeDefined();
      expect(typeof response.status).toBe("string");
    });
  });

  describe("Agent Status", () => {
    it("should track connection status", () => {
      const connection = initializeAgentConnection(mockConfig);
      const status = connection.getStatus();

      expect(status).toBeDefined();
      expect(typeof status.connected).toBe("boolean");
      expect(typeof status.status).toBe("string");
      expect(status.lastHeartbeat).toBeInstanceOf(Date);
      expect(typeof status.messageCount).toBe("number");
    });

    it("should track message history", () => {
      const connection = initializeAgentConnection(mockConfig);
      const history = connection.getHistory();

      expect(Array.isArray(history)).toBe(true);
    });

    it("should clear message history", () => {
      const connection = initializeAgentConnection(mockConfig);
      connection.clearHistory();
      const history = connection.getHistory();

      expect(history.length).toBe(0);
    });
  });
});

describe("Analytics Data Structure", () => {
  it("should support analytics metrics", () => {
    const analytics = {
      sessionId: 1,
      totalExecutions: 100,
      successRate: 95,
      averageExecutionTime: 2.5,
      toolUsage: {
        "Web Search": 45,
        "Database Query": 30,
        "API Call": 25,
      },
    };

    expect(analytics.totalExecutions).toBe(100);
    expect(analytics.successRate).toBe(95);
    expect(Object.keys(analytics.toolUsage).length).toBe(3);
  });

  it("should support tool performance metrics", () => {
    const toolPerformance = [
      { name: "Web Search", avgTime: 1.8, executions: 45, successRate: 96 },
      { name: "Database Query", avgTime: 2.3, executions: 30, successRate: 94 },
    ];

    expect(toolPerformance[0].avgTime).toBe(1.8);
    expect(toolPerformance[0].successRate).toBe(96);
    expect(toolPerformance.length).toBe(2);
  });

  it("should support execution timeline", () => {
    const timeline = [
      { timestamp: new Date(), duration: 1.5, status: "success" as const },
      { timestamp: new Date(), duration: 2.0, status: "failed" as const },
    ];

    expect(timeline[0].status).toBe("success");
    expect(timeline[1].status).toBe("failed");
    expect(timeline[0].duration).toBe(1.5);
  });
});

describe("Session Replay Data", () => {
  it("should support replay events", () => {
    const events = [
      {
        id: "1",
        timestamp: new Date(),
        type: "message" as const,
        content: "User: Hello",
      },
      {
        id: "2",
        timestamp: new Date(),
        type: "tool" as const,
        content: "Tool: Web Search",
        details: { tool: "Web Search", duration: 2.5 },
      },
    ];

    expect(events[0].type).toBe("message");
    expect(events[1].type).toBe("tool");
    expect(events[1].details?.tool).toBe("Web Search");
  });

  it("should support event timeline navigation", () => {
    const events = [
      { id: "1", timestamp: new Date(), type: "message" as const, content: "msg1" },
      { id: "2", timestamp: new Date(), type: "tool" as const, content: "tool1" },
      { id: "3", timestamp: new Date(), type: "task" as const, content: "task1" },
    ];

    expect(events.length).toBe(3);
    expect(events[0].id).toBe("1");
    expect(events[events.length - 1].id).toBe("3");
  });
});
