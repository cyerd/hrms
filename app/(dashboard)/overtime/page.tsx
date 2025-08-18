// app/(dashboard)/overtime/page.tsx
// This component provides the UI for employees to submit overtime requests.

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
    required_error: "A date is required.",
  }),
  // Validate as a string first, then transform to a number to fix type issues.
  hours: z.string({ required_error: "Hours are required." })
    .refine(val => !isNaN(parseFloat(val)), { message: "Please enter a valid number." })
    .transform(val => parseFloat(val))
    .refine(val => val >= 0.5, { message: "Overtime must be at least 0.5 hours." }),
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters.",
  }),
});

export default function OvertimeRequestPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      hours: "" as any, // Initialize as an empty string for the input
      date: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  // --- Form Submission Handler ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/overtime", values);
      toast.success("Request Submitted", {
        description: "Your overtime request has been submitted for approval.",
      });
      form.reset();
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Field */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Overtime</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Hours Field */}
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Worked</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Reason Field */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Overtime</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a brief reason for the overtime..."
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
