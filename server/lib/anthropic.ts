import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize OpenAI client for fallback
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Define response types
interface DocumentEnhancementResponse {
  content: string;
  explanation?: string;
  provider?: string;
}

interface DocumentAnalysisResponse {
  summary: string;
  keyPoints: string[];
  riskAreas: { area: string, description: string, riskLevel: string }[];
  suggestions: string[];
  jurisdiction?: { valid: boolean, notes: string };
}

/**
 * Enhances a legal document with AI, with fallback between providers
 * @param content Original document content
 * @param formData Form data with variable values
 * @param documentType Type of document (contract, will, etc.)
 * @param jurisdiction Legal jurisdiction (province)
 * @returns Enhanced document content
 */
export async function generateEnhancedDocument(
  documentContent: string,
  formData: Record<string, any>,
  documentType: string,
  jurisdiction: string = 'Ontario'
): Promise<DocumentEnhancementResponse> {
  // Try DeepSeek first since it's been most reliable
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      console.log(`Starting with DeepSeek AI for document enhancement - ${documentType} (${jurisdiction})`);
      
      // Simple implementation for DeepSeek using fetch
      const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: "system",
              content: `You are a Canadian legal document assistant specialized in drafting professional legal documents for ${jurisdiction} jurisdiction. 
              Enhance the provided ${documentType} template by:
              1. Using the provided form data to fill in any remaining placeholders
              2. Ensuring proper legal language and formatting
              3. Adding any standard clauses typical for this document type in ${jurisdiction}
              4. Making the document more comprehensive and legally sound while maintaining its original intent
              5. Ensuring compliance with ${jurisdiction} laws and regulations

              Response should be the enhanced document text in plain text format. Maintain proper paragraph breaks and section formatting.
              Do not add any explanations or notes within the document itself.`
            },
            {
              role: "user",
              content: `I need to enhance this ${documentType} for ${jurisdiction} jurisdiction. 
              
Here is my drafted document:
${documentContent}

Here is the form data I've entered (use this to add missing details):
${JSON.stringify(formData, null, 2)}

Please enhance this document to make it more comprehensive, legally sound, and compliant with ${jurisdiction} laws while maintaining its original intent. Fill in any missing details based on the form data I provided.`
            }
          ],
          max_tokens: 4000
        })
      });
      
      const deepseekData = await deepseekResponse.json();
      
      if (deepseekData.choices && deepseekData.choices[0].message.content) {
        return {
          content: deepseekData.choices[0].message.content,
          provider: 'deepseek'
        };
      }
    } catch (deepseekError) {
      console.error('Error with DeepSeek AI:', deepseekError);
      // Continue to next provider on failure
    }
  }
  
  // Try Anthropic as second option
  try {
    console.log(`Trying Anthropic Claude for document enhancement - ${documentType} (${jurisdiction})`);
    
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025. do not change this unless explicitly requested by the user
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 4000,
      system: `You are a Canadian legal document assistant specialized in drafting professional legal documents for ${jurisdiction} jurisdiction. 
      Your task is to enhance the provided ${documentType} template by:
      1. Using the provided form data to fill in any remaining placeholders
      2. Ensuring proper legal language and formatting
      3. Adding any standard clauses typical for this document type in ${jurisdiction}
      4. Making the document more comprehensive and legally sound while maintaining its original intent
      5. Ensuring compliance with ${jurisdiction} laws and regulations

      Response should be the enhanced document text in plain text format. Maintain proper paragraph breaks and section formatting.
      Do not add any explanations or notes within the document itself.`,
      messages: [
        { 
          role: 'user', 
          content: `I need to enhance this ${documentType} for ${jurisdiction} jurisdiction. 
          
Here is my drafted document:
${documentContent}

Here is the form data I've entered (use this to add missing details):
${JSON.stringify(formData, null, 2)}

Please enhance this document to make it more comprehensive, legally sound, and compliant with ${jurisdiction} laws while maintaining its original intent. Fill in any missing details based on the form data I provided.`
        }
      ],
    });

    // Extract the text content from the response
    let responseText = "";
    if (response.content && response.content.length > 0) {
      const firstContent = response.content[0];
      if (typeof firstContent === 'object' && 'text' in firstContent) {
        responseText = firstContent.text;
      }
    }
      
    return {
      content: responseText,
      provider: 'anthropic'
    };
  } catch (error) {
    console.error('Error enhancing document with Anthropic:', error);
    
    // Try OpenAI as last fallback
    if (openai) {
      try {
        console.log('Trying OpenAI as last fallback for document enhancement');
        
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        const openaiResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a Canadian legal document assistant specialized in drafting professional legal documents for ${jurisdiction} jurisdiction. 
              Your task is to enhance the provided ${documentType} template by:
              1. Using the provided form data to fill in any remaining placeholders
              2. Ensuring proper legal language and formatting
              3. Adding any standard clauses typical for this document type in ${jurisdiction}
              4. Making the document more comprehensive and legally sound while maintaining its original intent
              5. Ensuring compliance with ${jurisdiction} laws and regulations
              
              Response should be the enhanced document text in plain text format. Maintain proper paragraph breaks and section formatting.
              Do not add any explanations or notes within the document itself.`
            },
            {
              role: "user",
              content: `I need to enhance this ${documentType} for ${jurisdiction} jurisdiction. 
              
Here is my drafted document:
${documentContent}

Here is the form data I've entered (use this to add missing details):
${JSON.stringify(formData, null, 2)}

Please enhance this document to make it more comprehensive, legally sound, and compliant with ${jurisdiction} laws while maintaining its original intent. Fill in any missing details based on the form data I provided.`
            }
          ],
          max_tokens: 4000,
        });
        
        return {
          content: openaiResponse.choices[0].message.content || "",
          provider: 'openai'
        };
      } catch (openaiError) {
        console.error('Error with OpenAI fallback:', openaiError);
      }
    }
    
    // If all else fails, try to return the original document with a note
    return {
      content: `${documentContent}\n\n[NOTE: This document could not be enhanced due to AI service overload. Please try again later.]`,
      explanation: 'AI services currently overloaded, returning original document with minimal enhancements.',
      provider: 'fallback'
    };
  }
}

/**
 * Analyzes a legal document with AI
 * @param content Document content to analyze
 * @param documentType Type of document (contract, will, etc.)
 * @param jurisdiction Legal jurisdiction (province)
 * @returns Analysis results
 */
interface ClaudeOptions {
  system?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Generate a response to a user message using Claude
 * @param userMessage The user's message
 * @param options Optional configuration parameters
 * @returns AI generated response
 */
export async function generateAIResponseClaude(userMessage: string, options: ClaudeOptions = {}): Promise<string> {
  try {
    console.log(`Attempting Claude API fallback for prompt: "${userMessage.substring(0, 50)}..."`);
    
    // Default system prompt if none provided
    const systemPrompt = options.system || `You are an AI legal assistant specialized in Canadian law. 
      Provide helpful, accurate information about Canadian legal topics. 
      Always clarify that you are not providing legal advice and recommend consulting a qualified lawyer for specific legal issues.
      Focus on Canadian legal frameworks, regulations, and precedents.
      Be respectful, concise, and easy to understand.
      Avoid excessive legalese, but maintain accuracy in legal concepts.`;
    
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: options.model || 'claude-3-7-sonnet-20250219',
      max_tokens: options.maxTokens || 800,
      temperature: options.temperature || 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Extract the text content from the response
    let responseText = "";
    if (response.content && response.content.length > 0) {
      const firstContent = response.content[0];
      if (typeof firstContent === 'object' && 'text' in firstContent) {
        responseText = firstContent.text;
      }
    }
    
    if (!responseText) {
      throw new Error("Empty response from Claude");
    }
    
    return responseText;
  } catch (error) {
    console.error('Error generating response with Claude:', error);
    throw error; // Let the caller handle the error (for proper fallback)
  }
}

/**
 * Perform legal research on a given query using Claude as fallback
 * @param query The research query
 * @param jurisdiction The jurisdiction (e.g., "canada", "ontario")
 * @param practiceArea The practice area (e.g., "family", "criminal")
 * @returns Research results
 */
export async function performLegalResearch(
  query: string,
  jurisdiction: string = 'Canada',
  practiceArea: string = 'general'
): Promise<{
  summary: string;
  cases: { name: string; citation: string; relevance: string }[];
  statutes: { name: string; citation: string; relevance: string }[];
  analysis: string;
}> {
  try {
    console.log(`Performing Claude legal research: "${query}" (${jurisdiction}, ${practiceArea})`);
    
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1500,
      system: `You are a Canadian legal research assistant with expertise in ${jurisdiction} jurisdiction and ${practiceArea} law.
      Provide comprehensive, accurate legal research results.
      Include relevant cases, statutes, and analysis.
      Format your response as structured JSON with these sections:
      1. summary - Brief overview of findings
      2. cases - Array of relevant cases with name, citation, and relevance
      3. statutes - Array of relevant statutes with name, citation, and relevance
      4. analysis - Detailed legal analysis of the query
      
      Remember that Canadian law combines federal and provincial/territorial jurisdictions.
      Focus on the most recent and relevant legal authorities.`,
      messages: [{ 
        role: 'user', 
        content: `I need legal research on the following query in ${jurisdiction} regarding ${practiceArea}:
        
        ${query}
        
        Please provide a comprehensive answer with relevant cases, statutes, and analysis.` 
      }],
    });

    try {
      // Extract JSON from the response
      let responseText = "";
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if (typeof firstContent === 'object' && 'text' in firstContent) {
          responseText = firstContent.text;
        }
      }
      
      // Try to find and extract JSON
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = responseText.substring(jsonStart, jsonEnd);
        const research = JSON.parse(jsonStr);
        
        return {
          summary: research.summary || 'No summary provided',
          cases: research.cases || [],
          statutes: research.statutes || [],
          analysis: research.analysis || 'No analysis provided'
        };
      } else {
        // If no valid JSON, parse the free-form response
        return {
          summary: responseText.substring(0, 300) + '...',
          cases: [],
          statutes: [],
          analysis: responseText
        };
      }
    } catch (parseError) {
      console.error('Error parsing Claude legal research response:', parseError);
      
      // Extract the text for a fallback response
      let responseText = "";
      if (response.content && response.content.length > 0) {
        const firstContent = response.content[0];
        if (typeof firstContent === 'object' && 'text' in firstContent) {
          responseText = firstContent.text;
        }
      }
      
      // Fallback response with raw text
      return {
        summary: 'Error parsing structured research results',
        cases: [],
        statutes: [],
        analysis: responseText || 'No analysis available due to processing error'
      };
    }
  } catch (error) {
    console.error('Error performing legal research with Claude:', error);
    throw new Error('Failed to perform legal research');
  }
}

export async function analyzeLegalDocument(
  documentContent: string,
  documentType: string,
  jurisdiction: string = 'Canada'
): Promise<DocumentAnalysisResponse> {
  try {
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025. do not change this unless explicitly requested by the user
    const anthropicResponse = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 2000,
      system: `You are a Canadian legal document analysis assistant specialized in analyzing legal documents for the ${jurisdiction} jurisdiction. Provide a comprehensive, structured analysis in JSON format.`,
      messages: [
        { 
          role: 'user',
          content: `Please analyze this ${documentType} for ${jurisdiction} jurisdiction and provide analysis in JSON format with these sections:
1. summary (brief document summary)
2. keyPoints (array of the most important clauses/points)
3. riskAreas (array of objects with properties: area, description, riskLevel)
4. suggestions (array of improvements)
5. jurisdiction (object with properties: valid (boolean), notes)

Here is the document to analyze:
${documentContent}`
        }
      ],
    });

    try {
      // Extract the text content from the response
      const responseText = typeof anthropicResponse.content[0] === 'object' && 'text' in anthropicResponse.content[0] 
        ? anthropicResponse.content[0].text as string
        : "";
        
      // Extract JSON from the response
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = responseText.substring(jsonStart, jsonEnd);
        const analysis = JSON.parse(jsonStr);
        
        return {
          summary: analysis.summary || 'No summary provided',
          keyPoints: analysis.keyPoints || [],
          riskAreas: analysis.riskAreas || [],
          suggestions: analysis.suggestions || [],
          jurisdiction: analysis.jurisdiction || { valid: true, notes: 'No jurisdiction notes provided' }
        };
      } else {
        // Fallback if not valid JSON
        return {
          summary: "Analysis completed but AI returned non-JSON response.",
          keyPoints: ["Unable to extract key points automatically"],
          riskAreas: [],
          suggestions: ["Try analyzing a different document or reformatting this document"],
          jurisdiction: { valid: true, notes: 'Unable to determine jurisdiction compatibility' }
        };
      }
    } catch (jsonError) {
      console.error('Error parsing Anthropic response as JSON:', jsonError);
      
      // Extract the text content for fallback
      const responseText = typeof anthropicResponse.content[0] === 'object' && 'text' in anthropicResponse.content[0] 
        ? anthropicResponse.content[0].text as string
        : "Error extracting content from AI response";
      
      // Fallback response
      return {
        summary: responseText.substring(0, 200) + '...',
        keyPoints: ["Analysis was successful but returned in a non-structured format"],
        riskAreas: [],
        suggestions: ["Request a re-analysis of the document"],
        jurisdiction: { valid: true, notes: 'Unable to determine jurisdiction compatibility' }
      };
    }
  } catch (error) {
    console.error('Error analyzing document with Anthropic:', error);
    throw new Error('Failed to analyze document');
  }
}