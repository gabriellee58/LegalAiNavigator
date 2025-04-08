import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { queryClient, setupQueryPersistence } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Setup query persistence for offline-first approach
setupQueryPersistence();

// Global error handler for uncaught exceptions
const originalConsoleError = console.error;
console.error = function(...args) {
  // Still log to console
  originalConsoleError.apply(console, args);
  
  // Send to a monitoring service or log server in production
  if (import.meta.env.PROD) {
    try {
      const errorMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      // Log client-side errors to server
      fetch('/api/log-client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: errorMessage,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }),
        // Don't wait for response
        keepalive: true
      }).catch(() => {
        // Silently fail - this is just telemetry
      });
    } catch (err) {
      // Ignore errors in error logging
    }
  }
};

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster />
  </QueryClientProvider>
);
