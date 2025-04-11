/**
 * DeepSeek API Integration for Canadian Legal AI
 * 
 * This file implements DeepSeek API functionality to replace OpenAI across the application
 */

// Type definitions for DeepSeek API responses
interface DeepSeekCompletionResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Constants
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1";
const DEFAULT_MODEL = "deepseek-chat"; // Replace with the appropriate DeepSeek model

interface DeepSeekOptions {
  system?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Generate an AI response for a legal question using DeepSeek
 * @param userMessage The user's message/question
 * @param options Configuration options for the request
 * @returns AI generated response
 */
export async function generateAIResponse(userMessage: string, options: DeepSeekOptions = {}): Promise<string> {
  try {
    console.log(`Attempting DeepSeek API request for prompt: "${userMessage.substring(0, 50)}..."`);
    
    // Set up default options
    const systemPrompt = options.system || `You are an AI legal assistant specialized in Canadian law. 
      Provide helpful, accurate information about Canadian legal topics. 
      Always clarify that you are not providing legal advice and recommend consulting a qualified lawyer for specific legal issues.
      Focus on Canadian legal frameworks, regulations, and precedents.
      Be respectful, concise, and easy to understand.
      Avoid excessive legalese, but maintain accuracy in legal concepts.`;
    
    const model = options.model || DEFAULT_MODEL;
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 800;
    
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`DeepSeek API Error (Status ${response.status}):`, JSON.stringify(errorData));
      
      // Handle specific error cases
      if (response.status === 402) {
        throw new Error(`DeepSeek API Error: Insufficient account balance - using fallback API`);
      } else {
        throw new Error(`DeepSeek API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    }

    const data: DeepSeekCompletionResponse = await response.json();
    const content = data.choices[0]?.message.content;
    
    if (!content) {
      throw new Error("Empty response from DeepSeek");
    }
    
    return content;
  } catch (error) {
    console.error("Error generating AI response with DeepSeek:", error);
    throw error; // Let the caller handle the error (for proper fallback)
  }
}

/**
 * Alias for generateAIResponse specifically for the aiService module
 */
export const generateDeepSeekResponse = generateAIResponse;

/**
 * Analyze a contract for risks and suggestions using DeepSeek
 * @param contractText The contract text to analyze
 * @param jurisdiction The jurisdiction (e.g., "Canada", "Ontario")
 * @param contractType The type of contract (e.g., "employment", "lease")
 * @returns Analysis results
 */
export async function analyzeContract(
  contractText: string,
  jurisdiction: string = "Canada",
  contractType: string = "general"
): Promise<{
  risks: { description: string; severity: string; recommendation: string }[];
  suggestions: { clause: string; improvement: string }[];
  summary: string;
  score?: number;
  riskLevel?: string;
  clause_categories?: any;
}> {
  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a legal contract analysis expert specializing in ${jurisdiction} contract law.
            Analyze the provided ${contractType} contract and identify risks, make improvement suggestions, and provide a summary.
            Respond with JSON in this format:
            {
              "risks": [
                {"description": "Risk description", "severity": "High/Medium/Low", "recommendation": "How to mitigate"}
              ],
              "suggestions": [
                {"clause": "Clause reference", "improvement": "Suggested improvement"}
              ],
              "summary": "Brief overall assessment",
              "score": 85,
              "riskLevel": "Medium",
              "clause_categories": {
                "indemnification": ["Section X", "Section Y"],
                "termination": ["Section Z"]
              }
            }`
          },
          {
            role: "user",
            content: `Please analyze this ${contractType} contract from a ${jurisdiction} legal perspective:\n\n${contractText}`
          }
        ],
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: DeepSeekCompletionResponse = await response.json();
    const content = data.choices[0]?.message.content;
    
    if (!content) {
      return {
        risks: [],
        suggestions: [],
        summary: "No content returned from AI analysis",
        score: 0,
        riskLevel: "Unknown"
      };
    }
    
    try {
      const result = JSON.parse(content);
      
      return {
        risks: result.risks || [],
        suggestions: result.suggestions || [],
        summary: result.summary || "No summary available",
        score: result.score || 0,
        riskLevel: result.riskLevel || "Unknown",
        clause_categories: result.clause_categories || {}
      };
    } catch (jsonError) {
      console.error("Error parsing DeepSeek JSON response:", jsonError);
      return {
        risks: [{ description: "Error parsing analysis results", severity: "High", recommendation: "Please try again later" }],
        suggestions: [],
        summary: "An error occurred during contract analysis parsing"
      };
    }
  } catch (error) {
    console.error("Error analyzing contract with DeepSeek:", error);
    return {
      risks: [{ description: "Error analyzing contract", severity: "High", recommendation: "Please try again later" }],
      suggestions: [],
      summary: "An error occurred during contract analysis"
    };
  }
}

/**
 * Perform legal research on a given query using DeepSeek
 * @param query The research query
 * @param jurisdiction The jurisdiction (e.g., "canada", "ontario")
 * @param practiceArea The practice area (e.g., "family", "criminal")
 * @returns Research results
 */
export async function performLegalResearch(
  query: string,
  jurisdiction: string = "canada",
  practiceArea: string = "all"
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
    
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a legal research assistant specialized in Canadian law with expertise in ${jurisdictionDisplay} jurisdiction ${practiceAreaContext}.
            
            For the given query, provide comprehensive research focusing on ${jurisdictionDisplay} laws, statutes, and case precedents.
            
            Include relevant legal concepts, provide detailed case information with key points from judgments, and assign relevance scores to laws.
            
            Respond with JSON in this format:
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
            }`
          },
          {
            role: "user",
            content: `Research the following legal query for ${jurisdictionDisplay} ${practiceAreaContext}:\n\n${query}\n\nProvide detailed, jurisdiction-specific research with practical insights.`
          }
        ],
        max_tokens: 2500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: DeepSeekCompletionResponse = await response.json();
    const content = data.choices[0]?.message.content;
    
    if (!content) {
      return {
        relevantLaws: [],
        relevantCases: [],
        summary: "No content returned from AI research"
      };
    }
    
    try {
      const result = JSON.parse(content);
      
      return {
        relevantLaws: result.relevantLaws || [],
        relevantCases: result.relevantCases || [],
        legalConcepts: result.legalConcepts || [],
        summary: result.summary || "No research summary available"
      };
    } catch (jsonError) {
      console.error("Error parsing DeepSeek research response:", jsonError);
      return {
        relevantLaws: [],
        relevantCases: [],
        legalConcepts: [],
        summary: "Error parsing research results: " + content.substring(0, 200) + "..."
      };
    }
  } catch (error) {
    console.error("Error performing legal research with DeepSeek:", error);
    return {
      relevantLaws: [],
      relevantCases: [],
      legalConcepts: [],
      summary: "An error occurred while performing research"
    };
  }
}

/**
 * Generate a legal document from a template and form data
 * @param template The document template
 * @param formData The form data to fill the template with
 * @returns The generated document
 */
export async function generateLegalDocument(
  template: string,
  formData: Record<string, any>
): Promise<string> {
  try {
    // Replace template variables with form data
    let document = template;
    
    for (const [key, value] of Object.entries(formData)) {
      const placeholder = new RegExp(`\\[${key.toUpperCase()}\\]`, 'g');
      document = document.replace(placeholder, value.toString());
    }
    
    return document;
  } catch (error) {
    console.error("Error generating legal document:", error);
    return "An error occurred while generating the document";
  }
}

/**
 * Compare contracts using DeepSeek
 * @param firstContract First contract text
 * @param secondContract Second contract text
 * @returns Analysis of differences
 */
export async function compareContracts(
  firstContract: string,
  secondContract: string
): Promise<{
  differences: {
    section: string;
    firstContractText: string;
    secondContractText: string;
    impact: string;
    recommendation: string;
  }[];
  summary: string;
}> {
  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a legal contract comparison expert specializing in Canadian contract law.
            Compare the two provided contracts and identify key differences, their impacts, and provide recommendations.
            Focus on substantive legal differences rather than formatting or minor wording changes.
            Respond with JSON in this format:
            {
              "differences": [
                {
                  "section": "Section name/number",
                  "firstContractText": "Text from first contract",
                  "secondContractText": "Text from second contract",
                  "impact": "Impact of the difference",
                  "recommendation": "Recommendation"
                }
              ],
              "summary": "Overall comparison summary"
            }`
          },
          {
            role: "user",
            content: `Please compare these two contracts from a Canadian legal perspective:\n\nFirst Contract:\n${firstContract}\n\nSecond Contract:\n${secondContract}`
          }
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: DeepSeekCompletionResponse = await response.json();
    const content = data.choices[0]?.message.content;
    
    if (!content) {
      return {
        differences: [],
        summary: "No content returned from comparison analysis"
      };
    }
    
    try {
      const result = JSON.parse(content);
      
      return {
        differences: result.differences || [],
        summary: result.summary || "No comparison summary available"
      };
    } catch (jsonError) {
      console.error("Error parsing DeepSeek comparison response:", jsonError);
      return {
        differences: [],
        summary: "Error parsing comparison results"
      };
    }
  } catch (error) {
    console.error("Error comparing contracts with DeepSeek:", error);
    return {
      differences: [],
      summary: "An error occurred during contract comparison"
    };
  }
}

/**
 * Extract text from PDF using DeepSeek
 * Note: This is a simplified example assuming DeepSeek has document processing capabilities.
 * In a real implementation, you might need to use a separate PDF processing library.
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  // In this example, we're using the buffer conversion approach as a fallback
  // since DeepSeek may not directly support PDF extraction
  try {
    // Simple conversion of the buffer to text
    // This is a fallback; in reality, you should use a PDF extraction library
    return pdfBuffer.toString('utf-8');
  } catch (error) {
    console.error("Error extracting text from PDF with DeepSeek:", error);
    return "";
  }
}