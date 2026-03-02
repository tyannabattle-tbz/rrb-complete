/**
 * Autonomous Task Router
 * 
 * tRPC procedures for submitting and managing autonomous tasks to QUMUS
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getQumusActivation } from "../qumus/qumusActivation";
import { getEcosystemController } from "../qumus/ecosystemController";
import { getPlanningEngine } from "../qumus/planningEngine";
import { getMemorySystem } from "../qumus/memorySystem";

export const autonomousTaskRouter = router({
  /**
   * Submit a task for autonomous execution
   */
  submitTask: protectedProcedure
    .input(
      z.object({
        goal: z.string().describe("The goal or task description"),
        steps: z.array(z.string()).optional().describe("Optional steps to execute"),
        priority: z.number().min(1).max(10).default(5).describe("Task priority (1-10)"),
        constraints: z.array(z.string()).optional().describe("Constraints or requirements"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const qumus = getQumusActivation();
        const agent = qumus.getAgent();

        // Submit task to QUMUS
        const taskId = await agent.submitTask(input.goal, input.steps || []);

        // Store in memory
        const memory = getMemorySystem();
        memory.storeFact(`task_${taskId}`, {
          goal: input.goal,
          priority: input.priority,
          submittedBy: ctx.user.id,
          submittedAt: new Date(),
          status: "queued",
        });

        return {
          success: true,
          taskId,
          message: `Task submitted for autonomous execution: ${input.goal}`,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Submit an ecosystem command (RRB, HybridCast, Canryn, Sweet Miracles)
   */
  submitEcosystemCommand: protectedProcedure
    .input(
      z.object({
        target: z.enum(["rrb", "hybridcast", "canryn", "sweet_miracles"]),
        action: z.string(),
        params: z.record(z.any()),
        priority: z.number().min(1).max(10).default(5),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const ecosystem = getEcosystemController();

        let commandId: string;

        switch (input.target) {
          case "rrb":
            commandId = await ecosystem.commandRRB(input.action, input.params, input.priority);
            break;
          case "hybridcast":
            commandId = await ecosystem.commandHybridCast(
              input.action,
              input.params,
              input.priority
            );
            break;
          case "canryn":
            commandId = await ecosystem.commandCanryn(
              input.action,
              input.params,
              input.priority
            );
            break;
          case "sweet_miracles":
            commandId = await ecosystem.commandSweetMiracles(
              input.action,
              input.params,
              input.priority
            );
            break;
        }

        // Store in memory
        const memory = getMemorySystem();
        memory.storeFact(`command_${commandId}`, {
          target: input.target,
          action: input.action,
          submittedBy: ctx.user.id,
          submittedAt: new Date(),
        });

        return {
          success: true,
          commandId,
          message: `Command sent to ${input.target}: ${input.action}`,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Create an autonomous goal
   */
  createGoal: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        priority: z.number().min(1).max(10).default(5),
        constraints: z.array(z.string()).optional(),
        deadline: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const planning = getPlanningEngine();

        const goal = planning.addGoal(
          input.description,
          input.priority,
          input.constraints || [],
          input.deadline
        );

        // Store in memory
        const memory = getMemorySystem();
        memory.storeFact(`goal_${goal.id}`, {
          ...goal,
          createdBy: ctx.user.id,
          createdAt: new Date(),
        });

        return {
          success: true,
          goalId: goal.id,
          message: `Goal created: ${input.description}`,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Generate a plan for a goal
   */
  generatePlan: protectedProcedure
    .input(z.object({ goalId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const planning = getPlanningEngine();
        const plan = planning.generatePlan(input.goalId);

        return {
          success: true,
          plan: {
            id: plan.id,
            goalId: plan.goalId,
            stepCount: plan.steps.length,
            estimatedDuration: plan.estimatedDuration,
            confidence: plan.confidence,
            status: plan.status,
          },
          message: `Plan generated with ${plan.steps.length} steps`,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Execute a plan
   */
  executePlan: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const planning = getPlanningEngine();
        const result = await planning.executePlan(input.planId);

        // Store in memory
        const memory = getMemorySystem();
        memory.storeExperience(
          input.planId,
          "plan_execution",
          result,
          "success",
          ["plan_executed_successfully"]
        );

        return {
          success: true,
          result,
          message: "Plan executed successfully",
        };
      } catch (error) {
        const memory = getMemorySystem();
        memory.storeExperience(input.planId, "plan_execution", {}, "failure", [
          "plan_execution_failed",
        ]);

        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Get QUMUS status
   */
  getStatus: protectedProcedure.query(async () => {
    try {
      const qumus = getQumusActivation();
      const status = qumus.getStatus();

      const agent = qumus.getAgent();
      const agentStatus = agent.getStatus();

      const ecosystem = getEcosystemController();
      const ecosystemStats = ecosystem.getStats();

      const planning = getPlanningEngine();
      const planningStats = planning.getStats();

      const memory = getMemorySystem();
      const memoryStats = memory.getStats();

      return {
        success: true,
        qumusStatus: status,
        agent: agentStatus,
        ecosystem: ecosystemStats,
        planning: planningStats,
        memory: memoryStats,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }),

  /**
   * Get memory facts
   */
  getMemoryFacts: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        const memory = getMemorySystem();

        if (input.search) {
          const results = memory.searchFacts(input.search);
          return {
            success: true,
            facts: results,
          };
        }

        const stats = memory.getStats();
        return {
          success: true,
          stats,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Get active plans
   */
  getActivePlans: protectedProcedure.query(async () => {
    try {
      const planning = getPlanningEngine();
      const plans = planning.getActivePlans();

      return {
        success: true,
        plans: plans.map((p) => ({
          id: p.id,
          goalId: p.goalId,
          stepCount: p.steps.length,
          estimatedDuration: p.estimatedDuration,
          status: p.status,
          confidence: p.confidence,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }),

  /**
   * Get ecosystem command history
   */
  getCommandHistory: protectedProcedure
    .input(
      z.object({
        target: z.enum(["rrb", "hybridcast", "canryn", "sweet_miracles"]).optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const ecosystem = getEcosystemController();
        const history = ecosystem.getCommandHistory(input.target, input.limit);

        return {
          success: true,
          commands: history.map((c) => ({
            id: c.id,
            target: c.target,
            action: c.action,
            status: c.status,
            timestamp: c.timestamp,
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Get learning insights
   */
  getLearnings: protectedProcedure.query(async () => {
    try {
      const memory = getMemorySystem();
      const learnings = memory.getLearnings();

      return {
        success: true,
        learnings,
        count: learnings.length,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }),

  /**
   * Get success rate
   */
  getSuccessRate: protectedProcedure.query(async () => {
    try {
      const memory = getMemorySystem();
      const rate = memory.getSuccessRate();

      return {
        success: true,
        successRate: rate,
        percentage: `${(rate * 100).toFixed(2)}%`,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }),
});
