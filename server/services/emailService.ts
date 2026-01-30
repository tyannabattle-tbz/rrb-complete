import crypto from "crypto";

/**
 * Email Service - Handles email sending via SendGrid, Mailgun, or SMTP
 */

export interface EmailProvider {
  send(options: SendEmailOptions): Promise<{ messageId: string; success: boolean }>;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * SendGrid Email Provider
 */
export class SendGridProvider implements EmailProvider {
  constructor(private apiKey: string, private fromEmail: string, private fromName?: string) {}

  async send(options: SendEmailOptions): Promise<{ messageId: string; success: boolean }> {
    const from = options.from || this.fromEmail;
    const fromName = options.fromName || this.fromName || "Manus Agent";

    const payload = {
      personalizations: [
        {
          to: Array.isArray(options.to)
            ? options.to.map((email) => ({ email }))
            : [{ email: options.to }],
          subject: options.subject,
        },
      ],
      from: {
        email: from,
        name: fromName,
      },
      content: [
        {
          type: "text/html",
          value: options.html,
        },
      ],
      ...(options.text && {
        content: [
          { type: "text/plain", value: options.text },
          { type: "text/html", value: options.html },
        ],
      }),
      ...(options.replyTo && { reply_to: { email: options.replyTo } }),
      ...(options.attachments && {
        attachments: options.attachments.map((att) => ({
          filename: att.filename,
          content: typeof att.content === "string" ? att.content : att.content.toString("base64"),
          type: att.contentType || "application/octet-stream",
          disposition: "attachment",
        })),
      }),
    };

    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SendGrid error: ${response.status} - ${error}`);
      }

      // SendGrid returns 202 Accepted with no body
      const messageId = crypto.randomUUID();
      return { messageId, success: true };
    } catch (error) {
      console.error("SendGrid send error:", error);
      throw error;
    }
  }
}

/**
 * Mailgun Email Provider
 */
export class MailgunProvider implements EmailProvider {
  constructor(private apiKey: string, private domain: string, private fromEmail: string, private fromName?: string) {}

  async send(options: SendEmailOptions): Promise<{ messageId: string; success: boolean }> {
    const from = options.from || this.fromEmail;
    const fromName = options.fromName || this.fromName || "Manus Agent";

    const formData = new FormData();
    formData.append("from", `${fromName} <${from}>`);

    if (Array.isArray(options.to)) {
      options.to.forEach((email) => formData.append("to", email));
    } else {
      formData.append("to", options.to);
    }

    formData.append("subject", options.subject);
    formData.append("html", options.html);

    if (options.text) {
      formData.append("text", options.text);
    }

    if (options.replyTo) {
      formData.append("h:Reply-To", options.replyTo);
    }

    if (options.attachments) {
      for (const att of options.attachments) {
        const contentStr = typeof att.content === "string" ? att.content : (att.content as any).toString();
        formData.append("attachment", contentStr, att.filename);
      }
    }

    try {
      const auth = Buffer.from(`api:${this.apiKey}`).toString("base64");
      const response = await fetch(`https://api.mailgun.net/v3/${this.domain}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Mailgun error: ${response.status} - ${error}`);
      }

      const data = (await response.json()) as { id: string };
      return { messageId: data.id, success: true };
    } catch (error) {
      console.error("Mailgun send error:", error);
      throw error;
    }
  }
}

/**
 * SMTP Email Provider (using nodemailer-like interface)
 */
export class SMTPProvider implements EmailProvider {
  constructor(
    private host: string,
    private port: number,
    private user: string,
    private password: string,
    private fromEmail: string,
    private fromName?: string
  ) {}

  async send(options: SendEmailOptions): Promise<{ messageId: string; success: boolean }> {
    // This would require nodemailer or similar library
    // For now, returning a placeholder that would be implemented with proper SMTP library
    console.warn("SMTP provider requires nodemailer installation");
    return { messageId: crypto.randomUUID(), success: false };
  }
}

/**
 * Email Service Factory
 */
export class EmailService {
  private provider: EmailProvider;

  constructor(providerType: "sendgrid" | "mailgun" | "smtp", config: Record<string, any>) {
    switch (providerType) {
      case "sendgrid":
        this.provider = new SendGridProvider(config.apiKey, config.fromEmail, config.fromName);
        break;
      case "mailgun":
        this.provider = new MailgunProvider(config.apiKey, config.domain, config.fromEmail, config.fromName);
        break;
      case "smtp":
        this.provider = new SMTPProvider(
          config.host,
          config.port,
          config.user,
          config.password,
          config.fromEmail,
          config.fromName
        );
        break;
      default:
        throw new Error(`Unknown email provider: ${providerType}`);
    }
  }

  async send(options: SendEmailOptions): Promise<{ messageId: string; success: boolean }> {
    return this.provider.send(options);
  }
}

/**
 * Report Email Templates
 */
export const reportEmailTemplates = {
  weeklyReport: (data: {
    userName: string;
    sessionCount: number;
    toolExecutions: number;
    averageSessionDuration: number;
    topTools: Array<{ name: string; count: number }>;
    period: string;
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .section { margin: 20px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
          .metric { display: inline-block; width: 48%; margin: 1%; text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
          .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Agent Report</h1>
            <p>${data.period}</p>
          </div>

          <div class="section">
            <h2>Hello ${data.userName}! 👋</h2>
            <p>Here's your weekly summary of agent activity.</p>
          </div>

          <div class="section">
            <div class="metric">
              <div class="metric-value">${data.sessionCount}</div>
              <div class="metric-label">Sessions</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.toolExecutions}</div>
              <div class="metric-label">Tool Executions</div>
            </div>
            <div class="metric">
              <div class="metric-value">${Math.round(data.averageSessionDuration)}s</div>
              <div class="metric-label">Avg Duration</div>
            </div>
          </div>

          <div class="section">
            <h3>🔧 Top Tools Used</h3>
            <ul>
              ${data.topTools.map((tool) => `<li><strong>${tool.name}</strong>: ${tool.count} executions</li>`).join("")}
            </ul>
          </div>

          <div class="footer">
            <p>This is an automated report from Manus Agent Platform</p>
            <p>© 2026 Manus. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,

  monthlyReport: (data: {
    userName: string;
    totalSessions: number;
    totalToolExecutions: number;
    successRate: number;
    averageResponseTime: number;
    topTools: Array<{ name: string; count: number }>;
    period: string;
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
          .section { margin: 20px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
          .metric { display: inline-block; width: 48%; margin: 1%; text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
          .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
          .success-rate { color: #4caf50; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Monthly Agent Report</h1>
            <p>${data.period}</p>
          </div>

          <div class="section">
            <h2>Hello ${data.userName}! 👋</h2>
            <p>Here's your comprehensive monthly summary of agent performance.</p>
          </div>

          <div class="section">
            <div class="metric">
              <div class="metric-value">${data.totalSessions}</div>
              <div class="metric-label">Total Sessions</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.totalToolExecutions}</div>
              <div class="metric-label">Tool Executions</div>
            </div>
            <div class="metric">
              <div class="metric-value success-rate">${data.successRate}%</div>
              <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
              <div class="metric-value">${Math.round(data.averageResponseTime)}ms</div>
              <div class="metric-label">Avg Response Time</div>
            </div>
          </div>

          <div class="section">
            <h3>🔧 Top Tools Used</h3>
            <ul>
              ${data.topTools.map((tool) => `<li><strong>${tool.name}</strong>: ${tool.count} executions</li>`).join("")}
            </ul>
          </div>

          <div class="footer">
            <p>This is an automated report from Manus Agent Platform</p>
            <p>© 2026 Manus. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,
};
