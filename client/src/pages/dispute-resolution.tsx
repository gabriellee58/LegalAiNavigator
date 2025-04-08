import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, FileText, MessageSquare, Users, Calendar, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Define the dispute type interface
interface Dispute {
  id: number;
  userId: number;
  title: string;
  description: string;
  parties: string;
  status: string;
  disputeType: string;
  supportingDocuments?: any;
  aiAnalysis?: any;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  mediationId?: number;
}

export default function DisputeResolutionPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentTab, setCurrentTab] = useState("new-dispute");
  const [disputeTitle, setDisputeTitle] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [parties, setParties] = useState("");
  const [disputeType, setDisputeType] = useState("");
  
  // Fetch disputes from the API
  const { 
    data: disputes = [], 
    isLoading: isDisputesLoading,
    error: disputesError
  } = useQuery({
    queryKey: ['/api/disputes'],
    enabled: !!user,
  });
  
  // Filter disputes by status
  const activeDisputes = Array.isArray(disputes) ? disputes.filter((dispute: Dispute) => 
    ['pending', 'active', 'mediation'].includes(dispute.status)
  ) : [];
  
  const resolvedDisputes = Array.isArray(disputes) ? disputes.filter((dispute: Dispute) => 
    ['resolved', 'closed'].includes(dispute.status)
  ) : [];
  
  // Create dispute mutation
  const createDisputeMutation = useMutation({
    mutationFn: async (dispute: {
      title: string;
      description: string;
      parties: string;
      disputeType: string;
    }) => {
      const res = await apiRequest("POST", "/api/disputes", dispute);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disputes'] });
      setDisputeTitle("");
      setDisputeDescription("");
      setParties("");
      setDisputeType("");
      toast({
        title: t("dispute_submitted"),
        description: t("dispute_confirmation"),
        variant: "default",
      });
      setCurrentTab("active-disputes");
    },
    onError: (error) => {
      toast({
        title: t("submission_error"),
        description: error.message || t("dispute_submission_error"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeTitle || !disputeDescription || !parties || !disputeType) {
      toast({
        title: t("form_error"),
        description: t("all_fields_required"),
        variant: "destructive",
      });
      return;
    }
    
    createDisputeMutation.mutate({
      title: disputeTitle,
      description: disputeDescription,
      parties: parties,
      disputeType: disputeType,
    });
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("dispute_title")}</label>
                    <Input 
                      value={disputeTitle}
                      onChange={(e) => setDisputeTitle(e.target.value)}
                      placeholder={t("dispute_title_placeholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("dispute_type")}</label>
                    <Select 
                      value={disputeType} 
                      onValueChange={setDisputeType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_dispute_type")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">{t("contract_dispute")}</SelectItem>
                        <SelectItem value="property">{t("property_dispute")}</SelectItem>
                        <SelectItem value="family">{t("family_dispute")}</SelectItem>
                        <SelectItem value="employment">{t("employment_dispute")}</SelectItem>
                        <SelectItem value="consumer">{t("consumer_dispute")}</SelectItem>
                        <SelectItem value="other">{t("other_dispute")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    <label className="text-sm font-medium">{t("dispute_supporting_documents")}</label>
                    <div className="border border-dashed rounded-md p-6 text-center">
                      <p className="text-sm text-neutral-500 mb-2">{t("drag_drop_files")}</p>
                      <Button variant="outline" size="sm" type="button">
                        {t("dispute_browse_files")}
                      </Button>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={createDisputeMutation.isPending}
                    >
                      {createDisputeMutation.isPending ? 
                        t("submitting") : 
                        t("submit_dispute")}
                    </Button>
                  </div>
                </form>
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
                {isDisputesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2 mt-2">
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : disputesError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {t("disputes_fetch_error")}
                    </AlertDescription>
                  </Alert>
                ) : activeDisputes.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-neutral-500 text-center py-8">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-blue-500 opacity-50" />
                      {t("no_active_disputes")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeDisputes.map((dispute: Dispute) => (
                      <div key={dispute.id} className="border rounded-lg p-4 transition-all hover:border-primary">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-lg">{dispute.title}</h3>
                          <Badge variant={
                            dispute.status === "pending" ? "outline" : 
                            dispute.status === "active" ? "secondary" : 
                            dispute.status === "mediation" ? "default" : "outline"
                          }>
                            {dispute.status === "mediation" ? 
                              t("in_mediation") : 
                              dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {dispute.description}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground gap-4 mb-3">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {t(dispute.disputeType)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(dispute.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {dispute.parties.split(',').length} {t("parties")}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dispute/${dispute.id}`}>
                              {t("view_details")}
                            </Link>
                          </Button>
                          {dispute.status === "pending" && (
                            <Button size="sm" asChild>
                              <Link href={`/dispute/${dispute.id}`}>
                                {t("start_mediation")}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                {isDisputesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : disputesError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {t("disputes_fetch_error")}
                    </AlertDescription>
                  </Alert>
                ) : resolvedDisputes.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-neutral-500 text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
                      {t("no_resolved_disputes")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resolvedDisputes.map((dispute: Dispute) => (
                      <div key={dispute.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-lg">{dispute.title}</h3>
                          <Badge variant="secondary">
                            {dispute.status === "resolved" ? 
                              t("resolved") : 
                              t("closed")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {dispute.description}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground gap-4 mb-1">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {t(dispute.disputeType)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(dispute.resolvedAt || dispute.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Button size="sm" variant="outline" className="mt-2" asChild>
                          <Link href={`/dispute/${dispute.id}`}>
                            {t("view_resolution")}
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}