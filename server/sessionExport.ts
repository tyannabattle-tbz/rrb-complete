import { getDb } from "./db";
import type { AgentSession, Message } from "../drizzle/schema";

/**
 * Session Export Service
 * Handles exporting session data in various formats
 */

export interface SessionExportData {
  session: any;
  messages: any[];
  tools: any[];
  tasks: any[];
  memory: any[];
  metadata: {
    exportedAt: Date;
    duration: number;
    messageCount: number;
    toolCount: number;
  };
}

/**
 * Export session as JSON
 */
export async function exportSessionAsJSON(
  sessionId: number
): Promise<SessionExportData> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Get session (mock for now)
    const session = {
      id: sessionId,
      sessionName: `Session ${sessionId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Get messages (mock for now)
    const messages: any[] = [
      {
        id: 1,
        role: "user",
        content: "Hello, what can you do?",
        createdAt: new Date(),
      },
      {
        id: 2,
        role: "assistant",
        content: "I can help with various tasks...",
        createdAt: new Date(),
      },
    ];

    // Get tool executions (mock for now)
    const tools: any[] = [];

    // Get tasks (mock for now)
    const tasks: any[] = [];

    // Get memory entries (mock for now)
    const memory: any[] = [];

    const startTime = new Date(session.createdAt).getTime();
    const endTime = new Date(session.updatedAt).getTime();
    const duration = (endTime - startTime) / 1000; // in seconds

    return {
      session,
      messages,
      tools,
      tasks,
      memory,
      metadata: {
        exportedAt: new Date(),
        duration,
        messageCount: messages.length,
        toolCount: tools.length,
      },
    };
  } catch (error) {
    console.error("[Session Export] Error exporting session:", error);
    throw error;
  }
}

/**
 * Export session as formatted JSON string
 */
export async function exportSessionAsJSONString(
  sessionId: number
): Promise<string> {
  const data = await exportSessionAsJSON(sessionId);
  return JSON.stringify(data, null, 2);
}

/**
 * Export session as CSV (messages only)
 */
export async function exportSessionAsCSV(sessionId: number): Promise<string> {
  const data = await exportSessionAsJSON(sessionId);

  // Create CSV header
  const headers = ["Timestamp", "Role", "Content", "Tool Count"];
  const rows = [headers.join(",")];

  // Add message rows
  for (const message of data.messages) {
    const timestamp = new Date(message.createdAt).toISOString();
    const role = message.role;
    const content = (message.content || "").replace(/"/g, '""');
    const toolCount = data.tools.filter((t: any) => t.messageId === message.id)
      .length;

    rows.push(
      `"${timestamp}","${role}","${content}",${toolCount}`
    );
  }

  return rows.join("\n");
}

/**
 * Export session as HTML report
 */
export async function exportSessionAsHTML(sessionId: number): Promise<string> {
  const data = await exportSessionAsJSON(sessionId);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agent Session Report - ${data.session.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { color: #1f2937; font-size: 28px; margin-bottom: 5px; }
    .metadata { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 15px; }
    .stat { background: #f3f4f6; padding: 15px; border-radius: 8px; }
    .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
    section { margin-bottom: 40px; }
    h2 { color: #1f2937; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 10px; }
    .message { background: #f9fafb; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #3b82f6; }
    .message.assistant { border-left-color: #10b981; }
    .message-role { font-weight: bold; color: #3b82f6; text-transform: uppercase; font-size: 12px; }
    .message.assistant .message-role { color: #10b981; }
    .message-content { margin-top: 8px; color: #374151; }
    .tool { background: #fef3c7; padding: 12px; margin: 10px 0; border-radius: 6px; border-left: 3px solid #f59e0b; }
    .tool-name { font-weight: bold; color: #92400e; }
    .task { background: #dbeafe; padding: 12px; margin: 10px 0; border-radius: 6px; border-left: 3px solid #3b82f6; }
    .task-status { font-weight: bold; color: #1e40af; }
    footer { border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Agent Session Report</h1>
      <p>${data.session.name}</p>
      <div class="metadata">
        <div class="stat">
          <div class="stat-label">Duration</div>
          <div class="stat-value">${data.metadata.duration.toFixed(1)}s</div>
        </div>
        <div class="stat">
          <div class="stat-label">Messages</div>
          <div class="stat-value">${data.metadata.messageCount}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Tools</div>
          <div class="stat-value">${data.metadata.toolCount}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Exported</div>
          <div class="stat-value">${new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </header>

    <section>
      <h2>Conversation</h2>
      ${data.messages
        .map(
          (msg: any) => `
        <div class="message ${msg.role === "assistant" ? "assistant" : ""}">
          <div class="message-role">${msg.role}</div>
          <div class="message-content">${msg.content}</div>
        </div>
      `
        )
        .join("")}
    </section>

    ${
      data.tools.length > 0
        ? `
    <section>
      <h2>Tool Executions</h2>
      ${data.tools
        .map(
          (tool: any) => `
        <div class="tool">
          <div class="tool-name">${tool.toolName}</div>
          <div>Status: ${tool.status}</div>
          <div>Duration: ${tool.duration}ms</div>
        </div>
      `
        )
        .join("")}
    </section>
    `
        : ""
    }

    ${
      data.tasks.length > 0
        ? `
    <section>
      <h2>Tasks</h2>
      ${data.tasks
        .map(
          (task: any) => `
        <div class="task">
          <div class="task-status">${task.title}</div>
          <div>Status: ${task.status}</div>
          <div>Outcome: ${task.outcome || "N/A"}</div>
        </div>
      `
        )
        .join("")}
    </section>
    `
        : ""
    }

    <footer>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </footer>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Generate PDF from session data (requires external service)
 */
export async function generateSessionPDF(sessionId: number): Promise<Buffer> {
  const html = await exportSessionAsHTML(sessionId);

  // This would require a PDF generation library like puppeteer or wkhtmltopdf
  // For now, return a placeholder
  throw new Error("PDF generation requires additional setup");
}

/**
 * Create downloadable session archive
 */
export async function createSessionArchive(sessionId: number): Promise<{
  json: string;
  csv: string;
  html: string;
}> {
  const [json, csv, html] = await Promise.all([
    exportSessionAsJSONString(sessionId),
    exportSessionAsCSV(sessionId),
    exportSessionAsHTML(sessionId),
  ]);

  return { json, csv, html };
}
