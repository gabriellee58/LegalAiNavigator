import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface OpenAIOptions {
  system?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Generate an AI response for a legal question
 * @param userMessage The user's message/question
 * @param options Configuration options for the request
 * @returns AI generated response
 */
export async function generateAIResponse(userMessage: string, options: OpenAIOptions = {}): Promise<string> {
  try {
    // Set up default options
    const system = options.system || `You are an AI legal assistant specialized in Canadian law. 
      Provide helpful, accurate information about Canadian legal topics. 
      Always clarify that you are not providing legal advice and recommend consulting a qualified lawyer for specific legal issues.
      Focus on Canadian legal frameworks, regulations, and precedents.
      Be respectful, concise, and easy to understand.
      Avoid excessive legalese, but maintain accuracy in legal concepts.`;
    
    const model = options.model || "gpt-4o"; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    const temperature = options.temperature !== undefined ? options.temperature : 0.7;
    const maxTokens = options.maxTokens || 800;
    
    console.log(`OpenAI request: model=${model}, temp=${temperature}, max_tokens=${maxTokens}`);
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: system
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: temperature,
      max_tokens: maxTokens
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }
    
    return content;
  } catch (error) {
    console.error("Error generating AI response with OpenAI:", error);
    throw error; // Let the caller handle the error (for proper fallback)
  }
}

/**
 * Analyze a contract for risks and suggestions
 * @param contractText The contract text to analyze
 * @returns Analysis results
 */
export async function analyzeContract(contractText: string): Promise<{
  risks: { description: string; severity: string; recommendation: string }[];
  suggestions: { clause: string; improvement: string }[];
  summary: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a legal contract analysis expert specializing in Canadian contract law.
          Analyze the provided contract and identify risks, make improvement suggestions, and provide a summary.
          Respond with JSON in this format:
          {
            "risks": [
              {"description": "Risk description", "severity": "High/Medium/Low", "recommendation": "How to mitigate"}
            ],
            "suggestions": [
              {"clause": "Clause reference", "improvement": "Suggested improvement"}
            ],
            "summary": "Brief overall assessment"
          }`
        },
        {
          role: "user",
          content: `Please analyze this contract from a Canadian legal perspective:\n\n${contractText}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      return {
        risks: [],
        suggestions: [],
        summary: "No content returned from AI analysis"
      };
    }
    
    const result = JSON.parse(content);
    
    return {
      risks: result.risks || [],
      suggestions: result.suggestions || [],
      summary: result.summary || "No summary available"
    };
  } catch (error) {
    console.error("Error analyzing contract:", error);
    return {
      risks: [{ description: "Error analyzing contract", severity: "High", recommendation: "Please try again later" }],
      suggestions: [],
      summary: "An error occurred during contract analysis"
    };
  }
}

/**
 * Perform legal research on a given query
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
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
                "relevanceScore": 0.95 // Number between 0 and 1 indicating relevance
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
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      return {
        relevantLaws: [],
        relevantCases: [],
        summary: "No content returned from AI research"
      };
    }
    
    const result = JSON.parse(content);
    
    return {
      relevantLaws: result.relevantLaws || [],
      relevantCases: result.relevantCases || [],
      legalConcepts: result.legalConcepts || [],
      summary: result.summary || "No research summary available"
    };
  } catch (error) {
    console.error("Error performing legal research:", error);
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
