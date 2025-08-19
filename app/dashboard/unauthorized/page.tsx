// app/(dashboard)/unauthorized/page.tsx
// A simple, clean fallback page to show users when they attempt to access
// a route they do not have the required permissions for.

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        You do not have the necessary permissions to view this page.
      </p>
      <Button asChild>
        <Link href="/">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
