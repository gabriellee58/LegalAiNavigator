import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a response from Claude
 * @param prompt The prompt for Claude
 * @param system Optional system message
 */
export async function generateClaudeResponse(prompt: string, system?: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: system || "You are a legal assistant AI specialized in Canadian law. Provide accurate, helpful legal information while clearly stating that your responses are not legal advice and users should consult with a qualified legal professional for advice specific to their situation.",
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    // Handle the content correctly
    if (message.content[0].type === 'text') {
      return message.content[0].text;
    } else {
      // In case the content is not of type 'text'
      return 'Unable to generate a text response';
    }
  } catch (error) {
    console.error('Error generating Claude response:', error);
    throw new Error('Failed to generate response from Claude');
  }
}

/**
 * Analyze legal documents with Claude
 * @param document The document text
 * @param documentType The type of document
 * @param jurisdiction The jurisdiction
 */
export async function analyzeLegalDocument(document: string, documentType: string, jurisdiction?: string): Promise<{ content: string }> {
  try {
    const prompt = `Please analyze the following ${documentType} document according to ${jurisdiction || 'Canadian'} law:\n\n${document}`;

    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: "You are a legal document analysis assistant with expertise in Canadian law. Analyze the document thoroughly and provide detailed insights.",
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Handle the content correctly
    if (message.content[0].type === 'text') {
      return { content: message.content[0].text };
    } else {
      return { content: 'Unable to generate a text response' };
    }
  } catch (error) {
    console.error('Error analyzing document with Claude:', error);
    throw new Error('Failed to analyze document with Claude');
  }
}

/**
 * Generate enhanced legal documents with Claude
 * @param templateContent The document template
 * @param documentData The data to fill the template
 * @param documentType The type of document
 * @param jurisdiction The jurisdiction
 */
export async function generateEnhancedDocument(
  templateContent: string,
  documentData: Record<string, any>,
  documentType: string,
  jurisdiction?: string
): Promise<{ content: string }> {
  try {
    // Replace template variables with form data
    let filledTemplate = templateContent;
    
    for (const [key, value] of Object.entries(documentData)) {
      const placeholder = new RegExp(`\\[${key.toUpperCase()}\\]`, 'g');
      filledTemplate = filledTemplate.replace(placeholder, value.toString());
    }

    // Ask Claude to enhance the document
    const instructions = `Create an enhanced legal document of type ${documentType}${jurisdiction ? ` for the jurisdiction of ${jurisdiction}` : ''}.`;
    const prompt = `${instructions}\n\nHere is the template document with basic information filled in:\n\n${filledTemplate}\n\nPlease enhance this document to be more comprehensive and legally sound while maintaining all the provided information.`;

    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: "You are a legal document drafting assistant with expertise in Canadian law. Your task is to enhance legal documents while preserving the essential information and intent.",
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Handle the content correctly
    if (message.content[0].type === 'text') {
      return { content: message.content[0].text };
    } else {
      return { content: 'Unable to generate a text response' };
    }
  } catch (error) {
    console.error('Error generating enhanced document with Claude:', error);
    throw new Error('Failed to generate enhanced document with Claude');
  }
}

/**
 * Perform legal research with Claude
 * @param query The research query
 * @param jurisdiction The jurisdiction
 * @param practiceArea The practice area
 */
export async function performLegalResearch(
  query: string,
  jurisdiction: string = 'canada',
  practiceArea: string = 'all'
): Promise<{ content: string }> {
  try {
    const prompt = `Perform legal research on the following query:\n\nQuery: ${query}\nJurisdiction: ${jurisdiction}\nPractice Area: ${practiceArea}\n\nPlease provide a comprehensive, well-structured research report with relevant case law, statutes, regulations, and legal analysis. Include citations in proper legal format and organize the information in a way that would be useful for a legal professional.`;

    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: "You are a legal research assistant specializing in Canadian law. Provide thorough, well-organized research with proper citations. Format your response as a professional legal research memo with clearly delineated sections.",
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Handle the content correctly
    if (message.content[0].type === 'text') {
      return { content: message.content[0].text };
    } else {
      return { content: 'Unable to generate a text response' };
    }
  } catch (error) {
    console.error('Error performing legal research with Claude:', error);
    throw new Error('Failed to perform legal research with Claude');
  }
}