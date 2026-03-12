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
    // Use SMTP transport for AWS SES (simpler and more compatible)
    sesTransporter = nodemailer.createTransport({
      host: `email-smtp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.AWS_SES_SMTP_USERNAME || process.env.AWS_ACCESS_KEY_ID,
        pass: process.env.AWS_SES_SMTP_PASSWORD || process.env.AWS_SECRET_ACCESS_KEY,
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

/**
 * Send offline payment order confirmation email to customer
 */
export async function sendOfflinePaymentOrderConfirmation(
  email: string,
  orderNumber: string,
  vendorContact: { phone?: string; email?: string },
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

  const contactInfo = `
    ${vendorContact.phone ? `<p><strong>Phone:</strong> <a href="tel:${vendorContact.phone}">${vendorContact.phone}</a></p>` : ''}
    ${vendorContact.email ? `<p><strong>Email:</strong> <a href="mailto:${vendorContact.email}">${vendorContact.email}</a></p>` : ''}
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Payment Pending - ${orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f59e0b;">Order Confirmation - Payment Pending</h1>
          <p>Your order #${orderNumber} has been placed successfully!</p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Payment Status: Pending</strong></p>
            <p style="margin: 10px 0 0 0;">The vendor will contact you at the phone number you provided to complete the payment.</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Order Total:</strong> $${orderTotal.toFixed(2)}</p>
          </div>
          
          <h2>Vendor Will Contact You</h2>
          <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p>The vendor will contact you at the phone number you provided to complete the payment.</p>
            ${contactInfo ? `<p style="margin-top: 10px;">You can also reach out to the vendor:</p>${contactInfo}` : ''}
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
          
          <p><strong>Important:</strong> Once payment is received, the vendor will update your order status and begin processing your order.</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you have any questions, please contact the vendor or our support team.
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Order Confirmation - Payment Pending - ${orderNumber}`,
    html,
  });
}

/**
 * Send vendor notification email for new offline payment order
 */
export async function sendVendorOfflinePaymentNotification(
  email: string,
  orderNumber: string,
  customerName: string,
  customerPhone: string,
  orderTotal: number,
  itemCount: number
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Offline Payment Order - ${orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">New Offline Payment Order</h1>
          <p>You have received a new order from <strong>${customerName}</strong>.</p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Payment Status: Pending</strong></p>
            <p style="margin: 10px 0 0 0;">Please contact the customer to complete payment. Once payment is received, please mark the order as paid in your dashboard.</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Customer Phone:</strong> <a href="tel:${customerPhone}">${customerPhone}</a></p>
            <p><strong>Order Total:</strong> $${orderTotal.toFixed(2)}</p>
            <p><strong>Items:</strong> ${itemCount} item${itemCount !== 1 ? 's' : ''}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/vendor/orders" 
               style="background: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order in Dashboard
            </a>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Remember to mark the order as paid once you receive payment from the customer.
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `New Offline Payment Order - ${orderNumber}`,
    html,
  });
}

/**
 * Send payment received confirmation email to customer
 */
export async function sendPaymentReceivedConfirmation(
  email: string,
  orderNumber: string,
  orderTotal: number
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Received - ${orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">Payment Received!</h1>
          <p>Great news! Your payment for order #${orderNumber} has been received and confirmed.</p>
          
          <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>✅ Payment Status: Completed</strong></p>
            <p style="margin: 10px 0 0 0;">Your order is now being processed and will be shipped soon.</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Amount Paid:</strong> $${orderTotal.toFixed(2)}</p>
          </div>
          
          <p>You'll receive another email with tracking information once your order ships.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${orderNumber}" 
               style="background: #10b981; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              View Order Details
            </a>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Thank you for your purchase!
          </p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `Payment Received - Order ${orderNumber}`,
    html,
  });
}
