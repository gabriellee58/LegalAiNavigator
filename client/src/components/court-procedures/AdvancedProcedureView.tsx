import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarDays, FileText, StickyNote, ChevronUp, ChevronDown } from 'lucide-react';
import TimelineVisualization from './TimelineVisualization';
import DocumentManagement from './DocumentManagement';
import Personalization from './Personalization';

// Import types directly from court-procedures.tsx until we properly migrate them
interface EstimatedTimeframe {
  stepId?: number;
  phaseName?: string;
  minDuration: string;
  maxDuration: string;
  factors?: { factor: string; impact: string }[];
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

interface RelatedForm {
  id: number;
  name: string;
  description?: string;
  templateId?: number;
  url?: string;
}

interface FlowchartData {
  nodes: any[];
  edges: any[];
  layout?: 'vertical' | 'horizontal';
  zoom?: number;
  center?: { x: number, y: number };
}

interface ProcedureDetail {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  jurisdiction: string;
  steps: ProcedureStep[];
  flowchartData: FlowchartData;
  estimatedTimeframes: EstimatedTimeframe[];
  courtFees: any[];
  requirements: any[];
  sourceName?: string;
  sourceUrl?: string;
  relatedForms?: RelatedForm[];
  isActive: boolean;
}

interface UserProcedureDetail {
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
  procedure: ProcedureDetail;
  steps: ProcedureStep[];
  currentStep: ProcedureStep;
  caseSpecificData?: any;
}

interface AdvancedProcedureViewProps {
  procedureDetail: ProcedureDetail;
  userProcedureDetail?: UserProcedureDetail;
  userId?: number;
}

export const AdvancedProcedureView: React.FC<AdvancedProcedureViewProps> = ({
  procedureDetail,
  userProcedureDetail,
  userId
}) => {
  const [activeTab, setActiveTab] = useState<string>('timeline');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  // Calculate progress and completion
  const completedSteps = userProcedureDetail?.completedSteps || [];
  const currentStepId = userProcedureDetail?.currentStepId;
  const startDate = userProcedureDetail ? new Date(userProcedureDetail.startedAt) : new Date();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>Advanced Features</span>
          <span className="bg-primary/10 text-primary text-xs py-1 px-2 rounded">
            Phase 3
          </span>
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Expand
            </>
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <>
          <Tabs defaultValue="timeline" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="timeline" className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Timeline</span>
                <span className="sm:hidden">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documents</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="personalization" className="flex items-center gap-1">
                <StickyNote className="h-4 w-4" />
                <span className="hidden sm:inline">Personalization</span>
                <span className="sm:hidden">Personal</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6 mt-6">
              <TimelineVisualization 
                steps={procedureDetail.steps}
                timeframes={procedureDetail.estimatedTimeframes}
                startDate={startDate}
                completedSteps={completedSteps}
                currentStepId={currentStepId}
              />
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6 mt-6">
              <DocumentManagement 
                relatedForms={procedureDetail.relatedForms || []}
                procedureSteps={procedureDetail.steps}
              />
            </TabsContent>
            
            {/* Personalization Tab */}
            <TabsContent value="personalization" className="space-y-6 mt-6">
              <Personalization 
                procedureId={procedureDetail.id}
                steps={procedureDetail.steps}
                userProcedureId={userProcedureDetail?.id}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
      
      {!isExpanded && (
        <div className="bg-muted/30 border rounded-md p-4 text-center">
          <p className="text-muted-foreground">
            Expand to access advanced features including timeline visualization, 
            document management, and personalization tools.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedProcedureView;