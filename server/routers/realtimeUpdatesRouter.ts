import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";

// Global event emitter for real-time updates
const eventEmitter = new EventEmitter();

export const realtimeUpdatesRouter = router({
  // Subscribe to batch job progress updates
  batchJobProgress: protectedProcedure
    .input(z.object({ queueId: z.number() }))
    .subscription(({ input }) => {
      return observable<{
        jobId: string;
        progress: number;
        status: string;
        message: string;
      }>((emit) => {
        const onUpdate = (data: any) => {
          if (data.queueId === input.queueId) {
            emit.next({
              jobId: data.jobId,
              progress: data.progress,
              status: data.status,
              message: data.message,
            });
          }
        };

        eventEmitter.on("batch-progress", onUpdate);

        return () => {
          eventEmitter.off("batch-progress", onUpdate);
        };
      });
    }),

  // Subscribe to voice command execution updates
  voiceCommandExecution: protectedProcedure
    .input(z.object({ commandId: z.string() }))
    .subscription(({ input }) => {
      return observable<{
        commandId: string;
        status: string;
        result: string;
        timestamp: Date;
      }>((emit) => {
        const onUpdate = (data: any) => {
          if (data.commandId === input.commandId) {
            emit.next({
              commandId: data.commandId,
              status: data.status,
              result: data.result,
              timestamp: new Date(),
            });
          }
        };

        eventEmitter.on("voice-execution", onUpdate);

        return () => {
          eventEmitter.off("voice-execution", onUpdate);
        };
      });
    }),

  // Subscribe to storyboard generation updates
  storyboardGeneration: protectedProcedure
    .input(z.object({ storyboardId: z.string() }))
    .subscription(({ input }) => {
      return observable<{
        storyboardId: string;
        sceneNumber: number;
        totalScenes: number;
        status: string;
        message: string;
      }>((emit) => {
        const onUpdate = (data: any) => {
          if (data.storyboardId === input.storyboardId) {
            emit.next({
              storyboardId: data.storyboardId,
              sceneNumber: data.sceneNumber,
              totalScenes: data.totalScenes,
              status: data.status,
              message: data.message,
            });
          }
        };

        eventEmitter.on("storyboard-generation", onUpdate);

        return () => {
          eventEmitter.off("storyboard-generation", onUpdate);
        };
      });
    }),

  // Subscribe to system status updates
  systemStatus: protectedProcedure.subscription(() => {
    return observable<{
      cpuUsage: number;
      memoryUsage: number;
      activeJobs: number;
      queuedJobs: number;
      timestamp: Date;
    }>((emit) => {
      const interval = setInterval(() => {
        emit.next({
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 100,
          activeJobs: Math.floor(Math.random() * 10),
          queuedJobs: Math.floor(Math.random() * 50),
          timestamp: new Date(),
        });
      }, 5000); // Update every 5 seconds

      return () => {
        clearInterval(interval);
      };
    });
  }),

  // Emit batch progress update (called from batch router)
  emitBatchProgress: protectedProcedure
    .input(
      z.object({
        queueId: z.number(),
        jobId: z.string(),
        progress: z.number(),
        status: z.string(),
        message: z.string(),
      })
    )
    .mutation(({ input }) => {
      eventEmitter.emit("batch-progress", input);
      return { success: true };
    }),

  // Emit voice command execution update
  emitVoiceExecution: protectedProcedure
    .input(
      z.object({
        commandId: z.string(),
        status: z.string(),
        result: z.string(),
      })
    )
    .mutation(({ input }) => {
      eventEmitter.emit("voice-execution", input);
      return { success: true };
    }),

  // Emit storyboard generation update
  emitStoryboardGeneration: protectedProcedure
    .input(
      z.object({
        storyboardId: z.string(),
        sceneNumber: z.number(),
        totalScenes: z.number(),
        status: z.string(),
        message: z.string(),
      })
    )
    .mutation(({ input }) => {
      eventEmitter.emit("storyboard-generation", input);
      return { success: true };
    }),
});
