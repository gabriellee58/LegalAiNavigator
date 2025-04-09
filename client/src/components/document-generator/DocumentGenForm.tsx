import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { t } from "@/lib/i18n";
import { DocumentTemplate } from "@shared/schema";
import { generateDocument } from "@/lib/openai";

interface DocumentGenFormProps {
  template: DocumentTemplate;
}

function DocumentGenForm({ template }: DocumentGenFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("form");
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  
  // Initialize form with default values
  const form = useForm({
    defaultValues: (template.fields as any[]).reduce((acc: Record<string, string>, field: any) => {
      acc[field.name] = "";
      return acc;
    }, {} as Record<string, string>),
  });
  
  // Generate document mutation
  const { mutate: generateDocumentMutation, isPending, error, reset } = useMutation({
    mutationFn: (data: Record<string, any>) => 
      generateDocument(
        user?.id || 0, 
        template.id, 
        `${template.title} - ${new Date().toLocaleDateString()}`,
        data
      ),
    onSuccess: (data: any) => {
      console.log("Document generation successful, response:", data);
      
      // Ensure we have document content
      if (data && data.documentContent) {
        setGeneratedDocument(data.documentContent);
        
        // Use setTimeout to ensure state is updated before tab switch
        setTimeout(() => {
          setActiveTab("preview");
        }, 100);
        
        toast({
          title: "Document Generated",
          description: "Your document has been successfully generated. You can now preview and download it.",
        });
      } else {
        console.error("Document generation succeeded but no content was returned:", data);
        toast({
          title: "Document Generation Issue",
          description: "The document was generated but the content is missing. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error("Document generation error:", error);
      toast({
        title: "Error Generating Document",
        description: error.message || "There was an error generating your document. Please try again.",
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
    
    const element = document.createElement("a");
    const file = new Blob([generatedDocument], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${template.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="form" className="flex items-center">
          <span className="material-icons mr-2 text-sm">edit</span>
          {t("fill_details")}
        </TabsTrigger>
        <TabsTrigger 
          value="preview" 
          disabled={!generatedDocument}
          className={`flex items-center ${!generatedDocument ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="material-icons mr-2 text-sm">visibility</span>
          {t("preview_document")}
          {!generatedDocument && <span className="ml-2 text-xs text-muted-foreground">(Generate first)</span>}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="form" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(template.fields as any[]).map((field: any) => (
                    <FormField
                      key={field.name}
                      control={form.control}
                      name={field.name}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </FormLabel>
                          <FormControl>
                            {field.type === 'textarea' ? (
                              <Textarea
                                {...formField}
                                placeholder={field.label}
                                className="resize-none"
                                rows={4}
                              />
                            ) : (
                              <Input
                                {...formField}
                                type={field.type}
                                placeholder={field.label}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start mb-4">
                    <span className="material-icons text-red-500 mr-2 mt-0.5">error</span>
                    <div className="flex-1">
                      <p className="font-medium">Document generation failed</p>
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

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    {isPending ? (
                      <>
                        <span className="material-icons animate-spin mr-2">sync</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="material-icons mr-2">description</span>
                        {t("generate_document")}
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
                  <pre className="whitespace-pre-wrap font-mono text-sm">
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

export default DocumentGenForm;
