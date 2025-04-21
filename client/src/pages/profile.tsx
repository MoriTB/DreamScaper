import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthProvider";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { DreamWithRelations } from "@shared/schema";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email"),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user, updateUserProfile, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Stats data
  const { data: dreams } = useQuery<DreamWithRelations[]>({
    queryKey: [`/api/users/${user?.id}/dreams`],
    enabled: !!user,
  });
  
  const totalDreams = dreams?.length || 0;
  const favoriteDreams = dreams?.filter(d => d.dream.isFavorite).length || 0;
  const firstDreamDate = dreams && dreams.length > 0 
    ? new Date(dreams.reduce((oldest, dream) => 
        new Date(dream.dream.createdAt) < new Date(oldest.dream.createdAt) ? dream : oldest
      ).dream.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'No dreams yet';
  
  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      if (!user) return;
      
      // Simulated API call to update profile
      // In a real app, you would make an actual API request
      await updateUserProfile({
        ...user,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      // Simulated password update
      // In a real app, you would make an actual API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Failed to update password",
        description: "There was an error updating your password. Please check your current password and try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  if (!user) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatarUrl} alt={user.name || user.username} />
                <AvatarFallback className="text-2xl">{getInitials(user.name || user.username)}</AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-medium">{user.name || user.username}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
              
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="mt-4 w-full"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dream Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Total Dreams</span>
                <span className="font-medium">{totalDreams}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Favorite Dreams</span>
                <span className="font-medium">{favoriteDreams}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">First Dream</span>
                <span className="font-medium">{firstDreamDate}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your profile information and account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="avatarUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avatar URL</FormLabel>
                            <FormControl>
                              <Input placeholder="URL to your avatar image" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                        Update Profile
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="password">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Your current password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a new password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your new password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                        Update Password
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="preferences">
                  <div className="space-y-6">
                    <div>
                      <Label>Notification Preferences</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="email-notif" className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500" />
                          <Label htmlFor="email-notif" className="cursor-pointer">Email Notifications</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="analysis-notif" className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500" />
                          <Label htmlFor="analysis-notif" className="cursor-pointer">Dream Analysis Updates</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="reminder-notif" className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500" />
                          <Label htmlFor="reminder-notif" className="cursor-pointer">Daily Recording Reminders</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="marketing-notif" className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500" />
                          <Label htmlFor="marketing-notif" className="cursor-pointer">Product Updates</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <select 
                        id="language" 
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white dark:bg-neutral-800 dark:border-neutral-700"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      Save Preferences
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
