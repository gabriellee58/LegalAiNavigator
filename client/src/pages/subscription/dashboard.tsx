import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Calendar, CreditCard, Download, HelpCircle, Users, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { differenceInDays } from "date-fns";

interface UsageMetric {
  name: string;
  used: number;
  limit: number;
  unit: string;
  icon: React.ReactNode;
}

export default function SubscriptionDashboardPage() {
  const { user } = useAuth();
  const { 
    subscription, 
    currentPlan, 
    isLoading, 
    isTrialActive, 
    isSubscriptionActive,
    trialDaysRemaining,
    goToBillingPortal,
    cancelSubscription,
    reactivateSubscription
  } = useSubscription();
  
  const [usageMetrics, setUsageMetrics] = useState<UsageMetric[]>([]);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  
  // Load usage metrics when component mounts
  useEffect(() => {
    if (isSubscriptionActive && currentPlan) {
      fetchUsageMetrics();
    }
  }, [isSubscriptionActive, currentPlan]);
  
  const fetchUsageMetrics = async () => {
    setIsLoadingUsage(true);
    try {
      // This would be replaced with an actual API call in production
      // For now, we'll use some mock data
      setTimeout(() => {
        setUsageMetrics([
          {
            name: "Document Generations",
            used: 12,
            limit: currentPlan?.features.find(f => f.name.includes("Generate"))?.limit?.split(" ")[0] 
              ? parseInt(currentPlan.features.find(f => f.name.includes("Generate"))?.limit?.split(" ")[0] || "50") 
              : 50,
            unit: "documents",
            icon: <Download className="h-5 w-5 text-muted-foreground" />
          },
          {
            name: "Contract Analyses",
            used: 3,
            limit: currentPlan?.features.find(f => f.name.includes("Analyze"))?.limit?.split(" ")[0]
              ? parseInt(currentPlan.features.find(f => f.name.includes("Analyze"))?.limit?.split(" ")[0] || "20")
              : 20,
            unit: "analyses",
            icon: <BarChart className="h-5 w-5 text-muted-foreground" />
          },
          {
            name: "Research Queries",
            used: 8,
            limit: currentPlan?.features.find(f => f.name.includes("Research"))?.limit?.split(" ")[0]
              ? parseInt(currentPlan.features.find(f => f.name.includes("Research"))?.limit?.split(" ")[0] || "100")
              : 100,
            unit: "queries",
            icon: <HelpCircle className="h-5 w-5 text-muted-foreground" />
          }
        ]);
        setIsLoadingUsage(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching usage metrics:", error);
      setIsLoadingUsage(false);
    }
  };
  
  // Handle billing portal navigation
  const handleBillingPortal = async () => {
    try {
      await goToBillingPortal();
    } catch (error) {
      console.error("Error navigating to billing portal:", error);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
    } catch (error) {
      console.error("Error canceling subscription:", error);
    }
  };
  
  // Handle subscription reactivation
  const handleReactivateSubscription = async () => {
    try {
      await reactivateSubscription();
    } catch (error) {
      console.error("Error reactivating subscription:", error);
    }
  };
  
  // Format billing period dates
  const formatDate = (date: Date | null | string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  // Calculate days remaining in billing period
  const getDaysRemaining = () => {
    if (!subscription?.currentPeriodEnd) return null;
    
    const endDate = new Date(subscription.currentPeriodEnd);
    const now = new Date();
    return Math.max(0, differenceInDays(endDate, now));
  };
  
  const daysRemaining = getDaysRemaining();
  
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subscription Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your subscription and monitor your usage.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : !subscription ? (
          <Card>
            <CardHeader>
              <CardTitle>No Active Subscription</CardTitle>
              <CardDescription>
                You don't have an active subscription. Choose a plan to get started.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/subscription-plans">
                <Button>View Subscription Plans</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Your Plan: {currentPlan?.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {currentPlan?.description}
                      </CardDescription>
                    </div>
                    <Badge variant={subscription.status === "active" ? "default" : 
                           subscription.status === "trial" ? "secondary" : 
                           subscription.status === "canceled" ? "destructive" : 
                           "outline"}>
                      {subscription.status === "active" ? "Active" : 
                       subscription.status === "trial" ? "Trial" : 
                       subscription.status === "canceled" ? "Canceled" : 
                       subscription.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid gap-4">
                    {isTrialActive && (
                      <div className="bg-muted p-3 rounded-md flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Trial Period</p>
                          <p className="text-sm text-muted-foreground">
                            {trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""} remaining in your trial
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-muted p-3 rounded-md flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Billing Period</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(subscription.currentPeriodStart)} to {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>
                    
                    {daysRemaining !== null && !isTrialActive && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current period: {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining</span>
                          <span>{Math.round((daysRemaining / 30) * 100)}%</span>
                        </div>
                        <Progress value={Math.round((daysRemaining / 30) * 100)} />
                      </div>
                    )}
                    
                    {/* Feature highlights */}
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-2">Plan Features:</p>
                      <ul className="space-y-1">
                        {currentPlan?.features.slice(0, 5).map((feature, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-sm">{feature.name} {feature.limit && <span className="text-muted-foreground">({feature.limit})</span>}</span>
                          </li>
                        ))}
                        {currentPlan && currentPlan.features.length > 5 && (
                          <li className="text-sm text-muted-foreground">+ {currentPlan.features.length - 5} more features</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Link href="/subscription-plans" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">Change Plan</Button>
                  </Link>
                  
                  {subscription.status === "active" && (
                    <Button variant="outline" className="w-full sm:w-auto" onClick={handleBillingPortal}>
                      Manage Billing
                    </Button>
                  )}
                  
                  {subscription.status === "active" && (
                    <Button 
                      variant="destructive" 
                      className="w-full sm:w-auto"
                      onClick={handleCancelSubscription}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                  
                  {subscription.status === "canceled" && (
                    <Button 
                      variant="default" 
                      className="w-full sm:w-auto"
                      onClick={handleReactivateSubscription}
                    >
                      Reactivate Subscription
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Usage Tab */}
            <TabsContent value="usage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                  <CardDescription>
                    Monitor your resource usage for the current billing period.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUsage ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {usageMetrics.map((metric, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {metric.icon}
                              <span className="text-sm font-medium">{metric.name}</span>
                            </div>
                            <span className="text-sm">
                              {metric.used} / {metric.limit} {metric.unit}
                            </span>
                          </div>
                          <Progress value={(metric.used / metric.limit) * 100} />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={fetchUsageMetrics} disabled={isLoadingUsage}>
                    Refresh Usage Data
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    View and manage your billing details and payment history.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Subscription ID</span>
                      <span className="text-sm text-muted-foreground">{subscription.stripeSubscriptionId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Current Plan</span>
                      <span className="text-sm">{currentPlan?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Price</span>
                      <span className="text-sm">${currentPlan?.price}/month</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Billing Period</span>
                      <span className="text-sm">
                        {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium">Status</span>
                      <Badge variant={subscription.status === "active" ? "default" : 
                          subscription.status === "trial" ? "secondary" : 
                          subscription.status === "canceled" ? "destructive" : 
                          "outline"}>
                        {subscription.status === "active" ? "Active" : 
                          subscription.status === "trial" ? "Trial" : 
                          subscription.status === "canceled" ? "Canceled" : 
                          subscription.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">Next Billing Date</span>
                      <span className="text-sm">
                        {subscription.status === "canceled" ? "Not applicable" : formatDate(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Button className="w-full sm:w-auto" onClick={handleBillingPortal}>
                    Manage Payment Methods
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto" onClick={handleBillingPortal}>
                    View Invoices
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}