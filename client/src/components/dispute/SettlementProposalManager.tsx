import { t } from "@/lib/i18n";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Scale, FileText, Paperclip, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

interface SettlementProposal {
  id: number;
  disputeId: number;
  proposedBy: number;
  title: string;
  content: string;
  status: string;
  documentId: number | null;
  termsAndConditions: any;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  proposerName?: string;
}

interface SharedDocument {
  id: number;
  title: string;
  description: string | null;
  fileType: string;
  fileSize: number;
}

const proposalFormSchema = z.object({
  title: z.string().min(5, { message: t("title_too_short") }),
  content: z.string().min(20, { message: t("proposal_content_too_short") }),
  documentId: z.number().nullable(),
  expiresInDays: z.number().min(1).max(30).optional(),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

interface SettlementProposalManagerProps {
  disputeId: number;
  currentUserId: number;
}

export default function SettlementProposalManager({ disputeId, currentUserId }: SettlementProposalManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingProposal, setViewingProposal] = useState<SettlementProposal | null>(null);
  const [expandedProposal, setExpandedProposal] = useState<number | null>(null);
  
  // Form setup for creating new proposals
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      title: "",
      content: "",
      documentId: null,
      expiresInDays: 7,
    },
  });
  
  // Fetch settlement proposals
  const {
    data: proposals = [],
    isLoading: isProposalsLoading,
    error: proposalsError
  } = useQuery({
    queryKey: ['/api/disputes', disputeId, 'settlement-proposals'],
    enabled: !!disputeId,
  });
  
  // Fetch documents that can be attached to proposals
  const {
    data: documents = [],
    isLoading: isDocumentsLoading,
  } = useQuery({
    queryKey: ['/api/disputes', disputeId, 'documents'],
    enabled: !!disputeId,
  });
  
  // Mutation to create a new settlement proposal
  const createProposalMutation = useMutation({
    mutationFn: async (data: ProposalFormValues) => {
      // Calculate expiration date if provided
      let expiresAt = null;
      if (data.expiresInDays) {
        const date = new Date();
        date.setDate(date.getDate() + data.expiresInDays);
        expiresAt = date.toISOString();
      }
      
      const payload = {
        ...data,
        expiresAt,
      };
      delete payload.expiresInDays;
      
      const res = await apiRequest("POST", `/api/disputes/${disputeId}/settlement-proposals`, payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disputes', disputeId, 'settlement-proposals'] });
      toast({
        title: t("proposal_created"),
        description: t("settlement_proposal_created_successfully"),
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("proposal_error"),
        description: error.message || t("proposal_creation_failed"),
        variant: "destructive",
      });
    },
  });
  
  // Mutation to accept/reject a proposal
  const respondToProposalMutation = useMutation({
    mutationFn: async ({ proposalId, action }: { proposalId: number, action: 'accept' | 'reject' }) => {
      const res = await apiRequest("PATCH", `/api/settlement-proposals/${proposalId}`, {
        status: action === 'accept' ? 'accepted' : 'rejected'
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disputes', disputeId, 'settlement-proposals'] });
      toast({
        title: t("response_recorded"),
        description: t("proposal_response_successful"),
      });
      setViewingProposal(null);
    },
    onError: (error) => {
      toast({
        title: t("response_error"),
        description: error.message || t("proposal_response_failed"),
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: ProposalFormValues) => {
    createProposalMutation.mutate(values);
  };
  
  // Handle view proposal
  const handleViewProposal = (proposal: SettlementProposal) => {
    setViewingProposal(proposal);
  };
  
  // Handle response to proposal
  const handleRespondToProposal = (proposalId: number, action: 'accept' | 'reject') => {
    respondToProposalMutation.mutate({ proposalId, action });
  };
  
  // Toggle expanded proposal for mobile view
  const toggleExpandProposal = (proposalId: number) => {
    setExpandedProposal(expandedProposal === proposalId ? null : proposalId);
  };
  
  // Helper to get document by ID
  const getDocumentById = (id: number | null) => {
    if (!id) return null;
    return documents.find((doc: SharedDocument) => doc.id === id);
  };
  
  // Helper to get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { variant: 'outline' as const, label: t("pending") };
      case 'accepted':
        return { variant: 'success' as const, label: t("accepted") };
      case 'rejected':
        return { variant: 'destructive' as const, label: t("rejected") };
      case 'expired':
        return { variant: 'secondary' as const, label: t("expired") };
      default:
        return { variant: 'outline' as const, label: status };
    }
  };
  
  // Check if a proposal is from the current user
  const isProposalFromCurrentUser = (proposal: SettlementProposal) => {
    return proposal.proposedBy === currentUserId;
  };
  
  // Format date with relative time
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'PPP');
  };
  
  // Check if a proposal is actionable by current user
  const isProposalActionable = (proposal: SettlementProposal) => {
    return (
      !isProposalFromCurrentUser(proposal) &&
      proposal.status.toLowerCase() === 'pending' &&
      (!proposal.expiresAt || new Date(proposal.expiresAt) > new Date())
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("settlement_proposals")}</h2>
          <p className="text-muted-foreground text-sm mt-1">{t("settlement_proposals_description")}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("new_proposal")}
        </Button>
      </div>
      
      {isProposalsLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : proposalsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>
            {t("proposals_fetch_error")}
          </AlertDescription>
        </Alert>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">{t("no_settlement_proposals")}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t("no_settlement_proposals_description")}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("create_first_proposal")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
            <div className="col-span-3">{t("proposal")}</div>
            <div className="col-span-3">{t("proposed_by")}</div>
            <div className="col-span-2">{t("date")}</div>
            <div className="col-span-2">{t("status")}</div>
            <div className="col-span-2 text-right">{t("actions")}</div>
          </div>
          
          {proposals.map((proposal: SettlementProposal) => (
            <Card key={proposal.id} className="overflow-hidden">
              {/* Mobile view */}
              <div className="md:hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{proposal.title}</CardTitle>
                      <CardDescription>
                        {proposal.proposerName || t("you")} • {formatDate(proposal.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadge(proposal.status).variant}>
                      {getStatusBadge(proposal.status).label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-2 h-auto" 
                    onClick={() => toggleExpandProposal(proposal.id)}
                  >
                    <span>{expandedProposal === proposal.id ? t("hide_details") : t("show_details")}</span>
                    {expandedProposal === proposal.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  {expandedProposal === proposal.id && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm whitespace-pre-line">{proposal.content}</p>
                      
                      {proposal.documentId && (
                        <div className="flex items-center p-2 border rounded-md text-sm">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{getDocumentById(proposal.documentId)?.title || t("attached_document")}</span>
                        </div>
                      )}
                      
                      {proposal.expiresAt && (
                        <div className="text-sm text-muted-foreground">
                          {t("expires")}: {formatDate(proposal.expiresAt)}
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProposal(proposal)}
                          className="flex-1"
                        >
                          {t("view")}
                        </Button>
                        
                        {isProposalActionable(proposal) && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRespondToProposal(proposal.id, 'reject')}
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {t("reject")}
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleRespondToProposal(proposal.id, 'accept')}
                              className="flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {t("accept")}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
              
              {/* Desktop view */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 items-center">
                <div className="col-span-3">
                  <div className="font-medium">{proposal.title}</div>
                  {proposal.documentId && (
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <Paperclip className="h-3 w-3 mr-1" />
                      <span>{getDocumentById(proposal.documentId)?.title || t("attached_document")}</span>
                    </div>
                  )}
                </div>
                <div className="col-span-3 text-sm">
                  {isProposalFromCurrentUser(proposal) ? t("you") : proposal.proposerName || t("other_party")}
                </div>
                <div className="col-span-2 text-sm">
                  {formatDate(proposal.createdAt)}
                  {proposal.expiresAt && (
                    <div className="text-xs text-muted-foreground">
                      {t("expires")}: {formatDate(proposal.expiresAt)}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <Badge variant={getStatusBadge(proposal.status).variant}>
                    {getStatusBadge(proposal.status).label}
                  </Badge>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewProposal(proposal)}
                  >
                    {t("view")}
                  </Button>
                  
                  {isProposalActionable(proposal) && (
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRespondToProposal(proposal.id, 'reject')}
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">{t("reject")}</span>
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleRespondToProposal(proposal.id, 'accept')}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="sr-only">{t("accept")}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* New Proposal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("create_settlement_proposal")}</DialogTitle>
            <DialogDescription>
              {t("settlement_proposal_dialog_description")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("proposal_title")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("proposal_title_placeholder") || "Enter a clear title"} />
                    </FormControl>
                    <FormDescription>
                      {t("proposal_title_description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("proposal_content")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder={t("proposal_content_placeholder") || "Describe your settlement proposal in detail"}
                        className="min-h-[150px]"
                      />
                    </FormControl>
                    <FormDescription>
                      {t("proposal_content_description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="documentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("attach_document")}</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_document_placeholder") || "Select a document (optional)"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">
                          {t("no_document")}
                        </SelectItem>
                        {documents.map((doc: SharedDocument) => (
                          <SelectItem key={doc.id} value={doc.id.toString()}>
                            {doc.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isDocumentsLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {t("loading_documents")}
                        </div>
                      ) : documents.length === 0 ? (
                        t("no_documents_available")
                      ) : (
                        t("attach_document_description")
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expiresInDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("expiration")}</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString() || "7"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_expiration") || "Select expiration time"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="7">{t("expires_in_days", { count: 7 })}</SelectItem>
                        <SelectItem value="14">{t("expires_in_days", { count: 14 })}</SelectItem>
                        <SelectItem value="30">{t("expires_in_days", { count: 30 })}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("expiration_description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProposalMutation.isPending}
                >
                  {createProposalMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("creating")}
                    </>
                  ) : (
                    t("create_proposal")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Proposal Dialog */}
      {viewingProposal && (
        <Dialog open={!!viewingProposal} onOpenChange={(open) => !open && setViewingProposal(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{viewingProposal.title}</DialogTitle>
              <DialogDescription>
                {t("proposed_by")}: {isProposalFromCurrentUser(viewingProposal) ? t("you") : viewingProposal.proposerName || t("other_party")} • {formatDate(viewingProposal.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={getStatusBadge(viewingProposal.status).variant}>
                  {getStatusBadge(viewingProposal.status).label}
                </Badge>
                
                {viewingProposal.expiresAt && (
                  <div className="text-sm text-muted-foreground">
                    {t("expires")}: {formatDate(viewingProposal.expiresAt)}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">{t("proposal_details")}</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line">{viewingProposal.content}</p>
                </div>
              </div>
              
              {viewingProposal.documentId && (
                <div>
                  <h3 className="font-medium mb-2">{t("attached_document")}</h3>
                  <div className="border rounded-md p-3 flex items-center">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {getDocumentById(viewingProposal.documentId)?.title || t("document")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getDocumentById(viewingProposal.documentId)?.fileType || ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {viewingProposal.termsAndConditions && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="terms">
                    <AccordionTrigger>{t("terms_and_conditions")}</AccordionTrigger>
                    <AccordionContent>
                      <div className="prose dark:prose-invert max-w-none text-sm">
                        <div className="whitespace-pre-line">
                          {typeof viewingProposal.termsAndConditions === 'string' 
                            ? viewingProposal.termsAndConditions 
                            : JSON.stringify(viewingProposal.termsAndConditions, null, 2)
                          }
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setViewingProposal(null)}
              >
                {t("close")}
              </Button>
              
              {isProposalActionable(viewingProposal) && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => handleRespondToProposal(viewingProposal.id, 'reject')}
                    disabled={respondToProposalMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t("reject_proposal")}
                  </Button>
                  <Button 
                    onClick={() => handleRespondToProposal(viewingProposal.id, 'accept')}
                    disabled={respondToProposalMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("accept_proposal")}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}