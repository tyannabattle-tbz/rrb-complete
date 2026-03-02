import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { storagePut, storageGet } from "../storage";
import * as db from "../db";

// Supported file types
const SUPPORTED_FILE_TYPES = {
  documents: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  images: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4"],
};

const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_FILE_TYPES.documents,
  ...SUPPORTED_FILE_TYPES.images,
  ...SUPPORTED_FILE_TYPES.audio,
];

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  documents: 50 * 1024 * 1024, // 50MB
  images: 10 * 1024 * 1024, // 10MB
  audio: 100 * 1024 * 1024, // 100MB
};

interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: number;
  fileType: "document" | "image" | "audio";
  s3Key: string;
  s3Url: string;
  userId: string;
  description?: string;
}

export const qumusFileUploadRouter = router({
  /**
   * Upload a file to QUMUS storage
   * Supports documents, images, and audio files
   */
  uploadFile: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        mimeType: z.string(),
        fileSize: z.number().positive(),
        base64Data: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate file type
        if (!ALL_SUPPORTED_TYPES.includes(input.mimeType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `File type ${input.mimeType} is not supported. Supported types: documents, images, audio`,
          });
        }

        // Determine file type category
        let fileType: "document" | "image" | "audio";
        if (SUPPORTED_FILE_TYPES.documents.includes(input.mimeType)) {
          fileType = "document";
        } else if (SUPPORTED_FILE_TYPES.images.includes(input.mimeType)) {
          fileType = "image";
        } else if (SUPPORTED_FILE_TYPES.audio.includes(input.mimeType)) {
          fileType = "audio";
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unable to determine file type",
          });
        }

        // Validate file size
        const maxSize = FILE_SIZE_LIMITS[fileType as keyof typeof FILE_SIZE_LIMITS];
        if (input.fileSize > maxSize) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `File size exceeds limit of ${maxSize / 1024 / 1024}MB for ${fileType}s`,
          });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(input.base64Data, "base64");

        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileExtension = input.fileName.split(".").pop() || "";
        const s3Key = `qumus-uploads/${ctx.user.id}/${fileType}/${timestamp}-${randomSuffix}.${fileExtension}`;

        // Upload to S3
        const { url: s3Url } = await storagePut(s3Key, buffer, input.mimeType);

        // Create metadata record
        const metadata: FileMetadata = {
          originalName: input.fileName,
          mimeType: input.mimeType,
          size: input.fileSize,
          uploadedAt: timestamp,
          fileType,
          s3Key,
          s3Url,
          userId: String(ctx.user.id),
          description: input.description,
        };

        // Store metadata in database (optional - for tracking)
        // This would require a database table for file uploads
        // For now, we return the metadata directly

        return {
          success: true,
          fileId: `${timestamp}-${randomSuffix}` as string,
          metadata,
          s3Url,
          message: `${fileType} uploaded successfully`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload file",
        });
      }
    }),

  /**
   * Get upload limits for each file type
   */
  getUploadLimits: protectedProcedure.query(() => {
    return {
      documents: {
        maxSize: FILE_SIZE_LIMITS.documents,
        maxSizeMB: FILE_SIZE_LIMITS.documents / 1024 / 1024,
        supportedTypes: SUPPORTED_FILE_TYPES.documents,
      },
      images: {
        maxSize: FILE_SIZE_LIMITS.images,
        maxSizeMB: FILE_SIZE_LIMITS.images / 1024 / 1024,
        supportedTypes: SUPPORTED_FILE_TYPES.images,
      },
      audio: {
        maxSize: FILE_SIZE_LIMITS.audio,
        maxSizeMB: FILE_SIZE_LIMITS.audio / 1024 / 1024,
        supportedTypes: SUPPORTED_FILE_TYPES.audio,
      },
    };
  }),

  /**
   * Get presigned URL for accessing uploaded file
   */
  getFileUrl: protectedProcedure
    .input(
      z.object({
        s3Key: z.string(),
        expiresIn: z.number().optional().default(3600), // 1 hour default
      })
    )
    .query(async ({ input }) => {
      try {
        const { url } = await storageGet(input.s3Key);
        return {
          success: true,
          url,
          expiresIn: input.expiresIn || 3600,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate file URL",
        });
      }
    }),

  /**
   * Validate file before upload (client-side check)
   */
  validateFile: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
      })
    )
    .query(({ input }) => {
      const errors: string[] = [];

      // Check file type
      if (!ALL_SUPPORTED_TYPES.includes(input.mimeType)) {
        errors.push(`File type ${input.mimeType} is not supported`);
      }

      // Determine file type and check size
      let fileType: "document" | "image" | "audio" | null = null;
      if (SUPPORTED_FILE_TYPES.documents.includes(input.mimeType)) {
        fileType = "document";
      } else if (SUPPORTED_FILE_TYPES.images.includes(input.mimeType)) {
        fileType = "image";
      } else if (SUPPORTED_FILE_TYPES.audio.includes(input.mimeType)) {
        fileType = "audio";
      }

      if (fileType) {
        const maxSize = FILE_SIZE_LIMITS[fileType as keyof typeof FILE_SIZE_LIMITS];
        if (input.fileSize > maxSize) {
          errors.push(`File exceeds ${maxSize / 1024 / 1024}MB limit for ${fileType}s`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        fileType,
      };
    }),

  /**
   * Process uploaded file for specific use case
   * Supports transcription for audio, OCR for documents, etc.
   */
  processFile: protectedProcedure
    .input(
      z.object({
        s3Key: z.string(),
        fileType: z.enum(["document", "image", "audio"]),
        processingType: z.enum(["transcribe", "ocr", "analyze", "extract"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // This is a placeholder for file processing
        // In production, this would integrate with:
        // - Whisper API for audio transcription
        // - Tesseract or similar for OCR
        // - Computer Vision APIs for image analysis
        // - PDF extraction libraries for documents

        return {
          success: true,
          processingType: input.processingType,
          fileType: input.fileType,
          status: "processing",
          message: `File processing initiated for ${input.processingType}`,
          // In production, return actual processing results
          results: null,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process file",
        });
      }
    }),

  /**
   * Get file processing status
   */
  getProcessingStatus: protectedProcedure
    .input(z.object({ fileId: z.string() }))
    .query(() => {
      // Placeholder for checking processing status
      return {
        fileId: "placeholder",
        status: "completed",
        progress: 100,
        results: null,
      };
    }),
});
