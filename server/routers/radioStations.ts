import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as radioDb from "../db/radioStations";

export const radioStationsRouter = router({
  // Radio Stations
  listStations: protectedProcedure.query(async ({ ctx }) => {
    return await radioDb.listRadioStations(ctx.user.id);
  }),

  getStation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await radioDb.getRadioStation(input.id, ctx.user.id);
    }),

  createStation: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        operatorName: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["active", "inactive", "maintenance"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await radioDb.createRadioStation(ctx.user.id, input);
    }),

  updateStation: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        operatorName: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["active", "inactive", "maintenance"]).optional(),
        totalListeners: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await radioDb.updateRadioStation(id, ctx.user.id, data);
    }),

  deleteStation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await radioDb.deleteRadioStation(input.id, ctx.user.id);
    }),

  // Radio Channels
  listChannels: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      return await radioDb.listRadioChannels(input.stationId);
    }),

  getChannel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await radioDb.getRadioChannel(input.id);
    }),

  createChannel: protectedProcedure
    .input(
      z.object({
        stationId: z.number(),
        name: z.string(),
        frequency: z.string().optional(),
        genre: z.string().optional(),
        status: z.enum(["active", "scheduled", "offline"]).optional(),
        streamUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await radioDb.createRadioChannel(input.stationId, {
        name: input.name,
        frequency: input.frequency,
        genre: input.genre,
        status: input.status,
        streamUrl: input.streamUrl,
      });
    }),

  updateChannel: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        frequency: z.string().optional(),
        genre: z.string().optional(),
        status: z.enum(["active", "scheduled", "offline"]).optional(),
        currentListeners: z.number().optional(),
        totalListeners: z.number().optional(),
        streamUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await radioDb.updateRadioChannel(id, data);
    }),

  deleteChannel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await radioDb.deleteRadioChannel(input.id);
    }),

  getActiveChannels: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      return await radioDb.getActiveChannels(input.stationId);
    }),

  getTotalStationListeners: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      return await radioDb.getTotalStationListeners(input.stationId);
    }),
});
