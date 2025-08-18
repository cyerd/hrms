// app/(auth)/reset-password/[token]/page.tsx
// This is the final page in the password reset flow. It captures the token
// from the URL and allows the user to set a new password.

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
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
// It includes a 'refine' check to ensure the two password fields match.
const formSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // Show the error on the confirm password field
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = params;

  // --- Form Hook Initialization ---
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting, isSubmitSuccessful } = form.formState;

  // --- Form Submission Handler ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/password/reset", {
        token,
        password: values.password,
      });
      toast.success("Success!", {
        description: "Your password has been reset successfully.",
      });
    } catch (error) {
      console.error("Reset password failed:", error);
      const errorMessage = axios.isAxiosError(error) && error.response ? error.response.data : "Invalid or expired token. Please try again.";
      toast.error("Reset Failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Set New Password</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Please enter your new password below.
            </p>
        </div>

        {isSubmitSuccessful ? (
            <div className="text-center p-4 space-y-4">
                <p className="text-green-700">Your password has been changed successfully!</p>
                <Button asChild>
                    <Link href="/login">Proceed to Login</Link>
                </Button>
            </div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* New Password Field */}
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="******" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                {/* Confirm New Password Field */}
                <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="******" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
            </form>
            </Form>
        )}
      </div>
    </div>
  );
}
