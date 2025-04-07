/**
 * Service for integrating with external legal template sources and repositories
 */
import { storage } from '../storage';
import { InsertDocumentTemplate } from '@shared/schema';
import Anthropic from '@anthropic-ai/sdk';

// Import OpenAI as a fallback
import OpenAI from "openai";

// Initialize both AI services
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Template source definitions - future expansion would include API integration with actual template repositories
export interface TemplateSource {
  id: string;
  name: string;
  description: string;
  url?: string;
  categories: string[];
  jurisdictions: string[];
  fetchTemplates: (category?: string, jurisdiction?: string) => Promise<DocumentTemplatePreview[]>;
}

export interface DocumentTemplatePreview {
  id: string;
  title: string;
  description: string;
  category: string;
  jurisdiction: string;
  language: string;
  source: string;
  sourceUrl?: string;
}

// Canadian template sources
export const templateSources: TemplateSource[] = [
  {
    id: 'canada-legal',
    name: 'Canadian Legal Templates',
    description: 'Standard legal templates for Canadian jurisdictions',
    categories: [
      // Original categories
      'contract', 'lease', 'will', 'business', 'employment', 'ip', 'family',
      // New main categories from the requirements
      'family-law', 'immigration-law', 'employment-law', 'real-estate-law', 
      'criminal-law', 'tax-law', 'environmental-law', 'health-law',
      'privacy-data-law', 'indigenous-law', 'consumer-protection', 'estate-planning', 'municipal-law'
    ],
    jurisdictions: ['Canada', 'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 
                    'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland', 'PEI', 
                    'Yukon', 'Northwest Territories', 'Nunavut'],
    fetchTemplates: async (category?: string, jurisdiction?: string) => {
      // In a future implementation, this would fetch from an actual API
      // For now, we'll return a set of template previews based on our hardcoded options
      return getStaticTemplateList(category, jurisdiction);
    }
  },
  {
    id: 'commonform',
    name: 'Common Form',
    description: 'Open source document clauses and forms (would require actual API integration)',
    url: 'https://commonform.org',
    categories: ['contract', 'business', 'ip', 'confidentiality'],
    jurisdictions: ['General', 'US', 'International'],
    fetchTemplates: async (category?: string) => {
      // This would need to be implemented with actual Common Form API
      // For now we'll return a placeholder set
      return getCommonFormPlaceholders(category);
    }
  }
];

/**
 * Get a static list of template previews based on filters
 */
function getStaticTemplateList(category?: string, jurisdiction?: string): DocumentTemplatePreview[] {
  const templates: DocumentTemplatePreview[] = [
    // Original templates
    {
      id: 'ca-contract-nda',
      title: 'Non-Disclosure Agreement',
      description: 'Standard confidentiality agreement for protecting business information',
      category: 'contract',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    {
      id: 'ca-contract-consulting',
      title: 'Consulting Agreement',
      description: 'Agreement for independent contractor consulting services',
      category: 'contract',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    {
      id: 'ca-employment-offer',
      title: 'Employment Offer Letter',
      description: 'Standard employment offer with terms and conditions',
      category: 'employment',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    {
      id: 'ca-business-incorporation',
      title: 'Articles of Incorporation',
      description: 'Basic articles of incorporation for Canadian business',
      category: 'business',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    {
      id: 'ca-ip-assignment',
      title: 'Intellectual Property Assignment',
      description: 'Agreement for transferring IP rights between parties',
      category: 'ip',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    {
      id: 'ca-lease-commercial',
      title: 'Commercial Lease Agreement',
      description: 'Lease agreement for commercial property',
      category: 'lease',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    
    // Family Law templates
    {
      id: 'ca-family-law-divorce-separation',
      title: 'Divorce Separation Agreement',
      description: 'Legally binding agreement for divorce and separation proceedings',
      category: 'family-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    {
      id: 'ca-family-law-child-custody',
      title: 'Child Custody Agreement',
      description: 'Legal agreement establishing child custody and visitation rights',
      category: 'family-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    {
      id: 'ca-family-law-adoption',
      title: 'Adoption Application',
      description: 'Documentation for Canadian adoption proceedings',
      category: 'family-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    
    // Immigration Law Templates
    {
      id: 'ca-immigration-law-work-permit',
      title: 'Work Permit Application',
      description: 'Documentation for Canadian work permit application',
      category: 'immigration-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    {
      id: 'ca-immigration-law-refugee-claim',
      title: 'Refugee Claim Documentation',
      description: 'Forms for initiating refugee protection claims in Canada',
      category: 'immigration-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    
    // Employment Law Templates
    {
      id: 'ca-employment-law-termination',
      title: 'Employment Termination Package',
      description: 'Complete documentation for proper employee termination',
      category: 'employment-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    {
      id: 'ca-employment-law-discrimination',
      title: 'Workplace Discrimination Complaint',
      description: 'Human rights tribunal form for discrimination complaints',
      category: 'employment-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    
    // Real Estate Law Templates
    {
      id: 'ca-real-estate-law-purchase',
      title: 'Real Estate Purchase Agreement',
      description: 'Standard contract for residential property purchase',
      category: 'real-estate-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    {
      id: 'ca-real-estate-law-tenancy',
      title: 'Residential Tenancy Agreement',
      description: 'Standardized lease compliant with provincial regulations',
      category: 'real-estate-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    
    // Criminal Law Templates
    {
      id: 'ca-criminal-law-rights',
      title: 'Legal Rights Explainer',
      description: 'Plain language explanation of legal rights in criminal proceedings',
      category: 'criminal-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    
    // Tax Law Templates
    {
      id: 'ca-tax-law-cra-objection',
      title: 'CRA Notice of Objection',
      description: 'Template for filing a formal objection to tax assessment',
      category: 'tax-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    
    // Environmental Law Templates
    {
      id: 'ca-environmental-law-permit',
      title: 'Environmental Compliance Approval',
      description: 'Application for environmental activity approval',
      category: 'environmental-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    
    // Health Law Templates
    {
      id: 'ca-health-law-consent',
      title: 'Medical Consent Form',
      description: 'Standard consent form for medical procedures',
      category: 'health-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    
    // Additional Categories
    {
      id: 'ca-privacy-data-law-compliance',
      title: 'PIPEDA Compliance Checklist',
      description: 'Assessment tool for privacy law compliance',
      category: 'privacy-data-law',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    },
    {
      id: 'ca-estate-planning-will',
      title: 'Last Will and Testament',
      description: 'Comprehensive will template for estate planning',
      category: 'estate-planning',
      jurisdiction: 'Canada',
      language: 'en',
      source: 'canada-legal'
    }
  ];
  
  return templates.filter(t => 
    (!category || t.category === category) && 
    (!jurisdiction || t.jurisdiction === jurisdiction)
  );
}

/**
 * Placeholder list for what would be retrieved from Common Form
 */
function getCommonFormPlaceholders(category?: string): DocumentTemplatePreview[] {
  const templates: DocumentTemplatePreview[] = [
    {
      id: 'cf-confidentiality',
      title: 'Confidentiality Clause',
      description: 'Standard confidentiality clause for various agreements',
      category: 'confidentiality',
      jurisdiction: 'General',
      language: 'en',
      source: 'commonform',
      sourceUrl: 'https://commonform.org/'
    },
    {
      id: 'cf-intellectual-property',
      title: 'Intellectual Property Clause',
      description: 'Standard IP ownership and rights clause',
      category: 'ip',
      jurisdiction: 'General',
      language: 'en',
      source: 'commonform',
      sourceUrl: 'https://commonform.org/'
    },
    {
      id: 'cf-payment-terms',
      title: 'Payment Terms',
      description: 'Standard payment terms and conditions',
      category: 'contract',
      jurisdiction: 'General',
      language: 'en',
      source: 'commonform',
      sourceUrl: 'https://commonform.org/'
    }
  ];
  
  return templates.filter(t => !category || t.category === category);
}

/**
 * Fetch a template from an external source by ID and add it to the local database
 * @param templateId External template ID
 * @param language Language for the template ('en' or 'fr') 
 * @returns The imported template
 */
export async function importExternalTemplate(templateId: string, language: string = 'en'): Promise<InsertDocumentTemplate | null> {
  try {
    // In a production system, this would make an actual API call to the template source
    // For now, we'll generate the template using AI based on the ID
    
    // Validate template ID format and parse it
    if (!templateId.includes('-')) {
      console.error("Invalid template ID format:", templateId);
      throw new Error("Invalid template ID format. Expected format: 'source-category-name'");
    }
    
    // Parse template ID to get information
    const parts = templateId.split('-');
    if (parts.length < 2) {
      console.error("Invalid template ID format:", templateId);
      throw new Error("Template ID must have at least a source and category (e.g., 'canada-legal')");
    }
    
    const sourceCode = parts[0];
    const category = parts[1];
    
    // Check if we have a subcategory (e.g., family-law-divorce where 'divorce' is the subcategory)
    let subcategory = null;
    let templateName;
    
    if (parts.length >= 4) {
      // Format is source-category-subcategory-name
      subcategory = parts[2];
      templateName = parts.slice(3).join('-');
    } else if (parts.length === 3) {
      // Format is source-category-name (no subcategory)
      templateName = parts[2];
    } else {
      // Just source-category
      templateName = 'template';
    }
    
    // Find source
    const source = templateSources.find(s => s.id.startsWith(sourceCode));
    if (!source) {
      console.error("Template source not found for code:", sourceCode);
      throw new Error(`Unknown template source: '${sourceCode}'. Valid sources include: ${templateSources.map(s => s.id).join(', ')}`);
    }
    
    // Generate a template based on the ID
    console.log(`Attempting to generate template with ID: ${templateId}, category: ${category}, subcategory: ${subcategory}, language: ${language}`);
    const templateContent = await generateTemplateFromId(templateId, category, language, subcategory);
    if (!templateContent) {
      console.error("Failed to generate template content");
      return null;
    }
    console.log("Successfully generated template content");
    
    // Create a title from the template name, handle special characters
    const title = templateName
      .split(/[_-]/)  // Split by underscore or dash
      .filter(word => word.length > 0)  // Filter out empty strings
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') || `${category.charAt(0).toUpperCase() + category.slice(1)} Template`;
    
    // Create fields based on the template content
    const fields = extractFieldsFromTemplate(templateContent);
    
    // Create a description with subcategory if available
    let description = `Imported ${category} template`;
    if (subcategory) {
      description = `Imported ${category} template for ${subcategory}`;
    }
    description += ` from ${source.name}`;
    
    // Create the template with subcategory if available
    const template: InsertDocumentTemplate = {
      templateType: category,
      subcategory: subcategory || undefined,
      title,
      description,
      language,
      templateContent,
      fields,
      jurisdiction: 'Canada', // Default jurisdiction
    };
    
    return template;
  } catch (error) {
    console.error("Error importing external template:", error);
    return null;
  }
}

/**
 * Generate a template document content based on its ID and category
 * @param templateId The external template ID
 * @param category The document category
 * @param language The language code
 * @param subcategory Optional subcategory for more specific templates
 * @returns Template content string
 */
async function generateTemplateFromId(templateId: string, category: string, language: string, subcategory?: string | null): Promise<string | null> {
  try {
    // First try with Anthropic Claude
    try {
      // Prepare the system prompt based on category and subcategory
      let systemPrompt = `You are a legal document template generator for the Canadian legal system.
        Generate a detailed, professional ${category} template`;
      
      if (subcategory) {
        systemPrompt += ` specifically for ${subcategory}`;
      }
      
      systemPrompt += ` in ${language === 'en' ? 'English' : 'French'}.
        The document should follow Canadian legal conventions and include all standard sections.
        Use [PLACEHOLDER] format for fields that would need to be filled in (like [CLIENT_NAME], [DATE], etc.).
        Make sure the document is comprehensive and covers all important legal aspects.`;
      
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 2500,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Generate a complete legal template for: ${templateId.replace(/-/g, ' ')}`
          }
        ]
      });
      
      // Type guard to ensure we're getting text content
      console.log("Anthropic response received");
      if (!response.content || response.content.length === 0) {
        console.error("Anthropic response has no content");
        return "Template generation failed: No content in response";
      }
      
      const content = response.content[0];
      console.log("Content type:", content?.type);
      
      if (content && 'type' in content && content.type === 'text' && 'text' in content) {
        console.log("Successfully extracted text from Anthropic response");
        return content.text;
      }
      
      console.error("Failed to extract text from Anthropic response:", JSON.stringify(content, null, 2));
      return "Template generation failed: Invalid content format";
    } catch (anthropicError) {
      // If Anthropic fails, try OpenAI as fallback
      console.log("Anthropic failed, trying OpenAI fallback:", anthropicError);
      
      // Prepare the system prompt for OpenAI fallback
      let systemPrompt = `You are a legal document template generator for the Canadian legal system.
        Generate a detailed, professional ${category} template`;
      
      if (subcategory) {
        systemPrompt += ` specifically for ${subcategory}`;
      }
      
      systemPrompt += ` in ${language === 'en' ? 'English' : 'French'}.
        The document should follow Canadian legal conventions and include all standard sections.
        Use [PLACEHOLDER] format for fields that would need to be filled in (like [CLIENT_NAME], [DATE], etc.).
        Make sure the document is comprehensive and covers all important legal aspects.`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Generate a complete legal template for: ${templateId.replace(/-/g, ' ')}`
          }
        ],
        max_tokens: 2500
      });
      
      return response.choices[0].message.content;
    }
  } catch (error) {
    console.error("Error generating template with both AI services:", error);
    return null;
  }
}

/**
 * Extract form fields from a template by finding placeholders
 * @param templateContent The template text with placeholders
 * @returns Array of field objects
 */
function extractFieldsFromTemplate(templateContent: string): any[] {
  const placeholderRegex = /\[([A-Z_]+)\]/g;
  const fields: Record<string, any> = {};
  
  let match;
  while ((match = placeholderRegex.exec(templateContent)) !== null) {
    const placeholder = match[1];
    const fieldName = placeholder.toLowerCase();
    
    // Skip if we've already added this field
    if (fields[fieldName]) continue;
    
    // Determine field type based on name
    let fieldType = 'text';
    if (fieldName.includes('date')) fieldType = 'date';
    else if (fieldName.includes('amount') || fieldName.includes('payment')) fieldType = 'number';
    else if (fieldName.includes('description') || fieldName.includes('clause')) fieldType = 'textarea';
    
    fields[fieldName] = {
      name: fieldName,
      label: placeholder.split('_').map(word => 
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' '),
      type: fieldType,
      required: true
    };
  }
  
  return Object.values(fields);
}

/**
 * Import a template from an external source and save it to the database
 * @param templateId External template ID
 * @param language Language for the template
 * @returns The saved template or null if import failed
 */
export async function importAndSaveTemplate(templateId: string, language: string = 'en') {
  try {
    // Validate template ID format first
    if (!templateId.includes('-')) {
      console.error("Invalid template ID format:", templateId);
      throw new Error("Invalid template ID format. Expected format: 'source-category-name'");
    }
    
    const template = await importExternalTemplate(templateId, language);
    if (!template) {
      throw new Error("Failed to generate template content. Please check your AI service API keys and try again.");
    }
    
    // Save to database
    const savedTemplate = await storage.createDocumentTemplate(template);
    return savedTemplate;
  } catch (error: any) {
    console.error("Error importing and saving template:", error);
    // Re-throw the error so it can be properly handled by the route handler
    throw error;
  }
}