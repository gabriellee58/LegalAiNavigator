import { callDeepSeekAI } from './deepseekService';
import { callAnthropicAI } from './anthropicService';
import { callOpenAI } from './openaiService';
import { DocumentInfo } from '../types/document';
import { ComplianceCheckRequest, ComplianceResult } from '../types/compliance';
import config from '../config';

/**
 * Analyze business compliance with AI
 * This function will try multiple AI providers in order of preference
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
    
    // Try DeepSeek first (if configured)
    if (config.AI_SERVICES.includes('deepseek')) {
      try {
        console.log('Attempting compliance analysis with DeepSeek AI');
        const result = await callDeepSeekAI(prompt, 'compliance-check');
        
        // Parse the result
        const complianceResult = parseComplianceResult(result);
        
        // Log success and return
        const duration = Date.now() - startTime;
        console.log(`Compliance check: DeepSeek request successful. Duration: ${duration}ms`);
        
        return complianceResult;
      } catch (error) {
        console.error('DeepSeek compliance check failed:', error);
        // Continue to next provider
      }
    }
    
    // Try Anthropic next (if configured)
    if (config.AI_SERVICES.includes('anthropic')) {
      try {
        console.log('Attempting compliance analysis with Anthropic Claude');
        const result = await callAnthropicAI(prompt, 'compliance-check');
        
        // Parse the result
        const complianceResult = parseComplianceResult(result);
        
        // Log success and return
        const duration = Date.now() - startTime;
        console.log(`Compliance check: Anthropic request successful. Duration: ${duration}ms`);
        
        return complianceResult;
      } catch (error) {
        console.error('Anthropic compliance check failed:', error);
        // Continue to next provider
      }
    }
    
    // Try OpenAI last (if configured)
    if (config.AI_SERVICES.includes('openai')) {
      try {
        console.log('Attempting compliance analysis with OpenAI');
        const result = await callOpenAI(prompt, 'compliance-check');
        
        // Parse the result
        const complianceResult = parseComplianceResult(result);
        
        // Log success and return
        const duration = Date.now() - startTime;
        console.log(`Compliance check: OpenAI request successful. Duration: ${duration}ms`);
        
        return complianceResult;
      } catch (error) {
        console.error('OpenAI compliance check failed:', error);
        // No more providers to try
      }
    }
    
    // If all providers fail, throw an error
    throw new Error('All AI providers failed to analyze compliance');
    
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