// lib/mail.ts
// This file contains the configuration for Nodemailer and functions for sending
// various transactional emails required by the HR management system.

import nodemailer from 'nodemailer';

// --- Nodemailer Transporter Setup ---
// Uses environment variables for the SMTP server configuration.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

/**
 * Sends a password reset email to a user.
 * @param {string} email - The recipient's email address.
 * @param {string} token - The unique, unhashed password reset token.
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Password Reset Request',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
}

/**
 * Sends a leave approval email with a PDF attachment.
 * @param {string} email - The recipient's email address.
 * @param {any} requestData - The data of the approved request.
 * @param {Buffer} pdfBuffer - The generated PDF as a buffer.
 */
export async function sendApprovalEmailWithAttachment(email: string, requestData: any, pdfBuffer: Buffer) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Your Leave Request has been Approved (ID: ${requestData.id.slice(-8)})`,
      html: `<p>Dear ${requestData.user.name},</p><p>Your leave request has been approved. The official document is attached.</p>`,
      attachments: [{
        filename: `LeaveApproval_${requestData.id.slice(-8)}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    });
    console.log("Approval email with PDF sent successfully to:", email);
  } catch (error) {
    console.error("Error sending approval email:", error);
  }
}

/**
 * Sends an email notification to HR staff about a new pending request.
 * @param {string[]} hrEmails - An array of HR email addresses to notify.
 * @param {any} requestData - The data of the new request.
 */
export async function sendNewRequestNotificationEmail(hrEmails: string[], requestData: any) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: hrEmails,
      subject: `New Pending Request: ${requestData.leaveType} Leave`,
      html: `<p>A new leave request from <strong>${requestData.user.name}</strong> is awaiting approval.</p><p>Please log in to the HR System to review.</p>`,
    });
    console.log("New request notification email sent to HR staff.");
  } catch (error) {
    console.error("Error sending new request notification:", error);
  }
}
