import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  uploadFile,
  downloadFile,
  listUserFiles,
  deleteFile,
  shareFile,
  getUserStorageUsage,
  getFileAuditTrail,
} from '../fileStorageService';

export const filesRouter = router({
  /**
   * Upload a file to cloud storage
   */
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileBuffer: z.instanceof(Buffer),
        mimeType: z.string(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return uploadFile(
        ctx.user.id,
        input.fileName,
        input.fileBuffer,
        input.mimeType,
        input.isPublic
      );
    }),

  /**
   * Download a file with presigned URL
   */
  download: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        expiresIn: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return downloadFile(ctx.user.id, input.fileId, input.expiresIn);
    }),

  /**
   * List user's files with pagination
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      return listUserFiles(ctx.user.id, input.limit, input.offset);
    }),

  /**
   * Delete a file
   */
  delete: protectedProcedure
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await deleteFile(ctx.user.id, input.fileId);
      return { success: true };
    }),

  /**
   * Share a file with expiring link
   */
  share: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        expiresInHours: z.number().default(24),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return shareFile(ctx.user.id, input.fileId, input.expiresInHours);
    }),

  /**
   * Get storage usage for user
   */
  getStorageUsage: protectedProcedure.query(async ({ ctx }) => {
    return getUserStorageUsage(ctx.user.id);
  }),

  /**
   * Get file access audit trail
   */
  getAuditTrail: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      return getFileAuditTrail(parseInt(input.fileId), input.limit);
    }),

  /**
   * Bulk download files as ZIP
   */
  bulkDownload: protectedProcedure
    .input(
      z.object({
        fileIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Placeholder for bulk download
      return {
        downloadUrl: '/api/files/bulk-download',
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      };
    }),

  /**
   * Search files by name
   */
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const { files } = await listUserFiles(ctx.user.id, 1000);
      return files.filter((f) =>
        f.fileName.toLowerCase().includes(input.query.toLowerCase())
      );
    }),
});
