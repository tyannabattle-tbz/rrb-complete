/**
 * Offline Payment Service
 * Simulates payment processing for offline use
 * Can be upgraded to real Stripe when online
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { offlineConfig } from '../config/offlineConfig';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

export interface PaymentRecord {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'simulation';
  userId?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  completedAt?: string;
  refundedAt?: string;
}

class OfflinePaymentService {
  private dataPath: string;
  private paymentType: 'stripe' | 'simulation' | 'offline';

  constructor() {
    const config = offlineConfig;

    if (config.payment.simulation?.dataPath) {
      this.dataPath = config.payment.simulation.dataPath;
    } else {
      const homeDir = process.env.HOME || '/tmp';
      this.dataPath = path.join(homeDir, '.qumus', 'payments');
    }

    this.paymentType = config.payment.type;

    // Ensure data directory exists
    this.ensureDataDir();
  }

  /**
   * Ensure data directory exists
   */
  private async ensureDataDir(): Promise<void> {
    try {
      await mkdir(this.dataPath, { recursive: true });
    } catch (error) {
      console.error('[OfflinePayment] Error creating data directory:', error);
    }
  }

  /**
   * Process payment (simulation)
   */
  async processPayment(
    amount: number,
    currency: string,
    description: string,
    userId?: number,
    metadata?: Record<string, any>
  ): Promise<PaymentRecord> {
    const payment: PaymentRecord = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionId: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      description,
      status: 'completed',
      paymentMethod: 'simulation',
      userId,
      metadata,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    try {
      // Simulate payment processing with 95% success rate
      if (Math.random() > 0.95) {
        payment.status = 'failed';
        delete payment.completedAt;
      }

      // Save payment record
      await this.savePayment(payment);

      return payment;
    } catch (error) {
      console.error('[OfflinePayment] Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Save payment record
   */
  private async savePayment(payment: PaymentRecord): Promise<void> {
    try {
      const paymentFile = path.join(this.dataPath, `${payment.id}.json`);
      await writeFile(paymentFile, JSON.stringify(payment, null, 2));
      console.log(`[OfflinePayment] Payment recorded: ${payment.id}`);
    } catch (error) {
      console.error('[OfflinePayment] Error saving payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<PaymentRecord | null> {
    try {
      const paymentFile = path.join(this.dataPath, `${paymentId}.json`);
      const content = await readFile(paymentFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('[OfflinePayment] Payment not found:', paymentId);
      return null;
    }
  }

  /**
   * Get all payments for user
   */
  async getUserPayments(userId: number): Promise<PaymentRecord[]> {
    try {
      const files = await readdir(this.dataPath);
      const payments: PaymentRecord[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await readFile(path.join(this.dataPath, file), 'utf-8');
          const payment = JSON.parse(content);

          if (payment.userId === userId) {
            payments.push(payment);
          }
        }
      }

      return payments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('[OfflinePayment] Error getting user payments:', error);
      return [];
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string): Promise<PaymentRecord | null> {
    try {
      const payment = await this.getPayment(paymentId);

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Only completed payments can be refunded');
      }

      payment.status = 'refunded';
      payment.refundedAt = new Date().toISOString();

      await this.savePayment(payment);

      return payment;
    } catch (error) {
      console.error('[OfflinePayment] Error refunding payment:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  async getStats(): Promise<{
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    refundedPayments: number;
    averageAmount: number;
  }> {
    try {
      const files = await readdir(this.dataPath);
      const payments: PaymentRecord[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await readFile(path.join(this.dataPath, file), 'utf-8');
          payments.push(JSON.parse(content));
        }
      }

      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const successful = payments.filter((p) => p.status === 'completed').length;
      const failed = payments.filter((p) => p.status === 'failed').length;
      const refunded = payments.filter((p) => p.status === 'refunded').length;

      return {
        totalPayments: payments.length,
        totalAmount,
        successfulPayments: successful,
        failedPayments: failed,
        refundedPayments: refunded,
        averageAmount: payments.length > 0 ? totalAmount / payments.length : 0,
      };
    } catch (error) {
      console.error('[OfflinePayment] Error getting stats:', error);
      return {
        totalPayments: 0,
        totalAmount: 0,
        successfulPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        averageAmount: 0,
      };
    }
  }

  /**
   * Export payments as CSV
   */
  async exportPaymentsCSV(): Promise<string> {
    try {
      const files = await readdir(this.dataPath);
      const payments: PaymentRecord[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await readFile(path.join(this.dataPath, file), 'utf-8');
          payments.push(JSON.parse(content));
        }
      }

      // Create CSV header
      let csv = 'ID,Transaction ID,Amount,Currency,Description,Status,Payment Method,User ID,Created At,Completed At\n';

      // Add payment rows
      for (const payment of payments) {
        csv += `"${payment.id}","${payment.transactionId}",${payment.amount},"${payment.currency}","${payment.description}","${payment.status}","${payment.paymentMethod}",${payment.userId || ''},${payment.createdAt},${payment.completedAt || ''}\n`;
      }

      return csv;
    } catch (error) {
      console.error('[OfflinePayment] Error exporting payments:', error);
      throw error;
    }
  }

  /**
   * Get payment type
   */
  getPaymentType(): string {
    return this.paymentType;
  }
}

export const offlinePaymentService = new OfflinePaymentService();
