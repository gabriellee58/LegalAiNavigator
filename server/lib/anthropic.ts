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
  content: string,
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
${content}

Here is the form data I've entered (use this to add missing details):
${JSON.stringify(formData, null, 2)}

Please enhance this document to make it more comprehensive, legally sound, and compliant with ${jurisdiction} laws while maintaining its original intent. Fill in any missing details based on the form data I provided.`
        }
      ],
    });

    // Extract the text content from the response
    const content = typeof response.content[0] === 'object' && 'text' in response.content[0] 
      ? response.content[0].text 
      : "";
      
    return {
      content: content,
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
export async function analyzeLegalDocument(
  content: string,
  documentType: string,
  jurisdiction: string = 'Canada'
): Promise<DocumentAnalysisResponse> {
  try {
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025. do not change this unless explicitly requested by the user
    const response = await anthropic.messages.create({
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
${content}`
        }
      ],
    });

    try {
      // Extract the text content from the response
      const responseText = typeof response.content[0] === 'object' && 'text' in response.content[0] 
        ? response.content[0].text as string
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
      const responseText = typeof response.content[0] === 'object' && 'text' in response.content[0] 
        ? response.content[0].text as string
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