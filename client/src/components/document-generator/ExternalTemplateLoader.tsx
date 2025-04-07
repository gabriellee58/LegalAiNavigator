import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// Template source interface
interface TemplateSource {
  id: string;
  name: string;
  description: string;
  categories: string[];
  jurisdictions: string[];
  url?: string;
}

// Template preview interface
interface TemplatePreview {
  id: string;
  title: string;
  description: string;
  category: string;
  jurisdiction: string;
  language: string;
  source: string;
  sourceUrl?: string;
}

export default function ExternalTemplateLoader() {
  const { toast } = useToast();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("en");
  const [manualTemplateId, setManualTemplateId] = useState<string>("");
  
  // Fetch template sources
  const {
    data: sources = [],
    isLoading: isLoadingSources
  } = useQuery<TemplateSource[]>({
    queryKey: ["/api/template-sources"],
  });
  
  // Set default selected source when sources are loaded
  useEffect(() => {
    if (sources.length > 0 && !selectedSource) {
      setSelectedSource(sources[0].id);
    }
  }, [sources, selectedSource]);
  
  // Get current selected source
  const currentSource = sources.find(s => s.id === selectedSource);
  
  // Format the default template ID when source or category changes
  useEffect(() => {
    if (selectedSource && selectedCategory) {
      setManualTemplateId(`${selectedSource}-${selectedCategory}-template`);
    } else if (selectedSource) {
      setManualTemplateId(`${selectedSource}-legal-template`);
    }
  }, [selectedSource, selectedCategory]);
  
  // Fetch templates from selected source
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    isError: isErrorTemplates,
    refetch: refetchTemplates
  } = useQuery<TemplatePreview[]>({
    queryKey: ["/api/template-sources", selectedSource, "templates", { category: selectedCategory, jurisdiction: selectedJurisdiction }],
    enabled: !!selectedSource,
  });
  
  // Import template mutation
  const {
    mutate: importTemplate,
    isPending: isImporting,
    error: importError,
  } = useMutation({
    mutationFn: async (templateId: string) => {
      // Validate template ID format
      if (!templateId.includes('-')) {
        throw new Error("Invalid template ID format. Expected format: 'source-category-name'");
      }
      
      const response = await apiRequest("POST", "/api/template-sources/import", {
        templateId,
        language
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || "Failed to import template");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t("template_imported"),
        description: t("template_import_success"),
      });
      // Invalidate document templates cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/document-templates"] });
    },
    onError: (error: any) => {
      console.error("Template import error:", error);
      toast({
        title: t("template_import_error"),
        description: error.message || t("template_import_error_description"),
        variant: "destructive",
      });
    },
  });
  
  // Handle filter changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : value);
  };
  
  const handleJurisdictionChange = (value: string) => {
    setSelectedJurisdiction(value === "all" ? null : value);
  };
  
  // Get unique categories and jurisdictions from current source
  const categories = currentSource?.categories || [];
  const jurisdictions = currentSource?.jurisdictions || [];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("external_templates")}</CardTitle>
        <CardDescription>{t("external_templates_description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingSources ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Helper info panel */}
            <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-1 flex items-center">
                <span className="material-icons text-blue-700 mr-1 text-sm">info</span>
                Template Import Information
              </h4>
              <p className="text-blue-900 mb-2">
                Templates are imported using AI generation based on the template ID. The proper format for template IDs is:
                <code className="ml-1 p-1 bg-white text-blue-800 rounded border border-blue-200 text-xs">source-category-name</code>
              </p>
              <p className="text-blue-900 text-xs">
                Example: <code className="p-1 bg-white text-blue-800 rounded border border-blue-200">canada-legal-nda</code> for a Canadian NDA legal template.
              </p>
            </div>

            {/* Show error message if import fails */}
            {importError && (
              <div className="mb-4 p-3 bg-red-50 rounded-md text-sm border border-red-200">
                <h4 className="font-medium text-red-800 mb-1 flex items-center">
                  <span className="material-icons text-red-700 mr-1 text-sm">error</span>
                  Import Failed
                </h4>
                <p className="text-red-700">{importError.message}</p>
              </div>
            )}
            
            {/* Manual template import */}
            <div className="mb-4 p-4 border rounded-md">
              <h4 className="font-medium text-lg mb-3">Quick Template Import</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">
                    Template ID
                  </label>
                  <div className="flex">
                    <input 
                      type="text" 
                      value={manualTemplateId}
                      onChange={(e) => setManualTemplateId(e.target.value)}
                      className="flex-1 py-2 px-3 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="source-category-name (e.g., canada-legal-nda)"
                    />
                    <Button
                      className="rounded-l-none"
                      disabled={isImporting || !manualTemplateId.includes('-')}
                      onClick={() => importTemplate(manualTemplateId)}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("importing")}
                        </>
                      ) : (
                        t("import")
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {manualTemplateId.includes('-') 
                      ? "✓ Valid template ID format" 
                      : "⚠️ Invalid format: Must include source, category, and name separated by hyphens"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Template Language
                  </label>
                  <Select 
                    value={language} 
                    onValueChange={setLanguage}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Source selector */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("template_source")}
                </label>
                <Select 
                  value={selectedSource || ""} 
                  onValueChange={setSelectedSource}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_template_source")} />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map(source => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("category")}
                </label>
                <Select 
                  value={selectedCategory || "all"} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("all_categories")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_categories")}</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Jurisdiction filter */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("jurisdiction")}
                </label>
                <Select 
                  value={selectedJurisdiction || "all"} 
                  onValueChange={handleJurisdictionChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("all_jurisdictions")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_jurisdictions")}</SelectItem>
                    {jurisdictions.map(jurisdiction => (
                      <SelectItem key={jurisdiction} value={jurisdiction}>
                        {jurisdiction}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Template grid */}
            {isLoadingTemplates ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isErrorTemplates ? (
              <div className="text-center py-8">
                <p className="text-neutral-500">{t("error_loading_templates")}</p>
                <Button 
                  variant="outline" 
                  onClick={() => refetchTemplates()}
                  className="mt-2"
                >
                  {t("try_again")}
                </Button>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500">{t("no_templates_found")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <TemplateCard 
                    key={template.id} 
                    template={template}
                    onImport={() => {
                      // Use formatted template ID helper to ensure proper format
                      const formattedId = `${template.source}-${template.category}-${template.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
                      importTemplate(formattedId);
                    }}
                    isImporting={isImporting}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface TemplateCardProps {
  template: TemplatePreview;
  onImport: () => void;
  isImporting: boolean;
}

function TemplateCard({ template, onImport, isImporting }: TemplateCardProps) {
  // Generate properly formatted template ID
  const getFormattedTemplateId = () => {
    // Format: source-category-name
    // If template ID already has correct format with hyphens, use it
    if (template.id.includes('-')) {
      return template.id;
    }
    
    // Otherwise, construct a valid ID from template properties
    const name = template.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `${template.source}-${template.category}-${name}`;
  };
  
  // Get template icon based on category
  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'contract':
        return 'assignment';
      case 'lease':
        return 'home';
      case 'will':
        return 'account_balance';
      case 'business':
        return 'business';
      case 'ip':
        return 'copyright';
      case 'confidentiality':
        return 'shield';
      default:
        return 'description';
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-md bg-blue-50 text-primary">
            <span className="material-icons">{getTemplateIcon(template.category)}</span>
          </div>
          <Badge variant="outline">{template.jurisdiction}</Badge>
        </div>
        <CardTitle className="mt-2 text-base">{template.title}</CardTitle>
        <CardDescription className="text-xs">{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-xs text-neutral-500">
          <div className="flex items-center mb-1">
            <span className="material-icons text-xs mr-1">label</span>
            <span>{template.category}</span>
          </div>
          <div className="flex items-center">
            <span className="material-icons text-xs mr-1">source</span>
            <span>{template.source}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary-dark"
          onClick={onImport}
          disabled={isImporting}
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("importing")}
            </>
          ) : (
            <>
              <span className="material-icons mr-1 text-sm">add</span> 
              {t("import_template")}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}