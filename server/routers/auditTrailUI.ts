import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const auditTrailUIRouter = router({
  getAuditTrail: protectedProcedure
    .input(
      z.object({
        resourceType: z.enum(["agent", "prompt", "workflow", "session"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async () => {
      return {
        events: [
          {
            id: "evt_001",
            timestamp: new Date(Date.now() - 3600000),
            action: "create",
            resourceType: "agent",
            resourceId: "agent_123",
            resourceName: "Data Analyzer",
            userId: "user_456",
            userName: "Alice Johnson",
            changes: { name: "Data Analyzer", model: "gpt-4" },
            ipAddress: "192.168.1.1",
          },
          {
            id: "evt_002",
            timestamp: new Date(Date.now() - 7200000),
            action: "update",
            resourceType: "prompt",
            resourceId: "prompt_789",
            resourceName: "Analysis Prompt v2",
            userId: "user_456",
            userName: "Alice Johnson",
            changes: { content: "Updated prompt content" },
            ipAddress: "192.168.1.1",
          },
        ],
        total: 2,
      };
    }),

  getEventDetails: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async () => {
      return {
        id: "evt_001",
        timestamp: new Date(),
        action: "create",
        resourceType: "agent",
        resourceId: "agent_123",
        resourceName: "Data Analyzer",
        userId: "user_456",
        userName: "Alice Johnson",
        changes: {
          before: {},
          after: { name: "Data Analyzer", model: "gpt-4", temperature: 0.7 },
        },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
      };
    }),

  exportAuditLog: protectedProcedure
    .input(
      z.object({
        format: z.enum(["csv", "json", "pdf"]),
        resourceType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async () => {
      return {
        downloadUrl: "/api/audit/export/audit_log_2026_01.csv",
        fileName: "audit_log_2026_01.csv",
        recordCount: 1250,
      };
    }),

  filterAuditTrail: protectedProcedure
    .input(
      z.object({
        actions: z.array(z.string()).optional(),
        users: z.array(z.string()).optional(),
        resources: z.array(z.string()).optional(),
        dateRange: z.object({ start: z.date(), end: z.date() }).optional(),
      })
    )
    .query(async () => {
      return {
        events: [],
        total: 0,
        filters: {
          actions: ["create", "update", "delete"],
          users: ["Alice Johnson", "Bob Smith"],
          resources: ["agent", "prompt", "workflow"],
        },
      };
    }),

  getAuditStats: protectedProcedure.query(async () => {
    return {
      totalEvents: 5432,
      eventsByAction: {
        create: 1200,
        update: 2800,
        delete: 450,
        view: 982,
      },
      eventsByResource: {
        agent: 1500,
        prompt: 2000,
        workflow: 1200,
        session: 732,
      },
      topUsers: [
        { userId: "user_456", name: "Alice Johnson", eventCount: 1200 },
        { userId: "user_789", name: "Bob Smith", eventCount: 980 },
      ],
    };
  }),
});
