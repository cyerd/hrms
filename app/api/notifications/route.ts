// app/api/notifications/route.ts
// This API endpoint fetches all notifications for the currently authenticated user.
// It's used to populate the notification bell in the dashboard header.

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

    // --- Fetch Notifications for the Current User ---
    const notifications = await prisma.notification.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      orderBy: {
        createdAt: "desc", // Show the most recent notifications first
      },
      // Include the creator's name for context in the notification message
      include: {
        creator: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(notifications);

  } catch (error) {
    console.error("[NOTIFICATIONS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
