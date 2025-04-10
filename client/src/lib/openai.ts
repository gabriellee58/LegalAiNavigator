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
  
  // Create a mapping table between field names and their placeholder equivalents
  const placeholderMap: Record<string, string[]> = {};
  
  // Get field info from template schema
  const templateFields = template.fields as Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
  }>;
  
  // For each field, create all possible placeholder variations
  templateFields.forEach(field => {
    const key = field.name;
    
    // Create placeholder variations for this field
    placeholderMap[key] = [
      // [FIELD NAME] (uppercase)
      key.toUpperCase(),
      // [Field Name] (capitalized)
      key.charAt(0).toUpperCase() + key.slice(1),
      // [FIELD NAME WITH SPACES] (for camelCase fields)
      key.replace(/([A-Z])/g, ' $1').toUpperCase().trim(),
      // Field label exactly as defined
      field.label,
      // Field label uppercase
      field.label.toUpperCase()
    ];
  });
  
  // Get the document content
  let documentContent = template.templateContent;
  
  console.log("Placeholder map:", placeholderMap);
  console.log("Form data:", documentData);
  
  // For each field in the submitted form data
  Object.entries(documentData).forEach(([fieldName, fieldValue]) => {
    // Skip empty values
    if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
      return;
    }
    
    // Get placeholder variations for this field
    const placeholders = placeholderMap[fieldName] || [];
    
    // Log the field we're processing
    console.log(`Processing field: ${fieldName}, value: ${fieldValue}`);
    console.log(`Potential placeholders:`, placeholders);
    
    // Try each placeholder variation
    placeholders.forEach(placeholder => {
      // Create regex that looks for [PLACEHOLDER] in the template
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      
      // Check if this placeholder exists in the template
      const matches = documentContent.match(regex);
      if (matches) {
        console.log(`Found matches for [${placeholder}]:`, matches.length);
        
        // Replace all instances of this placeholder with the field value
        documentContent = documentContent.replace(regex, fieldValue.toString());
      }
    });
    
    // Also try {{fieldName}} format (mustache templates)
    const mustachePlaceholder = new RegExp(`\\{\\{\\s*${fieldName}\\s*\\}\\}`, 'gi');
    documentContent = documentContent.replace(mustachePlaceholder, fieldValue.toString());
  });
  
  // Manually handle specific placeholders based on the template content inspection
  // This ensures we catch any that might have been missed
  const directPlaceholderMap: Record<string, string> = {
    "DATE": documentData.date,
    "LANDLORD NAME": documentData.landlordName,
    "LANDLORD ADDRESS": documentData.landlordAddress,
    "TENANT NAME": documentData.tenantName, 
    "TENANT ADDRESS": documentData.tenantAddress,
    "PROPERTY ADDRESS": documentData.propertyAddress,
    "START DATE": documentData.startDate,
    "END DATE": documentData.endDate,
    "RENT AMOUNT": documentData.rentAmount,
    "DUE DAY": documentData.dueDay,
    "SECURITY DEPOSIT AMOUNT": documentData.securityDepositAmount,
    "UTILITIES": documentData.utilities,
    "LANDLORD UTILITIES": documentData.landlordUtilities,
    "PROVINCE": documentData.province
  };
  
  // Apply the direct placeholder replacements
  Object.entries(directPlaceholderMap).forEach(([placeholder, value]) => {
    if (!value) return; // Skip empty values
    
    const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
    documentContent = documentContent.replace(regex, value.toString());
  });
  
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
