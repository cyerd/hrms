// app/api/requests/all/route.ts
// This API endpoint fetches all leave and overtime requests for the admin/HR dashboard.
// It is protected and only accessible by users with the 'ADMIN' or 'HR' role.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    // --- Session and Role Verification ---
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

    if (currentUser.role !== "ADMIN" && currentUser.role !== "HR") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // --- Fetch All Leave Requests ---
    const leaveRequests = await prisma.leaveRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // --- Fetch All Overtime Requests ---
    const overtimeRequests = await prisma.overtimeRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // --- Combine and type the requests for the frontend ---
    // Add a 'requestType' field to distinguish between them
    const allRequests = [
      ...leaveRequests.map(req => ({ ...req, requestType: 'Leave' })),
      ...overtimeRequests.map(req => ({ ...req, requestType: 'Overtime' }))
    ];

    // --- Sort combined requests by creation date ---
    allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(allRequests);
    
  } catch (error) {
    console.error("[ALL_REQUESTS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
