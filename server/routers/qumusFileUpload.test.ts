import { describe, it, expect, vi, beforeEach } from "vitest";
import { qumusFileUploadRouter } from "./qumusFileUpload";
import { TRPCError } from "@trpc/server";

// Mock storage functions
vi.mock("../storage", () => ({
  storagePut: vi.fn(async (key: string, data: Buffer, mimeType: string) => ({
    url: `https://storage.example.com/${key}`,
    key,
  })),
  storageGet: vi.fn(async (key: string) => ({
    url: `https://storage.example.com/${key}?signed=true`,
    key,
  })),
}));

describe("QUMUS File Upload Router", () => {
  const mockCtx = {
    user: { id: 123 },
    req: {},
    res: {},
  };

  describe("uploadFile", () => {
    it("should upload a PDF document successfully", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const base64Data = Buffer.from("PDF content").toString("base64");

      const result = await caller.uploadFile({
        fileName: "document.pdf",
        mimeType: "application/pdf",
        fileSize: 1024,
        base64Data,
      });

      expect(result.success).toBe(true);
      expect(result.metadata.fileType).toBe("document");
      expect(result.metadata.originalName).toBe("document.pdf");
      expect(result.metadata.mimeType).toBe("application/pdf");
      expect(result.metadata.size).toBe(1024);
      expect(result.s3Url).toContain("storage.example.com");
    });

    it("should upload an image successfully", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const base64Data = Buffer.from("Image content").toString("base64");

      const result = await caller.uploadFile({
        fileName: "photo.jpg",
        mimeType: "image/jpeg",
        fileSize: 2048,
        base64Data,
      });

      expect(result.success).toBe(true);
      expect(result.metadata.fileType).toBe("image");
      expect(result.metadata.mimeType).toBe("image/jpeg");
    });

    it("should upload an audio file successfully", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const base64Data = Buffer.from("Audio content").toString("base64");

      const result = await caller.uploadFile({
        fileName: "recording.mp3",
        mimeType: "audio/mpeg",
        fileSize: 5120,
        base64Data,
      });

      expect(result.success).toBe(true);
      expect(result.metadata.fileType).toBe("audio");
      expect(result.metadata.mimeType).toBe("audio/mpeg");
    });

    it("should reject unsupported file types", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const base64Data = Buffer.from("Executable content").toString("base64");

      try {
        await caller.uploadFile({
          fileName: "malware.exe",
          mimeType: "application/x-msdownload",
          fileSize: 1024,
          base64Data,
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("BAD_REQUEST");
      }
    });

    it("should reject files exceeding size limits for documents", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const base64Data = Buffer.from("Large document").toString("base64");
      const oversizeBytes = 51 * 1024 * 1024; // 51MB (exceeds 50MB limit)

      try {
        await caller.uploadFile({
          fileName: "large.pdf",
          mimeType: "application/pdf",
          fileSize: oversizeBytes,
          base64Data,
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("BAD_REQUEST");
        expect((error as TRPCError).message).toContain("exceeds limit");
      }
    });

    it("should reject files exceeding size limits for images", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const base64Data = Buffer.from("Large image").toString("base64");
      const oversizeBytes = 11 * 1024 * 1024; // 11MB (exceeds 10MB limit)

      try {
        await caller.uploadFile({
          fileName: "large.jpg",
          mimeType: "image/jpeg",
          fileSize: oversizeBytes,
          base64Data,
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("BAD_REQUEST");
      }
    });

    it("should reject files exceeding size limits for audio", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const base64Data = Buffer.from("Large audio").toString("base64");
      const oversizeBytes = 101 * 1024 * 1024; // 101MB (exceeds 100MB limit)

      try {
        await caller.uploadFile({
          fileName: "large.mp3",
          mimeType: "audio/mpeg",
          fileSize: oversizeBytes,
          base64Data,
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(TRPCError);
        expect((error as TRPCError).code).toBe("BAD_REQUEST");
      }
    });

    it("should include optional description in metadata", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const base64Data = Buffer.from("Content").toString("base64");

      const result = await caller.uploadFile({
        fileName: "document.pdf",
        mimeType: "application/pdf",
        fileSize: 1024,
        base64Data,
        description: "Important financial report",
      });

      expect(result.metadata.description).toBe("Important financial report");
    });
  });

  describe("getUploadLimits", () => {
    it("should return correct upload limits for all file types", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const limits = await caller.getUploadLimits();

      expect(limits.documents.maxSizeMB).toBe(50);
      expect(limits.images.maxSizeMB).toBe(10);
      expect(limits.audio.maxSizeMB).toBe(100);

      expect(limits.documents.supportedTypes).toContain("application/pdf");
      expect(limits.images.supportedTypes).toContain("image/jpeg");
      expect(limits.audio.supportedTypes).toContain("audio/mpeg");
    });
  });

  describe("validateFile", () => {
    it("should validate a valid PDF file", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const validation = await caller.validateFile({
        fileName: "document.pdf",
        mimeType: "application/pdf",
        fileSize: 1024,
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.fileType).toBe("document");
    });

    it("should validate a valid image file", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const validation = await caller.validateFile({
        fileName: "photo.png",
        mimeType: "image/png",
        fileSize: 2048,
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.fileType).toBe("image");
    });

    it("should reject unsupported file type", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const validation = await caller.validateFile({
        fileName: "malware.exe",
        mimeType: "application/x-msdownload",
        fileSize: 1024,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain("not supported");
    });

    it("should reject file exceeding size limit", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const oversizeBytes = 51 * 1024 * 1024;

      const validation = await caller.validateFile({
        fileName: "large.pdf",
        mimeType: "application/pdf",
        fileSize: oversizeBytes,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain("exceeds");
    });
  });

  describe("getFileUrl", () => {
    it("should return a presigned URL for file access", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const result = await caller.getFileUrl({
        s3Key: "qumus-uploads/123/document/1234567890-abc123.pdf",
      });

      expect(result.success).toBe(true);
      expect(result.url).toContain("storage.example.com");
      expect(result.url).toContain("signed=true");
      expect(result.expiresIn).toBe(3600); // Default 1 hour
    });

    it("should support custom expiration time", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const result = await caller.getFileUrl({
        s3Key: "qumus-uploads/123/document/1234567890-abc123.pdf",
        expiresIn: 7200,
      });

      expect(result.expiresIn).toBe(7200);
    });
  });

  describe("processFile", () => {
    it("should initiate audio transcription", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const result = await caller.processFile({
        s3Key: "qumus-uploads/123/audio/1234567890-abc123.mp3",
        fileType: "audio",
        processingType: "transcribe",
      });

      expect(result.success).toBe(true);
      expect(result.processingType).toBe("transcribe");
      expect(result.fileType).toBe("audio");
      expect(result.status).toBe("processing");
    });

    it("should initiate document OCR", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const result = await caller.processFile({
        s3Key: "qumus-uploads/123/document/1234567890-abc123.pdf",
        fileType: "document",
        processingType: "ocr",
      });

      expect(result.success).toBe(true);
      expect(result.processingType).toBe("ocr");
      expect(result.fileType).toBe("document");
    });

    it("should initiate image analysis", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const result = await caller.processFile({
        s3Key: "qumus-uploads/123/image/1234567890-abc123.jpg",
        fileType: "image",
        processingType: "analyze",
      });

      expect(result.success).toBe(true);
      expect(result.processingType).toBe("analyze");
      expect(result.fileType).toBe("image");
    });
  });

  describe("getProcessingStatus", () => {
    it("should return processing status", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const status = await caller.getProcessingStatus({
        fileId: "1234567890-abc123",
      });

      expect(status.fileId).toBeDefined();
      expect(status.status).toBe("completed");
      expect(status.progress).toBe(100);
    });
  });

  describe("File Type Detection", () => {
    it("should correctly detect Word documents", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const validation = await caller.validateFile({
        fileName: "report.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileSize: 1024,
      });

      expect(validation.fileType).toBe("document");
      expect(validation.isValid).toBe(true);
    });

    it("should correctly detect Excel spreadsheets", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const validation = await caller.validateFile({
        fileName: "data.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSize: 2048,
      });

      expect(validation.fileType).toBe("document");
      expect(validation.isValid).toBe(true);
    });

    it("should correctly detect WAV audio files", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const validation = await caller.validateFile({
        fileName: "sound.wav",
        mimeType: "audio/wav",
        fileSize: 5120,
      });

      expect(validation.fileType).toBe("audio");
      expect(validation.isValid).toBe(true);
    });

    it("should correctly detect WebP images", async () => {
      const caller = qumusFileUploadRouter.createCaller(mockCtx);
      const validation = await caller.validateFile({
        fileName: "image.webp",
        mimeType: "image/webp",
        fileSize: 3072,
      });

      expect(validation.fileType).toBe("image");
      expect(validation.isValid).toBe(true);
    });
  });
});
