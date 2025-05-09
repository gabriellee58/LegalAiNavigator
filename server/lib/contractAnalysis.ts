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
 * PDF extraction response type with structured error information
 */
export interface PdfExtractionResult {
  success: boolean;
  text: string;
  pageCount?: number;
  extractedPageCount?: number;
  errorPages?: number[];
  errorDetails?: string;
  usedFallbackMethod?: boolean;
  truncated?: boolean;
  extractionMethod?: string;
}

/**
 * Enhanced text extraction from PDF with structured response
 * @param pdfBuffer The buffer containing the PDF data
 * @param maxTextLength Optional maximum text length to extract (for very large PDFs)
 * @returns Structured response with extraction results or error details
 */
export async function extractTextFromPdf(
  pdfBuffer: Buffer,
  maxTextLength: number = 500000 // Default 500KB text limit
): Promise<PdfExtractionResult> {
  try {
    console.log('Attempting to extract text from PDF using PDF.js');
    
    // Set options for PDF loading with enhanced memory options and timeout
    const loadingTask = pdfjsLib.getDocument({
      data: pdfBuffer,
      disableFontFace: true,
      cMapUrl: undefined,
      standardFontDataUrl: undefined,
      rangeChunkSize: 65536, // Increased chunk size for better performance
      maxImageSize: 16777216 // Limit max image size to 16MB
    });
    
    // Set a timeout for PDF loading to prevent hanging on problematic files
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('PDF loading timeout after 30 seconds')), 30000);
    });
    
    // Race between loading task and timeout
    const pdf = await Promise.race([loadingTask.promise, timeoutPromise]) as any;
    console.log(`PDF loaded successfully with ${pdf.numPages} pages`);
    
    let extractedText = '';
    const errorPages: number[] = [];
    let totalTextLength = 0;
    let truncated = false;
    let extractedPageCount = 0;
    
    // Define reasonable single page text length to detect binary or image-only pages
    const minExpectedTextPerPage = 50; // characters
    
    // Iterate through each page to extract text
    for (let i = 1; i <= pdf.numPages && !truncated; i++) {
      try {
        console.log(`Processing page ${i}/${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text from the text items with improved filtering
        const pageText = textContent.items
          .filter((item: any) => typeof item.str === 'string') // Ensure item.str is a string
          .map((item: any) => item.str.trim())
          .filter((str: string) => str.length > 0) // Remove empty strings
          .join(' ');
        
        // Only add meaningful text
        if (pageText.trim().length > minExpectedTextPerPage) {
          const pageHeader = `Page ${i}:\n`;
          
          // Check if adding this page would exceed our limit
          if (totalTextLength + pageHeader.length + pageText.length > maxTextLength) {
            extractedText += `\n\n[Content truncated due to size limits. ${pdf.numPages - i} pages not shown.]\n`;
            truncated = true;
            break;
          }
          
          extractedText += pageHeader + pageText + '\n\n';
          totalTextLength += pageHeader.length + pageText.length;
          extractedPageCount++;
        } else {
          console.log(`Page ${i} has insufficient text (${pageText.length} chars), may be an image or blank`);
          errorPages.push(i);
          extractedText += `Page ${i}:\n[Page contains minimal text or may be an image/blank]\n\n`;
        }
      } catch (pageError) {
        console.error(`Error extracting text from page ${i}:`, pageError);
        errorPages.push(i);
        extractedText += `Page ${i}:\n[Error processing page: ${pageError instanceof Error ? pageError.message : String(pageError)}]\n\n`;
      }
    }
    
    // If we didn't extract any meaningful text or most pages failed, try the fallback method
    if (!extractedText.trim() || extractedText.trim().length < 100 || (errorPages.length > pdf.numPages / 2)) {
      console.log('Extracted text is too short or too many pages failed, attempting fallback extraction method');
      try {
        const fallbackResult = extractTextFromPdfFallback(pdfBuffer);
        return {
          success: fallbackResult.length > 100,
          text: fallbackResult,
          pageCount: pdf.numPages,
          extractedPageCount: 0, // We don't know which pages were extracted in fallback mode
          errorPages,
          usedFallbackMethod: true,
          extractionMethod: 'fallback'
        };
      } catch (fallbackError) {
        throw fallbackError; // Pass to outer catch block
      }
    }
    
    return {
      success: true,
      text: extractedText,
      pageCount: pdf.numPages,
      extractedPageCount,
      errorPages: errorPages.length > 0 ? errorPages : undefined,
      truncated,
      extractionMethod: 'pdf.js'
    };
  } catch (error) {
    console.error('Error extracting text from PDF using primary method:', error);
    
    // Try fallback method
    try {
      console.log('Attempting fallback PDF extraction method');
      const fallbackText = extractTextFromPdfFallback(pdfBuffer);
      
      return {
        success: fallbackText.length > 100,
        text: fallbackText,
        usedFallbackMethod: true,
        errorDetails: error instanceof Error ? error.message : String(error),
        extractionMethod: 'fallback'
      };
    } catch (fallbackError) {
      console.error('Error with fallback PDF extraction:', fallbackError);
      
      // Return structured error response instead of throwing
      return {
        success: false,
        text: 'Failed to extract text from PDF document using multiple methods. The document may be encrypted, password-protected, or contain only scanned images without OCR.',
        errorDetails: `Primary error: ${error instanceof Error ? error.message : String(error)}. Fallback error: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
        extractionMethod: 'none'
      };
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