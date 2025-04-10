// Court Procedure Types
export interface ProcedureCategory {
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

export interface ProcedureStep {
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
export interface TimelineNode {
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
export interface FlowchartEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'alternative' | 'optional';
  animated?: boolean;
  style?: Record<string, string>;
}

// Flowchart structure for visualizing procedure
export interface FlowchartData {
  nodes: TimelineNode[];
  edges: FlowchartEdge[];
  layout?: 'vertical' | 'horizontal';
  zoom?: number;
  center?: { x: number, y: number };
}

// Timeframe definitions
export interface EstimatedTimeframe {
  stepId?: number;
  phaseName?: string;
  minDuration: string;
  maxDuration: string;
  factors?: { factor: string; impact: string }[];
}

// Court fee structure
export interface CourtFee {
  name: string;
  amount: string;
  description?: string;
  optional: boolean;
  conditions?: string;
  exemptionInfo?: string;
}

// Legal requirements
export interface Requirement {
  type: string;
  description: string;
  mandatory: boolean;
  jurisdictionSpecific?: boolean;
  references?: { description: string; url?: string }[];
}

// Related forms
export interface RelatedForm {
  id: number;
  name: string;
  description?: string;
  templateId?: number; // Reference to document template if available
  url?: string;
}

export interface Procedure {
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

export interface ProcedureDetail extends Procedure {
  steps: ProcedureStep[];
}

export interface UserProcedure {
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

export interface UserProcedureDetail extends UserProcedure {
  procedure: Procedure;
  steps: ProcedureStep[];
  currentStep: ProcedureStep;
}

// New interfaces for Phase 3 features

export interface UserNote {
  id: number;
  userProcedureId: number;
  stepId?: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserReminder {
  id: number;
  userProcedureId: number;
  stepId?: number;
  title: string;
  description?: string;
  dueDate: string;
  notifyBefore: number; // days
  notifyMethod: 'email' | 'app' | 'both';
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserChecklistItem {
  id: number;
  userProcedureId: number;
  stepId?: number;
  category: string;
  text: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDocument {
  id: number;
  userProcedureId: number;
  stepId?: number;
  relatedFormId?: number;
  name: string;
  description?: string;
  fileUrl?: string;
  fileType: string;
  status: 'draft' | 'completed' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}