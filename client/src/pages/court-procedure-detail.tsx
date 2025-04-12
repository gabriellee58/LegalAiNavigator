import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { getProcedureById } from '@/data/court-procedures';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  ExternalLink, 
  FileText, 
  Info, 
  List, 
  MapPin, 
  Scale, 
  Gavel, 
  Home, 
  Coins, 
  Building,
  CheckCircle2, 
  XCircle,
  Lightbulb
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CourtProcedureDetailPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeProvince, setActiveProvince] = useState<string>('ontario');

  // Extract procedure ID from URL
  const procedureId = location.split('/').pop();
  const procedure = procedureId ? getProcedureById(procedureId) : undefined;

  // Function to get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'scale':
        return <Scale className="w-6 h-6" />;
      case 'gavel':
        return <Gavel className="w-6 h-6" />;
      case 'home':
        return <Home className="w-6 h-6" />;
      case 'coins':
        return <Coins className="w-6 h-6" />;
      case 'building':
        return <Building className="w-6 h-6" />;
      default:
        return <Scale className="w-6 h-6" />;
    }
  };

  const handleBack = () => {
    setLocation('/court-procedures');
  };

  if (!procedure) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Court Procedures
        </Button>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Procedure not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/court-procedures">Court Procedures</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{procedure.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {getIconComponent(procedure.icon)}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{procedure.title}</h1>
          <p className="text-lg text-muted-foreground">{procedure.description}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="steps" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span>Steps</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Resources</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {procedure.title}</CardTitle>
              <CardDescription>
                General information about this court procedure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p>{procedure.overview.summary}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Purpose</h3>
                <p>{procedure.overview.purpose}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Applicability</h3>
                <p>{procedure.overview.applicability}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Main Features</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {procedure.overview.mainFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Notice</AlertTitle>
                <AlertDescription>
                  This information is provided as a general guide and is not legal advice. 
                  Procedures may vary by province and individual circumstances. 
                  For specific guidance, consult a legal professional.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Steps Tab */}
        <TabsContent value="steps" className="space-y-6">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Procedure Steps</CardTitle>
              <CardDescription>
                Step-by-step guide to navigating {procedure.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Button 
                  variant={activeProvince === 'ontario' ? 'default' : 'outline'} 
                  onClick={() => setActiveProvince('ontario')}
                  className="justify-start"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Ontario
                </Button>
                <Button 
                  variant={activeProvince === 'quebec' ? 'default' : 'outline'} 
                  onClick={() => setActiveProvince('quebec')}
                  className="justify-start"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Quebec
                </Button>
                <Button 
                  variant={activeProvince === 'britishColumbia' ? 'default' : 'outline'} 
                  onClick={() => setActiveProvince('britishColumbia')}
                  className="justify-start"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  British Columbia
                </Button>
                <Button 
                  variant={activeProvince === 'alberta' ? 'default' : 'outline'} 
                  onClick={() => setActiveProvince('alberta')}
                  className="justify-start"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Alberta
                </Button>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {procedure.steps.map((step, index) => (
                  <AccordionItem key={step.id} value={step.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-start">
                        <div className="flex items-center justify-center bg-primary/10 rounded-full w-8 h-8 text-primary mr-3">
                          {index + 1}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{step.title}</div>
                          <div className="text-sm text-muted-foreground">{step.description}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <p className="mb-2">{step.details}</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-2">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Typical timeframe: {step.timeframe}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Required Documents</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Document</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[100px]">Required</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {step.documents.map((doc, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{doc.name}</TableCell>
                                  <TableCell>{doc.description}</TableCell>
                                  <TableCell>
                                    {doc.required ? (
                                      <div className="flex items-center text-green-600">
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        <span>Yes</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center text-muted-foreground">
                                        <span>Optional</span>
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Key Considerations</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {step.considerations.map((consideration, idx) => (
                              <li key={idx}>{consideration}</li>
                            ))}
                          </ul>
                        </div>
                        
                        {step.provinceSpecific && activeProvince && step.provinceSpecific[activeProvince as keyof typeof step.provinceSpecific] && (
                          <Alert className="bg-primary/5 border-primary/20">
                            <MapPin className="h-4 w-4 text-primary" />
                            <AlertTitle className="text-primary">
                              {activeProvince === 'britishColumbia' ? 'British Columbia' : 
                               activeProvince.charAt(0).toUpperCase() + activeProvince.slice(1)} Specific Information
                            </AlertTitle>
                            <AlertDescription>
                              <p className="mb-2">{step.provinceSpecific[activeProvince as keyof typeof step.provinceSpecific].notes}</p>
                              {step.provinceSpecific[activeProvince as keyof typeof step.provinceSpecific].resources.length > 0 && (
                                <div>
                                  <p className="font-medium text-sm mt-2">Resources:</p>
                                  <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {step.provinceSpecific[activeProvince as keyof typeof step.provinceSpecific].resources.map((resource, idx) => (
                                      <li key={idx}>
                                        <a href={resource} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                                          {resource.replace(/^https?:\/\//, '').split('/')[0]}
                                          <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Common questions about {procedure.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {procedure.faq.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                        <span className="text-left">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      <p>{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>
                Helpful links and resources for {procedure.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Government Resources</h3>
                <ul className="space-y-2">
                  {activeProvince === 'ontario' && (
                    <>
                      <li>
                        <a 
                          href="https://www.ontario.ca/page/court-procedures-ontario" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ontario Court Procedures
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://www.ontario.ca/laws/statute/90c43" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Courts of Justice Act
                        </a>
                      </li>
                    </>
                  )}
                  {activeProvince === 'quebec' && (
                    <>
                      <li>
                        <a 
                          href="https://www.justice.gouv.qc.ca/en/judicial-system/stakeholders-in-the-judicial-system/court-system" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Quebec Court System
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://www.justice.gouv.qc.ca/en/your-disputes" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Resolving Disputes in Quebec
                        </a>
                      </li>
                    </>
                  )}
                  {activeProvince === 'britishColumbia' && (
                    <>
                      <li>
                        <a 
                          href="https://www2.gov.bc.ca/gov/content/justice/courthouse-services" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          BC Courthouse Services
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://www.provincialcourt.bc.ca/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          BC Provincial Court
                        </a>
                      </li>
                    </>
                  )}
                  {activeProvince === 'alberta' && (
                    <>
                      <li>
                        <a 
                          href="https://www.albertacourts.ca/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Alberta Courts
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://www.alberta.ca/justice-and-law.aspx" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Alberta Justice and Law
                        </a>
                      </li>
                    </>
                  )}
                  <li>
                    <a 
                      href="https://www.justice.gc.ca/eng/csj-sjc/just/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Department of Justice Canada
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Legal Aid Resources</h3>
                <ul className="space-y-2">
                  {activeProvince === 'ontario' && (
                    <li>
                      <a 
                        href="https://www.legalaid.on.ca/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Legal Aid Ontario
                      </a>
                    </li>
                  )}
                  {activeProvince === 'quebec' && (
                    <li>
                      <a 
                        href="https://www.csj.qc.ca/commission-des-services-juridiques/Accueil.aspx?lang=en" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Legal Aid Quebec
                      </a>
                    </li>
                  )}
                  {activeProvince === 'britishColumbia' && (
                    <li>
                      <a 
                        href="https://legalaid.bc.ca/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Legal Aid BC
                      </a>
                    </li>
                  )}
                  {activeProvince === 'alberta' && (
                    <li>
                      <a 
                        href="https://www.legalaid.ab.ca/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Legal Aid Alberta
                      </a>
                    </li>
                  )}
                  <li>
                    <a 
                      href="https://www.cleo.on.ca/en" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Community Legal Education Ontario
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Self-Help Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="https://stepstojustice.ca/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Steps to Justice
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.canlii.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Canadian Legal Information Institute (CanLII)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.clicklaw.bc.ca/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Clicklaw (BC)
                    </a>
                  </li>
                </ul>
              </div>

              <Alert className="bg-muted">
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Helpful Tip</AlertTitle>
                <AlertDescription>
                  Most courthouses have information centers or duty counsel services that can provide basic guidance on procedures and forms. Check with your local courthouse for available resources.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Court Procedures
        </Button>
      </div>
    </div>
  );
};

// Add missing component
const HelpCircle = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
};

export default CourtProcedureDetailPage;