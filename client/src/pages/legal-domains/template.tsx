import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import DocumentTemplateCard from "@/components/document-generator/DocumentTemplateCard";
import { DocumentTemplate } from "@shared/schema";

interface LegalDomainPageProps {
  title: string;
  description: string;
  templateTypes: string[];
  relatedDomains: Array<{ name: string; path: string }>;
  resources: Array<{ title: string; description: string; link: string }>;
}

function LegalDomainPage({
  title,
  description,
  templateTypes,
  relatedDomains,
  resources
}: LegalDomainPageProps) {
  const [language, setLanguage] = useState<string>("en");
  
  // Fetch templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<DocumentTemplate[]>({
    queryKey: ["/api/document-templates", language],
  });
  
  // Filter templates for this domain
  const domainTemplates = templates.filter(
    (template) => templateTypes.includes(template.templateType)
  );
  
  // Group templates by type
  const templatesByType = domainTemplates.reduce((acc: Record<string, DocumentTemplate[]>, template: DocumentTemplate) => {
    if (!acc[template.templateType]) {
      acc[template.templateType] = [];
    }
    acc[template.templateType].push(template);
    return acc;
  }, {});
  
  // Group templates by subcategory within each type
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
  
  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="mb-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">{title}</h1>
              <p className="text-neutral-600 max-w-3xl">{description}</p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <Link href="/document-generator">
                <Button variant="outline" className="flex items-center">
                  <span className="material-icons text-sm mr-1">arrow_back</span>
                  All Templates
                </Button>
              </Link>
              <Link href="/legal-assistant">
                <Button className="primary-button flex items-center">
                  <span className="material-icons text-sm mr-1">smart_toy</span>
                  Ask Legal Assistant
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Language selector */}
          <div className="inline-flex rounded-md text-xs mb-6">
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
          
          {/* Templates section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Templates</h2>
            
            {isLoadingTemplates ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : domainTemplates.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
                <p className="text-neutral-600 mb-4">No templates found for this legal domain yet.</p>
                <Link href="/document-generator">
                  <Button className="primary-button">
                    Browse All Templates
                  </Button>
                </Link>
              </div>
            ) : (
              <Tabs defaultValue={templateTypes[0]} className="w-full">
                <TabsList className="mb-4 flex overflow-x-auto pb-2 scrollbar-hide">
                  {Object.keys(templatesByType).map((type) => (
                    <TabsTrigger key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}s
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(templatesByType).map(([type, typeTemplates]) => (
                  <TabsContent key={type} value={type}>
                    {/* Display subcategories */}
                    {templatesByTypeAndSubcategory[type] && 
                      Object.entries(templatesByTypeAndSubcategory[type]).map(([subcategory, templates]) => (
                        <div key={`${type}-${subcategory}`} className="mb-8">
                          <h3 className="text-lg font-semibold mb-4 capitalize border-b pb-2">
                            {subcategory === 'general' ? `General ${type.replace('-', ' ')}` : subcategory.replace(/-/g, ' ')}
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
          </div>
          
          {/* Related domains */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Related Legal Domains</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedDomains.map((domain) => (
                <Link key={domain.name} href={domain.path}>
                  <div className="bg-white border border-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    <p className="font-medium text-primary">{domain.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Resources */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Helpful Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resources.map((resource, index) => (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600">{resource.description}</p>
                  </CardContent>
                  <CardFooter>
                    <a href={resource.link} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button variant="outline" className="w-full">
                        Visit Resource
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Legal disclaimer */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 text-primary">
                <span className="material-icons text-2xl">info</span>
              </div>
              <div>
                <h3 className="gradient-text font-bold text-lg mb-2">Legal Disclaimer</h3>
                <p className="text-neutral-600">
                  The information provided on this page is for general informational purposes only and
                  should not be considered as legal advice. Laws and regulations vary by province and
                  may change over time. For specific legal issues, please consult with a qualified lawyer
                  licensed in your jurisdiction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default LegalDomainPage;