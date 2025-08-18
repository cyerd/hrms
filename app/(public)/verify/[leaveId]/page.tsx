// app/(public)/verify/[leaveId]/page.tsx
// This is the public-facing page for verifying the authenticity of a leave document.
// It fetches data from the public verification API and displays the result.

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

// Define the structure for the verified request data
type VerifiedRequest = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: "APPROVED";
  user: {
    name: string | null;
  };
};

export default function VerificationPage() {
  const params = useParams();
  const { leaveId } = params;

  const [request, setRequest] = useState<VerifiedRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leaveId) {
      const verifyRequest = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get(`/api/verify/${leaveId}`);
          setRequest(response.data);
        } catch (err) {
          console.error("Verification failed:", err);
          setError("This document could not be verified. The request may be invalid or was not approved.");
        } finally {
          setIsLoading(false);
        }
      };
      verifyRequest();
    }
  }, [leaveId]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-500">Verifying document...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center space-y-3 text-red-600">
          <XCircle className="h-12 w-12" />
          <p className="font-semibold">Verification Failed</p>
          <p className="text-sm text-center">{error}</p>
        </div>
      );
    }

    if (request) {
      return (
        <div>
          <div className="flex flex-col items-center justify-center space-y-3 text-green-600 mb-6">
            <CheckCircle className="h-12 w-12" />
            <p className="font-semibold text-lg">Document Verified</p>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Employee Name:</span>
              <span>{request.user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Leave Type:</span>
              <span>{request.leaveType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Date Range:</span>
              <span>
                {format(new Date(request.startDate), "MMM d, yyyy")} - {format(new Date(request.endDate), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-600">Status:</span>
              <Badge variant="default">{request.status}</Badge>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-center">Document Verification</CardTitle>
          <CardDescription className="text-center">
            Authenticity check for AVOPRO EPZ LIMITED official documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
