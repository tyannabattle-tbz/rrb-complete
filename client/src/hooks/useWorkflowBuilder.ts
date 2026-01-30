import { useState, useCallback } from "react";

export type WorkflowNodeType = "trigger" | "action" | "condition" | "webhook" | "notification" | "delay";
export type TriggerType = "manual" | "schedule" | "event" | "webhook";
export type ActionType = "execute_agent" | "send_message" | "tag_session" | "export_data";
export type ConditionOperator = "equals" | "contains" | "greater_than" | "less_than" | "exists";

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: {
    field: string;
    operator: ConditionOperator;
    value: any;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  executions: number;
  lastExecuted?: Date;
}

export interface UseWorkflowBuilderOptions {
  enabled?: boolean;
}

/**
 * Hook for building and managing automation workflows
 */
export function useWorkflowBuilder(options: UseWorkflowBuilderOptions) {
  const { enabled = true } = options;

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [nodeIdCounter, setNodeIdCounter] = useState(0);
  const [edgeIdCounter, setEdgeIdCounter] = useState(0);

  // Load workflows from localStorage
  const loadWorkflows = useCallback(() => {
    if (!enabled) return;

    try {
      const stored = localStorage.getItem("workflows");
      if (stored) {
        const parsed = JSON.parse(stored).map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt),
          updatedAt: new Date(w.updatedAt),
          lastExecuted: w.lastExecuted ? new Date(w.lastExecuted) : undefined,
        }));
        setWorkflows(parsed);
      }
    } catch (error) {
      console.error("[WorkflowBuilder] Failed to load workflows:", error);
    }
  }, [enabled]);

  // Create new workflow
  const createWorkflow = useCallback(
    (name: string, description?: string) => {
      const workflow: Workflow = {
        id: `workflow-${Date.now()}`,
        name,
        description,
        nodes: [],
        edges: [],
        enabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        executions: 0,
      };

      setWorkflows((prev) => {
        const updated = [workflow, ...prev];
        try {
          localStorage.setItem("workflows", JSON.stringify(updated));
        } catch (error) {
          console.error("[WorkflowBuilder] Failed to save workflows:", error);
        }
        return updated;
      });

      setCurrentWorkflow(workflow);
      return workflow;
    },
    []
  );

  // Add node to workflow
  const addNode = useCallback(
    (type: WorkflowNodeType, title: string, config: Record<string, any>, position: { x: number; y: number }) => {
      if (!currentWorkflow) return null;

      const node: WorkflowNode = {
        id: `node-${nodeIdCounter}`,
        type,
        title,
        config,
        position,
      };

      setNodeIdCounter((prev) => prev + 1);

      const updated = {
        ...currentWorkflow,
        nodes: [...currentWorkflow.nodes, node],
        updatedAt: new Date(),
      };

      setCurrentWorkflow(updated);
      setWorkflows((prev) =>
        prev.map((w) => (w.id === updated.id ? updated : w))
      );

      return node;
    },
    [currentWorkflow, nodeIdCounter]
  );

  // Remove node from workflow
  const removeNode = useCallback(
    (nodeId: string) => {
      if (!currentWorkflow) return;

      const updated = {
        ...currentWorkflow,
        nodes: currentWorkflow.nodes.filter((n) => n.id !== nodeId),
        edges: currentWorkflow.edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId
        ),
        updatedAt: new Date(),
      };

      setCurrentWorkflow(updated);
      setWorkflows((prev) =>
        prev.map((w) => (w.id === updated.id ? updated : w))
      );
    },
    [currentWorkflow]
  );

  // Add edge (connection) between nodes
  const addEdge = useCallback(
    (source: string, target: string, condition?: any) => {
      if (!currentWorkflow) return null;

      const edge: WorkflowEdge = {
        id: `edge-${edgeIdCounter}`,
        source,
        target,
        condition,
      };

      setEdgeIdCounter((prev) => prev + 1);

      const updated = {
        ...currentWorkflow,
        edges: [...currentWorkflow.edges, edge],
        updatedAt: new Date(),
      };

      setCurrentWorkflow(updated);
      setWorkflows((prev) =>
        prev.map((w) => (w.id === updated.id ? updated : w))
      );

      return edge;
    },
    [currentWorkflow, edgeIdCounter]
  );

  // Remove edge
  const removeEdge = useCallback(
    (edgeId: string) => {
      if (!currentWorkflow) return;

      const updated = {
        ...currentWorkflow,
        edges: currentWorkflow.edges.filter((e) => e.id !== edgeId),
        updatedAt: new Date(),
      };

      setCurrentWorkflow(updated);
      setWorkflows((prev) =>
        prev.map((w) => (w.id === updated.id ? updated : w))
      );
    },
    [currentWorkflow]
  );

  // Update node
  const updateNode = useCallback(
    (nodeId: string, updates: Partial<WorkflowNode>) => {
      if (!currentWorkflow) return;

      const updated = {
        ...currentWorkflow,
        nodes: currentWorkflow.nodes.map((n) =>
          n.id === nodeId ? { ...n, ...updates } : n
        ),
        updatedAt: new Date(),
      };

      setCurrentWorkflow(updated);
      setWorkflows((prev) =>
        prev.map((w) => (w.id === updated.id ? updated : w))
      );
    },
    [currentWorkflow]
  );

  // Toggle workflow enabled/disabled
  const toggleWorkflow = useCallback((workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId ? { ...w, enabled: !w.enabled } : w
      )
    );
  }, []);

  // Delete workflow
  const deleteWorkflow = useCallback((workflowId: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    if (currentWorkflow?.id === workflowId) {
      setCurrentWorkflow(null);
    }
  }, [currentWorkflow]);

  // Execute workflow
  const executeWorkflow = useCallback((workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId
          ? {
              ...w,
              executions: w.executions + 1,
              lastExecuted: new Date(),
            }
          : w
      )
    );
  }, []);

  // Validate workflow
  const validateWorkflow = useCallback((): { valid: boolean; errors: string[] } => {
    if (!currentWorkflow) return { valid: false, errors: ["No workflow selected"] };

    const errors: string[] = [];

    if (currentWorkflow.nodes.length === 0) {
      errors.push("Workflow must have at least one node");
    }

    // Check for orphaned nodes
    const connectedNodeIds = new Set<string>();
    currentWorkflow.edges.forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });

    currentWorkflow.nodes.forEach((n) => {
      if (n.type !== "trigger" && !connectedNodeIds.has(n.id)) {
        errors.push(`Node "${n.title}" is not connected`);
      }
    });

    // Check for trigger node
    const hasTrigger = currentWorkflow.nodes.some((n) => n.type === "trigger");
    if (!hasTrigger) {
      errors.push("Workflow must have a trigger node");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }, [currentWorkflow]);

  return {
    workflows,
    currentWorkflow,
    setCurrentWorkflow,
    createWorkflow,
    addNode,
    removeNode,
    addEdge,
    removeEdge,
    updateNode,
    toggleWorkflow,
    deleteWorkflow,
    executeWorkflow,
    validateWorkflow,
    loadWorkflows,
  };
}
