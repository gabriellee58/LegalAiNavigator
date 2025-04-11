import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function LogoutPage() {
  const { logoutMutation } = useAuth();
  const [manualLogout, setManualLogout] = useState(false);
  const [location, navigate] = useLocation();

  // Manual logout handler that bypasses the API
  const handleManualLogout = () => {
    // Force clear any session data on the client side
    window.localStorage.removeItem('user');
    
    // Clear any related cookies that might exist
    document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Mark that we've manually logged out
    setManualLogout(true);
    
    // Force redirect to auth page
    setTimeout(() => {
      navigate('/auth');
    }, 1000);
  };

  useEffect(() => {
    // Trigger logout when component mounts
    logoutMutation.mutate();
    
    // Set a fallback timer - if the logout doesn't complete in 3 seconds,
    // we'll show the manual logout option
    const timeoutId = setTimeout(() => {
      if (!logoutMutation.isSuccess && !logoutMutation.isError) {
        // Mutation is taking too long, encourage manual logout
        setManualLogout(true);
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // If logout completed successfully, redirect to auth page
  if (logoutMutation.isSuccess || manualLogout) {
    return <Redirect to="/auth" />;
  }

  // Show error if logout failed
  if (logoutMutation.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-purple-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Logout Issue</h2>
          <p className="text-red-500 mb-4">
            {logoutMutation.error?.message || "Unexpected token 'O', 'OK' is not valid JSON"}
          </p>
          <p className="text-muted-foreground mb-6">
            The server returned a response that couldn't be processed correctly. This is likely a server-side configuration issue.
          </p>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleManualLogout}
              variant="default"
              className="w-full"
            >
              Force Logout
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while logging out
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-purple-100">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <div className="text-lg font-medium mb-2">Logging out...</div>
      
      {manualLogout && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Logout is taking longer than expected.
          </p>
          <Button 
            onClick={handleManualLogout}
            variant="outline"
          >
            Force Logout
          </Button>
        </div>
      )}
    </div>
  );
}

export default LogoutPage;