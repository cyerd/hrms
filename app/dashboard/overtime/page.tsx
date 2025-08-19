// app/(dashboard)/overtime/page.tsx
// This component provides the UI for employees to submit overtime requests.

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// --- Validation Schema using Zod ---
const formSchema = z.object({
  date: z.date({
    message: "A date is required.",
  }),
  // Use z.preprocess to handle string-to-number conversion from the input
  hours: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ message: "Hours are required." }).min(0.5, {
      message: "Overtime must be at least 0.5 hours.",
    })
  ),
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
});

export default function OvertimeRequestPage() {
  const router = useRouter();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      hours: undefined,
      date: undefined,
    },
  });

  const selectedDate = watch("date");

  // --- Form Submission Handler ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/overtime", values);
      toast.success("Request Submitted", {
        description: "Your overtime request has been submitted for approval.",
      });
      reset(); // Reset form state
      router.refresh(); // Refresh to update the overtime history table
    } catch (error) {
      console.error("Overtime request failed:", error);
      const errorMessage = axios.isAxiosError(error) && error.response 
        ? error.response.data 
        : "An unexpected error occurred.";
      toast.error("Submission Failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Request Overtime</h1>
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md border">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Field */}
            <FormItem className="flex flex-col">
              <FormLabel>Date of Overtime</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setValue("date", date as Date, { shouldValidate: true })}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-sm font-medium text-destructive">{errors.date.message}</p>}
            </FormItem>

            {/* Hours Field */}
            <FormItem>
              <FormLabel>Hours Worked</FormLabel>
              <Input type="number" placeholder="e.g., 2.5" {...register("hours")} />
              {errors.hours && <p className="text-sm font-medium text-destructive">{errors.hours.message}</p>}
            </FormItem>
          </div>

          {/* Reason Field */}
          <FormItem>
            <FormLabel>Reason for Overtime</FormLabel>
            <Textarea
              placeholder="Please provide a brief reason for the overtime..."
              className="resize-none"
              {...register("reason")}
            />
            {errors.reason && <p className="text-sm font-medium text-destructive">{errors.reason.message}</p>}
          </FormItem>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </div>

      {/* Placeholder for Overtime History Table */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Your Overtime History</h2>
        <div className="rounded-md border p-4 text-center text-gray-500">
          Overtime history table will be implemented here.
        </div>
      </div>
    </div>
  );
}
