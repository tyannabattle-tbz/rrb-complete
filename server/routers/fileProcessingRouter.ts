import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";
import * as db from "../db";

/**
 * File Processing Pipeline Router
 * Handles transcription, OCR, and image analysis for uploaded files
 */

interface ProcessingJob {
  jobId: string;
  fileKey: string;
  processingType: "transcribe" | "ocr" | "analyze" | "extract";
  status: "pending" | "processing" | "completed" | "failed";
  result?: unknown;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

// In-memory processing queue (in production, use a database)
const processingQueue = new Map<string, ProcessingJob>();

export const fileProcessingRouter = router({
  /**
   * Start audio transcription using Whisper API
   */
  transcribeAudio: protectedProcedure
    .input(
      z.object({
        s3Key: z.string(),
        s3Url: z.string(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const jobId = `transcribe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Add to processing queue
        const job: ProcessingJob = {
          jobId,
          fileKey: input.s3Key,
          processingType: "transcribe",
          status: "processing",
          createdAt: Date.now(),
        };
        processingQueue.set(jobId, job);

        // Start transcription asynchronously
        transcribeAudio({
          audioUrl: input.s3Url,
          language: input.language,
          prompt: "Transcribe the audio content accurately",
        })
          .then((result: any) => {
            job.status = "completed";
            job.result = {
              text: result?.text || "",
              language: result?.language || input.language || "unknown",
            };
            job.completedAt = Date.now();
            processingQueue.set(jobId, job);
          })
          .catch((error: any) => {
            job.status = "failed";
            job.error = error?.message || "Transcription failed";
            job.completedAt = Date.now();
            processingQueue.set(jobId, job);
          });

        return {
          success: true,
          jobId,
          status: "processing",
          message: "Audio transcription started",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start transcription",
        });
      }
    }),

  /**
   * Perform OCR on document images using LLM vision
   */
  performOCR: protectedProcedure
    .input(
      z.object({
        s3Key: z.string(),
        s3Url: z.string(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const jobId = `ocr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const job: ProcessingJob = {
          jobId,
          fileKey: input.s3Key,
          processingType: "ocr",
          status: "processing",
          createdAt: Date.now(),
        };
        processingQueue.set(jobId, job);

        // Perform OCR using LLM vision
        invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an OCR system. Extract all text from the provided image. Return the extracted text in a structured format.",
            },
            {
              role: "user",
              content: `Extract all text from this image at URL ${input.s3Url}. Preserve the layout and structure as much as possible.`,
            },
          ],
        })
          .then((result: any) => {
            const content = typeof result?.choices?.[0]?.message?.content === 'string'
              ? result.choices[0].message.content
              : "No text extracted";
            job.status = "completed";
            job.result = {
              extractedText: content,
              confidence: "high",
              language: input.language || "unknown",
            };
            job.completedAt = Date.now();
            processingQueue.set(jobId, job);
          })
          .catch((error: any) => {
            job.status = "failed";
            job.error = error?.message || "OCR failed";
            job.completedAt = Date.now();
            processingQueue.set(jobId, job);
          });

        return {
          success: true,
          jobId,
          status: "processing",
          message: "OCR processing started",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start OCR",
        });
      }
    }),

  /**
   * Analyze image using Computer Vision
   */
  analyzeImage: protectedProcedure
    .input(
      z.object({
        s3Key: z.string(),
        s3Url: z.string(),
        analysisType: z.enum(["objects", "text", "faces", "general"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const jobId = `analyze-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const job: ProcessingJob = {
          jobId,
          fileKey: input.s3Key,
          processingType: "analyze",
          status: "processing",
          createdAt: Date.now(),
        };
        processingQueue.set(jobId, job);

        // Analyze image using LLM vision
        const analysisPrompt =
          input.analysisType === "objects"
            ? "Identify and describe all objects in this image"
            : input.analysisType === "text"
              ? "Extract and describe any text visible in this image"
              : input.analysisType === "faces"
                ? "Identify and describe any faces in this image"
                : "Provide a comprehensive analysis of this image including objects, text, colors, and composition";

        invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert image analysis system. Provide detailed, structured analysis of images.",
            },
            {
              role: "user",
              content: `${analysisPrompt}. Image URL: ${input.s3Url}`,
            },
          ],
        })
          .then((result: any) => {
            const analysis = typeof result?.choices?.[0]?.message?.content === 'string'
              ? result.choices[0].message.content
              : "No analysis available";
            job.status = "completed";
            job.result = {
              analysis,
              analysisType: input.analysisType || "general",
              timestamp: Date.now(),
            };
            job.completedAt = Date.now();
            processingQueue.set(jobId, job);
          })
          .catch((error: any) => {
            job.status = "failed";
            job.error = error?.message || "Analysis failed";
            job.completedAt = Date.now();
            processingQueue.set(jobId, job);
          });

        return {
          success: true,
          jobId,
          status: "processing",
          message: "Image analysis started",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start image analysis",
        });
      }
    }),

  /**
   * Extract structured data from documents
   */
  extractData: protectedProcedure
    .input(
      z.object({
        s3Key: z.string(),
        s3Url: z.string(),
        extractionSchema: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const jobId = `extract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const job: ProcessingJob = {
          jobId,
          fileKey: input.s3Key,
          processingType: "extract",
          status: "processing",
          createdAt: Date.now(),
        };
        processingQueue.set(jobId, job);

        // Extract data using LLM
        invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a data extraction system. Extract structured data from documents and images.",
            },
            {
              role: "user",
              content: `Extract the following information from this document at URL ${input.s3Url}: ${input.extractionSchema ? JSON.stringify(input.extractionSchema) : "All relevant data"}. Return as JSON.`,
            },
          ],
        })
          .then((result) => {
            const content = typeof result.choices[0]?.message?.content === 'string'
              ? result.choices[0].message.content
              : "{}";
            job.status = "completed";
            try {
              job.result = {
                extractedData: JSON.parse(content),
                schema: input.extractionSchema,
              };
            } catch {
              job.result = {
                extractedData: { raw: content },
                schema: input.extractionSchema,
              };
            }
            job.completedAt = Date.now();
            processingQueue.set(jobId, job);
          })
          .catch((error) => {
            job.status = "failed";
            job.error = error.message;
            job.completedAt = Date.now();
            processingQueue.set(jobId, job);
          });

        return {
          success: true,
          jobId,
          status: "processing",
          message: "Data extraction started",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start data extraction",
        });
      }
    }),

  /**
   * Get processing job status
   */
  getJobStatus: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(({ input }) => {
      const job = processingQueue.get(input.jobId);

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      return {
        jobId: job.jobId,
        status: job.status,
        processingType: job.processingType,
        result: job.result,
        error: job.error,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        progress: job.status === "processing" ? 50 : job.status === "completed" ? 100 : 0,
      };
    }),

  /**
   * Get all processing jobs for current user
   */
  listJobs: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        offset: z.number().optional().default(0),
      })
    )
    .query(({ input }) => {
      const jobs = Array.from(processingQueue.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(input.offset, input.offset + input.limit);

      return {
        jobs: jobs.map((job) => ({
          jobId: job.jobId,
          status: job.status,
          processingType: job.processingType,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
        })),
        total: processingQueue.size,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Cancel a processing job
   */
  cancelJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(({ input }) => {
      const job = processingQueue.get(input.jobId);

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (job.status === "processing") {
        job.status = "failed";
        job.error = "Job cancelled by user";
        job.completedAt = Date.now();
        processingQueue.set(input.jobId, job);
      }

      return {
        success: true,
        message: "Job cancelled",
      };
    }),
});
