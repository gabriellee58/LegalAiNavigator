import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Define response types
interface DocumentEnhancementResponse {
  content: string;
  explanation?: string;
}

interface DocumentAnalysisResponse {
  summary: string;
  keyPoints: string[];
  riskAreas: { area: string, description: string, riskLevel: string }[];
  suggestions: string[];
  jurisdiction?: { valid: boolean, notes: string };
}

/**
 * Enhances a legal document with AI
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
  try {
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
    };
  } catch (error) {
    console.error('Error enhancing document with Anthropic:', error);
    throw new Error('Failed to enhance document');
  }
}

/**
 * Analyzes a legal document with AI
 * @param content Document content to analyze
 * @param documentType Type of document (contract, will, etc.)
 * @param jurisdiction Legal jurisdiction (province)
 * @returns Analysis results
 */
/**
 * Generate a response to a user message using Claude
 * @param userMessage The user's message
 * @returns AI generated response
 */
export async function generateAIResponseClaude(userMessage: string): Promise<string> {
  try {
    console.log(`Attempting Claude API fallback for prompt: "${userMessage.substring(0, 50)}..."`);
    
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 800,
      system: `You are an AI legal assistant specialized in Canadian law. 
      Provide helpful, accurate information about Canadian legal topics. 
      Always clarify that you are not providing legal advice and recommend consulting a qualified lawyer for specific legal issues.
      Focus on Canadian legal frameworks, regulations, and precedents.
      Be respectful, concise, and easy to understand.
      Avoid excessive legalese, but maintain accuracy in legal concepts.`,
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
    
    return responseText || "I'm sorry, but I couldn't generate a response to your question.";
  } catch (error) {
    console.error('Error generating response with Claude:', error);
    return "I'm sorry, but I encountered an error processing your request. Please try again later.";
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