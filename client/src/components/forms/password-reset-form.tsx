import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const requestResetSchema = z.object({
  username: z.string().email({ message: "Please enter a valid email address" }),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RequestResetFormValues = z.infer<typeof requestResetSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function PasswordResetRequestForm() {
  const { toast } = useToast();
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  const form = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      username: "",
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: async (values: RequestResetFormValues) => {
      const response = await apiRequest(
        "POST", 
        "/api/user/request-password-reset", 
        values
      );
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reset request submitted",
        description: "If an account exists with that email, you will receive a reset token.",
      });
      
      // In a development environment, we'll directly show the token for testing
      if (data.token) {
        setResetToken(data.token);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process reset request. Please try again.",
        variant: "destructive",
      });
      console.error("Password reset request error:", error);
    },
  });

  function onSubmit(values: RequestResetFormValues) {
    requestResetMutation.mutate(values);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a password reset token.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={requestResetMutation.isPending}
            >
              {requestResetMutation.isPending ? "Sending..." : "Request Reset"}
            </Button>
          </form>
        </Form>

        {resetToken && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm font-medium text-yellow-800">
              For development purposes only:
            </p>
            <code className="block mt-1 text-xs bg-white p-2 rounded overflow-x-auto">
              {resetToken}
            </code>
            <p className="text-xs mt-2 text-yellow-700">
              In production, this token would be sent via email.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PasswordResetForm() {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (values: ResetPasswordFormValues) => {
      const { confirmPassword, ...data } = values; // Remove confirmPassword before sending
      const response = await apiRequest("POST", "/api/user/reset-password", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your password has been reset successfully. You can now log in with your new password.",
      });
      setSuccess(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reset password. The token may be invalid or expired.",
        variant: "destructive",
      });
      console.error("Password reset error:", error);
    },
  });

  function onSubmit(values: ResetPasswordFormValues) {
    resetPasswordMutation.mutate(values);
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Password Reset Successful</CardTitle>
          <CardDescription>
            Your password has been reset successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You can now log in with your new password.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => window.location.href = "/auth"}>
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Enter your reset token and new password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset Token</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your reset token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="New password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}