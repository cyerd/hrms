// app/api/users/route.ts
// This API endpoint fetches all users from the database.
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

    // Fetch the current user from the database to check their role
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (currentUser.role !== "ADMIN" && currentUser.role !== "HR") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // --- Fetch All Users ---
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc", // Show the newest users first
      },
      // Exclude the password field from the result
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        gender: true,
      },
    });

    return NextResponse.json(users);
    
  } catch (error) {
    console.error("[USERS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
