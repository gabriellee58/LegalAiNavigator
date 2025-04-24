import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useSubscription } from "@/hooks/use-subscription";

export default function SubscriptionSuccessPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { refetch } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get session_id from URL query parameter
  const getSessionId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('session_id');
  };

  useEffect(() => {
    const sessionId = getSessionId();
    
    if (!sessionId) {
      setIsProcessing(false);
      setErrorMessage("No session ID found. Please try again.");
      return;
    }

    // Process the successful subscription
    const processSubscription = async () => {
      try {
        // Call the API to confirm subscription
        await apiRequest("POST", "/api/subscriptions/confirm", { 
          sessionId 
        });
        
        // Update UI
        setIsSuccess(true);
        
        // Show success message
        toast({
          title: "Subscription activated",
          description: "Your subscription has been successfully activated.",
        });
        
        // Refresh subscription data
        refetch();
      } catch (error) {
        console.error("Error confirming subscription:", error);
        setErrorMessage("There was an error processing your subscription. Please contact support.");
        
        toast({
          title: "Subscription error",
          description: "There was an error processing your subscription.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    // Process the subscription
    processSubscription();
    
    // Set page title
    document.title = "Subscription Confirmation | Canadian Legal AI";
    return () => {
      document.title = "Canadian Legal AI";
    };
  }, [toast, refetch]);

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-md mx-auto bg-background rounded-lg shadow-sm border p-8 text-center">
        {isProcessing ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Processing Your Subscription</h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your subscription...
            </p>
          </div>
        ) : isSuccess ? (
          <div className="space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">Subscription Activated!</h1>
            <p className="text-muted-foreground">
              Your subscription has been successfully activated. You now have access to all the
              features and benefits of your plan.
            </p>
            
            <div className="space-y-4 pt-4">
              <Link href="/">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
              <Link href="/subscription-plans">
                <Button variant="outline" className="w-full">Manage Subscription</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <span className="text-2xl text-red-500">!</span>
            </div>
            <h1 className="text-2xl font-bold">Something Went Wrong</h1>
            <p className="text-muted-foreground">
              {errorMessage || "We couldn't process your subscription. Please try again or contact support."}
            </p>
            
            <div className="space-y-4 pt-4">
              <Link href="/subscription-plans">
                <Button className="w-full">Back to Subscription Plans</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">Go to Home</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}