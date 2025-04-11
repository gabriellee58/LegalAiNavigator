import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { Separator } from "@/components/ui/separator";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration form schema
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, isLoading, loginMutation, registerMutation, googleSignInMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);

  // Handle Google OAuth redirect
  useEffect(() => {
    const handleRedirect = async () => {
      if (window.location.hash.includes('access_token')) {
        try {
          // Clear any previous errors
          setAuthError(null);
          
          // Import handleGoogleRedirect dynamically to avoid circular dependencies
          const { handleGoogleRedirect } = await import('@/lib/firebase');
          const googleUser = await handleGoogleRedirect();
          
          if (googleUser) {
            // Successful redirect - we should now be logged in
            navigate("/");
          }
        } catch (error) {
          console.error("Error handling Google redirect:", error);
          setAuthError("Failed to complete Google sign-in. Please try again.");
        }
      }
    };
    
    handleRedirect();
  }, [navigate]);

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      preferredLanguage: "en",
    },
  });

  // Handle login form submission
  async function onLoginSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  // Handle registration form submission
  async function onRegisterSubmit(values: RegisterFormValues) {
    // Remove confirmPassword as it's not part of the API schema
    const { confirmPassword, ...registrationData } = values;
    registerMutation.mutate(registrationData);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === "login" ? t("Login") : t("Create an Account")}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? t("Access your legal assistant account") 
                : t("Join LegalAI to access AI-powered legal tools")}
            </CardDescription>
            
            {/* Display auth errors from login/register mutations */}
            {(loginMutation.isError || registerMutation.isError || authError) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {loginMutation.isError && (
                  <p>{loginMutation.error?.message || "Login failed. Please check your credentials."}</p>
                )}
                {registerMutation.isError && (
                  <p>{registerMutation.error?.message || "Registration failed. Please try again."}</p>
                )}
                {authError && (
                  <p>{authError}</p>
                )}
              </div>
            )}
            
            {/* Display warning about Google sign-in if that failed */}
            {window.location.hash.includes('error=') && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-600 text-sm">
                <p className="font-medium">Google Sign-in Issue</p>
                <p>Google sign-in is currently unavailable. Please use email and password instead.</p>
              </div>
            )}
          </CardHeader>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">{t("Login")}</TabsTrigger>
              <TabsTrigger value="register">{t("Register")}</TabsTrigger>
            </TabsList>
            <CardContent className="pt-6">
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Username")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("Enter your username")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Password")}</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder={t("Enter your password")} 
                              {...field} 
                            />
                          </FormControl>
                          <div className="flex justify-between mt-1">
                            <FormMessage />
                            <Link 
                              href="/password-reset" 
                              className="text-xs text-primary hover:underline"
                            >
                              {t("Forgot password?")}
                            </Link>
                          </div>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("Logging in...")}
                        </>
                      ) : (
                        t("Login")
                      )}
                    </Button>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          {t("Or continue with")}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => googleSignInMutation.mutate()}
                      disabled={googleSignInMutation.isPending}
                    >
                      {googleSignInMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                      )}
                      {googleSignInMutation.isPending 
                        ? t("Signing in with Google...") 
                        : t("Sign in with Google")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Username")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("Choose a username")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Full Name")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t("Enter your full name")} 
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("This helps us personalize your experience")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Password")}</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder={t("Create a password")} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Confirm Password")}</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder={t("Confirm your password")} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="preferredLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("Preferred Language")}</FormLabel>
                          <FormControl>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value || "en"}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            >
                              <option value="en">English</option>
                              <option value="fr">Français</option>
                            </select>
                          </FormControl>
                          <FormDescription>
                            {t("Content will be provided in your preferred language when available")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("Creating account...")}
                        </>
                      ) : (
                        t("Create Account")
                      )}
                    </Button>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          {t("Or continue with")}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => googleSignInMutation.mutate()}
                      disabled={googleSignInMutation.isPending}
                    >
                      {googleSignInMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                      )}
                      {googleSignInMutation.isPending 
                        ? t("Signing in with Google...") 
                        : t("Sign in with Google")}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </CardContent>
          </Tabs>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              {activeTab === "login" 
                ? t("Don't have an account? Switch to Register") 
                : t("Already have an account? Switch to Login")}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="flex flex-col justify-center px-12 py-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="block">LegalAI</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                {t("Your AI-Powered Legal Assistant")}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              {t("Access expert legal assistance with our AI-powered tools. Generate legal documents, get answers to legal questions, and perform legal research in seconds.")}
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>{t("Generate legal documents in minutes")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>{t("Get instant answers to legal questions")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>{t("Perform legal research with AI assistance")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>{t("Bilingual support in English and French")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}