import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { VideoWatermarkService } from '../_core/videoWatermarkService';

// Validation schemas
const logoWatermarkSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(['logo', 'both']),
  logoUrl: z.string().url(),
  position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']),
  width: z.number().min(10).max(500),
  height: z.number().min(10).max(500),
  opacity: z.number().min(0).max(1),
  scale: z.number().min(0.1).max(1),
  padding: z.number().min(0),
});

const textWatermarkSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(['text', 'both']),
  text: z.string().min(1),
  position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']),
  fontSize: z.number().min(8).max(72),
  fontFamily: z.string(),
  fontColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  backgroundColor: z.string().optional(),
  opacity: z.number().min(0).max(1),
  scale: z.number().min(0.1).max(1),
  padding: z.number().min(0),
  rotation: z.number().optional(),
});

// Mock storage for watermark configurations
const watermarkConfigs = new Map<string, any>();

export const watermarkRouter = router({
  // Get watermark presets
  getPresets: protectedProcedure.query(() => {
    return VideoWatermarkService.getPresets();
  }),

  // Create logo watermark
  createLogoWatermark: protectedProcedure
    .input(
      z.object({
        logoUrl: z.string().url(),
        position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']).optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        opacity: z.number().optional(),
        scale: z.number().optional(),
        padding: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const watermark = VideoWatermarkService.createLogoWatermark(input.logoUrl, input.position, {
        width: input.width,
        height: input.height,
        opacity: input.opacity,
        scale: input.scale,
        padding: input.padding,
      });

      const validation = VideoWatermarkService.validateWatermark(watermark);
      if (!validation.valid) {
        throw new Error(`Invalid watermark: ${validation.errors.join(', ')}`);
      }

      return watermark;
    }),

  // Create text watermark
  createTextWatermark: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']).optional(),
        fontSize: z.number().optional(),
        fontFamily: z.string().optional(),
        fontColor: z.string().optional(),
        backgroundColor: z.string().optional(),
        opacity: z.number().optional(),
        scale: z.number().optional(),
        padding: z.number().optional(),
        rotation: z.number().optional(),
      })
    )
    .mutation(({ input }) => {
      const watermark = VideoWatermarkService.createTextWatermark(input.text, input.position, {
        fontSize: input.fontSize,
        fontFamily: input.fontFamily,
        fontColor: input.fontColor,
        backgroundColor: input.backgroundColor,
        opacity: input.opacity,
        scale: input.scale,
        padding: input.padding,
        rotation: input.rotation,
      });

      const validation = VideoWatermarkService.validateWatermark(watermark);
      if (!validation.valid) {
        throw new Error(`Invalid watermark: ${validation.errors.join(', ')}`);
      }

      return watermark;
    }),

  // Apply preset
  applyPreset: protectedProcedure
    .input(z.object({ presetName: z.string() }))
    .query(({ input }) => {
      return VideoWatermarkService.applyPreset(input.presetName);
    }),

  // Validate watermark
  validateWatermark: protectedProcedure
    .input(
      z.union([
        logoWatermarkSchema,
        textWatermarkSchema,
      ])
    )
    .query(({ input }) => {
      return VideoWatermarkService.validateWatermark(input);
    }),

  // Generate watermark SVG
  generateSVG: protectedProcedure
    .input(
      z.object({
        watermark: textWatermarkSchema,
        videoWidth: z.number(),
        videoHeight: z.number(),
      })
    )
    .query(({ input }) => {
      return {
        svg: VideoWatermarkService.generateWatermarkSVG(input.watermark, input.videoWidth, input.videoHeight),
      };
    }),

  // Get position coordinates
  getPositionCoordinates: protectedProcedure
    .input(
      z.object({
        position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']),
        videoWidth: z.number(),
        videoHeight: z.number(),
        elementWidth: z.number().optional(),
        elementHeight: z.number().optional(),
      })
    )
    .query(({ input }) => {
      return VideoWatermarkService.getPositionCoordinates(
        input.position,
        input.videoWidth,
        input.videoHeight,
        input.elementWidth,
        input.elementHeight
      );
    }),

  // Save watermark configuration
  saveConfiguration: protectedProcedure
    .input(
      z.object({
        configId: z.string(),
        logo: logoWatermarkSchema.optional(),
        text: textWatermarkSchema.optional(),
      })
    )
    .mutation(({ input }) => {
      if (!input.logo && !input.text) {
        throw new Error('At least one watermark type (logo or text) is required');
      }

      const config = {
        configId: input.configId,
        logo: input.logo,
        text: input.text,
        createdAt: new Date(),
      };

      watermarkConfigs.set(input.configId, config);
      return { success: true, config };
    }),

  // Get configuration
  getConfiguration: protectedProcedure
    .input(z.object({ configId: z.string() }))
    .query(({ input }) => {
      return watermarkConfigs.get(input.configId) || null;
    }),

  // List all configurations
  listConfigurations: protectedProcedure.query(() => {
    return Array.from(watermarkConfigs.values());
  }),

  // Delete configuration
  deleteConfiguration: protectedProcedure
    .input(z.object({ configId: z.string() }))
    .mutation(({ input }) => {
      watermarkConfigs.delete(input.configId);
      return { success: true };
    }),

  // Create composite watermark
  createComposite: protectedProcedure
    .input(
      z.object({
        logo: logoWatermarkSchema.optional(),
        text: textWatermarkSchema.optional(),
      })
    )
    .mutation(({ input }) => {
      const composite = VideoWatermarkService.createCompositeWatermark(input.logo, input.text);

      if (!composite.logo && !composite.text) {
        throw new Error('At least one valid watermark is required');
      }

      return composite;
    }),
});
