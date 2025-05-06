/**
 * Mock Document Service for Development
 * This module provides mock document generation functionality to bypass authentication requirements
 * to make document generation work in development without requiring API authentication.
 */

// Generate a unique mock document ID
let mockDocumentId = 1;

/**
 * Generate a mock document without requiring API authentication
 * @param templateContent The template content to use for document generation
 * @param fieldData The form field data to insert into the template
 * @returns The generated document content
 */
export async function generateMockDocument(
  templateContent: string,
  fieldData: Record<string, any>
): Promise<string> {
  console.log("Using mock document generation service (bypassing authentication)");
  
  let documentContent = templateContent;
  
  // Replace template variables with form field values
  for (const [fieldName, fieldValue] of Object.entries(fieldData)) {
    if (fieldValue === undefined || fieldValue === null) {
      continue;
    }
    
    // Generate different variations of the field name to match potential template formats
    const variations = [
      fieldName,
      fieldName.toLowerCase(),
      fieldName.toUpperCase(),
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
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log("Mock document generation complete");
  return documentContent;
}

/**
 * Mock saving a document (will bypass actual API call)
 * @returns A mock document response object
 */
export async function mockSaveDocument(
  documentContent: string,
  templateId: number
): Promise<any> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return a mock document object that mimics the API response
  return {
    id: mockDocumentId++,
    templateId,
    documentContent,
    createdAt: new Date(),
    success: true
  };
}