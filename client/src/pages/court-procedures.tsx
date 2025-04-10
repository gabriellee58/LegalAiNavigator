import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowRight, Info, FileText, GitPullRequest, List, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Court Procedure Types
interface ProcedureCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

interface ProcedureStep {
  id: number;
  procedureId: number;
  title: string;
  description: string;
  stepOrder: number;
  estimatedTime?: string;
  requiredDocuments?: string[];
  instructions?: string;
  tips?: string[];
  warnings?: string[];
  fees?: Record<string, string>;
  isOptional: boolean;
  nextStepIds?: number[];
  alternatePathInfo?: string | null;
  sourceReferences?: { name: string; url: string }[];
}

// Timeline node for visualizing procedure flow
interface TimelineNode {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  children?: string[];
  position?: { x: number; y: number };
  duration?: string;
  deadline?: string;
}

// Flowchart structure for visualizing procedure
interface FlowchartData {
  nodes: TimelineNode[];
  edges: { source: string; target: string; label?: string }[];
  layout?: 'vertical' | 'horizontal';
}

// Timeframe definitions
interface EstimatedTimeframe {
  stepId?: number;
  phaseName?: string;
  minDuration: string;
  maxDuration: string;
  factors?: { factor: string; impact: string }[];
}

// Court fee structure
interface CourtFee {
  name: string;
  amount: string;
  description?: string;
  optional: boolean;
  conditions?: string;
  exemptionInfo?: string;
}

// Legal requirements
interface Requirement {
  type: string;
  description: string;
  mandatory: boolean;
  jurisdictionSpecific?: boolean;
  references?: { description: string; url?: string }[];
}

// Related forms
interface RelatedForm {
  id: number;
  name: string;
  description?: string;
  templateId?: number; // Reference to document template if available
  url?: string;
}

interface Procedure {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  jurisdiction: string;
  steps: ProcedureStep[];
  flowchartData: FlowchartData;
  estimatedTimeframes: EstimatedTimeframe[];
  courtFees: CourtFee[];
  requirements: Requirement[];
  sourceName?: string;
  sourceUrl?: string;
  relatedForms?: RelatedForm[];
  isActive: boolean;
}

interface ProcedureDetail extends Procedure {
  steps: ProcedureStep[];
}

interface UserProcedure {
  id: number;
  userId: number;
  procedureId: number;
  currentStepId: number;
  title: string;
  notes?: string | null;
  status: string;
  progress: number;
  completedSteps: number[];
  startedAt: string;
  lastActivityAt: string;
  expectedCompletionDate?: string | null;
  completedAt?: string | null;
  caseSpecificData?: {
    caseNumber?: string;
    courtLocation?: string;
    hearingDates?: string[];
    parties?: { name: string; role: string }[];
    filingDeadlines?: { name: string; date: string }[];
    additionalNotes?: string;
    customFields?: Record<string, string>;
  };
}

interface UserProcedureDetail extends UserProcedure {
  procedure: Procedure;
  steps: ProcedureStep[];
  currentStep: ProcedureStep;
}

const CourtProceduresPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedProcedureId, setSelectedProcedureId] = useState<number | null>(null);
  const [selectedUserProcedureId, setSelectedUserProcedureId] = useState<number | null>(null);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery<ProcedureCategory[]>({
    queryKey: ['/api/court-procedures/categories'],
    enabled: activeTab === "categories" || activeTab === "browse",
  });

  // Fetch user's procedures
  const { data: userProcedures, isLoading: userProceduresLoading, error: userProceduresError } = useQuery<UserProcedure[]>({
    queryKey: ['/api/court-procedures/user'],
    enabled: !!user && activeTab === "my-procedures",
  });

  // Fetch procedures for selected category
  const { data: procedures, isLoading: proceduresLoading, error: proceduresError } = useQuery<Procedure[]>({
    queryKey: ['/api/court-procedures/categories', selectedCategoryId, 'procedures'],
    enabled: !!selectedCategoryId && activeTab === "browse",
  });

  // Fetch detailed procedure info
  const { data: procedureDetail, isLoading: procedureDetailLoading, error: procedureDetailError } = useQuery<ProcedureDetail>({
    queryKey: ['/api/court-procedures/procedures', selectedProcedureId],
    enabled: !!selectedProcedureId,
  });

  // Fetch user procedure detail
  const { data: userProcedureDetail, isLoading: userProcedureDetailLoading, error: userProcedureDetailError } = useQuery<UserProcedureDetail>({
    queryKey: ['/api/court-procedures/user', selectedUserProcedureId],
    enabled: !!selectedUserProcedureId,
  });

  // Handle Category Selection
  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setActiveTab("browse");
  };

  // Handle Procedure Selection
  const handleProcedureSelect = (procedureId: number) => {
    setSelectedProcedureId(procedureId);
    setActiveTab("procedure-detail");
  };

  // Handle User Procedure Selection
  const handleUserProcedureSelect = (userProcedureId: number) => {
    setSelectedUserProcedureId(userProcedureId);
    setActiveTab("user-procedure-detail");
  };

  // Return to categories list
  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setActiveTab("categories");
  };

  // Return to procedures list
  const handleBackToProcedures = () => {
    setSelectedProcedureId(null);
    setActiveTab("browse");
  };

  // Return to user procedures list
  const handleBackToUserProcedures = () => {
    setSelectedUserProcedureId(null);
    setActiveTab("my-procedures");
  };

  // Convert icon name to component
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'scale':
        return <GitPullRequest className="w-6 h-6" />;
      case 'gavel':
        return <FileText className="w-6 h-6" />;
      case 'home':
        return <Info className="w-6 h-6" />;
      case 'coins':
        return <List className="w-6 h-6" />;
      case 'building':
        return <CheckSquare className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  // Loading states
  if (!activeTab) {
    return (
      <div className="container mx-auto py-6 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 min-h-screen">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Canadian Court Procedures</h1>
          <p className="text-lg text-muted-foreground">
            Navigate the Canadian court system with interactive flowcharts and step-by-step guidance
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="browse" disabled={!selectedCategoryId}>
              Browse Procedures
            </TabsTrigger>
            <TabsTrigger value="my-procedures">My Procedures</TabsTrigger>
            <TabsTrigger value="procedure-detail" disabled={!selectedProcedureId}>
              Procedure Details
            </TabsTrigger>
            <TabsTrigger value="user-procedure-detail" disabled={!selectedUserProcedureId}>
              My Procedure Details
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            {categoriesLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : categoriesError ? (
              <div className="rounded-lg bg-red-50 p-6 text-center">
                <p className="text-red-700">Error loading categories. Please try again.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories?.map((category: ProcedureCategory) => (
                  <Card key={category.id} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {getIconComponent(category.icon)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base min-h-[60px]">
                        {category.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleCategorySelect(category.id)} 
                        className="w-full"
                      >
                        Browse Procedures <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Browse Procedures Tab */}
          <TabsContent value="browse" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" onClick={handleBackToCategories}>
                ← Back to Categories
              </Button>
              {selectedCategoryId && categories?.find((c: ProcedureCategory) => c.id === selectedCategoryId) && (
                <h2 className="text-2xl font-semibold">
                  {categories.find((c: ProcedureCategory) => c.id === selectedCategoryId)?.name} Procedures
                </h2>
              )}
            </div>

            {proceduresLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : proceduresError ? (
              <div className="rounded-lg bg-red-50 p-6 text-center">
                <p className="text-red-700">Error loading procedures. Please try again.</p>
              </div>
            ) : procedures?.length === 0 ? (
              <div className="rounded-lg bg-muted p-6 text-center">
                <p className="text-muted-foreground">No procedures found for this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {procedures?.map((procedure: Procedure) => (
                  <Card key={procedure.id}>
                    <CardHeader>
                      <CardTitle>{procedure.name}</CardTitle>
                      <CardDescription>{procedure.jurisdiction}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">{procedure.description}</p>
                      <div className="font-medium mt-4">Estimated Timeline:</div>
                      <p className="text-sm text-muted-foreground">
                        {procedure.estimatedTimeframes?.total || "Varies"}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => handleProcedureSelect(procedure.id)}>
                        View Details
                      </Button>
                      {user && (
                        <Button onClick={() => {
                          // This will be implemented with a modal in the future
                          toast({
                            title: "Feature Coming Soon",
                            description: "Starting your own procedure will be available soon.",
                          });
                        }}>
                          Start Procedure
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Procedures Tab */}
          <TabsContent value="my-procedures" className="space-y-4">
            {!user ? (
              <div className="rounded-lg bg-blue-50 p-6 text-center">
                <p className="text-blue-700">
                  Please <Link href="/auth"><a className="underline">log in</a></Link> to view your court procedures.
                </p>
              </div>
            ) : userProceduresLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : userProceduresError ? (
              <div className="rounded-lg bg-red-50 p-6 text-center">
                <p className="text-red-700">Error loading your procedures. Please try again.</p>
              </div>
            ) : userProcedures?.length === 0 ? (
              <div className="rounded-lg bg-muted p-6 text-center">
                <p className="text-muted-foreground">
                  You haven't started any court procedures yet. Browse the categories to begin.
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("categories")}>
                  Browse Procedures
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userProcedures?.map((userProcedure: UserProcedure) => (
                  <Card key={userProcedure.id}>
                    <CardHeader>
                      <CardTitle>{userProcedure.title}</CardTitle>
                      <CardDescription>
                        Status: 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          userProcedure.status === 'active' ? 'bg-green-100 text-green-800' :
                          userProcedure.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {userProcedure.status.charAt(0).toUpperCase() + userProcedure.status.slice(1)}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm mb-2">
                        Started: {new Date(userProcedure.startedAt).toLocaleDateString()}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${userProcedure.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Progress: {userProcedure.progress}%
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handleUserProcedureSelect(userProcedure.id)}
                      >
                        Continue Procedure
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Procedure Detail Tab */}
          <TabsContent value="procedure-detail" className="space-y-6">
            <Button variant="outline" onClick={handleBackToProcedures}>
              ← Back to Procedures
            </Button>

            {procedureDetailLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : procedureDetailError ? (
              <div className="rounded-lg bg-red-50 p-6 text-center">
                <p className="text-red-700">Error loading procedure details. Please try again.</p>
              </div>
            ) : procedureDetail ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold">{procedureDetail?.name || 'Procedure'}</h2>
                  {procedureDetail?.jurisdiction && (
                    <p className="text-muted-foreground">Jurisdiction: {procedureDetail.jurisdiction}</p>
                  )}
                  {procedureDetail?.description && (
                    <p className="my-4">{procedureDetail.description}</p>
                  )}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Estimated Timeline</h3>
                      {procedureDetail.estimatedTimeframes && Array.isArray(procedureDetail.estimatedTimeframes) ? (
                        <div className="text-sm space-y-1">
                          {procedureDetail.estimatedTimeframes.map((timeframe, index) => (
                            <p key={index}>
                              <span className="text-muted-foreground">{timeframe.phaseName || 'Phase'}:</span> {timeframe.minDuration} - {timeframe.maxDuration}
                            </p>
                          ))}
                        </div>
                      ) : procedureDetail.estimatedTimeframes && typeof procedureDetail.estimatedTimeframes === 'object' ? (
                        <>
                          <p className="text-muted-foreground mb-1">Total: {(procedureDetail.estimatedTimeframes as any).total || "Varies"}</p>
                          {(procedureDetail.estimatedTimeframes as any).phases && (
                            <div className="text-sm space-y-1">
                              {Object.entries((procedureDetail.estimatedTimeframes as any).phases).map(([phase, time]) => (
                                <p key={phase}>
                                  <span className="text-muted-foreground">{phase}:</span> {time}
                                </p>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground mb-1">Varies based on case complexity</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Court Fees</h3>
                      {procedureDetail.courtFees && Array.isArray(procedureDetail.courtFees) ? (
                        <div className="text-sm space-y-1">
                          {procedureDetail.courtFees.map((fee, index) => (
                            <p key={index}>
                              <span className="text-muted-foreground">{fee.name}:</span> {fee.amount}
                              {fee.optional && <span className="ml-1 text-xs">(Optional)</span>}
                            </p>
                          ))}
                        </div>
                      ) : procedureDetail.courtFees && typeof procedureDetail.courtFees === 'object' ? (
                        <div className="text-sm space-y-1">
                          {Object.entries(procedureDetail.courtFees as Record<string, string>).map(([fee, amount]) => (
                            <p key={fee}>
                              <span className="text-muted-foreground">{fee}:</span> {amount}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground mb-1">Fee information unavailable</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Procedure Steps</h3>
                  <div className="space-y-4">
                    {procedureDetail.steps?.map((step: ProcedureStep, index: number) => (
                      <Card key={step.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                          <CardTitle>
                            {index + 1}. {step.title}
                          </CardTitle>
                          {step.estimatedTime && (
                            <CardDescription>
                              Estimated time: {step.estimatedTime}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p>{step.description}</p>
                          
                          {step.instructions && (
                            <div>
                              <h4 className="font-semibold mb-1">Instructions</h4>
                              <p className="text-sm">{step.instructions}</p>
                            </div>
                          )}
                          
                          {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-1">Required Documents</h4>
                              <ul className="list-disc pl-5 text-sm">
                                {step.requiredDocuments.map((doc, i) => (
                                  <li key={i}>{doc}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {step.tips && step.tips.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-1">Tips</h4>
                              <ul className="list-disc pl-5 text-sm">
                                {step.tips.map((tip, i) => (
                                  <li key={i}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {step.warnings && step.warnings.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-1 text-amber-700">Warnings</h4>
                              <ul className="list-disc pl-5 text-sm text-amber-700">
                                {step.warnings.map((warning, i) => (
                                  <li key={i}>{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {procedureDetail.relatedForms && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Related Forms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(procedureDetail.relatedForms) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {procedureDetail.relatedForms.map((form, index) => (
                            <div key={index} className="flex items-center">
                              <FileText className="w-5 h-5 mr-2 text-primary" />
                              <span>
                                <strong>{form.name}</strong>
                                {form.description && <p className="text-sm text-muted-foreground">{form.description}</p>}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : typeof procedureDetail.relatedForms === 'object' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(procedureDetail.relatedForms as Record<string, string>).map(([formId, formName]) => (
                            <div key={formId} className="flex items-center">
                              <FileText className="w-5 h-5 mr-2 text-primary" />
                              <span>
                                <strong>{formId}:</strong> {formName}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Form information unavailable</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {procedureDetail.sourceUrl && (
                  <div className="text-sm text-muted-foreground">
                    <p>Source: <a href={procedureDetail.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">{procedureDetail.sourceName || procedureDetail.sourceUrl}</a></p>
                  </div>
                )}

                {user && (
                  <div className="flex justify-center pt-4">
                    <Button size="lg" onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Starting your own procedure will be available soon.",
                      });
                    }}>
                      Start This Procedure
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-6 text-center">
                <p className="text-muted-foreground">Procedure not found.</p>
              </div>
            )}
          </TabsContent>

          {/* User Procedure Detail Tab */}
          <TabsContent value="user-procedure-detail" className="space-y-6">
            <Button variant="outline" onClick={handleBackToUserProcedures}>
              ← Back to My Procedures
            </Button>

            {userProcedureDetailLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : userProcedureDetailError ? (
              <div className="rounded-lg bg-red-50 p-6 text-center">
                <p className="text-red-700">Error loading your procedure details. Please try again.</p>
              </div>
            ) : userProcedureDetail ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold">{userProcedureDetail.title}</h2>
                  <div className="flex items-center mt-2 mb-4">
                    <span className="text-muted-foreground mr-2">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      userProcedureDetail.status === 'active' ? 'bg-green-100 text-green-800' :
                      userProcedureDetail.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userProcedureDetail.status.charAt(0).toUpperCase() + userProcedureDetail.status.slice(1)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${userProcedureDetail.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Progress: {userProcedureDetail.progress}%
                  </div>
                </div>

                {userProcedureDetail.currentStep && (
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle>Current Step: {userProcedureDetail.currentStep.title}</CardTitle>
                      {userProcedureDetail.currentStep.estimatedTime && (
                        <CardDescription>
                          Estimated time: {userProcedureDetail.currentStep.estimatedTime}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>{userProcedureDetail.currentStep.description}</p>
                      
                      {userProcedureDetail.currentStep.instructions && (
                        <div>
                          <h4 className="font-semibold mb-1">Instructions</h4>
                          <p className="text-sm">{userProcedureDetail.currentStep.instructions}</p>
                        </div>
                      )}
                      
                      {userProcedureDetail.currentStep.requiredDocuments && 
                       userProcedureDetail.currentStep.requiredDocuments.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-1">Required Documents</h4>
                          <ul className="list-disc pl-5 text-sm">
                            {userProcedureDetail.currentStep.requiredDocuments.map((doc: string, i: number) => (
                              <li key={i}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {userProcedureDetail.currentStep.tips && 
                       userProcedureDetail.currentStep.tips.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-1">Tips</h4>
                          <ul className="list-disc pl-5 text-sm">
                            {userProcedureDetail.currentStep.tips.map((tip: string, i: number) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {userProcedureDetail.currentStep.warnings && 
                       userProcedureDetail.currentStep.warnings.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-1 text-amber-700">Warnings</h4>
                          <ul className="list-disc pl-5 text-sm text-amber-700">
                            {userProcedureDetail.currentStep.warnings.map((warning: string, i: number) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Step tracking functionality will be available soon.",
                        });
                      }}>
                        Mark Step as Completed
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                <div>
                  <h3 className="text-xl font-semibold mb-4">All Procedure Steps</h3>
                  <div className="space-y-4">
                    {userProcedureDetail.steps?.map((step: ProcedureStep, index: number) => {
                      const isCurrentStep = step.id === userProcedureDetail.currentStepId;
                      const isCompleted = userProcedureDetail.completedSteps?.includes(step.id);
                      
                      return (
                        <Card 
                          key={step.id} 
                          className={`
                            ${isCurrentStep ? 'border-l-4 border-l-primary' : ''}
                            ${isCompleted ? 'bg-slate-50' : ''}
                          `}
                        >
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              {isCompleted && (
                                <CheckSquare className="mr-2 h-5 w-5 text-green-600" />
                              )}
                              {index + 1}. {step.title}
                              {isCurrentStep && (
                                <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">
                                  Current
                                </span>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>{step.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {userProcedureDetail.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{userProcedureDetail.notes}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => {
                    toast({
                      title: "Feature Coming Soon",
                      description: "Note editing functionality will be available soon.",
                    });
                  }}>
                    Add Note
                  </Button>
                  
                  {userProcedureDetail.status !== 'completed' && (
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Status update functionality will be available soon.",
                      });
                    }}>
                      Mark as Complete
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-muted p-6 text-center">
                <p className="text-muted-foreground">Procedure not found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourtProceduresPage;