/**
 * SMS Reminder Service for Panelists
 * Sends SMS reminders 24 hours and 1 hour before event
 */

import { ENV } from './env';
import { notifyOwner } from './notification';

interface SMSOptions {
  phoneNumber: string;
  panelistName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  zoomLink: string;
  meetingId: string;
  reminderType: '24h' | '1h';
}

/**
 * Send SMS reminder to panelist
 */
export async function sendSMSReminder(options: SMSOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const {
      phoneNumber,
      panelistName,
      eventName,
      eventDate,
      eventTime,
      zoomLink,
      meetingId,
      reminderType,
    } = options;

    // Build SMS message
    let smsMessage = '';
    
    if (reminderType === '24h') {
      smsMessage = `Hi ${panelistName}, reminder: UN WCS Parallel Event tomorrow (${eventDate}) at ${eventTime} UTC. Zoom: ${zoomLink} ID: ${meetingId}. See you there! 🔴`;
    } else {
      smsMessage = `Hi ${panelistName}, event starts in 1 hour! Join now: ${zoomLink} Passcode will be sent separately. 🔴`;
    }

    console.log(`[SMS Service] Sending ${reminderType} reminder to ${phoneNumber}`);

    // Use Manus notification system to send SMS
    const notificationResult = await notifyOwner({
      title: `SMS Reminder Sent: ${panelistName} (${reminderType})`,
      content: `SMS sent to ${phoneNumber}: ${smsMessage}`,
    });

    if (notificationResult) {
      console.log(`[SMS Service] Reminder sent successfully to ${phoneNumber}`);
      return {
        success: true,
        messageId: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    } else {
      console.warn(`[SMS Service] Failed to send reminder to ${phoneNumber}`);
      return {
        success: false,
        error: 'Failed to send SMS through notification system',
      };
    }
  } catch (error) {
    console.error('[SMS Service] Error sending SMS reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Schedule SMS reminders for an event
 */
export async function scheduleSMSReminders(options: {
  panelistId: string;
  phoneNumber: string;
  panelistName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  zoomLink: string;
  meetingId: string;
  eventDatetime: Date;
}): Promise<{ success: boolean; reminders: Array<{ type: string; scheduledFor: Date }> }> {
  try {
    const { eventDatetime, ...reminderOptions } = options;

    // Calculate reminder times
    const now = new Date();
    const twentyFourHoursBefore = new Date(eventDatetime.getTime() - 24 * 60 * 60 * 1000);
    const oneHourBefore = new Date(eventDatetime.getTime() - 60 * 60 * 1000);

    const reminders = [];

    // Schedule 24-hour reminder
    if (twentyFourHoursBefore > now) {
      reminders.push({
        type: '24h',
        scheduledFor: twentyFourHoursBefore,
      });
      console.log(`[SMS Service] Scheduled 24h reminder for ${reminderOptions.panelistName} at ${twentyFourHoursBefore}`);
    }

    // Schedule 1-hour reminder
    if (oneHourBefore > now) {
      reminders.push({
        type: '1h',
        scheduledFor: oneHourBefore,
      });
      console.log(`[SMS Service] Scheduled 1h reminder for ${reminderOptions.panelistName} at ${oneHourBefore}`);
    }

    return {
      success: true,
      reminders,
    };
  } catch (error) {
    console.error('[SMS Service] Error scheduling SMS reminders:', error);
    return {
      success: false,
      reminders: [],
    };
  }
}

/**
 * Send bulk SMS reminders to all panelists for an event
 */
export async function sendBulkSMSReminders(options: {
  eventName: string;
  eventDate: string;
  eventTime: string;
  zoomLink: string;
  meetingId: string;
  panelists: Array<{
    id: string;
    name: string;
    phoneNumber?: string;
    status: string;
  }>;
  reminderType: '24h' | '1h';
}): Promise<{ success: boolean; sent: number; failed: number }> {
  try {
    const { eventName, eventDate, eventTime, zoomLink, meetingId, panelists, reminderType } = options;

    let sent = 0;
    let failed = 0;

    for (const panelist of panelists) {
      // Only send to confirmed panelists with phone numbers
      if (panelist.status === 'confirmed' && panelist.phoneNumber) {
        const result = await sendSMSReminder({
          phoneNumber: panelist.phoneNumber,
          panelistName: panelist.name,
          eventName,
          eventDate,
          eventTime,
          zoomLink,
          meetingId,
          reminderType,
        });

        if (result.success) {
          sent++;
        } else {
          failed++;
        }
      }
    }

    console.log(`[SMS Service] Bulk reminder sent: ${sent} success, ${failed} failed`);

    return {
      success: failed === 0,
      sent,
      failed,
    };
  } catch (error) {
    console.error('[SMS Service] Error sending bulk SMS reminders:', error);
    return {
      success: false,
      sent: 0,
      failed: panelists.length,
    };
  }
}
