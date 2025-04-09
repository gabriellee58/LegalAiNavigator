import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle, Clock, FileText, MessageSquare, Users, Calendar, ArrowRight, Paperclip, X, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

// Define validation schema using zod
const disputeFormSchema = z.object({
  title: z.string().min(5, { message: t("title_min_length") }),
  description: z.string().min(20, { message: t("description_min_length") }),
  parties: z.string().min(3, { message: t("parties_min_length") }),
  disputeType: z.string().min(1, { message: t("dispute_type_required") }),
  files: z.array(z.instanceof(File)).optional()
});

export default function DisputeResolutionPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentTab, setCurrentTab] = useState("new-dispute");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [disputeTitle, setDisputeTitle] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [parties, setParties] = useState("");
  const [disputeType, setDisputeType] = useState("");
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  
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
  const baseActiveDisputes = Array.isArray(disputes) ? disputes.filter((dispute: Dispute) => 
    dispute.status && typeof dispute.status === 'string' && 
    ['pending', 'active', 'mediation'].includes(dispute.status)
  ) : [];
  
  const resolvedDisputes = Array.isArray(disputes) ? disputes.filter((dispute: Dispute) => 
    dispute.status && typeof dispute.status === 'string' && 
    ['resolved', 'closed'].includes(dispute.status)
  ) : [];
  
  // Apply additional filters for active disputes
  const activeDisputes = baseActiveDisputes.filter((dispute: Dispute) => {
    // Status filter
    if (statusFilter && dispute.status !== statusFilter) {
      return false;
    }
    
    // Type filter
    if (typeFilter && dispute.disputeType !== typeFilter) {
      return false;
    }
    
    // Search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const titleMatch = dispute.title && dispute.title.toLowerCase().includes(query);
      const descriptionMatch = dispute.description && dispute.description.toLowerCase().includes(query);
      const partiesMatch = dispute.parties && dispute.parties.toLowerCase().includes(query);
      
      return titleMatch || descriptionMatch || partiesMatch;
    }
    
    return true;
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    onSuccess: (createdDispute) => {
      // If there are files to upload, do that now
      if (selectedFiles.length > 0) {
        uploadFilesMutation.mutate({
          disputeId: createdDispute.id,
          files: selectedFiles
        });
      } else {
        // No files to upload, just reset the form and show confirmation
        resetForm();
      }
    },
    onError: (error) => {
      toast({
        title: t("submission_error"),
        description: error.message || t("dispute_submission_error"),
        variant: "destructive",
      });
    },
  });
  
  // Upload files mutation
  const uploadFilesMutation = useMutation({
    mutationFn: async ({ disputeId, files }: { disputeId: number, files: File[] }) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
      });
      
      const res = await fetch(`/api/disputes/${disputeId}/documents`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to upload documents");
      }
      
      return res.json();
    },
    onSuccess: () => {
      // Refresh the disputes list and reset the form
      queryClient.invalidateQueries({ queryKey: ['/api/disputes'] });
      resetForm();
    },
    onError: (error) => {
      // Even if file upload fails, the dispute was created, so we should
      // still invalidate the disputes query and navigate to disputes list
      queryClient.invalidateQueries({ queryKey: ['/api/disputes'] });
      resetForm();
      
      toast({
        title: t("document_upload_error"),
        description: error.message || t("failed_to_upload_documents"),
        variant: "destructive",
      });
    },
  });
  
  const resetForm = () => {
    setDisputeTitle("");
    setDisputeDescription("");
    setParties("");
    setDisputeType("");
    setSelectedFiles([]);
    toast({
      title: t("dispute_submitted"),
      description: t("dispute_confirmation"),
      variant: "default",
    });
    setCurrentTab("active-disputes");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check file sizes and types
      const validFileTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      
      const invalidFiles = newFiles.filter(file => {
        if (!validFileTypes.includes(file.type)) {
          toast({
            title: t("invalid_file_type"),
            description: `${file.name}: ${t("only_pdf_doc_txt_allowed")}`,
            variant: "destructive",
          });
          return true;
        }
        
        if (file.size > maxFileSize) {
          toast({
            title: t("file_too_large"),
            description: `${file.name}: ${t("max_file_size_10mb")}`,
            variant: "destructive",
          });
          return true;
        }
        
        return false;
      });
      
      if (invalidFiles.length > 0) {
        return;
      }
      
      // Add valid files to selected files
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Setup form with validation
  const form = useForm<z.infer<typeof disputeFormSchema>>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      title: disputeTitle,
      description: disputeDescription,
      parties: parties,
      disputeType: disputeType,
      files: []
    },
  });

  // Update form values when state changes
  useEffect(() => {
    form.setValue('title', disputeTitle);
    form.setValue('description', disputeDescription);
    form.setValue('parties', parties);
    form.setValue('disputeType', disputeType);
    form.setValue('files', selectedFiles);
  }, [disputeTitle, disputeDescription, parties, disputeType, selectedFiles]);

  // Update state when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.title !== undefined) setDisputeTitle(value.title);
      if (value.description !== undefined) setDisputeDescription(value.description);
      if (value.parties !== undefined) setParties(value.parties);
      if (value.disputeType !== undefined) setDisputeType(value.disputeType);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = (values: z.infer<typeof disputeFormSchema>) => {
    createDisputeMutation.mutate({
      title: values.title,
      description: values.description,
      parties: values.parties,
      disputeType: values.disputeType,
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t("dispute_title")}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              placeholder={t("dispute_title_placeholder")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="disputeType"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t("dispute_type")}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("select_dispute_type")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="contract">{t("contract_dispute")}</SelectItem>
                              <SelectItem value="property">{t("property_dispute")}</SelectItem>
                              <SelectItem value="family">{t("family_dispute")}</SelectItem>
                              <SelectItem value="employment">{t("employment_dispute")}</SelectItem>
                              <SelectItem value="consumer">{t("consumer_dispute")}</SelectItem>
                              <SelectItem value="landlord_tenant">{t("landlord_tenant_dispute")}</SelectItem>
                              <SelectItem value="small_claims">{t("small_claims_dispute")}</SelectItem>
                              <SelectItem value="civil">{t("civil_dispute")}</SelectItem>
                              <SelectItem value="neighbour">{t("neighbour_dispute")}</SelectItem>
                              <SelectItem value="business">{t("business_dispute")}</SelectItem>
                              <SelectItem value="insurance">{t("insurance_dispute")}</SelectItem>
                              <SelectItem value="intellectual_property">{t("intellectual_property_dispute")}</SelectItem>
                              <SelectItem value="other">{t("other_dispute")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t("dispute_description")}</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field}
                              placeholder={t("dispute_description_placeholder")}
                              className="min-h-[150px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="parties"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>{t("involved_parties")}</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field}
                              placeholder={t("parties_placeholder")}
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("dispute_supporting_documents")}</label>
                      <div className="border border-dashed rounded-md p-6 text-center">
                        <p className="text-sm text-neutral-500 mb-2">{t("drag_drop_files")}</p>
                        <input 
                          type="file" 
                          id="document-upload" 
                          multiple
                          ref={fileInputRef} 
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          {t("dispute_browse_files")}
                        </Button>
                        
                        {/* Display selected files */}
                        {selectedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium">{t("selected_files")}</p>
                            <div className="space-y-2">
                              {selectedFiles.map((file, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center justify-between bg-muted p-2 rounded-md text-sm"
                                >
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({Math.round(file.size / 1024)} KB)
                                    </span>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeFile(index)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">{t("remove_file")}</span>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("max_file_size_note")}
                      </p>
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
                </Form>
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
                {/* Search and filter section */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-1 md:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t("search_disputes")}
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={statusFilter || "all"}
                        onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("filter_status")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("all_statuses")}</SelectItem>
                          <SelectItem value="pending">{t("pending")}</SelectItem>
                          <SelectItem value="active">{t("active")}</SelectItem>
                          <SelectItem value="mediation">{t("in_mediation")}</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={typeFilter || "all"}
                        onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("filter_type")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t("all_types")}</SelectItem>
                          <SelectItem value="contract">{t("contract_dispute")}</SelectItem>
                          <SelectItem value="property">{t("property_dispute")}</SelectItem>
                          <SelectItem value="family">{t("family_dispute")}</SelectItem>
                          <SelectItem value="employment">{t("employment_dispute")}</SelectItem>
                          <SelectItem value="consumer">{t("consumer_dispute")}</SelectItem>
                          <SelectItem value="landlord_tenant">{t("landlord_tenant_dispute")}</SelectItem>
                          <SelectItem value="small_claims">{t("small_claims_dispute")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
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
                          <h3 className="font-medium text-lg">{dispute.title || "Untitled Dispute"}</h3>
                          <Badge variant={
                            !dispute.status || typeof dispute.status !== 'string' ? "outline" :
                            dispute.status === "pending" ? "outline" : 
                            dispute.status === "active" ? "secondary" : 
                            dispute.status === "mediation" ? "default" : "outline"
                          }>
                            {dispute.status === "mediation" ? 
                              t("in_mediation") : 
                              (dispute.status && typeof dispute.status === 'string') ? 
                              `${dispute.status.charAt(0).toUpperCase()}${dispute.status.slice(1)}` : 
                              "Unknown"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {dispute.description || t("no_description_available")}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground gap-4 mb-3">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {dispute.disputeType && typeof dispute.disputeType === 'string' ? 
                             t(dispute.disputeType) : t("other_dispute")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString() : "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {dispute.parties && typeof dispute.parties === 'string' ? 
                             `${dispute.parties.split(',').length} ${t("parties")}` : "—"}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dispute/${dispute.id}`}>
                              {t("view_details")}
                            </Link>
                          </Button>
                          {dispute.status && typeof dispute.status === 'string' && dispute.status === "pending" && (
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
                          <h3 className="font-medium text-lg">{dispute.title || "Untitled Dispute"}</h3>
                          <Badge variant="secondary">
                            {(dispute.status && typeof dispute.status === 'string') ? 
                              (dispute.status === "resolved" ? t("resolved") : t("closed")) : 
                              "Unknown"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {dispute.description || t("no_description_available")}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground gap-4 mb-1">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {dispute.disputeType && typeof dispute.disputeType === 'string' ? 
                             t(dispute.disputeType) : t("other_dispute")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {(dispute.resolvedAt || dispute.updatedAt) ? 
                             new Date(dispute.resolvedAt || dispute.updatedAt).toLocaleDateString() : "—"}
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