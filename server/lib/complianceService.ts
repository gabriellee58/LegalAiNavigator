import { DocumentInfo } from '../types/document';
import { ComplianceCheckRequest, ComplianceResult } from '../types/compliance';
import { config } from '../config';
import { generateChatResponse } from './aiService';

/**
 * Analyze business compliance with AI
 * This function will use the central AI service with built-in fallbacks
 */
export async function analyzeComplianceWithAI(
  request: ComplianceCheckRequest
): Promise<ComplianceResult> {
  const { businessType, jurisdiction, description, documents = [], userId } = request;
  console.log(`Starting compliance analysis for ${businessType} in ${jurisdiction}`);
  
  const startTime = Date.now();
  
  try {
    // Extract text from documents if any
    const documentTexts = documents
      .filter(doc => doc.content)
      .map(doc => `Document: ${doc.name}\nContent: ${extractTextFromDocument(doc)}`);
    
    // Generate the prompt
    const prompt = generateCompliancePrompt(businessType, jurisdiction, description, documentTexts);
    
    // Use the unified AI service for the request
    console.log('Requesting compliance analysis with AI service');
    const result = await generateChatResponse(prompt, {
      system: `You are a compliance analysis assistant specializing in Canadian business regulations. 
      You provide detailed, accurate compliance reports in JSON format.
      Focus on business registration, licensing, taxation, employment standards, privacy laws, 
      health and safety requirements, and industry-specific regulations.`,
      cacheKey: `compliance-${businessType}-${jurisdiction}-${Date.now()}`, // Unique per request
      logPrefix: "Compliance Analysis"
    });
    
    // Parse the result
    const complianceResult = parseComplianceResult(result);
    
    // Log success and return
    const duration = Date.now() - startTime;
    console.log(`Compliance check: AI request successful. Duration: ${duration}ms`);
    
    return complianceResult;
    
  } catch (error) {
    console.error('Compliance analysis error:', error);
    throw error;
  }
}

/**
 * Generate a prompt for compliance analysis
 */
function generateCompliancePrompt(
  businessType: string, 
  jurisdiction: string, 
  description?: string,
  documentTexts: string[] = []
): string {
  // Format jurisdiction for display
  const jurisdictionDisplay = jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1).replace(/_/g, ' ');
  
  // Format business type for display
  const businessTypeDisplay = businessType.charAt(0).toUpperCase() + businessType.slice(1).replace(/_/g, ' ');
  
  let prompt = `Analyze the compliance requirements for a ${businessTypeDisplay} business operating in ${jurisdictionDisplay}, Canada. `;
  
  if (description) {
    prompt += `\n\nBusiness Description: ${description}`;
  }
  
  if (documentTexts.length > 0) {
    prompt += `\n\nSupporting Documents:\n${documentTexts.join('\n\n')}`;
  }
  
  prompt += `\n\nProvide a comprehensive compliance analysis with the following:
1. Overall compliance score (a percentage from 0-100%)
2. Compliance status ("compliant", "needs_attention", or "non_compliant")
3. Compliance issues (if any) with severity level (low, medium, high) and recommendations
4. Compliant areas (sections where the business meets regulatory requirements)

Focus on relevant Canadian regulations including business registration, licensing, taxation, employment standards, privacy laws, health and safety requirements, and industry-specific regulations for ${jurisdictionDisplay}.

Format your response as a JSON object with the following structure:
{
  "score": number,
  "status": "compliant" | "needs_attention" | "non_compliant",
  "issues": [
    {
      "title": string,
      "description": string,
      "severity": "low" | "medium" | "high",
      "recommendation": string
    }
  ],
  "compliant": [
    {
      "title": string,
      "description": string
    }
  ]
}`;

  return prompt;
}

/**
 * Extract text from document content (base64 encoded)
 * Currently just returns the content as-is since we're already providing the text
 */
function extractTextFromDocument(document: DocumentInfo): string {
  // For now, we're just returning the content as-is
  // In a real implementation, this would parse the document based on its type
  return document.content || '';
}

/**
 * Parse compliance result from AI response
 */
function parseComplianceResult(response: string): ComplianceResult {
  try {
    // Try to directly parse as JSON
    const parsedResult = JSON.parse(response) as ComplianceResult;
    
    // Ensure the response has the required fields
    if (!parsedResult.score && !parsedResult.status) {
      throw new Error('Invalid response format');
    }
    
    // Return the parsed result
    return parsedResult;
  } catch (jsonError) {
    // If direct parsing fails, try to extract JSON from the response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsedResult = JSON.parse(jsonStr) as ComplianceResult;
        
        if (!parsedResult.score && !parsedResult.status) {
          throw new Error('Invalid extracted JSON format');
        }
        
        return parsedResult;
      }
      throw new Error('Could not extract JSON from response');
    } catch (extractError) {
      console.error('Error parsing compliance result:', extractError);
      console.error('Original response:', response);
      
      // As a fallback, construct a basic response
      return {
        score: 50,
        status: 'needs_attention',
        issues: [
          {
            title: 'Compliance Analysis Error',
            description: 'We encountered an error analyzing your business compliance.',
            severity: 'medium',
            recommendation: 'Please try again or contact support if the problem persists.'
          }
        ],
        compliant: []
      };
    }
  }
}