import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { storyboards, scenes, shots } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const storyboardRouter = router({
  // Generate storyboard from script
  generate: protectedProcedure
    .input(z.object({ scriptContent: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Parse script to extract scenes
        const parsedScenes = parseScript(input.scriptContent);

        // Create storyboard
        const storyboardResult = await db.insert(storyboards).values({
          userId: ctx.user.id,
          title: "Generated Storyboard",
          scriptContent: input.scriptContent,
          totalDuration: parsedScenes.reduce((sum, s) => sum + s.duration, 0),
          genre: "Drama",
          colorPalette: ["#1a1a2e", "#16213e", "#0f3460", "#e94560"],
          metadata: { generatedAt: new Date().toISOString() },
        });

        const storyboardId = storyboardResult[0].insertId || 1;

        // Create scenes
        const createdScenes = [];
        for (const parsedScene of parsedScenes) {
          const sceneResult = await db.insert(scenes).values({
            storyboardId,
            sceneNumber: parsedScene.sceneNumber,
            title: parsedScene.title,
            location: parsedScene.location,
            mood: "Dramatic",
            duration: parsedScene.duration,
            lighting: "Soft key light with rim lighting",
            soundDesign: "Ambient background with dialogue",
            visualEffects: [],
          });

          const sceneId = sceneResult[0].insertId || 1;

          // Create shots for scene
          const shotCount = Math.ceil(parsedScene.duration / 5);
          for (let i = 0; i < shotCount; i++) {
            await db.insert(shots).values({
              sceneId,
              shotNumber: i + 1,
              composition: ["wide", "medium", "close-up"][i % 3],
              angle: ["level", "high", "low"][i % 3],
              movement: "Static",
              duration: Math.min(5, parsedScene.duration - i * 5),
            });
          }

          createdScenes.push({
            id: sceneId.toString(),
            sceneNumber: parsedScene.sceneNumber,
            title: parsedScene.title,
            location: parsedScene.location,
            mood: "Dramatic",
            duration: parsedScene.duration,
            shots: Array.from({ length: shotCount }, (_, i) => ({
              shotNumber: i + 1,
              composition: ["wide", "medium", "close-up"][i % 3],
              angle: ["level", "high", "low"][i % 3],
              movement: "Static",
              duration: Math.min(5, parsedScene.duration - i * 5),
            })),
            lighting: "Soft key light with rim lighting",
            soundDesign: "Ambient background with dialogue",
            visualEffects: [],
          });
        }

        return {
          id: storyboardId.toString(),
          title: "Generated Storyboard",
          scenes: createdScenes,
          totalDuration: parsedScenes.reduce((sum, s) => sum + s.duration, 0),
          metadata: {
            genre: "Drama",
            colorPalette: ["#1a1a2e", "#16213e", "#0f3460", "#e94560"],
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate storyboard",
        });
      }
    }),

  // Export storyboard as PDF
  exportPDF: protectedProcedure
    .input(z.object({ storyboardId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // In production, use a PDF library like pdfkit or reportlab
        return {
          success: true,
          message: "PDF export initiated",
          url: `/storyboards/${input.storyboardId}.pdf`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export PDF",
        });
      }
    }),

  // Get storyboard by ID
  getStoryboard: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const storyboard = await db
          .select()
          .from(storyboards)
          .where(eq(storyboards.id, parseInt(input.id)))
          .limit(1);

        if (!storyboard.length) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return storyboard[0];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch storyboard",
        });
      }
    }),

  // List user's storyboards
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userStoryboards = await db
        .select()
        .from(storyboards)
        .where(eq(storyboards.userId, ctx.user.id));

      return userStoryboards;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch storyboards",
      });
    }
  }),
});

// Helper function to parse script
function parseScript(scriptContent: string) {
  const scenes = [];
  const lines = scriptContent.split("\n");
  let currentScene = null;
  let sceneNumber = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect scene headings (INT./EXT.)
    if (trimmed.startsWith("INT.") || trimmed.startsWith("EXT.")) {
      if (currentScene) {
        scenes.push(currentScene);
      }
      sceneNumber++;
      const parts = trimmed.split(" - ");
      currentScene = {
        sceneNumber,
        title: `Scene ${sceneNumber}`,
        location: parts[0],
        duration: 30, // Default duration
      };
    }
  }

  if (currentScene) {
    scenes.push(currentScene);
  }

  return scenes.length > 0
    ? scenes
    : [
        {
          sceneNumber: 1,
          title: "Scene 1",
          location: "Unknown Location",
          duration: 30,
        },
      ];
}
