import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import { t } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import DocumentTemplateCard from "@/components/document-generator/DocumentTemplateCard";
import DocumentGenForm from "@/components/document-generator/DocumentGenForm";
import EnhancedDocGenForm from "@/components/document-generator/EnhancedDocGenForm";
import ExternalTemplateLoader from "@/components/document-generator/ExternalTemplateLoader";
import { DocumentTemplate } from "@shared/schema";
import { check_anthropic_api_key } from "@/lib/utils";

function DocumentGeneratorPage() {
  const [location] = useLocation();
  const [language, setLanguage] = useState<string>("en");
  
  // Extract template ID from URL if present
  const templateId = location.startsWith("/document-generator/") 
    ? parseInt(location.replace("/document-generator/", "")) 
    : null;
  
  // Fetch templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<DocumentTemplate[]>({
    queryKey: ["/api/document-templates", language],
  });
  
  // Fetch selected template if ID is present
  const { data: selectedTemplate, isLoading: isLoadingTemplate } = useQuery<DocumentTemplate>({
    queryKey: [`/api/document-templates/${templateId}`],
    enabled: !!templateId,
  });
  
  // Group templates by type
  const templatesByType = templates.reduce((acc: Record<string, DocumentTemplate[]>, template: DocumentTemplate) => {
    if (!acc[template.templateType]) {
      acc[template.templateType] = [];
    }
    acc[template.templateType].push(template);
    return acc;
  }, {});
  
  // State for tabs
  const [generatorTab, setGeneratorTab] = useState<string>("templates");
  const [hasAnthropicKey, setHasAnthropicKey] = useState<boolean>(false);
  
  // Check if Anthropic API key is available
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const keyAvailable = await check_anthropic_api_key();
        setHasAnthropicKey(keyAvailable);
      } catch (error) {
        console.error("Error checking Anthropic API key:", error);
        setHasAnthropicKey(false);
      }
    };
    
    checkApiKey();
  }, []);
  
  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {templateId && selectedTemplate ? (
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
            
            {/* Tabbed form selection for standard vs enhanced generation */}
            <Tabs defaultValue="standard" className="w-full">
              <TabsList>
                <TabsTrigger value="standard">Standard Document</TabsTrigger>
                {hasAnthropicKey && (
                  <TabsTrigger value="enhanced">
                    <span className="material-icons mr-1 text-sm">auto_awesome</span>
                    Enhanced Document (AI)
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="standard">
                <DocumentGenForm template={selectedTemplate as DocumentTemplate} />
              </TabsContent>
              
              {hasAnthropicKey && (
                <TabsContent value="enhanced">
                  <EnhancedDocGenForm template={selectedTemplate as DocumentTemplate} />
                </TabsContent>
              )}
            </Tabs>
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
            
            {/* Main tabs for the document generator: Templates, External Templates */}
            <Tabs 
              value={generatorTab} 
              onValueChange={setGeneratorTab} 
              className="w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="templates">My Templates</TabsTrigger>
                  <TabsTrigger value="external">
                    <span className="material-icons mr-1 text-sm">cloud_download</span>
                    External Templates
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
                ) : (
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4 flex overflow-x-auto pb-2 scrollbar-hide">
                      <TabsTrigger value="all">All Templates</TabsTrigger>
                      {Object.keys(templatesByType).map((type) => (
                        <TabsTrigger key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}s
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    <TabsContent value="all">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates?.map((template: DocumentTemplate) => (
                          <DocumentTemplateCard key={template.id} template={template} />
                        ))}
                      </div>
                    </TabsContent>
                    
                    {Object.entries(templatesByType).map(([type, typeTemplates]) => (
                      <TabsContent key={type} value={type}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {typeTemplates.map((template: DocumentTemplate) => (
                            <DocumentTemplateCard key={template.id} template={template} />
                          ))}
                        </div>
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
