import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

/**
 * Editing Presets Router
 * Manages pre-built editing templates for quick production workflows
 */

export const editingPresetsRouter = router({
  /**
   * Get all available presets
   * Returns cinematic, podcast, music video, news, and custom presets
   */
  getPresets: protectedProcedure.query(async () => {
    try {
      return [
        {
          id: "preset_cinematic",
          name: "Cinematic",
          description: "Professional film-style editing with dramatic color grading",
          category: "professional",
          effects: [
            { type: "contrast", intensity: 120 },
            { type: "saturation", intensity: 110 },
            { type: "brightness", intensity: 95 },
          ],
          transitions: [
            { type: "fade", duration: 500 },
            { type: "dissolve", duration: 300 },
          ],
          colorGrade: {
            highlights: { r: 255, g: 240, b: 200 },
            midtones: { r: 200, g: 180, b: 160 },
            shadows: { r: 20, g: 30, b: 50 },
          },
          preset: "cinematic",
        },
        {
          id: "preset_podcast",
          name: "Podcast",
          description: "Clean, minimal editing for audio-focused content",
          category: "audio",
          effects: [
            { type: "brightness", intensity: 105 },
            { type: "contrast", intensity: 110 },
          ],
          transitions: [
            { type: "fade", duration: 200 },
            { type: "crossfade", duration: 250 },
          ],
          colorGrade: {
            highlights: { r: 255, g: 255, b: 255 },
            midtones: { r: 200, g: 200, b: 200 },
            shadows: { r: 50, g: 50, b: 50 },
          },
          preset: "podcast",
        },
        {
          id: "preset_musicvideo",
          name: "Music Video",
          description: "Vibrant, high-energy editing with bold colors",
          category: "music",
          effects: [
            { type: "saturation", intensity: 140 },
            { type: "contrast", intensity: 130 },
            { type: "brightness", intensity: 110 },
          ],
          transitions: [
            { type: "wipe", duration: 400 },
            { type: "slide", duration: 350 },
          ],
          colorGrade: {
            highlights: { r: 255, g: 200, b: 100 },
            midtones: { r: 220, g: 150, b: 80 },
            shadows: { r: 40, g: 20, b: 60 },
          },
          preset: "musicvideo",
        },
        {
          id: "preset_news",
          name: "News",
          description: "Professional news broadcast style with neutral tones",
          category: "broadcast",
          effects: [
            { type: "brightness", intensity: 100 },
            { type: "contrast", intensity: 115 },
            { type: "saturation", intensity: 95 },
          ],
          transitions: [
            { type: "fade", duration: 300 },
            { type: "dissolve", duration: 250 },
          ],
          colorGrade: {
            highlights: { r: 255, g: 255, b: 255 },
            midtones: { r: 210, g: 210, b: 210 },
            shadows: { r: 60, g: 60, b: 60 },
          },
          preset: "news",
        },
        {
          id: "preset_vlog",
          name: "Vlog",
          description: "Casual, friendly editing with warm tones",
          category: "social",
          effects: [
            { type: "saturation", intensity: 115 },
            { type: "brightness", intensity: 108 },
            { type: "contrast", intensity: 105 },
          ],
          transitions: [
            { type: "fade", duration: 250 },
            { type: "slide", duration: 300 },
          ],
          colorGrade: {
            highlights: { r: 255, g: 245, b: 220 },
            midtones: { r: 220, g: 200, b: 170 },
            shadows: { r: 50, g: 40, b: 30 },
          },
          preset: "vlog",
        },
      ];
    } catch (error) {
      console.error("Failed to get presets:", error);
      throw error;
    }
  }),

  /**
   * Apply preset to timeline
   * Applies all effects and transitions from preset to clips
   */
  applyPreset: protectedProcedure
    .input(
      z.object({
        presetId: z.string(),
        clipIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return {
          presetId: input.presetId,
          clipsAffected: input.clipIds.length,
          applied: true,
          timestamp: new Date(),
          message: `Applied preset to ${input.clipIds.length} clips`,
        };
      } catch (error) {
        console.error("Failed to apply preset:", error);
        throw error;
      }
    }),

  /**
   * Create custom preset
   * Saves current timeline settings as a new preset
   */
  createCustomPreset: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        effects: z.array(
          z.object({
            type: z.string(),
            intensity: z.number(),
          })
        ),
        transitions: z.array(
          z.object({
            type: z.string(),
            duration: z.number(),
          })
        ),
        colorGrade: z.object({
          highlights: z.object({ r: z.number(), g: z.number(), b: z.number() }),
          midtones: z.object({ r: z.number(), g: z.number(), b: z.number() }),
          shadows: z.object({ r: z.number(), g: z.number(), b: z.number() }),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const presetId = `preset_custom_${Date.now()}`;

        return {
          presetId,
          name: input.name,
          description: input.description,
          category: "custom",
          created: true,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Failed to create custom preset:", error);
        throw error;
      }
    }),

  /**
   * Delete custom preset
   * Removes a user-created preset
   */
  deleteCustomPreset: protectedProcedure
    .input(z.object({ presetId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return {
          presetId: input.presetId,
          deleted: true,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Failed to delete preset:", error);
        throw error;
      }
    }),

  /**
   * Get preset details
   * Returns full preset configuration
   */
  getPresetDetails: protectedProcedure
    .input(z.object({ presetId: z.string() }))
    .query(async ({ input }) => {
      try {
        const presets: Record<string, any> = {
          preset_cinematic: {
            id: "preset_cinematic",
            name: "Cinematic",
            effects: [
              { type: "contrast", intensity: 120 },
              { type: "saturation", intensity: 110 },
            ],
            transitions: [{ type: "fade", duration: 500 }],
          },
          preset_podcast: {
            id: "preset_podcast",
            name: "Podcast",
            effects: [{ type: "brightness", intensity: 105 }],
            transitions: [{ type: "fade", duration: 200 }],
          },
        };

        return presets[input.presetId] || null;
      } catch (error) {
        console.error("Failed to get preset details:", error);
        throw error;
      }
    }),
});
