// app/api/password/forgot/route.ts
// This API endpoint handles the first step of the password reset process.
// It finds a user by email, generates a secure reset token, saves its hashed version
// to the database with an expiry date, and sends an email with the reset link.

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail"; // This is a new email function we'll need to create

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // IMPORTANT: To prevent email enumeration attacks, we always return a success
    // message, regardless of whether the user was found or not. The actual logic
    // only proceeds if the user exists.
    if (user) {
      // --- Generate a secure, URL-safe token ---
      const resetToken = crypto.randomBytes(32).toString("hex");
      
      // --- Hash the token before storing it in the database for security ---
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // --- Set an expiry date for the token (e.g., 1 hour from now) ---
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour in milliseconds

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: hashedToken,
          resetPasswordTokenExpiry: tokenExpiry,
        },
      });

      // --- Send the password reset email ---
      // The email will contain the *unhashed* token.
      // We will need to create the 'sendPasswordResetEmail' function in our mail utility.
      // await sendPasswordResetEmail(user.email, resetToken);
    }
    
    // Return a generic success message
    return NextResponse.json({ 
      message: "If an account with that email exists, a password reset link has been sent." 
    });

  } catch (error) {
    console.error("[FORGOT_PASSWORD_POST_ERROR]", error);
    // Do not reveal internal errors to the client
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
