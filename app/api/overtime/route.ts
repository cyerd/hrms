// app/api/overtime/route.ts
// This API endpoint handles the creation of a new overtime request.
// It validates the request and notifies the appropriate HR/Admin users.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    // --- Session and User Verification ---
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || !currentUser.isActive) {
      return new NextResponse("User not found or account inactive", { status: 404 });
    }

    // --- Request Body Validation ---
    const body = await req.json();
    const { date, hours, reason } = body;

    if (!date || !hours || !reason) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    if (typeof hours !== 'number' || hours <= 0) {
        return new NextResponse("Hours must be a positive number.", { status: 400 });
    }

    // --- Create Overtime Request ---
    const overtimeRequest = await prisma.overtimeRequest.create({
      data: {
        userId: currentUser.id,
        date: new Date(date),
        hours,
        reason,
        status: "PENDING", // Default status
      },
    });

    // --- Notify Admins and HR ---
    const adminsAndHR = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [{ role: "ADMIN" }, { role: "HR" }],
      },
    });

    if (adminsAndHR.length > 0) {
      const notificationPromises = adminsAndHR.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            message: `${currentUser.name} has submitted a new overtime request.`,
            link: `/admin/hr/manage-requests`, // Link to request management page
            createdBy: currentUser.id,
          },
        })
      );
      await Promise.all(notificationPromises);
    }

    return NextResponse.json(overtimeRequest);

  } catch (error) {
    console.error("[OVERTIME_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
