import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Link } from "wouter";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    
    // Update state to include the error info
    this.setState({ errorInfo });
    
    // Log to server in production
    if (import.meta.env.PROD) {
      try {
        fetch('/api/log-client-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.toString(),
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            timestamp: new Date().toISOString()
          }),
          keepalive: true
        }).catch(() => {
          // Silently fail - this is just telemetry
        });
      } catch (e) {
        // Ignore error in error handler
      }
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="w-full max-w-md p-6 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300">
              We're sorry, but there was an error loading this page. 
              Our team has been notified of the issue.
            </p>
            
            {this.state.error && (
              <div className="p-3 overflow-auto text-left text-sm bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-200 max-h-48">
                <strong>Error:</strong> {this.state.error.toString()}
              </div>
            )}
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-center">
              <Button onClick={this.handleReset} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button onClick={this.handleReload}>
                Reload Page
              </Button>
              
              <Link href="/">
                <Button variant="secondary">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}