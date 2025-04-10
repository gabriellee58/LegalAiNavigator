import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowRight, Info, FileText, GitPullRequest, List, CheckSquare, Clock, Eye, Download, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdvancedProcedureView from '@/components/court-procedures/AdvancedProcedureView';

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
  stepId?: number; // Reference to the actual step ID for linking
  isOptional?: boolean;
  type?: 'start' | 'end' | 'step' | 'decision' | 'document';
  requiredDocuments?: string[];
}

// Edge definition for flowchart connections
interface FlowchartEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'alternative' | 'optional';
  animated?: boolean;
  style?: Record<string, string>;
}

// Flowchart structure for visualizing procedure
interface FlowchartData {
  nodes: TimelineNode[];
  edges: FlowchartEdge[];
  layout?: 'vertical' | 'horizontal';
  zoom?: number;
  center?: { x: number, y: number };
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
  
  // New state variables for flowchart interaction
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showNodeDetail, setShowNodeDetail] = useState<boolean>(false);
  const [flowchartZoom, setFlowchartZoom] = useState<number>(1);
  const [showFlowchart, setShowFlowchart] = useState<boolean>(false);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [startProcedureDialogOpen, setStartProcedureDialogOpen] = useState<boolean>(false);

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
  
  // Handle flowchart node click
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setShowNodeDetail(true);
  };
  
  // Handle step toggle in accordions
  const handleStepToggle = (stepId: string) => {
    setExpandedSteps(prevExpanded => 
      prevExpanded.includes(stepId)
        ? prevExpanded.filter(id => id !== stepId)
        : [...prevExpanded, stepId]
    );
  };
  
  // Handle start procedure dialog open
  const handleStartProcedureClick = (procedureId: number) => {
    setSelectedProcedureId(procedureId);
    setStartProcedureDialogOpen(true);
  };
  
  // Create a new user procedure
  const startUserProcedureMutation = useMutation({
    mutationFn: async (data: { procedureId: number, title: string }) => {
      const response = await fetch('/api/court-procedures/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start procedure');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Procedure Started",
        description: "Your procedure has been successfully created.",
      });
      setStartProcedureDialogOpen(false);
      setSelectedUserProcedureId(data.id);
      setActiveTab("user-procedure-detail");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start procedure. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Toggle flowchart visibility
  const toggleFlowchart = () => {
    setShowFlowchart(prev => !prev);
  };

  // Mark a step as completed
  const markStepCompletedMutation = useMutation({
    mutationFn: async ({ userProcedureId, stepId }: { userProcedureId: number, stepId: number }) => {
      const response = await fetch(`/api/court-procedures/user/${userProcedureId}/steps/${stepId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark step as completed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Step Completed",
        description: "Your progress has been updated.",
      });
      // Refresh the user procedure detail data
      if (selectedUserProcedureId) {
        // Invalidate the query to refresh data
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  });

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">
              <span className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Categories
              </span>
            </TabsTrigger>
            <TabsTrigger value="browse" disabled={!selectedCategoryId}>
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Procedures
              </span>
            </TabsTrigger>
            <TabsTrigger value="my-procedures">
              <span className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                My Procedures
              </span>
            </TabsTrigger>
          </TabsList>
          
          {/* We'll hide these tabs from the user and use them programmatically */}
          <input type="hidden" value={activeTab === "procedure-detail" ? "procedure-detail" : ""} />
          <input type="hidden" value={activeTab === "user-procedure-detail" ? "user-procedure-detail" : ""} />

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
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <button 
                  onClick={handleBackToCategories}
                  className="hover:text-primary transition-colors"
                >
                  Categories
                </button>
                <span className="mx-2">/</span>
                <span className="font-medium text-foreground">
                  {selectedCategoryId && categories?.find((c: ProcedureCategory) => c.id === selectedCategoryId)?.name}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={handleBackToCategories}
                  size="sm"
                  className="gap-2"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Back to Categories
                </Button>
                {selectedCategoryId && categories?.find((c: ProcedureCategory) => c.id === selectedCategoryId) && (
                  <h2 className="text-2xl font-semibold">
                    {categories.find((c: ProcedureCategory) => c.id === selectedCategoryId)?.name} Procedures
                  </h2>
                )}
              </div>
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
                  <Card key={procedure.id} className="border-l-4 border-l-primary/50 transition-all hover:border-l-primary">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <span>{procedure.name}</span>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded ml-2">
                          {procedure.jurisdiction}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 line-clamp-2">{procedure.description}</p>
                      <div className="bg-muted/40 p-3 rounded-lg mb-2">
                        <div className="font-medium text-sm flex items-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="w-4 h-4 mr-2 text-primary"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Estimated Timeline:
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">
                          {procedure.estimatedTimeframes && typeof procedure.estimatedTimeframes === 'object' && (procedure.estimatedTimeframes as any).total 
                            ? (procedure.estimatedTimeframes as any).total 
                            : "Varies based on complexity"}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleProcedureSelect(procedure.id)}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      {user && (
                        <Button 
                          onClick={() => {
                            toast({
                              title: "Feature Coming Soon",
                              description: "Starting your own procedure will be available soon.",
                            });
                          }}
                          className="flex-1"
                        >
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
                  <Card 
                    key={userProcedure.id} 
                    className={`border-l-4 ${
                      userProcedure.status === 'active' ? 'border-l-primary/70 hover:border-l-primary' :
                      userProcedure.status === 'completed' ? 'border-l-green-500/70 hover:border-l-green-500' :
                      'border-l-muted-foreground/30 hover:border-l-muted-foreground'
                    } transition-all`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle>{userProcedure.title}</CardTitle>
                        <span className={`px-2 py-1 rounded text-xs ${
                          userProcedure.status === 'active' ? 'bg-primary/10 text-primary' :
                          userProcedure.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {userProcedure.status.charAt(0).toUpperCase() + userProcedure.status.slice(1)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-5">
                      <div className="flex justify-between items-center text-sm mb-3">
                        <div className="flex items-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="w-4 h-4 mr-1 text-muted-foreground"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          Started: {new Date(userProcedure.startedAt).toLocaleDateString()}
                        </div>
                        {userProcedure.expectedCompletionDate && (
                          <div className="text-muted-foreground">
                            Est. Completion: {new Date(userProcedure.expectedCompletionDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{userProcedure.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div 
                            className={`${
                              userProcedure.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                            } h-2.5 rounded-full`}
                            style={{ width: `${userProcedure.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full gap-2"
                        onClick={() => handleUserProcedureSelect(userProcedure.id)}
                      >
                        {userProcedure.status === 'completed' ? 'View Details' : 'Continue Procedure'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Procedure Detail Tab */}
          <TabsContent value="procedure-detail" className="space-y-6">
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <button 
                  onClick={handleBackToCategories}
                  className="hover:text-primary transition-colors"
                >
                  Categories
                </button>
                <span className="mx-2">/</span>
                <button
                  onClick={handleBackToProcedures}
                  className="hover:text-primary transition-colors"
                >
                  {selectedCategoryId && categories?.find((c: ProcedureCategory) => c.id === selectedCategoryId)?.name}
                </button>
                <span className="mx-2">/</span>
                <span className="font-medium text-foreground">
                  {procedureDetail?.name || 'Procedure Details'}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleBackToProcedures}
                size="sm"
                className="gap-2 w-fit"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Procedures
              </Button>
            </div>
            
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Procedure Steps</h3>
                    <Button 
                      variant="outline" 
                      onClick={toggleFlowchart} 
                      className="gap-2"
                      size="sm"
                    >
                      {showFlowchart ? "Hide Flowchart" : "Show Flowchart"}
                      {showFlowchart ? 
                        <Eye className="h-4 w-4" /> : 
                        <GitPullRequest className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                  
                  {/* Interactive Flowchart - Toggled by the button above */}
                  {showFlowchart && procedureDetail.flowchartData && (
                    <Card className="mb-6 p-4 overflow-x-auto">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-center mb-4">
                          <div className="flex items-center gap-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setFlowchartZoom(prev => Math.max(0.5, prev - 0.1))}
                            >
                              -
                            </Button>
                            <span>{Math.round(flowchartZoom * 100)}%</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setFlowchartZoom(prev => Math.min(2, prev + 0.1))}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div 
                          className="min-h-[400px] border rounded-md p-4 relative"
                          style={{ transform: `scale(${flowchartZoom})`, transformOrigin: 'center', transition: 'transform 0.3s ease' }}
                        >
                          {/* Placeholder for flowchart visualization */}
                          <div className="text-center text-muted-foreground">
                            Interactive flowchart visualization will be implemented in the next iteration
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Accordion type="multiple" className="space-y-4" value={expandedSteps} onValueChange={setExpandedSteps}>
                    {procedureDetail.steps?.map((step: ProcedureStep, index: number) => (
                      <AccordionItem 
                        key={step.id} 
                        value={`step-${step.id}`}
                        className="border rounded-lg shadow-sm overflow-hidden"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card data-[state=open]:bg-muted/40">
                          <div className="flex items-start justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                                {index + 1}
                              </div>
                              <div className="text-left">
                                <h4 className="font-medium text-base">{step.title}</h4>
                                {step.estimatedTime && (
                                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Estimated time: {step.estimatedTime}
                                  </p>
                                )}
                              </div>
                            </div>
                            {step.isOptional && (
                              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                                Optional
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-4 bg-card border-t">
                          <div className="space-y-4">
                            <p>{step.description}</p>

                            {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                              <div className="bg-muted/30 p-3 rounded-md">
                                <h4 className="font-medium mb-2 flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-primary" />
                                  Required Documents
                                </h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {step.requiredDocuments.map((doc, i) => (
                                    <li key={i} className="text-sm">{doc}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {step.tips && step.tips.length > 0 && (
                              <div className="bg-blue-50 p-3 rounded-md">
                                <h4 className="font-medium mb-2 flex items-center text-blue-700">
                                  <Info className="h-4 w-4 mr-2" />
                                  Tips
                                </h4>
                                <ul className="list-disc pl-5 space-y-1 text-blue-800">
                                  {step.tips.map((tip, i) => (
                                    <li key={i} className="text-sm">{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {step.warnings && step.warnings.length > 0 && (
                              <div className="bg-red-50 p-3 rounded-md">
                                <h4 className="font-medium mb-2 flex items-center text-red-700">
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  Warnings
                                </h4>
                                <ul className="list-disc pl-5 space-y-1 text-red-800">
                                  {step.warnings.map((warning, i) => (
                                    <li key={i} className="text-sm">{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {step.instructions && (
                              <div className="bg-muted/30 p-3 rounded-md">
                                <h4 className="font-medium mb-2">Instructions</h4>
                                <p className="text-sm">{step.instructions}</p>
                              </div>
                            )}
                            
                            {user && (
                              <div className="pt-2 flex justify-end">
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStartProcedureClick(procedureDetail.id)}
                                  className="gap-2"
                                >
                                  {userProcedures?.some(p => p.procedureId === procedureDetail.id)
                                    ? "Continue Procedure"
                                    : "Start Procedure"
                                  }
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
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

                {/* Divider before the Advanced Features section */}
                <div className="my-10">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Advanced Features
                      </span>
                    </div>
                  </div>
                </div>

                {/* Phase 3: Advanced Features */}
                <AdvancedProcedureView 
                  procedureDetail={procedureDetail}
                  userProcedureDetail={userProcedureDetail}
                  userId={user?.id}
                />

                {user && (
                  <div className="flex justify-center pt-8">
                    <Button size="lg" onClick={() => handleStartProcedureClick(procedureDetail.id)}>
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
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <button 
                  onClick={() => setActiveTab("my-procedures")}
                  className="hover:text-primary transition-colors"
                >
                  My Procedures
                </button>
                <span className="mx-2">/</span>
                <span className="font-medium text-foreground">
                  {userProcedureDetail?.title || 'Procedure Details'}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleBackToUserProcedures}
                size="sm"
                className="gap-2 w-fit"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to My Procedures
              </Button>
            </div>

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