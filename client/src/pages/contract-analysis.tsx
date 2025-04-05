import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, AlertTriangle, CheckCircle, FileText, Scale, FileDiff } from "lucide-react";
import { t } from "@/lib/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type AnalysisResult = {
  score: number;
  riskLevel: "low" | "medium" | "high";
  risks: {
    clause: string;
    issue: string;
    suggestion: string;
    severity: "low" | "medium" | "high";
  }[];
  suggestions: {
    clause: string;
    suggestion: string;
    reason: string;
  }[];
  summary: string;
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

  const analyzeContractMutation = useMutation({
    mutationFn: async (contractText: string) => {
      const res = await apiRequest("POST", "/api/analyze-contract", { content: contractText });
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
    analyzeContractMutation.mutate(contractText);
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
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              {t("upload")}
            </TabsTrigger>
            <TabsTrigger value="compare">
              <FileDiff className="h-4 w-4 mr-2" />
              {t("compare")}
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

                <div className="grid w-full gap-1.5">
                  <Label htmlFor="contract-text">{t("Or paste contract text")}</Label>
                  <Textarea
                    id="contract-text"
                    placeholder={t("Paste your contract text here...")}
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    className="min-h-[300px]"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={analyzeContractMutation.isPending || !contractText.trim()}
                  className="ml-auto"
                >
                  {analyzeContractMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("analyzing")}
                    </>
                  ) : (
                    <>
                      {t("analyze_contract")}
                    </>
                  )}
                </Button>
              </CardFooter>
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