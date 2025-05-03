import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import { t } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, Loader2, RefreshCw } from "lucide-react";
import DocumentTemplateCard from "@/components/document-generator/DocumentTemplateCard";
import DocumentGenForm from "@/components/document-generator/DocumentGenForm";
import ExternalTemplateLoader from "@/components/document-generator/ExternalTemplateLoader";
import { DocumentTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// No need for additional interfaces as we've updated the component to accept the fields property with any type

function DocumentGeneratorPage() {
  const [location] = useLocation();
  const [language, setLanguage] = useState<string>("en");
  const { toast } = useToast();
  
  // Extract template ID from URL if present
  const templateId = location.startsWith("/document-generator/") 
    ? parseInt(location.replace("/document-generator/", "")) 
    : null;
  
  // Fetch templates with error handling
  const { 
    data: templates = [], 
    isLoading: isLoadingTemplates,
    error: templateError,
    refetch: refetchTemplates
  } = useQuery<DocumentTemplate[], Error>({
    queryKey: ["/api/document-templates", language],
    onError: (error) => {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error loading templates",
        description: "There was a problem loading the document templates. Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Fetch selected template if ID is present
  const { 
    data: selectedTemplate, 
    isLoading: isLoadingTemplate,
    error: selectedTemplateError,
    refetch: refetchSelectedTemplate
  } = useQuery<DocumentTemplate, Error>({
    queryKey: [`/api/document-templates/${templateId}`],
    enabled: !!templateId,
    onError: (error) => {
      console.error(`Error fetching template ${templateId}:`, error);
      toast({
        title: "Error loading template",
        description: "The requested template could not be loaded. Please try another template.",
        variant: "destructive",
      });
    },
  });
  
  // Group templates by type
  const templatesByType = templates.reduce((acc: Record<string, DocumentTemplate[]>, template: DocumentTemplate) => {
    if (!acc[template.templateType]) {
      acc[template.templateType] = [];
    }
    acc[template.templateType].push(template);
    return acc;
  }, {});
  
  // Further group templates by subcategory within each type
  const templatesByTypeAndSubcategory = Object.entries(templatesByType).reduce((result: Record<string, Record<string, DocumentTemplate[]>>, [type, typeTemplates]) => {
    result[type] = typeTemplates.reduce((subAcc: Record<string, DocumentTemplate[]>, template: DocumentTemplate) => {
      const subcategory = template.subcategory || 'general';
      if (!subAcc[subcategory]) {
        subAcc[subcategory] = [];
      }
      subAcc[subcategory].push(template);
      return subAcc;
    }, {});
    return result;
  }, {});
  
  // State for tabs
  const [generatorTab, setGeneratorTab] = useState<string>("templates");
  
  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {templateId ? isLoadingTemplate ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : selectedTemplateError ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl md:text-2xl font-heading font-semibold">
                Template Not Found
              </h1>
              <button 
                onClick={() => window.history.back()}
                className="flex items-center text-primary hover:underline"
              >
                <span className="material-icons text-sm mr-1">arrow_back</span>
                Back to templates
              </button>
            </div>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error loading template</AlertTitle>
              <AlertDescription>
                We couldn't find the requested template. It may have been removed or you might have followed an incorrect link.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => refetchSelectedTemplate()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry loading template
              </Button>
            </div>
          </div>
        ) : selectedTemplate ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-heading font-semibold">
                  {selectedTemplate.title}
                </h1>
                <p className="text-neutral-600 mt-1">
                  {selectedTemplate.description}
                </p>
              </div>
              <button 
                onClick={() => window.history.back()}
                className="flex items-center text-primary hover:underline"
              >
                <span className="material-icons text-sm mr-1">arrow_back</span>
                Back to templates
              </button>
            </div>
            
            {/* Document generation form */}
            <div className="w-full">
              <DocumentGenForm template={selectedTemplate} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl md:text-2xl font-heading font-semibold">
                {t("document_gen_title")}
              </h1>
              <p className="text-neutral-600 mt-1">
                {t("document_gen_subtitle")}
              </p>
            </div>
            
            {/* Legal domain quick links */}
            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-primary mb-3">{t("browse_by_legal_domain")}</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/legal-domains/family-law">{t("family_law")}</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/legal-domains/real-estate">{t("real_estate")}</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/legal-domains/business">{t("business")}</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/legal-domains/employment">{t("employment")}</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/legal-domains/immigration">{t("immigration")}</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/legal-domains/personal-injury">{t("personal_injury")}</a>
                </Button>
              </div>
            </div>
            
            {/* Main tabs for the document generator: Templates, External Templates */}
            <Tabs 
              value={generatorTab} 
              onValueChange={setGeneratorTab} 
              className="w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="templates">{t("my_templates")}</TabsTrigger>
                  <TabsTrigger value="external">
                    <span className="material-icons mr-1 text-sm">cloud_download</span>
                    {t("external_templates")}
                  </TabsTrigger>
                </TabsList>
                
                {generatorTab === "templates" && (
                  <div className="inline-flex rounded-md text-xs">
                    <button 
                      className={`px-3 py-1.5 ${language === 'en' ? 'bg-primary text-white' : 'bg-white text-neutral-600 border border-neutral-300'} rounded-l-md`}
                      onClick={() => setLanguage('en')}
                    >
                      English
                    </button>
                    <button 
                      className={`px-3 py-1.5 ${language === 'fr' ? 'bg-primary text-white' : 'bg-white text-neutral-600 border border-neutral-300'} rounded-r-md`}
                      onClick={() => setLanguage('fr')}
                    >
                      Français
                    </button>
                  </div>
                )}
              </div>
              
              {/* Templates tab content */}
              <TabsContent value="templates">
                {isLoadingTemplates ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : templateError ? (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{t("error_loading_templates")}</AlertTitle>
                      <AlertDescription>
                        {t("error_loading_templates_description")}
                      </AlertDescription>
                    </Alert>
                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        onClick={() => refetchTemplates()}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {t("retry_loading_templates")}
                      </Button>
                    </div>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>{t("no_templates_available")}</AlertTitle>
                      <AlertDescription>
                        {t("no_templates_available_description")}
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4 flex overflow-x-auto pb-2 scrollbar-hide">
                      <TabsTrigger value="all">{t("all_templates")}</TabsTrigger>
                      {Object.keys(templatesByType).map((type) => (
                        <TabsTrigger key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}s
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    <TabsContent value="all">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates?.map((template: DocumentTemplate) => (
                          <DocumentTemplateCard 
                            key={template.id} 
                            template={template} 
                          />
                        ))}
                      </div>
                    </TabsContent>
                    
                    {Object.entries(templatesByType).map(([type, typeTemplates]) => (
                      <TabsContent key={type} value={type}>
                        {/* Display subcategories */}
                        {templatesByTypeAndSubcategory[type] && 
                          Object.entries(templatesByTypeAndSubcategory[type]).map(([subcategory, templates]) => (
                            <div key={`${type}-${subcategory}`} className="mb-8">
                              <h3 className="text-lg font-semibold mb-4 capitalize border-b pb-2">
                                {subcategory === 'general' ? `General ${type}` : subcategory.replace(/-/g, ' ')}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates.map((template: DocumentTemplate) => (
                                  <DocumentTemplateCard 
                                    key={template.id} 
                                    template={template} 
                                  />
                                ))}
                              </div>
                            </div>
                          ))
                        }
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </TabsContent>
              
              {/* External Templates tab content */}
              <TabsContent value="external">
                <ExternalTemplateLoader />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default DocumentGeneratorPage;
