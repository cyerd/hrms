// app/api/dashboard/summary/route.ts
// This API endpoint fetches summary data for the main dashboard page.
// The data returned is tailored to the role of the currently authenticated user.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    // --- Session and User Verification ---
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    let summaryData = {};

    // --- Role-Based Data Fetching ---
    if (currentUser.role === "ADMIN" || currentUser.role === "HR") {
      // For Admins/HR, fetch system-wide statistics
      const pendingLeaveRequests = await prisma.leaveRequest.count({
        where: { status: "PENDING" },
      });
      const inactiveUsers = await prisma.user.count({
        where: { isActive: false },
      });
      const usersOnLeaveToday = await prisma.leaveRequest.count({
        where: {
            status: "APPROVED",
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
        }
      });

      summaryData = {
        role: currentUser.role,
        pendingLeaveRequests,
        inactiveUsers,
        usersOnLeaveToday,
      };

    } else {
      // For Employees, fetch personal statistics
      const upcomingLeave = await prisma.leaveRequest.findFirst({
        where: {
          userId: currentUser.id,
          status: "APPROVED",
          startDate: { gte: new Date() },
        },
        orderBy: {
            startDate: 'asc'
        }
      });
      const pendingRequestsCount = await prisma.leaveRequest.count({
        where: {
            userId: currentUser.id,
            status: "PENDING",
        }
      });

      summaryData = {
        role: currentUser.role,
        upcomingLeave,
        pendingRequestsCount,
        annualLeaveBalance: currentUser.annualLeaveBalance,
        sickLeaveBalance: currentUser.sickLeaveBalance,
      };
    }

    return NextResponse.json(summaryData);

  } catch (error) {
    console.error("[DASHBOARD_SUMMARY_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
