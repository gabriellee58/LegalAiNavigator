import OpenAI from "openai";
import { Dispute, MediationMessage } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

/**
 * Generate an AI-powered mediator response for a dispute resolution session
 * 
 * @param dispute The dispute details
 * @param messages Previous messages in the conversation
 * @param lastUserMessage The most recent user message to respond to
 * @returns AI generated mediator response
 */
export async function generateMediatorResponse(
  dispute: Dispute,
  messages: MediationMessage[],
  lastUserMessage: MediationMessage
): Promise<string> {
  try {
    // Format the conversation history for OpenAI
    const formattedMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content: `You are a professional mediator specializing in resolving ${dispute.disputeType} disputes in Canada. 
Your goal is to facilitate a fair, constructive dialogue and help parties reach an amicable resolution.
Apply these mediation principles:
1. Remain neutral and impartial at all times
2. Focus on interests rather than positions
3. Identify common ground and shared interests
4. Summarize and reframe issues constructively
5. Ask clarifying questions when helpful
6. Keep the discussion respectful and productive
7. Provide information about Canadian legal context when relevant
8. Guide parties toward practical, fair solutions

Dispute context: ${dispute.title}
Description: ${dispute.description}
Parties involved: ${dispute.parties}`
      }
    ];

    // Add previous messages to provide conversation context (limit to last 10)
    const relevantMessages = messages.slice(-10);
    
    relevantMessages.forEach(msg => {
      let openAIRole: "user" | "assistant" = "user";
      if (msg.role === "mediator" || msg.role === "ai") {
        openAIRole = "assistant";
      }
      
      formattedMessages.push({
        role: openAIRole,
        content: msg.content
      });
    });

    // Make the OpenAI API call
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 800,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time.";
  } catch (error: any) {
    console.error("Error generating AI mediator response:", error.message);
    return "I apologize, but I encountered an issue while processing your message. Let's continue our discussion.";
  }
}

/**
 * Analyze sentiment of a message in a mediation context
 * 
 * @param message The message content to analyze
 * @returns Sentiment analysis results
 */
export async function analyzeSentiment(message: string): Promise<{
  sentiment: "positive" | "neutral" | "negative";
  intensity: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system" as const,
          content: "You are a sentiment analysis expert. Analyze the sentiment of the text in a mediation/dispute resolution context and categorize it as 'positive', 'neutral', or 'negative'. Also provide an intensity score from 0.0 to 1.0. Respond with JSON in this format: { \"sentiment\": \"positive/neutral/negative\", \"intensity\": 0.0-1.0 }",
        },
        {
          role: "user" as const,
          content: message,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      sentiment: result.sentiment || "neutral",
      intensity: typeof result.intensity === "number" ? result.intensity : 0.5,
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      sentiment: "neutral",
      intensity: 0.5,
    };
  }
}

/**
 * Generate a summary of the mediation session
 * 
 * @param dispute The dispute details
 * @param messages All messages in the mediation session
 * @returns Summary and recommendations
 */
export async function generateSessionSummary(
  dispute: Dispute,
  messages: MediationMessage[]
): Promise<{
  summary: string;
  recommendations: string[];
}> {
  try {
    // Format the conversation for OpenAI
    const messagesText = messages.map(msg => {
      const role = msg.role === "user" ? "Party" : 
                   msg.role === "mediator" ? "Mediator" : "AI";
      return `${role}: ${msg.content}`;
    }).join("\n\n");

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system" as const,
          content: `You are a professional mediator summarizing a dispute resolution session. Create a concise, neutral summary of the discussion and provide 3-5 specific recommendations for resolving the dispute.
          
The summary should highlight key points raised by all parties and identify both areas of agreement and disagreement.
The recommendations should be practical, fair, and grounded in Canadian law where appropriate.
          
Format your response as JSON with 'summary' and 'recommendations' fields. The recommendations should be an array of strings.`,
        },
        {
          role: "user" as const,
          content: `Dispute title: ${dispute.title}
Dispute description: ${dispute.description}
Parties involved: ${dispute.parties}
Dispute type: ${dispute.disputeType}

CONVERSATION:
${messagesText}

Please provide a summary and recommendations based on this mediation session.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      summary: result.summary || "No summary available.",
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
    };
  } catch (error) {
    console.error("Error generating session summary:", error);
    return {
      summary: "Unable to generate session summary at this time.",
      recommendations: [],
    };
  }
}