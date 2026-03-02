import { invokeLLM } from "../_core/llm";

export interface Playbook {
  id: string;
  name: string;
  description: string;
  triggers: PlaybookTrigger[];
  actions: PlaybookAction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  executionCount: number;
  lastExecuted?: Date;
}

export interface PlaybookTrigger {
  type: "metric_threshold" | "error_rate" | "latency" | "resource_usage" | "deployment_failure";
  metric: string;
  operator: "greater_than" | "less_than";
  threshold: number;
  duration: number; // in minutes
}

export interface PlaybookAction {
  type: "scale_resources" | "restart_service" | "trigger_alert" | "rollback_deployment" | "notify_team" | "create_ticket";
  target: string;
  parameters?: Record<string, unknown>;
  delay?: number; // in seconds
}

export interface IncidentResponse {
  id: string;
  playbookId: string;
  triggeredAt: Date;
  status: "executing" | "completed" | "failed";
  executedActions: ExecutedAction[];
  errorMessage?: string;
  duration: number; // in milliseconds
}

export interface ExecutedAction {
  actionId: string;
  type: string;
  status: "pending" | "executing" | "success" | "failed";
  result?: unknown;
  error?: string;
  executedAt: Date;
}

// Simulated playbook storage
const playbooks: Map<string, Playbook> = new Map();
const incidentResponses: IncidentResponse[] = [];
let playbookIdCounter = 1;

export function createPlaybook(
  name: string,
  description: string,
  triggers: PlaybookTrigger[],
  actions: PlaybookAction[]
): Playbook {
  const playbook: Playbook = {
    id: `playbook-${playbookIdCounter++}`,
    name,
    description,
    triggers,
    actions,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    executionCount: 0,
  };

  playbooks.set(playbook.id, playbook);
  return playbook;
}

export function getPlaybook(playbookId: string): Playbook | null {
  return playbooks.get(playbookId) || null;
}

export function getAllPlaybooks(): Playbook[] {
  return Array.from(playbooks.values());
}

export function updatePlaybook(playbookId: string, updates: Partial<Playbook>): Playbook | null {
  const playbook = playbooks.get(playbookId);
  if (!playbook) return null;

  const updated = {
    ...playbook,
    ...updates,
    updatedAt: new Date(),
  };

  playbooks.set(playbookId, updated);
  return updated;
}

export function deletePlaybook(playbookId: string): boolean {
  return playbooks.delete(playbookId);
}

export async function executePlaybook(playbookId: string, triggerData?: Record<string, unknown>): Promise<IncidentResponse> {
  const playbook = playbooks.get(playbookId);
  if (!playbook || !playbook.enabled) {
    throw new Error(`Playbook ${playbookId} not found or disabled`);
  }

  const response: IncidentResponse = {
    id: `incident-${Date.now()}`,
    playbookId,
    triggeredAt: new Date(),
    status: "executing",
    executedActions: [],
    duration: 0,
  };

  const startTime = Date.now();

  try {
    // Execute each action sequentially
    for (const action of playbook.actions) {
      const executedAction: ExecutedAction = {
        actionId: `${action.type}-${Date.now()}`,
        type: action.type,
        status: "pending",
        executedAt: new Date(),
      };

      response.executedActions.push(executedAction);

      try {
        // Simulate action execution
        executedAction.status = "executing";

        // Add delay if specified
        if (action.delay) {
          await new Promise((resolve) => setTimeout(resolve, action.delay! * 1000));
        }

        // Execute action based on type
        const result = await executeAction(action, triggerData);
        executedAction.status = "success";
        executedAction.result = result;
      } catch (error) {
        executedAction.status = "failed";
        executedAction.error = error instanceof Error ? error.message : String(error);
        response.status = "failed";
        response.errorMessage = `Action ${action.type} failed: ${executedAction.error}`;
        break;
      }
    }

    if (response.status !== "failed") {
      response.status = "completed";
    }
  } catch (error) {
    response.status = "failed";
    response.errorMessage = error instanceof Error ? error.message : String(error);
  }

  response.duration = Date.now() - startTime;
  playbook.executionCount++;
  playbook.lastExecuted = new Date();

  incidentResponses.push(response);
  return response;
}

async function executeAction(action: PlaybookAction, triggerData?: Record<string, unknown>): Promise<unknown> {
  switch (action.type) {
    case "scale_resources":
      console.log(`[Incident] Scaling ${action.target} with params:`, action.parameters);
      return { scaled: true, target: action.target, parameters: action.parameters };

    case "restart_service":
      console.log(`[Incident] Restarting service ${action.target}`);
      return { restarted: true, service: action.target };

    case "trigger_alert":
      console.log(`[Incident] Triggering alert to ${action.target}`);
      return { alerted: true, target: action.target };

    case "rollback_deployment":
      console.log(`[Incident] Rolling back deployment ${action.target}`);
      return { rolledback: true, deployment: action.target };

    case "notify_team":
      console.log(`[Incident] Notifying team at ${action.target}`);
      return { notified: true, channel: action.target };

    case "create_ticket":
      console.log(`[Incident] Creating ticket in ${action.target}`);
      return { ticketCreated: true, system: action.target };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export function getIncidentResponses(playbookId?: string, limit: number = 50): IncidentResponse[] {
  let responses = incidentResponses;

  if (playbookId) {
    responses = responses.filter((r) => r.playbookId === playbookId);
  }

  return responses.slice(-limit);
}

export function getIncidentResponse(incidentId: string): IncidentResponse | null {
  return incidentResponses.find((r) => r.id === incidentId) || null;
}

export function getIncidentStatistics(): {
  totalPlaybooks: number;
  enabledPlaybooks: number;
  totalIncidents: number;
  successfulIncidents: number;
  failedIncidents: number;
  averageExecutionTime: number;
  mostUsedPlaybook: string | null;
} {
  const playbookArray = Array.from(playbooks.values());
  const successfulIncidents = incidentResponses.filter((r) => r.status === "completed").length;
  const failedIncidents = incidentResponses.filter((r) => r.status === "failed").length;

  const totalExecutionTime = incidentResponses.reduce((sum, r) => sum + r.duration, 0);
  const averageExecutionTime = incidentResponses.length > 0 ? totalExecutionTime / incidentResponses.length : 0;

  // Find most used playbook
  const playbookExecutionCounts: Record<string, number> = {};
  for (const response of incidentResponses) {
    playbookExecutionCounts[response.playbookId] = (playbookExecutionCounts[response.playbookId] || 0) + 1;
  }

  let mostUsedPlaybook: string | null = null;
  let maxCount = 0;
  for (const [playbookId, count] of Object.entries(playbookExecutionCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostUsedPlaybook = playbookId;
    }
  }

  return {
    totalPlaybooks: playbookArray.length,
    enabledPlaybooks: playbookArray.filter((p) => p.enabled).length,
    totalIncidents: incidentResponses.length,
    successfulIncidents,
    failedIncidents,
    averageExecutionTime,
    mostUsedPlaybook,
  };
}

export async function suggestPlaybooks(metrics: string[]): Promise<Playbook[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an incident response expert. Suggest automated playbooks for common incidents.",
      },
      {
        role: "user",
        content: `Suggest incident response playbooks for these metrics: ${metrics.join(", ")}. For each metric, suggest appropriate triggers and remediation actions.`,
      },
    ],
  });

  const suggestedPlaybooks: Playbook[] = [];

  for (const metric of metrics) {
    const playbook = createPlaybook(
      `Auto-remediate ${metric}`,
      `Automatically respond to ${metric} incidents`,
      [
        {
          type: "metric_threshold",
          metric,
          operator: "greater_than",
          threshold: 2000,
          duration: 5,
        },
      ],
      [
        {
          type: "trigger_alert",
          target: "incident-channel",
        },
        {
          type: "scale_resources",
          target: "api-servers",
          parameters: { replicas: 5 },
          delay: 10,
        },
      ]
    );

    suggestedPlaybooks.push(playbook);
  }

  return suggestedPlaybooks;
}

export function exportPlaybooks(format: "json" | "yaml" = "json"): string {
  const playbookArray = Array.from(playbooks.values());

  if (format === "json") {
    return JSON.stringify(playbookArray, null, 2);
  } else {
    // YAML format
    let yaml = "playbooks:\n";
    for (const playbook of playbookArray) {
      yaml += `  - id: ${playbook.id}\n`;
      yaml += `    name: ${playbook.name}\n`;
      yaml += `    enabled: ${playbook.enabled}\n`;
      yaml += `    triggers:\n`;
      for (const trigger of playbook.triggers) {
        yaml += `      - type: ${trigger.type}\n`;
        yaml += `        metric: ${trigger.metric}\n`;
      }
    }
    return yaml;
  }
}

export function importPlaybooks(data: string, format: "json" | "yaml" = "json"): Playbook[] {
  let playbookData: Playbook[] = [];

  if (format === "json") {
    playbookData = JSON.parse(data);
  }

  const importedPlaybooks: Playbook[] = [];
  for (const pb of playbookData) {
    const imported = createPlaybook(pb.name, pb.description, pb.triggers, pb.actions);
    importedPlaybooks.push(imported);
  }

  return importedPlaybooks;
}
