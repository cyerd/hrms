// app/api/password/reset/route.ts
// This API endpoint handles the final step of the password reset process.
// It receives a token and a new password, validates the token,
// and updates the user's password in the database.

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return new NextResponse("Token and new password are required", { status: 400 });
    }

    // --- Hash the incoming token to match the one stored in the database ---
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // --- Find the user with the matching, non-expired token ---
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpiry: {
          // 'gt' means "greater than" the current time
          gt: new Date(), 
        },
      },
    });

    if (!user) {
      return new NextResponse("Invalid or expired password reset token.", { status: 400 });
    }

    // --- Hash the new password ---
    const newHashedPassword = await bcrypt.hash(password, 12);

    // --- Update the user's password and clear the reset token fields ---
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hashedPassword: newHashedPassword,
        resetPasswordToken: null,       // Important: Clear the token after use
        resetPasswordTokenExpiry: null, // Important: Clear the expiry date
      },
    });

    return NextResponse.json({ message: "Password has been reset successfully." });

  } catch (error) {
    console.error("[RESET_PASSWORD_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
