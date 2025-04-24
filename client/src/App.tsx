import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { getLanguage } from "./lib/i18n";
import { AuthProvider } from "@/hooks/use-auth";
import { SubscriptionProvider } from "@/hooks/use-subscription";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorBoundary } from "./components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { ErrorProvider } from "@/components/ui/error-handler";
import { PermissionsProvider } from "@/hooks/use-permissions";

// Import pages
import HomePage from "@/pages/home";
import LegalAssistantPage from "@/pages/legal-assistant";
import DocumentGeneratorPage from "@/pages/document-generator";
import LegalResearchPage from "@/pages/legal-research";
import ContractAnalysisPage from "@/pages/contract-analysis";
import DocumentNavigatorPage from "@/pages/document-navigator";
import TimelineEstimatorPage from "@/pages/timeline-estimator";
import CostEstimatorPage from "@/pages/cost-estimator";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import ProfilePage from "@/pages/profile";
import LogoutPage from "@/pages/logout";
import PasswordResetPage from "@/pages/password-reset";

// Import newly created pages
import DisputeResolutionPage from "./pages/dispute-resolution";
import DisputeDetailPage from "./pages/dispute-detail";
import ComplianceCheckerPage from "./pages/compliance-checker";
import DocumentTemplatesPage from "./pages/document-templates";
import HelpResourcesPage from "./pages/help-resources";
import SettingsPage from "./pages/settings";
import MorePage from "./pages/more";
import CourtProceduresPage from "./pages/court-procedures";
import CourtProceduresStaticPage from "./pages/court-procedures-static";
import CourtProcedureDetailPage from "./pages/court-procedure-detail";
import NotarizationGuidePage from "./pages/notarization-guide";
import SubscriptionPlansPage from "./pages/subscription-plans";
import SubscriptionSuccessPage from "./pages/subscription/success";

// Import legal domains browser
import LegalDomainsPage from "./pages/legal-domains";
import DomainPage from "./pages/legal-domains/domain-page";
import JurisdictionCompare from "./pages/jurisdiction-compare";

// Import feedback pages
import MyFeedbackPage from "./pages/my-feedback";
import AdminFeedbackPage from "./pages/admin/feedback";
import AdminDashboard from "./pages/admin/dashboard";

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
      <ProtectedRoute path="/contract-analysis" component={ContractAnalysisPage} requiresSubscription={true} />
      <ProtectedRoute path="/dispute-resolution" component={DisputeResolutionPage} requiresSubscription={true} />
      <ProtectedRoute path="/dispute/:id" component={DisputeDetailPage} requiresSubscription={true} />
      <ProtectedRoute path="/compliance-checker" component={ComplianceCheckerPage} requiresSubscription={true} />
      <Route path="/court-procedures" component={CourtProceduresStaticPage} />
      <Route path="/court-procedures/:id" component={CourtProcedureDetailPage} />
      <Route path="/court-procedures-old" component={CourtProceduresPage} />
      <ProtectedRoute path="/notarization-guide" component={NotarizationGuidePage} />
      <ProtectedRoute path="/document-navigator" component={DocumentNavigatorPage} requiresSubscription={true} />
      <ProtectedRoute path="/timeline-estimator" component={TimelineEstimatorPage} requiresSubscription={true} />
      <ProtectedRoute path="/cost-estimator" component={CostEstimatorPage} requiresSubscription={true} />
      <ProtectedRoute path="/subscription-plans" component={SubscriptionPlansPage} />
      <ProtectedRoute path="/subscription/success" component={SubscriptionSuccessPage} />
      <ProtectedRoute path="/jurisdiction-compare" component={JurisdictionCompare} requiresSubscription={true} />
      
      {/* Document Templates - Require subscription for specialized templates */}
      <ProtectedRoute path="/documents/all" component={DocumentTemplatesPage} />
      <ProtectedRoute path="/documents/contract" component={DocumentTemplatesPage} requiresSubscription={true} />
      <ProtectedRoute path="/documents/real-estate" component={DocumentTemplatesPage} requiresSubscription={true} />
      <ProtectedRoute path="/documents/family" component={DocumentTemplatesPage} requiresSubscription={true} />
      <ProtectedRoute path="/documents/employment" component={DocumentTemplatesPage} requiresSubscription={true} />
      <ProtectedRoute path="/documents/immigration" component={DocumentTemplatesPage} requiresSubscription={true} />
      <ProtectedRoute path="/documents/will" component={DocumentTemplatesPage} requiresSubscription={true} />
      <ProtectedRoute path="/documents/personal-injury" component={DocumentTemplatesPage} requiresSubscription={true} />
      
      {/* Legal Domains - Static paths first, dynamic path last */}
      <ProtectedRoute path="/legal-domains" component={LegalDomainsPage} />
      
      {/* Basic legal domains accessible to all authenticated users */}
      <ProtectedRoute path="/legal-domains/family-law" component={FamilyLawPage} />
      <ProtectedRoute path="/legal-domains/real-estate" component={RealEstateLawPage} />
      <ProtectedRoute path="/legal-domains/business" component={BusinessLawPage} />
      <ProtectedRoute path="/legal-domains/employment" component={EmploymentLawPage} />
      <ProtectedRoute path="/legal-domains/immigration" component={ImmigrationLawPage} />
      <ProtectedRoute path="/legal-domains/personal-injury" component={PersonalInjuryLawPage} />
      <ProtectedRoute path="/legal-domains/criminal" component={CriminalLawPage} />
      
      {/* Specialized legal domains requiring subscription */}
      <ProtectedRoute path="/legal-domains/estate-planning" component={EstatePlanningPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/consumer-rights" component={ConsumerRightsPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/civil-litigation" component={CivilLitigationPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/indigenous-law" component={IndigenousLawPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/environmental" component={EnvironmentalLawPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/intellectual-property" component={IntellectualPropertyPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/human-rights" component={HumanRightsPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/insurance" component={InsuranceLawPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/administrative" component={AdministrativeLawPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/tax" component={TaxLawPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/constitutional" component={ConstitutionalLawPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/entertainment" component={EntertainmentLawPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/technology" component={TechnologyLawPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/youth-justice" component={YouthJusticePage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/mediation" component={MediationPage} requiresSubscription={true} />
      <ProtectedRoute path="/legal-domains/land-claims" component={LandClaimsPage} requiresSubscription={true} />
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
      
      {/* Admin Pages */}
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/admin/feedback" component={AdminFeedbackPage} />
      
      <Route path="/auth" component={AuthPage} />
      <Route path="/password-reset" component={PasswordResetPage} />
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
      <SubscriptionProvider>
        <PermissionsProvider>
          <ErrorProvider>
            <ErrorBoundary>
              <Head />
              <div className="app-container" key={language}>
                <Router />
              </div>
              <Toaster />
            </ErrorBoundary>
          </ErrorProvider>
        </PermissionsProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
