import { createHash } from 'crypto';
import { db } from '../db';
import { aiResponseCache } from '@shared/schema';
import { eq, and, lt } from 'drizzle-orm';

interface CachedResponse {
  response: string;
  timestamp: Date;
}

const CACHE_TTL_HOURS = 24; // Cache time-to-live in hours

/**
 * Service for caching AI responses to improve performance and reduce API costs
 */
export class CacheService {
  /**
   * Generates a hash key from the request parameters
   */
  private static generateKey(
    modelName: string, 
    prompt: string, 
    options: Record<string, any> = {}
  ): string {
    const payload = JSON.stringify({
      model: modelName,
      prompt,
      options
    });
    
    return createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Cleans expired cache entries
   */
  public static async cleanExpiredCache(): Promise<void> {
    const expiryTimestamp = new Date();
    expiryTimestamp.setHours(expiryTimestamp.getHours() - CACHE_TTL_HOURS);
    
    try {
      await db.delete(aiResponseCache)
        .where(lt(aiResponseCache.createdAt, expiryTimestamp));
    } catch (error) {
      console.error('Error cleaning expired cache entries:', error);
    }
  }

  /**
   * Retrieves a cached response if it exists and is not expired
   */
  public static async get(
    modelName: string, 
    prompt: string, 
    options: Record<string, any> = {}
  ): Promise<string | null> {
    const cacheKey = this.generateKey(modelName, prompt, options);
    const expiryTimestamp = new Date();
    expiryTimestamp.setHours(expiryTimestamp.getHours() - CACHE_TTL_HOURS);
    
    try {
      const [cachedResponse] = await db.select()
        .from(aiResponseCache)
        .where(
          and(
            eq(aiResponseCache.cacheKey, cacheKey),
            lt(aiResponseCache.createdAt, expiryTimestamp)
          )
        );
      
      if (cachedResponse) {
        // Update access counter and last accessed timestamp
        await db.update(aiResponseCache)
          .set({ 
            accessCount: cachedResponse.accessCount + 1,
            lastAccessed: new Date()
          })
          .where(eq(aiResponseCache.id, cachedResponse.id));
          
        return cachedResponse.response;
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving cached response:', error);
      return null;
    }
  }

  /**
   * Stores a response in the cache
   */
  public static async set(
    modelName: string, 
    prompt: string, 
    response: string,
    options: Record<string, any> = {}
  ): Promise<void> {
    const cacheKey = this.generateKey(modelName, prompt, options);
    
    try {
      // Check if the cache entry already exists
      const [existingEntry] = await db.select()
        .from(aiResponseCache)
        .where(eq(aiResponseCache.cacheKey, cacheKey));
      
      if (existingEntry) {
        // Update the existing entry
        await db.update(aiResponseCache)
          .set({ 
            response,
            createdAt: new Date(),
            accessCount: existingEntry.accessCount + 1,
            lastAccessed: new Date()
          })
          .where(eq(aiResponseCache.id, existingEntry.id));
      } else {
        // Create a new cache entry
        await db.insert(aiResponseCache)
          .values({
            cacheKey,
            provider: modelName.split('-')[0],
            modelName,
            prompt,
            response,
            options: options as any,
            accessCount: 1,
            lastAccessed: new Date()
          });
      }
    } catch (error) {
      console.error('Error storing response in cache:', error);
    }
  }
}

// Periodically clean expired cache entries
setInterval(() => {
  CacheService.cleanExpiredCache().catch(err => 
    console.error('Failed to clean expired cache:', err)
  );
}, 3600000); // Run every hour