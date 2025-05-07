import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, AlertCircle, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function ContractAnalysisGuidePage() {
  const riskCategories = [
    {
      name: "High Risk",
      color: "bg-red-500",
      examples: [
        "Unlimited liability clauses",
        "Unreasonable indemnification terms",
        "Extremely restrictive non-compete clauses",
        "Absence of termination clauses"
      ]
    },
    {
      name: "Medium Risk",
      color: "bg-yellow-500",
      examples: [
        "Ambiguous renewal terms",
        "Vague payment schedules",
        "Inadequate confidentiality provisions",
        "One-sided amendment rights"
      ]
    },
    {
      name: "Low Risk",
      color: "bg-green-500",
      examples: [
        "Minor formatting inconsistencies",
        "Recommended but non-essential clauses",
        "Subjective language that could be clarified",
        "Non-critical typographical errors"
      ]
    }
  ];

  const contractTypes = [
    "Employment Contracts",
    "Service Agreements",
    "Non-Disclosure Agreements (NDAs)",
    "Partnership Agreements",
    "Sales Agreements",
    "Lease Agreements",
    "Licensing Agreements",
    "Distribution Agreements",
    "Loan Agreements",
    "Construction Contracts"
  ];

  const analysisSteps = [
    {
      title: "Upload or paste your contract",
      description: "Start by uploading your contract document or pasting the text.",
      details: "The Contract Analysis tool accepts various file formats including PDF, DOCX, and TXT. For best results, ensure that text is searchable/selectable in PDFs."
    },
    {
      title: "Select analysis parameters",
      description: "Choose the type of contract and specific analysis options.",
      details: "Specifying the contract type helps the AI apply the most relevant analysis rules. You can also select specific areas to focus on, such as liability clauses, termination conditions, or payment terms."
    },
    {
      title: "Review AI analysis results",
      description: "Examine the comprehensive analysis provided by our AI.",
      details: "The analysis breaks down the contract into sections and identifies potential issues, ambiguities, and favorable/unfavorable clauses. Each finding includes a risk level assessment and specific recommendations."
    },
    {
      title: "Export or implement recommendations",
      description: "Save the analysis report and implement suggested changes.",
      details: "You can export the full analysis as a PDF report, or copy specific recommendations to incorporate into your revised contract."
    }
  ];

  const tips = [
    {
      title: "Review the entire contract",
      description: "While AI is powerful, it's important to read the entire contract yourself as well."
    },
    {
      title: "Focus on high-risk items first",
      description: "Address the high-risk issues identified before moving on to medium and low-risk concerns."
    },
    {
      title: "Consider context",
      description: "The AI identifies potential issues, but you should evaluate them in the context of your specific situation."
    },
    {
      title: "Compare multiple versions",
      description: "If negotiating, analyze each new version to track changes and ensure concerns are addressed."
    },
    {
      title: "Consult professionals when needed",
      description: "For high-stakes contracts, use the AI analysis as a first review but consult with legal professionals."
    }
  ];

  return (
    <MainLayout>
      <div className="container py-6 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("back_to_home")}
            </Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">{t("contract_analysis_guide")}</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-8">
          {t("contract_analysis_description")}
        </p>
        
        <Alert className="mb-6">
          <HelpCircle className="h-4 w-4" />
          <AlertTitle>What is Contract Analysis?</AlertTitle>
          <AlertDescription>
            Contract analysis is the process of reviewing legal agreements to identify potential risks, opportunities, ambiguities, and areas for improvement. Our AI-powered contract analysis tool helps you quickly evaluate contracts and receive actionable insights.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="howto" className="space-y-6">
          <TabsList>
            <TabsTrigger value="howto">{t("how_to_analyze")}</TabsTrigger>
            <TabsTrigger value="risks">{t("understanding_risks")}</TabsTrigger>
            <TabsTrigger value="tips">{t("expert_tips")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="howto" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("analyzing_contracts_step_by_step")}</CardTitle>
                <CardDescription>
                  {t("analysis_steps_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analysisSteps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="bg-primary/10 rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center text-primary font-medium mt-1">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">{step.title}</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 mb-2">{step.description}</p>
                        <p className="text-sm bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border">
                          {step.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-3">{t("supported_contract_types")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {contractTypes.map((type, index) => (
                      <Badge key={index} variant="outline" className="bg-primary/5">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("analysis_report_components")}</CardTitle>
                <CardDescription>
                  {t("report_components_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Executive Summary</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      A high-level overview of the contract, including its type, key parties, and overall risk assessment.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Risk Analysis</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Detailed breakdown of potential risks categorized by severity (high, medium, low), with specific clause references and explanations.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Clause Evaluation</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Section-by-section analysis of the contract, highlighting favorable, unfavorable, and missing clauses.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Recommendations</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Specific suggestions for improving the contract, with alternative language where applicable.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Legal References</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Relevant legal context and standards that may apply to the contract.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="risks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("understanding_contract_risks")}</CardTitle>
                <CardDescription>
                  {t("risk_categories_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {riskCategories.map((category, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className={`${category.color} px-4 py-3 text-white font-medium`}>
                        {category.name}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium mb-3">Examples:</h4>
                        <ul className="space-y-2">
                          {category.examples.map((example, exIndex) => (
                            <li key={exIndex} className="flex items-start gap-2 text-neutral-600 dark:text-neutral-300">
                              <span className="mt-1">
                                {category.name === "High Risk" ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : category.name === "Medium Risk" ? (
                                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("common_contract_pitfalls")}</CardTitle>
                <CardDescription>
                  {t("common_pitfalls_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Ambiguous Language</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Vague terms like "reasonable," "timely," or "substantial" without clear definitions can lead to differing interpretations.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Missing Provisions</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Contracts often lack essential provisions like termination rights, dispute resolution mechanisms, or force majeure clauses.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Inconsistent Terms</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Contradictory provisions within the same contract or conflicts between the main agreement and attachments/schedules.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Unenforceable Clauses</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Provisions that may be invalid under applicable law, such as overly restrictive non-competes or penalties disguised as liquidated damages.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("expert_tips_for_contract_review")}</CardTitle>
                <CardDescription>
                  {t("expert_tips_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tips.map((tip, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {tip.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        {tip.description}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-4">{t("optimizing_ai_analysis")}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-medium mt-0.5">1</div>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        <span className="font-medium">Provide context</span> - Specify the contract type, industry, and jurisdiction for more accurate analysis.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-medium mt-0.5">2</div>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        <span className="font-medium">Use clean documents</span> - Ensure the document has proper formatting and minimal scanning artifacts.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-medium mt-0.5">3</div>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        <span className="font-medium">Ask specific questions</span> - Use the "Ask about this contract" feature to get targeted insights.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-medium mt-0.5">4</div>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        <span className="font-medium">Compare contracts</span> - Use the comparison feature when negotiating changes between versions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t("legal_disclaimer")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-300">
                  The Contract Analysis tool provides automated analysis of legal documents but is not a substitute for professional legal advice. The analysis is based on AI pattern recognition and general legal principles, but may not account for all jurisdiction-specific nuances or recent legal developments. For complex or high-stakes contracts, we recommend consulting with a qualified legal professional.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("ready_to_analyze_a_contract")}</CardTitle>
              <CardDescription>
                {t("ready_to_analyze_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button className="w-full sm:w-auto">{t("go_to_contract_analysis")}</Button>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {t("contract_analysis_help")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}