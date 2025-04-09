/**
 * AI Streaming Service
 * 
 * This module provides streaming functionality for AI responses,
 * allowing partial responses to be sent to the client as they are generated.
 */

import { Readable } from 'stream';
import { Request, Response } from 'express';
import { aiFeatureFlags } from './aiService';
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// Initialize AI providers
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Stream an AI response to the client using Express
 */
export async function streamAIResponse(req: Request, res: Response): Promise<void> {
  if (!aiFeatureFlags.streamingResponses) {
    res.status(503).json({ 
      error: "Streaming responses are currently disabled" 
    });
    return;
  }

  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "No message provided" });
      return;
    }

    // Set up headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let streamFailed = false;

    // Try streaming with DeepSeek first (not implemented yet as DeepSeek may not support streaming)
    // So we'll fall back to OpenAI which has well-documented streaming support

    try {
      // Stream with OpenAI
      const stream = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model
        messages: [
          {
            role: "system",
            content: `You are an AI legal assistant specialized in Canadian law. 
            Provide helpful, accurate information about Canadian legal topics. 
            Always clarify that you are not providing legal advice and recommend consulting a qualified lawyer for specific legal issues.
            Focus on Canadian legal frameworks, regulations, and precedents.
            Be respectful, concise, and easy to understand.
            Avoid excessive legalese, but maintain accuracy in legal concepts.`
          },
          {
            role: "user",
            content: message
          }
        ],
        stream: true,
      });

      // Send each chunk as it arrives
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(content);
        }
      }

      // End the response
      res.end();
      return;
    } catch (error) {
      console.error("OpenAI streaming failed, trying Claude:", error);
      streamFailed = true;
    }

    // If we got here, OpenAI streaming failed. Try with Claude
    if (streamFailed) {
      try {
        const stream = await anthropic.messages.stream({
          model: "claude-3-7-sonnet-20250219", // the newest Anthropic model
          max_tokens: 1024,
          system: `You are an AI legal assistant specialized in Canadian law. 
          Provide helpful, accurate information about Canadian legal topics. 
          Always clarify that you are not providing legal advice and recommend consulting a qualified lawyer for specific legal issues.
          Focus on Canadian legal frameworks, regulations, and precedents.
          Be respectful, concise, and easy to understand.
          Avoid excessive legalese, but maintain accuracy in legal concepts.`,
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
        });

        // Send each text fragment as it arrives
        for await (const messageStreamEvent of stream) {
          if (messageStreamEvent.type === "content_block_delta" && messageStreamEvent.delta) {
            // Safely access the text property
            const delta = messageStreamEvent.delta as { text?: string };
            const textFragment = delta.text;
            if (textFragment) {
              res.write(textFragment);
            }
          }
        }

        // End the response
        res.end();
      } catch (error) {
        console.error("Claude streaming failed:", error);
        res.status(500).json({ error: "All streaming providers failed" });
      }
    }
  } catch (error) {
    console.error("Error streaming AI response:", error);
    res.status(500).json({ error: "Failed to stream response" });
  }
}

/**
 * Create a readable stream from a non-streaming AI response
 * This is useful for services that don't natively support streaming
 */
export function createFakeStreamFromText(text: string): Readable {
  const chunks = text.match(/.{1,20}/g) || []; // Split into ~20 char chunks
  
  const stream = new Readable({
    read() {
      if (chunks.length === 0) {
        this.push(null); // End of stream
        return;
      }
      
      const chunk = chunks.shift();
      
      // Add a small delay to simulate streaming
      setTimeout(() => {
        this.push(chunk);
      }, 100);
    }
  });
  
  return stream;
}