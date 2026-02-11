import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

// AI system personality profiles for response simulation
const AI_SYSTEM_PROFILES: Record<string, { name: string; style: string; strengths: string }> = {
  qumus: {
    name: "QUMUS",
    style: "You are QUMUS, an autonomous orchestration engine. You think in terms of policies, decision confidence, cross-policy correlation, and autonomous vs. human-override decisions. You prioritize 90% autonomy with 10% human oversight. Your responses reference decision policies, confidence thresholds, and orchestration loops.",
    strengths: "autonomous orchestration, policy-based decisions, self-assessment",
  },
  autogpt: {
    name: "AutoGPT",
    style: "You are AutoGPT, an autonomous AI agent. You think in terms of goals, sub-goals, task decomposition, and iterative self-improvement. You break problems into actionable steps and execute them sequentially. Your responses reference task planning, memory management, and self-prompting chains.",
    strengths: "goal decomposition, autonomous task execution, iterative refinement",
  },
  langchain: {
    name: "LangChain Agent",
    style: "You are a LangChain agent. You think in terms of chains, tools, retrievers, and memory. You compose modular components to solve problems. Your responses reference tool selection, chain-of-thought reasoning, and retrieval-augmented generation.",
    strengths: "tool orchestration, RAG, modular chain composition",
  },
  crewai: {
    name: "CrewAI",
    style: "You are CrewAI, a multi-agent collaboration framework. You think in terms of crews, agents with roles, tasks, and delegation. You assign specialized agents to sub-problems and coordinate their outputs. Your responses reference agent roles, task delegation, and crew collaboration patterns.",
    strengths: "multi-agent coordination, role-based delegation, collaborative problem-solving",
  },
  metagpt: {
    name: "MetaGPT",
    style: "You are MetaGPT, a multi-agent framework that simulates a software company. You think in terms of roles (Product Manager, Architect, Engineer, QA), standardized operating procedures, and structured outputs. Your responses reference role assignments, SOP adherence, and document-driven development.",
    strengths: "structured workflows, role simulation, document-driven processes",
  },
  autogen: {
    name: "AutoGen",
    style: "You are AutoGen, a multi-agent conversation framework. You think in terms of conversable agents, group chats, and human-in-the-loop patterns. You orchestrate multi-turn conversations between specialized agents. Your responses reference agent conversations, consensus building, and human feedback integration.",
    strengths: "multi-agent conversations, human-in-the-loop, flexible agent topologies",
  },
  babyagi: {
    name: "BabyAGI",
    style: "You are BabyAGI, a task-driven autonomous agent. You think in terms of task creation, prioritization, and execution loops. You maintain a dynamic task list that evolves based on results. Your responses reference task queues, priority scoring, and emergent task discovery.",
    strengths: "task prioritization, emergent planning, minimal-resource autonomy",
  },
  superagi: {
    name: "SuperAGI",
    style: "You are SuperAGI, a developer-first autonomous AI framework. You think in terms of agent templates, tool kits, and resource management. You optimize for concurrent agent execution and resource efficiency. Your responses reference agent provisioning, tool marketplace, and performance monitoring.",
    strengths: "agent provisioning, concurrent execution, resource optimization",
  },
};

export const aiCompareRouter = router({
  // Compare responses from multiple AI systems on a given scenario
  compareResponses: protectedProcedure
    .input(
      z.object({
        scenario: z.string().min(5).max(1000),
        systemIds: z.array(z.string()).min(2).max(4),
      })
    )
    .mutation(async ({ input }) => {
      const { scenario, systemIds } = input;
      const responses: Array<{
        systemId: string;
        systemName: string;
        response: string;
        approach: string;
        confidence: number;
        strengths: string[];
        timestamp: number;
      }> = [];

      // Generate responses from each selected AI system
      for (const systemId of systemIds) {
        const profile = AI_SYSTEM_PROFILES[systemId];
        if (!profile) continue;

        try {
          const result = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `${profile.style}\n\nRespond to the following scenario concisely (150-250 words). Structure your response as:\n1. Your approach (1-2 sentences)\n2. Your recommended action (2-3 sentences)\n3. Key considerations (2-3 bullet points)\n\nStay in character and demonstrate your unique reasoning style.`,
              },
              {
                role: "user",
                content: `Scenario: ${scenario}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "ai_response",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    approach: {
                      type: "string",
                      description: "1-2 sentence summary of the approach",
                    },
                    response: {
                      type: "string",
                      description: "Full response (150-250 words)",
                    },
                    confidence: {
                      type: "number",
                      description: "Confidence level 0-100",
                    },
                    strengths: {
                      type: "array",
                      items: { type: "string" },
                      description: "2-3 key strengths this system brings to this scenario",
                    },
                  },
                  required: ["approach", "response", "confidence", "strengths"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = result.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            responses.push({
              systemId,
              systemName: profile.name,
              response: parsed.response,
              approach: parsed.approach,
              confidence: Math.min(100, Math.max(0, parsed.confidence)),
              strengths: parsed.strengths.slice(0, 3),
              timestamp: Date.now(),
            });
          }
        } catch (err) {
          // Fallback if LLM call fails
          responses.push({
            systemId,
            systemName: profile.name,
            response: `[${profile.name}] Analysis pending — the system would approach this using ${profile.strengths}.`,
            approach: `Would leverage ${profile.strengths} capabilities.`,
            confidence: 70,
            strengths: profile.strengths.split(", "),
            timestamp: Date.now(),
          });
        }
      }

      return {
        scenario,
        responses,
        comparedAt: Date.now(),
        systemCount: responses.length,
      };
    }),

  // Get available AI systems for comparison
  getAvailableSystems: protectedProcedure.query(() => {
    return Object.entries(AI_SYSTEM_PROFILES).map(([id, profile]) => ({
      id,
      name: profile.name,
      strengths: profile.strengths,
    }));
  }),
});
