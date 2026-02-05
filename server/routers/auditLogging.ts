import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq, desc } from "drizzle-orm";
import { auditLogs } from "../../drizzle/schema";
import {
  getAuditLogs as getRedisAuditLogs,
} from "../_core/redis";

export const auditLoggingRouter = router({
  // Get audit logs
  getAuditLogs: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
      action: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        const logs = await (database as any).query.auditLogs.findMany() as any[];
        
        // Filter by action if provided
        const filtered = input.action
          ? logs.filter((log: any) => log.action === input.action)
          : logs;
        
        // Sort by createdAt descending and apply pagination
        const sorted = filtered
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(input.offset, input.offset + input.limit);

        return sorted;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Log action
  logAction: protectedProcedure
    .input(z.object({
      action: z.string(),
      resourceType: z.string(),
      resourceId: z.number().optional(),
      details: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        await database.insert(auditLogs).values({
          userId: ctx.user.id,
          action: input.action,
          resource: input.resourceType,
          resourceId: input.resourceId?.toString(),
          changes: input.details,
          ipAddress: "127.0.0.1",
          status: "success",
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Get user activity summary
  getActivitySummary: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    try {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");

      const logs = await (database as any).query.auditLogs.findMany() as any[];

      const summary = {
        totalActions: logs.length,
        actionsByType: {} as Record<string, number>,
        resourcesByType: {} as Record<string, number>,
        lastAction: logs.length > 0 ? logs[0].createdAt : null,
      };

      logs.forEach((log: any) => {
        summary.actionsByType[log.action] = (summary.actionsByType[log.action] || 0) + 1;
        summary.resourcesByType[log.resource] = (summary.resourcesByType[log.resource] || 0) + 1;
      });

      return summary;
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
    }
  }),

  // Export audit logs
  exportAuditLogs: protectedProcedure
    .input(z.object({
      format: z.enum(["csv", "json"]).default("csv"),
      days: z.number().default(30),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        const daysAgo = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

        const logs = await (database as any).query.auditLogs.findMany() as any[];

        if (input.format === "json") {
          return {
            format: "json",
            data: logs,
            filename: `audit-logs-${new Date().toISOString().split("T")[0]}.json`,
          };
        } else {
          // CSV format
          const headers = ["Timestamp", "Action", "Resource", "Resource ID", "Changes"];
          const rows = logs.map((log: any) => [
            new Date(log.createdAt).toISOString(),
            log.action,
            log.resource,
            log.resourceId || "",
            JSON.stringify(log.changes || {}),
          ]);

          const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");

          return {
            format: "csv",
            data: csv,
            filename: `audit-logs-${new Date().toISOString().split("T")[0]}.csv`,
          };
        }
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Export audit trail (QUMUS)
  exportAuditTrail: protectedProcedure
    .input(z.object({ format: z.enum(["csv", "json"]).default("csv") }))
    .mutation(async ({ ctx, input }) => {
      try {
        const logs = await getRedisAuditLogs(10000);

        if (input.format === "json") {
          return JSON.stringify(logs, null, 2);
        }

        const headers = [
          "Timestamp",
          "User ID",
          "Decision ID",
          "Policy",
          "Action",
          "Reason",
          "Success",
        ];

        const rows = logs.map((log: any) => [
          log.timestamp,
          log.userId,
          log.decisionId,
          log.policy,
          log.action,
          log.reason || "",
          log.success ? "Yes" : "No",
        ]);

        const csv = [
          headers.join(","),
          ...rows.map((row: any[]) =>
            row
              .map((cell) => {
                if (typeof cell === "string" && cell.includes(",")) {
                  return `"${cell}"`;
                }
                return cell;
              })
              .join(",")
          ),
        ].join("\n");

        console.log(`[Audit] Exported ${logs.length} QUMUS audit logs`);
        return csv;
      } catch (error) {
        console.error("[Audit] Failed to export audit trail:", error);
        throw error;
      }
    }),
});

