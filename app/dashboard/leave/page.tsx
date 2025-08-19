// app/(dashboard)/leave/page.tsx
// This component serves as the main page for leave management for an employee.
// It includes a form to request new leave and a table showing their request history.

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner"; // Updated import for Sonner
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

// Define the User Profile type to hold leave balances
type UserProfile = {
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  maternityLeaveBalance: number;
  paternityLeaveBalance: number;
  compassionateLeaveBalance: number;
  unpaidLeaveBalance: number;
};

// --- Validation Schema using Zod ---
const formSchema = z.object({
  leaveType: z.enum([
    "ANNUAL", "SICK", "MATERNITY", "PATERNITY", "COMPASSIONATE", "UNPAID"
  ], { message: "Leave type is required." }),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  })
  .refine((data) => data.from, {
    message: "Start date is required.",
    path: ["from"],
  })
  .refine((data) => data.to, {
    message: "End date is required.",
    path: ["to"],
  }),
  reason: z.string().min(10, { message: "Reason must be at least 10 characters." }),
});

export default function LeaveRequestPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string | null>(null);

  // Fetch user profile to get leave balances
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.email) {
        try {
          const response = await axios.get('/api/profile'); 
          setUserProfile(response.data);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      }
    };
    fetchUserProfile();
  }, [session]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        reason: "",
    },
  });

  const { isSubmitting } = form.formState;

  // --- Form Submission Handler ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const data = {
        ...values,
        startDate: values.dateRange.from,
        endDate: values.dateRange.to,
    };

    try {
      await axios.post("/api/leave", data);
      toast.success("Request Submitted", {
        description: "Your leave request has been submitted for approval.",
      });
      form.reset();
      router.refresh(); // Refresh to update the leave history table
    } catch (error) {
      console.error("Leave request failed:", error);
      let errorMessage = "An unexpected error occurred.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data;
      }
      toast.error("Submission Failed", {
        description: errorMessage,
      });
    }
  };

  const getLeaveBalance = (leaveType: string | null) => {
    if (!userProfile || !leaveType) return "N/A";
    switch (leaveType) {
        case "ANNUAL": return userProfile.annualLeaveBalance;
        case "SICK": return userProfile.sickLeaveBalance;
        case "MATERNITY": return userProfile.maternityLeaveBalance;
        case "PATERNITY": return userProfile.paternityLeaveBalance;
        case "COMPASSIONATE": return userProfile.compassionateLeaveBalance;
        default: return "N/A";
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Request Leave</h1>
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Leave Type Field */}
                <FormField
                control={form.control}
                name="leaveType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedLeaveType(value);
                    }} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a leave type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                            <SelectItem value="SICK">Sick Leave</SelectItem>
                            <SelectItem value="MATERNITY">Maternity Leave</SelectItem>
                            <SelectItem value="PATERNITY">Paternity Leave</SelectItem>
                            <SelectItem value="COMPASSIONATE">Compassionate Leave</SelectItem>
                            <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                {/* Leave Balance Display */}
                <div className="space-y-2">
                    <FormLabel>Remaining Balance</FormLabel>
                    <div className="flex items-center justify-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {getLeaveBalance(selectedLeaveType)} Days
                    </div>
                </div>
            </div>
            {/* Date Range Field */}
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Range</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={field.value as DateRange}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Reason Field */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Leave</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a brief reason for your leave request..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Placeholder for Leave History Table */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Your Leave History</h2>
        <div className="rounded-md border p-4 text-center text-gray-500">
            Leave history table will be implemented here.
        </div>
      </div>
    </div>
  );
}
