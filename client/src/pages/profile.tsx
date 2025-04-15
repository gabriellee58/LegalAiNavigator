import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Save, User, KeyRound, Languages } from 'lucide-react';
import { withBreadcrumbs } from '@/components/ui/breadcrumb';

// Define form schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Full name must be at least 2 characters.',
  }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .optional()
    .or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  preferredLanguage: z.enum(['en', 'fr'])
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Basic role information without the permissions system
  const userRole = user?.role || 'user';
  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator';
  
  // Set default form values
  const defaultValues: Partial<ProfileFormValues> = {
    fullName: user?.fullName || '',
    password: '',
    confirmPassword: '',
    preferredLanguage: user?.preferredLanguage as 'en' | 'fr' || 'en',
  };
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Omit confirmPassword from the data sent to the server
      const { confirmPassword, ...updateData } = data;
      
      // If password is empty, omit it from the request
      if (!updateData.password) {
        const { password, ...dataWithoutPassword } = updateData;
        return apiRequest('PUT', '/api/user/profile', dataWithoutPassword);
      }
      
      return apiRequest('PUT', '/api/user/profile', updateData);
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      
      // Invalidate user query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Reset password fields
      form.setValue('password', '');
      form.setValue('confirmPassword', '');
    },
    onError: (error) => {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  const getRoleBadge = () => {
    if (isAdmin) {
      return <Badge className="bg-red-500 hover:bg-red-600">Administrator</Badge>;
    } else if (isModerator) {
      return <Badge className="bg-amber-500 hover:bg-amber-600">Moderator</Badge>;
    } else {
      return <Badge>User</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email/Username</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user?.username}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                <div>{getRoleBadge()}</div>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Your full name" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Preferred Language */}
                <FormField
                  control={form.control}
                  name="preferredLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Language</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="relative">
                            <Languages className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This will change the language of the interface
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="Leave blank to keep current password" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter a new password or leave blank to keep your current password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="Confirm your new password" 
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Submit */}
                <div className="mt-6">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <AlertCircle className="mr-2 h-4 w-4" />
              For security reasons, certain changes may require verification
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default withBreadcrumbs(ProfilePage, [
  { href: '/', label: 'Home' },
  { href: '/profile', label: 'Profile' }
]);