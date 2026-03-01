/**
 * Email Service Configuration
 * 
 * Supports both SendGrid and AWS SES for sending emails.
 * Configure via environment variables.
 */

import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let emailService: 'sendgrid' | 'ses' | null = null;
let sesTransporter: Transporter | null = null;

// Initialize email service based on environment variables
function initializeEmailService() {
  if (process.env.SENDGRID_API_KEY) {
    emailService = 'sendgrid';
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    return;
  }

  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    emailService = 'ses';
    sesTransporter = nodemailer.createTransport({
      SES: {
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      },
    });
    return;
  }

  // No email service configured - will log warnings in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  No email service configured. Emails will not be sent.');
  }
}

// Initialize on module load
initializeEmailService();

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Send an email using the configured email service
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const fromEmail = options.from || process.env.SENDGRID_FROM_EMAIL || process.env.AWS_SES_FROM_EMAIL || 'noreply@evega.com';

  if (emailService === 'sendgrid') {
    try {
      await sgMail.send({
        to: options.to,
        from: fromEmail,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      });
    } catch (error) {
      console.error('SendGrid email error:', error);
      throw new Error('Failed to send email via SendGrid');
    }
    return;
  }

  if (emailService === 'ses' && sesTransporter) {
    try {
      await sesTransporter.sendMail({
        from: fromEmail,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      });
    } catch (error) {
      console.error('AWS SES email error:', error);
      throw new Error('Failed to send email via AWS SES');
    }
    return;
  }

  // No email service configured - log in development, fail silently in production
  if (process.env.NODE_ENV === 'development') {
    console.warn('📧 Email not sent (no service configured):', {
      to: options.to,
      subject: options.subject,
    });
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  orderTotal: number,
  items: Array<{ name: string; quantity: number; price: number }>
): Promise<void> {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - ${orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Order Confirmation</h1>
          <p>Thank you for your order!</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Total:</strong> $${orderTotal.toFixed(2)}</p>
          </div>
          
          <h2>Order Items</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #e5e7eb;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: left;">Quantity</th>
                <th style="padding: 10px; text-align: left;">Price</th>
                <th style="padding: 10px; text-align: left;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <p>We'll send you another email when your order ships.</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetUrl: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Reset Your Password</h1>
          <p>You requested to reset your password. Click the link below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html,
  });
}

/**
 * Send vendor approval email
 */
export async function sendVendorApprovalEmail(
  email: string,
  vendorName: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Vendor Application Approved</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">Congratulations!</h1>
          <p>Your vendor application for <strong>${vendorName}</strong> has been approved!</p>
          
          <p>You can now:</p>
          <ul>
            <li>Add products to your store</li>
            <li>Manage orders</li>
            <li>View analytics</li>
            <li>Access your vendor dashboard</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/vendor/dashboard" 
               style="background: #10b981; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Vendor Dashboard
            </a>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Welcome to Evega! We're excited to have you as a vendor.
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Vendor Application Approved',
    html,
  });
}

/**
 * Send vendor rejection email
 */
export async function sendVendorRejectionEmail(
  email: string,
  vendorName: string,
  reason?: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Vendor Application Status</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ef4444;">Vendor Application Update</h1>
          <p>Thank you for your interest in becoming a vendor on Evega.</p>
          
          <p>Unfortunately, your vendor application for <strong>${vendorName}</strong> could not be approved at this time.</p>
          
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          
          <p>If you have questions or would like to reapply, please contact our support team.</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Thank you for your interest in Evega.
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Vendor Application Status',
    html,
  });
}
