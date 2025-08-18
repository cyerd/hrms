// app/api/profile/route.ts
// This API endpoint handles both fetching (GET) and updating (PATCH)
// the current user's profile information.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// --- GET Handler: Fetches the current user's profile ---
export async function GET(req: Request) {
  try {
    // Session and User Verification
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    // Fetch User Profile from Database
    const userProfile = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      // Select only the fields needed for the profile/leave form
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        dateOfBirth: true,
        bio: true,
        annualLeaveBalance: true,
        sickLeaveBalance: true,
        maternityLeaveBalance: true,
        paternityLeaveBalance: true,
        compassionateLeaveBalance: true,
      },
    });

    if (!userProfile) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error("[PROFILE_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


// --- PATCH Handler: Updates the current user's bio ---
export async function PATCH(req: Request) {
  try {
    // Session and User Verification
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const body = await req.json();
    const { bio } = body;

    if (typeof bio !== 'string') {
        return new NextResponse("Invalid bio format", { status: 400 });
    }

    // Update User's Bio
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        bio: bio,
      },
       // Select only non-sensitive fields to return
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("[PROFILE_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
