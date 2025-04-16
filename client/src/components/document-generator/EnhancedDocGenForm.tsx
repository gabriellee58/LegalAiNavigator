import { useState, useEffect, useRef } from "react";
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
import { Loader2, FileText, Copy, Printer, Download } from "lucide-react";
import { DocumentTemplate } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import NotarizationGuidance from "./NotarizationGuidance";
import DocumentExportOptions from "./DocumentExportOptions";
import DocumentSectionNavigator from "./DocumentSectionNavigator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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
  // apiRequest already returns parsed JSON data, no need to call .json()
  const data = await apiRequest("POST", "/api/documents/enhanced", {
    template,
    formData,
    documentType,
    jurisdiction,
    saveDocument,
    title
  });
  
  // Return content or the full response if it's a string
  return typeof data === 'string' ? data : (data.content || data);
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
      console.log("Enhanced document generated successfully, length:", documentContent?.length || 0);
      
      // Ensure we have document content
      if (documentContent && documentContent.length > 0) {
        setGeneratedDocument(documentContent);
        
        // Use setTimeout to ensure state is updated before tab switch
        setTimeout(() => {
          setActiveTab("preview");
        }, 100);
        
        toast({
          title: t("document_generated"),
          description: t("document_enhanced_success"),
        });
      } else {
        console.error("Enhanced document generation succeeded but returned empty content");
        toast({
          title: "Document Generation Issue",
          description: "The enhanced document was generated but the content appears to be empty. Please try again.",
          variant: "destructive",
        });
      }
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
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="form" className="flex items-center">
          <span className="material-icons mr-2 text-sm">edit</span>
          {t("form")}
        </TabsTrigger>
        <TabsTrigger 
          value="preview" 
          disabled={!generatedDocument}
          className={`flex items-center ${!generatedDocument ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="material-icons mr-2 text-sm">visibility</span>
          {t("preview")}
          {!generatedDocument && <span className="ml-2 text-xs text-muted-foreground">(Generate first)</span>}
        </TabsTrigger>
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
            {/* Success message */}
            <Alert className="bg-green-50 border-green-200">
              <FileText className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Document Generated Successfully</AlertTitle>
              <AlertDescription className="text-green-700">
                Your enhanced document has been generated. You can review it below, download it, or print it.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-between items-center">
              <DocumentExportOptions 
                documentContent={generatedDocument} 
                documentTitle={`${template.title} - ${new Date().toLocaleDateString()}`}
                showPreviewButton={true}
              />
            </div>
            
            {/* Notarization Guidance */}
            <NotarizationGuidance 
              template={{
                ...template,
                jurisdiction: jurisdiction  // Use the selected jurisdiction
              }} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Document section navigator */}
              <Card className="lg:col-span-1 h-fit">
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Document Sections</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <DocumentSectionNavigator 
                    documentContent={generatedDocument} 
                  />
                </CardContent>
              </Card>
              
              {/* Document preview */}
              <Card className="lg:col-span-3">
                <CardHeader className="py-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Document Preview</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(generatedDocument)}
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.print()}
                      title="Print document"
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadDocument}
                      title="Download as text file"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[60vh] rounded-md border p-4">
                    <div id="document-content" className="bg-white rounded-lg">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {generatedDocument}
                      </pre>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}