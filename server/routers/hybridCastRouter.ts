import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { HybridCastService, HybridCastWidgetConfig } from '../_core/hybridCastService';

// Validation schemas
const appearanceSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  borderRadius: z.number().min(0).max(50),
  fontSize: z.number().min(8).max(32),
  fontFamily: z.string(),
});

const behaviorSchema = z.object({
  autoPlay: z.boolean(),
  loop: z.boolean(),
  muted: z.boolean(),
  controls: z.boolean(),
  fullscreen: z.boolean(),
  pip: z.boolean(),
});

const layoutSchema = z.object({
  position: z.enum(['inline', 'popup', 'sidebar']),
  width: z.number().min(0).max(100),
  height: z.number().min(0).max(100),
  maxWidth: z.number(),
  maxHeight: z.number(),
});

const analyticsSchema = z.object({
  trackViews: z.boolean(),
  trackEngagement: z.boolean(),
  trackShares: z.boolean(),
  trackDownloads: z.boolean(),
});

const brandingSchema = z.object({
  showLogo: z.boolean(),
  showBranding: z.boolean(),
  customLogo: z.string().optional(),
  customBranding: z.string().optional(),
});

const configSchema = z.object({
  widgetId: z.string(),
  appearance: appearanceSchema,
  behavior: behaviorSchema,
  layout: layoutSchema,
  analytics: analyticsSchema,
  branding: brandingSchema,
});

// Mock storage for widget configurations
const widgetConfigs = new Map<string, HybridCastWidgetConfig>();

export const hybridCastRouter = router({
  // Get widget configuration
  getConfig: protectedProcedure
    .input(z.object({ widgetId: z.string() }))
    .query(({ input }) => {
      const config = widgetConfigs.get(input.widgetId);
      if (!config) {
        return HybridCastService.createConfig(input.widgetId);
      }
      return config;
    }),

  // Create or update widget configuration
  saveConfig: protectedProcedure
    .input(configSchema)
    .mutation(({ input }) => {
      const validation = HybridCastService.validateConfig(input);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      widgetConfigs.set(input.widgetId, input);
      return { success: true, config: input };
    }),

  // Generate embed code
  generateEmbedCode: protectedProcedure
    .input(z.object({ widgetId: z.string() }))
    .query(({ input }) => {
      const config = widgetConfigs.get(input.widgetId) || HybridCastService.createConfig(input.widgetId);
      return HybridCastService.generateEmbedCode(config);
    }),

  // Get available presets
  getPresets: protectedProcedure.query(() => {
    return HybridCastService.getPresets();
  }),

  // Apply preset to configuration
  applyPreset: protectedProcedure
    .input(z.object({ widgetId: z.string(), presetName: z.string() }))
    .mutation(({ input }) => {
      let config = widgetConfigs.get(input.widgetId) || HybridCastService.createConfig(input.widgetId);
      config = HybridCastService.applyPreset(config, input.presetName);
      widgetConfigs.set(input.widgetId, config);
      return { success: true, config };
    }),

  // Export configuration as JSON
  exportConfig: protectedProcedure
    .input(z.object({ widgetId: z.string() }))
    .query(({ input }) => {
      const config = widgetConfigs.get(input.widgetId) || HybridCastService.createConfig(input.widgetId);
      return {
        json: HybridCastService.exportConfig(config),
        filename: `hybridcast-config-${input.widgetId}.json`,
      };
    }),

  // Import configuration from JSON
  importConfig: protectedProcedure
    .input(z.object({ jsonString: z.string() }))
    .mutation(({ input }) => {
      const config = HybridCastService.importConfig(input.jsonString);
      widgetConfigs.set(config.widgetId, config);
      return { success: true, config };
    }),

  // Validate configuration
  validateConfig: protectedProcedure
    .input(configSchema)
    .query(({ input }) => {
      return HybridCastService.validateConfig(input);
    }),

  // Reset configuration to defaults
  resetConfig: protectedProcedure
    .input(z.object({ widgetId: z.string() }))
    .mutation(({ input }) => {
      const config = HybridCastService.createConfig(input.widgetId);
      widgetConfigs.set(input.widgetId, config);
      return { success: true, config };
    }),

  // List all widget configurations
  listConfigs: protectedProcedure.query(() => {
    return Array.from(widgetConfigs.values());
  }),

  // Delete widget configuration
  deleteConfig: protectedProcedure
    .input(z.object({ widgetId: z.string() }))
    .mutation(({ input }) => {
      widgetConfigs.delete(input.widgetId);
      return { success: true };
    }),
});
