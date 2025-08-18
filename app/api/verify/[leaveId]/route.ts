// app/api/verify/[leaveId]/route.ts
// This is a public API endpoint designed to be called by the verification page.
// It fetches the details of a specific, approved leave request to confirm its authenticity.
// It does not require authentication.

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

interface IParams {
  leaveId?: string;
}

export async function GET(
  req: Request,
  { params }: { params: IParams }
) {
  try {
    const { leaveId } = params;

    if (!leaveId) {
      return new NextResponse("Leave Request ID is required", { status: 400 });
    }

    // --- Fetch the Approved Leave Request ---
    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        id: leaveId,
        status: "APPROVED", // IMPORTANT: Only return details for approved requests
      },
      // Select only the necessary, non-sensitive information for public verification
      select: {
        id: true,
        leaveType: true,
        startDate: true,
        endDate: true,
        status: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!leaveRequest) {
      // If no approved request is found, return a 404
      return new NextResponse("Approved leave request not found", { status: 404 });
    }

    return NextResponse.json(leaveRequest);

  } catch (error) {
    console.error("[VERIFY_LEAVE_GET_ERROR]", error);
    // Return a generic error to avoid leaking implementation details
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
