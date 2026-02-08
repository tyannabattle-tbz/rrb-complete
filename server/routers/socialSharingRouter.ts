import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { SocialSharingService, ShareContentSchema } from '../services/socialSharingService';

export const socialSharingRouter = router({
  /**
   * Generate share URLs for content
   */
  generateShareUrls: publicProcedure
    .input(ShareContentSchema)
    .query(({ input }) => {
      return {
        content: input,
        shareUrls: SocialSharingService.generateAllShareUrls(input),
        qrCode: SocialSharingService.generateQRCodeUrl(input.url),
        nativeShareAvailable: typeof window !== 'undefined' && !!navigator.share,
      };
    }),

  /**
   * Generate Twitter share URL
   */
  getTwitterShareUrl: publicProcedure
    .input(ShareContentSchema)
    .query(({ input }) => {
      return {
        url: SocialSharingService.generateTwitterShareUrl(input),
        platform: 'twitter',
      };
    }),

  /**
   * Generate Facebook share URL
   */
  getFacebookShareUrl: publicProcedure
    .input(ShareContentSchema)
    .query(({ input }) => {
      return {
        url: SocialSharingService.generateFacebookShareUrl(input),
        platform: 'facebook',
      };
    }),

  /**
   * Generate LinkedIn share URL
   */
  getLinkedInShareUrl: publicProcedure
    .input(ShareContentSchema)
    .query(({ input }) => {
      return {
        url: SocialSharingService.generateLinkedInShareUrl(input),
        platform: 'linkedin',
      };
    }),

  /**
   * Generate WhatsApp share URL
   */
  getWhatsAppShareUrl: publicProcedure
    .input(ShareContentSchema)
    .query(({ input }) => {
      return {
        url: SocialSharingService.generateWhatsAppShareUrl(input),
        platform: 'whatsapp',
      };
    }),

  /**
   * Generate Telegram share URL
   */
  getTelegramShareUrl: publicProcedure
    .input(ShareContentSchema)
    .query(({ input }) => {
      return {
        url: SocialSharingService.generateTelegramShareUrl(input),
        platform: 'telegram',
      };
    }),

  /**
   * Generate email share URL
   */
  getEmailShareUrl: publicProcedure
    .input(ShareContentSchema)
    .query(({ input }) => {
      return {
        url: SocialSharingService.generateEmailShareUrl(input),
        platform: 'email',
      };
    }),

  /**
   * Generate QR code for URL
   */
  getQRCode: publicProcedure
    .input(z.object({
      url: z.string().url(),
    }))
    .query(({ input }) => {
      return {
        qrCodeUrl: SocialSharingService.generateQRCodeUrl(input.url),
        url: input.url,
      };
    }),

  /**
   * Get native share data
   */
  getNativeShareData: publicProcedure
    .input(ShareContentSchema)
    .query(({ input }) => {
      return SocialSharingService.generateNativeShareData(input);
    }),

  /**
   * Check if native share is available
   */
  isNativeShareAvailable: publicProcedure
    .query(() => {
      return {
        available: typeof navigator !== 'undefined' && !!navigator.share,
      };
    }),

  /**
   * Track share event (for analytics)
   */
  trackShare: protectedProcedure
    .input(z.object({
      platform: z.string(),
      contentId: z.string(),
      contentType: z.string(),
      timestamp: z.number(),
    }))
    .mutation(({ input, ctx }) => {
      // Track in analytics/database
      console.log(`Share tracked: ${input.platform} - ${input.contentId} by ${ctx.user.id}`);
      return {
        success: true,
        tracked: true,
        timestamp: input.timestamp,
      };
    }),

  /**
   * Get share statistics
   */
  getShareStats: protectedProcedure
    .input(z.object({
      contentId: z.string(),
    }))
    .query(({ input }) => {
      // This would query from database
      return {
        contentId: input.contentId,
        totalShares: 0,
        sharesByPlatform: {
          twitter: 0,
          facebook: 0,
          linkedin: 0,
          whatsapp: 0,
          telegram: 0,
          email: 0,
        },
      };
    }),
});
