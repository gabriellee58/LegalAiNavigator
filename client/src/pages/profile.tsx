import { useState } from "react";
import { useAuth, UpdateProfileData, UpdatePasswordData } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  preferredLanguage: z.enum(["en", "fr"], {
    required_error: "You need to select a language preference.",
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Current password must be at least 6 characters.",
  }),
  newPassword: z.string().min(8, {
    message: "New password must be at least 8 characters.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function ProfilePage() {
  const { user, updateProfileMutation, updatePasswordMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("account");

  const profileForm = useForm<UpdateProfileData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      preferredLanguage: user?.preferredLanguage || "en",
    },
  });

  const passwordForm = useForm<UpdatePasswordData & { confirmPassword: string }>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onProfileSubmit(data: UpdateProfileData) {
    updateProfileMutation.mutate(data);
  }

  function onPasswordSubmit(data: UpdatePasswordData & { confirmPassword: string }) {
    const { confirmPassword, ...passwordData } = data;
    updatePasswordMutation.mutate(passwordData);
    passwordForm.reset();
  }

  if (!user) {
    return (
      <Container className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 overflow-hidden border-2 border-primary/30 mr-4 flex items-center justify-center text-primary font-bold text-2xl">
            {user.fullName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.fullName || user.username}</h1>
            <p className="text-muted-foreground">{user.username}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account information, profile image and settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is your public display name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="preferredLanguage"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Language Preference</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="en" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  English
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="fr" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  French
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="password" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a secure password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
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
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 8 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Password
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Manage your notification settings and app preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications" className="font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email notifications for important updates.
                        </p>
                      </div>
                      <Input
                        id="email-notifications"
                        type="checkbox"
                        className="h-4 w-4"
                        defaultChecked
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="document-updates" className="font-medium">
                          Document Updates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when your documents require attention.
                        </p>
                      </div>
                      <Input
                        id="document-updates"
                        type="checkbox"
                        className="h-4 w-4"
                        defaultChecked
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Privacy Settings</h3>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="data-collection" className="font-medium">
                          Data Collection
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow us to collect usage data to improve the service.
                        </p>
                      </div>
                      <Input
                        id="data-collection"
                        type="checkbox"
                        className="h-4 w-4"
                        defaultChecked
                      />
                    </div>
                  </div>
                </div>
                
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}

export default ProfilePage;