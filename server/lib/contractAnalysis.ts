import OpenAI from "openai";

// Create an OpenAI client instance
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Type for contract analysis response
export type ContractAnalysisResult = {
  score: number;
  riskLevel: "low" | "medium" | "high";
  risks: {
    clause: string;
    issue: string;
    suggestion: string;
    severity: "low" | "medium" | "high";
  }[];
  suggestions: {
    clause: string;
    suggestion: string;
    reason: string;
  }[];
  summary: string;
};

// Type for contract comparison response
export type ContractComparisonResult = {
  summary: string;
  differences: {
    section: string;
    first: string;
    second: string;
    impact?: string;
  }[];
  recommendation: string;
};

/**
 * Analyzes a contract for potential risks and improvement opportunities
 * @param contractText The full text of the contract to analyze
 * @returns Analysis results including risks and suggestions
 */
export async function analyzeContract(contractText: string): Promise<ContractAnalysisResult> {
  try {
    const prompt = `
      I need you to analyze the following contract for potential legal risks and provide improvement suggestions.
      
      As an AI legal assistant, please provide:
      1. A risk score from 0-100 (higher = safer contract)
      2. An overall risk level (low, medium, high)
      3. Identification of specific risky clauses, the issues they present, and suggestions to improve them
      4. General suggestions for improving the contract
      5. A summary of the contract and your analysis
      
      Format your response as a JSON object with the following structure:
      {
        "score": number,
        "riskLevel": "low" | "medium" | "high",
        "risks": [
          {
            "clause": "text of the problematic clause",
            "issue": "description of the issue",
            "suggestion": "suggested improvement",
            "severity": "low" | "medium" | "high"
          }
        ],
        "suggestions": [
          {
            "clause": "text of the clause",
            "suggestion": "improvement suggestion",
            "reason": "reason for suggestion"
          }
        ],
        "summary": "overall summary"
      }
      
      CONTRACT:
      ${contractText}
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for more consistent results
    });

    const responseContent = response.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error("No analysis results returned from OpenAI");
    }

    const parsedResponse = JSON.parse(responseContent) as ContractAnalysisResult;
    
    // Validate the structure of the response
    if (!parsedResponse.score || !parsedResponse.riskLevel || !parsedResponse.summary) {
      throw new Error("Invalid response format from analysis");
    }

    return parsedResponse;
  } catch (error) {
    console.error("Error analyzing contract:", error);
    throw error;
  }
}

/**
 * Compares two versions of a contract to identify key differences
 * @param firstContract The text of the first contract
 * @param secondContract The text of the second contract
 * @returns Comparison results including differences and recommendations
 */
export async function compareContracts(
  firstContract: string,
  secondContract: string
): Promise<ContractComparisonResult> {
  try {
    const prompt = `
      I need you to compare the following two contracts and identify key differences between them.
      
      As an AI legal assistant, please provide:
      1. A summary of the key differences between the contracts
      2. Details of specific differences, organized by section
      3. The potential impact of those differences when relevant
      4. An overall recommendation about which contract is more favorable or balanced
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "overall comparison summary",
        "differences": [
          {
            "section": "name or identifier of the section",
            "first": "text from first contract",
            "second": "text from second contract",
            "impact": "description of potential impact" (optional)
          }
        ],
        "recommendation": "recommendation on which contract is more favorable"
      }
      
      FIRST CONTRACT:
      ${firstContract}
      
      SECOND CONTRACT:
      ${secondContract}
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const responseContent = response.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error("No comparison results returned from OpenAI");
    }

    const parsedResponse = JSON.parse(responseContent) as ContractComparisonResult;
    
    // Validate the structure of the response
    if (!parsedResponse.summary || !Array.isArray(parsedResponse.differences)) {
      throw new Error("Invalid response format from comparison");
    }

    return parsedResponse;
  } catch (error) {
    console.error("Error comparing contracts:", error);
    throw error;
  }
}