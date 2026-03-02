import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const costAttributionRouter = router({
  // Assign cost to team member
  assignCostToMember: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        memberId: z.number(),
        costPercentage: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Cost assigned to team member",
        sessionId: input.sessionId,
        memberId: input.memberId,
        costPercentage: input.costPercentage,
      };
    }),

  // Assign cost to project
  assignCostToProject: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        projectId: z.number(),
        costPercentage: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Cost assigned to project",
        sessionId: input.sessionId,
        projectId: input.projectId,
        costPercentage: input.costPercentage,
      };
    }),

  // Assign cost to department
  assignCostToDepartment: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        departmentId: z.number(),
        costPercentage: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Cost assigned to department",
        sessionId: input.sessionId,
        departmentId: input.departmentId,
        costPercentage: input.costPercentage,
      };
    }),

  // Get cost breakdown by member
  getCostByMember: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["7d", "30d", "90d"]),
      })
    )
    .query(async ({ ctx, input }) => {
      return {
        timeRange: input.timeRange,
        breakdown: [
          {
            memberId: 1,
            memberName: "John Doe",
            totalCost: 450,
            sessionsCount: 25,
            averageCostPerSession: 18,
            topProject: "Project A",
          },
          {
            memberId: 2,
            memberName: "Jane Smith",
            totalCost: 320,
            sessionsCount: 18,
            averageCostPerSession: 17.78,
            topProject: "Project B",
          },
        ],
        totalCost: 770,
      };
    }),

  // Get cost breakdown by project
  getCostByProject: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["7d", "30d", "90d"]),
      })
    )
    .query(async ({ ctx, input }) => {
      return {
        timeRange: input.timeRange,
        breakdown: [
          {
            projectId: 1,
            projectName: "Project A",
            totalCost: 500,
            sessionsCount: 30,
            averageCostPerSession: 16.67,
            topMember: "John Doe",
          },
          {
            projectId: 2,
            projectName: "Project B",
            totalCost: 270,
            sessionsCount: 15,
            averageCostPerSession: 18,
            topMember: "Jane Smith",
          },
        ],
        totalCost: 770,
      };
    }),

  // Get cost breakdown by department
  getCostByDepartment: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(["7d", "30d", "90d"]),
      })
    )
    .query(async ({ ctx, input }) => {
      return {
        timeRange: input.timeRange,
        breakdown: [
          {
            departmentId: 1,
            departmentName: "Engineering",
            totalCost: 600,
            sessionsCount: 40,
            averageCostPerSession: 15,
            memberCount: 5,
          },
          {
            departmentId: 2,
            departmentName: "Marketing",
            totalCost: 170,
            sessionsCount: 10,
            averageCostPerSession: 17,
            memberCount: 2,
          },
        ],
        totalCost: 770,
      };
    }),

  // Get session cost attribution
  getSessionAttribution: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      return {
        sessionId: input.sessionId,
        totalCost: 25.50,
        attribution: [
          {
            type: "member",
            name: "John Doe",
            percentage: 60,
            cost: 15.30,
          },
          {
            type: "project",
            name: "Project A",
            percentage: 100,
            cost: 25.50,
          },
          {
            type: "department",
            name: "Engineering",
            percentage: 100,
            cost: 25.50,
          },
        ],
      };
    }),

  // Update cost attribution
  updateAttribution: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        attribution: z.array(
          z.object({
            type: z.enum(["member", "project", "department"]),
            id: z.number(),
            percentage: z.number().min(0).max(100),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Cost attribution updated",
        sessionId: input.sessionId,
      };
    }),
});
