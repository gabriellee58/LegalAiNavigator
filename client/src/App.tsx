import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { getLanguage } from "./lib/i18n";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorBoundary } from "./components/error-boundary";
import { Toaster } from "@/components/ui/toaster";

// Import pages
import HomePage from "@/pages/home";
import LegalAssistantPage from "@/pages/legal-assistant";
import DocumentGeneratorPage from "@/pages/document-generator";
import LegalResearchPage from "@/pages/legal-research";
import ContractAnalysisPage from "@/pages/contract-analysis";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import ProfilePage from "@/pages/profile";
import LogoutPage from "@/pages/logout";

// Import newly created pages
import DisputeResolutionPage from "./pages/dispute-resolution";
import DisputeDetailPage from "./pages/dispute-detail";
import ComplianceCheckerPage from "./pages/compliance-checker";
import DocumentTemplatesPage from "./pages/document-templates";
import HelpResourcesPage from "./pages/help-resources";
import SettingsPage from "./pages/settings";
import MorePage from "./pages/more";
import CourtProceduresPage from "./pages/court-procedures";

// Import legal domains browser
import LegalDomainsPage from "./pages/legal-domains";
import DomainPage from "./pages/legal-domains/domain-page";

// Import feedback pages
import MyFeedbackPage from "./pages/my-feedback";
import AdminFeedbackPage from "./pages/admin/feedback";

// Import legal domain pages
import FamilyLawPage from "./pages/legal-domains/family-law";
import RealEstateLawPage from "./pages/legal-domains/real-estate";
import BusinessLawPage from "./pages/legal-domains/business";
import EmploymentLawPage from "./pages/legal-domains/employment";
import ImmigrationLawPage from "./pages/legal-domains/immigration";
import PersonalInjuryLawPage from "./pages/legal-domains/personal-injury";
import EstatePlanningPage from "./pages/legal-domains/estate-planning";
import ConsumerRightsPage from "./pages/legal-domains/consumer-rights";
import CriminalLawPage from "./pages/legal-domains/criminal";
import CivilLitigationPage from "./pages/legal-domains/civil-litigation";
import IndigenousLawPage from "./pages/legal-domains/indigenous-law";
import EnvironmentalLawPage from "./pages/legal-domains/environmental";
import IntellectualPropertyPage from "./pages/legal-domains/intellectual-property";
import HumanRightsPage from "./pages/legal-domains/human-rights";
import InsuranceLawPage from "./pages/legal-domains/insurance";
import AdministrativeLawPage from "./pages/legal-domains/administrative";
import TaxLawPage from "./pages/legal-domains/tax";
import ConstitutionalLawPage from "./pages/legal-domains/constitutional";
import EntertainmentLawPage from "./pages/legal-domains/entertainment";
import TechnologyLawPage from "./pages/legal-domains/technology";
import YouthJusticePage from "./pages/legal-domains/youth-justice";
import MediationPage from "./pages/legal-domains/mediation";
import LandClaimsPage from "./pages/legal-domains/land-claims";

// Import guide pages
import {
  GettingStartedGuide,
  DocumentGenerationTutorial,
  ContractAnalysisGuide,
  LegalResearchGuide,
  ComplianceCheckerTutorial,
  CourtProceduresGuide
} from "./pages/guides";

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
      <ProtectedRoute path="/court-procedures" component={CourtProceduresPage} />
      
      {/* Document Templates */}
      <ProtectedRoute path="/documents/contracts" component={DocumentTemplatesPage} />
      <ProtectedRoute path="/documents/leases" component={DocumentTemplatesPage} />
      <ProtectedRoute path="/documents/wills-estates" component={DocumentTemplatesPage} />
      <ProtectedRoute path="/documents/business-formation" component={DocumentTemplatesPage} />
      <ProtectedRoute path="/documents/ip-management" component={DocumentTemplatesPage} />
      
      {/* Legal Domains - Static paths first, dynamic path last */}
      <ProtectedRoute path="/legal-domains" component={LegalDomainsPage} />
      <ProtectedRoute path="/legal-domains/family-law" component={FamilyLawPage} />
      <ProtectedRoute path="/legal-domains/real-estate" component={RealEstateLawPage} />
      <ProtectedRoute path="/legal-domains/business" component={BusinessLawPage} />
      <ProtectedRoute path="/legal-domains/employment" component={EmploymentLawPage} />
      <ProtectedRoute path="/legal-domains/immigration" component={ImmigrationLawPage} />
      <ProtectedRoute path="/legal-domains/personal-injury" component={PersonalInjuryLawPage} />
      <ProtectedRoute path="/legal-domains/estate-planning" component={EstatePlanningPage} />
      <ProtectedRoute path="/legal-domains/consumer-rights" component={ConsumerRightsPage} />
      <ProtectedRoute path="/legal-domains/criminal" component={CriminalLawPage} />
      <ProtectedRoute path="/legal-domains/civil-litigation" component={CivilLitigationPage} />
      <ProtectedRoute path="/legal-domains/indigenous-law" component={IndigenousLawPage} />
      <ProtectedRoute path="/legal-domains/environmental" component={EnvironmentalLawPage} />
      <ProtectedRoute path="/legal-domains/intellectual-property" component={IntellectualPropertyPage} />
      <ProtectedRoute path="/legal-domains/human-rights" component={HumanRightsPage} />
      <ProtectedRoute path="/legal-domains/insurance" component={InsuranceLawPage} />
      <ProtectedRoute path="/legal-domains/administrative" component={AdministrativeLawPage} />
      <ProtectedRoute path="/legal-domains/tax" component={TaxLawPage} />
      <ProtectedRoute path="/legal-domains/constitutional" component={ConstitutionalLawPage} />
      <ProtectedRoute path="/legal-domains/entertainment" component={EntertainmentLawPage} />
      <ProtectedRoute path="/legal-domains/technology" component={TechnologyLawPage} />
      <ProtectedRoute path="/legal-domains/youth-justice" component={YouthJusticePage} />
      <ProtectedRoute path="/legal-domains/mediation" component={MediationPage} />
      <ProtectedRoute path="/legal-domains/land-claims" component={LandClaimsPage} />
      <ProtectedRoute path="/legal-domains/:id" component={DomainPage} />
      
      {/* Help and Settings */}
      <ProtectedRoute path="/help-resources" component={HelpResourcesPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/more" component={MorePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/logout" component={LogoutPage} />
      
      {/* Guide Pages */}
      <ProtectedRoute path="/guides/getting-started" component={GettingStartedGuide} />
      <ProtectedRoute path="/guides/document-generation" component={DocumentGenerationTutorial} />
      <ProtectedRoute path="/guides/contract-analysis" component={ContractAnalysisGuide} />
      <ProtectedRoute path="/guides/legal-research" component={LegalResearchGuide} />
      <ProtectedRoute path="/guides/compliance-checker" component={ComplianceCheckerTutorial} />
      <ProtectedRoute path="/guides/court-procedures" component={CourtProceduresGuide} />
      
      {/* Feedback Pages */}
      <ProtectedRoute path="/my-feedback" component={MyFeedbackPage} />
      <ProtectedRoute path="/admin/feedback" component={AdminFeedbackPage} />
      
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
    <AuthProvider>
      <ErrorBoundary>
        <Head />
        <div className="app-container" key={language}>
          <Router />
        </div>
        <Toaster />
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
