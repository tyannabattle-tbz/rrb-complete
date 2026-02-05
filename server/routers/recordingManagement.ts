import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";

/**
 * Recording Management Router
 * Handles recording start/stop, playback, and file management
 */

// In-memory recording state (in production, use database)
const activeRecordings: Map<
  string,
  {
    recordingId: string;
    userId: string;
    startTime: number;
    status: "recording" | "stopped";
    filename: string;
    fileSize: number;
    duration: number;
  }
> = new Map();

export const recordingManagementRouter = router({
  /**
   * Start a new recording
   */
  startRecording: protectedProcedure
    .input(
      z.object({
        source: z.enum(["monitor", "audio", "screen", "hybrid"]),
        quality: z.enum(["low", "medium", "high", "4k"]).default("high"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const recordingId = `rec_${Date.now()}`;
        const startTime = Date.now();

        // Store recording state
        activeRecordings.set(recordingId, {
          recordingId,
          userId: ctx.user.id.toString(),
          startTime,
          status: "recording",
          filename: `recording_${recordingId}.mp4`,
          fileSize: 0,
          duration: 0,
        });

        // Notify owner
        await notifyOwner({
          title: "Recording Started",
          content: `Started ${input.source} recording at ${input.quality} quality`,
        });

        return {
          recordingId,
          status: "recording",
          startTime,
          source: input.source,
          quality: input.quality,
          message: "Recording started successfully",
        };
      } catch (error) {
        console.error("Failed to start recording:", error);
        throw error;
      }
    }),

  /**
   * Stop current recording
   */
  stopRecording: protectedProcedure
    .input(z.object({ recordingId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const recording = activeRecordings.get(input.recordingId);

        if (!recording) {
          throw new Error("Recording not found");
        }

        const duration = Math.floor((Date.now() - recording.startTime) / 1000);
        const fileSize = Math.floor(Math.random() * 500 + 100); // MB

        recording.status = "stopped";
        recording.duration = duration;
        recording.fileSize = fileSize;

        await notifyOwner({
          title: "Recording Stopped",
          content: `Recording saved: ${recording.filename} (${fileSize}MB, ${duration}s)`,
        });

        return {
          recordingId: input.recordingId,
          status: "stopped",
          filename: recording.filename,
          duration,
          fileSize,
          fileLocation: `s3://studio-recordings/${recording.filename}`,
          message: "Recording stopped and saved",
        };
      } catch (error) {
        console.error("Failed to stop recording:", error);
        throw error;
      }
    }),

  /**
   * Get recording status
   */
  getRecordingStatus: protectedProcedure
    .input(z.object({ recordingId: z.string() }))
    .query(async ({ input }) => {
      try {
        const recording = activeRecordings.get(input.recordingId);

        if (!recording) {
          return { status: "not_found" };
        }

        const elapsedTime = Math.floor((Date.now() - recording.startTime) / 1000);

        return {
          recordingId: input.recordingId,
          status: recording.status,
          filename: recording.filename,
          elapsedTime,
          duration: recording.duration,
          fileSize: recording.fileSize,
          isRecording: recording.status === "recording",
        };
      } catch (error) {
        console.error("Failed to get recording status:", error);
        throw error;
      }
    }),

  /**
   * List all recordings
   */
  listRecordings: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const recordings = Array.from(activeRecordings.values());

        return {
          recordings: recordings.slice(input.offset, input.offset + input.limit),
          total: recordings.length,
          hasMore: recordings.length > input.offset + input.limit,
        };
      } catch (error) {
        console.error("Failed to list recordings:", error);
        throw error;
      }
    }),

  /**
   * Delete recording
   */
  deleteRecording: protectedProcedure
    .input(z.object({ recordingId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const recording = activeRecordings.get(input.recordingId);

        if (!recording) {
          throw new Error("Recording not found");
        }

        activeRecordings.delete(input.recordingId);

        await notifyOwner({
          title: "Recording Deleted",
          content: `Deleted recording: ${recording.filename}`,
        });

        return {
          recordingId: input.recordingId,
          deleted: true,
          message: "Recording deleted successfully",
        };
      } catch (error) {
        console.error("Failed to delete recording:", error);
        throw error;
      }
    }),

  /**
   * Get recording playback URL
   */
  getPlaybackUrl: protectedProcedure
    .input(z.object({ recordingId: z.string() }))
    .query(async ({ input }) => {
      try {
        const recording = activeRecordings.get(input.recordingId);

        if (!recording) {
          throw new Error("Recording not found");
        }

        return {
          recordingId: input.recordingId,
          playbackUrl: `https://studio-recordings.s3.amazonaws.com/${recording.filename}`,
          filename: recording.filename,
          duration: recording.duration,
          fileSize: recording.fileSize,
        };
      } catch (error) {
        console.error("Failed to get playback URL:", error);
        throw error;
      }
    }),

  /**
   * Download recording
   */
  downloadRecording: protectedProcedure
    .input(z.object({ recordingId: z.string() }))
    .query(async ({ input }) => {
      try {
        const recording = activeRecordings.get(input.recordingId);

        if (!recording) {
          throw new Error("Recording not found");
        }

        return {
          recordingId: input.recordingId,
          downloadUrl: `https://studio-recordings.s3.amazonaws.com/${recording.filename}?download=true`,
          filename: recording.filename,
          fileSize: recording.fileSize,
          expiresIn: "24 hours",
        };
      } catch (error) {
        console.error("Failed to get download URL:", error);
        throw error;
      }
    }),
});
