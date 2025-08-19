// components/dashboard/Sidebar.tsx
// This component provides the main navigation for the dashboard.
// It uses the user's session to conditionally render links based on their role.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Calendar, User, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the structure for navigation links
const navLinks = {
  employee: [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/dashboard/leave", label: "Leave Request", icon: Calendar },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ],
  admin: [
    { href: "/hr/manage-users", label: "Manage Users", icon: Users },
    { href: "/hr/manage-requests", label: "Manage Requests", icon: FileText },
  ],
};

const Sidebar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = session?.user?.role;

  const getLinkClass = (href: string) => {
    return cn(
      "flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200",
      pathname === href ? "bg-gray-200 dark:bg-gray-700 font-semibold" : ""
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
      <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">AVOPRO HR</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navLinks.employee.map((link) => (
          <Link key={link.label} href={link.href} className={getLinkClass(link.href)}>
            <link.icon className="w-5 h-5 mr-3" />
            {link.label}
          </Link>
        ))}

        {(userRole === 'ADMIN' || userRole === 'HR') && (
          <>
            <div className="pt-4">
              <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admin Tools
              </span>
            </div>
            {navLinks.admin.map((link) => (
              <Link key={link.label} href={link.href} className={getLinkClass(link.href)}>
                <link.icon className="w-5 h-5 mr-3" />
                {link.label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
