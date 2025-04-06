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
  const { mutate: generateDocumentMutation, isPending } = useMutation({
    mutationFn: (data: Record<string, any>) => 
      generateDocument(
        user?.id || 0, 
        template.id, 
        `${template.title} - ${new Date().toLocaleDateString()}`,
        data
      ),
    onSuccess: (data: any) => {
      setGeneratedDocument(data.documentContent);
      setActiveTab("preview");
      toast({
        title: "Document Generated",
        description: "Your document has been successfully generated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error generating your document. Please try again.",
        variant: "destructive",
      });
    },
  });
  
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
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="form">{t("fill_details")}</TabsTrigger>
        <TabsTrigger value="preview" disabled={!generatedDocument}>{t("preview_document")}</TabsTrigger>
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
