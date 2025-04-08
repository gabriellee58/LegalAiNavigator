import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { DocumentTemplate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface EnhancedDocGenFormProps {
  template: DocumentTemplate;
}

// Function to generate document with Anthropic
async function generateEnhancedDocument(
  template: string,
  formData: Record<string, any>,
  documentType: string, 
  jurisdiction: string = 'Canada',
  saveDocument: boolean = false,
  title?: string,
) {
  const response = await apiRequest("POST", "/api/documents/enhanced", {
    template,
    formData,
    documentType,
    jurisdiction,
    saveDocument,
    title
  });
  
  const data = await response.json();
  return data.content;
}

export default function EnhancedDocGenForm({ template }: EnhancedDocGenFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("form");
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [saveDocument, setSaveDocument] = useState(true);
  const [jurisdiction, setJurisdiction] = useState<string>("Canada");
  
  // Canadian jurisdictions list
  const jurisdictions = [
    "Canada",
    "Ontario",
    "Quebec",
    "British Columbia",
    "Alberta",
    "Manitoba",
    "Saskatchewan",
    "Nova Scotia",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Prince Edward Island",
    "Northwest Territories",
    "Yukon",
    "Nunavut"
  ];
  
  // Initialize form with default values
  const form = useForm({
    defaultValues: {
      documentTitle: `${template.title} - ${new Date().toLocaleDateString()}`,
      ...(Array.isArray(template.fields) 
        ? template.fields.reduce((acc: Record<string, string>, field: any) => {
            acc[field.name] = "";
            return acc;
          }, {} as Record<string, string>)
        : {})
    },
  });
  
  // Generate document mutation
  const { mutate: generateDocumentMutation, isPending, error, reset } = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        // Process original template with field values
        let processedTemplate = template.templateContent;
        
        // Exclude documentTitle from form data to be sent to API
        const { documentTitle, ...formData } = data;
        
        // First perform basic variable replacement (will be enhanced by Anthropic)
        for (const [key, value] of Object.entries(formData)) {
          const placeholder = new RegExp(`\\[${key.toUpperCase()}\\]`, 'g');
          processedTemplate = processedTemplate.replace(placeholder, value?.toString() || '');
        }
        
        // Generate enhanced document with Anthropic
        const result = await generateEnhancedDocument(
          processedTemplate,
          formData,
          template.templateType,
          jurisdiction,
          saveDocument,
          documentTitle
        );
        
        return result;
      } catch (err) {
        console.error("Enhanced document generation error:", err);
        // Enhance error message for common AI service issues
        if (err instanceof Error) {
          if (err.message.includes("429") || err.message.includes("rate limit")) {
            throw new Error("AI service is currently experiencing high demand. Please try again in a few minutes.");
          }
          if (err.message.includes("401") || err.message.includes("authentication")) {
            throw new Error("Authentication error with AI service. Please check your API keys and try again.");
          }
          throw err;
        }
        throw new Error("An unexpected error occurred while generating your enhanced document.");
      }
    },
    onSuccess: (documentContent: string) => {
      setGeneratedDocument(documentContent);
      setActiveTab("preview");
      toast({
        title: t("document_generated"),
        description: t("document_enhanced_success"),
      });
    },
    onError: (error: Error) => {
      console.error("Document generation error:", error);
      toast({
        title: "AI Document Generation Error",
        description: error.message || t("document_generation_error"),
        variant: "destructive",
      });
    },
  });
  
  // Function to retry document generation after error
  const retryGeneration = () => {
    reset();
    const formData = form.getValues();
    generateDocumentMutation(formData);
  };
  
  const onSubmit = (data: Record<string, any>) => {
    generateDocumentMutation(data);
  };
  
  // Download document as txt file
  const downloadDocument = () => {
    if (!generatedDocument) return;
    
    const filename = form.getValues("documentTitle") || "document.txt";
    const element = document.createElement("a");
    const file = new Blob([generatedDocument], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="form">{t("form")}</TabsTrigger>
        <TabsTrigger value="preview">{t("preview")}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="form">
        <Card>
          <CardHeader>
            <CardTitle>{t("generate_document_enhanced")}</CardTitle>
            <CardDescription>
              {t("complete_form_fields_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Document title field */}
                <FormField
                  control={form.control}
                  name="documentTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("document_title")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Jurisdiction selector */}
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">{t("jurisdiction")}</Label>
                  <Select 
                    value={jurisdiction} 
                    onValueChange={setJurisdiction}
                  >
                    <SelectTrigger id="jurisdiction">
                      <SelectValue placeholder={t("select_jurisdiction")} />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictions.map(j => (
                        <SelectItem key={j} value={j}>{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Save document switch */}
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="save-document" 
                    checked={saveDocument}
                    onCheckedChange={setSaveDocument}
                  />
                  <Label htmlFor="save-document">{t("save_to_my_documents")}</Label>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">{t("document_fields")}</h3>
                  
                  <div className="space-y-4">
                    {Array.isArray(template.fields) && template.fields.map((field: any) => {
                      // For text inputs
                      if (field.type === 'text' || field.type === 'date' || field.type === 'number') {
                        return (
                          <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...formField} 
                                    type={field.type} 
                                    required={field.required}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      }
                      
                      // For textareas
                      if (field.type === 'textarea') {
                        return (
                          <FormField
                            key={field.name}
                            control={form.control}
                            name={field.name}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...formField} 
                                    required={field.required}
                                    className="min-h-[100px]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        );
                      }
                      
                      return null;
                    })}
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start mb-4">
                    <span className="material-icons text-red-500 mr-2 mt-0.5">error</span>
                    <div className="flex-1">
                      <p className="font-medium">AI Document Generation Failed</p>
                      <p className="text-sm">{error instanceof Error ? error.message : "An unexpected error occurred. Please try again."}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={retryGeneration}
                      className="ml-2 text-xs"
                    >
                      <span className="material-icons text-sm mr-1">refresh</span>
                      Retry
                    </Button>
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full lg:w-auto bg-primary hover:bg-primary-dark"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("generating")}
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-1 text-sm">auto_awesome</span>
                        {t("generate_enhanced_document")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="preview" className="mt-4">
        {generatedDocument && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={downloadDocument} className="bg-primary hover:bg-primary-dark">
                <span className="material-icons mr-2">download</span>
                {t("download_document")}
              </Button>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="bg-white p-6 border rounded-lg shadow-sm">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {generatedDocument}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}