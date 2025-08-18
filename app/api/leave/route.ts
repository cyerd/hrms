// app/api/leave/route.ts
// This API endpoint handles the creation of a new leave request.
// It validates the request, checks for business logic rules (like gender restrictions),
// and notifies the appropriate HR/Admin users.

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
    const { leaveType, startDate, endDate, reason } = body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    // --- Business Logic: Gender-based Leave Restrictions ---
    if (leaveType === "MATERNITY" && currentUser.gender !== "FEMALE") {
        return new NextResponse("Maternity leave is only available for female employees.", { status: 400 });
    }
    if (leaveType === "PATERNITY" && currentUser.gender !== "MALE") {
        return new NextResponse("Paternity leave is only available for male employees.", { status: 400 });
    }

    // --- Business Logic: Check for Overlapping Leave Dates ---
    const overlappingRequest = await prisma.leaveRequest.findFirst({
        where: {
            userId: currentUser.id,
            status: { in: ["PENDING", "APPROVED"] },
            OR: [
                {
                    startDate: { lte: new Date(endDate) },
                    endDate: { gte: new Date(startDate) }
                }
            ]
        }
    });

    if (overlappingRequest) {
        return new NextResponse("You already have a pending or approved request in this date range.", { status: 409 });
    }


    // --- Create Leave Request ---
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: currentUser.id,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
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
            message: `${currentUser.name} has submitted a new ${leaveType.toLowerCase()} leave request.`,
            link: `/admin/hr/manage-requests`, // Link to request management page
            createdBy: currentUser.id,
          },
        })
      );
      await Promise.all(notificationPromises);
    }

    return NextResponse.json(leaveRequest);

  } catch (error) {
    console.error("[LEAVE_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
