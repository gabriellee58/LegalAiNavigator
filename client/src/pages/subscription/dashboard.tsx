import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/use-translation";

export default function SubscriptionDashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { subscription, isLoading } = useSubscription();
  const { toast } = useToast();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Calculate days left in trial if applicable
  const daysLeftInTrial = subscription?.trialEnd ? 
    Math.max(0, Math.ceil((new Date(subscription.trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
  
  // Calculate days left in billing period
  const daysLeftInPeriod = subscription?.currentPeriodEnd ? 
    Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  // Calculate total days in period
  const totalDaysInPeriod = subscription?.currentPeriodStart && subscription?.currentPeriodEnd ? 
    Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - new Date(subscription.currentPeriodStart).getTime()) / (1000 * 60 * 60 * 24)) : 30;
  
  // Calculate percentage of period elapsed
  const periodPercentage = Math.max(0, Math.min(100, 100 - (daysLeftInPeriod / totalDaysInPeriod * 100)));

  async function handleCancelSubscription() {
    if (!subscription) return;
    
    setCancelLoading(true);
    try {
      const res = await apiRequest("POST", "/api/subscriptions/cancel", { 
        subscriptionId: subscription.stripeSubscriptionId 
      });
      
      if (res.ok) {
        toast({
          title: t("Subscription canceled"),
          description: t("Your subscription will end at the end of the current billing period."),
        });
      } else {
        const error = await res.json();
        throw new Error(error.message || "Failed to cancel subscription");
      }
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("An error occurred while canceling your subscription."),
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleUpgradeSubscription(planId: string) {
    setUpgradeLoading(true);
    try {
      const res = await apiRequest("POST", "/api/subscriptions/upgrade", { planId });
      
      if (res.ok) {
        const data = await res.json();
        
        // Store the return URL in session storage before redirecting
        sessionStorage.setItem('subscription_return_url', window.location.href);
        
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        const error = await res.json();
        throw new Error(error.message || "Failed to upgrade subscription");
      }
    } catch (error: any) {
      toast({
        title: t("Error"),
        description: error.message || t("An error occurred while upgrading your subscription."),
        variant: "destructive",
      });
    } finally {
      setUpgradeLoading(false);
    }
  }

  // Helper function to render subscription status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> {t("Active")}</Badge>;
      case "trialing":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> {t("Trial")}</Badge>;
      case "canceled":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> {t("Canceled")}</Badge>;
      case "past_due":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> {t("Past Due")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container max-w-5xl py-8">
        <h1 className="text-3xl font-bold mb-6">{t("Subscription Dashboard")}</h1>
        <Card>
          <CardHeader>
            <CardTitle>{t("No Active Subscription")}</CardTitle>
            <CardDescription>{t("You currently don't have an active subscription.")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t("Upgrade to a premium plan to access all features of the platform.")}
            </p>
            <Button 
              onClick={() => window.location.href = '/subscription-plans'}
              variant="default"
            >
              {t("View Subscription Plans")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-6">{t("Subscription Dashboard")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t("Plan")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{subscription.planId}</div>
            <div className="text-sm text-muted-foreground">{t("Subscription Type")}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t("Status")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl mb-1">
              {renderStatusBadge(subscription.status)}
            </div>
            <div className="text-sm text-muted-foreground">
              {subscription.status === "canceled" ? 
                t("Access until") + ": " + (subscription.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), "MMMM dd, yyyy") : "N/A") :
                t("Next billing date") + ": " + (subscription.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), "MMMM dd, yyyy") : "N/A")}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t("Billing Period")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={periodPercentage} className="h-2" />
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>{t("Started")}: {subscription.currentPeriodStart ? format(new Date(subscription.currentPeriodStart), "MMM dd") : "N/A"}</span>
                <span>{t("Ends")}: {subscription.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), "MMM dd") : "N/A"}</span>
              </div>
              <div className="text-sm font-medium">
                {daysLeftInPeriod} {t("days remaining")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {subscription.status === "trialing" && (
        <Alert className="mb-8 bg-amber-50 border-amber-200">
          <Clock className="h-4 w-4" />
          <AlertTitle>{t("Trial Period")}</AlertTitle>
          <AlertDescription>
            {t("You are currently in a trial period. Your trial will end in")} {daysLeftInTrial} {t("days")}. 
            {t("You will be charged after the trial ends unless you cancel.")}
          </AlertDescription>
        </Alert>
      )}
      
      {subscription.status === "canceled" && (
        <Alert className="mb-8 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("Subscription Canceled")}</AlertTitle>
          <AlertDescription>
            {t("Your subscription has been canceled but you still have access until")} {subscription.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), "MMMM dd, yyyy") : "N/A"}.
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("Subscription Details")}</CardTitle>
          <CardDescription>
            {t("Manage your current subscription and billing information")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{t("Plan")}</TableCell>
                <TableCell className="capitalize">{subscription.planId}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Status")}</TableCell>
                <TableCell>{renderStatusBadge(subscription.status)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Current Period")}</TableCell>
                <TableCell>
                  {subscription.currentPeriodStart ? format(new Date(subscription.currentPeriodStart), "MMMM dd, yyyy") : "N/A"} - {subscription.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), "MMMM dd, yyyy") : "N/A"}
                </TableCell>
              </TableRow>
              {subscription.trialStart && subscription.trialEnd && (
                <TableRow>
                  <TableCell className="font-medium">{t("Trial Period")}</TableCell>
                  <TableCell>
                    {subscription.trialStart ? format(new Date(subscription.trialStart), "MMMM dd, yyyy") : "N/A"} - {subscription.trialEnd ? format(new Date(subscription.trialEnd), "MMMM dd, yyyy") : "N/A"}
                    {subscription.trialEnd && new Date() < new Date(subscription.trialEnd) && (
                      <span className="ml-2">({daysLeftInTrial} {t("days left")})</span>
                    )}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-medium">{t("Customer ID")}</TableCell>
                <TableCell className="font-mono text-sm">{subscription.stripeCustomerId}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Subscription ID")}</TableCell>
                <TableCell className="font-mono text-sm">{subscription.stripeSubscriptionId}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0 border-t p-6">
          {subscription.status !== "canceled" && (
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
            >
              {cancelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Cancel Subscription")}
            </Button>
          )}
          
          {subscription.status === "canceled" && (
            <Button 
              variant="default" 
              onClick={() => window.location.href = '/subscription-plans'}
            >
              {t("Resubscribe")}
            </Button>
          )}
          
          {subscription.planId === "basic" && subscription.status !== "canceled" && (
            <Button 
              variant="outline" 
              onClick={() => handleUpgradeSubscription("professional")}
              disabled={upgradeLoading}
              className="ml-auto"
            >
              {upgradeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("Upgrade to Professional")}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("Need Help?")}</CardTitle>
          <CardDescription>
            {t("Contact support for any billing or subscription issues")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("If you have any questions about your subscription or need assistance with billing issues, please don't hesitate to contact our support team.")}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full sm:w-auto">
            {t("Contact Support")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}