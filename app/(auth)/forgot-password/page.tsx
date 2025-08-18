// app/(auth)/forgot-password/page.tsx
// This is the frontend component for the "Forgot Password" page.
// Users enter their email here to receive a password reset link.

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Updated import for Sonner
import Link from "next/link";

// --- Validation Schema using Zod ---
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPasswordPage() {

  // --- Form Hook Initialization ---
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const { isSubmitting, isSubmitSuccessful } = form.formState;

  // --- Form Submission Handler ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/password/forgot", values);
      toast.info("Check Your Email", {
        description: response.data.message,
      });
    } catch (error) {
      console.error("Forgot password request failed:", error);
      // Even on error, we show a generic success message to prevent email enumeration
      toast.info("Check Your Email", {
        description: "If an account with that email exists, a password reset link has been sent.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your email and we'll send you a link to reset your password.
            </p>
        </div>
        
        {isSubmitSuccessful ? (
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                    A password reset link has been sent to your email address. Please check your inbox (and spam folder).
                </p>
            </div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="your.email@example.com" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
            </form>
            </Form>
        )}

        <div className="text-center text-sm">
            <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                Return to Login
            </Link>
        </div>
      </div>
    </div>
  );
}
