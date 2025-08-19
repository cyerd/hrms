// app/api/overtime/[overtimeId]/route.ts
// This API endpoint updates a specific overtime request (e.g., to approve or deny it).
// It is protected and only accessible by users with the 'ADMIN' or 'HR' role.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

interface IParams {
  overtimeId?: string;
}

export async function PATCH(
  req: Request,
  { params }: { params: IParams }
) {
  try {
    // --- Session and Role Verification ---
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "HR")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // --- Parameter and Body Validation ---
    const { overtimeId } = params;
    const { status } = await req.json();

    if (!overtimeId) {
      return new NextResponse("Overtime Request ID is required", { status: 400 });
    }

    if (!["APPROVED", "DENIED"].includes(status)) {
      return new NextResponse("Invalid status provided", { status: 400 });
    }

    const overtimeRequest = await prisma.overtimeRequest.findUnique({
      where: { id: overtimeId },
    });

    if (!overtimeRequest) {
      return new NextResponse("Overtime Request not found", { status: 404 });
    }

    if (overtimeRequest.status !== 'PENDING') {
      return new NextResponse(`This request has already been ${overtimeRequest.status.toLowerCase()}.`, { status: 400 });
    }

    // --- Update Overtime Request Status ---
    const updatedRequest = await prisma.overtimeRequest.update({
      where: { id: overtimeId },
      data: {
        status,
        approvedBy: status === "APPROVED" ? currentUser.id : null,
        deniedBy: status === "DENIED" ? currentUser.id : null,
      },
    });
    
    // --- Create In-App Notification for the Employee ---
    await prisma.notification.create({
        data: {
            userId: overtimeRequest.userId,
            message: `Your overtime request for ${overtimeRequest.hours} hours has been ${status.toLowerCase()}.`,
            link: `/overtime`, // Link to the overtime page
            createdBy: currentUser.id,
        }
    });

    return NextResponse.json(updatedRequest);

  } catch (error) {
    console.error("[OVERTIME_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
