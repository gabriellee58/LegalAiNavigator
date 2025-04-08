import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a response from Claude
 * @param prompt The prompt for Claude
 * @param system Optional system message
 */
export async function generateClaudeResponse(prompt: string, system?: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: system || "You are a legal assistant AI specialized in Canadian law. Provide accurate, helpful legal information while clearly stating that your responses are not legal advice and users should consult with a qualified legal professional for advice specific to their situation.",
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    // Handle the content correctly
    if (message.content[0].type === 'text') {
      return message.content[0].text;
    } else {
      // In case the content is not of type 'text'
      return 'Unable to generate a text response';
    }
  } catch (error) {
    console.error('Error generating Claude response:', error);
    return "I'm sorry, but I encountered an error processing your request. Please try again later.";
  }
}

/**
 * Generate an AI response for a legal question using Claude
 * Matches the OpenAI format for easy integration
 * @param userMessage The user's message/question
 * @returns AI generated response
 */
export async function generateAIResponseClaude(userMessage: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: `You are an AI legal assistant specialized in Canadian law. 
      Provide helpful, accurate information about Canadian legal topics. 
      Always clarify that you are not providing legal advice and recommend consulting a qualified lawyer for specific legal issues.
      Focus on Canadian legal frameworks, regulations, and precedents.
      Be respectful, concise, and easy to understand.
      Avoid excessive legalese, but maintain accuracy in legal concepts.`,
      max_tokens: 800,
      messages: [{ role: 'user', content: userMessage }],
    });

    // Handle the content correctly
    if (message.content[0].type === 'text') {
      return message.content[0].text;
    } else {
      // In case the content is not of type 'text'
      return "I apologize, but I couldn't generate a response. Please try asking your question differently.";
    }
  } catch (error) {
    console.error("Error generating AI response with Claude:", error);
    return "I'm sorry, but I encountered an error processing your request. Please try again later.";
  }
}

/**
 * Analyze legal documents with Claude
 * @param document The document text
 * @param documentType The type of document
 * @param jurisdiction The jurisdiction
 */
export async function analyzeLegalDocument(document: string, documentType: string, jurisdiction?: string): Promise<{ content: string }> {
  try {
    const prompt = `Please analyze the following ${documentType} document according to ${jurisdiction || 'Canadian'} law:\n\n${document}`;

    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: "You are a legal document analysis assistant with expertise in Canadian law. Analyze the document thoroughly and provide detailed insights.",
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Handle the content correctly
    if (message.content[0].type === 'text') {
      return { content: message.content[0].text };
    } else {
      return { content: 'Unable to generate a text response' };
    }
  } catch (error) {
    console.error('Error analyzing document with Claude:', error);
    throw new Error('Failed to analyze document with Claude');
  }
}

/**
 * Generate enhanced legal documents with Claude
 * @param templateContent The document template
 * @param documentData The data to fill the template
 * @param documentType The type of document
 * @param jurisdiction The jurisdiction
 */
export async function generateEnhancedDocument(
  templateContent: string,
  documentData: Record<string, any>,
  documentType: string,
  jurisdiction?: string
): Promise<{ content: string }> {
  try {
    // Replace template variables with form data
    let filledTemplate = templateContent;
    
    for (const [key, value] of Object.entries(documentData)) {
      const placeholder = new RegExp(`\\[${key.toUpperCase()}\\]`, 'g');
      filledTemplate = filledTemplate.replace(placeholder, value.toString());
    }

    // Ask Claude to enhance the document
    const instructions = `Create an enhanced legal document of type ${documentType}${jurisdiction ? ` for the jurisdiction of ${jurisdiction}` : ''}.`;
    const prompt = `${instructions}\n\nHere is the template document with basic information filled in:\n\n${filledTemplate}\n\nPlease enhance this document to be more comprehensive and legally sound while maintaining all the provided information.`;

    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: "You are a legal document drafting assistant with expertise in Canadian law. Your task is to enhance legal documents while preserving the essential information and intent.",
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Handle the content correctly
    if (message.content[0].type === 'text') {
      return { content: message.content[0].text };
    } else {
      return { content: 'Unable to generate a text response' };
    }
  } catch (error) {
    console.error('Error generating enhanced document with Claude:', error);
    throw new Error('Failed to generate enhanced document with Claude');
  }
}

/**
 * Perform legal research with Claude
 * @param query The research query
 * @param jurisdiction The jurisdiction
 * @param practiceArea The practice area
 */
export async function performLegalResearch(
  query: string,
  jurisdiction: string = 'canada',
  practiceArea: string = 'all'
): Promise<{
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
}> {
  try {
    // Format jurisdiction display name
    const jurisdictionDisplay = jurisdiction === "canada" 
      ? "Federal (Canada)" 
      : jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1).replace(/-/g, ' ');
    
    // Build practice area context
    let practiceAreaContext = "";
    if (practiceArea !== "all") {
      practiceAreaContext = `with a focus on ${practiceArea.replace(/-/g, ' ')} law`;
    }

    const prompt = `Research the following legal query for ${jurisdictionDisplay} ${practiceAreaContext}:

${query}

Provide detailed, jurisdiction-specific research with practical insights. You must provide your response in JSON format with the following structure:
{
  "relevantLaws": [
    {
      "title": "Law title",
      "description": "Detailed description of the law and how it applies to the query",
      "source": "Full source/citation",
      "url": "URL to official source if available",
      "relevanceScore": 0.95
    }
  ],
  "relevantCases": [
    {
      "name": "Full case name",
      "citation": "Precise legal citation",
      "relevance": "Detailed explanation of relevance to query",
      "year": "Year of the case",
      "jurisdiction": "Court jurisdiction",
      "judgment": "Brief summary of judgment",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "url": "URL to case report if available"
    }
  ],
  "legalConcepts": [
    {
      "concept": "Legal concept name",
      "definition": "Clear definition of the concept",
      "relevance": "How this concept applies to the query"
    }
  ],
  "summary": "Comprehensive research summary with analysis and recommendations"
}`;

    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: `You are a legal research assistant specialized in Canadian law with expertise in ${jurisdictionDisplay} jurisdiction ${practiceAreaContext}.
      
For the given query, provide comprehensive research focusing on ${jurisdictionDisplay} laws, statutes, and case precedents.

Include relevant legal concepts, provide detailed case information with key points from judgments, and assign relevance scores to laws.

You must respond with valid JSON following the exact format specified in the user's message. Do not include any text before or after the JSON.`,
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Handle the content correctly
    if (message.content[0].type === 'text') {
      const content = message.content[0].text;
      
      // Extract JSON from the content
      let jsonStr = content;
      // If there's extra text around the JSON, try to extract just the JSON part
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonStr = content.substring(jsonStart, jsonEnd);
      }
      
      try {
        const result = JSON.parse(jsonStr);
        
        return {
          relevantLaws: result.relevantLaws || [],
          relevantCases: result.relevantCases || [],
          legalConcepts: result.legalConcepts || [],
          summary: result.summary || "No research summary available"
        };
      } catch (jsonError) {
        console.error('Error parsing Claude research response as JSON:', jsonError);
        
        // Fallback structure if JSON parsing fails
        return {
          relevantLaws: [],
          relevantCases: [],
          legalConcepts: [],
          summary: "Failed to structure the research results. The raw response was: " + content.substring(0, 200) + "..."
        };
      }
    } else {
      return {
        relevantLaws: [],
        relevantCases: [],
        legalConcepts: [],
        summary: "Unable to generate a text response"
      };
    }
  } catch (error) {
    console.error('Error performing legal research with Claude:', error);
    return {
      relevantLaws: [],
      relevantCases: [],
      legalConcepts: [],
      summary: "An error occurred while performing research with Claude"
    };
  }
}