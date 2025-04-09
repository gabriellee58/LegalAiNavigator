import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, FileText, MessageSquare, Users, Calendar, ArrowRight, ArrowLeft, PenSquare, Paperclip, FilePlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

// Define interfaces
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

interface MediationSession {
  id: number;
  disputeId: number;
  mediatorId: number | null;
  sessionCode: string;
  status: string;
  scheduledAt: string | null;
  completedAt: string | null;
  summary: string | null;
  recommendations: any | null;
  aiAssistance: boolean;
  createdAt: string;
}

interface MediationMessage {
  id: number;
  sessionId: number;
  userId: number | null;
  role: string;
  content: string;
  sentiment: string | null;
  createdAt: string;
}

export default function DisputeDetailPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute("/dispute/:id");
  const [, navigate] = useLocation();
  const disputeId = params?.id ? parseInt(params.id) : null;
  
  const [newMessage, setNewMessage] = useState("");
  const [currentTab, setCurrentTab] = useState("overview");
  const [isStartMediationDialogOpen, setIsStartMediationDialogOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // Redirect if dispute ID is invalid
  useEffect(() => {
    if (!disputeId) {
      navigate("/dispute-resolution");
    }
  }, [disputeId, navigate]);
  
  // Fetch dispute details
  const {
    data: dispute,
    isLoading: isDisputeLoading,
    error: disputeError
  } = useQuery<Dispute>({
    queryKey: ['/api/disputes', disputeId],
    enabled: !!disputeId && !!user,
  });
  
  // Fetch mediation sessions for this dispute
  const {
    data: mediationSessions = [],
    isLoading: isSessionsLoading,
    error: sessionsError
  } = useQuery({
    queryKey: ['/api/disputes', disputeId, 'mediation-sessions'],
    enabled: !!disputeId && !!user,
  });
  
  // Get the primary (or only) mediation session
  const primarySession = Array.isArray(mediationSessions) && mediationSessions.length > 0 
    ? mediationSessions[0] 
    : null;
  
  // Fetch combined session details (session, messages, dispute) using the new endpoint
  const {
    data: sessionDetails,
    isLoading: isDetailsLoading,
    error: detailsError
  } = useQuery({
    queryKey: ['/api/mediation-sessions', primarySession?.id, 'details'],
    enabled: !!primarySession?.id && !!user,
  });
  
  // Define session messages interface
  interface MediationMessage {
    id: number;
    sessionId: number;
    userId: number;
    role: string;
    content: string;
    sentiment?: string;
    createdAt: string;
  }
  
  // Extract messages from the combined session details
  const mediationMessages: MediationMessage[] = sessionDetails && sessionDetails !== null && typeof sessionDetails === 'object' && 'messages' in sessionDetails ? sessionDetails.messages as MediationMessage[] : [];
  
  // Mutation to start a mediation session
  const startMediationMutation = useMutation({
    mutationFn: async (data: { aiAssistance: boolean, scheduledAt?: string }) => {
      const res = await apiRequest("POST", `/api/disputes/${disputeId}/mediation-sessions`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disputes', disputeId, 'mediation-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/disputes', disputeId] });
      setIsStartMediationDialogOpen(false);
      toast({
        title: t("mediation_started"),
        description: t("mediation_session_created"),
        variant: "default",
      });
      setCurrentTab("mediation");
    },
    onError: (error) => {
      toast({
        title: t("mediation_error"),
        description: error.message || t("mediation_session_error"),
        variant: "destructive",
      });
    },
  });
  
  // Mutation to send a message in mediation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await apiRequest("POST", `/api/mediation-sessions/${primarySession?.id}/messages`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mediation-sessions', primarySession?.id, 'messages'] });
      setNewMessage("");
    },
    onError: (error) => {
      toast({
        title: t("message_error"),
        description: error.message || t("message_send_error"),
        variant: "destructive",
      });
    },
  });
  
  // Mutation to resolve a dispute
  const resolveDisputeMutation = useMutation({
    mutationFn: async (data: { status: string }) => {
      const res = await apiRequest("PATCH", `/api/disputes/${disputeId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disputes', disputeId] });
      queryClient.invalidateQueries({ queryKey: ['/api/disputes'] });
      toast({
        title: t("dispute_resolved"),
        description: t("dispute_resolved_success"),
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: t("resolution_error"),
        description: error.message || t("dispute_resolution_error"),
        variant: "destructive",
      });
    },
  });
  
  // Mutation to generate a session summary
  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/mediation-sessions/${primarySession?.id}/summary`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/mediation-sessions', primarySession?.id, 'details'] });
      queryClient.invalidateQueries({ queryKey: ['/api/disputes', disputeId] });
      setIsGeneratingSummary(false);
      toast({
        title: t("summary_generated"),
        description: t("session_summary_created"),
        variant: "default",
      });
    },
    onError: (error) => {
      setIsGeneratingSummary(false);
      toast({
        title: t("summary_error"),
        description: error.message || t("summary_generation_error"),
        variant: "destructive",
      });
    },
  });
  
  const handleStartMediation = () => {
    startMediationMutation.mutate({
      aiAssistance: true,
    });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      content: newMessage,
    });
  };
  
  const handleResolveDispute = () => {
    resolveDisputeMutation.mutate({
      status: "resolved"
    });
  };
  
  const handleGenerateSummary = () => {
    setIsGeneratingSummary(true);
    generateSummaryMutation.mutate();
  };
  
  const isLoading = isDisputeLoading || isAuthLoading;
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-6 max-w-5xl">
          <Skeleton className="h-10 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="h-[200px] w-full rounded-md mb-4" />
              <Skeleton className="h-[180px] w-full rounded-md" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (disputeError) {
    return (
      <MainLayout>
        <div className="container py-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {t("dispute_fetch_error") || "Failed to load dispute. Please try again."}
            </AlertDescription>
          </Alert>
          <Button variant="outline" asChild>
            <Link href="/dispute-resolution">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back_to_disputes") || "Back to Disputes"}
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  if (!dispute) {
    return (
      <MainLayout>
        <div className="container py-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>
              {t("dispute_not_found") || "Dispute not found. It may have been deleted or you don't have access."}
            </AlertDescription>
          </Alert>
          <Button variant="outline" asChild>
            <Link href="/dispute-resolution">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back_to_disputes") || "Back to Disputes"}
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending": return "outline";
      case "active": return "secondary";
      case "mediation": return "default";
      case "resolved": return "success";
      case "closed": return "default";
      default: return "outline";
    }
  };
  
  return (
    <MainLayout>
      <div className="container py-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dispute-resolution">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("back")}
                </Link>
              </Button>
              <Badge variant={getStatusBadgeVariant(dispute.status)}>
                {dispute.status === "mediation" ? 
                  t("in_mediation") || "In Mediation" : 
                  (dispute.status && typeof dispute.status === 'string') ? 
                  (t(dispute.status) || `${dispute.status.charAt(0).toUpperCase()}${dispute.status.slice(1)}`) : 
                  "Unknown"}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-1">{dispute.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground gap-4">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {t(dispute.disputeType) || dispute.disputeType}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(dispute.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {dispute.status === "pending" && (
              <Button onClick={() => setIsStartMediationDialogOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("start_mediation")}
              </Button>
            )}
            
            {dispute.status === "mediation" && (
              <Button onClick={handleResolveDispute} variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("mark_as_resolved")}
              </Button>
            )}
          </div>
        </div>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
            <TabsTrigger value="documents">{t("documents")}</TabsTrigger>
            <TabsTrigger 
              value="mediation" 
              disabled={!primarySession}
            >
              {t("mediation")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("dispute_details")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">{t("description")}</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{dispute.description}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">{t("involved_parties")}</h3>
                      <p className="text-muted-foreground whitespace-pre-line">{dispute.parties}</p>
                    </div>
                  </CardContent>
                </Card>
                
                {primarySession?.aiAnalysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("ai_analysis")}</CardTitle>
                      <CardDescription>
                        {t("ai_analysis_description")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <p>{primarySession.aiAnalysis.summary || t("no_analysis_available")}</p>
                        
                        {primarySession.aiAnalysis.recommendations && (
                          <>
                            <h3>{t("recommendations")}</h3>
                            <ul>
                              {primarySession.aiAnalysis.recommendations.map((rec: string, i: number) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("status_info")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("created")}</span>
                      <span>{format(new Date(dispute.createdAt), 'PP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("updated")}</span>
                      <span>{format(new Date(dispute.updatedAt), 'PP')}</span>
                    </div>
                    {dispute.resolvedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("resolved")}</span>
                        <span>{format(new Date(dispute.resolvedAt), 'PP')}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("status")}</span>
                      <Badge variant={getStatusBadgeVariant(dispute.status)}>
                        {(dispute.status && typeof dispute.status === 'string') ? 
                        (t(dispute.status) || dispute.status) : 
                        "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("type")}</span>
                      <span>{t(dispute.disputeType) || dispute.disputeType}</span>
                    </div>
                  </CardContent>
                </Card>
                
                {primarySession && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("mediation_status")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("session_status")}</span>
                        <Badge variant="outline">
                          {(primarySession.status && typeof primarySession.status === 'string') ? 
                          (t(primarySession.status) || primarySession.status) : 
                          "Unknown"}
                        </Badge>
                      </div>
                      {primarySession.scheduledAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("scheduled_for")}</span>
                          <span>{format(new Date(primarySession.scheduledAt), 'PPp')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("ai_assistance")}</span>
                        <span>{primarySession.aiAssistance ? t("enabled") : t("disabled")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("session_code")}</span>
                        <code className="bg-secondary px-2 py-1 rounded text-sm">
                          {primarySession.sessionCode}
                        </code>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => setCurrentTab("mediation")}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {t("view_mediation")}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t("supporting_documents")}</span>
                  <Button size="sm" variant="outline">
                    <Paperclip className="h-4 w-4 mr-2" />
                    {t("upload_document")}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t("documents_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dispute.supportingDocuments && dispute.supportingDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {dispute.supportingDocuments.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.uploadedAt ? format(new Date(doc.uploadedAt), 'PPp') : ''}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          {t("view")}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed rounded-md">
                    <Paperclip className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      {t("no_documents_uploaded")}
                    </p>
                    <Button>
                      <Paperclip className="h-4 w-4 mr-2" />
                      {t("upload_document")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mediation" className="space-y-6">
            {!primarySession ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">{t("no_mediation_session")}</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {t("no_mediation_description")}
                  </p>
                  {dispute.status === "pending" && (
                    <Button onClick={() => setIsStartMediationDialogOpen(true)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t("start_mediation")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle>{t("mediation_session")}</CardTitle>
                      <CardDescription>
                        {t("session_code")}: <code className="bg-secondary px-2 py-0.5 rounded">{primarySession.sessionCode}</code>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto">
                      {isDetailsLoading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-2">
                              <Skeleton className={`h-4 w-1/3 ${i % 2 === 0 ? 'ml-auto' : ''}`} />
                              <Skeleton className={`h-20 w-2/3 ${i % 2 === 0 ? 'ml-auto' : ''}`} />
                            </div>
                          ))}
                        </div>
                      ) : detailsError ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            {t("messages_fetch_error")}
                          </AlertDescription>
                        </Alert>
                      ) : mediationMessages.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">
                            {t("no_messages_yet")}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto p-1">
                          {mediationMessages.map((message: MediationMessage) => (
                            <div 
                              key={message.id} 
                              className={`flex flex-col ${
                                message.role === 'ai' ? 'items-center' : 
                                message.role === 'user' && message.userId === user?.id ? 'items-end' : 
                                'items-start'
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-1 text-xs text-muted-foreground">
                                <span>
                                  {message.role === 'ai' ? t('ai_mediator') : 
                                   message.role === 'mediator' ? t('mediator') : 
                                   message.userId === user?.id ? t('you') : t('other_party')}
                                </span>
                                <span>•</span>
                                <span>{format(new Date(message.createdAt), 'p')}</span>
                              </div>
                              <div 
                                className={`px-4 py-3 rounded-lg max-w-[80%] ${
                                  message.role === 'ai' ? 'bg-secondary border' : 
                                  message.role === 'user' && message.userId === user?.id ? 'bg-primary text-primary-foreground' : 
                                  'bg-muted'
                                }`}
                              >
                                <p className="whitespace-pre-line">{message.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t p-4">
                      <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={t("type_message") || "Type your message..."}
                          className="flex-grow min-h-[80px]"
                          disabled={
                            !primarySession.status || 
                            typeof primarySession.status !== 'string' || 
                            (primarySession.status !== "in_progress" && primarySession.status !== "scheduled")
                          }
                        />
                        <Button 
                          type="submit" 
                          disabled={
                            !newMessage.trim() || 
                            sendMessageMutation.isPending || 
                            !primarySession.status ||
                            typeof primarySession.status !== 'string' ||
                            (primarySession.status !== "in_progress" && primarySession.status !== "scheduled")
                          }
                          className="self-end"
                        >
                          {sendMessageMutation.isPending ? t("sending") : t("send")}
                        </Button>
                      </form>
                    </CardFooter>
                  </Card>
                </div>
                
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("session_info")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("status")}</span>
                        <Badge variant="outline">
                          {(primarySession.status && typeof primarySession.status === 'string') ? 
                          (t(primarySession.status) || primarySession.status) : 
                          "Unknown"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("created")}</span>
                        <span>{format(new Date(primarySession.createdAt), 'PP')}</span>
                      </div>
                      {primarySession.scheduledAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("scheduled")}</span>
                          <span>{format(new Date(primarySession.scheduledAt), 'PPp')}</span>
                        </div>
                      )}
                      {primarySession.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("completed")}</span>
                          <span>{format(new Date(primarySession.completedAt), 'PP')}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("ai_assistance")}</span>
                        <Badge variant={primarySession.aiAssistance ? "default" : "outline"}>
                          {primarySession.aiAssistance ? t("enabled") : t("disabled")}
                        </Badge>
                      </div>
                      
                      {(primarySession.status && typeof primarySession.status === 'string' && primarySession.status === "in_progress") && (
                        <Button 
                          variant="outline"
                          className="w-full mt-2"
                          onClick={handleResolveDispute}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {t("mark_as_resolved")}
                        </Button>
                      )}
                      
                      {(primarySession.status && typeof primarySession.status === 'string' && primarySession.status === "completed") && !primarySession.summary && (
                        <Button 
                          variant="outline"
                          className="w-full mt-2"
                          onClick={handleGenerateSummary}
                          disabled={isGeneratingSummary}
                        >
                          <FilePlus className="h-4 w-4 mr-2" />
                          {isGeneratingSummary ? t("generating_summary") : t("generate_summary")}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                  
                  {primarySession.summary && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>{t("session_summary")}</CardTitle>
                        <CardDescription>
                          {t("ai_generated_summary")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="whitespace-pre-line">{primarySession.summary}</p>
                          
                          {primarySession.recommendations && (
                            <>
                              <h3 className="mt-4">{t("recommendations")}</h3>
                              <ul>
                                {typeof primarySession.recommendations === 'string' 
                                  ? <li>{primarySession.recommendations}</li>
                                  : Array.isArray(primarySession.recommendations) && 
                                    primarySession.recommendations.map((rec: string, i: number) => (
                                      <li key={i}>{rec}</li>
                                    ))
                                }
                              </ul>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Start Mediation Dialog */}
      <Dialog open={isStartMediationDialogOpen} onOpenChange={setIsStartMediationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("start_mediation_session")}</DialogTitle>
            <DialogDescription>
              {t("mediation_dialog_description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t("ai_assistance")}</span>
              <Badge variant="outline" className="ml-2">
                {t("enabled")}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {t("ai_mediation_description")}
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsStartMediationDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button 
              onClick={handleStartMediation}
              disabled={startMediationMutation.isPending}
            >
              {startMediationMutation.isPending ? t("creating") : t("create_session")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}