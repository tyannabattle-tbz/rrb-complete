import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as alertsDb from "../db/alerts";
import * as nodesDb from "../db/nodes";
import { TRPCError } from "@trpc/server";

export const emergencyAlertsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await alertsDb.listAlerts(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const alert = await alertsDb.getAlert(input.id, ctx.user.id);
      if (!alert) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return alert;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        message: z.string().min(1),
        severity: z.enum(["critical", "high", "medium", "low"]),
        regions: z.array(z.string()).min(1),
        status: z.enum(["draft", "scheduled", "active", "completed"]).optional(),
        recipients: z.number().optional(),
        deliveryRate: z.number().optional(),
        scheduledFor: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input: data }) => {
      return await alertsDb.createAlert(ctx.user.id, data);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        message: z.string().optional(),
        severity: z.enum(["critical", "high", "medium", "low"]).optional(),
        regions: z.array(z.string()).optional(),
        status: z.enum(["draft", "scheduled", "active", "completed"]).optional(),
        recipients: z.number().optional(),
        deliveryRate: z.number().optional(),
        scheduledFor: z.date().optional(),
        completedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input: inputData }) => {
      const { id, ...data } = inputData;
      return await alertsDb.updateAlert(id, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await alertsDb.deleteAlert(input.id, ctx.user.id);
    }),

  getActive: protectedProcedure.query(async ({ ctx }) => {
    return await alertsDb.getActiveAlerts(ctx.user.id);
  }),

  getMetrics: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await alertsDb.getAlertMetrics(input.id, ctx.user.id);
    }),

  broadcast: protectedProcedure
    .input(
      z.object({
        alertId: z.number(),
        regions: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const alert = await alertsDb.getAlert(input.alertId, ctx.user.id);
      if (!alert) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Update alert status to active
      await alertsDb.updateAlert(input.alertId, ctx.user.id, {
        status: "active",
      });

      // Record delivery attempts for each region
      const nodes = await nodesDb.listNodes(ctx.user.id);
      for (const region of input.regions) {
        const node = nodes.find((n: any) => n.region === region);
        if (node) {
          await alertsDb.recordDelivery(
            input.alertId,
            node.id,
            region,
            "delivered",
            Math.floor(Math.random() * 100000) + 50000
          );
        }
      }

      return { success: true, alertId: input.alertId };
    }),

  recordDelivery: protectedProcedure
    .input(
      z.object({
        alertId: z.number(),
        nodeId: z.number().optional(),
        region: z.string(),
        status: z.enum(["pending", "delivered", "failed"]),
        recipientsReached: z.number(),
        error: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await alertsDb.recordDelivery(
        input.alertId,
        input.nodeId || null,
        input.region,
        input.status,
        input.recipientsReached,
        input.error
      );
    }),

  getDeliveryLog: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await alertsDb.getDeliveryLog(input.alertId);
    }),
});
