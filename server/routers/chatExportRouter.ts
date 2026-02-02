import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// In-memory chat store for demo
const chatSessions: Array<{
  id: string;
  userId: number;
  title: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}> = [];

export const chatExportRouter = router({
  // Export chats as JSON
  exportAsJSON: protectedProcedure
    .input(
      z.object({
        sessionIds: z.array(z.string()).optional(),
        includeMetadata: z.boolean().optional().default(true),
      })
    )
    .mutation(({ input, ctx }) => {
      const sessions = chatSessions.filter((s) => s.userId === ctx.user.id);

      const filteredSessions = input.sessionIds
        ? sessions.filter((s) => input.sessionIds?.includes(s.id))
        : sessions;

      if (filteredSessions.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No chat sessions found to export",
        });
      }

      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        exportedBy: ctx.user.id,
        metadata: input.includeMetadata
          ? {
              totalSessions: filteredSessions.length,
              totalMessages: filteredSessions.reduce(
                (sum, s) => sum + s.messages.length,
                0
              ),
              dateRange: {
                start: new Date(
                  Math.min(
                    ...filteredSessions.map((s) => s.createdAt.getTime())
                  )
                ).toISOString(),
                end: new Date(
                  Math.max(
                    ...filteredSessions.map((s) => s.updatedAt.getTime())
                  )
                ).toISOString(),
              },
            }
          : undefined,
        sessions: filteredSessions.map((session) => ({
          id: session.id,
          title: session.title,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
          messageCount: session.messages.length,
          messages: session.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
          })),
        })),
      };

      return {
        success: true,
        data: exportData,
        fileName: `qumus-chats-${new Date().toISOString().split("T")[0]}.json`,
      };
    }),

  // Export chats as CSV
  exportAsCSV: protectedProcedure
    .input(
      z.object({
        sessionIds: z.array(z.string()).optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const sessions = chatSessions.filter((s) => s.userId === ctx.user.id);

      const filteredSessions = input.sessionIds
        ? sessions.filter((s) => input.sessionIds?.includes(s.id))
        : sessions;

      if (filteredSessions.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No chat sessions found to export",
        });
      }

      // Build CSV content
      let csvContent = "Session ID,Session Title,Message Role,Message Content,Timestamp\n";

      filteredSessions.forEach((session) => {
        session.messages.forEach((msg) => {
          const escapedTitle = `"${session.title.replace(/"/g, '""')}"`;
          const escapedContent = `"${msg.content.replace(/"/g, '""')}"`;
          csvContent += `${session.id},${escapedTitle},${msg.role},${escapedContent},${msg.timestamp.toISOString()}\n`;
        });
      });

      return {
        success: true,
        data: csvContent,
        fileName: `qumus-chats-${new Date().toISOString().split("T")[0]}.csv`,
        mimeType: "text/csv",
      };
    }),

  // Export chats as Markdown
  exportAsMarkdown: protectedProcedure
    .input(
      z.object({
        sessionIds: z.array(z.string()).optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const sessions = chatSessions.filter((s) => s.userId === ctx.user.id);

      const filteredSessions = input.sessionIds
        ? sessions.filter((s) => input.sessionIds?.includes(s.id))
        : sessions;

      if (filteredSessions.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No chat sessions found to export",
        });
      }

      // Build Markdown content
      let mdContent = `# Qumus Chat Export\n\n`;
      mdContent += `**Exported:** ${new Date().toISOString()}\n`;
      mdContent += `**Total Sessions:** ${filteredSessions.length}\n\n`;

      filteredSessions.forEach((session, index) => {
        mdContent += `## Session ${index + 1}: ${session.title}\n\n`;
        mdContent += `**Created:** ${session.createdAt.toISOString()}\n`;
        mdContent += `**Last Updated:** ${session.updatedAt.toISOString()}\n\n`;

        session.messages.forEach((msg) => {
          const role = msg.role === "user" ? "👤 User" : "🤖 Assistant";
          mdContent += `### ${role}\n\n`;
          mdContent += `${msg.content}\n\n`;
          mdContent += `*${msg.timestamp.toISOString()}*\n\n`;
        });

        mdContent += `---\n\n`;
      });

      return {
        success: true,
        data: mdContent,
        fileName: `qumus-chats-${new Date().toISOString().split("T")[0]}.md`,
        mimeType: "text/markdown",
      };
    }),

  // Import chats from JSON
  importFromJSON: protectedProcedure
    .input(
      z.object({
        jsonData: z.string(),
        overwrite: z.boolean().optional().default(false),
      })
    )
    .mutation(({ input, ctx }) => {
      try {
        const importedData = JSON.parse(input.jsonData);

        if (!importedData.sessions || !Array.isArray(importedData.sessions)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid JSON format. Expected 'sessions' array.",
          });
        }

        let importedCount = 0;

        importedData.sessions.forEach((session: any) => {
          const newSession = {
            id: `session-${Date.now()}-${Math.random()}`,
            userId: ctx.user.id as any,
            title: session.title || "Imported Session",
            messages: (session.messages || []).map((msg: any) => ({
              id: `msg-${Date.now()}-${Math.random()}`,
              role: msg.role as 'user' | 'assistant',
              content: msg.content || "",
              timestamp: new Date(msg.timestamp || Date.now()),
            })),
            createdAt: new Date(session.createdAt || Date.now()),
            updatedAt: new Date(session.updatedAt || Date.now()),
          };

          chatSessions.push(newSession);
          importedCount++;
        });

        return {
          success: true,
          importedCount,
          message: `Successfully imported ${importedCount} chat session(s)`,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to parse JSON: ${error.message}`,
        });
      }
    }),

  // Get export statistics
  getExportStats: protectedProcedure.query(({ ctx }) => {
    const userSessions = chatSessions.filter((s) => s.userId === ctx.user.id);

    const totalMessages = userSessions.reduce(
      (sum, s) => sum + s.messages.length,
      0
    );
    const oldestSession =
      userSessions.length > 0
        ? new Date(
            Math.min(
              ...userSessions.map((s) => s.createdAt.getTime())
            )
          )
        : null;
    const newestSession =
      userSessions.length > 0
        ? new Date(
            Math.max(
              ...userSessions.map((s) => s.updatedAt.getTime())
            )
          )
        : null;

    return {
      totalSessions: userSessions.length,
      totalMessages,
      oldestSession,
      newestSession,
      averageMessagesPerSession:
        userSessions.length > 0
          ? Math.round(totalMessages / userSessions.length)
          : 0,
    };
  }),

  // List sessions for export
  listSessions: protectedProcedure.query(({ ctx }) => {
    return chatSessions
      .filter((s) => s.userId === ctx.user.id)
      .map((s) => ({
        id: s.id,
        title: s.title,
        messageCount: s.messages.length,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }),

  // Delete exported data
  deleteSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(({ input, ctx }) => {
      const index = chatSessions.findIndex(
        (s) => s.id === input.sessionId && s.userId === ctx.user.id
      );

      if (index === -1) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      chatSessions.splice(index, 1);
      return { success: true };
    }),
});
