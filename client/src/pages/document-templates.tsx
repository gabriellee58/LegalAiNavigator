import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Filter, ChevronRight, Clock, FileText } from "lucide-react";
import { useLocation, Link } from "wouter";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Mock template data with proper typing
interface Template {
  id: number;
  title: string;
  description: string;
  language: string;
  templateType: string;
  templateContent: string;
  fields: unknown;
  // These are mock properties we'll pretend exist without changing the schema
  // for demonstration purposes only
  mockCategory?: string;
  mockLastUpdated?: string;
}

export default function DocumentTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [location] = useLocation();
  
  // Extract category from URL path: /documents/contracts -> "contracts"
  const category = location.startsWith("/documents/") 
    ? location.replace("/documents/", "") 
    : "all";
  
  // Mock data for now
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 1,
      title: "Standard Employment Contract",
      description: "A comprehensive employment agreement suitable for most Canadian employers.",
      language: "en",
      templateType: "contracts",
      templateContent: "Sample contract content",
      fields: {},
      mockCategory: "contracts",
      mockLastUpdated: "2023-12-01"
    },
    {
      id: 2,
      title: "Residential Lease Agreement",
      description: "A standard residential lease agreement compliant with Ontario regulations.",
      language: "en",
      templateType: "leases",
      templateContent: "Sample lease content",
      fields: {},
      mockCategory: "leases",
      mockLastUpdated: "2023-11-15"
    },
    {
      id: 3,
      title: "Simple Will",
      description: "A basic will template suitable for individuals with straightforward estates.",
      language: "en",
      templateType: "wills-estates",
      templateContent: "Sample will content",
      fields: {},
      mockCategory: "wills-estates",
      mockLastUpdated: "2023-10-22"
    },
    {
      id: 4,
      title: "Corporation Registration",
      description: "Documentation required for incorporating a business in Canada.",
      language: "en",
      templateType: "business-formation",
      templateContent: "Sample corporation docs",
      fields: {},
      mockCategory: "business-formation",
      mockLastUpdated: "2023-09-30"
    },
    {
      id: 5,
      title: "Trademark Application",
      description: "Template for filing a trademark application in Canada.",
      language: "en",
      templateType: "ip-management",
      templateContent: "Sample trademark application",
      fields: {},
      mockCategory: "ip-management",
      mockLastUpdated: "2023-08-15"
    }
  ]);

  const filteredTemplates = templates.filter(template => {
    // Filter by category
    if (category !== "all" && template.mockCategory !== category) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !template.title.toLowerCase().includes(searchQuery.toLowerCase()) && !template.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by template type
    if (templateType && templateType !== "all_types" && template.templateType !== templateType) {
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
                  <Link href="/documents/contracts">
                    <div className={`px-3 py-2 rounded-md cursor-pointer ${category === "contracts" ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {t("contracts")}
                    </div>
                  </Link>
                  <Link href="/documents/leases">
                    <div className={`px-3 py-2 rounded-md cursor-pointer ${category === "leases" ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {t("leases")}
                    </div>
                  </Link>
                  <Link href="/documents/wills-estates">
                    <div className={`px-3 py-2 rounded-md cursor-pointer ${category === "wills-estates" ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {t("wills_estates")}
                    </div>
                  </Link>
                  <Link href="/documents/business-formation">
                    <div className={`px-3 py-2 rounded-md cursor-pointer ${category === "business-formation" ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {t("business_formation")}
                    </div>
                  </Link>
                  <Link href="/documents/ip-management">
                    <div className={`px-3 py-2 rounded-md cursor-pointer ${category === "ip-management" ? "bg-primary text-white" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {t("ip_management")}
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
                      value={templateType || "all_types"} 
                      onValueChange={setTemplateType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("all_types")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_types">{t("all_types")}</SelectItem>
                        <SelectItem value="contracts">{t("contracts")}</SelectItem>
                        <SelectItem value="leases">{t("leases")}</SelectItem>
                        <SelectItem value="wills-estates">{t("wills_estates")}</SelectItem>
                        <SelectItem value="business-formation">{t("business_formation")}</SelectItem>
                        <SelectItem value="ip-management">{t("ip_management")}</SelectItem>
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
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                      <Search className="h-6 w-6 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">{t("no_templates_found")}</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                      {t("no_templates_message")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTemplates.map((template) => (
                      <div key={template.id} className="border rounded-lg overflow-hidden hover:border-primary transition-colors">
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${getCategoryColor(template.mockCategory || '')}`}>
                                  {t(template.mockCategory || '')}
                                </Badge>
                                <span className="text-xs text-neutral-500">
                                  <Clock className="inline h-3 w-3 mr-1" />
                                  {template.mockLastUpdated}
                                </span>
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