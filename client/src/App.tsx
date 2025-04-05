import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { getLanguage } from "./lib/i18n";

// Import pages
import HomePage from "@/pages/home";
import LegalAssistantPage from "@/pages/legal-assistant";
import DocumentGeneratorPage from "@/pages/document-generator";
import LegalResearchPage from "@/pages/legal-research";
import NotFound from "@/pages/not-found";

// Import style for Material Icons
function Head() {
  useEffect(() => {
    // Add Material Icons font
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Add Poppins and Roboto fonts
    const fontLink = document.createElement('link');
    fontLink.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    // Set title
    document.title = "LegalAI - AI-Powered Legal Assistant";

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontLink);
    };
  }, []);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/legal-assistant" component={LegalAssistantPage} />
      <Route path="/document-generator" component={DocumentGeneratorPage} />
      <Route path="/document-generator/:id" component={DocumentGeneratorPage} />
      <Route path="/legal-research" component={LegalResearchPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [language, setLanguage] = useState(getLanguage());

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(getLanguage());
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Head />
      <div className="app-container" key={language}>
        <Router />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
