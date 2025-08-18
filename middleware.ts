// middleware.ts
// This file configures the NextAuth.js middleware to protect routes.
// It ensures that users are authenticated and have the correct role for admin pages.

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Export the default middleware using the withAuth helper
export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  // This function is called ONLY if the `authorized` callback returns true.
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // --- Role-Based Access Control ---
    // If the user is trying to access an admin route...
    if (pathname.startsWith("/admin")) {
      // ...and they don't have the correct role...
      if (token?.role !== "ADMIN" && token?.role !== "HR") {
        // ...redirect them to the dashboard page as a fallback.
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // If all checks pass, allow the request to continue.
    return NextResponse.next();
  },
  {
    callbacks: {
      // This callback first checks if the user is logged in at all.
      // If it returns false, the user is redirected to the login page.
      // If it returns true, the `middleware` function above is executed.
      authorized: ({ token }) => !!token,
    },
  }
);

// The matcher configures which routes the middleware will run on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - api/register (Public registration API)
     * - api/password (Public password reset API)
     * - api/verify (Public verification API)
     * - login (The login page)
     * - register (The registration page)
     * - forgot-password (The forgot password page)
     * - reset-password (The reset password page)
     * - verify (The public verification page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|api/register|api/password|api/verify|login|register|forgot-password|reset-password|verify|_next/static|_next/image|favicon.ico).*)",
  ],
};
