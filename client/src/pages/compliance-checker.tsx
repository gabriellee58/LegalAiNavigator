import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, ShieldCheck, XCircle, Loader2, FileText, Trash2, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content?: string; // Base64 content of the file
}

interface ComplianceHistoryItem {
  id: number;
  businessType: string;
  jurisdiction: string;
  score: number;
  status: string;
  createdAt: string;
  description?: string;
  complianceArea?: string;
}

export default function ComplianceCheckerPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentTab, setCurrentTab] = useState("check-compliance");
  const [businessType, setBusinessType] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [description, setDescription] = useState("");
  const [complianceResult, setComplianceResult] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch compliance history using React Query
  const { 
    data: complianceHistory = [], 
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory
  } = useQuery<ComplianceHistoryItem[]>({
    queryKey: ['/api/compliance/history'],
    enabled: currentTab === 'compliance-history'
  });

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Validate file types: PDF, DOC, DOCX, TXT, images, etc.
    const allowedTypes = [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/rtf',
      'application/json',
      'text/csv',
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp'
    ];
    
    // Max file size is 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    
    // Process each file
    Array.from(files).forEach(file => {
      // File type validation
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t("error"),
          description: t("file_type_not_supported", { filename: file.name }),
          variant: "destructive"
        });
        return;
      }
      
      // File size validation
      if (file.size > maxSize) {
        toast({
          title: t("error"),
          description: t("file_too_large", { filename: file.name, maxSize: "10MB" }),
          variant: "destructive"
        });
        return;
      }
      
      // Read file content as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = (e.target?.result as string)?.split(',')[1];
        setUploadedFiles(prev => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            type: file.type,
            content: base64String
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Format file size display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Update compliance history when a new tab is selected
  useEffect(() => {
    if (currentTab === 'compliance-history') {
      refetchHistory();
    }
  }, [currentTab, refetchHistory]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (businessType && jurisdiction) {
      setIsSubmitting(true);
      
      try {
        const complianceData = {
          businessType,
          jurisdiction,
          description,
          documents: uploadedFiles
        };
        
        // Make the actual API call and get the result directly
        // apiRequest will handle the response.json() internally
        const result = await apiRequest('POST', '/api/compliance/check', complianceData);
        
        // Check if the response contains the data property
        if (result && result.data) {
          setComplianceResult(result.data);
        } else {
          // Fallback to use the entire response if data property is not found
          setComplianceResult(result);
        }
        
        // Refresh the compliance history after a successful check
        refetchHistory();
        
        toast({
          title: t("compliance_check_complete"),
          description: t("compliance_check_success"),
        });
      } catch (error) {
        console.error('Compliance check error:', error);
        
        toast({
          title: t("error"),
          description: error instanceof Error ? error.message : t("compliance_check_error"),
          variant: "destructive"
        });
        
        // Reset the form state to allow user to try again
        setIsSubmitting(false);
        setComplianceResult(null);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-yellow-500";
      case "medium":
        return "text-orange-500";
      case "high":
        return "text-red-500";
      default:
        return "text-neutral-500";
    }
  };

  const getComplianceStatus = () => {
    if (!complianceResult) return null;
    
    switch (complianceResult.status) {
      case "compliant":
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-medium">{t("fully_compliant")}</span>
          </div>
        );
      case "needs_attention":
        return (
          <div className="flex items-center space-x-2 text-orange-500">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{t("needs_attention")}</span>
          </div>
        );
      case "non_compliant":
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">{t("non_compliant")}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="container py-6 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">{t("compliance_checker")}</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-8">
          {t("compliance_checker_description")}
        </p>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="check-compliance">{t("check_compliance")}</TabsTrigger>
            <TabsTrigger value="compliance-history">{t("compliance_history")}</TabsTrigger>
          </TabsList>

          <TabsContent value="check-compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("business_compliance_check")}</CardTitle>
                <CardDescription>
                  {t("compliance_form_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {complianceResult ? (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-medium mb-1">{t("compliance_score")}</h3>
                        <div className="flex items-center">
                          {getComplianceStatus()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-primary">{complianceResult.score}%</div>
                        <Progress value={complianceResult.score} className="w-24" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-red-600 dark:text-red-400">{t("compliance_issues")}</h3>
                      {complianceResult.issues.map((issue: any, index: number) => (
                        <div key={`issue-${index}`} className="border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className={`h-5 w-5 ${getSeverityColor(issue.severity)}`} />
                            <span className="font-medium">{issue.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                              issue.severity === 'high' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                : issue.severity === 'medium'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            }`}>
                              {t(`severity_${issue.severity}`)}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{issue.description}</p>
                          <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-blue-800 dark:text-blue-300">
                            <span className="font-medium">{t("recommendation")}: </span>
                            {issue.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-green-600 dark:text-green-400">{t("compliant_areas")}</h3>
                      {complianceResult.compliant.map((item: any, index: number) => (
                        <div key={`compliant-${index}`} className="border border-green-200 dark:border-green-900/30 rounded-md p-4 bg-green-50 dark:bg-green-900/20">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-green-800 dark:text-green-300">{item.title}</span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-300">{item.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Button 
                        onClick={() => {
                          setComplianceResult(null);
                          setBusinessType("");
                          setJurisdiction("");
                          setDescription("");
                          setUploadedFiles([]);
                        }}
                      >
                        {t("check_another_business")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("business_type")}</label>
                      <Select 
                        value={businessType} 
                        onValueChange={setBusinessType}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_business_type")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sole_proprietorship">{t("sole_proprietorship")}</SelectItem>
                          <SelectItem value="corporation">{t("corporation")}</SelectItem>
                          <SelectItem value="partnership">{t("partnership")}</SelectItem>
                          <SelectItem value="non_profit">{t("non_profit")}</SelectItem>
                          <SelectItem value="ecommerce">{t("ecommerce")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("jurisdiction")}</label>
                      <Select 
                        value={jurisdiction} 
                        onValueChange={setJurisdiction}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("select_jurisdiction")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alberta">{t("alberta")}</SelectItem>
                          <SelectItem value="british_columbia">{t("british_columbia")}</SelectItem>
                          <SelectItem value="manitoba">{t("manitoba")}</SelectItem>
                          <SelectItem value="new_brunswick">{t("new_brunswick")}</SelectItem>
                          <SelectItem value="newfoundland">{t("newfoundland_and_labrador")}</SelectItem>
                          <SelectItem value="nova_scotia">{t("nova_scotia")}</SelectItem>
                          <SelectItem value="ontario">{t("ontario")}</SelectItem>
                          <SelectItem value="pei">{t("prince_edward_island")}</SelectItem>
                          <SelectItem value="quebec">{t("quebec")}</SelectItem>
                          <SelectItem value="saskatchewan">{t("saskatchewan")}</SelectItem>
                          <SelectItem value="federal">{t("federal")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("business_description")}</label>
                      <Textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t("business_description_placeholder")}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t("compliance_supporting_documents")}</label>
                      <Alert className="mb-3">
                        <FileText className="h-4 w-4" />
                        <AlertTitle>{t("acceptable_document_types")}</AlertTitle>
                        <AlertDescription>
                          <p>{t("acceptable_document_description")}</p>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                            <div>• PDF {t("documents")}</div>
                            <div>• Word (.doc, .docx)</div>
                            <div>• Excel (.xls, .xlsx)</div>
                            <div>• Text (.txt, .rtf)</div>
                            <div>• CSV {t("files")}</div>
                            <div>• JSON {t("files")}</div>
                            <div>• {t("images")} (.jpg, .png)</div>
                            <div>• {t("scans")} (.tiff, .gif, .bmp)</div>
                          </div>
                        </AlertDescription>
                      </Alert>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.json,.csv,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp,.rtf"
                        multiple
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        className="hidden"
                        id="document-upload"
                      />
                      <div 
                        className="border border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <p className="text-sm text-neutral-500 mb-2">{t("drag_drop_files")}</p>
                        <Button variant="outline" size="sm" type="button">
                          {t("compliance_browse_files")}
                        </Button>
                      </div>
                      
                      {/* Display uploaded files */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium">{t("uploaded_files")}</p>
                          <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 rounded p-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-neutral-500" />
                                  <span className="font-medium">{file.name}</span>
                                  <span className="text-neutral-500">({formatFileSize(file.size)})</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-4 w-4 text-neutral-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="pt-4">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("checking")}
                          </>
                        ) : (
                          t("check_compliance")
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance-history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("compliance_history")}</CardTitle>
                <CardDescription>
                  {t("compliance_history_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : historyError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500 opacity-50" />
                    <p className="text-red-600 dark:text-red-400">{t("error_loading_history")}</p>
                    <Button onClick={() => refetchHistory()} variant="outline" className="mt-4">
                      {t("retry")}
                    </Button>
                  </div>
                ) : complianceHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-blue-500 opacity-50" />
                    <p className="text-neutral-500">{t("no_compliance_checks")}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {complianceHistory.map((item) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-neutral-50 dark:bg-neutral-900 p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                          <div>
                            <h3 className="font-medium text-lg mb-1">
                              {t(item.businessType)} {t("in")} {t(item.jurisdiction)}
                            </h3>
                            <div className="flex items-center text-neutral-500 text-sm gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(item.createdAt), 'PPP')}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 md:mt-0 flex items-center gap-3">
                            <div className="font-bold text-2xl text-primary">{item.score}%</div>
                            <Progress value={item.score} className="w-24" />
                            <Badge 
                              className={
                                item.status === 'compliant' 
                                  ? 'bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                : item.status === 'needs_attention'
                                  ? 'bg-orange-100 hover:bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                  : 'bg-red-100 hover:bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }
                            >
                              {t(item.status)}
                            </Badge>
                          </div>
                        </div>
                        {item.description && (
                          <div className="p-4 border-t">
                            <p className="text-sm text-neutral-600 dark:text-neutral-300">
                              <span className="font-medium">{t("business_description")}: </span>
                              {item.description}
                            </p>
                          </div>
                        )}
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