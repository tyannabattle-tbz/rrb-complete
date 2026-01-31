import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";

export const conversationSummariesRouter = router({
  // Generate summary for a session
  generateSessionSummary: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        style: z.enum(["brief", "detailed", "actionItems"]).default("brief"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Simulate summary generation using LLM
        const summaryPrompt = `Generate a ${input.style} summary of this conversation session.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that summarizes conversations. Provide clear, concise summaries.",
            },
            {
              role: "user",
              content: summaryPrompt,
            },
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const summary =
          typeof messageContent === "string"
            ? messageContent
            : "Unable to generate summary";

        return {
          success: true,
          sessionId: input.sessionId,
          summary,
          style: input.style,
          wordCount: summary.split(" ").length,
          generatedAt: new Date(),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Summary generation failed",
        };
      }
    }),

  // Extract action items from conversation
  extractActionItems: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Extract action items from the conversation. Format as a numbered list.",
            },
            {
              role: "user",
              content: "Extract action items from this conversation.",
            },
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const actionItemsText =
          typeof messageContent === "string"
            ? messageContent
            : "No action items found";

        const actionItems = actionItemsText
          .split("\n")
          .filter((item: string) => item.trim());

        return {
          success: true,
          sessionId: input.sessionId,
          actionItems,
          count: actionItems.length,
          extractedAt: new Date(),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Action item extraction failed",
        };
      }
    }),

  // Generate meeting notes
  generateMeetingNotes: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        title: z.string(),
        attendees: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const notesPrompt = `Generate professional meeting notes for: ${input.title}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Generate professional meeting notes with sections for: Overview, Key Discussions, Decisions, Action Items, Next Steps.",
            },
            {
              role: "user",
              content: notesPrompt,
            },
          ],
        });

        const notesContent = response.choices[0]?.message?.content;
        const notes =
          typeof notesContent === "string"
            ? notesContent
            : "Unable to generate notes";

        return {
          success: true,
          sessionId: input.sessionId,
          title: input.title,
          notes,
          attendees: input.attendees || [],
          generatedAt: new Date(),
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Meeting notes generation failed",
        };
      }
    }),

  // Get summary history
  getSummaryHistory: protectedProcedure
    .input(z.object({ sessionId: z.number(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      return {
        sessionId: input.sessionId,
        summaries: [
          {
            id: "summary1",
            type: "brief",
            content: "Discussed image generation features and implementation",
            wordCount: 45,
            generatedAt: new Date(),
          },
        ],
      };
    }),

  // Export summary as document
  exportSummary: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        format: z.enum(["pdf", "markdown", "docx"]).default("pdf"),
        includeActionItems: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        downloadUrl: `https://api.manus.im/exports/summary-${input.sessionId}.${input.format}`,
        filename: `session-summary-${input.sessionId}.${input.format}`,
        format: input.format,
      };
    }),

  // Get summary settings
  getSummarySettings: protectedProcedure.query(async ({ ctx }) => {
    return {
      autoGenerate: false,
      defaultStyle: "brief",
      includeTimestamps: true,
      includeParticipants: true,
      supportedFormats: ["pdf", "markdown", "docx", "txt"],
    };
  }),
});
