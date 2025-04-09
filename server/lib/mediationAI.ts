import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
// Import asyncHandler to properly handle async Express routes
import { asyncHandler } from '../utils/asyncHandler';

// Initialize the AI services
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Interface for mediator message structure
export interface MediatorMessage {
  role: string;
  content: string;
}

/**
 * Configuration for the AI mediator assistant
 */
export interface MediatorConfig {
  disputeType: string;
  disputeDescription: string;
  parties: string[] | { name: string; role: string }[];
  legalJurisdiction?: string;
  language?: string;
  mediationStyle?: 'facilitative' | 'evaluative' | 'transformative';
  requiresConfidentiality?: boolean;
}

/**
 * Generate system prompt for the AI mediator based on configuration
 */
function generateSystemPrompt(config: MediatorConfig): string {
  const { 
    disputeType, 
    disputeDescription,
    parties,
    legalJurisdiction = 'Canada',
    language = 'English',
    mediationStyle = 'facilitative',
    requiresConfidentiality = true 
  } = config;
  
  // Format parties information
  let partiesText = '';
  if (Array.isArray(parties)) {
    if (typeof parties[0] === 'string') {
      partiesText = (parties as string[]).join(', ');
    } else {
      partiesText = (parties as { name: string; role: string }[])
        .map(p => `${p.name} (${p.role})`)
        .join(', ');
    }
  }
  
  // Mediation style descriptions
  const styleDescriptions = {
    facilitative: 'You help the parties communicate effectively and find their own solutions, without imposing your own judgment or opinions.',
    evaluative: 'You provide expert assessment and guidance, helping parties understand strengths and weaknesses of their positions based on legal principles.',
    transformative: 'You focus on empowerment and recognition, helping parties grow through the conflict resolution process.'
  };

  return `
You are an expert AI Mediator specifically designed to facilitate dispute resolution in ${legalJurisdiction}. 
Your primary role is to help parties reach a mutually acceptable resolution to their conflict through guided facilitation and legal expertise.

## DISPUTE INFORMATION
- Type of Dispute: ${disputeType}
- Description: ${disputeDescription}
- Involved Parties: ${partiesText}
- Legal Jurisdiction: ${legalJurisdiction}
- Language: ${language}
- Confidentiality Required: ${requiresConfidentiality ? 'Yes' : 'No'}

## MEDIATION STYLE
You are using a ${mediationStyle} mediation approach. ${styleDescriptions[mediationStyle]}

## CORE RESPONSIBILITIES
1. Remain neutral and unbiased at all times
2. Facilitate constructive dialogue between parties
3. Help parties identify interests beneath their positions
4. Guide parties toward exploring potential solutions
5. Provide relevant legal context without giving specific legal advice
6. Maintain a respectful, professional environment
7. Document agreements and summarize progress

## LEGAL CONTEXT
- Apply general principles from ${legalJurisdiction} law without giving specific legal advice
- Help parties understand the importance of getting independent legal counsel for specific legal questions
- Inform parties when their proposed solutions might fall outside legal norms in ${legalJurisdiction}

## COMMUNICATION GUIDELINES
- Use clear, plain language, avoiding legal jargon when possible
- Acknowledge and validate each party's perspective
- Redirect unconstructive or disrespectful communication
- Ask clarifying questions to ensure understanding
- Summarize progress and agreements periodically
- Focus on interests, not positions
- Redirect the conversation when it becomes unproductive

## CONFIDENTIALITY
${requiresConfidentiality ? 'This mediation is confidential. Remind parties not to share sensitive information outside the mediation process.' : 'Standard confidentiality principles apply to this mediation.'}

Begin by introducing yourself as the AI Mediator, briefly explaining the mediation process, and inviting the parties to share their perspectives on the dispute.
`;
}

/**
 * Generate initial welcome message from AI mediator
 */
export async function generateWelcomeMessage(config: MediatorConfig): Promise<string> {
  try {
    const systemPrompt = generateSystemPrompt(config);
    const prompt = `Introduce yourself as an AI Mediator. Provide a brief welcome message explaining the mediation process for this ${config.disputeType} dispute. Keep it concise (max 150 words), professional, and encouraging. Explain that you're here to facilitate communication between the parties and help them reach a resolution. End with an invitation for the first party to share their perspective on the situation.`;
    
    // Try with Anthropic first
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const message = await anthropic.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
        });
        
        return message.content[0].text;
      } catch (error) {
        console.error('Anthropic API error:', error);
        // Fall back to OpenAI if Anthropic fails
      }
    }
    
    // Fall back to OpenAI
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
      });
      
      return response.choices[0].message.content || '';
    }
    
    // Fallback if both APIs fail
    return `Hello, I'm your AI Mediator for this ${config.disputeType} dispute. I'm here to help facilitate a productive discussion between all parties involved. I'll remain neutral throughout this process and help guide you toward finding a resolution that works for everyone. Let's begin by having each party share their perspective on the situation. Who would like to start?`;
    
  } catch (error) {
    console.error('Error generating welcome message:', error);
    return `Hello, I'm your AI Mediator for this ${config.disputeType} dispute. I'll help facilitate this mediation process. Who would like to start by sharing their perspective?`;
  }
}

/**
 * Generate AI mediator response for the ongoing mediation
 */
export async function generateMediatorResponse(
  config: MediatorConfig,
  conversationHistory: MediatorMessage[],
  includeAnalysis: boolean = false
): Promise<{response: string, analysis?: any}> {
  try {
    const systemPrompt = generateSystemPrompt(config);
    
    // Try with Anthropic first
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        // Map conversation history to Anthropic format
        const messages = conversationHistory.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : msg.role,
          content: msg.content
        }));
        
        const message = await anthropic.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 1000,
          system: systemPrompt,
          messages,
        });
        
        let analysis = undefined;
        if (includeAnalysis) {
          // Generate analysis in a separate call
          const analysisResponse = await anthropic.messages.create({
            model: 'claude-3-7-sonnet-20250219',
            max_tokens: 1000,
            system: `You are analyzing a mediation conversation to identify key issues, interests, and potential solutions. Provide your analysis in JSON format with the following structure: 
            {
              "keyIssues": ["issue1", "issue2", ...],
              "underlyingInterests": { "party1": ["interest1", "interest2"], "party2": ["interest1", "interest2"] },
              "potentialSolutions": ["solution1", "solution2", ...],
              "mediationProgress": "early|middle|advanced",
              "nextSteps": ["step1", "step2", ...]
            }`,
            messages: [
              { 
                role: 'user', 
                content: `Analyze this mediation conversation and provide structured insights:
                
                DISPUTE TYPE: ${config.disputeType}
                DISPUTE DESCRIPTION: ${config.disputeDescription}
                
                CONVERSATION:
                ${conversationHistory.map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`).join('\n\n')}
                
                Provide your analysis in the specified JSON format.`
              }
            ],
          });
          
          try {
            analysis = JSON.parse(analysisResponse.content[0].text);
          } catch (err) {
            console.error('Error parsing analysis JSON:', err);
          }
        }
        
        return { 
          response: message.content[0].text,
          analysis
        };
      } catch (error) {
        console.error('Anthropic API error:', error);
        // Fall back to OpenAI if Anthropic fails
      }
    }
    
    // Fall back to OpenAI
    if (process.env.OPENAI_API_KEY) {
      // Map conversation history to OpenAI format
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : msg.role,
          content: msg.content
        }))
      ];
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: 1000,
      });
      
      let analysis = undefined;
      if (includeAnalysis) {
        // Generate analysis in a separate call
        const analysisResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { 
              role: 'system', 
              content: `You are analyzing a mediation conversation to identify key issues, interests, and potential solutions. Provide your analysis in JSON format.` 
            },
            { 
              role: 'user', 
              content: `Analyze this mediation conversation and provide structured insights:
              
              DISPUTE TYPE: ${config.disputeType}
              DISPUTE DESCRIPTION: ${config.disputeDescription}
              
              CONVERSATION:
              ${conversationHistory.map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`).join('\n\n')}
              
              Provide your analysis as JSON with these keys: keyIssues, underlyingInterests, potentialSolutions, mediationProgress, nextSteps`
            }
          ],
          max_tokens: 1000,
          response_format: { type: "json_object" }
        });
        
        try {
          analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}');
        } catch (err) {
          console.error('Error parsing analysis JSON:', err);
        }
      }
      
      return { 
        response: response.choices[0].message.content || '',
        analysis
      };
    }
    
    // Fallback if both APIs fail
    return { 
      response: "I understand the points you've raised. Let's try to identify some common ground and potential solutions that could work for both parties. Could you share what you believe would be a fair resolution to this dispute?",
      analysis: includeAnalysis ? {
        keyIssues: ["Communication breakdown", "Disagreement on terms"],
        underlyingInterests: {},
        potentialSolutions: ["Further discussion", "Written agreement"],
        mediationProgress: "early",
        nextSteps: ["Clarify positions", "Identify shared interests"]
      } : undefined
    };
    
  } catch (error) {
    console.error('Error generating mediator response:', error);
    return { 
      response: "Thank you for sharing. Let's continue exploring possible solutions. What specific outcomes would you like to see from this mediation process?",
      analysis: includeAnalysis ? {
        keyIssues: ["Technical difficulties"],
        underlyingInterests: {},
        potentialSolutions: [],
        mediationProgress: "early",
        nextSteps: ["Restart conversation"]
      } : undefined
    };
  }
}

/**
 * Generate a summary of the mediation session
 */
export async function generateMediationSummary(
  config: MediatorConfig,
  conversationHistory: MediatorMessage[]
): Promise<{summary: string, recommendations: string[]}> {
  try {
    const prompt = `
Review the following mediation conversation and provide:
1. A concise summary (300-500 words) of the key points discussed, progress made, and any agreements reached
2. A list of 3-5 specific recommendations for next steps

DISPUTE TYPE: ${config.disputeType}
DISPUTE DESCRIPTION: ${config.disputeDescription}

CONVERSATION:
${conversationHistory.map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`).join('\n\n')}

Format your response as JSON with two keys:
- "summary": Your concise summary of the mediation
- "recommendations": An array of specific recommendation strings
`;

    // Try with Anthropic first
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const message = await anthropic.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        });
        
        try {
          // Try to parse as JSON
          const result = JSON.parse(message.content[0].text);
          return {
            summary: result.summary || '',
            recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
          };
        } catch (err) {
          // If JSON parsing fails, extract content manually
          const content = message.content[0].text;
          const summaryMatch = content.match(/summary["']?:\s*["']?(.*?)["']?,\s*["']?recommendations/s);
          const recommendationsMatch = content.match(/recommendations["']?:\s*\[(.*?)\]/s);
          
          return {
            summary: summaryMatch?.[1]?.trim() || content.slice(0, 500),
            recommendations: recommendationsMatch?.[1]
              ?.split(',')
              .map(r => r.trim().replace(/^["']|["']$/g, ''))
              .filter(Boolean) || []
          };
        }
      } catch (error) {
        console.error('Anthropic API error:', error);
        // Fall back to OpenAI if Anthropic fails
      }
    }
    
    // Fall back to OpenAI
    if (process.env.OPENAI_API_KEY) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });
      
      try {
        const result = JSON.parse(response.choices[0].message.content || '{}');
        return {
          summary: result.summary || '',
          recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
        };
      } catch (err) {
        return {
          summary: response.choices[0].message.content?.slice(0, 500) || '',
          recommendations: []
        };
      }
    }
    
    // Fallback if both APIs fail
    return { 
      summary: `This mediation session addressed a ${config.disputeType} dispute. The parties discussed their perspectives and explored potential solutions, though more discussion may be needed to reach a final resolution.`,
      recommendations: [
        "Schedule a follow-up session to continue the discussion",
        "Each party should prepare specific proposals for resolution",
        "Consider consulting with relevant experts regarding technical aspects of the dispute"
      ]
    };
    
  } catch (error) {
    console.error('Error generating mediation summary:', error);
    return { 
      summary: `A mediation session was conducted regarding a ${config.disputeType} dispute. Further discussion is recommended.`,
      recommendations: ["Continue mediation in a follow-up session"]
    };
  }
}

// Express middleware handlers
export const mediationHandlers = {
  generateInitialMessage: asyncHandler(async (req, res) => {
    const config: MediatorConfig = req.body;
    
    if (!config.disputeType || !config.disputeDescription) {
      return res.status(400).json({ message: "Missing required configuration parameters" });
    }
    
    const welcomeMessage = await generateWelcomeMessage(config);
    res.json({ message: welcomeMessage });
  }),
  
  generateResponse: asyncHandler(async (req, res) => {
    const { config, conversationHistory, includeAnalysis } = req.body;
    
    if (!config || !conversationHistory || !Array.isArray(conversationHistory)) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }
    
    const result = await generateMediatorResponse(config, conversationHistory, includeAnalysis);
    res.json(result);
  }),
  
  generateSummary: asyncHandler(async (req, res) => {
    const { config, conversationHistory } = req.body;
    
    if (!config || !conversationHistory || !Array.isArray(conversationHistory)) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }
    
    const result = await generateMediationSummary(config, conversationHistory);
    res.json(result);
  })
};