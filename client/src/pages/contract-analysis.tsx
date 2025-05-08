import React, { useState, useEffect, useCallback, useRef } from "react";
import MainLayout from "../components/layout/MainLayout";
import { useTranslation } from "../hooks/use-translation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  FileCheck,
  FileDiff,
  FileSearch,
  FileText,
  FileUp,
  Lightbulb as LightbulbIcon,
  ListTodo,
  Loader2,
  Move,
  Printer,
  Save,
  Search,
  Share2,
  Tag,
  Upload,
  FileOutput
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";

// Type definitions
type AnalysisResult = {
  score: number;
  riskLevel: "low" | "medium" | "high";
  risks: {
    clause: string;
    issue: string;
    suggestion: string;
    severity: "low" | "medium" | "high";
    category?: string;
  }[];
  suggestions: {
    clause: string;
    suggestion: string;
    reason: string;
    category?: string;
  }[];
  summary: string;
  jurisdiction_issues?: {
    clause: string;
    issue: string;
    relevant_law?: string;
    recommendation: string;
  }[];
  clause_categories?: {
    payment?: string[];
    liability?: string[];
    termination?: string[];
    confidentiality?: string[];
    [key: string]: string[] | undefined;
  };
  extractedText?: string; // The full text extracted from uploaded PDF files
};

type ContractAnalysisData = {
  id: number;
  userId: number;
  title: string;
  fileName?: string; 
  analysisResults: AnalysisResult;
  createdAt: string;
  contractType: string;
  jurisdiction: string;
};

type ComparisonResult = {
  differences: {
    section: string;
    firstContractText: string;
    secondContractText: string;
    impact: string;
    recommendation: string;
  }[];
  summary: string;
};

// Helper functions
function getSeverityColor(severity: string) {
  switch (severity) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-amber-500';
    case 'low':
      return 'text-emerald-500';
    default:
      return '';
  }
}

export default function ContractAnalysisPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<string>("upload");
  
  // Upload form state
  const [contractText, setContractText] = useState<string>("");
  const [contractType, setContractType] = useState<string>("general");
  const [jurisdiction, setJurisdiction] = useState<string>("ontario");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  
  // Analysis state
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentSection, setCurrentSection] = useState<string>("summary");
  const [progressValue, setProgressValue] = useState<number>(25);
  const [title, setTitle] = useState<string>("");
  const [saveAnalysis, setSaveAnalysis] = useState<boolean>(false);
  
  // Comparison state
  const [firstContract, setFirstContract] = useState<File | null>(null);
  const [secondContract, setSecondContract] = useState<File | null>(null);
  const [firstContractName, setFirstContractName] = useState<string>("");
  const [secondContractName, setSecondContractName] = useState<string>("");
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  
  // Selected saved analysis
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);

  // Refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstContractInputRef = useRef<HTMLInputElement>(null);
  const secondContractInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved analyses
  const { data: savedAnalyses, isLoading: loadingSavedAnalyses } = useQuery<ContractAnalysisData[]>({
    queryKey: ['/api/contract-analyses'],
    enabled: !!user,
  });

  // Handle file upload change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setFileName(file.name);
    }
  };

  // Handle first contract file change for comparison
  const handleFirstContractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFirstContract(file);
      setFirstContractName(file.name);
    }
  };

  // Handle second contract file change for comparison
  const handleSecondContractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSecondContract(file);
      setSecondContractName(file.name);
    }
  };

  // Analyze contract mutation
  const analyzeContractMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/contract-analyses/analyze", null, {
        body: formData,
        headers: {
          // Don't set Content-Type here, browser will set it with boundary for FormData
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze contract");
      }
      
      return await response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    },
    onSuccess: (data: AnalysisResult) => {
      setIsUploading(false);
      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Your contract has been analyzed successfully.",
      });
    }
  });

  // Compare contracts mutation
  const compareContractsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/contract-analyses/compare", null, {
        body: formData,
        headers: {
          // Don't set Content-Type here, browser will set it with boundary for FormData
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to compare contracts");
      }
      
      return await response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Comparison Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    },
    onSuccess: (data: ComparisonResult) => {
      setIsUploading(false);
      setComparisonResult(data);
      setActiveTab("comparison-results");
      toast({
        title: "Comparison Complete",
        description: "The contracts have been compared successfully.",
      });
    }
  });

  // Save analysis mutation
  const saveAnalysisMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      contractContent: string;
      contractType: string;
      jurisdiction: string;
      analysisResults: AnalysisResult;
    }) => {
      const response = await apiRequest("POST", "/api/contract-analyses", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save analysis");
      }
      
      return await response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Saved",
        description: "Your analysis has been saved to history.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contract-analyses'] });
      setSaveAnalysis(true);
      setActiveTab("history");
    }
  });

  // Submit file for analysis
  const submitFileForAnalysis = async () => {
    if (!uploadedFile && !contractText) {
      toast({
        title: "No Input",
        description: "Please upload a file or enter contract text first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    
    if (uploadedFile) {
      formData.append("contract", uploadedFile);
    } else if (contractText) {
      // Create a blob from the text and append it as a file
      const textBlob = new Blob([contractText], { type: "text/plain" });
      formData.append("contract", textBlob, "contract.txt");
    }
    
    formData.append("contractType", contractType);
    formData.append("jurisdiction", jurisdiction);
    
    analyzeContractMutation.mutate(formData);
  };

  // Submit contracts for comparison
  const submitContractsForComparison = async () => {
    if (!firstContract || !secondContract) {
      toast({
        title: "Missing Input",
        description: "Please upload both contracts for comparison.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    
    formData.append("firstContract", firstContract);
    formData.append("secondContract", secondContract);
    formData.append("contractType", contractType);
    formData.append("jurisdiction", jurisdiction);
    
    compareContractsMutation.mutate(formData);
  };

  // Delete analysis mutation
  const deleteAnalysisMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/contract-analyses/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete analysis");
      }
      
      return await response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Deleted",
        description: "The analysis has been removed from your history.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contract-analyses'] });
      if (selectedAnalysisId) {
        setSelectedAnalysisId(null);
      }
    }
  });

  // Handle loading a saved analysis
  const loadSavedAnalysis = useCallback((analysisData: ContractAnalysisData) => {
    setSelectedAnalysisId(analysisData.id);
    setAnalysis(analysisData.analysisResults);
    setContractType(analysisData.contractType);
    setJurisdiction(analysisData.jurisdiction);
    setTitle(analysisData.title);
    setSaveAnalysis(true);
    setCurrentSection("summary");
    setProgressValue(25);
  }, []);

  // Scroll to top when changing tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("contract_analysis")}</h1>
            <p className="text-muted-foreground">
              {t("contract_analysis_description")}
            </p>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full md:w-[600px]">
            <TabsTrigger value="upload">{t("upload_analyze")}</TabsTrigger>
            <TabsTrigger value="compare">{t("compare_contracts")}</TabsTrigger>
            <TabsTrigger value="history">{t("saved_analyses")}</TabsTrigger>
          </TabsList>

          {/* Upload & Analyze Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("upload_contract")}</CardTitle>
                <CardDescription>
                  {t("upload_contract_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="file" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">{t("upload_file")}</TabsTrigger>
                    <TabsTrigger value="text">{t("paste_text")}</TabsTrigger>
                  </TabsList>
                  
                  {/* File Upload Tab */}
                  <TabsContent value="file" className="space-y-4 mt-4">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="contract-file">{t("Upload contract")}</Label>
                      <div 
                        className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          id="contract-file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                        
                        {uploadedFile ? (
                          <div className="flex flex-col items-center">
                            <FileText className="h-10 w-10 text-primary mb-2" />
                            <p className="font-medium">{fileName}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {Math.round(uploadedFile.size / 1024)} KB
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadedFile(null);
                                setFileName("");
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                            >
                              Replace file
                            </Button>
                          </div>
                        ) : (
                          <>
                            <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="font-medium">{t("drag_or_click")}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t("supported_formats")}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="contract-type">{t("Contract Type")}</Label>
                        <Select value={contractType} onValueChange={setContractType}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select contract type")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>{t("Contract Categories")}</SelectLabel>
                              <SelectItem value="general">{t("General Contract")}</SelectItem>
                              <SelectItem value="employment">{t("Employment")}</SelectItem>
                              <SelectItem value="real-estate">{t("Real Estate")}</SelectItem>
                              <SelectItem value="business">{t("Business Agreement")}</SelectItem>
                              <SelectItem value="nda">{t("Non-Disclosure")}</SelectItem>
                              <SelectItem value="license">{t("License Agreement")}</SelectItem>
                              <SelectItem value="services">{t("Service Agreement")}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="jurisdiction">{t("Jurisdiction")}</Label>
                        <Select value={jurisdiction} onValueChange={setJurisdiction}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select jurisdiction")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>{t("Canadian Provinces")}</SelectLabel>
                              <SelectItem value="ontario">{t("Ontario")}</SelectItem>
                              <SelectItem value="quebec">{t("Quebec")}</SelectItem>
                              <SelectItem value="bc">{t("British Columbia")}</SelectItem>
                              <SelectItem value="alberta">{t("Alberta")}</SelectItem>
                              <SelectItem value="manitoba">{t("Manitoba")}</SelectItem>
                              <SelectItem value="saskatchewan">{t("Saskatchewan")}</SelectItem>
                              <SelectItem value="ns">{t("Nova Scotia")}</SelectItem>
                              <SelectItem value="nb">{t("New Brunswick")}</SelectItem>
                              <SelectItem value="nl">{t("Newfoundland and Labrador")}</SelectItem>
                              <SelectItem value="pei">{t("Prince Edward Island")}</SelectItem>
                              <SelectItem value="federal">{t("Federal")}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={submitFileForAnalysis}
                      disabled={isUploading || !uploadedFile}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("analyzing_contract")}
                        </>
                      ) : (
                        <>
                          <FileSearch className="mr-2 h-4 w-4" />
                          {t("analyze_file")}
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  {/* Text Input Tab */}
                  <TabsContent value="text" className="space-y-4 mt-4">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="contract-text">{t("Paste contract text")}</Label>
                      <Textarea
                        id="contract-text"
                        placeholder={t("contract_text_placeholder")}
                        className="min-h-[300px]"
                        value={contractText}
                        onChange={(e) => setContractText(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="contract-type">{t("Contract Type")}</Label>
                        <Select value={contractType} onValueChange={setContractType}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select contract type")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>{t("Contract Categories")}</SelectLabel>
                              <SelectItem value="general">{t("General Contract")}</SelectItem>
                              <SelectItem value="employment">{t("Employment")}</SelectItem>
                              <SelectItem value="real-estate">{t("Real Estate")}</SelectItem>
                              <SelectItem value="business">{t("Business Agreement")}</SelectItem>
                              <SelectItem value="nda">{t("Non-Disclosure")}</SelectItem>
                              <SelectItem value="license">{t("License Agreement")}</SelectItem>
                              <SelectItem value="services">{t("Service Agreement")}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="jurisdiction">{t("Jurisdiction")}</Label>
                        <Select value={jurisdiction} onValueChange={setJurisdiction}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select jurisdiction")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>{t("Canadian Provinces")}</SelectLabel>
                              <SelectItem value="ontario">{t("Ontario")}</SelectItem>
                              <SelectItem value="quebec">{t("Quebec")}</SelectItem>
                              <SelectItem value="bc">{t("British Columbia")}</SelectItem>
                              <SelectItem value="alberta">{t("Alberta")}</SelectItem>
                              <SelectItem value="manitoba">{t("Manitoba")}</SelectItem>
                              <SelectItem value="saskatchewan">{t("Saskatchewan")}</SelectItem>
                              <SelectItem value="ns">{t("Nova Scotia")}</SelectItem>
                              <SelectItem value="nb">{t("New Brunswick")}</SelectItem>
                              <SelectItem value="nl">{t("Newfoundland and Labrador")}</SelectItem>
                              <SelectItem value="pei">{t("Prince Edward Island")}</SelectItem>
                              <SelectItem value="federal">{t("Federal")}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={submitFileForAnalysis}
                      disabled={isUploading || contractText.trim().length < 50}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("analyzing_contract")}
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          {t("analyze_text")}
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compare Contracts Tab */}
          <TabsContent value="compare" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("compare_contracts")}</CardTitle>
                <CardDescription>
                  {t("compare_contracts_description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Contract */}
                  <div className="space-y-2">
                    <Label>{t("First Contract")}</Label>
                    <div 
                      className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => firstContractInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFirstContractChange}
                        ref={firstContractInputRef}
                      />
                      
                      {firstContract ? (
                        <div className="flex flex-col items-center">
                          <FileText className="h-8 w-8 text-primary mb-2" />
                          <p className="font-medium text-sm">{firstContractName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(firstContract.size / 1024)} KB
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFirstContract(null);
                              setFirstContractName("");
                              if (firstContractInputRef.current) {
                                firstContractInputRef.current.value = "";
                              }
                            }}
                          >
                            Replace
                          </Button>
                        </div>
                      ) : (
                        <>
                          <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">{t("upload_first_contract")}</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Second Contract */}
                  <div className="space-y-2">
                    <Label>{t("Second Contract")}</Label>
                    <div 
                      className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => secondContractInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleSecondContractChange}
                        ref={secondContractInputRef}
                      />
                      
                      {secondContract ? (
                        <div className="flex flex-col items-center">
                          <FileText className="h-8 w-8 text-primary mb-2" />
                          <p className="font-medium text-sm">{secondContractName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(secondContract.size / 1024)} KB
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSecondContract(null);
                              setSecondContractName("");
                              if (secondContractInputRef.current) {
                                secondContractInputRef.current.value = "";
                              }
                            }}
                          >
                            Replace
                          </Button>
                        </div>
                      ) : (
                        <>
                          <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">{t("upload_second_contract")}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="contract-type-compare">{t("Contract Type")}</Label>
                    <Select value={contractType} onValueChange={setContractType}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select contract type")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>{t("Contract Categories")}</SelectLabel>
                          <SelectItem value="general">{t("General Contract")}</SelectItem>
                          <SelectItem value="employment">{t("Employment")}</SelectItem>
                          <SelectItem value="real-estate">{t("Real Estate")}</SelectItem>
                          <SelectItem value="business">{t("Business Agreement")}</SelectItem>
                          <SelectItem value="nda">{t("Non-Disclosure")}</SelectItem>
                          <SelectItem value="license">{t("License Agreement")}</SelectItem>
                          <SelectItem value="services">{t("Service Agreement")}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="jurisdiction-compare">{t("Jurisdiction")}</Label>
                    <Select value={jurisdiction} onValueChange={setJurisdiction}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select jurisdiction")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>{t("Canadian Provinces")}</SelectLabel>
                          <SelectItem value="ontario">{t("Ontario")}</SelectItem>
                          <SelectItem value="quebec">{t("Quebec")}</SelectItem>
                          <SelectItem value="bc">{t("British Columbia")}</SelectItem>
                          <SelectItem value="alberta">{t("Alberta")}</SelectItem>
                          <SelectItem value="manitoba">{t("Manitoba")}</SelectItem>
                          <SelectItem value="saskatchewan">{t("Saskatchewan")}</SelectItem>
                          <SelectItem value="ns">{t("Nova Scotia")}</SelectItem>
                          <SelectItem value="nb">{t("New Brunswick")}</SelectItem>
                          <SelectItem value="nl">{t("Newfoundland and Labrador")}</SelectItem>
                          <SelectItem value="pei">{t("Prince Edward Island")}</SelectItem>
                          <SelectItem value="federal">{t("Federal")}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={submitContractsForComparison}
                  disabled={isUploading || !firstContract || !secondContract}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("comparing_contracts")}
                    </>
                  ) : (
                    <>
                      <Move className="mr-2 h-4 w-4" />
                      {t("compare_contracts")}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Analysis History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("saved_analyses")}</CardTitle>
                <CardDescription>
                  {t("saved_analyses_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSavedAnalyses ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : savedAnalyses && savedAnalyses.length > 0 ? (
                  <div className="space-y-4">
                    {savedAnalyses.map((savedAnalysis) => (
                      <div 
                        key={savedAnalysis.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-accent ${
                          selectedAnalysisId === savedAnalysis.id ? 'bg-accent border-primary/50' : ''
                        }`}
                        onClick={() => loadSavedAnalysis(savedAnalysis)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{savedAnalysis.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span>{new Date(savedAnalysis.createdAt).toLocaleDateString()}</span>
                              <Separator orientation="vertical" className="h-4" />
                              <span className="capitalize">{savedAnalysis.contractType.replace('-', ' ')}</span>
                              <Separator orientation="vertical" className="h-4" />
                              <span className="capitalize">{savedAnalysis.jurisdiction.replace('-', ' ')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-full text-xs ${
                              savedAnalysis.analysisResults.riskLevel === 'high' 
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300' 
                                : savedAnalysis.analysisResults.riskLevel === 'medium' 
                                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300' 
                                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300'
                            }`}>
                              {savedAnalysis.analysisResults.riskLevel === 'high' 
                                ? 'High Risk' 
                                : savedAnalysis.analysisResults.riskLevel === 'medium' 
                                  ? 'Medium Risk' 
                                  : 'Low Risk'}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Are you sure you want to delete this analysis? This action cannot be undone.")) {
                                  deleteAnalysisMutation.mutate(savedAnalysis.id);
                                }
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </Button>
                          </div>
                        </div>
                        
                        {/* Brief summary preview */}
                        <div className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {savedAnalysis.analysisResults.summary}
                        </div>
                        
                        {/* Stats preview */}
                        <div className="flex gap-4 mt-3">
                          <div className="text-red-500 dark:text-red-400 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{savedAnalysis.analysisResults.risks.filter(r => r.severity === 'high').length} high risks</span>
                          </div>
                          <div className="text-amber-500 dark:text-amber-400 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{savedAnalysis.analysisResults.risks.filter(r => r.severity === 'medium').length} medium risks</span>
                          </div>
                          <div className="text-emerald-500 dark:text-emerald-400 text-sm flex items-center gap-1">
                            <LightbulbIcon className="h-3 w-3" />
                            <span>{savedAnalysis.analysisResults.suggestions.length} suggestions</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t("no_saved_analyses")}</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      {t("no_saved_analyses_description")}
                    </p>
                    <Button onClick={() => setActiveTab("upload")}>
                      <Upload className="mr-2 h-4 w-4" />
                      {t("upload_and_analyze")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Results Tab - Removed */}

          {/* Comparison Results Tab */}
          <TabsContent value="comparison-results" className="space-y-4">
            {comparisonResult && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("comparison_results")}</CardTitle>
                  <CardDescription>
                    {t("comparison_results_description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium text-lg mb-2">{t("comparison_summary")}</h3>
                    <p>{comparisonResult.summary}</p>
                  </div>
                  
                  <h3 className="font-medium text-lg">{t("key_differences")}</h3>
                  
                  <div className="space-y-4">
                    {comparisonResult.differences.map((diff, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <h4 className="font-medium mb-2">{diff.section}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
                            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">First Contract</p>
                            <p className="text-sm">{diff.firstContractText}</p>
                          </div>
                          
                          <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Second Contract</p>
                            <p className="text-sm">{diff.secondContractText}</p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md mb-3">
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Potential Impact</p>
                          <p className="text-sm">{diff.impact}</p>
                        </div>
                        
                        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                          <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Recommendation</p>
                          <p className="text-amber-700 dark:text-amber-300">{diff.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}