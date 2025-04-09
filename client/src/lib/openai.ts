/**
 * Client-side wrapper for OpenAI API requests
 */

import { apiRequest } from "./queryClient";

/**
 * Send a chat message to the AI assistant
 * @param userId The user ID
 * @param content The message content
 */
export const sendChatMessage = async (userId: number, content: string) => {
  return await apiRequest("POST", "/api/chat/messages", {
    userId,
    role: "user",
    content,
  });
};

/**
 * Analyze a contract for risks and suggestions
 * @param content The contract text
 */
export const analyzeContract = async (content: string) => {
  return await apiRequest("POST", "/api/analyze-contract", { content });
};

/**
 * Perform legal research on a query
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
    practiceArea
  });
};

/**
 * Generate a document from a template
 * @param userId The user ID
 * @param templateId The template ID
 * @param documentTitle The document title
 * @param documentData The form data to fill the template
 */
export const generateDocument = async (
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
  
  // Replace template variables with form data
  let documentContent = template.templateContent;
  
  // Process placeholders with different formats: {{variable}}, [VARIABLE], and [Variable]
  for (const [key, value] of Object.entries(documentData)) {
    // Skip undefined or null values to prevent "undefined" or "null" strings in document
    if (value === undefined || value === null) continue;
    
    // Handle {{variable}} format (common in templates)
    const mustachePlaceholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
    documentContent = documentContent.replace(mustachePlaceholder, value.toString());
    
    // Handle [VARIABLE] format (uppercase)
    const uppercasePlaceholder = new RegExp(`\\[${key.toUpperCase()}\\]`, 'g');
    documentContent = documentContent.replace(uppercasePlaceholder, value.toString());
    
    // Handle [Variable] format (capitalized)
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    const capitalizedPlaceholder = new RegExp(`\\[${capitalizedKey}\\]`, 'g');
    documentContent = documentContent.replace(capitalizedPlaceholder, value.toString());
  }
  
  console.log("Generated document content length:", documentContent.length);
  
  // Save the generated document
  return await apiRequest("POST", "/api/documents", {
    userId,
    templateId,
    documentTitle,
    documentContent,
    documentData,
  });
};
