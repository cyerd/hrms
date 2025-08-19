// app/api/password/forgot/route.ts
// This API endpoint handles the first step of the password reset process.

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // To prevent email enumeration, we always return a success message,
    // but only proceed with the logic if the user actually exists.
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: hashedToken,
          resetPasswordTokenExpiry: tokenExpiry,
        },
      });

      // This function is imported from the file you have open in the Canvas
      await sendPasswordResetEmail(user.email, resetToken);
    }
    
    return NextResponse.json({ 
      message: "If an account with that email exists, a password reset link has been sent." 
    });

  } catch (error) {
    console.error("[FORGOT_PASSWORD_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}