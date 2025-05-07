import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, BookOpen, Search, Bookmark, FileText, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function LegalResearchGuidePage() {
  const researchProcess = [
    {
      title: "Define your research question",
      description: "Start with a clear, specific question to guide your research.",
      tips: [
        "Break complex issues into smaller, manageable questions",
        "Identify key legal concepts and terminology relevant to your issue",
        "Consider the jurisdiction that applies to your question",
        "Frame your question to focus on specific legal elements"
      ]
    },
    {
      title: "Choose the right search parameters",
      description: "Select appropriate jurisdictions, practice areas, and search terms.",
      tips: [
        "Specify the correct jurisdiction (federal, provincial, territorial)",
        "Select the relevant practice area for more targeted results",
        "Use both broad and narrow search terms",
        "Include synonyms and related legal terminology"
      ]
    },
    {
      title: "Review and analyze the results",
      description: "Evaluate the relevance and authority of your search results.",
      tips: [
        "Prioritize primary sources (statutes, regulations, case law)",
        "Consider the hierarchy of authority (Supreme Court > appellate courts > trial courts)",
        "Look for recent decisions that may have modified older precedents",
        "Pay attention to the relevance scores provided with results"
      ]
    },
    {
      title: "Save and organize your findings",
      description: "Document important sources and citations for future reference.",
      tips: [
        "Save important citations using the bookmark feature",
        "Take notes on key legal principles from each source",
        "Organize sources by topic or sub-issue",
        "Keep track of the date when you conducted your research"
      ]
    }
  ];

  const searchStrategies = [
    {
      title: "Natural Language Searching",
      description: "Enter your legal question in plain language.",
      example: "What are the requirements for a valid will in Ontario?",
      pros: ["Intuitive and easy to use", "Good for initial research", "Helpful for complex concepts"],
      cons: ["May miss specific terminology", "Can be too broad", "Results may vary in relevance"]
    },
    {
      title: "Boolean Searching",
      description: "Use operators like AND, OR, NOT to refine searches.",
      example: "contract AND breach NOT specific performance",
      pros: ["Precise control over search parameters", "Can narrow or expand results as needed", "Combines multiple concepts effectively"],
      cons: ["Requires knowledge of operators", "Can be complex for beginners", "May be too restrictive if poorly constructed"]
    },
    {
      title: "Citation Searching",
      description: "Search for specific case citations or references.",
      example: "R v Jordan, 2016 SCC 27",
      pros: ["Highly specific results", "Finds exact cases and related references", "Useful for tracking a case's influence"],
      cons: ["Requires knowing the citation format", "Limited to finding known sources", "Doesn't discover new related materials"]
    },
    {
      title: "Statute Searching",
      description: "Search for specific statutes or regulations.",
      example: "Ontario Employment Standards Act",
      pros: ["Directly access legislative sources", "Find specific provisions quickly", "Includes related regulations"],
      cons: ["May miss judicial interpretations", "Limited to legislative materials", "Requires jurisdictional knowledge"]
    }
  ];

  const keyResources = [
    {
      name: "CanLII (Canadian Legal Information Institute)",
      description: "Comprehensive database of Canadian court decisions, tribunal decisions, statutes, and regulations.",
      url: "https://www.canlii.org/",
      features: ["Free access", "Coverage across all Canadian jurisdictions", "Advanced search capabilities", "Citator tools"]
    },
    {
      name: "Justice Laws Website",
      description: "Official source for federal laws and regulations maintained by the Government of Canada.",
      url: "https://laws-lois.justice.gc.ca/eng/",
      features: ["Consolidated Acts and regulations", "Point-in-time access", "Bilingual content", "Legislative history"]
    },
    {
      name: "Supreme Court of Canada",
      description: "Official website of Canada's highest court with access to judgments and hearing information.",
      url: "https://www.scc-csc.ca/home-accueil/index-eng.aspx",
      features: ["All SCC judgments", "Case information", "Webcast recordings", "Court schedule"]
    },
    {
      name: "Provincial and Territorial Court Websites",
      description: "Official websites for provincial and territorial courts across Canada.",
      url: "#",
      features: ["Provincial/territorial judgments", "Court procedures", "Practice directions", "Forms and resources"]
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
        
        <h1 className="text-3xl font-bold mb-2">{t("legal_research_best_practices")}</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-8">
          {t("legal_research_description")}
        </p>
        
        <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-400">{t("why_legal_research_matters")}</AlertTitle>
          <AlertDescription className="text-blue-600 dark:text-blue-400">
            Effective legal research helps you understand your rights and obligations, identify relevant laws and precedents, and build stronger legal arguments. Our AI-powered research tool helps you navigate complex legal information efficiently and effectively.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="process" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="process">{t("research_process")}</TabsTrigger>
            <TabsTrigger value="strategies">{t("search_strategies")}</TabsTrigger>
            <TabsTrigger value="resources">{t("key_resources")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="process" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("effective_legal_research_process")}</CardTitle>
                <CardDescription>
                  {t("research_process_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {researchProcess.map((step, index) => (
                    <div key={index} className="relative pl-10 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-neutral-200 dark:before:bg-neutral-700">
                      <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border bg-white text-primary dark:bg-neutral-800">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                      <p className="text-neutral-600 dark:text-neutral-300 mb-3">{step.description}</p>
                      
                      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                        <h4 className="font-medium mb-2 text-sm">{t("tips")}:</h4>
                        <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 border rounded-lg bg-primary/5">
                  <h3 className="font-medium mb-3">{t("using_our_research_tool")}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                    LegalAI's research tool implements this process by providing:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Search className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <span className="font-medium">Advanced search options</span>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300">With jurisdiction and practice area filters</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <span className="font-medium">Relevant laws and cases</span>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300">Organized with relevance scoring</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <span className="font-medium">Legal concepts</span>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300">With clear definitions and context</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Bookmark className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <span className="font-medium">Citation saving</span>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300">For organizing and referencing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="strategies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("effective_search_strategies")}</CardTitle>
                <CardDescription>
                  {t("search_strategies_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {searchStrategies.map((strategy, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="bg-primary/10 px-4 py-3">
                        <h3 className="font-medium">{strategy.title}</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        <p className="text-neutral-600 dark:text-neutral-300">{strategy.description}</p>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">{t("example")}:</h4>
                          <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 text-sm font-mono">
                            {strategy.example}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1 text-green-600">Pros:</h4>
                            <ul className="space-y-1 text-sm">
                              {strategy.pros.map((pro, proIndex) => (
                                <li key={proIndex} className="flex items-start gap-2">
                                  <span className="text-green-600 mt-1">+</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1 text-red-600">Cons:</h4>
                            <ul className="space-y-1 text-sm">
                              {strategy.cons.map((con, conIndex) => (
                                <li key={conIndex} className="flex items-start gap-2">
                                  <span className="text-red-600 mt-1">-</span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h3 className="font-medium mb-4">{t("advanced_search_tips")}</h3>
                  <div className="space-y-3">
                    <div className="border rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-1">Use quotation marks for exact phrases</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        Example: "reasonable notice" will find that exact phrase
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-1">Combine search approaches</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        Example: "constructive dismissal" AND "COVID-19" in the Employment Law practice area
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-1">Use wildcard symbols</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        Example: territor* finds territory, territorial, territories
                      </p>
                    </div>
                    <div className="border rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-1">Focus on recent developments</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        Sort results by date to find the most recent legal developments
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("essential_legal_research_resources")}</CardTitle>
                <CardDescription>
                  {t("resources_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {keyResources.map((resource, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="bg-neutral-50 dark:bg-neutral-800 p-4">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium">{resource.name}</h3>
                          {resource.url !== "#" && (
                            <Button variant="outline" size="sm" className="gap-1" asChild>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                                Visit
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-neutral-600 dark:text-neutral-300 mb-3">{resource.description}</p>
                        
                        <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                          {resource.features.map((feature, featIndex) => (
                            <li key={featIndex} className="flex items-center gap-2 text-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-8" />
                
                <div>
                  <h3 className="font-medium mb-4">{t("additional_resources")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Provincial Law Society Resources</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        Each provincial law society offers legal research resources and guidance specific to that jurisdiction.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">University Law Libraries</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        Many university law libraries offer public access to legal resources and databases.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Government Departmental Resources</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        Various government departments provide specialized legal information in their areas of responsibility.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Legal Aid Organizations</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        Legal aid organizations often offer research resources and guidance for common legal issues.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("ready_to_start_researching")}</CardTitle>
              <CardDescription>
                {t("ready_to_research_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button className="w-full sm:w-auto">{t("go_to_legal_research")}</Button>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {t("legal_research_help")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}