import { useState, useEffect, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, Upload, AlertTriangle, CheckCircle, FileText, Scale, FileDiff,
  File, Type, FileSearch, Search, FileQuestion, ChevronRight, Calendar as CalendarIcon,
  Circle, Tag, Download, Printer, Share2, Edit, Save, ListTodo, ArrowRight,
  ArrowLeft, FileOutput, FileCheck, ExternalLink, Copy, Edit2, History,
  Lightbulb as LightbulbIcon
} from "lucide-react";
import { t } from "@/lib/i18n";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [uploadType, setUploadType] = useState<string>("single");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [secondContractText, setSecondContractText] = useState("");
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jurisdiction, setJurisdiction] = useState<string>("Canada");
  const [contractType, setContractType] = useState<string>("general");
  const [title, setTitle] = useState<string>("");
  const [saveAnalysis, setSaveAnalysis] = useState<boolean>(true); // Default to save analysis
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [currentSection, setCurrentSection] = useState<string>("summary");
  const [progressValue, setProgressValue] = useState<number>(25);
  const [analysisStage, setAnalysisStage] = useState<string>("initial");
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  
  // State for search/filter functionality
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Safe accessor function to check for properties
  const getSeverityColor = (severity: string) => {
    if (!severity) return "";
    
    switch(severity.toLowerCase()) {
      case 'high':
        return "text-red-600 border-red-200";
      case 'medium':
        return "text-amber-600 border-amber-200";
      case 'low':
        return "text-emerald-600 border-emerald-200";
      default:
        return "text-gray-600 border-gray-200";
    }
  };
  
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
  
  // Save analysis mutation
  const saveAnalysisMutation = useMutation({
    mutationFn: async (params: {
      title: string;
      contractContent: string;
      jurisdiction: string;
      contractType: string;
      analysisResults: AnalysisResult;
    }) => {
      return await apiRequest("POST", "/api/contract-analyses", params);
    },
    onSuccess: () => {
      toast({
        title: "Analysis saved",
        description: "The analysis has been saved to your history."
      });
      // Refresh the history list
      queryClient.invalidateQueries({ queryKey: ["/api/contract-analyses"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save analysis",
        description: error.message || "An error occurred while saving the analysis.",
        variant: "destructive"
      });
    }
  });

  // Handle selected analysis data when it changes
  useEffect(() => {
    if (selectedAnalysisData) {
      // Ensure analysis data is properly set and then navigate to results tab
      const analysisData = selectedAnalysisData.analysisResults;
      setAnalysis(analysisData);
      
      // Make sure we reset the current section and progress for proper display
      setCurrentSection("summary");
      setProgressValue(25);
      
      // Use requestAnimationFrame for more reliable tab switching
      requestAnimationFrame(() => {
        console.log("Switching to results tab after loading selected analysis");
        setActiveTab("results");
      });
      
      console.log("Selected analysis loaded:", selectedAnalysisData.title);
    }
  }, [selectedAnalysisData]);
  
  // Effect to ensure results tab is shown when analysis is available
  useEffect(() => {
    // Only run this effect when analysis data becomes available
    if (analysis && activeTab !== "results") {
      console.log("Analysis data available but not on results tab - syncing tab state");
      
      // Use setTimeout for more reliable tab switching across browsers
      setTimeout(() => {
        console.log("Switching to results tab due to analysis data becoming available");
        setActiveTab("results");
        
        // Force DOM update to ensure tab content visibility
        requestAnimationFrame(() => {
          const resultTabElement = document.querySelector('[data-value="results"]');
          if (resultTabElement) {
            console.log("Results tab element found, ensuring visibility");
            (resultTabElement as HTMLElement).click();
          }
        });
      }, 200);
    }
  }, [analysis, activeTab]);
  
  // Setup Intersection Observer to track scroll position for progress bar
  useEffect(() => {
    if (!analysis) return;
    
    const sections = [
      { id: "summary-section", section: "summary", progress: 25 },
      { id: "risks-section", section: "risks", progress: 50 },
      { id: "suggestions-section", section: "suggestions", progress: 75 },
      { id: "next-steps-section", section: "next-steps", progress: 100 }
    ];
    
    const observers = sections.map(({id, section, progress}) => {
      const element = document.getElementById(id);
      if (!element) return null;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setCurrentSection(section);
            setProgressValue(progress);
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(element);
      return { element, observer };
    }).filter(Boolean);
    
    // Cleanup observers on unmount
    return () => {
      observers.forEach(item => {
        if (item && item.observer && item.element) {
          item.observer.unobserve(item.element);
        }
      });
    };
  }, [analysis]);

  // Analyze contract using text input
  const analyzeContractMutation = useMutation({
    mutationFn: async (params: {
      content: string;
      jurisdiction: string;
      contractType: string;
      save?: boolean;
      title?: string;
    }) => {
      // The apiRequest function already parses JSON 
      return await apiRequest("POST", "/api/analyze-contract", params);
    },
    onSuccess: (data: AnalysisResult) => {
      console.log("Text analysis completed successfully, preparing to switch to results tab");
      
      // First set the analysis data
      setAnalysis(data);
      
      // Reset current section and progress
      setCurrentSection("summary");
      setProgressValue(25);
      
      // Use requestAnimationFrame for more reliable tab switching
      requestAnimationFrame(() => {
        console.log("Switching to results tab");
        setActiveTab("results");
        
        // Force a second animation frame to ensure DOM update
        requestAnimationFrame(() => {
          const resultsTab = document.querySelector('[data-value="results"]');
          if (resultsTab) {
            (resultsTab as HTMLElement).click();
          }
        });
      });
      
      toast({
        title: "Analysis complete",
        description: "Contract analysis has been completed successfully.",
      });
      
      // Use a more reliable way to ensure state is updated before switching tabs
      // First update the analysis state, then in a separate effect, switch tabs
      requestAnimationFrame(() => {
        console.log("Switching to results tab");
        setActiveTab("results");
      });
      
      // Auto-save the analysis if the save checkbox is checked
      if (saveAnalysis && title) {
        console.log("Auto-saving analysis with title:", title);
        saveAnalysisMutation.mutate({
          title: title,
          contractContent: contractText,
          jurisdiction: jurisdiction,
          contractType: contractType,
          analysisResults: data
        });
      } else if (saveAnalysis && !title) {
        // Create a default title if none is provided
        const defaultTitle = `Contract Analysis - ${new Date().toLocaleDateString()}`;
        setTitle(defaultTitle);
        console.log("Auto-saving analysis with default title:", defaultTitle);
        saveAnalysisMutation.mutate({
          title: defaultTitle,
          contractContent: contractText,
          jurisdiction: jurisdiction,
          contractType: contractType,
          analysisResults: data
        });
      }
    },
    onError: (error: Error) => {
      // Check if this is a token limit error
      const isTokenLimitError = error.message && (
        error.message.includes("Token limit exceeded") ||
        error.message.includes("too large for analysis") ||
        error.message.includes("maximum context length") ||
        error.message.includes("document size limit")
      );
      
      toast({
        title: isTokenLimitError ? "Text Too Large" : "Analysis failed",
        description: error.message || "Failed to analyze contract. Please try again.",
        variant: "destructive",
        duration: isTokenLimitError ? 10000 : 5000, // Show token limit errors longer
      });
      
      if (isTokenLimitError) {
        // Show guidance for token limit errors
        toast({
          title: "What you can do",
          description: "Try analyzing a smaller portion of your contract text. Focus on the specific sections you need analyzed.",
          duration: 10000,
        });
      }
    },
  });

  // Analyze contract using file upload
  const analyzeFileContractMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log("Uploading file:", formData.get('contractFile'));
      console.log("File analysis parameters:", {
        jurisdiction: formData.get('jurisdiction'),
        contractType: formData.get('contractType'),
        save: formData.get('save'),
        title: formData.get('title')
      });
      
      try {
        const res = await fetch('/api/analyze-contract/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!res.ok) {
          // Try to parse error response, but handle case where it might not be JSON
          const text = await res.text();
          let errData: any = { message: "Failed to analyze contract file" };
          
          try {
            errData = JSON.parse(text);
          } catch (e) {
            console.error("Error response was not JSON:", text);
          }
          
          throw new Error(errData.message || `Failed with status ${res.status}`);
        }
        
        // Parse response as JSON
        try {
          return JSON.parse(await res.text());
        } catch (e) {
          console.error("Error parsing response:", e);
          throw new Error("Invalid response format from server");
        }
      } catch (error) {
        console.error("File upload error:", error);
        throw error;
      }
    },
    onSuccess: (data: AnalysisResult) => {
      console.log("File analysis completed successfully, preparing to switch to results tab");
      
      // Use only real data from API without any mock fallbacks
      setAnalysis(data);
      
      // Reset current section and progress
      setCurrentSection("summary");
      setProgressValue(25);
      
      toast({
        title: "File analysis complete",
        description: "Contract file analysis has been completed successfully.",
      });
      
      // Use requestAnimationFrame for more reliable tab switching
      requestAnimationFrame(() => {
        console.log("Switching to results tab after file analysis");
        setActiveTab("results");
      });
      
      // Extract content from analysis response if server provided it
      // The server now includes the extracted text in the response
      const extractedText = data.extractedText || "";
      
      console.log("Extracted text length:", extractedText.length);
      
      // Make sure we have content to save
      if (extractedText.length === 0) {
        console.warn("No extracted text was received from the server");
        toast({
          title: "Warning",
          description: "No text content was extracted from the file. The analysis result will not be saved.",
          variant: "destructive"
        });
        return;
      }
      
      // Auto-save the analysis if the save checkbox is checked
      if (saveAnalysis && title) {
        console.log("Auto-saving file analysis with title:", title);
        saveAnalysisMutation.mutate({
          title: title,
          contractContent: extractedText,
          jurisdiction: jurisdiction,
          contractType: contractType,
          // Remove extractedText from the analysis results to avoid duplication
          analysisResults: { ...data, extractedText: undefined }
        });
      } else if (saveAnalysis && !title && selectedFile) {
        // Create a default title from filename if none is provided
        const defaultTitle = selectedFile.name.replace(/\.[^/.]+$/, "") || `File Analysis - ${new Date().toLocaleDateString()}`;
        setTitle(defaultTitle);
        console.log("Auto-saving file analysis with default title:", defaultTitle);
        saveAnalysisMutation.mutate({
          title: defaultTitle,
          contractContent: extractedText,
          jurisdiction: jurisdiction,
          contractType: contractType,
          // Remove extractedText from the analysis results to avoid duplication  
          analysisResults: { ...data, extractedText: undefined }
        });
      }
    },
    onError: (error: Error) => {
      // Check if this is a token limit error
      const isTokenLimitError = error.message && (
        error.message.includes("Token limit exceeded") ||
        error.message.includes("too large for analysis") ||
        error.message.includes("maximum context length") ||
        error.message.includes("document size limit")
      );
      
      toast({
        title: isTokenLimitError ? "Document Size Limit Exceeded" : "File analysis failed",
        description: error.message || "Failed to analyze contract file. Please try again.",
        variant: "destructive",
        duration: isTokenLimitError ? 10000 : 5000, // Show token limit errors longer
      });
      
      if (isTokenLimitError) {
        // Show guidance for token limit errors
        toast({
          title: "What you can do",
          description: "Try uploading a smaller document or use the text input method to paste only the most important sections of your contract.",
          duration: 10000,
        });
      }
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
      console.log("Contract comparison completed successfully, preparing to switch tabs");
      
      setComparisonResult(data);
      toast({
        title: "Comparison complete",
        description: "Contract comparison has been completed successfully.",
      });
      
      // Use requestAnimationFrame for more reliable tab switching
      requestAnimationFrame(() => {
        console.log("Switching to comparison-results tab");
        setActiveTab("comparison-results");
      });
    },
    onError: (error: Error) => {
      // Check if this is a token limit error
      const isTokenLimitError = error.message && (
        error.message.includes("Token limit exceeded") ||
        error.message.includes("too large") ||
        error.message.includes("maximum context length") ||
        error.message.includes("document size limit")
      );
      
      toast({
        title: isTokenLimitError ? "Documents Too Large to Compare" : "Comparison failed",
        description: error.message || "Failed to compare contracts. Please try again.",
        variant: "destructive",
        duration: isTokenLimitError ? 10000 : 5000, // Show token limit errors longer
      });
      
      if (isTokenLimitError) {
        // Show guidance for token limit errors
        toast({
          title: "What you can do",
          description: "Try comparing smaller sections of your contracts instead of the entire documents. Focus on the specific clauses you want to compare.",
          duration: 10000,
        });
      }
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isSecondContract = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log("Selected file:", file.name, "Type:", file.type, "Size:", file.size);
    
    // Check if file is empty
    if (file.size === 0) {
      toast({
        title: "Empty file",
        description: "The selected file is empty. Please select a file with content.",
        variant: "destructive",
      });
      return;
    }
    
    // Warn about large files that may exceed token limits
    // 3MB is roughly the size that may approach token limits for plain text
    // PDF files would be even larger due to the conversion process
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 3) {
      toast({
        title: "Large file detected",
        description: "This file may exceed our token limits. The system will attempt to process it by extracting key sections.",
        variant: "destructive",
      });
    }
    
    // Get file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Set title from filename (remove extension)
    if (!isSecondContract) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
    
    // MIME type handling is now done on the server side
    // Just set the file as-is and let the server handle detection
    console.log(`File extension: ${fileExtension}, MIME type: ${file.type}, Size: ${file.size} (${fileSizeMB.toFixed(2)} MB)`);
    
    if (!isSecondContract) {
      setSelectedFile(file);
    }

    // For .txt files, read the content directly
    if (fileExtension === 'txt') {
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
    
    // Clear any existing analysis before starting a new one
    if (analysis) {
      console.log("Clearing previous analysis data before starting new analysis");
      setAnalysis(null);
    }
    
    // Set the current section to summary for when results are displayed
    setCurrentSection("summary");
    setProgressValue(25);
    
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
    
    // Clear any existing analysis before starting a new one
    if (analysis) {
      console.log("Clearing previous analysis data before starting file analysis");
      setAnalysis(null);
    }
    
    // Set the current section to summary for when results are displayed
    setCurrentSection("summary");
    setProgressValue(25);

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
    
    // Clear any existing comparison result before starting a new comparison
    if (comparisonResult) {
      console.log("Clearing previous comparison result before starting new comparison");
      setComparisonResult(null);
    }
    
    compareContractsMutation.mutate({ first: contractText, second: secondContractText });
  };

  // Function now defined earlier in the file
  
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
          onValueChange={(value) => {
            console.log(`Tab changed from ${activeTab} to ${value}`);
            setActiveTab(value);
          }}
          className="w-full"
          defaultValue="upload"
        >
          <TabsList className="grid grid-cols-3 gap-1">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              {t("Upload & Analyze")}
            </TabsTrigger>
            <TabsTrigger value="results">
              <FileText className="h-4 w-4 mr-2" />
              {t("Results")}
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              {t("History")}
            </TabsTrigger>
          </TabsList>
          
          {/* Debug helper - hidden in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-muted rounded-sm text-xs">
              <div>Current tab: <span className="font-mono">{activeTab}</span></div>
              <div>Analysis present: <span className="font-mono">{analysis ? 'Yes' : 'No'}</span></div>
              <div>Selected analysis ID: <span className="font-mono">{selectedAnalysisId || 'None'}</span></div>
            </div>
          )}

          {/* Upload & Analyze Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("Contract Analysis Tool")}</CardTitle>
                <CardDescription>
                  Our AI will analyze your contract for legal risks, provide recommendations for improvements, and ensure compliance with Canadian laws.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent p-4 rounded-lg mb-6">
                  <h3 className="font-medium flex items-center text-accent-foreground mb-2">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    How the Analysis Works
                  </h3>
                  <ol className="list-decimal ml-5 space-y-1 text-sm text-muted-foreground">
                    <li>Upload your contract (or paste its text)</li>
                    <li>Our AI performs a thorough analysis considering jurisdiction and contract type</li>
                    <li>You'll receive a comprehensive report with risk scores, improvement suggestions, and compliance assessment</li>
                  </ol>
                </div>
                
                <Tabs defaultValue="file" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file" onClick={() => setUploadType("single")}>
                      <File className="h-4 w-4 mr-2" />
                      {t("File Upload")}
                    </TabsTrigger>
                    <TabsTrigger value="text" onClick={() => setUploadType("single")}>
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
                      <p className="text-sm text-muted-foreground mb-2">
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
                      {getFilteredAnalyses().map((historyItem) => (
                        <div
                          key={historyItem.id}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            // Clear any previous analysis to avoid showing stale data
                            setAnalysis(null);
                            // Set the selected analysis ID which will trigger the useEffect
                            setSelectedAnalysisId(historyItem.id);
                            console.log(`Loading analysis ID: ${historyItem.id}, title: ${historyItem.title}`);
                            
                            // Important: Switch to results tab with a slight delay to ensure data loads properly
                            setTimeout(() => {
                              setActiveTab("results");
                            }, 300);
                          }}
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Risk score indicator */}
                            <div 
                              className={`p-4 md:p-6 flex flex-row md:flex-col items-center justify-center md:w-[120px] ${
                                historyItem.analysisResults.riskLevel === "high" 
                                  ? "bg-red-50 text-red-600" 
                                  : historyItem.analysisResults.riskLevel === "medium"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-emerald-50 text-emerald-600"
                              }`}
                            >
                              <div className="text-3xl font-bold">{historyItem.analysisResults.score}</div>
                              <div className="text-sm ml-2 md:ml-0 md:mt-1 font-medium">
                                {historyItem.analysisResults.riskLevel.toUpperCase()}
                              </div>
                            </div>
                            
                            {/* Contract details */}
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start">
                                <h4 className="text-lg font-semibold">{historyItem.title}</h4>
                                <Badge>{historyItem.contractType}</Badge>
                              </div>
                              
                              <div className="mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                  <span>{new Date(historyItem.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <Tag className="h-3.5 w-3.5 mr-1" />
                                  <span>{historyItem.jurisdiction}</span>
                                </div>
                              </div>
                              
                              {/* Summary preview */}
                              <div className="mt-3">
                                <p className="text-sm line-clamp-2">
                                  {historyItem.analysisResults.summary}
                                </p>
                              </div>
                              
                              {/* Risk indicators */}
                              <div className="mt-3 flex flex-wrap gap-1">
                                {historyItem.analysisResults.risks.slice(0, 3).map((risk, idx) => (
                                  <Badge key={idx} variant="outline" className={`${getSeverityColor(risk.severity)}`}>
                                    {risk.category || "General"}
                                  </Badge>
                                ))}
                                {historyItem.analysisResults.risks.length > 3 && (
                                  <Badge variant="outline">+{historyItem.analysisResults.risks.length - 3} more</Badge>
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
          <TabsContent 
            value="results" 
            className="space-y-6"
          >
            {analysis ? (
              <div key={`analysis-results-${Date.now()}`}>
                {/* Logging for debugging - key forces re-render when analysis changes */}
                {/* Analysis Progress & Action Bar */}
                <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 sticky top-0 z-10 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-primary" />
                      <span className="font-medium">Analysis Complete</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Printer className="h-4 w-4 mr-2" />
                              Print
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Print this analysis report</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download as PDF or Word document</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Add collaborator
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {!saveAnalysis && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Save className="h-4 w-4 mr-2" />
                              Save Analysis
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Save Analysis</DialogTitle>
                              <DialogDescription>
                                Save this analysis to your history for future reference.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="save-title" className="text-right">
                                  Title
                                </Label>
                                <Input
                                  id="save-title"
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                  className="col-span-3"
                                  placeholder="Enter a title for this analysis"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={saveAnalysisMutation.isPending}
                                onClick={() => {
                                  if (!analysis) return;
                                  
                                  saveAnalysisMutation.mutate({
                                    title: title || "Untitled Analysis",
                                    contractContent: contractText,
                                    jurisdiction: jurisdiction,
                                    contractType: contractType,
                                    analysisResults: analysis
                                  });
                                }}
                              >
                                {saveAnalysisMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  "Save"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                  
                  {/* Steps Progress */}
                  <div className="mt-6">
                    <div className="grid grid-cols-4 gap-2 mb-2 text-center text-xs">
                      <div className={currentSection === "summary" ? "text-primary font-medium" : ""}>Summary</div>
                      <div className={currentSection === "risks" ? "text-primary font-medium" : ""}>Risks</div>
                      <div className={currentSection === "suggestions" ? "text-primary font-medium" : ""}>Improvements</div>
                      <div className={currentSection === "next-steps" ? "text-primary font-medium" : ""}>Next Steps</div>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>
                </div>
                
                {/* Analysis Summary Card */}
                <Card id="summary-section">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{t("analysis_summary")}</CardTitle>
                        <CardDescription>
                          {t("overall_assessment")}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        const element = document.getElementById("risks-section");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                          setCurrentSection("risks");
                          setProgressValue(50);
                        }
                      }}>
                        View Risks
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center border-4 ${
                          analysis.score >= 80 ? "border-green-500 bg-green-50 text-green-700" :
                          analysis.score >= 60 ? "border-amber-500 bg-amber-50 text-amber-700" :
                          "border-red-500 bg-red-50 text-red-700"
                        }`}>
                          <span className="text-xl font-bold">{analysis.score}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-lg font-medium">{t("Contract Score")}</div>
                          <div className="text-sm text-muted-foreground">of 100 possible points</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {analysis.riskLevel === "high" && <AlertTriangle className="text-red-500 mr-2 h-5 w-5" />}
                        {analysis.riskLevel === "medium" && <AlertTriangle className="text-amber-500 mr-2 h-5 w-5" />}
                        {analysis.riskLevel === "low" && <CheckCircle className="text-emerald-500 mr-2 h-5 w-5" />}
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
                    
                    {/* Key Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
                        <h4 className="font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          High Risk Issues
                        </h4>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                          {analysis.risks.filter(r => r.severity === 'high').length}
                        </p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                        <h4 className="font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Medium Risk Issues
                        </h4>
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                          {analysis.risks.filter(r => r.severity === 'medium').length}
                        </p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-md">
                        <h4 className="font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Improvement Suggestions
                        </h4>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                          {analysis.suggestions.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("upload")}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Upload
                    </Button>
                    <Button variant="default" size="sm" onClick={() => {
                      const element = document.getElementById("risks-section");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                        setCurrentSection("risks");
                        setProgressValue(50);
                      }
                    }}>
                      Continue to Risks
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Risks Card */}
                <Card id="risks-section">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{t("contract_risks")}</CardTitle>
                        <CardDescription>
                          {t("potential_issues")}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        const element = document.getElementById("suggestions-section");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }}>
                        View Suggestions
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
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
                          <div key={index} className={`border-l-4 ${
                            risk.severity === 'high' ? 'border-l-red-500' : 
                            risk.severity === 'medium' ? 'border-l-amber-500' : 
                            'border-l-emerald-500'
                          } rounded-md p-4 shadow-sm bg-card`}>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <AlertTriangle className={`h-5 w-5 ${getSeverityColor(risk.severity)}`} />
                              <span className={`font-medium ${getSeverityColor(risk.severity)}`}>
                                {risk.severity === 'high' ? 'Critical Issue' : 
                                 risk.severity === 'medium' ? 'Moderate Risk' : 
                                 'Minor Concern'}
                              </span>
                              
                              {/* Confidence Indicator */}
                              <div className="ml-auto flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">AI Confidence:</span>
                                <div className="flex gap-0.5">
                                  <div className={`h-2 w-2 rounded-full ${risk.severity === 'high' ? 'bg-red-500' : 'bg-muted'}`}></div>
                                  <div className={`h-2 w-2 rounded-full ${
                                    risk.severity === 'high' || risk.severity === 'medium' ? 
                                    (risk.severity === 'high' ? 'bg-red-500' : 'bg-amber-500') : 'bg-muted'
                                  }`}></div>
                                  <div className={`h-2 w-2 rounded-full ${
                                    risk.severity === 'high' ? 'bg-red-500' : 
                                    risk.severity === 'medium' ? 'bg-amber-500' : 
                                    'bg-emerald-500'
                                  }`}></div>
                                </div>
                                
                                {risk.category && (
                                  <Badge variant="outline" className="ml-2">
                                    {risk.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-4 gap-4">
                              {/* Clause */}
                              <div className="md:col-span-2">
                                <h4 className="font-medium mb-1 flex items-center text-sm">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Problematic Clause
                                </h4>
                                <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap border border-muted">
                                  {risk.clause}
                                </div>
                              </div>
                              
                              {/* Issue */}
                              <div>
                                <h4 className="font-medium mb-1 flex items-center text-sm">
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Legal Issue
                                </h4>
                                <div className="p-3 text-sm border rounded">
                                  {risk.issue}
                                </div>
                              </div>
                              
                              {/* Suggestion */}
                              <div>
                                <h4 className="font-medium mb-1 flex items-center text-sm">
                                  <FileCheck className="h-4 w-4 mr-1" />
                                  Recommended Fix
                                </h4>
                                <div className={`p-3 text-sm border rounded ${
                                  risk.severity === 'high' ? 'bg-red-50 border-red-100 text-red-700' : 
                                  risk.severity === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-700' : 
                                  'bg-emerald-50 border-emerald-100 text-emerald-700'
                                }`}>
                                  {risk.suggestion}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Summary
                    </Button>
                    <Button variant="default" size="sm" onClick={() => {
                      const element = document.getElementById("suggestions-section");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                        setCurrentSection("suggestions");
                        setProgressValue(75);
                      }
                    }}>
                      Continue to Suggestions
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Suggestions Card */}
                <Card id="suggestions-section">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{t("contract_suggestions")}</CardTitle>
                        <CardDescription>
                          {t("improvement_recommendations")}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        const element = document.getElementById("next-steps-section");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }}>
                        View Next Steps
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
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
                            <div className="flex items-center gap-2 mb-2">
                              <FileCheck className="h-5 w-5 text-emerald-500" />
                              <span className="font-medium">Improvement #{index + 1}</span>
                              {suggestion.category && (
                                <Badge variant="outline" className="ml-auto">
                                  {suggestion.category}
                                </Badge>
                              )}
                            </div>
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
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => {
                      const element = document.getElementById("risks-section");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Risks
                    </Button>
                    <Button variant="default" size="sm" onClick={() => {
                      const element = document.getElementById("next-steps-section");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                        setCurrentSection("next-steps");
                        setProgressValue(100);
                      }
                    }}>
                      Continue to Next Steps
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Next Steps Card */}
                <Card id="next-steps-section">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Next Steps</CardTitle>
                        <CardDescription>
                          Recommended actions based on your contract analysis
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Progress indicators */}
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-medium">Contract Analysis Progress</div>
                        <div className="text-sm text-muted-foreground">4 of 4 steps completed</div>
                      </div>
                      
                      <div>
                        <Progress value={100} className="h-2 mb-2" />
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="text-muted-foreground">Summary</div>
                          <div className="text-muted-foreground">Risks</div>
                          <div className="text-muted-foreground">Improvements</div>
                          <div className="text-primary font-medium">Next Steps</div>
                        </div>
                      </div>

                      {/* Recommended actions list */}
                      <div className="rounded-lg border bg-card text-card-foreground">
                        <div className="p-6 flex flex-col gap-4">
                          <h3 className="text-lg font-semibold">Recommended Actions</h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10">
                                <Edit className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <div className="font-medium">Review and Edit Contract</div>
                                <p className="text-sm text-muted-foreground">
                                  Implement the suggested changes to address the identified risks and improve your contract.
                                </p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit Contract
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10">
                                <FileOutput className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <div className="font-medium">Export Analysis Report</div>
                                <p className="text-sm text-muted-foreground">
                                  Download a detailed report of the analysis for your records or to share with colleagues.
                                </p>
                                <div className="flex gap-2 mt-2">
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    PDF
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Word
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10">
                                <Save className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <div className="font-medium">Save Analysis for Later</div>
                                <p className="text-sm text-muted-foreground">
                                  Save this analysis to your account for future reference or continued work.
                                </p>
                                <Button variant="outline" size="sm" className="mt-2">
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Analysis
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10">
                                <FileDiff className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <div className="font-medium">Compare with Another Contract</div>
                                <p className="text-sm text-muted-foreground">
                                  Compare this contract with another version or a template to see key differences.
                                </p>
                                <Button variant="outline" size="sm" className="mt-2" onClick={() => setActiveTab("compare")}>
                                  <FileDiff className="h-4 w-4 mr-2" />
                                  Start Comparison
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional services */}
                      <div className="rounded-lg border bg-card text-card-foreground">
                        <div className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Additional Services</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border rounded-md p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <span className="font-medium">Document Generation</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                Create new legal documents based on the lessons learned from this analysis.
                              </p>
                              <Button variant="secondary" size="sm">
                                Create New Document
                              </Button>
                            </div>
                            <div className="border rounded-md p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <ListTodo className="h-5 w-5 text-primary" />
                                <span className="font-medium">Compliance Check</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                Verify if your contract meets all compliance requirements for your industry.
                              </p>
                              <Button variant="secondary" size="sm">
                                Run Compliance Check
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => {
                      const element = document.getElementById("suggestions-section");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Suggestions
                    </Button>
                    <Button variant="default" size="sm" onClick={() => {
                      // Logic to finish and return to upload
                      setActiveTab("upload");
                      toast({
                        title: "Analysis workflow complete",
                        description: "Your contract analysis workflow has been completed successfully."
                      });
                    }}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Finish
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t("No Analysis Results")}</CardTitle>
                  <CardDescription>
                    Upload a contract and analyze it to see results here
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <FileSearch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="mb-6 text-muted-foreground max-w-md mx-auto">
                    To view analysis results, first upload a contract document or paste contract text in the Upload & Analyze tab.
                  </p>
                  <Button onClick={() => setActiveTab("upload")}>
                    <Upload className="h-4 w-4 mr-2" />
                    Go to Upload & Analyze
                  </Button>
                </CardContent>
              </Card>
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