import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface DonationReceiptData {
  donorName?: string;
  donorEmail: string;
  amount: number;
  currency: string;
  broadcastHoursFunded: number;
  transactionId: string;
  date: string;
}

interface PaymentConfirmationData {
  customerEmail: string;
  customerName?: string;
  productName: string;
  amount: number;
  currency: string;
  transactionId: string;
  date: string;
}

// Initialize email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send donation receipt email
 */
export async function sendDonationReceipt(data: DonationReceiptData): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .receipt-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
            .receipt-item.total { font-weight: bold; font-size: 18px; border-bottom: 2px solid #667eea; margin-top: 10px; }
            .impact { background: #e8f4f8; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .tax-notice { background: #fff3cd; padding: 10px; border-radius: 4px; margin: 15px 0; font-size: 12px; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Your Donation!</h1>
              <p>Rockin' Rockin' Boogie - 501(c)(3) Nonprofit</p>
            </div>
            <div class="content">
              <p>Dear ${data.donorName || 'Valued Donor'},</p>
              <p>We are deeply grateful for your generous donation to Rockin' Rockin' Boogie. Your support directly enables us to provide community access to broadcast tools and media production resources.</p>
              
              <h3>Donation Receipt</h3>
              <div class="receipt-item">
                <span>Donation Amount:</span>
                <span>${(data.amount / 100).toFixed(2)} ${data.currency}</span>
              </div>
              <div class="receipt-item">
                <span>Transaction ID:</span>
                <span>${data.transactionId}</span>
              </div>
              <div class="receipt-item">
                <span>Date:</span>
                <span>${data.date}</span>
              </div>
              <div class="receipt-item total">
                <span>Total Donation:</span>
                <span>${(data.amount / 100).toFixed(2)} ${data.currency}</span>
              </div>

              <div class="impact">
                <strong>Your Impact:</strong>
                <p>Your donation supports approximately <strong>${data.broadcastHoursFunded.toFixed(1)} hours</strong> of broadcast time, enabling our community to share their voices and stories.</p>
              </div>

              <div class="tax-notice">
                <strong>Tax Deductible Notice:</strong> This donation is tax-deductible. Rockin' Rockin' Boogie is a registered 501(c)(3) nonprofit organization. Our EIN is available upon request. Please retain this receipt for your tax records.
              </div>

              <p>If you have any questions about your donation or would like to learn more about our mission, please don't hesitate to contact us.</p>
              
              <p>With gratitude,<br>The Rockin' Rockin' Boogie Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Rockin' Rockin' Boogie. All rights reserved.</p>
              <p>A Voice for the Voiceless - Sweet Miracles Initiative</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await transporter.sendMail({
      to: data.donorEmail,
      subject: `Tax-Deductible Donation Receipt - ${(data.amount / 100).toFixed(2)} ${data.currency}`,
      html,
      replyTo: process.env.REPLY_TO_EMAIL || 'support@rrbradio.com',
    });

    console.log(`[Email] Donation receipt sent to ${data.donorEmail}: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('[Email Error] Failed to send donation receipt:', error);
    return false;
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(data: PaymentConfirmationData): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .receipt-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
            .receipt-item.total { font-weight: bold; font-size: 18px; border-bottom: 2px solid #667eea; margin-top: 10px; }
            .features { background: #e8f4f8; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmed!</h1>
              <p>QUMUS Autonomous Orchestration Engine</p>
            </div>
            <div class="content">
              <p>Dear ${data.customerName || 'Valued Customer'},</p>
              <p>Your payment has been successfully processed. Your subscription is now active and you have full access to all features.</p>
              
              <h3>Payment Receipt</h3>
              <div class="receipt-item">
                <span>Product:</span>
                <span>${data.productName}</span>
              </div>
              <div class="receipt-item">
                <span>Amount:</span>
                <span>${(data.amount / 100).toFixed(2)} ${data.currency}</span>
              </div>
              <div class="receipt-item">
                <span>Transaction ID:</span>
                <span>${data.transactionId}</span>
              </div>
              <div class="receipt-item">
                <span>Date:</span>
                <span>${data.date}</span>
              </div>
              <div class="receipt-item total">
                <span>Total Charged:</span>
                <span>${(data.amount / 100).toFixed(2)} ${data.currency}</span>
              </div>

              <div class="features">
                <strong>What's Included:</strong>
                <ul>
                  <li>Full access to QUMUS autonomous orchestration</li>
                  <li>Advanced AR visualization and metrics</li>
                  <li>Custom voice command training</li>
                  <li>Priority support</li>
                  <li>Real-time analytics dashboard</li>
                </ul>
              </div>

              <p>You can manage your subscription and billing information in your account dashboard.</p>
              
              <p>Thank you for choosing QUMUS!<br>The QUMUS Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 QUMUS. All rights reserved.</p>
              <p>Autonomous Orchestration Engine - 90%+ Autonomy with Human Oversight</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await transporter.sendMail({
      to: data.customerEmail,
      subject: `Payment Confirmation - ${data.productName}`,
      html,
      replyTo: process.env.REPLY_TO_EMAIL || 'support@qumus.io',
    });

    console.log(`[Email] Payment confirmation sent to ${data.customerEmail}: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('[Email Error] Failed to send payment confirmation:', error);
    return false;
  }
}

/**
 * Send subscription welcome email
 */
export async function sendSubscriptionWelcome(data: PaymentConfirmationData): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .welcome-box { background: #e8f4f8; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${data.productName}!</h1>
              <p>Your subscription is now active</p>
            </div>
            <div class="content">
              <p>Dear ${data.customerName || 'Valued Subscriber'},</p>
              <p>Welcome! We're excited to have you as part of our community. Your subscription to ${data.productName} is now active.</p>
              
              <div class="welcome-box">
                <h3>Getting Started:</h3>
                <ol>
                  <li>Log in to your account dashboard</li>
                  <li>Complete your profile setup</li>
                  <li>Explore the features and documentation</li>
                  <li>Join our community forum for support</li>
                </ol>
              </div>

              <p><strong>Need Help?</strong> Check out our comprehensive documentation or contact our support team. We're here to help you succeed!</p>
              
              <p>Best regards,<br>The QUMUS Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 QUMUS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await transporter.sendMail({
      to: data.customerEmail,
      subject: `Welcome to ${data.productName}!`,
      html,
      replyTo: process.env.REPLY_TO_EMAIL || 'support@qumus.io',
    });

    console.log(`[Email] Welcome email sent to ${data.customerEmail}: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('[Email Error] Failed to send welcome email:', error);
    return false;
  }
}

/**
 * Send subscription renewal reminder
 */
export async function sendSubscriptionRenewalReminder(data: PaymentConfirmationData): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .renewal-box { background: #e8f4f8; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Subscription Renewal Notice</h1>
              <p>${data.productName}</p>
            </div>
            <div class="content">
              <p>Dear ${data.customerName || 'Valued Subscriber'},</p>
              <p>Your subscription to ${data.productName} will renew on the next billing date. Your payment method on file will be charged ${(data.amount / 100).toFixed(2)} ${data.currency}.</p>
              
              <div class="renewal-box">
                <p><strong>Renewal Details:</strong></p>
                <p>Amount: ${(data.amount / 100).toFixed(2)} ${data.currency}</p>
                <p>Plan: ${data.productName}</p>
              </div>

              <p>If you wish to make any changes to your subscription or have questions, please visit your account settings.</p>
              
              <p>Thank you for your continued subscription!<br>The QUMUS Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 QUMUS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await transporter.sendMail({
      to: data.customerEmail,
      subject: `Subscription Renewal Reminder - ${data.productName}`,
      html,
      replyTo: process.env.REPLY_TO_EMAIL || 'support@qumus.io',
    });

    console.log(`[Email] Renewal reminder sent to ${data.customerEmail}: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('[Email Error] Failed to send renewal reminder:', error);
    return false;
  }
}

/**
 * Send subscription cancellation confirmation
 */
export async function sendSubscriptionCancellation(data: PaymentConfirmationData): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .cancellation-box { background: #ffe8e8; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Subscription Cancelled</h1>
              <p>${data.productName}</p>
            </div>
            <div class="content">
              <p>Dear ${data.customerName || 'Valued Subscriber'},</p>
              <p>Your subscription to ${data.productName} has been cancelled. You will no longer be charged for this service.</p>
              
              <div class="cancellation-box">
                <p><strong>Cancellation Details:</strong></p>
                <p>Plan: ${data.productName}</p>
                <p>Date: ${data.date}</p>
              </div>

              <p>We're sorry to see you go! If you have feedback about your experience or would like to know how we can improve, please reach out to us.</p>
              
              <p>Best regards,<br>The QUMUS Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 QUMUS. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await transporter.sendMail({
      to: data.customerEmail,
      subject: `Subscription Cancelled - ${data.productName}`,
      html,
      replyTo: process.env.REPLY_TO_EMAIL || 'support@qumus.io',
    });

    console.log(`[Email] Cancellation confirmation sent to ${data.customerEmail}: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('[Email Error] Failed to send cancellation email:', error);
    return false;
  }
}

/**
 * Test email connectivity
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('[Email] SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('[Email Error] SMTP connection failed:', error);
    return false;
  }
}
