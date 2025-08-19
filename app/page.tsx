// app/page.tsx
// This is the main landing page for the application.
// It checks if a user is authenticated and redirects them to the dashboard if they are.
// Otherwise, it serves as a public, well-designed landing page.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Clock, ShieldCheck } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If the user is already logged in, redirect them to the main dashboard page.
  if (!session?.user) {
    redirect("/");
  } else {
    redirect("/dashboard");
  }

  // If the user is not logged in, show the public landing page.
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white dark:bg-gray-800 shadow-sm">
        <Link className="flex items-center justify-center" href="#">
          <span className="text-lg font-bold">AVOPRO HR</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Streamline Your Human Resources
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  An all-in-one platform for managing leave, overtime, and official documents with a secure and intuitive workflow.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-block rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Effortless Leave Management</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Submit and approve leave requests with a clear overview of balances and history.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-block rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Transparent Overtime Tracking</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  A simple process for requesting and approving overtime, ensuring everyone is on the same page.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-block rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Verifiable Documents</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Generate official, QR-coded PDF documents for approved requests to ensure authenticity.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 AVOPRO EPZ LIMITED. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
