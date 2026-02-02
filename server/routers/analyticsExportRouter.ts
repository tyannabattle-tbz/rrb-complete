import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const analyticsExportRouter = router({
  // Export metrics as CSV
  exportMetricsCSV: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        metrics: z.array(z.enum(["voiceCommands", "batchJobs", "storyboards", "systemLoad"])),
      })
    )
    .query(({ input }) => {
      try {
        // Generate CSV header
        const headers = ["Timestamp", ...input.metrics].join(",");

        // Generate sample data rows
        const rows = [];
        const current = new Date(input.startDate);

        while (current <= input.endDate) {
          const row = [current.toISOString()];

          input.metrics.forEach((metric) => {
            const value = Math.floor(Math.random() * 100);
            row.push(value.toString());
          });

          rows.push(row.join(","));
          current.setHours(current.getHours() + 1);
        }

        const csvContent = [headers, ...rows].join("\n");
        const buffer = Buffer.from(csvContent, "utf-8");

        return {
          filename: `metrics-${input.startDate.toISOString().split("T")[0]}-to-${input.endDate.toISOString().split("T")[0]}.csv`,
          content: buffer.toString("base64"),
          mimeType: "text/csv",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export metrics",
        });
      }
    }),

  // Export job history as CSV
  exportJobHistoryCSV: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        status: z.enum(["all", "completed", "failed", "processing"]).optional(),
      })
    )
    .query(({ input }) => {
      try {
        const headers = ["Job ID", "Queue ID", "Status", "Progress", "Created", "Completed", "Duration (seconds)"].join(",");

        // Generate sample job data
        const rows = [];
        for (let i = 0; i < 50; i++) {
          const created = new Date(
            input.startDate.getTime() + Math.random() * (input.endDate.getTime() - input.startDate.getTime())
          );
          const duration = Math.floor(Math.random() * 3600);
          const completed = new Date(created.getTime() + duration * 1000);

          const statuses = ["completed", "failed", "processing"];
          const status = input.status === "all" ? statuses[Math.floor(Math.random() * 3)] : input.status;

          rows.push(
            [
              `JOB-${String(i + 1).padStart(5, "0")}`,
              `Q-${Math.floor(Math.random() * 10) + 1}`,
              status,
              Math.floor(Math.random() * 100),
              created.toISOString(),
              completed.toISOString(),
              duration,
            ].join(",")
          );
        }

        const csvContent = [headers, ...rows].join("\n");
        const buffer = Buffer.from(csvContent, "utf-8");

        return {
          filename: `job-history-${input.startDate.toISOString().split("T")[0]}-to-${input.endDate.toISOString().split("T")[0]}.csv`,
          content: buffer.toString("base64"),
          mimeType: "text/csv",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export job history",
        });
      }
    }),

  // Export activity report as CSV
  exportActivityReportCSV: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        activityType: z.enum(["all", "voice", "batch", "storyboard"]).optional(),
      })
    )
    .query(({ input }) => {
      try {
        const headers = ["Timestamp", "Activity Type", "Description", "Status", "Duration (ms)", "User"].join(",");

        // Generate sample activity data
        const rows = [];
        const types = ["voice", "batch", "storyboard"];

        for (let i = 0; i < 100; i++) {
          const timestamp = new Date(
            input.startDate.getTime() + Math.random() * (input.endDate.getTime() - input.startDate.getTime())
          );
          const typeValue = input.activityType === "all" ? types[Math.floor(Math.random() * 3)] : input.activityType;
          const type = typeValue || "voice";
          const duration = Math.floor(Math.random() * 5000);
          const statuses = ["success", "error", "processing"];
          const status = statuses[Math.floor(Math.random() * 3)];

          const descriptions: { [key: string]: string } = {
            voice: "Voice command executed",
            batch: "Batch job processed",
            storyboard: "Storyboard generated",
          };

          const description = descriptions[type as string] || "Activity";

          rows.push(
            [
              timestamp.toISOString(),
              type || "voice",
              description,
              status,
              duration,
              `user-${Math.floor(Math.random() * 100) + 1}`,
            ].join(",")
          );
        }

        const csvContent = [headers, ...rows].join("\n");
        const buffer = Buffer.from(csvContent, "utf-8");

        return {
          filename: `activity-report-${input.startDate.toISOString().split("T")[0]}-to-${input.endDate.toISOString().split("T")[0]}.csv`,
          content: buffer.toString("base64"),
          mimeType: "text/csv",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export activity report",
        });
      }
    }),

  // Export system health report as CSV
  exportSystemHealthCSV: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(({ input }) => {
      try {
        const headers = ["Timestamp", "CPU Usage (%)", "Memory Usage (%)", "Disk Usage (%)", "API Latency (ms)", "Status"].join(",");

        // Generate sample health data
        const rows = [];
        const current = new Date(input.startDate);

        while (current <= input.endDate) {
          const cpuUsage = Math.floor(Math.random() * 100);
          const memoryUsage = Math.floor(Math.random() * 100);
          const diskUsage = Math.floor(Math.random() * 100);
          const apiLatency = Math.floor(Math.random() * 500) + 10;

          const status =
            cpuUsage > 80 || memoryUsage > 80 || diskUsage > 90 ? "warning" : "healthy";

          rows.push(
            [
              current.toISOString(),
              cpuUsage,
              memoryUsage,
              diskUsage,
              apiLatency,
              status,
            ].join(",")
          );

          current.setHours(current.getHours() + 1);
        }

        const csvContent = [headers, ...rows].join("\n");
        const buffer = Buffer.from(csvContent, "utf-8");

        return {
          filename: `system-health-${input.startDate.toISOString().split("T")[0]}-to-${input.endDate.toISOString().split("T")[0]}.csv`,
          content: buffer.toString("base64"),
          mimeType: "text/csv",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export system health report",
        });
      }
    }),

  // Export PDF report summary
  exportPDFReport: protectedProcedure
    .input(
      z.object({
        reportType: z.enum(["metrics", "jobs", "activity", "health"]),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(({ input }) => {
      try {
        // Generate PDF content as base64
        const pdfContent = `
          <html>
            <head>
              <title>${input.reportType.toUpperCase()} Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #4CAF50; color: white; }
              </style>
            </head>
            <body>
              <h1>${input.reportType.charAt(0).toUpperCase() + input.reportType.slice(1)} Report</h1>
              <div class="summary">
                <p><strong>Report Period:</strong> ${input.startDate.toDateString()} to ${input.endDate.toDateString()}</p>
                <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
              </div>
              <table>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
                <tr>
                  <td>Total Items</td>
                  <td>${Math.floor(Math.random() * 1000)}</td>
                </tr>
                <tr>
                  <td>Success Rate</td>
                  <td>${Math.floor(Math.random() * 100)}%</td>
                </tr>
                <tr>
                  <td>Average Duration</td>
                  <td>${Math.floor(Math.random() * 3600)}s</td>
                </tr>
              </table>
            </body>
          </html>
        `;

        const buffer = Buffer.from(pdfContent, "utf-8");

        return {
          filename: `${input.reportType}-report-${input.startDate.toISOString().split("T")[0]}.pdf`,
          content: buffer.toString("base64"),
          mimeType: "application/pdf",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export PDF report",
        });
      }
    }),
});
