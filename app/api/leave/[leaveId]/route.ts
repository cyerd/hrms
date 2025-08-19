// app/api/leave/[leaveId]/route.ts
// This file handles both fetching (GET) and updating (PATCH) a single leave request.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { differenceInDays } from 'date-fns';
import { generateLeaveRequestPDFBuffer } from "@/lib/PDFGenerator.server"; // Import server-side PDF generator
import { sendApprovalEmailWithAttachment } from "@/lib/mail"; // Import email function

// --- GET Handler: Fetches a single leave request by its ID ---
export async function GET(
  req: Request,
  { params }: { params: { leaveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    const { leaveId } = params;
    if (!leaveId) {
      return new NextResponse("Leave Request ID is required", { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { user: { select: { name: true } } },
    });

    if (!leaveRequest) {
      return new NextResponse("Leave Request not found", { status: 404 });
    }

    const isOwner = leaveRequest.userId === currentUser.id;
    const isAdminOrHR = currentUser.role === "ADMIN" || currentUser.role === "HR";

    if (!isOwner && !isAdminOrHR) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error("[LEAVE_GET_BY_ID_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// --- PATCH Handler: Approves or denies a leave request ---
export async function PATCH(
  req: Request,
  { params }: { params: { leaveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "HR")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

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
      include: { user: true },
    });

    if (!leaveRequest || !leaveRequest.user) {
      return new NextResponse("Leave Request not found", { status: 404 });
    }
    if (leaveRequest.status !== 'PENDING') {
      return new NextResponse(`This request has already been ${leaveRequest.status.toLowerCase()}.`, { status: 400 });
    }

    let updatedRequest;

    if (status === "APPROVED") {
      const leaveDuration = differenceInDays(leaveRequest.endDate, leaveRequest.startDate) + 1;
      const userToUpdate = leaveRequest.user;
      let balanceToUpdate = {};

      switch (leaveRequest.leaveType) {
        case 'ANNUAL':
          balanceToUpdate = { annualLeaveBalance: userToUpdate.annualLeaveBalance - leaveDuration };
          break;
        case 'SICK':
          balanceToUpdate = { sickLeaveBalance: userToUpdate.sickLeaveBalance - leaveDuration };
          break;
        // Add cases for other leave types...
      }
      
      const transactionResult = await prisma.$transaction([
        prisma.user.update({
          where: { id: userToUpdate.id },
          data: balanceToUpdate,
        }),
        prisma.leaveRequest.update({
          where: { id: leaveId },
          data: { status: "APPROVED", approvedBy: currentUser.id },
          include: { user: true } // Include user data for the email
        }),
      ]);

      updatedRequest = transactionResult[1];

      // --- Generate PDF and Send Approval Email ---
      if (updatedRequest) {
        const pdfBuffer = await generateLeaveRequestPDFBuffer(updatedRequest);
        await sendApprovalEmailWithAttachment(
          updatedRequest.user.email,
          updatedRequest,
          pdfBuffer
        );
      }

    } else { // status === "DENIED"
      updatedRequest = await prisma.leaveRequest.update({
        where: { id: leaveId },
        data: { status: "DENIED", deniedBy: currentUser.id },
      });
    }

    await prisma.notification.create({
        data: {
            userId: leaveRequest.userId,
            message: `Your ${leaveRequest.leaveType.toLowerCase()} leave request has been ${status.toLowerCase()}.`,
            link: `/leave/${leaveRequest.id}`,
            createdBy: currentUser.id,
        }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("[LEAVE_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
