import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Filter, ChevronRight, Clock, FileText, RefreshCw } from "lucide-react";
import { useLocation, Link } from "wouter";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

// Define template type based on the schema
interface DocumentTemplate {
  id: number;
  title: string;
  description: string;
  language: string;
  templateType: string;
  subcategory?: string;
  templateContent: string;
  fields: Record<string, any>;
  jurisdiction?: string;
  createdAt?: string;
}

export default function DocumentTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [templateTypeFilter, setTemplateTypeFilter] = useState("");
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Extract category from URL path: /documents/contracts -> "contracts"
  const category = location.startsWith("/documents/") 
    ? location.replace("/documents/", "") 
    : "all";
    
  // Fetch templates from API
  const { 
    data: templates = [], 
    isLoading, 
    error,
    refetch
  } = useQuery<DocumentTemplate[]>({
    queryKey: ["/api/document-templates", category !== "all" ? category : undefined],
    queryFn: async () => {
      const url = category !== "all" 
        ? `/api/document-templates?type=${category}` 
        : "/api/document-templates";
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching templates: ${response.statusText}`);
      }
      return response.json();
    }
  });
  
  // Handle error state
  useEffect(() => {
    if (error) {
      console.error("Failed to fetch templates:", error);
      toast({
        title: "Failed to load templates",
        description: "There was an error loading the document templates. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter templates based on search query and filter criteria
  const filteredTemplates = templates.filter((template: DocumentTemplate) => {
    // Filter by search query
    if (searchQuery && 
        !template.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !template.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by template type dropdown (if a specific type is selected)
    if (templateTypeFilter && 
        templateTypeFilter !== "all_types" && 
        template.templateType !== templateTypeFilter) {
      return false;
    }
    
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "contracts":
        return <FileText className="h-5 w-5" />;
      case "leases":
        return <FileText className="h-5 w-5" />;
      case "wills-estates":
        return <FileText className="h-5 w-5" />;
      case "business-formation":
        return <FileText className="h-5 w-5" />;
      case "ip-management":
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "contracts":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "leases":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "wills-estates":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "business-formation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "ip-management":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <MainLayout>
      <div className="container py-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t("document_templates")}</h1>
            <p className="text-neutral-600 dark:text-neutral-300 mt-1">
              {t("document_templates_description")}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/document-generator">
              <Button>
                {t("create_new_document")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{t("categories")}</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  <Link href="/documents/all">
                    <div className={`px-3 py-2 rounded-md cursor-pointer ${category === "all" ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {t("all_templates")}
                    </div>
                  </Link>
                  <Link href="/documents/contract">
                    <div className={`px-3 py-2 rounded-md cursor-pointer ${category === "contract" ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {t("contracts")}
                    </div>
                  </Link>
                  <Link href="/documents/real-estate">
                    <div className={`px-3 py-2 rounded-md cursor-pointer ${category === "real-estate" ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {t("real_estate")}
                    </div>
                  </Link>
                  <Link href="/documents/family">
                    <div className={`px-3 py-2 rounded-md cursor-pointer ${category === "family" ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {t("family")}
                    </div>
                  </Link>
                  <Link href="/documents/employment">
                    <div className={`px-3 py-2 rounded-md cursor-pointer ${category === "employment" ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {t("employment")}
                    </div>
                  </Link>
                  <Link href="/documents/immigration">
                    <div className={`px-3 py-2 rounded-md cursor-pointer ${category === "immigration" ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {t("immigration")}
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{t("filter")}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("document_type")}</label>
                    <Select 
                      value={templateTypeFilter || "all_types"} 
                      onValueChange={setTemplateTypeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("all_types")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_types">{t("all_types")}</SelectItem>
                        <SelectItem value="contract">{t("contracts")}</SelectItem>
                        <SelectItem value="real-estate">{t("real_estate")}</SelectItem>
                        <SelectItem value="family">{t("family")}</SelectItem>
                        <SelectItem value="employment">{t("employment")}</SelectItem>
                        <SelectItem value="immigration">{t("immigration")}</SelectItem>
                        <SelectItem value="will">{t("wills")}</SelectItem>
                        <SelectItem value="personal-injury">{t("personal_injury")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <Card>
              <CardHeader className="p-4 pb-0">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <Input 
                    className="pl-10" 
                    placeholder={t("search_templates")} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("available_templates")}</CardTitle>
                  <span className="text-sm text-neutral-500">
                    {filteredTemplates.length} {t("templates_found")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg overflow-hidden p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Skeleton className="h-6 w-24" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-6 w-[80%] mb-2" />
                            <Skeleton className="h-4 w-[90%]" />
                          </div>
                          <Skeleton className="h-9 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                      <Search className="h-6 w-6 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">{t("no_templates_found")}</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                      {t("no_templates_message")}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => refetch()}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t("retry")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTemplates.map((template) => (
                      <div key={template.id} className="border rounded-lg overflow-hidden hover:border-primary transition-colors">
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${getCategoryColor(template.templateType)}`}>
                                  {t(template.templateType)}
                                </Badge>
                                {template.subcategory && (
                                  <Badge variant="outline" className="text-xs">
                                    {template.subcategory}
                                  </Badge>
                                )}
                                {template.jurisdiction && (
                                  <span className="text-xs text-neutral-500">
                                    {template.jurisdiction}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-medium mb-1">{template.title}</h3>
                              <p className="text-neutral-600 dark:text-neutral-300 text-sm">{template.description}</p>
                            </div>
                            <Link href={`/document-generator/${template.id}`}>
                              <Button variant="outline" size="sm">
                                {t("use_template")}
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}