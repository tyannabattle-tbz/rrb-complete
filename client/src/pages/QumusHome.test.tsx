/**
 * QUMUS Home Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import QumusHome from "./QumusHome";
import { trpc } from "@/lib/trpc";

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    autonomousTask: {
      getStatus: {
        useQuery: vi.fn(),
      },
      getActivePlans: {
        useQuery: vi.fn(),
      },
      getCommandHistory: {
        useQuery: vi.fn(),
      },
      getSuccessRate: {
        useQuery: vi.fn(),
      },
      getLearnings: {
        useQuery: vi.fn(),
      },
      submitTask: {
        useMutation: vi.fn(),
      },
      submitEcosystemCommand: {
        useMutation: vi.fn(),
      },
    },
  },
}));

// Mock useAuth
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "1", name: "Test User" },
    isAuthenticated: true,
    loading: false,
  }),
}));

describe("QumusHome Component", () => {
  beforeEach(() => {
    // Mock successful queries
    vi.mocked(trpc.autonomousTask.getStatus.useQuery).mockReturnValue({
      data: {
        qumusStatus: {
          isActive: true,
          activationTime: "2026-02-25T23:07:35.781Z",
          config: {
            maxConcurrentTasks: 20,
            enableAutoScheduling: true,
            enableSelfImprovement: true,
            enableMultiAgentCoordination: true,
            enablePredictiveAnalytics: true,
          },
        },
        agent: {
          isRunning: true,
          queueLength: 5,
          toolCount: 10,
          policyCount: 8,
        },
        ecosystem: {
          totalCommands: 42,
          completedCommands: 40,
          failedCommands: 2,
        },
        memory: {
          factCount: 150,
          experienceCount: 75,
          contextSize: 2048,
        },
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(trpc.autonomousTask.getActivePlans.useQuery).mockReturnValue({
      data: {
        plans: [
          {
            id: "plan-1",
            goalId: "goal-1",
            stepCount: 5,
            estimatedDuration: 30,
            status: "active",
            confidence: 0.95,
          },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(trpc.autonomousTask.getCommandHistory.useQuery).mockReturnValue({
      data: {
        commands: [
          {
            id: "cmd-1",
            target: "rrb",
            action: "schedule_broadcast",
            status: "completed",
            timestamp: new Date(),
          },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(trpc.autonomousTask.getSuccessRate.useQuery).mockReturnValue({
      data: {
        successRate: 0.95,
        percentage: "95.00%",
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(trpc.autonomousTask.getLearnings.useQuery).mockReturnValue({
      data: {
        learnings: [
          "Learned: Task scheduling improves with priority weighting",
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(trpc.autonomousTask.submitTask.useMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: true }),
      isPending: false,
    } as any);

    vi.mocked(trpc.autonomousTask.submitEcosystemCommand.useMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: true }),
      isPending: false,
    } as any);
  });

  it("renders QUMUS Control Center header", () => {
    render(<QumusHome />);
    expect(screen.getByText("QUMUS Control Center")).toBeInTheDocument();
  });

  it("displays system status as ACTIVE", () => {
    render(<QumusHome />);
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("shows active tasks count", () => {
    render(<QumusHome />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("displays success rate", () => {
    render(<QumusHome />);
    expect(screen.getByText("95.00%")).toBeInTheDocument();
  });

  it("shows ecosystem commands count", () => {
    render(<QumusHome />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders all tabs", () => {
    render(<QumusHome />);
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Commands")).toBeInTheDocument();
    expect(screen.getByText("Monitoring")).toBeInTheDocument();
    expect(screen.getByText("Insights")).toBeInTheDocument();
  });

  it("has task submission form", () => {
    render(<QumusHome />);
    expect(screen.getByPlaceholderText(/Generate 10 marketing videos/)).toBeInTheDocument();
  });

  it("has priority selector", () => {
    render(<QumusHome />);
    expect(screen.getByText("5 - Medium")).toBeInTheDocument();
  });

  it("displays active plans", () => {
    render(<QumusHome />);
    expect(screen.getByText("plan-1")).toBeInTheDocument();
  });

  it("shows recent commands", () => {
    render(<QumusHome />);
    expect(screen.getByText("RRB")).toBeInTheDocument();
    expect(screen.getByText("schedule_broadcast")).toBeInTheDocument();
  });

  it("renders monitoring metrics", () => {
    render(<QumusHome />);
    expect(screen.getByText("Agent Status")).toBeInTheDocument();
    expect(screen.getByText("Memory System")).toBeInTheDocument();
    expect(screen.getByText("Ecosystem Stats")).toBeInTheDocument();
    expect(screen.getByText("Performance")).toBeInTheDocument();
  });

  it("displays learnings in insights tab", async () => {
    render(<QumusHome />);
    const insightsTab = screen.getByText("Insights");
    fireEvent.click(insightsTab);
    await waitFor(() => {
      expect(
        screen.getByText("Learned: Task scheduling improves with priority weighting")
      ).toBeInTheDocument();
    });
  });

  it("has refresh button", () => {
    render(<QumusHome />);
    expect(screen.getByText("Refresh Status")).toBeInTheDocument();
  });

  it("displays system configuration", async () => {
    render(<QumusHome />);
    const insightsTab = screen.getByText("Insights");
    fireEvent.click(insightsTab);
    await waitFor(() => {
      expect(screen.getByText("System Configuration")).toBeInTheDocument();
    });
  });
});
