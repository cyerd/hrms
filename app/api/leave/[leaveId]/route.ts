// app/api/leave/[leaveId]/route.ts
// This API endpoint updates a specific leave request (e.g., to approve or deny it).
// It is protected and only accessible by users with the 'ADMIN' or 'HR' role.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { differenceInDays } from 'date-fns';

interface IParams {
  leaveId?: string;
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
    const { leaveId } = params;
    const { status } = await req.json();

    if (!leaveId) {
      return new NextResponse("Leave Request ID is required", { status: 400 });
    }

    if (!["APPROVED", "DENIED"].includes(status)) {
      return new NextResponse("Invalid status provided", { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { user: true }, // Include the user to update their balance
    });

    if (!leaveRequest || !leaveRequest.user) {
      return new NextResponse("Leave Request not found", { status: 404 });
    }

    if (leaveRequest.status !== 'PENDING') {
      return new NextResponse(`This request has already been ${leaveRequest.status.toLowerCase()}.`, { status: 400 });
    }

    let updatedRequest;

    // --- Main Update Logic ---
    if (status === "APPROVED") {
      const leaveDuration = differenceInDays(leaveRequest.endDate, leaveRequest.startDate) + 1;
      const userToUpdate = leaveRequest.user;
      let balanceToUpdate = {};

      // Determine which leave balance to deduct from
      switch (leaveRequest.leaveType) {
        case 'ANNUAL':
          balanceToUpdate = { annualLeaveBalance: userToUpdate.annualLeaveBalance - leaveDuration };
          break;
        case 'SICK':
          balanceToUpdate = { sickLeaveBalance: userToUpdate.sickLeaveBalance - leaveDuration };
          break;
        // Add cases for other leave types...
        default:
          // For leave types like UNPAID, no balance is deducted.
          break;
      }
      
      // Use a transaction to ensure both updates succeed or fail together
      [ updatedRequest] = await prisma.$transaction([
        prisma.user.update({
          where: { id: userToUpdate.id },
          data: balanceToUpdate,
        }),
        prisma.leaveRequest.update({
          where: { id: leaveId },
          data: {
            status: "APPROVED",
            approvedBy: currentUser.id,
          },
        }),
      ]);

      // TODO: Trigger email notification with PDF attachment to the employee
      // await sendApprovalEmail(leaveRequest.user.email, updatedRequest);

    } else { // status === "DENIED"
      updatedRequest = await prisma.leaveRequest.update({
        where: { id: leaveId },
        data: {
          status: "DENIED",
          deniedBy: currentUser.id,
        },
      });
    }

    // --- Create In-App Notification for the Employee ---
    await prisma.notification.create({
        data: {
            userId: leaveRequest.userId,
            message: `Your ${leaveRequest.leaveType.toLowerCase()} leave request has been ${status.toLowerCase()}.`,
            link: `/leave/${leaveRequest.id}`, // Link to the request detail page
            createdBy: currentUser.id,
        }
    });

    return NextResponse.json(updatedRequest);

  } catch (error) {
    console.error("[LEAVE_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
