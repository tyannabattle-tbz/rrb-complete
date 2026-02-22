/**
 * Email Notification Templates
 * Branded HTML templates for panelist communications
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Invitation email template with one-click RSVP
 */
export function generateInvitationEmail(options: {
  panelistName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  role: string;
  zoomLink: string;
  meetingId: string;
  confirmLink: string;
  declineLink: string;
}): EmailTemplate {
  const {
    panelistName,
    eventName,
    eventDate,
    eventTime,
    role,
    zoomLink,
    meetingId,
    confirmLink,
    declineLink,
  } = options;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${eventName} - Panelist Invitation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 5px 0 0 0; opacity: 0.9; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .event-details { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
    .event-details h3 { margin-top: 0; color: #667eea; }
    .event-details p { margin: 8px 0; }
    .zoom-info { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .zoom-info h4 { margin-top: 0; color: #1976d2; }
    .button-group { display: flex; gap: 10px; margin: 30px 0; justify-content: center; }
    .button { display: inline-block; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 600; }
    .button-confirm { background: #10b981; color: white; }
    .button-decline { background: #ef4444; color: white; }
    .button:hover { opacity: 0.9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #ddd; margin-top: 20px; }
    .mission { font-style: italic; color: #667eea; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎙️ ${eventName}</h1>
      <p>You're invited to participate as a ${role}</p>
    </div>
    
    <div class="content">
      <p>Dear ${panelistName},</p>
      
      <p>We're excited to invite you to participate in the <strong>${eventName}</strong> as a <strong>${role}</strong>. Your expertise and perspective will be invaluable to our discussion.</p>
      
      <div class="event-details">
        <h3>📅 Event Details</h3>
        <p><strong>Event:</strong> ${eventName}</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Time:</strong> ${eventTime} UTC</p>
        <p><strong>Role:</strong> ${role}</p>
      </div>
      
      <div class="zoom-info">
        <h4>🔗 Zoom Meeting Information</h4>
        <p><strong>Meeting ID:</strong> ${meetingId}</p>
        <p><a href="${zoomLink}" style="color: #1976d2; text-decoration: none; font-weight: 600;">Join Zoom Meeting</a></p>
        <p style="font-size: 12px; color: #666; margin-top: 10px;">Passcode will be sent in a separate email 24 hours before the event.</p>
      </div>
      
      <p>Please confirm your attendance by clicking one of the buttons below:</p>
      
      <div class="button-group">
        <a href="${confirmLink}" class="button button-confirm">✓ Confirm Attendance</a>
        <a href="${declineLink}" class="button button-decline">✗ Decline</a>
      </div>
      
      <p>If you have any questions or need technical support, please reply to this email.</p>
      
      <div class="mission">
        <p>Sisters Questing Unapologetically After Divine Destiny</p>
        <p>SQUADD Broadcast Team</p>
      </div>
    </div>
    
    <div class="footer">
      <p>This is an automated email from SQUADD. Please do not reply with sensitive information.</p>
      <p>&copy; 2026 SQUADD Broadcast Team. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${eventName} - Panelist Invitation

Dear ${panelistName},

We're excited to invite you to participate in the ${eventName} as a ${role}.

EVENT DETAILS:
- Event: ${eventName}
- Date: ${eventDate}
- Time: ${eventTime} UTC
- Role: ${role}

ZOOM MEETING INFORMATION:
- Meeting ID: ${meetingId}
- Join Link: ${zoomLink}
- Passcode: (will be sent 24 hours before the event)

Please confirm your attendance:
- Confirm: ${confirmLink}
- Decline: ${declineLink}

Sisters Questing Unapologetically After Divine Destiny
SQUADD Broadcast Team
  `;

  return {
    subject: `${eventName} - Panelist Invitation`,
    html,
    text,
  };
}

/**
 * Confirmation email template
 */
export function generateConfirmationEmail(options: {
  panelistName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  role: string;
  zoomLink: string;
  meetingId: string;
  passcode: string;
  dashboardLink: string;
}): EmailTemplate {
  const {
    panelistName,
    eventName,
    eventDate,
    eventTime,
    role,
    zoomLink,
    meetingId,
    passcode,
    dashboardLink,
  } = options;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${eventName} - Attendance Confirmed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .confirmation-badge { background: #dcfce7; border: 2px solid #10b981; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; }
    .confirmation-badge p { margin: 0; color: #065f46; font-weight: 600; }
    .event-details { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px; }
    .event-details h3 { margin-top: 0; color: #10b981; }
    .event-details p { margin: 8px 0; }
    .zoom-credentials { background: #f0f9ff; padding: 15px; border-radius: 4px; margin: 20px 0; border: 1px solid #bfdbfe; }
    .zoom-credentials h4 { margin-top: 0; color: #1e40af; }
    .zoom-credentials p { margin: 8px 0; font-family: 'Courier New', monospace; }
    .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; border-radius: 4px; text-decoration: none; font-weight: 600; }
    .button:hover { opacity: 0.9; }
    .checklist { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .checklist h4 { margin-top: 0; color: #333; }
    .checklist ul { margin: 10px 0; padding-left: 20px; }
    .checklist li { margin: 8px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #ddd; margin-top: 20px; }
    .mission { font-style: italic; color: #10b981; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Attendance Confirmed!</h1>
      <p>Thank you for confirming your participation</p>
    </div>
    
    <div class="content">
      <p>Dear ${panelistName},</p>
      
      <div class="confirmation-badge">
        <p>✓ Your attendance has been confirmed for ${eventName}</p>
      </div>
      
      <div class="event-details">
        <h3>📅 Event Details</h3>
        <p><strong>Event:</strong> ${eventName}</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Time:</strong> ${eventTime} UTC</p>
        <p><strong>Role:</strong> ${role}</p>
      </div>
      
      <div class="zoom-credentials">
        <h4>🔗 Zoom Meeting Credentials</h4>
        <p><strong>Meeting ID:</strong> ${meetingId}</p>
        <p><strong>Passcode:</strong> ${passcode}</p>
        <p><a href="${zoomLink}" style="color: #1e40af; text-decoration: none; font-weight: 600;">Join Zoom Meeting →</a></p>
      </div>
      
      <div class="checklist">
        <h4>📋 Pre-Event Checklist</h4>
        <ul>
          <li>✓ Test your audio and video before the event</li>
          <li>✓ Ensure stable internet connection</li>
          <li>✓ Join 5-10 minutes early to check audio/video</li>
          <li>✓ Use a professional background or blur</li>
          <li>✓ Silence notifications and close unnecessary apps</li>
        </ul>
      </div>
      
      <p style="text-align: center;">
        <a href="${dashboardLink}" class="button">View Your Dashboard</a>
      </p>
      
      <p>You'll receive reminder emails 24 hours and 1 hour before the event. If you need to change your response, visit your dashboard.</p>
      
      <div class="mission">
        <p>Sisters Questing Unapologetically After Divine Destiny</p>
        <p>SQUADD Broadcast Team</p>
      </div>
    </div>
    
    <div class="footer">
      <p>This is an automated email from SQUADD. Please do not reply with sensitive information.</p>
      <p>&copy; 2026 SQUADD Broadcast Team. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${eventName} - Attendance Confirmed!

Dear ${panelistName},

Your attendance has been confirmed for ${eventName}.

EVENT DETAILS:
- Event: ${eventName}
- Date: ${eventDate}
- Time: ${eventTime} UTC
- Role: ${role}

ZOOM MEETING CREDENTIALS:
- Meeting ID: ${meetingId}
- Passcode: ${passcode}
- Join Link: ${zoomLink}

PRE-EVENT CHECKLIST:
- Test your audio and video before the event
- Ensure stable internet connection
- Join 5-10 minutes early to check audio/video
- Use a professional background or blur
- Silence notifications and close unnecessary apps

View your dashboard: ${dashboardLink}

You'll receive reminder emails 24 hours and 1 hour before the event.

Sisters Questing Unapologetically After Divine Destiny
SQUADD Broadcast Team
  `;

  return {
    subject: `${eventName} - Attendance Confirmed ✓`,
    html,
    text,
  };
}

/**
 * Reminder email template (24 hours before)
 */
export function generateReminderEmail(options: {
  panelistName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  hoursUntilEvent: number;
  zoomLink: string;
  meetingId: string;
  passcode: string;
}): EmailTemplate {
  const {
    panelistName,
    eventName,
    eventDate,
    eventTime,
    hoursUntilEvent,
    zoomLink,
    meetingId,
    passcode,
  } = options;

  const reminderType = hoursUntilEvent <= 1 ? 'Final Reminder' : '24-Hour Reminder';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${eventName} - ${reminderType}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .countdown { background: white; padding: 20px; border-radius: 4px; text-align: center; margin: 20px 0; border: 2px solid #f59e0b; }
    .countdown h3 { margin: 0 0 10px 0; color: #d97706; }
    .countdown p { margin: 5px 0; font-size: 18px; font-weight: 600; }
    .zoom-info { background: #f0f9ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .zoom-info h4 { margin-top: 0; color: #1e40af; }
    .zoom-info p { margin: 8px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; border-radius: 4px; text-decoration: none; font-weight: 600; }
    .button:hover { opacity: 0.9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #ddd; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ ${reminderType}</h1>
      <p>${eventName}</p>
    </div>
    
    <div class="content">
      <p>Hi ${panelistName},</p>
      
      <div class="countdown">
        <h3>Event starts in ${hoursUntilEvent} hour${hoursUntilEvent !== 1 ? 's' : ''}</h3>
        <p>${eventDate} at ${eventTime} UTC</p>
      </div>
      
      <p>Get ready to join the broadcast! Here are your Zoom meeting details:</p>
      
      <div class="zoom-info">
        <h4>🔗 Zoom Meeting Information</h4>
        <p><strong>Meeting ID:</strong> ${meetingId}</p>
        <p><strong>Passcode:</strong> ${passcode}</p>
        <p><a href="${zoomLink}" style="color: #1e40af; text-decoration: none; font-weight: 600;">Join Zoom Meeting →</a></p>
      </div>
      
      <p><strong>Quick Checklist:</strong></p>
      <ul>
        <li>Test your audio and video</li>
        <li>Check your internet connection</li>
        <li>Join ${hoursUntilEvent <= 1 ? 'now' : '5-10 minutes early'}</li>
        <li>Use a professional background</li>
      </ul>
      
      <p style="text-align: center;">
        <a href="${zoomLink}" class="button">Join Now</a>
      </p>
      
      <p>See you soon!</p>
      
      <p style="font-style: italic; color: #f59e0b;">Sisters Questing Unapologetically After Divine Destiny</p>
    </div>
    
    <div class="footer">
      <p>&copy; 2026 SQUADD Broadcast Team. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${eventName} - ${reminderType}

Hi ${panelistName},

Event starts in ${hoursUntilEvent} hour${hoursUntilEvent !== 1 ? 's' : ''}!

EVENT TIME: ${eventDate} at ${eventTime} UTC

ZOOM MEETING INFORMATION:
- Meeting ID: ${meetingId}
- Passcode: ${passcode}
- Join Link: ${zoomLink}

QUICK CHECKLIST:
- Test your audio and video
- Check your internet connection
- Join ${hoursUntilEvent <= 1 ? 'now' : '5-10 minutes early'}
- Use a professional background

See you soon!

Sisters Questing Unapologetically After Divine Destiny
SQUADD Broadcast Team
  `;

  return {
    subject: `${reminderType}: ${eventName} - ${hoursUntilEvent}h away`,
    html,
    text,
  };
}

/**
 * Get all email templates
 */
export function getAllEmailTemplates() {
  return {
    invitation: generateInvitationEmail,
    confirmation: generateConfirmationEmail,
    reminder: generateReminderEmail,
  };
}
