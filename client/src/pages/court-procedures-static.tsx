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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<CourtProcedureData | null>(null);
  
  const procedures = getAllProcedures();
  
  const filteredProcedures = searchQuery 
    ? procedures.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : procedures;

  const handleProcedureSelect = (procedureId: string) => {
    const procedure = getProcedureById(procedureId);
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

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Court Procedures</h1>
        <p className="text-muted-foreground">
          Understand the legal processes and procedures in Canadian courts
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search procedures..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Procedure List */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Available Procedures</CardTitle>
              <CardDescription>
                Select a procedure to view details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 p-2">
                  {filteredProcedures.map((procedure) => (
                    <Button
                      key={procedure.id}
                      variant={selectedProcedure?.id === procedure.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleProcedureSelect(procedure.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-1">
                          {getCategoryIcon(procedure.category)}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{procedure.title}</div>
                          <Badge variant="outline" className="text-xs">
                            {procedure.category}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))}
                  {filteredProcedures.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      No procedures found matching your search
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          {selectedProcedure ? (
            <ProcedureDetail procedure={selectedProcedure} />
          ) : (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Court Procedures Information</CardTitle>
                <CardDescription>
                  Select a procedure from the list to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Canadian court procedures vary by province and court level. Understanding these procedures
                    can help you navigate the legal system more effectively.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {procedures.map((procedure) => (
                      <Card key={procedure.id} className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleProcedureSelect(procedure.id)}>
                        <CardHeader className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-primary/10 p-2">
                              {getCategoryIcon(procedure.category)}
                            </div>
                            <CardTitle className="text-lg">{procedure.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{procedure.description}</p>
                        </CardContent>
                        <CardFooter className="pt-0 pb-3">
                          <Button variant="ghost" size="sm" className="ml-auto">
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

interface ProcedureDetailProps {
  procedure: CourtProcedureData;
}

const ProcedureDetail: React.FC<ProcedureDetailProps> = ({ procedure }) => {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);

  const toggleStepExpanded = (stepId: string) => {
    if (expandedSteps.includes(stepId)) {
      setExpandedSteps(expandedSteps.filter(id => id !== stepId));
    } else {
      setExpandedSteps([...expandedSteps, stepId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            {procedure.category === 'Civil' ? <Scale className="h-5 w-5" /> : <Gavel className="h-5 w-5" />}
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
            
            {procedure.requiredDocuments.map((doc) => (
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
            ))}
          </TabsContent>
          
          <TabsContent value="faqs" className="space-y-4">
            <div className="space-y-4">
              {procedure.faqs.map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-medium text-lg">Q: {faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                  {index < procedure.faqs.length - 1 && <Separator className="my-3" />}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default withBreadcrumbs(CourtProceduresStaticPage, [
  { href: '/', label: 'Home' },
  { href: '/court-procedures', label: 'Court Procedures' }
]);