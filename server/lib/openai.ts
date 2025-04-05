import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate an AI response for a legal question
 * @param userMessage The user's message/question
 * @returns AI generated response
 */
export async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI legal assistant specialized in Canadian law. 
          Provide helpful, accurate information about Canadian legal topics. 
          Always clarify that you are not providing legal advice and recommend consulting a qualified lawyer for specific legal issues.
          Focus on Canadian legal frameworks, regulations, and precedents.
          Be respectful, concise, and easy to understand.
          Avoid excessive legalese, but maintain accuracy in legal concepts.`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 800
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try asking your question differently.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm sorry, but I encountered an error processing your request. Please try again later.";
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

    const result = JSON.parse(response.choices[0].message.content);
    
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
 * @returns Research results
 */
export async function performLegalResearch(query: string): Promise<{
  relevantLaws: { title: string; description: string; source: string }[];
  relevantCases: { name: string; citation: string; relevance: string }[];
  summary: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a legal research assistant specialized in Canadian law.
          For the given query, identify relevant laws, statutes, and case precedents in Canada.
          Respond with JSON in this format:
          {
            "relevantLaws": [
              {"title": "Law title", "description": "Brief description", "source": "Source/citation"}
            ],
            "relevantCases": [
              {"name": "Case name", "citation": "Legal citation", "relevance": "Why relevant"}
            ],
            "summary": "Research summary"
          }`
        },
        {
          role: "user",
          content: `Research the following Canadian legal query:\n\n${query}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      relevantLaws: result.relevantLaws || [],
      relevantCases: result.relevantCases || [],
      summary: result.summary || "No research summary available"
    };
  } catch (error) {
    console.error("Error performing legal research:", error);
    return {
      relevantLaws: [],
      relevantCases: [],
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
