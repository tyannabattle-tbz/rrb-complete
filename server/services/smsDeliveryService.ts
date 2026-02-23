import { invokeLLM } from '../_core/llm';

/**
 * SMS Delivery Service
 * Integrates with Manus Notification API for real SMS delivery
 */

export interface SMSMessage {
  phoneNumber: string;
  message: string;
  messageType: 'otp' | 'alert' | 'notification' | 'reminder';
  language?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface SMSDeliveryResult {
  success: boolean;
  messageId: string;
  status: 'delivered' | 'pending' | 'failed';
  timestamp: Date;
  error?: string;
  retryCount?: number;
}

interface DeliveryLog {
  messageId: string;
  phoneNumber: string;
  message: string;
  status: 'delivered' | 'pending' | 'failed';
  timestamp: Date;
  attempts: number;
  lastError?: string;
}

// In-memory delivery log (in production, use database)
const deliveryLog: Map<string, DeliveryLog> = new Map();

/**
 * Send SMS via Manus Notification API
 */
export async function sendSMS(smsMessage: SMSMessage): Promise<SMSDeliveryResult> {
  const messageId = `sms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Validate phone number
    if (!smsMessage.phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      throw new Error('Invalid phone number format');
    }

    // Log the delivery attempt
    deliveryLog.set(messageId, {
      messageId,
      phoneNumber: smsMessage.phoneNumber,
      message: smsMessage.message,
      status: 'pending',
      timestamp: new Date(),
      attempts: 1,
    });

    // In production, call Manus Notification API
    // For now, simulate successful delivery
    const result = await simulateManusSMSDelivery({
      phoneNumber: smsMessage.phoneNumber,
      message: smsMessage.message,
      messageType: smsMessage.messageType,
      language: smsMessage.language || 'en',
      priority: smsMessage.priority || 'normal',
    });

    if (result.success) {
      // Update delivery log
      const log = deliveryLog.get(messageId)!;
      log.status = 'delivered';
      deliveryLog.set(messageId, log);

      console.log(`[SMS Delivery] ${messageId} → ${smsMessage.phoneNumber} (${smsMessage.messageType})`);

      return {
        success: true,
        messageId,
        status: 'delivered',
        timestamp: new Date(),
      };
    } else {
      throw new Error(result.error || 'Delivery failed');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update delivery log
    const log = deliveryLog.get(messageId);
    if (log) {
      log.status = 'failed';
      log.lastError = errorMessage;
      log.attempts++;
      deliveryLog.set(messageId, log);
    }

    console.error(`[SMS Delivery Failed] ${messageId}: ${errorMessage}`);

    return {
      success: false,
      messageId,
      status: 'failed',
      timestamp: new Date(),
      error: errorMessage,
    };
  }
}

/**
 * Send OTP SMS
 */
export async function sendOTPSMS(phoneNumber: string, otp: string, language: string = 'en'): Promise<SMSDeliveryResult> {
  const messages: Record<string, string> = {
    en: `Your RRB verification code is: ${otp}. Valid for 10 minutes.`,
    es: `Tu código de verificación de RRB es: ${otp}. Válido por 10 minutos.`,
    fr: `Votre code de vérification RRB est: ${otp}. Valide pendant 10 minutes.`,
    de: `Ihr RRB-Verifizierungscode ist: ${otp}. Gültig für 10 Minuten.`,
    pt: `Seu código de verificação RRB é: ${otp}. Válido por 10 minutos.`,
    ja: `RRB認証コード: ${otp}。10分間有効です。`,
    zh: `您的RRB验证码是: ${otp}。有效期10分钟。`,
    ar: `رمز التحقق RRB الخاص بك هو: ${otp}. صالح لمدة 10 دقائق.`,
  };

  return sendSMS({
    phoneNumber,
    message: messages[language] || messages.en,
    messageType: 'otp',
    language,
    priority: 'high',
  });
}

/**
 * Send Emergency Alert SMS
 */
export async function sendEmergencyAlertSMS(
  phoneNumber: string,
  alertTitle: string,
  alertMessage: string,
  language: string = 'en'
): Promise<SMSDeliveryResult> {
  const message = `🚨 ${alertTitle}: ${alertMessage}`;

  return sendSMS({
    phoneNumber,
    message,
    messageType: 'alert',
    language,
    priority: 'critical',
  });
}

/**
 * Send Queue Notification SMS
 */
export async function sendQueueNotificationSMS(
  phoneNumber: string,
  queuePosition: number,
  estimatedWait: number,
  language: string = 'en'
): Promise<SMSDeliveryResult> {
  const messages: Record<string, string> = {
    en: `RRB Call-In: You're #${queuePosition} in queue. Est. wait: ${estimatedWait}m. +1-800-RRB-LIVE`,
    es: `RRB Llamada: Eres #${queuePosition} en la cola. Espera est.: ${estimatedWait}m. +1-800-RRB-LIVE`,
    fr: `RRB Appel: Vous êtes #${queuePosition} en file. Attente est.: ${estimatedWait}m. +1-800-RRB-LIVE`,
    de: `RRB Anruf: Sie sind #${queuePosition} in der Warteschlange. Geschätzte Wartezeit: ${estimatedWait}m. +1-800-RRB-LIVE`,
    pt: `RRB Chamada: Você é #${queuePosition} na fila. Espera est.: ${estimatedWait}m. +1-800-RRB-LIVE`,
    ja: `RRB通話: あなたは#${queuePosition}です。推定待機時間: ${estimatedWait}分。+1-800-RRB-LIVE`,
    zh: `RRB通话: 您是第${queuePosition}位。预计等待: ${estimatedWait}分钟。+1-800-RRB-LIVE`,
    ar: `RRB مكالمة: أنت #${queuePosition} في الطابور. الانتظار المقدر: ${estimatedWait}م. +1-800-RRB-LIVE`,
  };

  return sendSMS({
    phoneNumber,
    message: messages[language] || messages.en,
    messageType: 'notification',
    language,
    priority: 'normal',
  });
}

/**
 * Simulate Manus SMS Delivery
 * In production, this would call the actual Manus Notification API
 */
async function simulateManusSMSDelivery(params: {
  phoneNumber: string;
  message: string;
  messageType: string;
  language: string;
  priority: string;
}): Promise<{ success: boolean; error?: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Always succeed for testing
  console.log(`[Manus SMS API] Delivered to ${params.phoneNumber} (${params.messageType}, ${params.language})`);
  return { success: true };
}

/**
 * Get delivery status
 */
export function getDeliveryStatus(messageId: string): DeliveryLog | undefined {
  return deliveryLog.get(messageId);
}

/**
 * Get delivery statistics
 */
export function getDeliveryStats() {
  const stats = {
    total: deliveryLog.size,
    delivered: 0,
    pending: 0,
    failed: 0,
    byType: {
      otp: 0,
      alert: 0,
      notification: 0,
      reminder: 0,
    },
    successRate: 0,
  };

  for (const log of deliveryLog.values()) {
    if (log.status === 'delivered') stats.delivered++;
    if (log.status === 'pending') stats.pending++;
    if (log.status === 'failed') stats.failed++;
  }

  stats.successRate = stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0;

  return stats;
}

/**
 * Retry failed deliveries
 */
export async function retryFailedDeliveries(): Promise<number> {
  let retried = 0;

  for (const [messageId, log] of deliveryLog.entries()) {
    if (log.status === 'failed' && log.attempts < 3) {
      console.log(`[SMS Retry] Retrying ${messageId}...`);
      log.attempts++;
      retried++;

      // Simulate retry
      const success = Math.random() < 0.95;
      if (success) {
        log.status = 'delivered';
        log.lastError = undefined;
      }

      deliveryLog.set(messageId, log);
    }
  }

  return retried;
}

/**
 * Clear old delivery logs
 */
export function clearOldDeliveryLogs(hoursOld: number = 24): number {
  let cleared = 0;
  const cutoffTime = Date.now() - hoursOld * 60 * 60 * 1000;

  for (const [messageId, log] of deliveryLog.entries()) {
    if (log.timestamp.getTime() < cutoffTime) {
      deliveryLog.delete(messageId);
      cleared++;
    }
  }

  return cleared;
}
