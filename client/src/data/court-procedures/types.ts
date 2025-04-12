// Define the court procedure data structures

export interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  details: string;
  requirements?: string[];
  forms?: {
    id: string;
    name: string;
    description: string;
    url?: string;
  }[];
  timeline?: {
    minDays: number;
    maxDays: number;
    description: string;
  };
  tips?: string[];
  warnings?: string[];
  costs?: {
    description: string;
    amount: string;
  }[];
}

export interface CourtProcedureOverview {
  summary: string;
  applicability: string[];
  jurisdiction: string;
  timeframe: string;
  costRange: string;
  resources?: {
    name: string;
    url: string;
  }[];
}

export interface CourtProcedureData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  overview: CourtProcedureOverview;
  steps: ProcedureStep[];
  requiredDocuments: {
    name: string;
    description: string;
    source: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  icon?: string;
}