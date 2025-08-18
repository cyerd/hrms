// lib/mail.ts
// This file contains the configuration for Nodemailer and functions for sending
// transactional emails, such as the password reset link.

import nodemailer from "nodemailer";

// --- Nodemailer Transporter Setup ---
// This creates a reusable transporter object using your SMTP server details.
// These details are pulled from your .env file.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // Use true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Sends a password reset email to a user.
 * @param {string} email - The recipient's email address.
 * @param {string} token - The unique, unhashed password reset token.
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM, // Sender address (e.g., "HR Department <no-reply@yourcompany.com>")
    to: email, // Recipient's email
    subject: "Reset Your Password for AVOPRO HR",
    // Plain text body for email clients that don't render HTML
    text: `
      Hello,
      
      You requested a password reset. Please click the link below to set a new password:
      ${resetLink}
      
      If you did not request this, please ignore this email. This link will expire in 1 hour.
      
      Thanks,
      AVOPRO HR Team
    `,
    // HTML body for a richer email experience
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your AVOPRO HR account. Please click the button below to set a new password.</p>
        <a href="${resetLink}" style="background-color: #16a34a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Your Password
        </a>
        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, please ignore this email. This link will expire in 1 hour.</p>
        <hr/>
        <p style="font-size: 0.8em; color: #777;">AVOPRO EPZ LIMITED</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    // In a real application, you might want to add more robust error handling or logging here.
  }
};
