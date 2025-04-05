import { Link, useRoute } from "wouter";
import { t } from "@/lib/i18n";

export function Sidebar() {
  const [isLegalAssistantRoute] = useRoute("/legal-assistant");
  const [isDocumentGeneratorRoute] = useRoute("/document-generator");
  const [isLegalResearchRoute] = useRoute("/legal-research");
  const [isDisputeResolutionRoute] = useRoute("/dispute-resolution");
  const [isComplianceCheckerRoute] = useRoute("/compliance-checker");
  
  const [isContractsRoute] = useRoute("/documents/contracts");
  const [isLeasesRoute] = useRoute("/documents/leases");
  const [isWillsEstatesRoute] = useRoute("/documents/wills-estates");
  const [isBusinessFormationRoute] = useRoute("/documents/business-formation");
  const [isIpManagementRoute] = useRoute("/documents/ip-management");
  
  return (
    <div className="hidden md:flex md:w-64 flex-col bg-white shadow-md z-10 h-screen fixed">
      <div className="p-4 flex items-center justify-between border-b border-neutral-200">
        <div className="flex items-center">
          <div className="bg-primary rounded-lg w-8 h-8 flex items-center justify-center mr-2">
            <span className="material-icons text-white text-lg">balance</span>
          </div>
          <h1 className="font-heading font-semibold text-xl text-primary">LegalAI</h1>
        </div>
        <LanguageSelector />
      </div>
      
      <nav className="overflow-y-auto py-4 flex-grow">
        <div className="px-4 mb-4">
          <p className="text-neutral-500 text-xs uppercase font-medium mb-2">{t("services")}</p>
          <ul>
            <li>
              <Link href="/legal-assistant">
                <a className={`flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1 ${isLegalAssistantRoute ? 'bg-blue-50 text-primary' : ''}`}>
                  <span className={`material-icons mr-3 ${isLegalAssistantRoute ? 'text-primary' : 'text-neutral-500'}`}>smart_toy</span>
                  <span>{t("legal_assistant")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/document-generator">
                <a className={`flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1 ${isDocumentGeneratorRoute ? 'bg-blue-50 text-primary' : ''}`}>
                  <span className={`material-icons mr-3 ${isDocumentGeneratorRoute ? 'text-primary' : 'text-neutral-500'}`}>description</span>
                  <span>{t("document_generator")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/legal-research">
                <a className={`flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1 ${isLegalResearchRoute ? 'bg-blue-50 text-primary' : ''}`}>
                  <span className={`material-icons mr-3 ${isLegalResearchRoute ? 'text-primary' : 'text-neutral-500'}`}>search</span>
                  <span>{t("legal_research")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/dispute-resolution">
                <a className={`flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1 ${isDisputeResolutionRoute ? 'bg-blue-50 text-primary' : ''}`}>
                  <span className={`material-icons mr-3 ${isDisputeResolutionRoute ? 'text-primary' : 'text-neutral-500'}`}>gavel</span>
                  <span>{t("dispute_resolution")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/compliance-checker">
                <a className={`flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1 ${isComplianceCheckerRoute ? 'bg-blue-50 text-primary' : ''}`}>
                  <span className={`material-icons mr-3 ${isComplianceCheckerRoute ? 'text-primary' : 'text-neutral-500'}`}>verified</span>
                  <span>{t("compliance_checker")}</span>
                </a>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="px-4 mb-4">
          <p className="text-neutral-500 text-xs uppercase font-medium mb-2">{t("document_templates")}</p>
          <ul>
            <li>
              <Link href="/documents/contracts">
                <a className={`flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1 ${isContractsRoute ? 'bg-blue-50 text-primary' : ''}`}>
                  <span className={`material-icons mr-3 ${isContractsRoute ? 'text-primary' : 'text-neutral-500'}`}>assignment</span>
                  <span>{t("contracts")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/leases">
                <a className={`flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1 ${isLeasesRoute ? 'bg-blue-50 text-primary' : ''}`}>
                  <span className={`material-icons mr-3 ${isLeasesRoute ? 'text-primary' : 'text-neutral-500'}`}>home</span>
                  <span>{t("leases")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/wills-estates">
                <a className={`flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1 ${isWillsEstatesRoute ? 'bg-blue-50 text-primary' : ''}`}>
                  <span className={`material-icons mr-3 ${isWillsEstatesRoute ? 'text-primary' : 'text-neutral-500'}`}>account_balance</span>
                  <span>{t("wills_estates")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/business-formation">
                <a className={`flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1 ${isBusinessFormationRoute ? 'bg-blue-50 text-primary' : ''}`}>
                  <span className={`material-icons mr-3 ${isBusinessFormationRoute ? 'text-primary' : 'text-neutral-500'}`}>business</span>
                  <span>{t("business_formation")}</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/documents/ip-management">
                <a className={`flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary mb-1 ${isIpManagementRoute ? 'bg-blue-50 text-primary' : ''}`}>
                  <span className={`material-icons mr-3 ${isIpManagementRoute ? 'text-primary' : 'text-neutral-500'}`}>copyright</span>
                  <span>{t("ip_management")}</span>
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="border-t border-neutral-200 p-4">
        <Link href="/help">
          <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary">
            <span className="material-icons mr-3 text-neutral-500">help_outline</span>
            <span>{t("help_resources")}</span>
          </a>
        </Link>
        <Link href="/settings">
          <a className="flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-blue-50 hover:text-primary">
            <span className="material-icons mr-3 text-neutral-500">settings</span>
            <span>{t("settings")}</span>
          </a>
        </Link>
      </div>
    </div>
  );
}

function LanguageSelector() {
  const { t, setLanguage, getLanguage } = require("@/lib/i18n");
  const currentLanguage = getLanguage();
  
  return (
    <div className="language-selector inline-flex rounded-md text-xs">
      <button 
        className={`px-2 py-1 ${currentLanguage === 'en' ? 'bg-primary text-white' : 'bg-white text-neutral-600 border border-neutral-300'} rounded-l-md`}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
      <button 
        className={`px-2 py-1 ${currentLanguage === 'fr' ? 'bg-primary text-white' : 'bg-white text-neutral-600 border border-neutral-300'} rounded-r-md`}
        onClick={() => setLanguage('fr')}
      >
        FR
      </button>
    </div>
  );
}

export default Sidebar;
