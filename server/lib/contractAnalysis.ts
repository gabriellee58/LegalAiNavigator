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
    
    // Set options for PDF loading
    const loadingTask = pdfjsLib.getDocument({
      data: pdfBuffer,
      disableFontFace: true,
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
    console.log('Starting enhanced fallback PDF extraction');
    
    // Try multiple approaches to extract text
    let extractedText = '';
    
    // Method 1: Convert buffer to string and look for text content
    try {
      // Convert buffer to string and look for text content (limiting to avoid memory issues)
      const pdfString = pdfBuffer.toString('utf-8', 0, Math.min(pdfBuffer.length, 2000000));
      
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
      
      // Get ASCII text strings that might be embedded in the PDF - more aggressively
      // Look for sequences of readable text at least 5 characters long
      const asciiRegex = /[\x20-\x7E]{5,}/g;
      const asciiMatches = pdfString.match(asciiRegex) || [];
      
      // Add meaningful ASCII matches to our extracted text
      for (const match of asciiMatches) {
        // Filter out binary data that might be accidentally matched
        if (
          match.length > 5 && 
          !match.includes('\u0000') && 
          !/^[0-9\s]+$/.test(match) && // avoid sequences of just numbers
          !textExtracted.includes(match)
        ) {
          textExtracted.push(match);
        }
      }
      
      extractedText = textExtracted.join('\n\n');
      console.log(`Method 1 extracted ${extractedText.length} characters`);
    } catch (method1Error) {
      console.error('PDF Extraction Method 1 failed:', method1Error);
    }
    
    // Method 2: Look for sequences that might be sentences
    if (extractedText.length < 500) {
      try {
        // Convert to hex to better handle binary data
        const hexString = pdfBuffer.toString('hex');
        
        // Look for sequences of letters that might be words
        const asciiHexRegex = /(?:3[0-9]|4[1-9a-f]|5[0-9a]|6[1-9a-f]|7[0-9a]){20,}/gi;
        const possibleTextBlocks = hexString.match(asciiHexRegex) || [];
        
        const decodedBlocks: string[] = [];
        for (const block of possibleTextBlocks) {
          try {
            // Convert hex back to ascii
            const bytes = [];
            for (let i = 0; i < block.length; i += 2) {
              bytes.push(parseInt(block.substring(i, i + 2), 16));
            }
            const decoded = Buffer.from(bytes).toString('utf-8');
            
            // Only keep if it looks like real text
            if (decoded.length > 10 && /[a-zA-Z]{3,}/.test(decoded)) {
              decodedBlocks.push(decoded);
            }
          } catch (blockError) {
            // Skip invalid blocks
          }
        }
        
        if (decodedBlocks.length > 0) {
          extractedText += '\n\n' + decodedBlocks.join('\n\n');
          console.log(`Method 2 added ${decodedBlocks.join('\n\n').length} characters`);
        }
      } catch (method2Error) {
        console.error('PDF Extraction Method 2 failed:', method2Error);
      }
    }
    
    // If we still don't have much text, return a message indicating PDF extraction difficulty
    if (!extractedText.trim() || extractedText.trim().length < 200) {
      console.log('All fallback extraction methods failed to get meaningful text');
      return 'This PDF document does not contain readily extractable text. It may be scanned, encrypted, or contain only images.';
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error in PDF fallback extraction:', error);
    return 'Failed to extract text from the PDF document using multiple fallback methods.';
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
    const processedFirstContract = await processContractForAnalysis(firstContract);
    
    console.log(`Processing second contract with approximate length: ${secondContract.length} characters`);
    const processedSecondContract = await processContractForAnalysis(secondContract);
    
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