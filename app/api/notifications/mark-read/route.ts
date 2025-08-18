// app/api/notifications/mark-read/route.ts
// This API endpoint marks all unread notifications for the current user as read.
// It's typically called when the user opens the notification dropdown.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PATCH(req: Request) {
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

    // --- Update Notifications Logic ---
    // Use 'updateMany' to efficiently update all matching records.
    const { count } = await prisma.notification.updateMany({
      where: {
        userId: currentUser.id,
        read: false, // Only target unread notifications
      },
      data: {
        read: true, // Set the 'read' status to true
      },
    });

    return NextResponse.json({ message: `${count} notifications marked as read.` });

  } catch (error) {
    console.error("[NOTIFICATIONS_MARK_READ_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
