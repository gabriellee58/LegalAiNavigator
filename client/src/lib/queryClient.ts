import { QueryClient, QueryFunction } from "@tanstack/react-query";

// API error class with additional metadata
export class ApiError extends Error {
  status: number;
  data?: any;
  isNetworkError: boolean;
  isServerError: boolean;
  isAuthError: boolean;
  
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = status === 0;
    this.isServerError = status >= 500;
    this.isAuthError = status === 401 || status === 403;
  }
}

// Attempt to parse error response as JSON
async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data.message) return data.message;
    if (data.error) return data.error;
    return JSON.stringify(data);
  } catch {
    try {
      return await res.text() || res.statusText;
    } catch {
      return res.statusText || 'Unknown error';
    }
  }
}

// Enhanced error handling
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorMessage = await parseErrorResponse(res);
    throw new ApiError(res.status, `${res.status}: ${errorMessage}`, errorMessage);
  }
}

// Network error detection
export function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError ||
    error.message === 'Network Error' ||
    error.message === 'Failed to fetch' ||
    error.message.includes('Network request failed') ||
    (error instanceof ApiError && error.isNetworkError)
  );
}

// Configure cache time and retry logic based on error type
export function getRetryAndCacheConfig(error: any) {
  // Network errors should retry
  if (isNetworkError(error)) {
    return { retry: true, staleTime: 0 };
  }
  
  // Auth errors shouldn't retry
  if (error instanceof ApiError && error.isAuthError) {
    return { retry: false, staleTime: 0 };
  }
  
  // Server errors should retry with backoff
  if (error instanceof ApiError && error.isServerError) {
    return { retry: true, staleTime: 5000 };
  }
  
  // Default case - don't retry
  return { retry: false, staleTime: 1000 * 60 * 5 }; // 5 minutes
}

// Enhanced API request function
export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown | undefined,
  options: {
    retries?: number, 
    retryDelay?: number
  } = { retries: 1, retryDelay: 1000 },
): Promise<T> {
  const { retries = 1, retryDelay = 1000 } = options;
  let lastError: Error | null = null;
  
  // Attempt with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      
      await throwIfResNotOk(res);
      
      // Parse the response as JSON
      return await res.json() as T;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry certain errors
      if (error instanceof ApiError) {
        if (error.isAuthError) break; // Don't retry auth errors
        
        // Only retry server errors
        if (!error.isServerError && !error.isNetworkError) break;
      }
      
      // Last attempt failed, don't delay
      if (attempt === retries) break;
      
      // Exponential backoff with jitter
      const delayMs = retryDelay * Math.pow(1.5, attempt) * (0.9 + Math.random() * 0.2);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // If we got here, all retries failed
  throw lastError; 
}

// Enhanced query function
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Add query key to error for better debugging
      if (error instanceof Error) {
        error.message = `[${queryKey.join(':')}] ${error.message}`;
      }
      throw error;
    }
  };

// Create query client with enhanced configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: import.meta.env.PROD === true, // Only in production
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.isAuthError) return false;
        if (isNetworkError(error)) return failureCount < 3;
        if (error instanceof ApiError && error.isServerError) return failureCount < 2;
        return false;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential with 30s cap
    },
    mutations: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.isAuthError) return false;
        if (isNetworkError(error)) return failureCount < 2;
        return false;
      },
    },
  },
});

// Cache persister to localStorage for SWR-like offline support
export function setupQueryPersistence() {
  try {
    // Restore cache on startup
    const cache = localStorage.getItem('queryCache');
    if (cache) {
      const parsed = JSON.parse(cache);
      // Only restore if fresh enough (within 24 hours)
      if (parsed.timestamp && Date.now() - parsed.timestamp < 1000 * 60 * 60 * 24) {
        queryClient.setQueryData(parsed.queryKey, parsed.data);
      }
    }
    
    // Persist on window unload - use throttled approach to not impact performance
    let timeoutId: number | null = null;
    const persistCache = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        // Get all active queries
        const queries = queryClient.getQueryCache().getAll();
        for (const query of queries) {
          if (query.state.data) {
            localStorage.setItem(`queryCache:${query.queryKey.join(':')}`, JSON.stringify({
              queryKey: query.queryKey,
              data: query.state.data,
              timestamp: Date.now(),
            }));
          }
        }
      }, 2000);
    };
    
    // Listen for cache changes
    queryClient.getQueryCache().subscribe(persistCache);
  } catch (err) {
    console.warn('Failed to setup query persistence:', err);
  }
}
