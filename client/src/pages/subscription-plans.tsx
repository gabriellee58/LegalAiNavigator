import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { SUBSCRIPTION_PLANS, SubscriptionPlanDefinition } from "@/data/subscription-plans";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

export default function SubscriptionPlansPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const {
    subscription,
    currentPlan,
    isLoading,
    isTrialActive,
    trialDaysRemaining,
    createSubscription,
    updateSubscription,
    cancelSubscription,
  } = useSubscription();
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDefinition | null>(null);

  const handleStartPlan = async (plan: SubscriptionPlanDefinition) => {
    try {
      // Check if user has any existing subscription first
      if (subscription) {
        // Determine the message based on status
        let title = "Subscription Already Exists";
        let description = "You already have a subscription. ";
        
        if (subscription.status === 'active') {
          description += "Please use the dashboard to manage your subscription.";
        } else if (subscription.status === 'trial') {
          description += "You are currently in a trial period. Please wait until your trial ends or cancel it before starting a new subscription.";
        } else if (subscription.status === 'canceled') {
          description += "Please reactivate your canceled subscription from the dashboard instead of creating a new one.";
        } else {
          description += "Please manage your existing subscription from the dashboard.";
        }
        
        toast({
          title,
          description,
          variant: "destructive",
        });
        return;
      }
      
      // Start subscription or trial
      console.log("Starting subscription for plan:", plan.id);
      await createSubscription(plan.id);
      
      // Note: Success toast is shown by the mutation's onSuccess callback
      // This toast will only show if the API doesn't return a redirect URL
    } catch (error: any) {
      console.error("Error starting subscription:", error);
      
      // Handle specific error cases
      if (error.message && error.message.includes("already has an active subscription")) {
        toast({
          title: "Subscription Already Active",
          description: "You already have an active subscription. Please use the dashboard to manage your current plan instead.",
          variant: "destructive",
        });
      } else if (error.message && error.message.includes("must be logged in")) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to create a subscription. Please sign in or create an account.",
          variant: "destructive",
        });
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
      } else {
        toast({
          title: "Subscription Error",
          description: error.message || "There was an error activating your subscription. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleChangePlan = async (plan: SubscriptionPlanDefinition) => {
    try {
      // Don't allow changing plans if the current subscription is active
      if (subscription?.status === 'active') {
        toast({
          title: "Cannot Change Plan",
          description: "You already have an active subscription. Please use the dashboard to manage your subscription.",
          variant: "destructive"
        });
        return;
      }
      
      // Update subscription to new plan
      await updateSubscription(plan.id);
      
      toast({
        title: "Plan updated",
        description: `Your subscription has been changed to ${plan.name}.`,
      });
    } catch (error: any) {
      console.error("Error changing subscription:", error);
      
      toast({
        title: "Failed to Change Plan",
        description: error.message || "An error occurred while changing your plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelSubscription = async () => {
    try {
      // Cancel subscription
      await cancelSubscription();
      
      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled. You will have access until the end of your billing period.",
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
    }
  };

  // Helper to determine button text based on subscription state
  const getButtonText = (plan: SubscriptionPlanDefinition) => {
    if (!subscription) {
      return `Start ${plan.trialDays}-Day Free Trial`;
    }

    if (subscription && currentPlan && currentPlan.id === plan.id) {
      return "Current Plan";
    }

    return "Switch to This Plan";
  };
  
  // Helper function to determine if a plan button should be disabled
  const isPlanButtonDisabled = (plan: SubscriptionPlanDefinition): boolean => {
    // Disable while loading
    if (isLoading === true) {
      return true;
    }
    
    // Disable if the user has any active subscription
    if (subscription !== null && subscription.status === 'active') {
      return true;
    }
    
    // Disable if it's the user's current plan (even if not active)
    if (subscription !== null && currentPlan !== null && currentPlan.id === plan.id) {
      return true;
    }
    
    // Not disabled by default
    return false;
  };

  // Set page title when component mounts
  useEffect(() => {
    document.title = "Subscription Plans | Canadian Legal AI";
    return () => {
      document.title = "Canadian Legal AI";
    };
  }, []);

  return (
    <div className="container mx-auto py-8">
      
      {/* Alert banner for users with active subscriptions */}
      {subscription && subscription.status === 'active' && (
        <Alert className="max-w-4xl mx-auto mb-8 bg-primary/10 border-primary/20">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle>{t("Active Subscription Detected")}</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{t("You already have an active")} <span className="font-semibold">{currentPlan?.name}</span> {t("subscription")}</p>
            <p>{t("New subscriptions cannot be created while you have an active plan.")}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="self-start mt-2"
              onClick={() => window.location.href = '/subscription/dashboard'}
            >
              {t("Manage Your Subscription")}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{t("Subscription Plans")}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("Choose the right plan for your legal needs. All plans include a free trial period.")}
          </p>
          
          {subscription && (
            <div className="mt-4 p-4 bg-muted rounded-lg max-w-lg mx-auto">
              <h2 className="font-semibold text-lg">{t("Your Subscription")}</h2>
              {isTrialActive ? (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm">
                    {t("Trial period")}: <span className="font-medium">{trialDaysRemaining} {t("days remaining")}</span>
                  </p>
                </div>
              ) : (
                <p className="text-sm mt-2">
                  {t("You are currently on the")} <span className="font-semibold">{currentPlan?.name}</span> {t("plan")}.
                </p>
              )}
              
              <div className="mt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/subscription/dashboard'}
                >
                  {t("View Dashboard")}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">{t("Cancel Subscription")}</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("Cancel your subscription?")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("You will lose access to premium features at the end of your current billing cycle. This action cannot be undone.")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("Keep Subscription")}</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCancelSubscription}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t("Confirm Cancellation")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card 
              key={plan.id}
              className={`flex flex-col ${plan.isPopular ? 'border-primary shadow-md relative' : ''}`}
            >
              {plan.isPopular && (
                <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {plan.trialDays}-day free trial
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className={feature.included ? "" : "text-muted-foreground"}>
                          {feature.name}
                        </span>
                        {feature.limit && (
                          <span className="text-sm text-muted-foreground block">
                            {feature.limit}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-4">
                <Button
                  className="w-full"
                  variant={plan.isPopular ? "default" : "outline"}
                  disabled={isPlanButtonDisabled(plan)}
                  onClick={() => {
                    if (!subscription) {
                      handleStartPlan(plan);
                    } else {
                      handleChangePlan(plan);
                    }
                  }}
                >
                  {getButtonText(plan)}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="max-w-3xl mx-auto bg-muted p-6 rounded-lg mt-12">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">How does the free trial work?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                All plans include a 7-day free trial. You get full access to all plan features
                during your trial period with no credit card required. We'll send you a reminder
                before your trial ends.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Can I cancel my subscription anytime?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Yes, you can cancel your subscription at any time. You'll continue to have access
                to your plan features until the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Can I change plans?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately,
                while downgrades will take effect at the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Are there any long-term commitments?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                No, all plans are billed monthly and you can cancel anytime. We don't require any
                long-term commitments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}