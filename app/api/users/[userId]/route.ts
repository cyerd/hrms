// app/api/users/[userId]/route.ts
// This API endpoint updates a specific user's details.
// It is protected and only accessible by users with the 'ADMIN' or 'HR' role.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

interface IParams {
  userId?: string;
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

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (currentUser.role !== "ADMIN" && currentUser.role !== "HR") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // --- Parameter and Body Validation ---
    const { userId } = params;
    const body = await req.json();
    const { name, role, isActive } = body;

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // --- Update User Logic ---
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        role,
        isActive,
      },
      // Exclude sensitive data from the returned object
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("[USER_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
