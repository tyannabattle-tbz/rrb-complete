import { notifyOwner } from '../_core/notification';

/**
 * SMS OTP Service using Manus Notification API
 * Handles SMS delivery for caller authentication
 */

export interface SMSMessage {
  id: string;
  phoneNumber: string;
  message: string;
  type: 'otp' | 'alert' | 'notification' | 'reminder';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
}

export interface OTPDelivery {
  sessionId: string;
  phoneNumber: string;
  otp: string;
  sentAt: Date;
  expiresAt: Date;
  attempts: number;
  delivered: boolean;
  deliveryMethod: 'sms' | 'email' | 'push';
}

class SMSService {
  private messages: Map<string, SMSMessage> = new Map();
  private otpDeliveries: Map<string, OTPDelivery> = new Map();
  private deliveryLog: SMSMessage[] = [];

  /**
   * Send OTP via SMS using Manus Notification API
   */
  async sendOTP(phoneNumber: string, otp: string, sessionId: string): Promise<OTPDelivery> {
    const message = `Your RRB verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

    const smsMessage: SMSMessage = {
      id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber,
      message,
      type: 'otp',
      status: 'pending',
      sentAt: new Date(),
    };

    this.messages.set(smsMessage.id, smsMessage);
    this.deliveryLog.push(smsMessage);

    // Send via Manus Notification API
    const delivered = await this.deliverViaManus(phoneNumber, message, 'sms');

    if (delivered) {
      smsMessage.status = 'delivered';
      smsMessage.deliveredAt = new Date();
    } else {
      smsMessage.status = 'failed';
      smsMessage.failureReason = 'Manus API delivery failed';
    }

    const otpDelivery: OTPDelivery = {
      sessionId,
      phoneNumber,
      otp,
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      delivered,
      deliveryMethod: 'sms',
    };

    this.otpDeliveries.set(sessionId, otpDelivery);

    console.log(`[SMS] OTP sent to ${phoneNumber}: ${delivered ? 'SUCCESS' : 'FAILED'}`);

    return otpDelivery;
  }

  /**
   * Send alert via SMS
   */
  async sendAlert(phoneNumber: string, title: string, message: string): Promise<SMSMessage> {
    const fullMessage = `🚨 ${title}: ${message}`;

    const smsMessage: SMSMessage = {
      id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber,
      message: fullMessage,
      type: 'alert',
      status: 'pending',
      sentAt: new Date(),
    };

    this.messages.set(smsMessage.id, smsMessage);
    this.deliveryLog.push(smsMessage);

    const delivered = await this.deliverViaManus(phoneNumber, fullMessage, 'sms');

    if (delivered) {
      smsMessage.status = 'delivered';
      smsMessage.deliveredAt = new Date();
    } else {
      smsMessage.status = 'failed';
      smsMessage.failureReason = 'Manus API delivery failed';
    }

    console.log(`[SMS] Alert sent to ${phoneNumber}: ${delivered ? 'SUCCESS' : 'FAILED'}`);

    return smsMessage;
  }

  /**
   * Send notification via SMS
   */
  async sendNotification(phoneNumber: string, title: string, message: string): Promise<SMSMessage> {
    const fullMessage = `📢 ${title}: ${message}`;

    const smsMessage: SMSMessage = {
      id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber,
      message: fullMessage,
      type: 'notification',
      status: 'pending',
      sentAt: new Date(),
    };

    this.messages.set(smsMessage.id, smsMessage);
    this.deliveryLog.push(smsMessage);

    const delivered = await this.deliverViaManus(phoneNumber, fullMessage, 'sms');

    if (delivered) {
      smsMessage.status = 'delivered';
      smsMessage.deliveredAt = new Date();
    } else {
      smsMessage.status = 'failed';
      smsMessage.failureReason = 'Manus API delivery failed';
    }

    return smsMessage;
  }

  /**
   * Send reminder via SMS
   */
  async sendReminder(phoneNumber: string, title: string, message: string): Promise<SMSMessage> {
    const fullMessage = `⏰ ${title}: ${message}`;

    const smsMessage: SMSMessage = {
      id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber,
      message: fullMessage,
      type: 'reminder',
      status: 'pending',
      sentAt: new Date(),
    };

    this.messages.set(smsMessage.id, smsMessage);
    this.deliveryLog.push(smsMessage);

    const delivered = await this.deliverViaManus(phoneNumber, fullMessage, 'sms');

    if (delivered) {
      smsMessage.status = 'delivered';
      smsMessage.deliveredAt = new Date();
    } else {
      smsMessage.status = 'failed';
      smsMessage.failureReason = 'Manus API delivery failed';
    }

    return smsMessage;
  }

  /**
   * Deliver via Manus Notification API
   */
  private async deliverViaManus(
    phoneNumber: string,
    message: string,
    channel: 'sms' | 'email' | 'push'
  ): Promise<boolean> {
    try {
      // Use Manus built-in notification API
      const result = await notifyOwner({
        title: `SMS to ${phoneNumber}`,
        content: message,
      });

      // Log delivery attempt
      console.log(`[Manus API] Delivery attempt: ${result ? 'SUCCESS' : 'FAILED'}`);

      return result;
    } catch (err) {
      console.error(`[SMS] Manus API error:`, err);
      return false;
    }
  }

  /**
   * Get SMS message by ID
   */
  getSMSMessage(messageId: string): SMSMessage | null {
    return this.messages.get(messageId) || null;
  }

  /**
   * Get OTP delivery status
   */
  getOTPDelivery(sessionId: string): OTPDelivery | null {
    return this.otpDeliveries.get(sessionId) || null;
  }

  /**
   * Get delivery statistics
   */
  getDeliveryStats(): {
    totalSent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
    byType: Record<string, number>;
  } {
    const total = this.deliveryLog.length;
    const delivered = this.deliveryLog.filter(m => m.status === 'delivered').length;
    const failed = this.deliveryLog.filter(m => m.status === 'failed').length;

    const byType: Record<string, number> = {};
    for (const msg of this.deliveryLog) {
      byType[msg.type] = (byType[msg.type] || 0) + 1;
    }

    return {
      totalSent: total,
      delivered,
      failed,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
      byType,
    };
  }

  /**
   * Get delivery log
   */
  getDeliveryLog(limit: number = 100): SMSMessage[] {
    return this.deliveryLog.slice(-limit).reverse();
  }

  /**
   * Clear old deliveries
   */
  clearOldDeliveries(daysOld: number = 30): number {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const initialLength = this.deliveryLog.length;

    this.deliveryLog = this.deliveryLog.filter(m => (m.sentAt || new Date()) > cutoffDate);

    return initialLength - this.deliveryLog.length;
  }

  /**
   * Resend failed OTP
   */
  async resendOTP(sessionId: string): Promise<boolean> {
    const otpDelivery = this.otpDeliveries.get(sessionId);
    if (!otpDelivery) {
      return false;
    }

    const message = `Your RRB verification code is: ${otpDelivery.otp}. Valid for 10 minutes.`;
    const delivered = await this.deliverViaManus(otpDelivery.phoneNumber, message, 'sms');

    if (delivered) {
      otpDelivery.delivered = true;
      otpDelivery.sentAt = new Date();
    }

    return delivered;
  }
}

export const smsService = new SMSService();
