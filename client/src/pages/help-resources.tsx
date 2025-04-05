import { t } from "@/lib/i18n";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, HelpCircle, FileText, ExternalLink, BookOpen, PlayCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpResourcesPage() {
  const [currentTab, setCurrentTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqs = [
    {
      question: "How do I create a new document?",
      answer: "To create a new document, navigate to the Document Generator page from the sidebar. You can then either select from our template library or create a custom document from scratch."
    },
    {
      question: "How do I analyze a contract for risks?",
      answer: "Go to the Contract Analysis section, upload your contract document, and our AI will automatically analyze it for potential legal risks and suggest improvements."
    },
    {
      question: "Can I get legal advice from this application?",
      answer: "This application provides general legal information and document templates, but it is not a substitute for personalized legal advice from a qualified lawyer. For specific legal issues, we recommend consulting with a licensed legal professional."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security seriously. All documents and personal information are encrypted, and we do not share your information with third parties without your explicit consent."
    },
    {
      question: "How do I submit a dispute for resolution?",
      answer: "Navigate to the Dispute Resolution section, fill out the required information about your dispute, upload any relevant documents, and submit. Our system will guide you through the process."
    },
    {
      question: "What languages are supported?",
      answer: "Currently, our application supports English and French to accommodate Canada's bilingual requirements."
    }
  ];
  
  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;
  
  const guides = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using LegalAI for your legal needs",
      icon: <BookOpen className="h-6 w-6" />,
      link: "/guides/getting-started"
    },
    {
      title: "Document Generation Tutorial",
      description: "Step-by-step guide to creating legal documents",
      icon: <FileText className="h-6 w-6" />,
      link: "/guides/document-generation"
    },
    {
      title: "Contract Analysis Guide",
      description: "How to analyze contracts for risks and opportunities",
      icon: <Search className="h-6 w-6" />,
      link: "/guides/contract-analysis"
    },
    {
      title: "Legal Research Best Practices",
      description: "Tips for conducting effective legal research",
      icon: <BookOpen className="h-6 w-6" />,
      link: "/guides/legal-research"
    },
    {
      title: "Compliance Checker Tutorial",
      description: "Learn how to verify your business's legal compliance",
      icon: <FileText className="h-6 w-6" />,
      link: "/guides/compliance-checker"
    }
  ];
  
  const videos = [
    {
      title: "Introduction to LegalAI",
      description: "A brief overview of all features and capabilities",
      duration: "5:23",
      thumbnail: "intro-thumbnail.jpg",
      link: "/videos/introduction"
    },
    {
      title: "Creating Your First Document",
      description: "Learn how to create and customize legal documents",
      duration: "8:45",
      thumbnail: "document-thumbnail.jpg",
      link: "/videos/create-document"
    },
    {
      title: "Contract Analysis Walkthrough",
      description: "See how the AI analyzes contracts in real-time",
      duration: "12:17",
      thumbnail: "contract-thumbnail.jpg",
      link: "/videos/contract-analysis"
    },
    {
      title: "Legal Research Techniques",
      description: "Advanced techniques for legal research",
      duration: "15:33",
      thumbnail: "research-thumbnail.jpg",
      link: "/videos/legal-research"
    }
  ];
  
  const legalResources = [
    {
      title: "Canadian Legal Information Institute (CanLII)",
      description: "Access to Canadian court judgments, tribunal decisions, statutes and regulations",
      link: "https://www.canlii.org/"
    },
    {
      title: "Government of Canada - Justice Laws Website",
      description: "Official source for federal laws and regulations",
      link: "https://laws-lois.justice.gc.ca/eng/"
    },
    {
      title: "Department of Justice Canada",
      description: "Information on the Canadian justice system and legal resources",
      link: "https://www.justice.gc.ca/eng/"
    },
    {
      title: "Law Society of Ontario",
      description: "Resources for legal professionals and the public",
      link: "https://lso.ca/"
    },
    {
      title: "Legal Aid Ontario",
      description: "Resources for accessing legal aid services",
      link: "https://www.legalaid.on.ca/"
    }
  ];

  return (
    <MainLayout>
      <div className="container py-6 max-w-5xl">
        <h1 className="text-3xl font-bold mb-2">{t("help_resources")}</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">
          {t("help_resources_description")}
        </p>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <Input 
            className="pl-10" 
            placeholder={t("search_help")} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="faq">{t("faq")}</TabsTrigger>
            <TabsTrigger value="guides">{t("guides")}</TabsTrigger>
            <TabsTrigger value="videos">{t("tutorial_videos")}</TabsTrigger>
            <TabsTrigger value="resources">{t("legal_resources")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("frequently_asked_questions")}</CardTitle>
                <CardDescription>
                  {t("faq_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
                    <h3 className="text-lg font-medium mb-1">{t("no_matching_questions")}</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                      {t("no_matching_questions_message")}
                    </p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left">
                          {searchQuery ? (
                            <span dangerouslySetInnerHTML={{
                              __html: faq.question.replace(
                                new RegExp(searchQuery, 'gi'),
                                match => `<mark class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">${match}</mark>`
                              )
                            }} />
                          ) : (
                            faq.question
                          )}
                        </AccordionTrigger>
                        <AccordionContent>
                          {searchQuery ? (
                            <p className="text-neutral-600 dark:text-neutral-300" dangerouslySetInnerHTML={{
                              __html: faq.answer.replace(
                                new RegExp(searchQuery, 'gi'),
                                match => `<mark class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">${match}</mark>`
                              )
                            }} />
                          ) : (
                            <p className="text-neutral-600 dark:text-neutral-300">{faq.answer}</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="guides" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("user_guides")}</CardTitle>
                <CardDescription>
                  {t("guides_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guides.map((guide, index) => (
                    <Card key={index} className="overflow-hidden hover:border-primary transition-colors cursor-pointer">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 rounded-full p-3 text-primary">
                            {guide.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium mb-1">{guide.title}</h3>
                            <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-3">{guide.description}</p>
                            <Button variant="outline" size="sm">
                              {t("read_guide")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("tutorial_videos")}</CardTitle>
                <CardDescription>
                  {t("videos_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videos.map((video, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden hover:border-primary transition-colors">
                      <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <PlayCircle className="h-12 w-12 text-primary opacity-80" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-medium">{video.title}</h3>
                          <span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                            {video.duration}
                          </span>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-3">{video.description}</p>
                        <Button variant="outline" size="sm">
                          {t("watch_video")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("external_legal_resources")}</CardTitle>
                <CardDescription>
                  {t("resources_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {legalResources.map((resource, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium mb-1">{resource.title}</h3>
                          <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-3">{resource.description}</p>
                          <Button variant="outline" size="sm" className="gap-1" asChild>
                            <a href={resource.link} target="_blank" rel="noopener noreferrer">
                              {t("visit_website")}
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center">
          <p className="text-neutral-600 dark:text-neutral-300 mb-3">{t("still_need_help")}</p>
          <Button variant="outline" size="lg">
            {t("contact_support")}
          </Button>
        </div>
        
      </div>
    </MainLayout>
  );
}