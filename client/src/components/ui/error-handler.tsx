import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { ApiError } from "@/services/api.service";

export interface ErrorState {
  title: string;
  message: string;
  type: "error" | "warning" | "info" | "success";
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorContextType {
  error: ErrorState | null;
  setError: (error: ErrorState | null) => void;
  clearError: () => void;
}

const ErrorContext = React.createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<ErrorState | null>(null);
  const { toast } = useToast();

  const clearError = () => setError(null);
  
  // Handle authentication errors from custom events
  const handleAuthError = useCallback((event: CustomEvent) => {
    const { status, message, timestamp } = event.detail;
    
    setError({
      type: "error",
      title: status === 403 ? "Access Denied" : "Authentication Required",
      message: message || "Your session has expired or you don't have permission to access this resource.",
      action: {
        label: "Log In",
        onClick: () => window.location.href = '/api/login'
      }
    });
  }, []);
  
  // Set up event listener for auth errors
  useEffect(() => {
    window.addEventListener('auth:error', handleAuthError as EventListener);
    
    return () => {
      window.removeEventListener('auth:error', handleAuthError as EventListener);
    };
  }, [handleAuthError]);

  useEffect(() => {
    if (error) {
      toast({
        title: error.title,
        description: error.message,
        variant: error.type === "error" ? "destructive" : undefined,
        action: error.action
          ? <ToastAction altText={error.action.label} onClick={error.action.onClick}>
              {error.action.label}
            </ToastAction>
          : undefined,
      });
    }
  }, [error, toast]);

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = React.useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

export const ErrorDisplay: React.FC = () => {
  const { error, clearError } = useError();

  if (!error) return null;

  const icons = {
    error: <XCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
    success: <AlertCircle className="h-4 w-4" />,
  };

  return (
    <Alert variant={error.type === "error" ? "destructive" : "default"}>
      <div className="flex items-start">
        <div className="mr-2 mt-0.5">{icons[error.type]}</div>
        <div className="flex-1">
          <AlertTitle>{error.title}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </div>
      </div>
      {error.action && (
        <div className="mt-2">
          <button
            onClick={error.action.onClick}
            className="text-sm font-medium underline underline-offset-4"
          >
            {error.action.label}
          </button>
        </div>
      )}
    </Alert>
  );
};

export const handleApiError = (error: any, setError: (error: ErrorState) => void) => {
  console.error("API Error:", error);

  // Handle our custom ApiError class
  if (error instanceof ApiError) {
    const status = error.status || 0;
    
    // Authentication errors are already handled by the event system
    if (error.isAuthError) {
      return;
    }
    
    if (status === 404) {
      setError({
        type: "warning",
        title: "Not Found",
        message: error.message || "The requested resource could not be found.",
      });
    } else if (status === 429) {
      setError({
        type: "warning",
        title: "Rate Limited",
        message: "You've made too many requests. Please try again later.",
      });
    } else if (status === 500) {
      setError({
        type: "error",
        title: "Server Error",
        message: "An unexpected error occurred on the server. Please try again later.",
      });
    } else if (status === 0) {
      setError({
        type: "error",
        title: "Network Error",
        message: "Unable to connect to the server. Please check your internet connection and try again.",
        action: {
          label: "Retry",
          onClick: () => window.location.reload(),
        },
      });
    } else {
      setError({
        type: "error",
        title: `Error ${status || "Unknown"}`,
        message: error.message || "An unexpected error occurred. Please try again.",
      });
    }
  }
  // Legacy error format support
  else if (error.response) {
    // Server responded with error (non-2xx)
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401 || status === 403) {
      // Authentication errors will be handled by the auth event system
      // Dispatch the auth:error event if not already done
      const authErrorEvent = new CustomEvent('auth:error', { 
        detail: { 
          status,
          message: data?.message || error.message || "Authentication error",
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(authErrorEvent);
    } else if (status === 404) {
      setError({
        type: "warning",
        title: "Not Found",
        message: "The requested resource could not be found.",
      });
    } else if (status === 500) {
      setError({
        type: "error",
        title: "Server Error",
        message: "An unexpected error occurred on the server. Please try again later.",
      });
    } else {
      setError({
        type: "error",
        title: `Error ${status}`,
        message: data?.message || "An unexpected error occurred. Please try again.",
      });
    }
  } else if (error.request) {
    // Request made but no response received (network error)
    setError({
      type: "error",
      title: "Network Error",
      message: "Unable to connect to the server. Please check your internet connection and try again.",
      action: {
        label: "Retry",
        onClick: () => window.location.reload(),
      },
    });
  } else {
    // Error in setting up the request
    setError({
      type: "error",
      title: "Application Error",
      message: error.message || "An unexpected error occurred. Please try again.",
    });
  }
};

// Component for displaying error states in forms
export const FormError: React.FC<{ error?: string }> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="text-sm text-destructive mt-1 flex items-center">
      <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
      <span>{error}</span>
    </div>
  );
};