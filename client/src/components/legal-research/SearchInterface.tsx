import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n";
import { performResearch } from "@/lib/openai";

// Default user ID for demo purposes
const DEMO_USER_ID = 1;

function SearchInterface() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    relevantLaws: { title: string; description: string; source: string }[];
    relevantCases: { name: string; citation: string; relevance: string }[];
    summary: string;
  } | null>(null);
  
  // Search mutation
  const { mutate: search, isPending } = useMutation({
    mutationFn: (query: string) => performResearch(DEMO_USER_ID, query),
    onSuccess: (data) => {
      setSearchResults(data.results);
    },
    onError: () => {
      setSearchResults(null);
    },
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isPending) return;
    search(searchQuery.trim());
  };
  
  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="text"
          placeholder={t("search_placeholder")}
          className="pl-10 pr-24 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="absolute left-3 top-3 text-neutral-400">
          <span className="material-icons">search</span>
        </span>
        <Button
          type="submit"
          disabled={!searchQuery.trim() || isPending}
          className="absolute right-2 top-2 bg-primary hover:bg-primary-dark text-white px-4"
        >
          {isPending ? (
            <span className="material-icons animate-spin">sync</span>
          ) : (
            t("search_button")
          )}
        </Button>
      </form>
      
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="laws">{t("relevant_laws")}</TabsTrigger>
              <TabsTrigger value="cases">{t("relevant_cases")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="laws" className="mt-4">
              {searchResults.relevantLaws.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.relevantLaws.map((law, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg">{law.title}</h3>
                        <p className="text-neutral-600 text-sm mt-1">{law.description}</p>
                        <div className="mt-2 text-xs text-neutral-500">
                          <span className="font-medium">Source:</span> {law.source}
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
              {searchResults.relevantCases.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.relevantCases.map((caseItem, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg">{caseItem.name}</h3>
                        <div className="mt-1 text-xs text-neutral-500">
                          <span className="font-medium">Citation:</span> {caseItem.citation}
                        </div>
                        <p className="text-neutral-600 text-sm mt-2">{caseItem.relevance}</p>
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
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}

export default SearchInterface;
