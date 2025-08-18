// lib/auth.ts
// This file contains the core configuration for NextAuth.js, separate from the route handler.
// This allows you to import the `authOptions` object in other parts of your application
// without pulling in the route handler logic (e.g., for `getServerSession`).

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/db";

export const authOptions: AuthOptions = {
  // Use the Prisma adapter to store users, sessions, etc., in your MongoDB database
  adapter: PrismaAdapter(prisma),
  
  // Configure the authentication providers
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      // The authorize function is where you'll verify the user's credentials
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        // Check if user exists and if their account is active
        if (!user || !user.hashedPassword || !user.isActive) {
          throw new Error('Invalid credentials or account not activated.');
        }

        // Check if the password is correct
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        // If everything is correct, return the user object
        return user;
      }
    })
  ],
  
  // Define custom pages, like the login page
  pages: {
    signIn: '/login',
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Use JSON Web Tokens for session management
  session: {
    strategy: "jwt",
  },

  // Callbacks are used to control what happens on certain actions
  callbacks: {
    // The jwt callback is called whenever a JWT is created or updated
    jwt({ token, user }) {
      if (user) {
        // When a user signs in, add their ID and role to the token
        // The user object here has the type 'User' from next-auth, which might not have the 'role' property.
        // We need to assert the type or check if the property exists.
        const u = user as any; // Cast to 'any' to access custom properties
        token.id = u.id;
        token.role = u.role;
      }
      return token;
    },
    // The session callback is called whenever a session is checked
    session({ session, token }) {
      if (session.user) {
        // Add the custom properties from the token to the session object
        session.user.id = token.id as string;
        session.user.role = token.role as "EMPLOYEE" | "HR" | "ADMIN";
      }
      return session;
    },
  },

  // A secret is required to sign the JWTs
  secret: process.env.NEXTAUTH_SECRET,
};
