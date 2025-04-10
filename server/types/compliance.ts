import { DocumentInfo } from './document';

/**
 * Compliance check request data
 */
export interface ComplianceCheckRequest {
  businessType: string;
  jurisdiction: string;
  description?: string;
  documents?: DocumentInfo[];
  userId?: number;
}

/**
 * Compliance issue found during analysis
 */
export interface ComplianceIssue {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

/**
 * Compliant area identified during analysis
 */
export interface CompliantArea {
  title: string;
  description: string;
}

/**
 * Complete compliance check result
 */
export interface ComplianceResult {
  score: number;
  status: 'compliant' | 'needs_attention' | 'non_compliant';
  issues: ComplianceIssue[];
  compliant: CompliantArea[];
}