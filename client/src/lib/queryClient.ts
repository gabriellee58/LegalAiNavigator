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

// Import and use our unified API service
import { apiService } from "@/services/api.service";

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
  
  // Log request details when debugging is enabled
  if (logDetails) {
    console.log(`API Request: ${method} ${url}`, data ? { bodyFields: Object.keys(data as object) } : 'No body');
  }
  
  try {
    // Use our API service for the request
    let result: T;
    
    switch (method.toUpperCase()) {
      case 'GET':
        result = await apiService.get<T>(url, { 
          retry: retries, 
          retryDelay 
        });
        break;
      case 'POST':
        result = await apiService.post<T>(url, data, { 
          retry: retries, 
          retryDelay 
        });
        break;
      case 'PUT':
        result = await apiService.put<T>(url, data, { 
          retry: retries, 
          retryDelay 
        });
        break;
      case 'PATCH':
        result = await apiService.patch<T>(url, data, { 
          retry: retries, 
          retryDelay 
        });
        break;
      case 'DELETE':
        result = await apiService.delete<T>(url, { 
          retry: retries, 
          retryDelay 
        });
        break;
      default:
        result = await apiService.request<T>(url, {
          method: method as any,
          body: data,
          retry: retries,
          retryDelay
        });
    }
    
    if (logDetails) {
      console.log(`API Success: ${method} ${url}`, 
        result ? (typeof result === 'object' ? 'Response object received' : 'Response received') : 'Empty response');
    }
    
    return result;
  } catch (error) {
    if (logDetails) {
      console.error(`API Request failed for ${method} ${url}:`, error);
    }
    
    // Convert to our ApiError format if needed
    if (error instanceof Error && !(error instanceof ApiError)) {
      // If it's from our API service, it might have status and data
      const status = (error as any).status || 0;
      const data = (error as any).data;
      const message = error.message || 'Unknown error';
      
      throw new ApiError(status, message, data);
    }
    
    throw error;
  }
}

// Enhanced query function using our API service
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <TData>(options: {
  on401: UnauthorizedBehavior;
  logDetails?: boolean;
}): QueryFunction<TData> =>
  async ({ queryKey }) => {
    try {
      const url = queryKey[0] as string;
      if (options.logDetails) {
        console.log(`Query: GET ${url}`);
      }
      
      try {
        // Use our API service for the request
        const result = await apiService.get<TData>(url);
        
        if (options.logDetails) {
          console.log(`Query Success: GET ${url}`, 
            result ? 'Response received' : 'Empty response');
        }
        
        return result;
      } catch (error: any) {
        // For 401 errors, return null if configured that way
        if (error.status === 401 && options.on401 === "returnNull") {
          if (options.logDetails) {
            console.log(`Query: GET ${url} - 401 returned, returning null as configured`);
          }
          return null as any;
        }
        
        // Re-throw the error
        throw error;
      }
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
