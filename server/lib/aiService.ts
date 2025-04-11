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
import { CacheService } from "./cacheService";
import { db } from "../db";
import { aiResponseCache } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

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

  // Check database cache first if enabled
  if (useCache && cacheKey) {
    try {
      // Try to get response from persistent cache
      const cachedResponse = await CacheService.get(
        options.model || 'default',
        prompt,
        options
      );
      
      if (cachedResponse) {
        console.log(`${logPrefix}: DB Cache hit for prompt (key=${cacheKey.substring(0, 20)}...)`);
        return cachedResponse as unknown as T;
      }
      
      // Fall back to memory cache if database cache misses
      if (responseCache.has(cacheKey)) {
        const cached = responseCache.get(cacheKey)!;
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          console.log(`${logPrefix}: Memory cache hit for prompt (key=${cacheKey.substring(0, 20)}...)`);
          return cached.response as T;
        }
      }
    } catch (error) {
      console.warn(`${logPrefix}: Cache lookup failed, continuing with live request`, error);
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
        // Store in memory cache
        responseCache.set(cacheKey, {
          response,
          timestamp: Date.now()
        });
        
        // Store in database cache
        try {
          await CacheService.set(
            options.model || 'default',
            prompt,
            response as string,
            options
          );
        } catch (cacheError) {
          console.warn(`${logPrefix}: Failed to store response in database cache`, cacheError);
        }
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
        const response = await generateOpenAIResponse(prompt, {
          system: options.system,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          model: options.model
        });
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
          const response = await generateAIResponseClaude(prompt, {
            system: options.system,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            model: options.model
          });
          return response as unknown as T;
        });
      } catch (claudeError) {
        // Log Claude failure
        console.warn(`${logPrefix}: Anthropic Claude failed, trying DeepSeek.`, claudeError);
        
        // Final fallback to DeepSeek
        try {
          return await trackRequest("DeepSeek", async () => {
            const response = await generateDeepSeekResponse(prompt, {
              system: options.system,
              temperature: options.temperature,
              maxTokens: options.maxTokens,
              model: options.model
            });
            return response as unknown as T;
          });
        } catch (deepseekError) {
          // All providers failed - implement sophisticated emergency fallback
          console.error(`${logPrefix}: All AI providers failed.`, deepseekError);
          
          // Determine error type to provide more specific guidance
          const errorString = String(deepseekError);
          const isTokenLimitError = 
            errorString.includes("context length") || 
            errorString.includes("maximum token") || 
            errorString.includes("too long");
          
          const isRateLimitError = 
            errorString.includes("rate limit") || 
            errorString.includes("requests per minute") ||
            errorString.includes("quota");
            
          const isAuthError =
            errorString.includes("authentication") ||
            errorString.includes("api key") ||
            errorString.includes("unauthorized");
            
          // Create a tailored emergency fallback response
          let fallbackResponse = "";
          let errorType = "unknown";
          
          if (isTokenLimitError) {
            errorType = "token_limit";
            fallbackResponse = 
              "I apologize, but your request contains too much text for me to process at once. " +
              "Please try breaking it into smaller parts or summarizing the key points you'd like me to address. " +
              "For documents, consider focusing on specific sections rather than the entire text.";
          } else if (isRateLimitError) {
            errorType = "rate_limit"; 
            fallbackResponse = 
              "I apologize, but we're currently experiencing high demand on our AI services. " +
              "Please try again in a few minutes when our systems are less busy. " +
              "If you're working with time-sensitive information, try simplifying your request or breaking it into smaller parts.";
          } else if (isAuthError) {
            errorType = "auth_error";
            fallbackResponse = 
              "There appears to be an authentication issue with our AI services. " +
              "Our team has been notified and is working to resolve this problem. " +
              "Please try again in a few minutes or contact support if this issue persists.";
          } else {
            errorType = "general_error";
            fallbackResponse = 
              "I apologize, but I'm currently experiencing technical difficulties processing your request. " +
              "This might be due to temporary service issues or limitations with processing your specific input. " +
              "Please try again with different wording or after a short delay. " +
              "If the problem continues, contact support for assistance.";
          }
          
          // Log detailed error for monitoring
          console.error(`Emergency fallback activated: ${errorType} error detected in AI request`, {
            promptLength: prompt.length,
            errorType,
            originalError: String(deepseekError).substring(0, 500) // Truncate for readability
          });
          
          if (useCache && cacheKey) {
            // Don't cache error responses for too long
            responseCache.set(cacheKey, {
              response: { 
                content: fallbackResponse,
                error: true,
                errorType,
                timestamp: new Date().toISOString()
              } as unknown as T,
              timestamp: Date.now() - (CACHE_TTL - 60000) // Cache for just 1 minute
            });
          }
          
          // For structured responses where we expect a specific format,
          // we need to handle this differently - return a fallback object
          // that will be recognized by the calling code
          if (typeof prompt === 'object' || prompt.includes('JSON') || options.system?.includes('JSON')) {
            // This might be expecting a structured response
            return {
              error: true,
              errorType,
              message: fallbackResponse,
              fallback: true
            } as unknown as T;
          }
          
          return fallbackResponse as unknown as T;
        }
      }
    }
  }
}

/**
 * Enhanced chat message processing with improved error handling
 */
export async function generateChatResponse(
  userMessage: string, 
  options: AIServiceOptions = {}
): Promise<string | { error: boolean; message: string; errorType: string; recovery?: string }> {
  if (!aiFeatureFlags.enableAIChatAssistant) {
    return {
      error: true,
      errorType: "feature_disabled",
      message: "This feature is currently disabled during maintenance.",
      recovery: "Please try again later when the service is fully restored."
    };
  }

  try {
    const response = await enhancedAIRequest<string | any>(userMessage, {
      ...options,
      logPrefix: "Chat"
    });
    
    // Check if we received an error response object from the fallback system
    if (response && typeof response === 'object' && response.error === true) {
      return {
        error: true,
        errorType: response.errorType || "unknown_error",
        message: response.message || "An error occurred while processing your request.",
        recovery: getRecoveryMessage(response.errorType)
      };
    }
    
    // Normal string response
    return response as string;
  } catch (error: any) {
    // Determine error type for better user guidance
    const errorMessage = error.toString();
    let errorType = "unknown";
    
    if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
      errorType = "rate_limit";
    } else if (errorMessage.includes("token") || errorMessage.includes("context length")) {
      errorType = "token_limit";
    } else if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
      errorType = "timeout";
    } else if (errorMessage.includes("connection") || errorMessage.includes("network")) {
      errorType = "network";
    }
    
    console.error(`Chat generation ${errorType} error:`, error);
    
    return {
      error: true,
      errorType,
      message: "I encountered a problem while processing your message.",
      recovery: getRecoveryMessage(errorType)
    };
  }
}

/**
 * Get appropriate recovery instructions based on error type
 */
function getRecoveryMessage(errorType: string): string {
  switch (errorType) {
    case "token_limit":
      return "Try sending a shorter message or breaking your question into smaller parts.";
    case "rate_limit":
      return "Our system is currently handling many requests. Please try again in a few minutes.";
    case "timeout":
      return "The response took too long to generate. Try a simpler question or try again later.";
    case "network":
      return "Check your internet connection and try again. If the problem persists, our servers might be experiencing issues.";
    case "auth_error":
      return "There's an issue with our AI service authentication. Our team has been notified.";
    case "feature_disabled":
      return "This feature is temporarily disabled. Please check back later.";
    default:
      return "Please try rewording your question or try again in a few moments.";
  }
}

/**
 * Clear the AI response cache
 */
export async function clearResponseCache(): Promise<void> {
  // Clear in-memory cache
  const cacheSize = responseCache.size;
  responseCache.clear();
  
  // First get stats for reporting
  let dbCount = 0;
  try {
    const dbStats = await db.select({
      count: sql`count(*)`
    })
    .from(aiResponseCache);
    
    dbCount = Number(dbStats[0]?.count || 0);
  } catch (error) {
    console.error('Error getting database cache count:', error);
  }
  
  // Completely clear database cache (not just expired entries)
  try {
    const result = await db.delete(aiResponseCache).returning({ deletedId: aiResponseCache.id });
    console.log(`AI response cache cleared completely: ${cacheSize} in-memory entries and ${result.length} database entries removed`);
  } catch (error) {
    console.error('Error clearing database cache:', error);
    console.log(`AI in-memory response cache cleared (${cacheSize} entries removed), but database cache clear failed`);
    throw new Error("Failed to clear database cache");
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{ 
  memoryCache: { size: number, keys: string[] },
  databaseCache?: { count: number, providers: Record<string, number> }
}> {
  // Get basic memory cache stats
  const stats: {
    memoryCache: { size: number, keys: string[] },
    databaseCache?: { count: number, providers: Record<string, number> }
  } = {
    memoryCache: {
      size: responseCache.size,
      keys: Array.from(responseCache.keys())
    }
  };
  
  // Try to get database cache stats
  try {
    const dbStats = await db.select({
      count: sql`count(*)`,
      provider: aiResponseCache.provider
    })
    .from(aiResponseCache)
    .groupBy(aiResponseCache.provider);
    
    // Organize stats by provider
    const providers = dbStats.reduce<Record<string, number>>((acc, item) => {
      acc[item.provider] = Number(item.count);
      return acc;
    }, {});
    
    // Calculate total count
    const count = Object.values(providers).reduce((sum, val) => sum + Number(val), 0);
    
    stats.databaseCache = { count, providers };
  } catch (error) {
    console.error('Error getting database cache stats:', error);
  }
  
  return stats;
}

/**
 * Update feature flags
 */
export function updateFeatureFlags(flags: Partial<typeof aiFeatureFlags>): typeof aiFeatureFlags {
  Object.assign(aiFeatureFlags, flags);
  console.log("AI feature flags updated:", aiFeatureFlags);
  return aiFeatureFlags;
}