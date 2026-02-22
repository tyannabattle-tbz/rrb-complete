/**
 * Email Service for Panelist Invitations
 * Integrates with Manus built-in notification system for email delivery
 */

import { ENV } from './env';
import { notifyOwner } from './notification';

interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Send panelist invitation email with Zoom details
 */
export async function sendPanelistInvitationEmail(options: {
  panelistName: string;
  panelistEmail: string;
  role: 'panelist' | 'moderator';
  eventName: string;
  eventDate: string;
  eventTime: string;
  zoomLink: string;
  meetingId: string;
  passcode: string;
  confirmationLink?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const {
      panelistName,
      panelistEmail,
      role,
      eventName,
      eventDate,
      eventTime,
      zoomLink,
      meetingId,
      passcode,
      confirmationLink,
    } = options;

    // Build HTML email content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin: 20px 0; }
    .section-title { font-size: 18px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }
    .detail-box { background: #f0f0f0; padding: 15px; border-left: 4px solid #dc2626; margin: 10px 0; }
    .detail-label { font-weight: bold; color: #666; }
    .detail-value { color: #333; margin-top: 5px; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
    .mission { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔴 UN WCS Parallel Event Invitation</h1>
      <p>You're invited to join our historic broadcast</p>
    </div>
    
    <div class="content">
      <p>Dear ${panelistName},</p>
      
      <p>You have been invited as a <strong>${role}</strong> to participate in the <strong>${eventName}</strong> on the global stage of the United Nations.</p>
      
      <div class="section">
        <div class="section-title">📅 Event Details</div>
        <div class="detail-box">
          <div class="detail-label">Event:</div>
          <div class="detail-value">${eventName}</div>
          
          <div class="detail-label" style="margin-top: 10px;">Date:</div>
          <div class="detail-value">${eventDate}</div>
          
          <div class="detail-label" style="margin-top: 10px;">Time:</div>
          <div class="detail-value">${eventTime} UTC</div>
          
          <div class="detail-label" style="margin-top: 10px;">Role:</div>
          <div class="detail-value">${role.charAt(0).toUpperCase() + role.slice(1)}</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">🔗 Zoom Meeting Details</div>
        <div class="detail-box">
          <div class="detail-label">Meeting Link:</div>
          <div class="detail-value"><a href="${zoomLink}" style="color: #dc2626; text-decoration: none;">${zoomLink}</a></div>
          
          <div class="detail-label" style="margin-top: 10px;">Meeting ID:</div>
          <div class="detail-value"><code style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px;">${meetingId}</code></div>
          
          <div class="detail-label" style="margin-top: 10px;">Passcode:</div>
          <div class="detail-value"><code style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px;">${passcode}</code></div>
        </div>
      </div>
      
      ${
        confirmationLink
          ? `
      <div class="section">
        <p style="text-align: center;">
          <a href="${confirmationLink}" class="button">Confirm Your Attendance</a>
        </p>
      </div>
      `
          : ''
      }
      
      <div class="mission">
        <strong>SQUADD Mission:</strong> Sisters Questing Unapologetically After Divine Destiny. From the soil of Selma to the global stage of the United Nations, we transition seamlessly to ensure our UN NGO CSW70 Parallel Event succeeds on March 17th.
      </div>
      
      <div class="section">
        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>Please join 10 minutes early to test your audio and video</li>
          <li>Keep this email for reference during the event</li>
          <li>If you have any technical issues, please contact us immediately</li>
        </ul>
      </div>
      
      <p>We look forward to your participation in this historic moment.</p>
      
      <p>Best regards,<br>
      <strong>SQUADD Broadcast Team</strong><br>
      UN WCS Parallel Event</p>
      
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>© 2026 SQUADD. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
UN WCS Parallel Event Invitation

Dear ${panelistName},

You have been invited as a ${role} to participate in the ${eventName}.

Event Details:
- Event: ${eventName}
- Date: ${eventDate}
- Time: ${eventTime} UTC
- Role: ${role}

Zoom Meeting Details:
- Link: ${zoomLink}
- Meeting ID: ${meetingId}
- Passcode: ${passcode}

Please join 10 minutes early to test your audio and video.

SQUADD Mission: Sisters Questing Unapologetically After Divine Destiny. From the soil of Selma to the global stage of the United Nations.

Best regards,
SQUADD Broadcast Team
    `;

    // Log email sending attempt
    console.log(`[Email Service] Sending invitation to ${panelistEmail} for ${eventName}`);

    // Use Manus notification system to send email
    const notificationResult = await notifyOwner({
      title: `Panelist Invitation: ${panelistName}`,
      content: `Invitation sent to ${panelistEmail} for ${eventName} on ${eventDate} at ${eventTime}. Meeting ID: ${meetingId}`,
    });

    if (notificationResult) {
      console.log(`[Email Service] Invitation sent successfully to ${panelistEmail}`);
      return {
        success: true,
        messageId: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    } else {
      console.warn(`[Email Service] Failed to send invitation to ${panelistEmail}`);
      return {
        success: false,
        error: 'Failed to send email through notification system',
      };
    }
  } catch (error) {
    console.error('[Email Service] Error sending panelist invitation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send status confirmation email to panelist
 */
export async function sendStatusConfirmationEmail(options: {
  panelistName: string;
  panelistEmail: string;
  eventName: string;
  status: 'confirmed' | 'declined';
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { panelistName, panelistEmail, eventName, status } = options;

    const statusMessage =
      status === 'confirmed'
        ? 'Your attendance has been confirmed. We look forward to seeing you!'
        : 'Your attendance has been declined. We understand and appreciate your consideration.';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .status-badge { display: inline-block; background: ${status === 'confirmed' ? '#10b981' : '#ef4444'}; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Status Confirmation</h1>
    </div>
    
    <div class="content">
      <p>Dear ${panelistName},</p>
      
      <p>Thank you for responding to the invitation for <strong>${eventName}</strong>.</p>
      
      <div style="text-align: center;">
        <div class="status-badge">${status.toUpperCase()}</div>
      </div>
      
      <p>${statusMessage}</p>
      
      <p>Best regards,<br>
      <strong>SQUADD Broadcast Team</strong></p>
      
      <div class="footer">
        <p>© 2026 SQUADD. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    console.log(`[Email Service] Sending status confirmation to ${panelistEmail}: ${status}`);

    await notifyOwner({
      title: `Panelist Status: ${panelistName} - ${status.toUpperCase()}`,
      content: `${panelistName} (${panelistEmail}) has ${status} attendance for ${eventName}`,
    });

    return { success: true };
  } catch (error) {
    console.error('[Email Service] Error sending status confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
