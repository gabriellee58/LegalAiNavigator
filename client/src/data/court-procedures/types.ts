export interface CourtProcedureData {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  overview: ProcedureOverview;
  steps: ProcedureStep[];
  requiredDocuments: RequiredDocument[];
  faqs: FAQ[];
}

export interface ProcedureOverview {
  summary: string;
  applicability: string[];
  jurisdiction: string;
  timeframe: string;
  costRange: string;
  resources: Resource[];
}

export interface Resource {
  name: string;
  url: string;
}

export interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  details: string;
  timeline: {
    minDays: number;
    maxDays: number;
    description: string;
  };
  tips?: string[];
  forms?: ProcedureForm[];
}

export interface ProcedureForm {
  id: string;
  name: string;
  description: string;
  url?: string;
}

export interface RequiredDocument {
  name: string;
  description: string;
  source: string;
  url?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ProcedureDataMap {
  [key: string]: CourtProcedureData;
}