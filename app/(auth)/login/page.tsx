// app/(auth)/login/page.tsx
// This is the frontend component for the user login page.
// It uses NextAuth for authentication, React Hook Form for management, and Zod for validation.

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Updated import for Sonner
import Link from "next/link";

// --- Validation Schema using Zod ---
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();

  // --- Form Hook Initialization ---
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  // --- Form Submission Handler ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const result = await signIn("credentials", {
        ...values,
        redirect: false, // We handle the redirect manually
      });

      if (result?.error) {
        // Handle authentication errors
        toast.error("Login Failed", {
          description: result.error,
        });
      } else if (result?.ok) {
        // On successful login, redirect to the dashboard
        toast.success("Login Successful", {
          description: "Welcome back!",
        });
        router.push("/"); // Redirect to the main dashboard page
        router.refresh(); // Ensure the session is updated across the app
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("An Error Occurred", {
        description: "An unexpected error occurred during login.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back! Please enter your details.
            </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@avopro.com" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                    Forgot Password?
                </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
             <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                    Register
                </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
