import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const [currentTab, setCurrentTab] = useState("profile");
  const { toast } = useToast();
  const { user, updateProfileMutation, updatePasswordMutation } = useAuth();
  const { subscription, currentPlan, isLoading: isSubscriptionLoading, isTrialActive, trialDaysRemaining } = useSubscription();
  
  // Form states
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.username || "");
  const [phone, setPhone] = useState(""); // This field doesn't exist in our schema yet
  const [language, setLanguage] = useState(user?.preferredLanguage || "en");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [documentUpdates, setDocumentUpdates] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call the real API endpoint
    updateProfileMutation.mutate({
      fullName,
      preferredLanguage: language
    });
  };

  const handleNotificationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call to update notification preferences
    setTimeout(() => {
      toast({
        title: t("preferences_updated"),
        description: t("notification_update_success"),
      });
    }, 500);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: t("password_mismatch"),
        description: t("password_mismatch_description"),
        variant: "destructive",
      });
      return;
    }
    
    // Call the real API endpoint
    updatePasswordMutation.mutate({
      currentPassword,
      newPassword
    }, {
      onSuccess: () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <MainLayout>
      <div className="container py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t("settings")}</h1>
        
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
            <TabsTrigger value="notifications">{t("notifications")}</TabsTrigger>
            <TabsTrigger value="security">{t("security")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile_information")}</CardTitle>
                <CardDescription>
                  {t("profile_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="" alt={fullName} />
                        <AvatarFallback className="text-lg">{getInitials(fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm" type="button">
                          {t("change_avatar")}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">{t("full_name")}</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={t("enter_full_name")}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("email_address")}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t("enter_email")}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("phone_number")}</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={t("enter_phone")}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="language">{t("preferred_language")}</Label>
                        <select
                          id="language"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="en">{t("english")}</option>
                          <option value="fr">{t("french")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">{t("save_changes")}</Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Subscription Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Information</CardTitle>
                <CardDescription>
                  Manage your subscription plan and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubscriptionLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="ml-2">Loading subscription information...</span>
                  </div>
                ) : subscription ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            {currentPlan?.name || "Subscription Plan"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {isTrialActive ? (
                              <span className="flex items-center text-yellow-600">
                                <Clock className="mr-1 h-4 w-4" />
                                Trial Period - {trialDaysRemaining} days remaining
                              </span>
                            ) : (
                              <span className="flex items-center text-green-600">
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Active
                              </span>
                            )}
                          </p>
                        </div>
                        <Badge className="bg-primary text-primary-foreground">
                          ${currentPlan?.price}/month
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-muted-foreground">Billing Cycle:</span>
                          <span>Monthly</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-muted-foreground">Next Billing Date:</span>
                          <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span className="flex items-center">
                            <CreditCard className="mr-1 h-4 w-4" />
                            •••• •••• •••• {subscription.lastFour || "1234"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Link href="/subscription-plans">
                        <Button variant="outline">Change Plan</Button>
                      </Link>
                      <Button variant="outline">Update Payment Method</Button>
                      <Link href="/billing-history">
                        <Button variant="secondary">Billing History</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="p-5 bg-muted rounded-lg text-center mb-6">
                      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                      <p className="text-muted-foreground mb-4">
                        You don't have an active subscription plan. Choose a plan to access premium features.
                      </p>
                      <Link href="/subscription-plans">
                        <Button>View Subscription Plans</Button>
                      </Link>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Why Subscribe?</h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Access all document templates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Advanced legal research capabilities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Priority customer support</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("notification_preferences")}</CardTitle>
                <CardDescription>
                  {t("notification_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationUpdate} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">{t("email_notifications")}</Label>
                        <p className="text-sm text-neutral-500">{t("email_notifications_description")}</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="browser-notifications">{t("browser_notifications")}</Label>
                        <p className="text-sm text-neutral-500">{t("browser_notifications_description")}</p>
                      </div>
                      <Switch
                        id="browser-notifications"
                        checked={browserNotifications}
                        onCheckedChange={setBrowserNotifications}
                      />
                    </div>
                    
                    <div className="pt-6 border-t">
                      <h3 className="text-lg font-medium mb-4">{t("notification_types")}</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="document-updates">{t("document_updates")}</Label>
                            <p className="text-sm text-neutral-500">{t("document_updates_description")}</p>
                          </div>
                          <Switch
                            id="document-updates"
                            checked={documentUpdates}
                            onCheckedChange={setDocumentUpdates}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="security-alerts">{t("security_alerts")}</Label>
                            <p className="text-sm text-neutral-500">{t("security_alerts_description")}</p>
                          </div>
                          <Switch
                            id="security-alerts"
                            checked={securityAlerts}
                            onCheckedChange={setSecurityAlerts}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="marketing-emails">{t("marketing_emails")}</Label>
                            <p className="text-sm text-neutral-500">{t("marketing_emails_description")}</p>
                          </div>
                          <Switch
                            id="marketing-emails"
                            checked={marketingEmails}
                            onCheckedChange={setMarketingEmails}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">{t("save_preferences")}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("security_settings")}</CardTitle>
                <CardDescription>
                  {t("security_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">{t("current_password")}</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">{t("new_password")}</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t("confirm_new_password")}</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit">{t("update_password")}</Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("two_factor_authentication")}</CardTitle>
                <CardDescription>
                  {t("two_factor_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">{t("setup_two_factor")}</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("feedback_and_support")}</CardTitle>
                <CardDescription>
                  {t("feedback_description") || "View your submitted feedback and access support options"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Link href="/my-feedback">
                  <Button variant="outline">
                    {t("view_my_feedback") || "View My Feedback"}
                  </Button>
                </Link>
                {(user as any)?.isAdmin && (
                  <Link href="/admin/feedback">
                    <Button variant="secondary">
                      {t("manage_feedback") || "Manage All Feedback"}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">{t("danger_zone")}</CardTitle>
                <CardDescription>
                  {t("danger_zone_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">{t("delete_account")}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}