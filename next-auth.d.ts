// next-auth.d.ts
// This file uses module augmentation to add custom properties to the NextAuth types.
// This makes properties like 'role' and 'id' available on the session and token
// objects with full TypeScript support.

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Define the user roles based on your Prisma schema
type UserRole = "EMPLOYEE" | "HR" | "ADMIN";

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: UserRole;
    id: string;
  }
}

// Extend the Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"]; // Keep the default properties like name, email, image
  }

  // Extend the User type
  interface User extends DefaultUser {
    role: UserRole;
  }
}
