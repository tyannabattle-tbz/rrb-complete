/**
 * Studio Audio Router
 * Handles audio file upload to S3 and project persistence for RRB Studio Pro
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut, storageGet } from "../storage";
import { TRPCError } from "@trpc/server";

function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 10);
}

export const studioAudioRouter = router({
  // Upload audio file to S3
  uploadAudio: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(), // base64 encoded
      mimeType: z.string().default("audio/wav"),
      trackId: z.string().optional(),
      projectName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { fileName, fileData, mimeType, trackId, projectName } = input;
      const userId = ctx.user.id;

      // Decode base64 to buffer
      const buffer = Buffer.from(fileData, "base64");

      // Validate file size (max 50MB)
      if (buffer.length > 50 * 1024 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Audio file exceeds 50MB limit",
        });
      }

      // Generate unique S3 key
      const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileKey = `studio/${userId}/audio/${safeName}-${randomSuffix()}${getExtension(mimeType)}`;

      try {
        const { url } = await storagePut(fileKey, buffer, mimeType);
        return {
          url,
          fileKey,
          fileName: safeName,
          mimeType,
          size: buffer.length,
          trackId: trackId || null,
          projectName: projectName || null,
        };
      } catch (err) {
        console.error("[StudioAudio] Upload failed:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload audio file",
        });
      }
    }),

  // Upload recording from microphone to S3
  uploadRecording: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(), // base64 encoded
      mimeType: z.string().default("audio/webm"),
      trackId: z.string(),
      duration: z.number(), // seconds
    }))
    .mutation(async ({ ctx, input }) => {
      const { fileName, fileData, mimeType, trackId, duration } = input;
      const userId = ctx.user.id;

      const buffer = Buffer.from(fileData, "base64");

      if (buffer.length > 100 * 1024 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Recording exceeds 100MB limit",
        });
      }

      const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileKey = `studio/${userId}/recordings/${safeName}-${randomSuffix()}${getExtension(mimeType)}`;

      try {
        const { url } = await storagePut(fileKey, buffer, mimeType);
        return {
          url,
          fileKey,
          fileName: safeName,
          mimeType,
          size: buffer.length,
          trackId,
          duration,
        };
      } catch (err) {
        console.error("[StudioAudio] Recording upload failed:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload recording",
        });
      }
    }),

  // Save studio project to S3
  saveProject: protectedProcedure
    .input(z.object({
      projectName: z.string(),
      projectData: z.string(), // JSON string of project state
    }))
    .mutation(async ({ ctx, input }) => {
      const { projectName, projectData } = input;
      const userId = ctx.user.id;

      const safeName = projectName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileKey = `studio/${userId}/projects/${safeName}-${randomSuffix()}.rrbstudio`;

      try {
        const { url } = await storagePut(fileKey, projectData, "application/json");
        return {
          url,
          fileKey,
          projectName: safeName,
          savedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.error("[StudioAudio] Project save failed:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save project",
        });
      }
    }),
});

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "audio/wav": ".wav",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/ogg": ".ogg",
    "audio/webm": ".webm",
    "audio/flac": ".flac",
    "audio/aac": ".aac",
    "audio/m4a": ".m4a",
    "audio/x-m4a": ".m4a",
  };
  return map[mimeType] || ".audio";
}
