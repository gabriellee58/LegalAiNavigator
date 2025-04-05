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

export default function SettingsPage() {
  const [currentTab, setCurrentTab] = useState("profile");
  const { toast } = useToast();
  const { user } = useAuth();
  
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
    
    // Simulate API call to update profile
    setTimeout(() => {
      toast({
        title: t("profile_updated"),
        description: t("profile_update_success"),
      });
    }, 500);
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
    
    // Simulate API call to update password
    setTimeout(() => {
      toast({
        title: t("password_updated"),
        description: t("password_update_success"),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 500);
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