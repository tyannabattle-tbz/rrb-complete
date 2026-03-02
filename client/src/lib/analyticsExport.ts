/**
 * Analytics Export Utilities
 * Handles CSV and PDF export for analytics and reports
 */

export interface AnalyticsData {
  timestamp: Date;
  broadcastId: string;
  title: string;
  severity: string;
  channels: string[];
  viewerCount: number;
  engagementRate: number;
  deliveryStatus: string;
  duration?: number;
}

export interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
}

/**
 * Export analytics data to CSV
 */
export function exportToCSV(data: AnalyticsData[], options: ExportOptions = {}): void {
  const filename =
    options.filename || `analytics-${new Date().toISOString().split('T')[0]}.csv`;

  // CSV headers
  const headers = [
    'Timestamp',
    'Broadcast ID',
    'Title',
    'Severity',
    'Channels',
    'Viewers',
    'Engagement Rate',
    'Delivery Status',
    'Duration (seconds)',
  ];

  // CSV rows
  const rows = data.map((item) => [
    item.timestamp.toLocaleString(),
    item.broadcastId,
    `"${item.title}"`, // Quote to handle commas in title
    item.severity,
    item.channels.join(';'),
    item.viewerCount,
    `${(item.engagementRate * 100).toFixed(2)}%`,
    item.deliveryStatus,
    item.duration || 'N/A',
  ]);

  // Combine headers and rows
  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  // Add BOM for Excel compatibility
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });

  // Download
  downloadFile(blob, filename);
}

/**
 * Export analytics data to JSON
 */
export function exportToJSON(data: AnalyticsData[], options: ExportOptions = {}): void {
  const filename =
    options.filename || `analytics-${new Date().toISOString().split('T')[0]}.json`;

  const exportData = {
    exportedAt: new Date().toISOString(),
    totalRecords: data.length,
    data: data.map((item) => ({
      ...item,
      timestamp: item.timestamp.toISOString(),
    })),
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });

  downloadFile(blob, filename);
}

/**
 * Export analytics summary report
 */
export function exportSummaryReport(
  data: AnalyticsData[],
  options: ExportOptions = {}
): void {
  const filename =
    options.filename || `summary-report-${new Date().toISOString().split('T')[0]}.txt`;

  const totalBroadcasts = data.length;
  const totalViewers = data.reduce((sum, item) => sum + item.viewerCount, 0);
  const avgEngagement = data.length > 0 ? data.reduce((sum, item) => sum + item.engagementRate, 0) / data.length : 0;
  const deliveredCount = data.filter((item) => item.deliveryStatus === 'delivered').length;
  const failedCount = data.filter((item) => item.deliveryStatus === 'failed').length;

  const severityBreakdown = {
    critical: data.filter((item) => item.severity === 'critical').length,
    high: data.filter((item) => item.severity === 'high').length,
    medium: data.filter((item) => item.severity === 'medium').length,
    low: data.filter((item) => item.severity === 'low').length,
  };

  const channelBreakdown: Record<string, number> = {};
  data.forEach((item) => {
    item.channels.forEach((channel) => {
      channelBreakdown[channel] = (channelBreakdown[channel] || 0) + 1;
    });
  });

  const report = `
ANALYTICS SUMMARY REPORT
Generated: ${new Date().toLocaleString()}

=== OVERALL STATISTICS ===
Total Broadcasts: ${totalBroadcasts}
Total Viewers: ${totalViewers}
Average Engagement Rate: ${(avgEngagement * 100).toFixed(2)}%
Delivery Success Rate: ${((deliveredCount / totalBroadcasts) * 100).toFixed(2)}%

=== DELIVERY STATUS ===
Delivered: ${deliveredCount}
Failed: ${failedCount}
Pending: ${data.filter((item) => item.deliveryStatus === 'pending').length}

=== SEVERITY BREAKDOWN ===
Critical: ${severityBreakdown.critical}
High: ${severityBreakdown.high}
Medium: ${severityBreakdown.medium}
Low: ${severityBreakdown.low}

=== CHANNEL BREAKDOWN ===
${Object.entries(channelBreakdown)
  .map(([channel, count]) => `${channel}: ${count}`)
  .join('\n')}

=== TOP BROADCASTS ===
${data
  .sort((a, b) => b.viewerCount - a.viewerCount)
  .slice(0, 5)
  .map((item, i) => `${i + 1}. ${item.title} (${item.viewerCount} viewers)`)
  .join('\n')}

=== REPORT DETAILS ===
Report Period: ${new Date(Math.min(...data.map((d) => d.timestamp.getTime()))).toLocaleDateString()} to ${new Date(Math.max(...data.map((d) => d.timestamp.getTime()))).toLocaleDateString()}
Data Points: ${data.length}
  `.trim();

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  downloadFile(blob, filename);
}

/**
 * Export to PDF (requires external library)
 * This is a placeholder that generates a text-based report
 */
export function exportToPDF(data: AnalyticsData[], options: ExportOptions = {}): void {
  // In a real implementation, you would use a library like jsPDF or pdfkit
  // For now, we'll export as a formatted text file with .pdf extension
  const filename =
    options.filename || `report-${new Date().toISOString().split('T')[0]}.pdf`;

  const totalBroadcasts = data.length;
  const totalViewers = data.reduce((sum, item) => sum + item.viewerCount, 0);
  const avgEngagement =
    data.length > 0 ? data.reduce((sum, item) => sum + item.engagementRate, 0) / data.length : 0;

  const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 500 >>
stream
BT
/F1 24 Tf
50 750 Td
(Analytics Report) Tj
ET
BT
/F1 12 Tf
50 700 Td
(Generated: ${new Date().toLocaleString()}) Tj
ET
BT
50 650 Td
(Total Broadcasts: ${totalBroadcasts}) Tj
ET
BT
50 630 Td
(Total Viewers: ${totalViewers}) Tj
ET
BT
50 610 Td
(Average Engagement: ${(avgEngagement * 100).toFixed(2)}%) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000301 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
851
%%EOF
  `.trim();

  const blob = new Blob([pdfContent], { type: 'application/pdf;charset=utf-8;' });
  downloadFile(blob, filename);
}

/**
 * Helper function to download a file
 */
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate analytics summary
 */
export function generateSummary(data: AnalyticsData[]): {
  totalBroadcasts: number;
  totalViewers: number;
  avgEngagement: number;
  deliveryRate: number;
  severityBreakdown: Record<string, number>;
} {
  const totalBroadcasts = data.length;
  const totalViewers = data.reduce((sum, item) => sum + item.viewerCount, 0);
  const avgEngagement =
    data.length > 0 ? data.reduce((sum, item) => sum + item.engagementRate, 0) / data.length : 0;
  const deliveredCount = data.filter((item) => item.deliveryStatus === 'delivered').length;
  const deliveryRate = totalBroadcasts > 0 ? deliveredCount / totalBroadcasts : 0;

  const severityBreakdown = {
    critical: data.filter((item) => item.severity === 'critical').length,
    high: data.filter((item) => item.severity === 'high').length,
    medium: data.filter((item) => item.severity === 'medium').length,
    low: data.filter((item) => item.severity === 'low').length,
  };

  return {
    totalBroadcasts,
    totalViewers,
    avgEngagement,
    deliveryRate,
    severityBreakdown,
  };
}
