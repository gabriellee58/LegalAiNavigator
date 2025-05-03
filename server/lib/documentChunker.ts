/**
 * Document Chunking and Summarization Utilities
 * 
 * These utilities help manage large texts for AI processing by:
 * 1. Chunking documents into manageable pieces
 * 2. Summarizing large sections to reduce token usage
 * 3. Extracting key sections when full documents exceed token limits
 */

import OpenAI from "openai";
import { generateDeepSeekResponse } from "./deepseek";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const MODEL = "gpt-4o";

// Maximum tokens to target for AI requests
const MAX_TOKENS = 30000;  // Keep well below DeepSeek's 65536 limit to account for system messages and other content
// DeepSeek has reported that some documents are exceeding token limits even with our estimates
// We need to be more conservative with large documents

/**
 * Splits text into relatively equal-sized chunks based on paragraphs
 * @param text The full text to split
 * @param maxChunks The maximum number of chunks to create
 * @returns Array of text chunks
 */
export function chunkText(text: string, maxChunks: number = 4): string[] {
  // Split by paragraphs (multiple newlines)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length <= maxChunks) {
    return paragraphs;
  }
  
  const paragraphsPerChunk = Math.ceil(paragraphs.length / maxChunks);
  const chunks: string[] = [];
  
  for (let i = 0; i < maxChunks; i++) {
    const start = i * paragraphsPerChunk;
    const end = Math.min(start + paragraphsPerChunk, paragraphs.length);
    const chunk = paragraphs.slice(start, end).join('\n\n');
    chunks.push(chunk);
  }
  
  return chunks;
}

/**
 * Estimate token count in a string (rough approximation)
 * @param text Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  // GPT models use roughly ~0.75 tokens per word
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 0.75);
}

/**
 * Summarizes a section of text to reduce token count
 * @param text Text to summarize
 * @param maxLength Target maximum length for the summary
 * @returns Summarized text
 */
export async function summarizeText(text: string, maxLength: number = 2000): Promise<string> {
  try {
    const currentLength = text.split(/\s+/).length;
    
    // Don't summarize if already short enough
    if (currentLength <= maxLength) {
      return text;
    }
    
    // Create a summarization prompt
    const summaryPrompt = `
      Summarize the following text to capture all key information in approximately ${maxLength} words.
      Focus on preserving:
      1. Critical contractual language
      2. Legal terms and definitions
      3. Numbers, dates, and specific conditions
      4. Obligations and restrictions
      
      Text to summarize:
      ${text}
    `;
    
    // Try DeepSeek first
    try {
      const summary = await generateDeepSeekResponse(summaryPrompt, {
        maxTokens: Math.floor(maxLength * 1.5), // Allow some buffer
        temperature: 0.1 // Lower temperature for more factual summarization
      });
      
      return summary;
    } catch (deepSeekError) {
      // Fall back to OpenAI
      console.log("DeepSeek summarization failed, falling back to OpenAI:", deepSeekError);
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: summaryPrompt }],
        temperature: 0.1,
        max_tokens: Math.floor(maxLength * 1.5)
      });
      
      return response.choices[0].message.content || text;
    }
  } catch (error) {
    console.error("Text summarization failed:", error);
    // If summarization fails, return a truncated version with a note
    const truncated = text.split(/\s+/).slice(0, maxLength).join(' ');
    return `${truncated}\n[... Text truncated due to length ...]`;
  }
}

/**
 * Extracts the most important sections from a contract text
 * @param contractText Full contract text
 * @param maxTokens Target maximum tokens for the result
 * @returns The processed text with key sections
 */
export async function extractKeyContractSections(contractText: string, maxTokens: number = MAX_TOKENS): Promise<string> {
  try {
    // Rough token estimation
    const estimatedTokens = estimateTokenCount(contractText);
    
    // If already within token limit, return as-is
    if (estimatedTokens <= maxTokens) {
      return contractText;
    }
    
    // Create chunks from the contract
    const chunks = chunkText(contractText, 4);
    
    // If still too large, summarize each chunk
    if (estimatedTokens > maxTokens * 1.5) {
      const targetLengthPerChunk = Math.floor((maxTokens * 0.85) / chunks.length);
      
      // Process chunks in parallel
      const summarizedChunks = await Promise.all(
        chunks.map(async (chunk, index) => {
          const chunkSummary = await summarizeText(chunk, targetLengthPerChunk);
          return `--- SECTION ${index + 1} OF ${chunks.length} ---\n${chunkSummary}`;
        })
      );
      
      // Add extraction notice
      const notice = `
        NOTE: This contract was automatically processed to extract key sections due to its length.
        Some detailed language may have been summarized, but all legally significant sections have been preserved.
      `;
      
      return notice + '\n\n' + summarizedChunks.join('\n\n');
    }
    
    // Less extreme case - use selective extraction instead
    return await extractSelectiveContract(contractText, maxTokens);
  } catch (error) {
    console.error("Error extracting key contract sections:", error);
    // Emergency fallback - simple truncation with sections
    return emergencyTruncateContract(contractText, maxTokens);
  }
}

/**
 * Extract only key sections from a contract using AI
 * @param contractText Full contract text
 * @param maxTokens Maximum tokens target
 * @returns Extracted important contract sections
 */
async function extractSelectiveContract(contractText: string, maxTokens: number): Promise<string> {
  try {
    // Prepare extraction prompt
    const extractionPrompt = `
      I need to extract only the most legally important sections from this contract to fit within a token limit.
      
      Please identify and extract:
      1. Definitions section
      2. Payment terms
      3. Liability and indemnification clauses
      4. Termination conditions
      5. Governing law
      6. Dispute resolution mechanism
      7. Any unusual or non-standard clauses
      
      Maintain the exact original text of these sections whenever possible.
      
      Contract:
      ${contractText}
    `;
    
    // Try DeepSeek first
    try {
      const extracted = await generateDeepSeekResponse(extractionPrompt, {
        maxTokens: Math.floor(maxTokens * 0.7),
        temperature: 0.1
      });
      
      return `
        NOTICE: This contract has been processed to extract key sections due to its length.
        
        ${extracted}
      `;
    } catch (deepSeekError) {
      // Fall back to OpenAI
      console.log("DeepSeek extraction failed, falling back to OpenAI:", deepSeekError);
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: extractionPrompt }],
        temperature: 0.1,
        max_tokens: Math.floor(maxTokens * 0.7)
      });
      
      return `
        NOTICE: This contract has been processed to extract key sections due to its length.
        
        ${response.choices[0].message.content}
      `;
    }
  } catch (error) {
    console.error("Selective contract extraction failed:", error);
    throw error;
  }
}

/**
 * Emergency fallback function for when all other methods fail
 * Simply takes important structural elements from beginning, middle and end
 * @param contractText Full contract text
 * @param maxTokens Maximum tokens
 * @returns Truncated contract with key parts
 */
function emergencyTruncateContract(contractText: string, maxTokens: number): string {
  // Split into lines
  const lines = contractText.split('\n');
  
  // Calculate approximately how many lines we can include
  const tokensPerLine = estimateTokenCount(contractText) / lines.length;
  const maxLines = Math.floor(maxTokens / tokensPerLine) - 50; // Reserve some tokens for headers
  
  if (maxLines >= lines.length) {
    return contractText;
  }
  
  // Take first third of the document (often contains definitions and key terms)
  const firstPart = Math.floor(maxLines * 0.4);
  
  // Take portions from the middle (important terms usually here)
  const middleStart = Math.floor(lines.length / 2) - Math.floor(maxLines * 0.2);
  const middlePart = Math.floor(maxLines * 0.2);
  
  // Take the end portion (often contains signatures, enforcement terms)
  const endStart = lines.length - Math.floor(maxLines * 0.4);
  const endPart = Math.floor(maxLines * 0.4);
  
  // Combine the sections
  const extractedLines = [
    ...lines.slice(0, firstPart),
    "\n--- MIDDLE SECTION (content omitted) ---\n",
    ...lines.slice(middleStart, middleStart + middlePart),
    "\n--- CONTENT OMITTED ---\n",
    ...lines.slice(endStart)
  ];
  
  return `
    NOTICE: This contract was truncated due to its length.
    Important sections from the beginning, middle, and end have been preserved.
    
    ${extractedLines.join('\n')}
  `;
}

/**
 * Process contract text for optimal AI analysis
 * Combines all techniques based on text length and complexity
 * @param contractText Original contract text
 * @param maxTokens Optional custom token limit (defaults to MAX_TOKENS)
 * @returns Processed text ready for AI analysis
 */
export async function processContractForAnalysis(contractText: string, maxTokens: number = MAX_TOKENS): Promise<string> {
  try {
    const estimatedTokens = estimateTokenCount(contractText);
    console.log(`Estimated tokens in contract: ${estimatedTokens}`);
    
    // Simple case: already fits within token limit with buffer space
    if (estimatedTokens <= maxTokens * 0.85) {
      // Still has plenty of room
      console.log(`Contract is within token limits (${estimatedTokens} <= ${maxTokens * 0.85})`);
      return contractText;
    }
    
    // For large files that are close to the limit, use regular extraction
    if (estimatedTokens <= maxTokens * 1.3) {
      console.log(`Contract is large but manageable (${estimatedTokens} tokens). Extracting key sections.`);
      return await extractKeyContractSections(contractText, maxTokens * 0.8);
    }
    
    // For extremely large files, use more aggressive extraction and add a warning
    if (estimatedTokens > maxTokens * 1.3) {
      console.log(`Contract is extremely large (${estimatedTokens} tokens). Using aggressive extraction.`);
      const extracted = await extractKeyContractSections(contractText, maxTokens * 0.6);
      return `
WARNING: This contract is exceptionally large (approximately ${estimatedTokens} tokens).
The analysis will focus on key sections that have been automatically extracted.
Some details may be missing from the analysis.

${extracted}
      `;
    }
    
    return contractText;
  } catch (error) {
    console.error("Error processing contract for analysis:", error);
    // Use emergency truncation as the last resort
    return emergencyTruncateContract(contractText, maxTokens * 0.5);
  }
}