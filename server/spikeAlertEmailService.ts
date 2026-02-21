/**
 * Spike Alert Email Service
 * Sends email notifications when listener spikes are detected
 */

import { notifyOwner } from './_core/notification';

export interface SpikeAlertEmail {
  channelId: string;
  channelName: string;
  previousListeners: number;
  currentListeners: number;
  spikePercent: number;
  severity: 'warning' | 'critical';
  timestamp: number;
  operatorEmail?: string;
}

/**
 * Send spike alert email to operators
 */
export async function sendSpikeAlertEmail(alert: SpikeAlertEmail): Promise<boolean> {
  try {
    const severityBadge = alert.severity === 'critical' 
      ? '🔴 CRITICAL' 
      : '🟡 WARNING';

    const content = `
Channel: ${alert.channelName}
Status: ${severityBadge}

Listener Spike Detected:
• Previous: ${alert.previousListeners} listeners
• Current: ${alert.currentListeners} listeners
• Increase: +${alert.spikePercent.toFixed(1)}%

Time: ${new Date(alert.timestamp).toLocaleString()}

Recommended Actions:
1. Monitor the channel closely for stability
2. Check if content is trending or viral
3. Prepare additional server capacity if needed
4. Review listener feedback and comments

View Details: /operator-dashboard
    `.trim();

    const title = `${severityBadge} Listener Spike on ${alert.channelName}`;

    // Send notification to platform owner
    const result = await notifyOwner({ title, content });

    // Log the alert
    console.log(`[Spike Alert Email] Sent for ${alert.channelName}: +${alert.spikePercent}%`);

    return result;
  } catch (error) {
    console.error('[Spike Alert Email] Failed to send:', error);
    return false;
  }
}

/**
 * Send daily spike summary email
 */
export async function sendDailySpikesSummaryEmail(
  spikes: SpikeAlertEmail[],
  date: Date
): Promise<boolean> {
  try {
    if (spikes.length === 0) {
      return true; // No spikes to report
    }

    const criticalSpikes = spikes.filter(s => s.severity === 'critical');
    const warningSpikes = spikes.filter(s => s.severity === 'warning');

    const spikesList = spikes
      .map(s => `• ${s.channelName}: +${s.spikePercent.toFixed(1)}% (${s.currentListeners} listeners)`)
      .join('\n');

    const content = `
Daily Listener Spike Summary
Date: ${date.toLocaleDateString()}

Total Spikes Detected: ${spikes.length}
Critical: ${criticalSpikes.length}
Warnings: ${warningSpikes.length}

Spike Details:
${spikesList}

Top Spike:
${spikes.length > 0 
  ? `${spikes[0].channelName}: +${spikes[0].spikePercent.toFixed(1)}%`
  : 'No spikes'}

View Full Analytics: /operator-dashboard
    `.trim();

    const title = `Daily Spike Report: ${spikes.length} spikes detected`;

    const result = await notifyOwner({ title, content });
    console.log(`[Daily Spikes Email] Sent: ${spikes.length} spikes`);

    return result;
  } catch (error) {
    console.error('[Daily Spikes Email] Failed to send:', error);
    return false;
  }
}

/**
 * Send operator-specific spike alert
 */
export async function sendOperatorSpikeAlert(
  alert: SpikeAlertEmail,
  operatorEmail: string
): Promise<boolean> {
  try {
    const content = `
LISTENER SPIKE ALERT

Channel: ${alert.channelName}
Severity: ${alert.severity.toUpperCase()}

Current Listeners: ${alert.currentListeners}
Previous: ${alert.previousListeners}
Increase: +${alert.spikePercent.toFixed(1)}%

Action Required:
1. Monitor stream quality
2. Check for technical issues
3. Engage with audience
4. Prepare for potential growth

Timestamp: ${new Date(alert.timestamp).toISOString()}
    `.trim();

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, use the notification system
    const result = await notifyOwner({
      title: `SPIKE: ${alert.channelName} (+${alert.spikePercent.toFixed(1)}%)`,
      content
    });

    console.log(`[Operator Alert] Sent to ${operatorEmail}`);
    return result;
  } catch (error) {
    console.error('[Operator Alert] Failed:', error);
    return false;
  }
}

/**
 * Send weekly trend report
 */
export async function sendWeeklyTrendReport(
  channels: Array<{
    name: string;
    avgListeners: number;
    maxListeners: number;
    totalSpikes: number;
    trend: 'up' | 'down' | 'stable';
  }>
): Promise<boolean> {
  try {
    const channelReports = channels
      .map(ch => `
• ${ch.name}
  Average: ${ch.avgListeners} listeners
  Peak: ${ch.maxListeners} listeners
  Spikes: ${ch.totalSpikes}
  Trend: ${ch.trend.toUpperCase()}
      `.trim())
      .join('\n\n');

    const content = `
Weekly Analytics Report

${channelReports}

Key Insights:
• Monitor channels with upward trends
• Investigate any unexpected drops
• Plan content around peak times

View Detailed Analytics: /operator-dashboard
    `.trim();

    const result = await notifyOwner({
      title: 'Weekly Listener Analytics Report',
      content
    });

    console.log('[Weekly Report] Sent');
    return result;
  } catch (error) {
    console.error('[Weekly Report] Failed:', error);
    return false;
  }
}
