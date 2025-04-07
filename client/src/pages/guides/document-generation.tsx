import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DocumentGenerationTutorialPage() {
  const documentCategories = [
    {
      name: "Employment",
      documents: ["Employment Contracts", "Termination Letters", "Non-Disclosure Agreements", "Independent Contractor Agreements"]
    },
    {
      name: "Real Estate",
      documents: ["Lease Agreements", "Purchase Agreements", "Rental Applications", "Property Disclosure Statements"]
    },
    {
      name: "Business",
      documents: ["Partnership Agreements", "Service Contracts", "Business Plans", "Incorporation Documents"]
    },
    {
      name: "Family Law",
      documents: ["Separation Agreements", "Prenuptial Agreements", "Child Support Agreements", "Wills and Estates"]
    },
    {
      name: "Immigration",
      documents: ["Sponsorship Letters", "Declaration Forms", "Support Letters", "Statutory Declarations"]
    },
  ];

  const steps = [
    {
      title: "Select a template",
      description: "Choose from our library of legal document templates organized by category.",
      content: (
        <div className="space-y-4">
          <p>Our document generator offers hundreds of legal templates across various categories:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {documentCategories.map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{category.name}</h4>
                <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-300">
                  {category.documents.map((doc, docIndex) => (
                    <li key={docIndex} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <p className="text-sm">
            To select a template, navigate to the Document Generator page, browse categories or use the search function to find the document you need.
          </p>
        </div>
      )
    },
    {
      title: "Customize your document",
      description: "Fill in your specific information to personalize the document.",
      content: (
        <div className="space-y-4">
          <p>Once you've selected a template, you'll be guided through a form with all the necessary fields:</p>
          
          <div className="space-y-4 mt-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Required Information</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                The form will prompt you for all required information specific to the document type. Required fields are marked with an asterisk (*).
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Legal Customization</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                You can specify the jurisdiction (province or territory) to ensure the document complies with local laws.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">AI Suggestions</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Our AI will provide suggestions and help fill in some fields based on context and legal requirements.
              </p>
            </div>
          </div>
          
          <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-600">Important</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-400">
              Always verify that all information is accurate and complete before finalizing your document.
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: "Preview and edit",
      description: "Review your document and make any necessary changes.",
      content: (
        <div className="space-y-4">
          <p>After filling in all required information, you'll see a preview of your document:</p>
          
          <div className="space-y-4 mt-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Document Preview</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Review the complete document to ensure all information is correct and the formatting is as expected.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Inline Editing</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                You can edit specific sections directly in the preview if needed. Click on a paragraph to make changes.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Legal Review</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                The AI will highlight any potential issues or missing information that might be important for your document.
              </p>
            </div>
          </div>
          
          <p className="text-sm">
            Take your time to review the document thoroughly. You can always go back to previous steps to make changes.
          </p>
        </div>
      )
    },
    {
      title: "Save and download",
      description: "Save your document to your account and download in your preferred format.",
      content: (
        <div className="space-y-4">
          <p>Once you're satisfied with your document, you can save and download it:</p>
          
          <div className="space-y-4 mt-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Save to Your Account</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Save the document to your account to access it later or make future edits.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Download Options</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Download your document in various formats:
              </p>
              <ul className="text-sm mt-2 space-y-1 text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span>PDF - Best for printing and sharing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span>DOCX - For editing in Microsoft Word</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span>TXT - Plain text format</span>
                </li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Share Options</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Share your document directly via email or generate a secure link to share with others.
              </p>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Remember</AlertTitle>
            <AlertDescription>
              LegalAI provides templates and assistance but is not a substitute for professional legal advice. For complex legal matters, we recommend consulting with a qualified legal professional.
            </AlertDescription>
          </Alert>
        </div>
      )
    }
  ];

  const tips = [
    {
      title: "Use the right template",
      description: "Make sure you select the appropriate template for your specific legal need."
    },
    {
      title: "Be thorough and accurate",
      description: "Fill in all information accurately and completely to ensure your document is legally sound."
    },
    {
      title: "Consider jurisdiction",
      description: "Laws vary by province and territory, so ensure you select the correct jurisdiction."
    },
    {
      title: "Save your work",
      description: "Regularly save your document to prevent losing your progress."
    },
    {
      title: "Seek professional review",
      description: "For important legal matters, have a legal professional review your final document."
    }
  ];

  return (
    <MainLayout>
      <div className="container py-6 max-w-4xl">
        <div className="mb-6">
          <Link href="/help-resources">
            <Button variant="ghost" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t("back_to_resources")}
            </Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">{t("document_generation_tutorial")}</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-8">
          {t("document_generation_description")}
        </p>
        
        <Tabs defaultValue="tutorial" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tutorial">{t("step_by_step_tutorial")}</TabsTrigger>
            <TabsTrigger value="tips">{t("tips_and_best_practices")}</TabsTrigger>
            <TabsTrigger value="examples">{t("example_documents")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tutorial" className="space-y-6">
            {steps.map((step, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center text-primary font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle>{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {step.content}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("tips_and_best_practices")}</CardTitle>
                <CardDescription>
                  {t("tips_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tips.map((tip, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {tip.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        {tip.description}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 border rounded-lg bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                  <h3 className="font-medium mb-2 text-blue-700 dark:text-blue-400">Legal Disclaimer</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    The documents generated by LegalAI are intended to serve as templates and general guidance. They are not a substitute for professional legal advice. Laws vary by jurisdiction and change over time. For complex legal matters or situations with significant legal consequences, we recommend consulting with a qualified legal professional.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("example_documents")}</CardTitle>
                <CardDescription>
                  {t("examples_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentCategories.slice(0, 2).map((category, index) => (
                    <div key={index}>
                      <h3 className="font-medium mb-3">{category.name} Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.documents.map((doc, docIndex) => (
                          <div key={docIndex} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{doc}</h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">
                              View an example of a completed {doc.toLowerCase()} document.
                            </p>
                            <Button variant="outline" size="sm">
                              View Example
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="gap-2">
                      Browse All Examples
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("ready_to_create_a_document")}</CardTitle>
              <CardDescription>
                {t("ready_to_create_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button className="w-full sm:w-auto">{t("go_to_document_generator")}</Button>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {t("document_generator_help")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}