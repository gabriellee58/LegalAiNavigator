import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { t } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";

// Default user ID for demo purposes
const DEMO_USER_ID = 1;

// Canadian provinces/territories
const JURISDICTIONS = [
  { value: "canada", label: "Federal (Canada)" },
  { value: "alberta", label: "Alberta" },
  { value: "british-columbia", label: "British Columbia" },
  { value: "manitoba", label: "Manitoba" },
  { value: "new-brunswick", label: "New Brunswick" },
  { value: "newfoundland", label: "Newfoundland and Labrador" },
  { value: "northwest-territories", label: "Northwest Territories" },
  { value: "nova-scotia", label: "Nova Scotia" },
  { value: "nunavut", label: "Nunavut" },
  { value: "ontario", label: "Ontario" },
  { value: "pei", label: "Prince Edward Island" },
  { value: "quebec", label: "Quebec" },
  { value: "saskatchewan", label: "Saskatchewan" },
  { value: "yukon", label: "Yukon" }
];

// Legal practice areas
const PRACTICE_AREAS = [
  { value: "all", label: "All Practice Areas" },
  { value: "family", label: "Family Law" },
  { value: "criminal", label: "Criminal Law" },
  { value: "immigration", label: "Immigration Law" },
  { value: "corporate", label: "Corporate Law" },
  { value: "tax", label: "Tax Law" },
  { value: "property", label: "Property Law" },
  { value: "employment", label: "Employment Law" },
  { value: "personal-injury", label: "Personal Injury" },
  { value: "estate", label: "Estate Law" },
  { value: "administrative", label: "Administrative Law" },
  { value: "constitutional", label: "Constitutional Law" },
  { value: "environmental", label: "Environmental Law" },
  { value: "intellectual", label: "Intellectual Property" },
  { value: "aboriginal", label: "Aboriginal Law" }
];

interface LawReference {
  title: string;
  description: string;
  source: string;
  url?: string;
  relevanceScore?: number;
}

interface CaseReference {
  name: string;
  citation: string;
  relevance: string;
  year?: string;
  jurisdiction?: string;
  judgment?: string;
  keyPoints?: string[];
  url?: string;
}

interface LegalConcept {
  concept: string;
  definition: string;
  relevance: string;
}

interface ResearchResults {
  relevantLaws: LawReference[];
  relevantCases: CaseReference[];
  summary: string;
  legalConcepts?: LegalConcept[];
}

// Function to perform legal research
const performResearch = async (
  userId: number,
  query: string,
  jurisdiction: string = "canada",
  practiceArea: string = "all"
) => {
  const response = await apiRequest("POST", "/api/research", {
    userId,
    query,
    jurisdiction,
    practiceArea
  });
  return response;
};

function SearchInterface() {
  const [searchQuery, setSearchQuery] = useState("");
  const [jurisdiction, setJurisdiction] = useState("canada");
  const [practiceArea, setPracticeArea] = useState("all");
  const [searchResults, setSearchResults] = useState<ResearchResults | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedCitations, setSavedCitations] = useState<{name: string, citation: string}[]>([]);
  
  // Search mutation
  const { mutate: search, isPending } = useMutation({
    mutationFn: async (query: string) => {
      return await performResearch(DEMO_USER_ID, query, jurisdiction, practiceArea);
    },
    onSuccess: (data: any) => {
      setSearchResults(data);
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev].slice(0, 5));
      }
    },
    onError: (error: any) => {
      console.error("Research error:", error);
      setSearchResults(null);
    },
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isPending) return;
    search(searchQuery.trim());
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    search(query);
  };

  const saveCitation = (name: string, citation: string) => {
    setSavedCitations(prev => [...prev, {name, citation}]);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Advanced Search Options */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("advanced_search")}</CardTitle>
              <CardDescription>{t("search_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder={t("research_search_placeholder")}
                    className="pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="absolute left-3 top-3 text-neutral-400">
                    <span className="material-icons">search</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("jurisdiction")}</label>
                    <Select
                      value={jurisdiction}
                      onValueChange={setJurisdiction}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_jurisdiction")} />
                      </SelectTrigger>
                      <SelectContent>
                        {JURISDICTIONS.map((j) => (
                          <SelectItem key={j.value} value={j.value}>
                            {j.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("practice_area")}</label>
                    <Select
                      value={practiceArea}
                      onValueChange={setPracticeArea}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_practice_area")} />
                      </SelectTrigger>
                      <SelectContent>
                        {PRACTICE_AREAS.map((area) => (
                          <SelectItem key={area.value} value={area.value}>
                            {area.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!searchQuery.trim() || isPending}
                    className="bg-primary hover:bg-primary-dark text-white px-6"
                  >
                    {isPending ? (
                      <>
                        <span className="material-icons animate-spin mr-2">sync</span>
                        {t("searching")}
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2">search</span>
                        {t("search_button")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Searches & Saved Citations */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t("research_tools")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">{t("recent_searches")}</h3>
                {searchHistory.length > 0 ? (
                  <div className="space-y-2">
                    {searchHistory.map((query, i) => (
                      <Button 
                        key={i} 
                        variant="ghost" 
                        className="w-full justify-start text-sm h-auto py-1 px-2"
                        onClick={() => handleQuickSearch(query)}
                      >
                        <span className="material-icons mr-2 text-sm">history</span>
                        <span className="truncate">{query}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 italic">{t("no_recent_searches")}</p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">{t("saved_citations")}</h3>
                {savedCitations.length > 0 ? (
                  <ScrollArea className="h-24">
                    <div className="space-y-2">
                      {savedCitations.map((citation, i) => (
                        <div key={i} className="text-xs p-2 border rounded-md">
                          <p className="font-medium">{citation.name}</p>
                          <p className="text-neutral-600">{citation.citation}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-neutral-500 italic">{t("no_saved_citations")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Search Results */}
      {isPending ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : searchResults ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Research Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700">{searchResults.summary}</p>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="laws" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="laws">{t("relevant_laws")}</TabsTrigger>
              <TabsTrigger value="cases">{t("relevant_cases")}</TabsTrigger>
              <TabsTrigger value="concepts">{t("legal_concepts")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="laws" className="mt-4">
              {searchResults.relevantLaws && searchResults.relevantLaws.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.relevantLaws.map((law, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{law.title}</h3>
                          {law.relevanceScore && (
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              {t("relevance")}: {Math.round(law.relevanceScore * 100)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-neutral-600 text-sm mt-1">{law.description}</p>
                        <div className="mt-2 text-xs text-neutral-500 flex justify-between">
                          <span><span className="font-medium">Source:</span> {law.source}</span>
                          {law.url && (
                            <a href={law.url} target="_blank" rel="noopener noreferrer" 
                               className="text-primary hover:underline inline-flex items-center">
                              <span className="material-icons text-xs mr-1">open_in_new</span>
                              View Source
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-neutral-500">
                    {t("no_results")}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="cases" className="mt-4">
              {searchResults.relevantCases && searchResults.relevantCases.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.relevantCases.map((caseItem, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{caseItem.name}</h3>
                          {caseItem.jurisdiction && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {caseItem.jurisdiction}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500 flex items-center gap-3">
                          <span><span className="font-medium">Citation:</span> {caseItem.citation}</span>
                          {caseItem.year && <span><span className="font-medium">Year:</span> {caseItem.year}</span>}
                        </div>
                        <p className="text-neutral-600 text-sm mt-2">{caseItem.relevance}</p>
                        
                        {caseItem.keyPoints && caseItem.keyPoints.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-xs font-semibold text-neutral-700 mb-1">Key Points:</h4>
                            <ul className="text-xs text-neutral-600 list-disc pl-4 space-y-1">
                              {caseItem.keyPoints.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-3 flex justify-between items-center">
                          {caseItem.url && (
                            <a href={caseItem.url} target="_blank" rel="noopener noreferrer" 
                               className="text-xs text-primary hover:underline inline-flex items-center">
                              <span className="material-icons text-xs mr-1">open_in_new</span>
                              View Full Case
                            </a>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-7"
                            onClick={() => saveCitation(caseItem.name, caseItem.citation)}
                          >
                            <span className="material-icons text-xs mr-1">bookmark</span>
                            Save Citation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-neutral-500">
                    {t("no_results")}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="concepts" className="mt-4">
              {searchResults.legalConcepts && searchResults.legalConcepts.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.legalConcepts.map((concept, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg">{concept.concept}</h3>
                        <p className="text-neutral-600 text-sm mt-1">{concept.definition}</p>
                        <p className="text-neutral-600 text-xs mt-2">
                          <span className="font-medium">Relevance:</span> {concept.relevance}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-neutral-500">
                    {t("no_legal_concepts")}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}

export default SearchInterface;
