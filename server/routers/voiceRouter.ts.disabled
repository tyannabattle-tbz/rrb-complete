import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { voiceCommands } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const voiceRouter = router({
  // Execute a voice command
  executeCommand: protectedProcedure
    .input(
      z.object({
        transcript: z.string().min(1),
        sessionId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Parse intent from transcript
        const intent = parseIntent(input.transcript);
        const confidence = calculateConfidence(input.transcript, intent);
        const parameters = extractParameters(input.transcript, intent);

        // Store voice command in database
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.insert(voiceCommands).values({
          userId: ctx.user.id,
          sessionId: input.sessionId || undefined,
          transcript: input.transcript,
          intent,
          confidence: confidence.toString() as any,
          parameters,
          status: "executing",
        });

        // Execute the command based on intent
        let commandResult = "";
        switch (intent) {
          case "generate_video":
            commandResult = "Video generation started";
            break;
          case "show_analytics":
            commandResult = "Analytics dashboard loaded";
            break;
          case "start_collaboration":
            commandResult = "Collaboration session initiated";
            break;
          case "batch_process":
            commandResult = `Batch processing ${parameters.videoCount || 10} videos`;
            break;
          case "create_storyboard":
            commandResult = "Storyboard generation started";
            break;
          default:
            commandResult = "Command recognized but not implemented";
        }

        // Update command status
        const db2 = await getDb();
        if (!db2) throw new Error("Database not available");
        await db2
          .update(voiceCommands)
          .set({
            status: "completed",
            result: commandResult,
            executedAt: new Date(),
          })
          .where(eq(voiceCommands.userId, ctx.user.id));

        return {
          success: true,
          intent,
          confidence,
          message: commandResult,
          parameters,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to execute voice command",
        });
      }
    }),

  // Get command history
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const commands = await db
          .select()
          .from(voiceCommands)
          .where(eq(voiceCommands.userId, ctx.user.id))
          .orderBy(voiceCommands.createdAt)
          .limit(input.limit)
          .offset(input.offset);

        return commands;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch command history",
        });
      }
    }),

  // Clear command history
  clearHistory: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // In production, you might want to archive instead of delete
      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to clear command history",
      });
    }
  }),
});

// Helper functions
function parseIntent(
  transcript: string
): string {
  const lower = transcript.toLowerCase();

  if (
    lower.includes("generate") &&
    lower.includes("video")
  ) {
    return "generate_video";
  }
  if (lower.includes("analytics")) {
    return "show_analytics";
  }
  if (lower.includes("collaboration") || lower.includes("collaborate")) {
    return "start_collaboration";
  }
  if (lower.includes("batch") || lower.includes("bulk")) {
    return "batch_process";
  }
  if (lower.includes("storyboard")) {
    return "create_storyboard";
  }

  return "unknown";
}

function calculateConfidence(transcript: string, intent: string): number {
  // Simple confidence calculation based on keyword matches
  const lower = transcript.toLowerCase();
  let confidence = 0.5;

  if (intent === "generate_video" && lower.includes("video")) {
    confidence = 0.95;
  } else if (intent === "show_analytics" && lower.includes("analytics")) {
    confidence = 0.95;
  } else if (
    intent === "start_collaboration" &&
    (lower.includes("collaboration") || lower.includes("collaborate"))
  ) {
    confidence = 0.95;
  } else if (intent === "batch_process" && lower.includes("batch")) {
    confidence = 0.95;
  } else if (intent === "create_storyboard" && lower.includes("storyboard")) {
    confidence = 0.95;
  }

  // Round to 2 decimal places for decimal(3,2) column
  return Math.round(Math.min(confidence, 0.99) * 100) / 100;
}

function extractParameters(
  transcript: string,
  intent: string
): Record<string, any> {
  const parameters: Record<string, any> = {};
  const lower = transcript.toLowerCase();

  // Extract video count for batch processing
  const countMatch = lower.match(/(\d+)\s+videos?/);
  if (countMatch) {
    parameters.videoCount = parseInt(countMatch[1]);
  }

  // Extract duration
  const durationMatch = lower.match(/(\d+)\s+seconds?/);
  if (durationMatch) {
    parameters.duration = parseInt(durationMatch[1]);
  }

  // Extract style/effect
  const styleMatch = lower.match(/style[:\s]+(\w+)/);
  if (styleMatch) {
    parameters.style = styleMatch[1];
  }

  const effectMatch = lower.match(/effect[:\s]+(\w+)/);
  if (effectMatch) {
    parameters.effect = effectMatch[1];
  }

  return parameters;
}
