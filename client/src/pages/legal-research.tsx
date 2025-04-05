import MainLayout from "@/components/layout/MainLayout";
import SearchInterface from "@/components/legal-research/SearchInterface";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { analyzeContract } from "@/lib/openai";

function LegalResearchPage() {
  const [contractText, setContractText] = useState("");
  const [analysis, setAnalysis] = useState<{
    risks: { description: string; severity: string; recommendation: string }[];
    suggestions: { clause: string; improvement: string }[];
    summary: string;
  } | null>(null);
  
  // Contract analysis mutation
  const { mutate: analyzeContractMutation, isPending } = useMutation({
    mutationFn: () => analyzeContract(contractText),
    onSuccess: (data) => {
      setAnalysis(data);
    },
    onError: () => {
      setAnalysis(null);
    },
  });
  
  const handleAnalyzeContract = () => {
    if (!contractText.trim() || isPending) return;
    analyzeContractMutation();
  };
  
  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-8">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-semibold">
            {t("research_title")}
          </h1>
          <p className="text-neutral-600 mt-1">
            {t("research_subtitle")}
          </p>
        </div>
        
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Legal Research</TabsTrigger>
            <TabsTrigger value="contract">Contract Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-4">
            <SearchInterface />
          </TabsContent>
          
          <TabsContent value="contract" className="mt-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("contract_analysis")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={t("paste_contract")}
                    className="min-h-32 resize-none"
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAnalyzeContract}
                      disabled={!contractText.trim() || isPending}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      {isPending ? (
                        <>
                          <span className="material-icons animate-spin mr-2">sync</span>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <span className="material-icons mr-2">analytics</span>
                          {t("analyze_contract")}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {analysis && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("contract_summary")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-700">{analysis.summary}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("contract_risks")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysis.risks.length > 0 ? (
                        <div className="space-y-4">
                          {analysis.risks.map((risk, index) => (
                            <div key={index} className="p-3 border rounded-lg bg-white">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium">{risk.description}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(risk.severity)}`}>
                                  {risk.severity} Risk
                                </span>
                              </div>
                              <p className="text-sm text-neutral-600 mt-2">{risk.recommendation}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-neutral-500 text-center py-4">No risks identified</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("contract_suggestions")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysis.suggestions.length > 0 ? (
                        <div className="space-y-4">
                          {analysis.suggestions.map((suggestion, index) => (
                            <div key={index} className="p-3 border rounded-lg bg-white">
                              <h3 className="font-medium text-primary">{suggestion.clause}</h3>
                              <p className="text-sm text-neutral-600 mt-2">{suggestion.improvement}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-neutral-500 text-center py-4">No suggestions available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default LegalResearchPage;
