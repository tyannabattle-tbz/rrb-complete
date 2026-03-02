import { invokeLLM } from "../_core/llm";

export interface WorkflowNode {
  id: string;
  type: string;
  title: string;
  config?: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  executions: number;
}

export interface WorkflowSuggestion {
  type: "optimization" | "missing_step" | "alternative";
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
}

export async function generateWorkflowSuggestions(
  workflow: Workflow
): Promise<WorkflowSuggestion[]> {
  const workflowDescription = `
Workflow: ${workflow.name}
Nodes: ${workflow.nodes.map((n) => `${n.id} (${n.type})`).join(", ")}
Edges: ${workflow.edges.map((e) => `${e.source} -> ${e.target}`).join(", ")}
Total Executions: ${workflow.executions}
  `.trim();

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert workflow optimization assistant. Analyze workflows and suggest improvements, missing steps, and alternative patterns.",
      },
      {
        role: "user",
        content: `Analyze this workflow and provide 3-5 specific suggestions for optimization, missing steps, or alternative patterns:\n\n${workflowDescription}\n\nRespond with a JSON array of suggestions with fields: type, title, description, recommendation, confidence (0-1).`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "workflow_suggestions",
        strict: true,
        schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["optimization", "missing_step", "alternative"],
                  },
                  title: { type: "string" },
                  description: { type: "string" },
                  recommendation: { type: "string" },
                  confidence: { type: "number", minimum: 0, maximum: 1 },
                },
                required: ["type", "title", "description", "recommendation", "confidence"],
                additionalProperties: false,
              },
            },
          },
          required: ["suggestions"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message.content;
    if (!content) return [];

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return parsed.suggestions || [];
  } catch {
    return [];
  }
}

export async function analyzeWorkflowPerformance(
  workflow: Workflow,
  executionTimes: number[]
): Promise<string | (Record<string, unknown> | string)[]> {
  if (executionTimes.length === 0) return "No execution data available";

  const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
  const maxTime = Math.max(...executionTimes);
  const minTime = Math.min(...executionTimes);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a workflow performance analyst. Provide concise insights on workflow efficiency.",
      },
      {
        role: "user",
        content: `Analyze this workflow performance:
Workflow: ${workflow.name}
Nodes: ${workflow.nodes.length}
Edges: ${workflow.edges.length}
Average Execution Time: ${avgTime}ms
Max Time: ${maxTime}ms
Min Time: ${minTime}ms

Provide 2-3 specific recommendations for improvement in 1-2 sentences.`,
      },
    ],
  });

  return response.choices[0]?.message.content || "Unable to generate analysis";
}
