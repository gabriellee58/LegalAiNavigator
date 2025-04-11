import OpenAI from "openai";
// Use standard import for Node.js compatibility
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';

// Set worker path to prevent worker initialization error in Node.js environment
GlobalWorkerOptions.workerSrc = ''; // Disable worker for Node.js environment

// Create an OpenAI client instance
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Extracts text from a PDF file using PDF.js
 * @param pdfBuffer The buffer containing the PDF data
 * @returns Extracted text from the PDF
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log('Attempting to extract text from PDF using PDF.js');
    
    // Set a higher maxImageSize to handle larger PDFs
    const loadingTask = pdfjsLib.getDocument({
      data: pdfBuffer,
      disableFontFace: true,
      ignoreErrors: true,
      isEvalSupported: true,
      cMapUrl: undefined,
      standardFontDataUrl: undefined
    });
    
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded successfully with ${pdf.numPages} pages`);
    
    let extractedText = '';
    
    // Iterate through each page to extract text
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        console.log(`Processing page ${i}/${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text from the text items
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        extractedText += `Page ${i}:\n${pageText}\n\n`;
      } catch (pageError) {
        console.error(`Error extracting text from page ${i}:`, pageError);
        extractedText += `[Error processing page ${i}]\n\n`;
      }
    }
    
    // If we didn't extract any meaningful text, try the fallback method
    if (!extractedText.trim() || extractedText.trim().length < 100) {
      console.log('Extracted text is too short, attempting secondary extraction method');
      return extractTextFromPdfFallback(pdfBuffer);
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF using primary method:', error);
    
    // Try fallback method
    try {
      console.log('Attempting fallback PDF extraction method');
      return extractTextFromPdfFallback(pdfBuffer);
    } catch (fallbackError) {
      console.error('Error with fallback PDF extraction:', fallbackError);
      throw new Error('Failed to extract text from PDF document using multiple methods');
    }
  }
}

/**
 * Fallback method to extract text from PDF when the primary method fails
 * Uses a simplified approach that works for some PDF types
 */
function extractTextFromPdfFallback(pdfBuffer: Buffer): string {
  try {
    // Convert buffer to string and look for text content
    const pdfString = pdfBuffer.toString('utf-8', 0, Math.min(pdfBuffer.length, 5000000));
    
    // Extract text between common PDF text markers
    const textExtracted: string[] = [];
    let textMode = false;
    let currentText = '';
    
    // Simple parser to find text blocks - not comprehensive but works as fallback
    const lines = pdfString.split(/[\r\n]+/);
    
    for (const line of lines) {
      // Look for text object markers in PDF structure
      if (line.includes('BT') || line.includes('/F')) {
        textMode = true;
      } else if (line.includes('ET')) {
        if (currentText.trim()) {
          textExtracted.push(currentText.trim());
        }
        currentText = '';
        textMode = false;
      } else if (textMode && line.includes('(') && line.includes(')')) {
        // Extract text between parentheses which often contains actual text
        const matches = line.match(/\((.*?)\)/g);
        if (matches) {
          for (const match of matches) {
            currentText += ' ' + match.slice(1, -1);
          }
        }
      }
    }
    
    // Get ASCII text strings that might be embedded in the PDF
    const asciiRegex = /[\x20-\x7E]{10,}/g;
    const asciiMatches = pdfString.match(asciiRegex) || [];
    
    // Add these to our extracted text
    for (const match of asciiMatches) {
      if (match.length > 20 && !textExtracted.includes(match)) {
        textExtracted.push(match);
      }
    }
    
    const result = textExtracted.join('\n\n');
    
    if (!result.trim()) {
      throw new Error('No text content found in PDF');
    }
    
    return result;
  } catch (error) {
    console.error('Error in fallback PDF text extraction:', error);
    throw new Error('Failed to extract text from PDF document with fallback method');
  }
}

// Type for contract analysis response
export type ContractAnalysisResult = {
  score: number;
  riskLevel: "low" | "medium" | "high";
  risks: {
    clause: string;
    issue: string;
    suggestion: string;
    severity: "low" | "medium" | "high";
    category?: string;
  }[];
  suggestions: {
    clause: string;
    suggestion: string;
    reason: string;
    category?: string;
  }[];
  summary: string;
  jurisdiction_issues?: {
    clause: string;
    issue: string;
    relevant_law?: string;
    recommendation: string;
  }[];
  clause_categories?: {
    payment?: string[];
    liability?: string[];
    termination?: string[];
    confidentiality?: string[];
    [key: string]: string[] | undefined;
  };
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
export async function analyzeContract(
  contractText: string, 
  jurisdiction: string = 'Canada',
  contractType: string = 'general'
): Promise<ContractAnalysisResult> {
  try {
    // Import the document processing utility
    // Using a dynamic import to avoid circular dependencies
    const { processContractForAnalysis } = await import('./documentChunker');
    
    // Process the contract text to handle length and token limitations
    console.log(`Processing contract with approximate length: ${contractText.length} characters`);
    const processedText = await processContractForAnalysis(contractText);
    console.log(`Processed contract text to: ${processedText.length} characters`);
    
    const prompt = `
      I need you to analyze the following contract for potential legal risks and provide improvement suggestions within the legal context of ${jurisdiction}, focusing specifically on laws and regulations applicable to ${contractType} contracts.
      
      As an AI legal assistant, please provide:
      1. A risk score from 0-100 (higher = safer contract)
      2. An overall risk level (low, medium, high)
      3. Identification of specific risky clauses, the issues they present, and suggestions to improve them
      4. General suggestions for improving the contract
      5. A summary of the contract and your analysis
      6. Identification of any clauses that may not align with ${jurisdiction} laws and regulations
      7. Analysis of key clauses by category (payment terms, termination, liability, etc.)
      
      If the contract appears to be truncated or summarized, note this in your analysis.
      
      Format your response as a JSON object with the following structure:
      {
        "score": number,
        "riskLevel": "low" | "medium" | "high",
        "risks": [
          {
            "clause": "text of the problematic clause",
            "issue": "description of the issue",
            "suggestion": "suggested improvement",
            "severity": "low" | "medium" | "high",
            "category": "category of the clause (e.g., liability, payment, termination)"
          }
        ],
        "suggestions": [
          {
            "clause": "text of the clause",
            "suggestion": "improvement suggestion",
            "reason": "reason for suggestion",
            "category": "category of the clause"
          }
        ],
        "summary": "overall summary",
        "jurisdiction_issues": [
          {
            "clause": "text of the clause",
            "issue": "description of jurisdictional issue",
            "relevant_law": "applicable law or regulation",
            "recommendation": "how to address the issue"
          }
        ],
        "clause_categories": {
          "payment": ["extracted payment terms"],
          "liability": ["extracted liability clauses"],
          "termination": ["extracted termination clauses"],
          "confidentiality": ["extracted confidentiality clauses"],
          "other_categories": ["as identified in the contract"]
        }
      }
      
      CONTRACT:
      ${processedText}
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
    // Import the document processing utility
    const { processContractForAnalysis } = await import('./documentChunker');
    
    // Process both contract texts to handle length and token limitations
    console.log(`Processing first contract with approximate length: ${firstContract.length} characters`);
    const processedFirstContract = await processContractForAnalysis(firstContract, 30000); // Allocate half token limit
    
    console.log(`Processing second contract with approximate length: ${secondContract.length} characters`);
    const processedSecondContract = await processContractForAnalysis(secondContract, 30000); // Allocate half token limit
    
    const prompt = `
      I need you to compare the following two contracts and identify key differences between them.
      
      As an AI legal assistant, please provide:
      1. A summary of the key differences between the contracts
      2. Details of specific differences, organized by section
      3. The potential impact of those differences when relevant
      4. An overall recommendation about which contract is more favorable or balanced
      
      If either contract appears to be truncated or summarized, note this in your analysis.
      
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
      ${processedFirstContract}
      
      SECOND CONTRACT:
      ${processedSecondContract}
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