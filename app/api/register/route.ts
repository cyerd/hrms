// app/api/register/route.ts
// This is the backend API endpoint that handles the registration logic.
// It validates the input, checks for existing users, hashes the password,
// creates the user in the database, and notifies admins.

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password, dateOfBirth, gender } = body;

    // --- Basic Input Validation ---
    if (!email || !name || !password || !dateOfBirth || !gender) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // --- Check if user already exists ---
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Return a specific message for the client to handle
      return new NextResponse("Email already in use", { status: 409 });
    }

    // --- Hash Password ---
    const hashedPassword = await bcrypt.hash(password, 12);

    // --- Create User (inactive by default) ---
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        isActive: false, // Important: User is inactive until approved by HR/Admin
      },
    });

    // --- Notify Admins and HR via In-App Notifications ---
    const adminsAndHR = await prisma.user.findMany({
      where: {
        isActive: true, // Only notify active admins/HR
        OR: [{ role: "ADMIN" }, { role: "HR" }],
      },
    });

    if (adminsAndHR.length > 0) {
      const notificationPromises = adminsAndHR.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            message: `New user registered: ${name}. Please review and activate their account.`,
            link: `/admin/hr/manage-users`, // A direct link to the user management page
            createdBy: user.id,
          },
        })
      );
      await Promise.all(notificationPromises);
    }
    
    // Note: Email notification logic (e.g., using Nodemailer) would also go here.
    // For brevity, it's omitted from this snippet but was included in the initial plan.

    // --- Return Success Response ---
    // We remove sensitive data like the hashed password before sending the user object back.
    const { hashedPassword: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error("[REGISTER_POST_ERROR]", error);
    // Return a generic error to avoid leaking implementation details
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
