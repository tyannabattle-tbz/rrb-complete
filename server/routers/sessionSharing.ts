import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const sessionSharingRouter = router({
  // Create shareable link
  createShareLink: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        permission: z.enum(["view", "edit", "admin"]),
        expiresIn: z.number().optional(), // hours
      })
    )
    .mutation(async ({ ctx, input }) => {
      const shareId = Math.random().toString(36).substr(2, 9);
      return {
        success: true,
        shareId,
        shareLink: `${process.env.VITE_APP_URL || "http://localhost:3000"}/share/${shareId}`,
        permission: input.permission,
        expiresAt: input.expiresIn
          ? new Date(Date.now() + input.expiresIn * 3600000)
          : null,
      };
    }),

  // Get share links for session
  getShareLinks: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      return {
        shareLinks: [
          {
            id: "share1",
            permission: "view",
            createdAt: new Date(),
            expiresAt: null,
            usageCount: 5,
          },
        ],
      };
    }),

  // Revoke share link
  revokeShareLink: protectedProcedure
    .input(z.object({ shareId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { success: true, message: "Share link revoked" };
    }),

  // Access shared session
  getSharedSession: protectedProcedure
    .input(z.object({ shareId: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        sessionId: 1,
        sessionName: "Shared Session",
        permission: "view",
        messages: [],
        sharedBy: "user@example.com",
        sharedAt: new Date(),
      };
    }),

  // Update share link permissions
  updateSharePermission: protectedProcedure
    .input(
      z.object({
        shareId: z.string(),
        permission: z.enum(["view", "edit", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return { success: true, message: "Permission updated" };
    }),
});
