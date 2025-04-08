import { logDbQuery } from './logger';
import { DatabaseError } from './errorHandler';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@shared/schema';

// Cache for prepared statements
const queryCache = new Map<string, any>();

/**
 * Enhances the database client with query logging, caching, and error handling.
 * 
 * @param db The Drizzle database instance
 * @returns The enhanced database instance
 */
export function enhanceDbClient(db: PostgresJsDatabase<typeof schema>): PostgresJsDatabase<typeof schema> {
  // Store the original execute method
  const originalExecute = db.execute.bind(db);
  
  // Define a wrapper that safely handles all query types
  // @ts-ignore - We need to temporarily bypass type checking for logging
  db.execute = async function(...args: any[]) {
    const query = args[0];
    const params = args.length > 1 ? args[1] : [];
    const options = args.length > 2 ? args[2] : undefined;
    
    // Get query text for logging
    const queryText = typeof query === 'string' 
      ? query 
      : query?.sql 
        ? query.sql
        : String(query);
    
    const startTime = performance.now();
    
    try {
      // Execute the query using the original method
      // Keep the exact same argument structure as the original call
      const result = await originalExecute.apply(db, args);
      
      const duration = Math.round(performance.now() - startTime);
      logDbQuery(queryText, params || [], duration);
      
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      logDbQuery(queryText, params || [], duration, error as Error);
      
      // Transform database errors
      throw new DatabaseError(
        `Database query failed: ${(error as Error).message}`, 
        queryText, 
        params || []
      );
    }
  };
  
  return db;
}
/**
 * Clears the query cache - useful for testing or resetting state
 */
export function clearQueryCache(): void {
  queryCache.clear();
}

/**
 * Get query cache statistics
 */
export function getQueryCacheStats(): { size: number; queries: string[] } {
  return {
    size: queryCache.size,
    queries: Array.from(queryCache.keys()),
  };
}