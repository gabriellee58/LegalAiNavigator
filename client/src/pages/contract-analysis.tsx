import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Upload, AlertTriangle, CheckCircle, FileText, Scale, FileDiff,
  File, Type, FileSearch, Search, FileQuestion, ChevronRight, Calendar as CalendarIcon,
  Circle, Tag
} from "lucide-react";
import { t } from "@/lib/i18n";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
};

// Type for the specific analysis data returned from the API
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

export default function ContractAnalysisPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contractText, setContractText] = useState("");
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [secondContractText, setSecondContractText] = useState("");
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jurisdiction, setJurisdiction] = useState<string>("Canada");
  const [contractType, setContractType] = useState<string>("general");
  const [title, setTitle] = useState<string>("");
  const [saveAnalysis, setSaveAnalysis] = useState<boolean>(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  
  // State for search/filter functionality
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Fetch saved analyses
  const { data: savedAnalyses = [], isLoading: isLoadingAnalyses } = useQuery<ContractAnalysisData[]>({
    queryKey: ["/api/contract-analyses"],
    enabled: !!user,
  });
  
  // Fetch a specific analysis when selected
  const { data: selectedAnalysisData, isLoading: isLoadingSelectedAnalysis } = useQuery<ContractAnalysisData>({
    queryKey: ["/api/contract-analyses", selectedAnalysisId],
    enabled: !!selectedAnalysisId,
  });

  // Handle selected analysis data when it changes
  useEffect(() => {
    if (selectedAnalysisData) {
      setAnalysis(selectedAnalysisData.analysisResults);
      setActiveTab("results");
    }
  }, [selectedAnalysisData]);

  // Analyze contract using text input
  const analyzeContractMutation = useMutation({
    mutationFn: async (params: {
      content: string;
      jurisdiction: string;
      contractType: string;
      save?: boolean;
      title?: string;
    }) => {
      const res = await apiRequest("POST", "/api/analyze-contract", params);
      return res.json();
    },
    onSuccess: (data: AnalysisResult) => {
      setAnalysis(data);
      toast({
        title: "Analysis complete",
        description: "Contract analysis has been completed successfully.",
      });
      setActiveTab("results");
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Analyze contract using file upload
  const analyzeFileContractMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('/api/analyze-contract/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to analyze contract file");
      }
      
      return res.json();
    },
    onSuccess: (data: AnalysisResult) => {
      setAnalysis(data);
      toast({
        title: "File analysis complete",
        description: "Contract file analysis has been completed successfully.",
      });
      setActiveTab("results");
    },
    onError: (error: Error) => {
      toast({
        title: "File analysis failed",
        description: error.message || "Failed to analyze contract file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const compareContractsMutation = useMutation({
    mutationFn: async ({ first, second }: { first: string; second: string }) => {
      const res = await apiRequest("POST", "/api/compare-contracts", { 
        firstContract: first, 
        secondContract: second 
      });
      return res.json();
    },
    onSuccess: (data) => {
      setComparisonResult(data);
      toast({
        title: "Comparison complete",
        description: "Contract comparison has been completed successfully.",
      });
      setActiveTab("comparison-results");
    },
    onError: (error: Error) => {
      toast({
        title: "Comparison failed",
        description: error.message || "Failed to compare contracts. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isSecondContract = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSecondContract) {
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    // For .txt files, read the content directly
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (isSecondContract) {
          setSecondContractText(text);
        } else {
          setContractText(text);
        }
      };
      reader.readAsText(file);
    } else {
      // For other file types like PDF, we'll just set the file for upload
      // The server will handle the text extraction
      if (isSecondContract) {
        // If it's a second contract and not a text file, show a message
        toast({
          title: "File type notice",
          description: "File content preview is only available for .txt files. Other file types will be processed on the server.",
        });
      }
    }
  };

  const handleAnalyze = () => {
    if (!contractText.trim()) {
      toast({
        title: "Empty contract",
        description: "Please enter or upload contract text to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    analyzeContractMutation.mutate({
      content: contractText,
      jurisdiction: jurisdiction,
      contractType: contractType,
      save: saveAnalysis,
      title: title || `Contract Analysis ${new Date().toLocaleDateString()}`
    });
  };

  const handleFileAnalyze = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to analyze.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('contractFile', selectedFile);
    formData.append('jurisdiction', jurisdiction);
    formData.append('contractType', contractType);
    formData.append('save', saveAnalysis.toString());
    formData.append('title', title || selectedFile.name || `Contract Analysis ${new Date().toLocaleDateString()}`);

    analyzeFileContractMutation.mutate(formData);
  };

  const handleCompare = () => {
    if (!contractText.trim() || !secondContractText.trim()) {
      toast({
        title: "Missing contracts",
        description: "Please enter or upload both contracts to compare.",
        variant: "destructive",
      });
      return;
    }
    compareContractsMutation.mutate({ first: contractText, second: secondContractText });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-emerald-500";
      default:
        return "text-slate-500";
    }
  };
  
  // Function to filter analyses based on search term and type filter
  const getFilteredAnalyses = () => {
    if (!savedAnalyses) return [];
    
    return savedAnalyses
      .filter(analysis => {
        // Filter by search term (title, contract type or jurisdiction)
        const searchMatch = searchTerm === "" || 
          analysis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          analysis.contractType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          analysis.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase());
          
        // Filter by contract type
        const typeMatch = typeFilter === "all" || analysis.contractType === typeFilter;
        
        return searchMatch && typeMatch;
      })
      .sort((a, b) => {
        // Sort by date
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        
        if (sortBy === "newest") {
          return dateB - dateA;
        } else if (sortBy === "oldest") {
          return dateA - dateB;
        } else if (sortBy === "title") {
          // Sort alphabetically by title
          return a.title.localeCompare(b.title);
        } else if (sortBy === "risk") {
          // Sort by risk level (high to low)
          const riskLevels = { high: 3, medium: 2, low: 1 };
          return (riskLevels[b.analysisResults.riskLevel as keyof typeof riskLevels] || 0) - 
                 (riskLevels[a.analysisResults.riskLevel as keyof typeof riskLevels] || 0);
        }
        
        return 0;
      });
  };
  
  // Get unique contract types for filter dropdown
  const getUniqueContractTypes = () => {
    if (!savedAnalyses) return [];
    
    const types = new Set<string>();
    savedAnalyses.forEach(analysis => {
      if (analysis.contractType) {
        types.add(analysis.contractType);
      }
    });
    
    return Array.from(types);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t("contract_analysis")}</h1>
            <p className="text-muted-foreground">
              {t("upload_analyze_description")}
            </p>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              {t("upload")}
            </TabsTrigger>
            <TabsTrigger value="compare">
              <FileDiff className="h-4 w-4 mr-2" />
              {t("compare")}
            </TabsTrigger>
            <TabsTrigger value="history">
              <Search className="h-4 w-4 mr-2" />
              {t("history")}
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!analysis}>
              <FileText className="h-4 w-4 mr-2" />
              {t("results")}
            </TabsTrigger>
            <TabsTrigger value="comparison-results" disabled={!comparisonResult}>
              <Scale className="h-4 w-4 mr-2" />
              {t("comparison")}
            </TabsTrigger>
          </TabsList>

          {/* Upload & Analyze Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("upload_contract")}</CardTitle>
                <CardDescription>
                  {t("upload_subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="file" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">
                      <File className="h-4 w-4 mr-2" />
                      {t("File Upload")}
                    </TabsTrigger>
                    <TabsTrigger value="text">
                      <Type className="h-4 w-4 mr-2" />
                      {t("Text Input")}
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* File Upload Tab */}
                  <TabsContent value="file" className="space-y-4 mt-4">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="contract-upload">{t("Upload contract document")}</Label>
                      <input
                        id="contract-upload"
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="py-2"
                      />
                      <p className="text-sm text-muted-foreground">
                        {t("Supports .txt, .pdf, .doc, and .docx files")}
                      </p>
                    </div>
                    
                    {selectedFile && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {(selectedFile.size / 1024).toFixed(0)} KB
                        </Badge>
                      </div>
                    )}
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium mb-2">{t("Analysis Options")}</h4>
                      <div className="grid gap-4">
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor="contract-title">{t("Contract Title")}</Label>
                          <Input
                            id="contract-title"
                            placeholder={t("Enter a title for this analysis...")}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor="jurisdiction">{t("Jurisdiction")}</Label>
                          <Select value={jurisdiction} onValueChange={setJurisdiction}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select jurisdiction")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Canada">Canada (Federal)</SelectItem>
                              <SelectItem value="Alberta">Alberta</SelectItem>
                              <SelectItem value="British Columbia">British Columbia</SelectItem>
                              <SelectItem value="Manitoba">Manitoba</SelectItem>
                              <SelectItem value="New Brunswick">New Brunswick</SelectItem>
                              <SelectItem value="Newfoundland">Newfoundland and Labrador</SelectItem>
                              <SelectItem value="Nova Scotia">Nova Scotia</SelectItem>
                              <SelectItem value="Ontario">Ontario</SelectItem>
                              <SelectItem value="Prince Edward Island">Prince Edward Island</SelectItem>
                              <SelectItem value="Quebec">Quebec</SelectItem>
                              <SelectItem value="Saskatchewan">Saskatchewan</SelectItem>
                              <SelectItem value="Northwest Territories">Northwest Territories</SelectItem>
                              <SelectItem value="Nunavut">Nunavut</SelectItem>
                              <SelectItem value="Yukon">Yukon</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor="contract-type">{t("Contract Type")}</Label>
                          <Select value={contractType} onValueChange={setContractType}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select contract type")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Contract</SelectItem>
                              <SelectItem value="employment">Employment Contract</SelectItem>
                              <SelectItem value="service">Service Agreement</SelectItem>
                              <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                              <SelectItem value="lease">Lease Agreement</SelectItem>
                              <SelectItem value="sale">Sales Contract</SelectItem>
                              <SelectItem value="partnership">Partnership Agreement</SelectItem>
                              <SelectItem value="licensing">Licensing Agreement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="save-analysis" 
                            checked={saveAnalysis}
                            onCheckedChange={(checked) => setSaveAnalysis(checked === true)}
                          />
                          <Label htmlFor="save-analysis">
                            {t("Save analysis for future reference")}
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleFileAnalyze} 
                      disabled={analyzeFileContractMutation.isPending || !selectedFile}
                      className="w-full mt-2"
                    >
                      {analyzeFileContractMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("analyzing")}
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
                        placeholder={t("Paste your contract text here...")}
                        value={contractText}
                        onChange={(e) => setContractText(e.target.value)}
                        className="min-h-[200px]"
                      />
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium mb-2">{t("Analysis Options")}</h4>
                      <div className="grid gap-4">
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor="contract-title-text">{t("Contract Title")}</Label>
                          <Input
                            id="contract-title-text"
                            placeholder={t("Enter a title for this analysis...")}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor="jurisdiction-text">{t("Jurisdiction")}</Label>
                          <Select value={jurisdiction} onValueChange={setJurisdiction}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select jurisdiction")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Canada">Canada (Federal)</SelectItem>
                              <SelectItem value="Alberta">Alberta</SelectItem>
                              <SelectItem value="British Columbia">British Columbia</SelectItem>
                              <SelectItem value="Manitoba">Manitoba</SelectItem>
                              <SelectItem value="New Brunswick">New Brunswick</SelectItem>
                              <SelectItem value="Newfoundland">Newfoundland and Labrador</SelectItem>
                              <SelectItem value="Nova Scotia">Nova Scotia</SelectItem>
                              <SelectItem value="Ontario">Ontario</SelectItem>
                              <SelectItem value="Prince Edward Island">Prince Edward Island</SelectItem>
                              <SelectItem value="Quebec">Quebec</SelectItem>
                              <SelectItem value="Saskatchewan">Saskatchewan</SelectItem>
                              <SelectItem value="Northwest Territories">Northwest Territories</SelectItem>
                              <SelectItem value="Nunavut">Nunavut</SelectItem>
                              <SelectItem value="Yukon">Yukon</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid w-full gap-1.5">
                          <Label htmlFor="contract-type-text">{t("Contract Type")}</Label>
                          <Select value={contractType} onValueChange={setContractType}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select contract type")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Contract</SelectItem>
                              <SelectItem value="employment">Employment Contract</SelectItem>
                              <SelectItem value="service">Service Agreement</SelectItem>
                              <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                              <SelectItem value="lease">Lease Agreement</SelectItem>
                              <SelectItem value="sale">Sales Contract</SelectItem>
                              <SelectItem value="partnership">Partnership Agreement</SelectItem>
                              <SelectItem value="licensing">Licensing Agreement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="save-analysis-text" 
                            checked={saveAnalysis}
                            onCheckedChange={(checked) => setSaveAnalysis(checked === true)}
                          />
                          <Label htmlFor="save-analysis-text">
                            {t("Save analysis for future reference")}
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={analyzeContractMutation.isPending || !contractText.trim()}
                      className="w-full mt-2"
                    >
                      {analyzeContractMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("analyzing")}
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
                  {t("compare_subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Contract */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("First Contract")}</h3>
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="first-contract-upload">{t("Upload contract")}</Label>
                      <input
                        id="first-contract-upload"
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e)}
                        className="py-2"
                      />
                    </div>
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="first-contract-text">{t("Or paste text")}</Label>
                      <Textarea
                        id="first-contract-text"
                        placeholder={t("Paste your first contract text here...")}
                        value={contractText}
                        onChange={(e) => setContractText(e.target.value)}
                        className="min-h-[200px]"
                      />
                    </div>
                  </div>

                  {/* Second Contract */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("Second Contract")}</h3>
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="second-contract-upload">{t("Upload contract")}</Label>
                      <input
                        id="second-contract-upload"
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, true)}
                        className="py-2"
                      />
                    </div>
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="second-contract-text">{t("Or paste text")}</Label>
                      <Textarea
                        id="second-contract-text"
                        placeholder={t("Paste your second contract text here...")}
                        value={secondContractText}
                        onChange={(e) => setSecondContractText(e.target.value)}
                        className="min-h-[200px]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleCompare} 
                  disabled={compareContractsMutation.isPending || !contractText.trim() || !secondContractText.trim()}
                  className="ml-auto"
                >
                  {compareContractsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("comparing")}
                    </>
                  ) : (
                    <>
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
                <CardTitle>{t("analysis_history")}</CardTitle>
                <CardDescription>
                  {t("previously_saved_analyses")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAnalyses ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : savedAnalyses.length === 0 ? (
                  <div className="text-center py-8">
                    <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">{t("no_saved_analyses")}</h3>
                    <p className="text-muted-foreground">
                      {t("save_analyses_message")}
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab("upload")}>
                      <Upload className="mr-2 h-4 w-4" />
                      {t("analyze_contract")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search and filter controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-1 md:col-span-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder={t("Search by title, contract type, or jurisdiction...")}
                            className="w-full pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Filter by type")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t("All Types")}</SelectItem>
                            {getUniqueContractTypes().map(type => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Sort by")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">{t("Newest First")}</SelectItem>
                            <SelectItem value="oldest">{t("Oldest First")}</SelectItem>
                            <SelectItem value="title">{t("Title A-Z")}</SelectItem>
                            <SelectItem value="risk">{t("Risk Level")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Analysis list with improved styling */}
                    <div className="mt-4 space-y-2">
                      {getFilteredAnalyses().map((analysis) => (
                        <div
                          key={analysis.id}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            setSelectedAnalysisId(analysis.id);
                            setActiveTab("results");
                          }}
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Risk score indicator */}
                            <div 
                              className={`p-4 md:p-6 flex flex-row md:flex-col items-center justify-center md:w-[120px] ${
                                analysis.analysisResults.riskLevel === "high" 
                                  ? "bg-red-50 text-red-600" 
                                  : analysis.analysisResults.riskLevel === "medium"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              <div className="text-3xl font-bold">{analysis.analysisResults.score}</div>
                              <div className="text-sm ml-2 md:ml-0 md:mt-1 font-medium">
                                {analysis.analysisResults.riskLevel.toUpperCase()}
                              </div>
                            </div>
                            
                            {/* Contract details */}
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start">
                                <h4 className="text-lg font-semibold">{analysis.title}</h4>
                                <Badge>{analysis.contractType}</Badge>
                              </div>
                              
                              <div className="mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                  <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <Tag className="h-3.5 w-3.5 mr-1" />
                                  <span>{analysis.jurisdiction}</span>
                                </div>
                              </div>
                              
                              {/* Summary preview */}
                              <div className="mt-3">
                                <p className="text-sm line-clamp-2">
                                  {analysis.analysisResults.summary}
                                </p>
                              </div>
                              
                              {/* Risk indicators */}
                              <div className="mt-3 flex flex-wrap gap-1">
                                {analysis.analysisResults.risks.slice(0, 3).map((risk, idx) => (
                                  <Badge key={idx} variant="outline" className={`${getSeverityColor(risk.severity)}`}>
                                    {risk.category || "General"}
                                  </Badge>
                                ))}
                                {analysis.analysisResults.risks.length > 3 && (
                                  <Badge variant="outline">+{analysis.analysisResults.risks.length - 3} more</Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* View button */}
                            <div className="flex items-center p-4 text-primary">
                              <ChevronRight className="h-6 w-6" />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {getFilteredAnalyses().length === 0 && (
                        <div className="text-center py-8">
                          <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <h3 className="text-lg font-medium mb-1">{t("no_matching_analyses")}</h3>
                          <p className="text-muted-foreground">
                            {t("try_adjusting_filters")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Results Tab */}
          <TabsContent value="results" className="space-y-4">
            {analysis && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("analysis_summary")}</CardTitle>
                    <CardDescription>
                      {t("overall_assessment")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-lg">
                        {t("risk_score")}:
                        <span 
                          className={`ml-2 font-bold ${
                            analysis.riskLevel === "high" 
                              ? "text-red-500" 
                              : analysis.riskLevel === "medium" 
                                ? "text-amber-500" 
                                : "text-emerald-500"
                          }`}
                        >
                          {analysis.score}/100
                        </span>
                      </div>
                      <div className="flex items-center">
                        {analysis.riskLevel === "high" && <AlertTriangle className="text-red-500 mr-2" />}
                        {analysis.riskLevel === "medium" && <AlertTriangle className="text-amber-500 mr-2" />}
                        {analysis.riskLevel === "low" && <CheckCircle className="text-emerald-500 mr-2" />}
                        <span className={`font-medium ${
                          analysis.riskLevel === "high" 
                            ? "text-red-500" 
                            : analysis.riskLevel === "medium" 
                              ? "text-amber-500" 
                              : "text-emerald-500"
                        }`}>
                          {t(`risk_severity_${analysis.riskLevel}`)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-md">
                      <p>{analysis.summary}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("contract_risks")}</CardTitle>
                    <CardDescription>
                      {t("potential_issues")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysis.risks.length === 0 ? (
                      <div className="p-4 bg-muted rounded-md text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p>{t("no_risks_found")}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {analysis.risks.map((risk, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className={`h-5 w-5 ${getSeverityColor(risk.severity)}`} />
                              <span className={`font-medium ${getSeverityColor(risk.severity)}`}>
                                {t(`risk_severity_${risk.severity}`)}
                              </span>
                            </div>
                            <h4 className="font-medium mb-1">{t("clause")}:</h4>
                            <p className="text-sm bg-muted p-2 rounded mb-2 whitespace-pre-wrap">
                              {risk.clause}
                            </p>
                            <h4 className="font-medium mb-1">{t("issue")}:</h4>
                            <p className="text-sm mb-2">{risk.issue}</p>
                            <h4 className="font-medium mb-1">{t("suggestion")}:</h4>
                            <p className="text-sm bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded text-emerald-700 dark:text-emerald-300">
                              {risk.suggestion}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("contract_suggestions")}</CardTitle>
                    <CardDescription>
                      {t("improvement_recommendations")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysis.suggestions.length === 0 ? (
                      <div className="p-4 bg-muted rounded-md text-center">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p>{t("no_suggestions")}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {analysis.suggestions.map((suggestion, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <h4 className="font-medium mb-1">{t("clause")}:</h4>
                            <p className="text-sm bg-muted p-2 rounded mb-2 whitespace-pre-wrap">
                              {suggestion.clause}
                            </p>
                            <h4 className="font-medium mb-1">{t("suggestion")}:</h4>
                            <p className="text-sm bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded text-emerald-700 dark:text-emerald-300 mb-2">
                              {suggestion.suggestion}
                            </p>
                            <h4 className="font-medium mb-1">{t("reason")}:</h4>
                            <p className="text-sm">{suggestion.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Comparison Results Tab */}
          <TabsContent value="comparison-results" className="space-y-4">
            {comparisonResult && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("contract_comparison")}</CardTitle>
                  <CardDescription>
                    {t("differences_between")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
                    <h3 className="text-lg font-medium mb-2">{t("summary")}</h3>
                    <p>{comparisonResult.summary}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t("key_differences")}</h3>
                    {comparisonResult.differences.map((diff: any, index: number) => (
                      <div key={index} className="border rounded-md p-4">
                        <h4 className="font-medium mb-2">{diff.section}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium mb-1">{t("first_contract")}:</h5>
                            <p className="text-sm bg-red-50 dark:bg-red-950/30 p-2 rounded text-red-700 dark:text-red-300">
                              {diff.first}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-1">{t("second_contract")}:</h5>
                            <p className="text-sm bg-green-50 dark:bg-green-950/30 p-2 rounded text-green-700 dark:text-green-300">
                              {diff.second}
                            </p>
                          </div>
                        </div>
                        {diff.impact && (
                          <div className="mt-2">
                            <h5 className="text-sm font-medium mb-1">{t("potential_impact")}:</h5>
                            <p className="text-sm">{diff.impact}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                    <h3 className="text-lg font-medium mb-2 text-amber-700 dark:text-amber-300">{t("recommendation")}</h3>
                    <p className="text-amber-700 dark:text-amber-300">{comparisonResult.recommendation}</p>
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