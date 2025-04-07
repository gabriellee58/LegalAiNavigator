/**
 * Client-side wrapper for Anthropic API requests
 */

import { apiRequest } from "./queryClient";

/**
 * Send a chat message to the Anthropic AI assistant
 * @param userId The user ID
 * @param content The message content
 */
export const sendChatMessage = async (userId: number, content: string) => {
  return await apiRequest("POST", "/api/chat/messages/anthropic", {
    userId,
    role: "user",
    content,
    provider: "anthropic", // Explicitly specify the provider
  });
};

/**
 * Analyze a contract for risks and suggestions using Claude
 * @param content The contract text
 */
export const analyzeContract = async (content: string) => {
  return await apiRequest("POST", "/api/analyze-contract", { 
    content,
    provider: "anthropic"
  });
};

/**
 * Perform legal research on a query using Claude
 * @param userId The user ID
 * @param query The research query
 * @param jurisdiction The jurisdiction (e.g., "canada", "ontario")
 * @param practiceArea The practice area (e.g., "family", "criminal")
 */
export const performResearch = async (
  userId: number, 
  query: string,
  jurisdiction: string = "canada",
  practiceArea: string = "all"
) => {
  return await apiRequest("POST", "/api/research", {
    userId,
    query,
    jurisdiction,
    practiceArea,
    provider: "anthropic"
  });
};

/**
 * Generate a document using Claude's advanced capabilities
 * @param userId The user ID
 * @param templateId The template ID
 * @param documentTitle The document title
 * @param documentData The form data to fill the template
 */
export const generateDocumentWithClaude = async (
  userId: number,
  templateId: number,
  documentTitle: string,
  documentData: Record<string, any>
) => {
  // Get the template
  const templateResponse = await fetch(`/api/document-templates/${templateId}`);
  if (!templateResponse.ok) {
    throw new Error("Failed to fetch template");
  }
  
  const template = await templateResponse.json();
  
  // Use Claude for enhanced document generation
  return await apiRequest("POST", "/api/documents/enhanced", {
    userId,
    templateId,
    documentTitle,
    templateContent: template.templateContent,
    documentData,
    provider: "anthropic"
  });
};

/**
 * Analyze a legal document with Claude's visual understanding capabilities
 * @param userId The user ID
 * @param documentContent The document content
 * @param documentType The type of document
 */
export const analyzeDocument = async (
  userId: number,
  documentContent: string,
  documentType: string
) => {
  return await apiRequest("POST", "/api/document/analyze", {
    userId,
    documentContent,
    documentType,
    provider: "anthropic"
  });
};