// app/(dashboard)/profile/page.tsx
// This is the user's profile page, where they can view their details,
// see their leave balances, and update their bio.

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // Updated import for Sonner
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

// Define the User Profile type
type UserProfile = {
  name: string | null;
  email: string;
  bio: string | null;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  maternityLeaveBalance: number;
  paternityLeaveBalance: number;
  compassionateLeaveBalance: number;
};

// --- Validation Schema for the bio form ---
const formSchema = z.object({
  bio: z.string().max(200, "Bio cannot exceed 200 characters.").optional(),
});

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // --- Fetch user profile on component mount ---
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/profile");
        setProfile(response.data);
        form.reset({ bio: response.data.bio || "" }); // Populate form with fetched bio
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Error", { description: "Could not load profile data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // --- Form Submission Handler ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch("/api/profile", values);
      toast.success("Success", { description: "Your profile has been updated." });
      // Optionally update the session if the name/bio is part of it
      update({ bio: values.bio });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Error", { description: "Failed to update profile." });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!profile) {
    return <div className="text-center">Could not load profile.</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="text-2xl">{profile.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a little about yourself..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave Balances</CardTitle>
          <CardDescription>Your remaining leave days for the year.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-2xl font-bold">{profile.annualLeaveBalance}</p>
            <p className="text-sm text-gray-500">Annual Leave</p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-2xl font-bold">{profile.sickLeaveBalance}</p>
            <p className="text-sm text-gray-500">Sick Leave</p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-2xl font-bold">{profile.paternityLeaveBalance}</p>
            <p className="text-sm text-gray-500">Paternity Leave</p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-2xl font-bold">{profile.maternityLeaveBalance}</p>
            <p className="text-sm text-gray-500">Maternity Leave</p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-2xl font-bold">{profile.compassionateLeaveBalance}</p>
            <p className="text-sm text-gray-500">Compassionate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
