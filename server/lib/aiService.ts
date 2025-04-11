/**
 * Enhanced AI Service Module
 * 
 * This module provides a central interface for all AI operations with:
 * 1. Tiered fallback mechanism between different AI providers
 * 2. Request caching for frequently asked questions
 * 3. Rate limiting and request queueing
 * 4. Detailed error tracking and logging
 * 5. Feature flags for development control
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { generateAIResponse as generateDeepSeekResponse } from "./deepseek";
import { generateAIResponseClaude } from "./anthropic";
import { generateAIResponse as generateOpenAIResponse } from "./openai";

// Feature flags
export const aiFeatureFlags = {
  useCache: true,                 // Use response caching
  useRequestQueue: true,          // Use request queueing
  streamingResponses: false,      // Stream responses (not fully implemented yet)
  enableAIChatAssistant: true,    // Enable AI chat assistant
  enableAIDocumentGeneration: true, // Enable AI document generation
  enableAILegalResearch: true,    // Enable AI legal research
  enableAIContractAnalysis: true, // Enable AI contract analysis
  fallbackEnabled: true,          // Enable fallback between providers
  detailedLogging: true           // Enable detailed logging
};

// Request Queue Implementation
class RequestQueue {
  private concurrencyLimit: number;
  private queue: Array<{
    requestFn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }>;
  private runningCount: number;

  constructor(concurrencyLimit = 3) {
    this.concurrencyLimit = concurrencyLimit;
    this.queue = [];
    this.runningCount = 0;
  }

  enqueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.runningCount >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    this.runningCount++;
    const { requestFn, resolve, reject } = this.queue.shift()!;

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.runningCount--;
      this.processQueue();
    }
  }
}

// Initialize the request queue
const aiRequestQueue = new RequestQueue(3); // Allow 3 concurrent requests

// In-memory cache implementation
interface CachedResponse<T> {
  response: T;
  timestamp: number;
}

const responseCache = new Map<string, CachedResponse<any>>();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// AI Service Interface
interface AIServiceOptions {
  system?: string;
  temperature?: number;
  maxTokens?: number;
  cacheKey?: string;
  useCache?: boolean;
  skipQueue?: boolean;
  model?: string;
  logPrefix?: string;
  skipFallback?: boolean;
}

/**
 * Core AI request function with tiered fallback between providers
 */
export async function enhancedAIRequest<T>(
  prompt: string, 
  options: AIServiceOptions = {}
): Promise<T> {
  // Apply feature flags
  const useCache = options.useCache !== undefined ? options.useCache : aiFeatureFlags.useCache;
  const logPrefix = options.logPrefix || "AI Request";
  
  // Generate cache key if caching is enabled
  const cacheKey = useCache ? (options.cacheKey || `${prompt}-${JSON.stringify(options)}`) : undefined;

  // Check cache first if enabled
  if (useCache && cacheKey && responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`${logPrefix}: Cache hit for prompt (key=${cacheKey.substring(0, 20)}...)`);
      return cached.response as T;
    }
  }

  // Function to track request timing and log
  const trackRequest = async (
    name: string, 
    requestFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = Date.now();
    try {
      const response = await requestFn();
      const duration = Date.now() - startTime;
      
      if (aiFeatureFlags.detailedLogging) {
        console.log(
          `${logPrefix}: ${name} request successful. Duration: ${duration}ms, Prompt length: ${prompt.length}`
        );
      }
      
      // Cache response if caching is enabled
      if (useCache && cacheKey) {
        responseCache.set(cacheKey, {
          response,
          timestamp: Date.now()
        });
      }
      
      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(
        `${logPrefix}: ${name} request failed after ${duration}ms`, 
        error.message || error
      );
      throw error;
    }
  };

  // Enqueue request if queueing is enabled
  if (aiFeatureFlags.useRequestQueue && !options.skipQueue) {
    return aiRequestQueue.enqueue(async () => {
      return await processTieredRequest();
    });
  } else {
    return await processTieredRequest();
  }

  // Process request with fallback tiers
  async function processTieredRequest(): Promise<T> {
    // Start with OpenAI for better reliability
    try {
      return await trackRequest("OpenAI", async () => {
        // Update the openai.ts implementation to match this signature
        const response = await generateOpenAIResponse(prompt);
        return response as unknown as T;
      });
    } catch (openaiError) {
      // Log OpenAI failure
      console.warn(`${logPrefix}: OpenAI provider failed, trying Anthropic Claude.`, openaiError);
      
      // Skip fallback if disabled
      if (!aiFeatureFlags.fallbackEnabled || options.skipFallback) {
        throw openaiError;
      }
      
      try {
        // Try Anthropic Claude next
        return await trackRequest("Anthropic Claude", async () => {
          const response = await generateAIResponseClaude(prompt);
          return response as unknown as T;
        });
      } catch (claudeError) {
        // Log Claude failure
        console.warn(`${logPrefix}: Anthropic Claude failed, trying DeepSeek.`, claudeError);
        
        // Final fallback to DeepSeek
        try {
          return await trackRequest("DeepSeek", async () => {
            const response = await generateDeepSeekResponse(prompt);
            return response as unknown as T;
          });
        } catch (deepseekError) {
          // All providers failed - implement emergency fallback with direct response
          console.error(`${logPrefix}: All AI providers failed.`, deepseekError);
          
          // Create an emergency fallback response
          const fallbackResponse = "I apologize, but I'm currently experiencing technical difficulties processing your request. Our team has been notified of this issue. Please try again in a few moments, or contact support if this problem persists.";
          
          if (useCache && cacheKey) {
            // Don't cache error responses for too long
            responseCache.set(cacheKey, {
              response: fallbackResponse as unknown as T,
              timestamp: Date.now() - (CACHE_TTL - 60000) // Cache for just 1 minute
            });
          }
          
          return fallbackResponse as unknown as T;
        }
      }
    }
  }
}

/**
 * Enhanced chat message processing
 */
export async function generateChatResponse(
  userMessage: string, 
  options: AIServiceOptions = {}
): Promise<string> {
  if (!aiFeatureFlags.enableAIChatAssistant) {
    return "This feature is currently disabled during development. Please try again later.";
  }

  try {
    return await enhancedAIRequest<string>(userMessage, {
      ...options,
      logPrefix: "Chat"
    });
  } catch (error: any) {
    console.error("Chat generation error:", error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
  }
}

/**
 * Clear the AI response cache
 */
export function clearResponseCache(): void {
  const cacheSize = responseCache.size;
  responseCache.clear();
  console.log(`AI response cache cleared (${cacheSize} entries removed)`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number, keys: string[] } {
  return {
    size: responseCache.size,
    keys: Array.from(responseCache.keys())
  };
}

/**
 * Update feature flags
 */
export function updateFeatureFlags(flags: Partial<typeof aiFeatureFlags>): typeof aiFeatureFlags {
  Object.assign(aiFeatureFlags, flags);
  console.log("AI feature flags updated:", aiFeatureFlags);
  return aiFeatureFlags;
}