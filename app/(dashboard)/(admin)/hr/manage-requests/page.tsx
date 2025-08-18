// app/(dashboard)/(admin)/hr/manage-requests/page.tsx
// This is the frontend component for the leave request management dashboard.
// It fetches all leave requests and allows HR/Admins to approve or deny them.

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; // Updated import for Sonner
import { format } from "date-fns";

// Define the LeaveRequest type based on what the API returns
export type LeaveRequest = {
  id: string;
  user: {
    name: string | null;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "DENIED";
};

export default function ManageRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/leave/all");
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch leave requests:", error);
      toast.error("Error", {
        description: "Failed to load leave requests.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // --- Request Update Handler ---
  const handleUpdateRequest = async (requestId: string, status: "APPROVED" | "DENIED") => {
    try {
      await axios.patch(`/api/leave/${requestId}`, { status });
      toast.success("Success", {
        description: `Request has been ${status.toLowerCase()}.`,
      });
      fetchRequests(); // Refresh data to show the change
    } catch (error) {
      console.error("Failed to update request:", error);
      const errorMessage = axios.isAxiosError(error) && error.response ? error.response.data : "Failed to update request.";
      toast.error("Error", {
        description: errorMessage,
      });
    }
  };

  // --- Table Column Definitions ---
  const columns: ColumnDef<LeaveRequest>[] = [
    {
      accessorKey: "user.name",
      header: "Employee",
    },
    {
      accessorKey: "leaveType",
      header: "Type",
      cell: ({ row }) => <Badge variant="secondary">{row.original.leaveType}</Badge>,
    },
    {
        accessorKey: "dateRange",
        header: "Dates",
        cell: ({ row }) => `${format(new Date(row.original.startDate), "MMM d, yyyy")} - ${format(new Date(row.original.endDate), "MMM d, yyyy")}`,
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
            <Badge variant={status === "PENDING" ? "outline" : status === "APPROVED" ? "default" : "destructive"}>
                {status}
            </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const request = row.original;
        if (request.status !== "PENDING") {
          return null; // Don't show actions for already processed requests
        }
        return (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateRequest(request.id, "APPROVED")}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleUpdateRequest(request.id, "DENIED")}
            >
              Deny
            </Button>
          </div>
        );
      },
    },
  ];

  // --- Table Instance ---
  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Leave Requests</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading requests...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No pending requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
