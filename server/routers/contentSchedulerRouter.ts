/**
 * Content Scheduler Router
 * tRPC endpoints for QUMUS 24/7 content scheduling
 */
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getContentScheduler } from "../services/contentSchedulerService";

export const contentSchedulerRouter = router({
  // Get scheduler status
  getStatus: publicProcedure.query(() => {
    const scheduler = getContentScheduler();
    return scheduler.getStatus();
  }),

  // Get all channels
  getChannels: publicProcedure.query(() => {
    const scheduler = getContentScheduler();
    return scheduler.getChannels();
  }),

  // Get all schedule slots
  getSlots: publicProcedure.query(() => {
    const scheduler = getContentScheduler();
    return scheduler.getScheduleSlots();
  }),

  // Get currently active slots
  getCurrentSlots: publicProcedure.query(() => {
    const scheduler = getContentScheduler();
    return scheduler.getCurrentSlots();
  }),

  // Get slots by channel
  getSlotsByChannel: publicProcedure
    .input(z.string())
    .query(({ input }) => {
      const scheduler = getContentScheduler();
      return scheduler.getSlotsByChannel(input);
    }),

  // Add a new schedule slot
  addSlot: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      contentType: z.enum(['radio', 'podcast', 'audiobook', 'commercial', 'emergency']),
      title: z.string(),
      priority: z.number().min(1).max(10),
      daysOfWeek: z.array(z.number().min(0).max(6)),
      isActive: z.boolean(),
    }))
    .mutation(({ input }) => {
      const scheduler = getContentScheduler();
      return scheduler.addSlot(input);
    }),

  // Update a schedule slot
  updateSlot: protectedProcedure
    .input(z.object({
      id: z.string(),
      updates: z.object({
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        contentType: z.enum(['radio', 'podcast', 'audiobook', 'commercial', 'emergency']).optional(),
        title: z.string().optional(),
        priority: z.number().min(1).max(10).optional(),
        daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
        isActive: z.boolean().optional(),
      }),
    }))
    .mutation(({ input }) => {
      const scheduler = getContentScheduler();
      return scheduler.updateSlot(input.id, input.updates);
    }),

  // Delete a schedule slot
  deleteSlot: protectedProcedure
    .input(z.string())
    .mutation(({ input }) => {
      const scheduler = getContentScheduler();
      return scheduler.deleteSlot(input);
    }),

  // Trigger content rotation
  rotateContent: protectedProcedure.mutation(() => {
    const scheduler = getContentScheduler();
    return scheduler.rotateContent();
  }),

  // Trigger emergency override
  emergencyOverride: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      message: z.string(),
    }))
    .mutation(({ input }) => {
      const scheduler = getContentScheduler();
      return scheduler.triggerEmergencyOverride(input.channelId, input.message);
    }),

  // Move a slot to a new time/channel (drag-and-drop)
  moveSlot: protectedProcedure
    .input(z.object({
      slotId: z.string(),
      newStartTime: z.string(),
      newEndTime: z.string(),
      newChannelId: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const scheduler = getContentScheduler();
      const result = scheduler.moveSlot(input.slotId, input.newStartTime, input.newEndTime, input.newChannelId);
      if (!result) throw new Error('Slot not found');
      return result;
    }),

  // Reorder slots by priority (drag-and-drop reorder)
  reorderSlots: protectedProcedure
    .input(z.array(z.string()))
    .mutation(({ input }) => {
      const scheduler = getContentScheduler();
      return scheduler.reorderSlots(input);
    }),

  // Set autonomy level
  setAutonomyLevel: protectedProcedure
    .input(z.number().min(0).max(100))
    .mutation(({ input }) => {
      const scheduler = getContentScheduler();
      scheduler.setAutonomyLevel(input);
      return { success: true, autonomyLevel: input };
    }),
});
