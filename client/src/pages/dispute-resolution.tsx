import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DisputeResolutionPage() {
  const [currentTab, setCurrentTab] = useState("new-dispute");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [parties, setParties] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disputeDescription && parties) {
      setSubmitted(true);
    }
  };

  return (
    <MainLayout>
      <div className="container py-6 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">{t("dispute_resolution")}</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-8">
          {t("dispute_resolution_description")}
        </p>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="new-dispute">{t("new_dispute")}</TabsTrigger>
            <TabsTrigger value="active-disputes">{t("active_disputes")}</TabsTrigger>
            <TabsTrigger value="resolved-disputes">{t("resolved_disputes")}</TabsTrigger>
          </TabsList>

          <TabsContent value="new-dispute" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("submit_new_dispute")}</CardTitle>
                <CardDescription>
                  {t("dispute_form_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle className="text-green-800 dark:text-green-400">{t("dispute_submitted")}</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        {t("dispute_confirmation")}
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={() => {
                        setSubmitted(false);
                        setDisputeDescription("");
                        setParties("");
                      }}
                      variant="outline"
                    >
                      {t("submit_another_dispute")}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("dispute_description")}</label>
                      <Textarea 
                        value={disputeDescription}
                        onChange={(e) => setDisputeDescription(e.target.value)}
                        placeholder={t("dispute_description_placeholder")}
                        className="min-h-[150px]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("involved_parties")}</label>
                      <Textarea 
                        value={parties}
                        onChange={(e) => setParties(e.target.value)}
                        placeholder={t("parties_placeholder")}
                        className="min-h-[100px]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("supporting_documents")}</label>
                      <div className="border border-dashed rounded-md p-6 text-center">
                        <p className="text-sm text-neutral-500 mb-2">{t("drag_drop_files")}</p>
                        <Button variant="outline" size="sm" type="button">
                          {t("browse_files")}
                        </Button>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button type="submit">{t("submit_dispute")}</Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active-disputes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("active_disputes")}</CardTitle>
                <CardDescription>
                  {t("active_disputes_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-neutral-500 text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-blue-500 opacity-50" />
                    {t("no_active_disputes")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved-disputes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("resolved_disputes")}</CardTitle>
                <CardDescription>
                  {t("resolved_disputes_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-neutral-500 text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
                    {t("no_resolved_disputes")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}