/**
 * Client Portal Router
 * Handles user profile, donations, and content uploads
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as dbHelpers from "../db-helpers";
import { TRPCError } from "@trpc/server";

export const clientPortalRouter = router({
  // Get or create client profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const profile = await dbHelpers.getClientProfile(ctx.user.id);
    if (profile.length === 0) {
      const created = await dbHelpers.getOrCreateClientProfile(
        ctx.user.id,
        ctx.user.email || ""
      );
      return created[0] || null;
    }
    return profile[0] || null;
  }),

  // Update client profile
  updateProfile: protectedProcedure
    .input(z.object({
      fullName: z.string().optional(),
      phone: z.string().optional(),
      bio: z.string().optional(),
      profilePicture: z.string().optional(),
      preferences: z.record(z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await dbHelpers.updateClientProfile(ctx.user.id, input);
      return { success: true };
    }),

  // Get donation history
  getDonationHistory: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return dbHelpers.getDonationHistory(ctx.user.id);
  }),

  // Record a donation
  recordDonation: protectedProcedure
    .input(z.object({
      amount: z.number().positive(),
      purpose: z.string().optional(),
      transactionId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const result = await dbHelpers.recordDonation(
        ctx.user.id,
        input.amount,
        input.purpose,
        input.transactionId
      );

      // Update client profile with new total
      const donations = await dbHelpers.getDonationHistory(ctx.user.id);
      const totalDonated = donations.reduce(
        (sum, d) => sum + parseFloat(d.amount.toString()),
        0
      );

      await dbHelpers.updateClientProfile(ctx.user.id, {
        totalDonated,
      });

      return { success: true };
    }),

  // Get content uploads
  getContentUploads: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return dbHelpers.getClientContentUploads(ctx.user.id);
  }),

  // Record content upload
  recordContentUpload: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      contentUrl: z.string().url(),
      contentType: z.enum(["audio", "video", "document", "image"]),
      fileSize: z.number().optional(),
      duration: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await dbHelpers.recordContentUpload(
        ctx.user.id,
        input.title,
        input.contentUrl,
        input.contentType,
        input.fileSize,
        input.duration
      );

      // Update content upload count
      const uploads = await dbHelpers.getClientContentUploads(ctx.user.id);
      await dbHelpers.updateClientProfile(ctx.user.id, {
        contentUploads: uploads.length,
      });

      return { success: true };
    }),

  // Get subscription tier and stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const profile = await dbHelpers.getClientProfile(ctx.user.id);
    const donations = await dbHelpers.getDonationHistory(ctx.user.id);
    const uploads = await dbHelpers.getClientContentUploads(ctx.user.id);

    if (profile.length === 0) {
      return {
        subscriptionTier: "free",
        totalDonated: 0,
        contentUploads: 0,
        memberSince: new Date().toISOString(),
      };
    }

    return {
      subscriptionTier: profile[0].subscriptionTier,
      totalDonated: parseFloat(profile[0].totalDonated.toString()),
      contentUploads: uploads.length,
      memberSince: profile[0].memberSince,
    };
  }),
});

export type ClientPortalRouter = typeof clientPortalRouter;
