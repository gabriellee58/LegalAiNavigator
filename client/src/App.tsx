import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { getLanguage } from "./lib/i18n";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Import pages
import HomePage from "@/pages/home";
import LegalAssistantPage from "@/pages/legal-assistant";
import DocumentGeneratorPage from "@/pages/document-generator";
import LegalResearchPage from "@/pages/legal-research";
import ContractAnalysisPage from "@/pages/contract-analysis";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

// Import newly created pages
import DisputeResolutionPage from "./pages/dispute-resolution";
import DisputeDetailPage from "./pages/dispute-detail";
import ComplianceCheckerPage from "./pages/compliance-checker";
import DocumentTemplatesPage from "./pages/document-templates";
import HelpResourcesPage from "./pages/help-resources";
import SettingsPage from "./pages/settings";

// Import legal domain pages
import FamilyLawPage from "./pages/legal-domains/family-law";
import RealEstateLawPage from "./pages/legal-domains/real-estate";
import BusinessLawPage from "./pages/legal-domains/business";
import EmploymentLawPage from "./pages/legal-domains/employment";
import ImmigrationLawPage from "./pages/legal-domains/immigration";
import PersonalInjuryLawPage from "./pages/legal-domains/personal-injury";

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
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/legal-assistant" component={LegalAssistantPage} />
      <ProtectedRoute path="/document-generator" component={DocumentGeneratorPage} />
      <ProtectedRoute path="/document-generator/:id" component={DocumentGeneratorPage} />
      <ProtectedRoute path="/legal-research" component={LegalResearchPage} />
      <ProtectedRoute path="/contract-analysis" component={ContractAnalysisPage} />
      <ProtectedRoute path="/dispute-resolution" component={DisputeResolutionPage} />
      <ProtectedRoute path="/dispute/:id" component={DisputeDetailPage} />
      <ProtectedRoute path="/compliance-checker" component={ComplianceCheckerPage} />
      
      {/* Document Templates */}
      <ProtectedRoute path="/documents/contracts" component={DocumentTemplatesPage} />
      <ProtectedRoute path="/documents/leases" component={DocumentTemplatesPage} />
      <ProtectedRoute path="/documents/wills-estates" component={DocumentTemplatesPage} />
      <ProtectedRoute path="/documents/business-formation" component={DocumentTemplatesPage} />
      <ProtectedRoute path="/documents/ip-management" component={DocumentTemplatesPage} />
      
      {/* Legal Domains */}
      <ProtectedRoute path="/legal-domains/family-law" component={FamilyLawPage} />
      <ProtectedRoute path="/legal-domains/real-estate" component={RealEstateLawPage} />
      <ProtectedRoute path="/legal-domains/business" component={BusinessLawPage} />
      <ProtectedRoute path="/legal-domains/employment" component={EmploymentLawPage} />
      <ProtectedRoute path="/legal-domains/immigration" component={ImmigrationLawPage} />
      <ProtectedRoute path="/legal-domains/personal-injury" component={PersonalInjuryLawPage} />
      
      {/* Help and Settings */}
      <ProtectedRoute path="/help" component={HelpResourcesPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      
      <Route path="/auth" component={AuthPage} />
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
      <AuthProvider>
        <Head />
        <div className="app-container" key={language}>
          <Router />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
