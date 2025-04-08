import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

function LogoutPage() {
  const { logoutMutation } = useAuth();

  useEffect(() => {
    // Trigger logout when component mounts
    logoutMutation.mutate();
  }, []);

  // If logout completed successfully, redirect to auth page
  if (logoutMutation.isSuccess) {
    return <Redirect to="/auth" />;
  }

  // Show error if logout failed
  if (logoutMutation.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">Logout failed: {logoutMutation.error?.message}</div>
        <a 
          href="/" 
          className="text-primary hover:underline"
        >
          Return to Home
        </a>
      </div>
    );
  }

  // Show loading while logging out
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <div>Logging out...</div>
    </div>
  );
}

export default LogoutPage;