import { useState, useCallback } from "react";

export interface WorkflowSuggestion {
  type: "optimization" | "missing_step" | "alternative";
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
}

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  role: "owner" | "admin" | "editor" | "viewer";
}

export interface PerformanceMetric {
  metricType: "query" | "api" | "memory" | "cpu";
  resourceName: string;
  duration: number;
  status: "success" | "error" | "timeout";
  timestamp: Date;
}

export function useWorkflowSuggestions(workflowId?: number) {
  const [suggestions, setSuggestions] = useState<WorkflowSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = useCallback(async () => {
    if (!workflowId) return;
    setLoading(true);
    setError(null);
    try {
      // In production, this would call the tRPC endpoint
      // const result = await trpc.workflows.generateSuggestions.useQuery({ workflowId });
      setSuggestions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  return { suggestions, loading, error, generateSuggestions };
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In production, this would call the tRPC endpoint
      // const result = await trpc.workspaces.list.useQuery();
      setWorkspaces([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkspace = useCallback(async (name: string, description?: string) => {
    try {
      // In production, this would call the tRPC endpoint
      // const result = await trpc.workspaces.create.useMutation();
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace");
      return null;
    }
  }, []);

  const switchWorkspace = useCallback((workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  }, []);

  return {
    workspaces,
    currentWorkspace,
    loading,
    error,
    loadWorkspaces,
    createWorkspace,
    switchWorkspace,
  };
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async (timeRange?: { start: Date; end: Date }) => {
    setLoading(true);
    setError(null);
    try {
      // In production, this would call the tRPC endpoint
      // const result = await trpc.performance.getMetrics.useQuery({ timeRange });
      setMetrics([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  const getAverageResponseTime = useCallback(() => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  }, [metrics]);

  const getErrorRate = useCallback(() => {
    if (metrics.length === 0) return 0;
    const errors = metrics.filter((m) => m.status === "error").length;
    return (errors / metrics.length) * 100;
  }, [metrics]);

  return {
    metrics,
    loading,
    error,
    loadMetrics,
    getAverageResponseTime,
    getErrorRate,
  };
}
