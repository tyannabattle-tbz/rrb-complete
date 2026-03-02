import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

export const llmStoryboardingRouter = router({
  // Generate scene descriptions from script using LLM
  generateSceneDescriptions: protectedProcedure
    .input(z.object({ scriptContent: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert film director and cinematographer. Analyze scripts and generate detailed scene descriptions with visual storytelling elements.",
            },
            {
              role: "user",
              content: `Analyze this script and generate detailed scene descriptions for each scene. For each scene, provide: scene number, location, mood, lighting setup, and visual elements.\n\nScript:\n${input.scriptContent}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "scene_descriptions",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  scenes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        sceneNumber: { type: "number" },
                        location: { type: "string" },
                        mood: { type: "string" },
                        lighting: { type: "string" },
                        visualElements: { type: "array", items: { type: "string" } },
                        cameraMovement: { type: "string" },
                      },
                      required: [
                        "sceneNumber",
                        "location",
                        "mood",
                        "lighting",
                        "visualElements",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["scenes"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No response from LLM");
        const contentStr = typeof content === 'string' ? content : '';
        const parsed = JSON.parse(contentStr);
        return parsed.scenes;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate scene descriptions",
        });
      }
    }),

  // Generate shot composition suggestions using LLM
  generateShotSuggestions: protectedProcedure
    .input(z.object({ sceneDescription: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert cinematographer. Generate detailed shot composition suggestions for film scenes.",
            },
            {
              role: "user",
              content: `Based on this scene description, generate 5 shot composition suggestions with specific camera angles, movements, and framing.\n\nScene: ${input.sceneDescription}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "shot_suggestions",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  shots: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        shotNumber: { type: "number" },
                        composition: { type: "string" },
                        angle: { type: "string" },
                        movement: { type: "string" },
                        duration: { type: "number" },
                        notes: { type: "string" },
                      },
                      required: [
                        "shotNumber",
                        "composition",
                        "angle",
                        "movement",
                        "duration",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["shots"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No response from LLM");
        const contentStr = typeof content === 'string' ? content : '';
        const parsed = JSON.parse(contentStr);
        return parsed.shots;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate shot suggestions",
        });
      }
    }),

  // Generate lighting recommendations using LLM
  generateLightingRecommendations: protectedProcedure
    .input(z.object({ sceneDescription: z.string(), mood: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a professional lighting designer for film and television. Generate detailed lighting setups and recommendations.",
            },
            {
              role: "user",
              content: `Generate a detailed lighting setup for this scene with the specified mood.\n\nScene: ${input.sceneDescription}\nMood: ${input.mood}\n\nProvide specific lighting equipment, positions, intensities, and color temperatures.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "lighting_setup",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  keyLight: { type: "string" },
                  fillLight: { type: "string" },
                  backLight: { type: "string" },
                  practicals: { type: "array", items: { type: "string" } },
                  colorTemperature: { type: "string" },
                  intensity: { type: "string" },
                  notes: { type: "string" },
                },
                required: [
                  "keyLight",
                  "fillLight",
                  "backLight",
                  "colorTemperature",
                  "intensity",
                ],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No response from LLM");
        const contentStr = typeof content === 'string' ? content : '';
        const parsed = JSON.parse(contentStr);
        return parsed;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate lighting recommendations",
        });
      }
    }),

  // Generate color palette suggestions using LLM
  generateColorPalette: protectedProcedure
    .input(z.object({ genre: z.string(), mood: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a color grading expert for film. Generate color palettes and grading suggestions.",
            },
            {
              role: "user",
              content: `Generate a professional color palette for a ${input.genre} film with a ${input.mood} mood. Include specific hex colors and grading suggestions.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "color_palette",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  primaryColors: { type: "array", items: { type: "string" } },
                  accentColors: { type: "array", items: { type: "string" } },
                  gradingNotes: { type: "string" },
                  contrastLevel: { type: "string" },
                  saturation: { type: "string" },
                },
                required: [
                  "primaryColors",
                  "accentColors",
                  "gradingNotes",
                  "contrastLevel",
                  "saturation",
                ],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No response from LLM");
        const contentStr = typeof content === 'string' ? content : '';
        const parsed = JSON.parse(contentStr);
        return parsed;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate color palette",
        });
      }
    }),

  // Generate dialogue and action extraction using LLM
  extractDialogueAndActions: protectedProcedure
    .input(z.object({ scriptContent: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a script analyst. Extract and organize dialogue and action sequences from scripts.",
            },
            {
              role: "user",
              content: `Extract all dialogue and action sequences from this script. Organize by scene and character.\n\nScript:\n${input.scriptContent}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "script_extraction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  scenes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        sceneNumber: { type: "number" },
                        dialogue: { type: "array", items: { type: "string" } },
                        actions: { type: "array", items: { type: "string" } },
                        characters: { type: "array", items: { type: "string" } },
                      },
                      required: ["sceneNumber", "dialogue", "actions"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["scenes"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No response from LLM");
        const contentStr = typeof content === 'string' ? content : '';
        const parsed = JSON.parse(contentStr);
        return parsed.scenes;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to extract dialogue and actions",
        });
      }
    }),
});
