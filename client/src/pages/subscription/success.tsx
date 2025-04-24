import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useSubscription } from "@/hooks/use-subscription";

export default function SubscriptionSuccessPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { refetch } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadyActive, setIsAlreadyActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get session_id from URL query parameter
  const getSessionId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('session_id');
  };
  
  // Get redirect origin from session storage if available
  const getRedirectOrigin = () => {
    try {
      return sessionStorage.getItem('redirectOrigin') || null;
    } catch (e) {
      console.warn("Could not access session storage:", e);
      return null;
    }
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
        const response = await apiRequest("POST", "/api/subscriptions/confirm", { 
          sessionId 
        });
        
        let responseData;
        if (response && typeof response === 'object') {
          // If response is already parsed JSON
          responseData = response;
        } else if (response instanceof Response) {
          // If it's a Response object, parse it
          responseData = await response.json();
        }
        
        // Check for already active status
        const status = responseData?.status || '';
        const message = responseData?.message || '';
        
        if (status === 'already_active') {
          console.log('Subscription is already active');
          // Track already active status separately
          setIsSuccess(true);
          setIsAlreadyActive(true);
          
          toast({
            title: "Subscription Active",
            description: "Your subscription is already active. You can continue using your plan.",
          });
        } else {
          // Regular success flow
          setIsSuccess(true);
          setIsAlreadyActive(false);
          
          toast({
            title: "Subscription Activated",
            description: "Your subscription has been successfully activated.",
          });
        }
        
        // Refresh subscription data
        refetch();
      } catch (error) {
        console.error("Error confirming subscription:", error);
        setErrorMessage("There was an error processing your subscription. Please contact support.");
        
        toast({
          title: "Subscription Error",
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
            {isAlreadyActive ? (
              <>
                <InfoIcon className="h-16 w-16 text-blue-500 mx-auto" />
                <h1 className="text-2xl font-bold">Subscription Already Active</h1>
                <p className="text-muted-foreground">
                  Your subscription is already active. There's no need to resubscribe at this time.
                  You can continue enjoying all the features and benefits of your current plan.
                </p>
              </>
            ) : (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h1 className="text-2xl font-bold">Subscription Activated!</h1>
                <p className="text-muted-foreground">
                  Your subscription has been successfully activated. You now have access to all the
                  features and benefits of your plan.
                </p>
              </>
            )}
            
            <div className="space-y-4 pt-4">
              {/* Use redirect origin if available, otherwise go to dashboard */}
              <Button 
                className="w-full"
                onClick={() => {
                  const redirectUrl = getRedirectOrigin();
                  if (redirectUrl) {
                    try {
                      // Clear redirect origin from session storage
                      sessionStorage.removeItem('redirectOrigin');
                      
                      // Try to navigate back to redirect origin
                      window.location.href = redirectUrl;
                    } catch (e) {
                      console.error("Error redirecting to origin:", e);
                      // Fallback to dashboard
                      window.location.href = "/";
                    }
                  } else {
                    // No redirect origin, go to dashboard
                    window.location.href = "/";
                  }
                }}
              >
                Continue
              </Button>
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