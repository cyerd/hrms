// app/(dashboard)/leave/[leaveId]/page.tsx
// This page displays the full details of a single leave request.
// It also provides a button to download the official PDF for approved requests.

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { generateLeaveRequestPDF } from "@/lib/PDFGenerator";
import { toast } from "sonner";

// Define the structure for the leave request data
type LeaveRequestDetails = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  createdAt: string;
  user: {
    name: string | null;
  };
};

export default function LeaveDetailPage() {
  const params = useParams();
  const { leaveId } = params;

  const [request, setRequest] = useState<LeaveRequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (leaveId) {
      const fetchRequestDetails = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`/api/leave/${leaveId}`);
          setRequest(response.data);
        } catch (error) {
          console.error("Failed to fetch request details:", error);
          toast.error("Error", { description: "Could not load request details." });
        } finally {
          setIsLoading(false);
        }
      };
      fetchRequestDetails();
    }
  }, [leaveId]);

  const handlePDFDownload = async () => {
    if (!request) return;
    setIsGeneratingPDF(true);
    try {
      const success = await generateLeaveRequestPDF(request);
      if (!success) {
        toast.error("PDF Generation Failed", { description: "Please try again." });
      }
    } catch (error) {
      console.error(error);
      toast.error("PDF Generation Failed", { description: "An unexpected error occurred." });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!request) {
    return <div className="text-center">Leave request not found.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Leave Request Details</CardTitle>
              <CardDescription>Submitted by {request.user.name} on {format(new Date(request.createdAt), "PPP")}</CardDescription>
            </div>
            <Badge variant={request.status === "PENDING" ? "outline" : request.status === "APPROVED" ? "default" : "destructive"}>
              {request.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="font-medium text-gray-600">Leave Type:</span>
              <span>{request.leaveType}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-600">Date Range:</span>
              <span>{format(new Date(request.startDate), "MMM d, yyyy")} - {format(new Date(request.endDate), "MMM d, yyyy")}</span>
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-600">Reason Provided:</span>
            <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md mt-1">{request.reason}</p>
          </div>
          {request.status === "APPROVED" && (
            <div className="pt-4">
              <Button onClick={handlePDFDownload} disabled={isGeneratingPDF}>
                {isGeneratingPDF ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" /> Download PDF</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
