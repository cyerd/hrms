// providers/SessionProvider.tsx
// This is a client-side component that wraps our application to provide
// the NextAuth session context to all child components.

"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import React from "react"; // Import React

interface Props {
  children: React.ReactNode;
  session: Session | null;
}

/**
 * A wrapper for the NextAuth SessionProvider.
 * @param {Props} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be wrapped.
 * @param {Session | null} props.session - The NextAuth session object.
 */
export default function Provider({ children, session }: Props) { // Removed explicit JSX.Element return type
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
