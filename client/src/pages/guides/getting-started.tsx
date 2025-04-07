import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function GettingStartedGuidePage() {
  const sections = [
    {
      title: "Create your account",
      description: "First, sign up for a LegalAI account to access all features and save your work.",
      steps: [
        "Navigate to the sign-up page",
        "Enter your email address and create a password",
        "Verify your email address",
        "Complete your profile with your basic information"
      ],
      completed: true
    },
    {
      title: "Explore the dashboard",
      description: "Familiarize yourself with the main dashboard where you'll find all the tools and features.",
      steps: [
        "Browse the sidebar to see available tools",
        "View your recent documents and activities",
        "Check notifications for updates and recommendations",
        "Set your language preference (English or French)"
      ],
      completed: true
    },
    {
      title: "Generate your first document",
      description: "Create a legal document using our AI-powered document generation tool.",
      steps: [
        "Go to Document Generator",
        "Select a template from our library",
        "Fill in the required information",
        "Preview and make any necessary edits",
        "Download or save your document"
      ],
      completed: false
    },
    {
      title: "Analyze a contract",
      description: "Use our AI to analyze contracts for potential risks and areas of improvement.",
      steps: [
        "Navigate to Contract Analysis",
        "Upload your contract or paste the text",
        "Wait for the AI to analyze the document",
        "Review risks, suggestions, and the summary",
        "Export the analysis report if needed"
      ],
      completed: false
    },
    {
      title: "Conduct legal research",
      description: "Use our advanced legal research tool to find relevant laws and case precedents.",
      steps: [
        "Go to Legal Research",
        "Enter your query and select jurisdiction",
        "Review the research results",
        "Save important citations for later reference",
        "Export your research findings"
      ],
      completed: false
    }
  ];

  const relatedGuides = [
    {
      title: "Document Generation Tutorial",
      description: "Learn how to create and customize legal documents",
      link: "/guides/document-generation"
    },
    {
      title: "Contract Analysis Guide",
      description: "How to analyze contracts for risks and opportunities",
      link: "/guides/contract-analysis"
    },
    {
      title: "Legal Research Best Practices",
      description: "Tips for effective legal research using our platform",
      link: "/guides/legal-research"
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
        
        <h1 className="text-3xl font-bold mb-2">{t("getting_started_guide")}</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-8">
          {t("getting_started_description")}
        </p>
        
        <div className="space-y-6 mb-8">
          {sections.map((section, index) => (
            <Card key={index} className={section.completed ? "border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 rounded-full p-1 ${section.completed ? "text-green-600" : "text-neutral-400"}`}>
                    {section.completed ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2">
                      {index + 1}. {section.title}
                      {section.completed && <span className="ml-2 text-sm text-green-600">(Completed)</span>}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-300 mb-4">{section.description}</p>
                    
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-4">
                      <h4 className="font-medium mb-2">{t("step_by_step")}:</h4>
                      <ul className="space-y-2">
                        {section.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2">
                            <span className="text-primary font-medium">{stepIndex + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {!section.completed && (
                      <Button variant="outline" size="sm">
                        {index === 2 ? t("go_to_document_generator") : 
                         index === 3 ? t("go_to_contract_analysis") : 
                         index === 4 ? t("go_to_legal_research") : t("learn_more")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("tips_for_success")}</CardTitle>
            <CardDescription>
              {t("maximizing_platform_benefits")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{t("save_your_work")}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Always save your documents and research to access them later from any device.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{t("use_templates")}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Start with our templates to save time and ensure your documents include all necessary elements.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{t("verify_jurisdiction")}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Always verify that you're selecting the right province or territory for jurisdiction-specific documents.
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{t("review_documents")}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Always review AI-generated content for accuracy before finalizing documents or making decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("related_guides")}</CardTitle>
            <CardDescription>
              {t("continue_learning")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relatedGuides.map((guide, index) => (
                <Link key={index} href={guide.link}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <div>
                      <h3 className="font-medium">{guide.title}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">{guide.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-400" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}