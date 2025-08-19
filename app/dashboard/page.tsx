// app/(dashboard)/page.tsx
// This is the main landing page for authenticated users.
// It fetches summary data and displays role-specific widgets.

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, FileWarning, UserCheck, CalendarDays, Hourglass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Define the structure for the summary data
type SummaryData = {
  role: "ADMIN" | "HR" | "EMPLOYEE";
  // Admin/HR fields
  pendingLeaveRequests?: number;
  inactiveUsers?: number;
  usersOnLeaveToday?: number;
  // Employee fields
  upcomingLeave?: { startDate: string; leaveType: string } | null;
  pendingRequestsCount?: number;
  annualLeaveBalance?: number;
  sickLeaveBalance?: number;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/dashboard/summary");
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!summary) {
    return <div className="text-center">Could not load dashboard data.</div>;
  }

  // --- Admin & HR Dashboard View ---
  if (summary.role === "ADMIN" || summary.role === "HR") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leave Requests</CardTitle>
              <FileWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pendingLeaveRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting your approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive User Accounts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.inactiveUsers}</div>
              <p className="text-xs text-muted-foreground">Require activation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees on Leave Today</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.usersOnLeaveToday}</div>
              <p className="text-xs text-muted-foreground">Currently out of office</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- Employee Dashboard View ---
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Leave</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.upcomingLeave ? (
              <div>
                <p className="text-lg">Your next approved leave is a <span className="font-semibold">{summary.upcomingLeave.leaveType.toLowerCase()}</span> leave starting on</p>
                <p className="text-2xl font-bold text-blue-600">{format(new Date(summary.upcomingLeave.startDate), "MMMM d, yyyy")}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">You have no upcoming approved leave.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pendingRequestsCount}</div>
            <p className="text-xs text-muted-foreground">Currently awaiting approval</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
                <Button asChild><Link href="/dashboard/leave">Request Leave</Link></Button>
                <Button variant="outline" asChild><Link href="/dashboard/profile">View Profile</Link></Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Leave Balances</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-8">
                <div>
                    <div className="text-2xl font-bold">{summary.annualLeaveBalance}</div>
                    <p className="text-xs text-muted-foreground">Annual Days</p>
                </div>
                <div>
                    <div className="text-2xl font-bold">{summary.sickLeaveBalance}</div>
                    <p className="text-xs text-muted-foreground">Sick Days</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
