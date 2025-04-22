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
    retryDelay?: number,
    logDetails?: boolean
  } = { retries: 1, retryDelay: 1000, logDetails: true },
): Promise<T> {
  const { retries = 1, retryDelay = 1000, logDetails = true } = options;
  let lastError: Error | null = null;
  
  // Log request details when debugging is enabled
  if (logDetails) {
    console.log(`API Request: ${method} ${url}`, data ? { bodyFields: Object.keys(data as object) } : 'No body');
  }
  
  // Attempt with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0 && logDetails) {
        console.log(`Retry attempt ${attempt}/${retries} for ${method} ${url}`);
      }
      
      const res = await fetch(url, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      
      // Check if the response is OK
      if (!res.ok) {
        let errorData;
        try {
          // Try to get the error details as JSON
          errorData = await res.json();
          if (logDetails) {
            console.error(`API Error (${res.status}) for ${method} ${url}:`, errorData);
          }
        } catch {
          // If the error isn't JSON, get it as text
          const errorText = await res.text();
          if (logDetails) {
            console.error(`API Error (${res.status}) for ${method} ${url}:`, errorText || res.statusText);
          }
          errorData = { message: errorText || res.statusText };
        }
        
        throw new ApiError(res.status, 
          errorData.message || `Error ${res.status}: ${res.statusText}`, 
          errorData
        );
      }
      
      let result;
      // Handle both JSON responses and non-JSON responses (like empty responses)
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json() as T;
      } else {
        // If not JSON content type, check if there's any content at all
        const text = await res.text();
        if (!text) {
          // Empty response, return an empty object
          result = {} as T;
        } else {
          // Try to parse as JSON anyway, fallback to text
          try {
            result = JSON.parse(text) as T;
          } catch {
            // Not JSON, return the text
            result = text as unknown as T;
          }
        }
      }
      
      if (logDetails) {
        console.log(`API Success: ${method} ${url}`, 
          result ? (typeof result === 'object' ? 'Response object received' : 'Response received') : 'Empty response');
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      if (logDetails) {
        console.error(`API Request failed (attempt ${attempt + 1}/${retries + 1}):`, error);
      }
      
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
  if (logDetails) {
    console.error(`All ${retries + 1} attempts failed for ${method} ${url}`, lastError);
  }
  throw lastError; 
}

// Enhanced query function
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  logDetails?: boolean;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, logDetails = true }) =>
  async ({ queryKey }) => {
    try {
      const url = queryKey[0] as string;
      if (logDetails) {
        console.log(`Query: GET ${url}`);
      }
      
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        if (logDetails) {
          console.log(`Query: GET ${url} - 401 returned, returning null as configured`);
        }
        return null;
      }

      // Handle errors with enhanced error messages
      if (!res.ok) {
        let errorData;
        try {
          // Try to get the error details as JSON
          errorData = await res.json();
          if (logDetails) {
            console.error(`Query Error (${res.status}) for GET ${url}:`, errorData);
          }
        } catch {
          // If the error isn't JSON, get it as text
          const errorText = await res.text();
          if (logDetails) {
            console.error(`Query Error (${res.status}) for GET ${url}:`, errorText || res.statusText);
          }
          errorData = { message: errorText || res.statusText };
        }
        
        throw new ApiError(res.status, 
          errorData.message || `Error ${res.status}: ${res.statusText}`, 
          errorData
        );
      }
      
      // Handle both JSON responses and non-JSON responses
      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json() as T;
      } else {
        // If not JSON content type, check if there's any content at all
        const text = await res.text();
        if (!text) {
          // Empty response, return an empty object
          result = {} as T;
        } else {
          // Try to parse as JSON anyway, fallback to text
          try {
            result = JSON.parse(text) as T;
          } catch {
            // Not JSON, return the text
            result = text as unknown as T;
          }
        }
      }
      
      if (logDetails) {
        console.log(`Query Success: GET ${url}`, 
          result ? 'Response received' : 'Empty response');
      }
      
      return result;
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
      queryFn: getQueryFn({ on401: "throw", logDetails: true }),
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
