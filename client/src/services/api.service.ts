/**
 * API Service
 * 
 * Standardized API request handler with consistent error handling and retry capabilities.
 */

// API request types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  // Base request options
  method?: HttpMethod;
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  body?: any;
  
  // Enhanced options
  timeout?: number;      // Request timeout in milliseconds
  retry?: number;        // Number of retry attempts for failed requests
  retryDelay?: number;   // Delay between retries in milliseconds
  cache?: RequestCache;  // Cache mode
  onProgress?: (progress: number) => void; // Progress callback for uploads
}

// Custom API error with additional properties
export class ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: any;
  isAuthError?: boolean;
  
  constructor(message: string, options: { status?: number; statusText?: string; data?: any } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.statusText = options.statusText;
    this.data = options.data;
    this.isAuthError = options.status === 401 || options.status === 403;
  }
}

// Main API service class
class ApiService {
  // Base URL for API requests
  private baseUrl: string = '';
  
  // Default request options
  private defaultOptions: RequestOptions = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,    // 30 seconds default timeout
    retry: 1,          // 1 retry attempt by default
    retryDelay: 1000,  // 1 second delay between retries
  };
  
  // Global request interceptors
  private requestInterceptors: Array<(url: string, options: RequestOptions) => [string, RequestOptions]> = [];
  
  // Global response interceptors
  private responseInterceptors: Array<(response: Response) => Promise<Response>> = [];
  
  // Global error interceptors
  private errorInterceptors: Array<(error: any) => Promise<any>> = [];
  
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    
    // Add default error interceptor
    this.errorInterceptors.push(async (error) => {
      // Handle timeout errors
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', { status: 408, statusText: 'Request Timeout' });
      }
      
      // Handle network errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
        throw new ApiError('Network connection error', { status: 0, statusText: 'Network Error' });
      }
      
      // Special handling for authentication errors
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        // Add a custom property to identify this as an auth error for the AuthErrorBoundary
        error.isAuthError = true;
        
        // Dispatch an event that can be listened to by components
        const authErrorEvent = new CustomEvent('auth:error', { 
          detail: { 
            status: error.status,
            message: error.message,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(authErrorEvent);
      }
      
      throw error;
    });
  }
  
  // Add a request interceptor
  addRequestInterceptor(interceptor: (url: string, options: RequestOptions) => [string, RequestOptions]) {
    this.requestInterceptors.push(interceptor);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter(i => i !== interceptor);
    };
  }
  
  // Add a response interceptor
  addResponseInterceptor(interceptor: (response: Response) => Promise<Response>) {
    this.responseInterceptors.push(interceptor);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter(i => i !== interceptor);
    };
  }
  
  // Add an error interceptor
  addErrorInterceptor(interceptor: (error: any) => Promise<any>) {
    this.errorInterceptors.push(interceptor);
    return () => {
      this.errorInterceptors = this.errorInterceptors.filter(i => i !== interceptor);
    };
  }
  
  // Main request method
  async request<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    // Merge default options with provided options
    let requestOptions: RequestOptions = { ...this.defaultOptions, ...options };
    let requestUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      const [updatedUrl, updatedOptions] = interceptor(requestUrl, requestOptions);
      requestUrl = updatedUrl;
      requestOptions = updatedOptions;
    }
    
    // Set up timeout controller
    const controller = new AbortController();
    const { signal } = controller;
    
    // Set up timeout if specified
    let timeoutId: number | undefined;
    if (requestOptions.timeout && requestOptions.timeout > 0) {
      timeoutId = window.setTimeout(() => controller.abort(), requestOptions.timeout);
    }
    
    // Prepare request body
    let fetchOptions: RequestInit = {
      method: requestOptions.method,
      headers: requestOptions.headers,
      credentials: requestOptions.credentials,
      signal,
      cache: requestOptions.cache,
    };
    
    // Convert body to JSON string if it's an object
    if (requestOptions.body && typeof requestOptions.body === 'object') {
      fetchOptions.body = JSON.stringify(requestOptions.body);
    } else if (requestOptions.body) {
      fetchOptions.body = requestOptions.body;
    }
    
    // Execute the request with retry logic
    const maxRetries = requestOptions.retry || 0;
    let retries = 0;
    let lastError: any;
    
    while (retries <= maxRetries) {
      try {
        let response = await fetch(requestUrl, fetchOptions);
        
        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          response = await interceptor(response);
        }
        
        // Handle error responses
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            try {
              errorData = await response.text();
            } catch {
              errorData = null;
            }
          }
          
          throw new ApiError(
            errorData?.message || response.statusText, 
            { 
              status: response.status, 
              statusText: response.statusText,
              data: errorData 
            }
          );
        }
        
        // Parse response
        let data: T;
        const contentType = response.headers.get('Content-Type') || '';
        
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else if (contentType.includes('text/')) {
          data = await response.text() as unknown as T;
        } else {
          // Handle binary data or other formats
          data = await response.blob() as unknown as T;
        }
        
        // Clear timeout
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
        
        return data;
      } catch (error) {
        lastError = error;
        
        // Apply error interceptors
        try {
          for (const interceptor of this.errorInterceptors) {
            lastError = await interceptor(lastError);
          }
        } catch (interceptedError) {
          lastError = interceptedError;
        }
        
        // Don't retry if we're not supposed to or if the request was aborted
        if (retries >= maxRetries || (error instanceof DOMException && error.name === 'AbortError')) {
          break;
        }
        
        // Wait before retrying
        const delay = requestOptions.retryDelay || 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        retries++;
      }
    }
    
    // Clear timeout if it hasn't been cleared already
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    
    // If we got here, all retries failed
    throw lastError;
  }
  
  // Convenience methods
  async get<T = any>(url: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }
  
  async post<T = any>(url: string, body: any, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }
  
  async put<T = any>(url: string, body: any, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }
  
  async patch<T = any>(url: string, body: any, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }
  
  async delete<T = any>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export default for consistency and easier mocking in tests
export default apiService;