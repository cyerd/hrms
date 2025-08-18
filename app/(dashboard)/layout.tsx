// app/(dashboard)/layout.tsx
// This is the main layout for all authenticated pages in the application.
// It includes a persistent sidebar for navigation and a header that contains
// user information and the NotificationBell component.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar"; // We will create this component
import Header from "@/components/dashboard/Header";   // We will create this component
import SessionProvider from "@/providers/SessionProvider"; // Standard NextAuth provider

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Protect the dashboard routes. If no session, redirect to login.
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar Navigation */}
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}