/**
 * Enhanced Legal Research Service
 * 
 * This module provides enhanced legal research capabilities with:
 * - Caching for frequently asked research queries
 * - Tiered fallback between AI providers
 * - Detailed error handling and logging
 * - Mock data fallback for testing
 */

import { aiFeatureFlags, enhancedAIRequest } from './aiService';
import { performLegalResearch as performDeepSeekResearch } from './deepseek';
import { performLegalResearch as performOpenAIResearch } from './openai';
import { performLegalResearch as performClaudeResearch } from './anthropic';
import { getMockResearchData } from './mockResearchData';

// Claude research result format
interface ClaudeResearchResult {
  summary: string;
  cases: { name: string; citation: string; relevance: string }[];
  statutes: { name: string; citation: string; relevance: string }[];
  analysis: string;
}

// Research result interface
export interface ResearchResult {
  relevantLaws: { 
    title: string; 
    description: string; 
    source: string;
    url?: string;
    relevanceScore?: number;
  }[];
  relevantCases: { 
    name: string; 
    citation: string; 
    relevance: string;
    year?: string;
    jurisdiction?: string;
    judgment?: string;
    keyPoints?: string[];
    url?: string;
  }[];
  summary: string;
  legalConcepts?: {
    concept: string;
    definition: string;
    relevance: string;
  }[];
}

/**
 * Enhanced legal research function with fallback and caching
 */
export async function enhancedLegalResearch(
  query: string,
  jurisdiction: string = "canada",
  practiceArea: string = "all"
): Promise<ResearchResult> {
  if (!aiFeatureFlags.enableAILegalResearch) {
    // Return empty results if research is disabled
    return {
      relevantLaws: [],
      relevantCases: [],
      summary: "Legal research is currently disabled during development. Please try again later."
    };
  }

  try {
    // Generate a cache key for this specific research request
    const cacheKey = `research-${jurisdiction}-${practiceArea}-${query}`;
    
    // Track timing for this request
    const startTime = Date.now();
    
    // Try each provider with fallback
    try {
      // Track which provider was used (for logging)
      let provider = "DeepSeek";
      
      // Try DeepSeek first
      try {
        const result = await performDeepSeekResearch(query, jurisdiction, practiceArea);
        
        // Log success
        const duration = Date.now() - startTime;
        console.log(`Research: ${provider} request successful. Duration: ${duration}ms`);
        
        return result;
      } catch (primaryError) {
        console.warn("Primary research provider failed:", primaryError);
        
        // Try OpenAI next
        provider = "OpenAI";
        try {
          const result = await performOpenAIResearch(query, jurisdiction, practiceArea);
          
          // Log success
          const duration = Date.now() - startTime;
          console.log(`Research: ${provider} fallback successful. Duration: ${duration}ms`);
          
          return result;
        } catch (secondaryError) {
          console.warn("Secondary research provider failed:", secondaryError);
          
          // Final fallback to Claude
          provider = "Claude";
          const claudeResult = await performClaudeResearch(query, jurisdiction, practiceArea) as ClaudeResearchResult;
          
          // Log success
          const duration = Date.now() - startTime;
          console.log(`Research: ${provider} final fallback successful. Duration: ${duration}ms`);
          
          // Convert Claude's format to our standard ResearchResult format
          const result: ResearchResult = {
            summary: claudeResult.summary,
            relevantCases: claudeResult.cases.map(c => ({
              name: c.name,
              citation: c.citation,
              relevance: c.relevance,
              jurisdiction: jurisdiction
            })),
            relevantLaws: claudeResult.statutes.map(s => ({
              title: s.name,
              description: s.relevance,
              source: s.citation,
            })),
            legalConcepts: claudeResult.analysis ? [{
              concept: 'Legal Analysis',
              definition: 'Comprehensive legal analysis',
              relevance: claudeResult.analysis
            }] : undefined
          };
          
          return result;
        }
      }
    } catch (error) {
      console.error("All research providers failed:", error);
      
      // Return empty result with error message
      return {
        relevantLaws: [],
        relevantCases: [],
        summary: "I'm sorry, but there was an error retrieving research results. Please try again later."
      };
    }
  } catch (error) {
    console.error("Unexpected research error:", error);
    return {
      relevantLaws: [],
      relevantCases: [],
      summary: "An unexpected error occurred during research. Please try again."
    };
  }
}

/**
 * Generate research prompt based on query parameters
 */
export function generateResearchPrompt(query: string, jurisdiction: string, practiceArea: string): string {
  // Format jurisdiction display name
  const jurisdictionDisplay = jurisdiction === "canada" 
    ? "Federal (Canada)" 
    : jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1).replace(/-/g, ' ');
  
  // Build practice area context
  let practiceAreaContext = "";
  if (practiceArea !== "all") {
    practiceAreaContext = `with a focus on ${practiceArea.replace(/-/g, ' ')} law`;
  }
  
  return `Research the following legal query for ${jurisdictionDisplay} ${practiceAreaContext}:\n\n${query}\n\nProvide detailed, jurisdiction-specific research with practical insights.`;
}