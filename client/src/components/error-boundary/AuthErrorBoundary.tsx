import React, { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldAlert, RefreshCw, LogIn } from 'lucide-react';
import { ApiError } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isAuthError: boolean;
  errorDetails: {
    status?: number;
    message?: string;
    timestamp?: string;
  } | null;
}

class AuthErrorBoundary extends React.Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  private authErrorListener: any;
  
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isAuthError: false,
      errorDetails: null
    };
  }
  
  componentDidMount() {
    // Listen for auth error events from the API service
    this.authErrorListener = window.addEventListener('auth:error', ((event: CustomEvent) => {
      const { status, message, timestamp } = event.detail;
      this.setState({
        hasError: true,
        isAuthError: true,
        errorDetails: {
          status,
          message,
          timestamp
        }
      });
    }) as EventListener);
  }
  
  componentWillUnmount() {
    // Clean up event listener
    if (this.authErrorListener) {
      window.removeEventListener('auth:error', this.authErrorListener);
    }
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    // Check if it's an auth error
    const isAuthError = error instanceof ApiError && (error.status === 401 || error.status === 403);
    
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error, 
      errorInfo: null,
      isAuthError,
      errorDetails: isAuthError && error instanceof ApiError ? {
        status: error.status,
        message: error.message,
        timestamp: new Date().toISOString()
      } : null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error("Authentication error caught by boundary:", error, errorInfo);
    
    // Update error info
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    // Reset the error boundary state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isAuthError: false,
      errorDetails: null
    });
    
    // Refresh the page to ensure everything is reset
    window.location.reload();
  }

  handleLogin = () => {
    // Redirect to login page
    window.location.href = '/api/login';
  }

  render() {
    // If not an error or not an auth error, render children
    if (!this.state.hasError || !this.state.isAuthError) {
      return this.props.children;
    }

    // If there's a custom fallback, use that
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Default fallback UI for authentication errors
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <CardDescription>
              Your session has expired or you don't have permission to access this resource.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {this.state.errorDetails?.message || this.state.error?.message || "Please log in again to continue."}
            </p>
            {this.state.errorDetails && (
              <div className="p-2 text-xs bg-muted/50 rounded-sm text-muted-foreground">
                <p>Status: {this.state.errorDetails.status || 'Unknown'}</p>
                <p>Time: {new Date(this.state.errorDetails.timestamp || Date.now()).toLocaleTimeString()}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={this.handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button
              onClick={this.handleLogin}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
}

// Export the class directly
export { AuthErrorBoundary };