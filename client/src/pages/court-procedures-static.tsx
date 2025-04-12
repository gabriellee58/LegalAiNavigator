import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, 
  Gavel, 
  FileText,
  Briefcase,
  ArrowRight, 
  ChevronRight,
  Search,
  User,
  Building2,
  Users,
  BookOpen
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAllProcedures, getProcedureById } from '@/data/court-procedures';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { CourtProcedureData } from '@/data/court-procedures/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { withBreadcrumbs } from '@/components/ui/breadcrumb';

const CourtProceduresStaticPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("categories");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<CourtProcedureData | null>(null);
  
  const procedures = getAllProcedures();
  
  const filteredProcedures = searchQuery 
    ? procedures.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : procedures;

  const handleProcedureSelect = (procedureId: string) => {
    console.log("Selecting procedure with ID:", procedureId);
    const procedure = getProcedureById(procedureId);
    console.log("Retrieved procedure:", procedure);
    setSelectedProcedure(procedure || null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'civil':
        return <Scale className="h-5 w-5" />;
      case 'criminal':
        return <Gavel className="h-5 w-5" />;
      case 'family':
        return <Users className="h-5 w-5" />;
      case 'administrative':
        return <Building2 className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // If a procedure is selected, show its detail view
  if (selectedProcedure) {
    return <ProcedureDetail procedure={selectedProcedure} onBack={() => setSelectedProcedure(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-100 to-purple-200">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-purple-900 mb-2">Canadian Court Procedures</h1>
        <p className="text-purple-700 mb-6">
          Navigate the Canadian court system with interactive flowcharts and step-by-step guidance
        </p>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-2 p-1 rounded-lg bg-purple-200 mb-6">
          <Button 
            variant={activeTab === "categories" ? "default" : "ghost"} 
            className={`rounded-md ${activeTab === "categories" ? "bg-white text-purple-900" : "text-purple-700"}`}
            onClick={() => setActiveTab("categories")}
          >
            <FileText className="w-4 h-4 mr-2" /> Categories
          </Button>
          <Button 
            variant={activeTab === "procedures" ? "default" : "ghost"} 
            className={`rounded-md ${activeTab === "procedures" ? "bg-white text-purple-900" : "text-purple-700"}`}
            onClick={() => setActiveTab("procedures")}
          >
            <Briefcase className="w-4 h-4 mr-2" /> Procedures
          </Button>
          <Button 
            variant={activeTab === "flowcharts" ? "default" : "ghost"} 
            className={`rounded-md ${activeTab === "flowcharts" ? "bg-white text-purple-900" : "text-purple-700"}`}
            onClick={() => setActiveTab("flowcharts")}
          >
            <ArrowRight className="w-4 h-4 mr-2" /> Flowcharts
          </Button>
          <Button 
            variant={activeTab === "my-procedures" ? "default" : "ghost"} 
            className={`rounded-md ${activeTab === "my-procedures" ? "bg-white text-purple-900" : "text-purple-700"}`}
            onClick={() => setActiveTab("my-procedures")}
          >
            <User className="w-4 h-4 mr-2" /> My Procedures
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Civil Procedure */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-purple-900">Civil Procedure</CardTitle>
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
              <CardDescription>
                Procedures for civil cases in Canadian courts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Content can be expanded here */}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600"
                onClick={() => handleProcedureSelect('civil-procedure')}
              >
                Browse Procedures <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          {/* Criminal Procedure */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-purple-900">Criminal Procedure</CardTitle>
                <Gavel className="h-6 w-6 text-purple-600" />
              </div>
              <CardDescription>
                Procedures for criminal cases in Canadian courts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Content can be expanded here */}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600"
                onClick={() => handleProcedureSelect('criminal-procedure')}
              >
                Browse Procedures <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          {/* Family Court */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-purple-900">Family Court</CardTitle>
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardDescription>
                Procedures for family law cases in Canadian courts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Content can be expanded here */}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600"
                onClick={() => handleProcedureSelect('family-court')}
              >
                Browse Procedures <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          {/* Small Claims */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-purple-900">Small Claims</CardTitle>
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <CardDescription>
                Procedures for small claims court in Canadian provinces
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Content can be expanded here */}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600"
                onClick={() => handleProcedureSelect('small-claims')}
              >
                Browse Procedures <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>

          {/* Administrative Tribunals */}
          <Card className="bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl text-purple-900">Administrative Tribunals</CardTitle>
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <CardDescription>
                Procedures for administrative tribunals in Canada
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Content can be expanded here */}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600"
                onClick={() => handleProcedureSelect('administrative-tribunals')}
              >
                Browse Procedures <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface ProcedureDetailProps {
  procedure: CourtProcedureData;
  onBack?: () => void;
}

const ProcedureDetail: React.FC<ProcedureDetailProps> = ({ procedure, onBack }) => {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);

  const toggleStepExpanded = (stepId: string) => {
    if (expandedSteps.includes(stepId)) {
      setExpandedSteps(expandedSteps.filter(id => id !== stepId));
    } else {
      setExpandedSteps([...expandedSteps, stepId]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-100 to-purple-200">
      <div className="container mx-auto px-4 py-6">
        {onBack && (
          <Button 
            variant="outline" 
            className="mb-4 bg-white" 
            onClick={onBack}
          >
            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Procedures
          </Button>
        )}
        
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                {procedure.category && procedure.category.toLowerCase() === 'civil' ? 
                  <Scale className="h-5 w-5" /> : <Gavel className="h-5 w-5" />
                }
              </div>
              <div>
                <CardTitle>{procedure.title}</CardTitle>
                <CardDescription>{procedure.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="steps">Procedure Steps</TabsTrigger>
                <TabsTrigger value="documents">Required Documents</TabsTrigger>
                <TabsTrigger value="faqs">FAQs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-muted-foreground">{procedure.overview.summary}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Applicability</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {procedure.overview.applicability.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Jurisdiction</h3>
                    <p className="text-muted-foreground">{procedure.overview.jurisdiction}</p>
                    
                    <h3 className="text-lg font-semibold mt-4 mb-2">Timeframe</h3>
                    <p className="text-muted-foreground">{procedure.overview.timeframe}</p>
                    
                    <h3 className="text-lg font-semibold mt-4 mb-2">Estimated Costs</h3>
                    <p className="text-muted-foreground">{procedure.overview.costRange}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Resources</h3>
                  {procedure.overview.resources && procedure.overview.resources.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1">
                      {procedure.overview.resources.map((resource, index) => (
                        <li key={index}>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {resource.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="steps" className="space-y-4">
                {procedure.steps.map((step, index) => (
                  <Card key={step.id} className="overflow-hidden">
                    <div 
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleStepExpanded(step.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-full bg-primary/10 w-8 h-8 text-primary font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-transform ${expandedSteps.includes(step.id) ? 'rotate-90' : ''}`} />
                    </div>
                    
                    {expandedSteps.includes(step.id) && (
                      <div className="px-4 pb-4 pt-1">
                        <Separator className="mb-3" />
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Details</h4>
                            <p className="text-sm text-muted-foreground">{step.details}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Typical Timeline</h4>
                            <p className="text-sm text-muted-foreground">{step.timeline.description}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">Min: {step.timeline.minDays} day{step.timeline.minDays !== 1 ? 's' : ''}</Badge>
                              <Badge variant="outline">Max: {step.timeline.maxDays} day{step.timeline.maxDays !== 1 ? 's' : ''}</Badge>
                            </div>
                          </div>
                          
                          {step.tips && step.tips.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Tips</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {step.tips.map((tip, i) => (
                                  <li key={i} className="text-sm text-muted-foreground">{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {step.forms && step.forms.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Required Forms</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {step.forms.map((form) => (
                                  <li key={form.id} className="text-sm">
                                    <span className="text-muted-foreground">{form.name}: {form.description}</span>
                                    {form.url && (
                                      <a 
                                        href={form.url}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary ml-1 hover:underline"
                                      >
                                        (View form)
                                      </a>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  The following documents are typically required for {procedure.title.toLowerCase()}:
                </p>
                
                {procedure.requiredDocuments && procedure.requiredDocuments.length > 0 ? (
                  procedure.requiredDocuments.map((doc) => (
                    <Card key={doc.name} className="overflow-hidden">
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-medium">{doc.name}</h3>
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                            <div className="mt-1">
                              <Badge variant="outline">Source: {doc.source}</Badge>
                              {doc.url && (
                                <a 
                                  href={doc.url}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary ml-2 text-sm hover:underline"
                                >
                                  View template
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No document information available.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="faqs" className="space-y-4">
                <div className="space-y-4">
                  {procedure.faqs && procedure.faqs.length > 0 ? (
                    procedure.faqs.map((faq, index) => {
                      const isLastItem = index === procedure.faqs!.length - 1;
                      return (
                        <div key={index} className="space-y-2">
                          <h3 className="font-medium text-lg">Q: {faq.question}</h3>
                          <p className="text-muted-foreground">{faq.answer}</p>
                          {!isLastItem && <Separator className="my-3" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No frequently asked questions available.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const CourtProceduresStaticWithBreadcrumbs = withBreadcrumbs(CourtProceduresStaticPage, [
  { href: '/', label: 'Home' },
  { href: '/court-procedures', label: 'Court Procedures' }
]);

export default CourtProceduresStaticWithBreadcrumbs;