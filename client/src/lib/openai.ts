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
export type ContractAnalysisResponse = {
  risks: { description: string; severity: string; recommendation: string }[];
  suggestions: { clause: string; improvement: string }[];
  summary: string;
};

export const analyzeContract = async (content: string): Promise<ContractAnalysisResponse> => {
  try {
    // Since we updated apiRequest to handle JSON parsing, we can just call it directly
    return await apiRequest<ContractAnalysisResponse>("POST", "/api/analyze-contract", { content });
  } catch (error) {
    console.error("Error analyzing contract:", error);
    // Return a default response structure rather than throwing an error
    return {
      risks: [],
      suggestions: [],
      summary: "Failed to analyze contract. Please try again or contact support if the issue persists."
    };
  }
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
  
  console.log("Document template ID:", templateId);
  console.log("Field definitions:", template.fields);
  console.log("Form data submitted:", documentData);
  
  // Step 1: Replace all mustache placeholders {{fieldName}}
  // This handles both regular and quoted mustache placeholders
  for (const [fieldName, fieldValue] of Object.entries(documentData)) {
    if (fieldValue === undefined || fieldValue === null || fieldValue === "") continue;
    
    // Handle {{fieldName}} placeholders (standard mustache)
    const mustachePattern = new RegExp(`\\{\\{\\s*${fieldName}\\s*\\}\\}`, 'gi');
    documentContent = documentContent.replace(mustachePattern, fieldValue.toString());
    
    // Handle "{{fieldName}}" placeholders (quoted mustache)
    const quotedMustachePattern = new RegExp(`"\\{\\{\\s*${fieldName}\\s*\\}\\}"`, 'gi');
    documentContent = documentContent.replace(quotedMustachePattern, `"${fieldValue.toString()}"`);
    
    // Also try with single quotes '{{fieldName}}'
    const singleQuotedMustachePattern = new RegExp(`'\\{\\{\\s*${fieldName}\\s*\\}\\}'`, 'gi');
    documentContent = documentContent.replace(singleQuotedMustachePattern, `'${fieldValue.toString()}'`);
    
    console.log(`Step 1: Replaced {{${fieldName}}} with: ${fieldValue}`);
  }
  
  // Step 2: Replace square bracket placeholders [FIELD_NAME]
  for (const [fieldName, fieldValue] of Object.entries(documentData)) {
    if (fieldValue === undefined || fieldValue === null || fieldValue === "") continue;
    
    // Get all placeholder variations for this field
    const placeholders = placeholderMap[fieldName] || [];
    console.log(`Processing field "${fieldName}" with value "${fieldValue}"`);
    console.log(`Potential placeholder variations:`, placeholders);
    
    // Try each placeholder variation with square brackets
    for (const placeholder of placeholders) {
      const bracketPattern = new RegExp(`\\[${placeholder}\\]`, 'g');
      const matches = documentContent.match(bracketPattern);
      
      if (matches && matches.length > 0) {
        console.log(`Found ${matches.length} matches for [${placeholder}]`);
        documentContent = documentContent.replace(bracketPattern, fieldValue.toString());
      }
    }
  }
  
  // Step 3: Handle template-specific patterns
  // This is crucial for templates that might use different placeholder formats
  if (templateId === 101) {
    // Special handling for Indigenous Self-Government Framework Agreement template
    console.log("Applying special handling for template ID 101");
    for (const [fieldName, fieldValue] of Object.entries(documentData)) {
      if (!fieldValue) continue;
      
      // Additional placeholder variations based on field name
      switch (fieldName) {
        case "indigenousName":
          documentContent = documentContent.replace(/{{indigenousName}}/g, fieldValue.toString());
          break;
        case "indigenousShortName":
          // Replace all occurrences in the content
          documentContent = documentContent.replace(/{{indigenousShortName}}/g, fieldValue.toString());
          documentContent = documentContent.replace(/"{{indigenousShortName}}"/g, `"${fieldValue.toString()}"`);
          documentContent = documentContent.replace(/the {{indigenousShortName}}/g, `the ${fieldValue.toString()}`);
          break;
        case "provinceName":
          documentContent = documentContent.replace(/{{provinceName}}/g, fieldValue.toString());
          break;
        case "provincialMinistry":
          documentContent = documentContent.replace(/{{provincialMinistry}}/g, fieldValue.toString());
          break;
        case "workPlanTimeframe":
          documentContent = documentContent.replace(/{{workPlanTimeframe}}/g, fieldValue.toString());
          break;
        case "terminationTimeframe": 
          documentContent = documentContent.replace(/{{terminationTimeframe}}/g, fieldValue.toString());
          break;
        case "withdrawalNotice":
          documentContent = documentContent.replace(/{{withdrawalNotice}}/g, fieldValue.toString());
          break;
      }
    }
  } else if (templateId === 2) {
    // Special handling for Residential Lease Agreement template
    console.log("Applying special handling for template ID 2 (Lease Agreement)");
    
    const leaseSpecificMap: Record<string, string> = {
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
    Object.entries(leaseSpecificMap).forEach(([placeholder, value]) => {
      if (!value) return; // Skip empty values
      
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      documentContent = documentContent.replace(regex, value.toString());
    });
  }
  
  // Step 4: Final generic replacement sweep for any remaining placeholders
  // This ensures we catch any missed placeholders with a more comprehensive approach
  for (const [fieldName, fieldValue] of Object.entries(documentData)) {
    if (!fieldValue) continue;
    
    // Try field name with different case formats
    const variations = [
      fieldName,
      fieldName.toUpperCase(),
      fieldName.toLowerCase(),
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase(),
      fieldName.replace(/([A-Z])/g, ' $1').trim(),
      fieldName.replace(/([A-Z])/g, ' $1').toUpperCase().trim(),
    ];
    
    variations.forEach(variant => {
      // Try with different wrapper formats
      [
        `{{${variant}}}`,
        `{${variant}}`,
        `[${variant}]`,
        `<${variant}>`,
        `"{{${variant}}}"`,
      ].forEach(pattern => {
        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        documentContent = documentContent.replace(regex, fieldValue.toString());
      });
    });
  }
  
  console.log("Generated document content length:", documentContent.length);
  
  // Save the generated document
  try {
    return await apiRequest("POST", "/api/documents", {
      userId,
      templateId,
      documentTitle,
      documentContent,
      documentData,
    });
  } catch (error) {
    console.error("Error saving generated document:", error);
    throw new Error("Failed to save the generated document. Please try again.");
  }
};
